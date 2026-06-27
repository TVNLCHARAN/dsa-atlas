// Settings — appearance, study/review config, roadmap order, and full data backup/restore.

import { h, clear } from "../../core/dom.js";
import store from "../../services/store.js";
import { card, sectionHeader, button, breadcrumb, fieldRow } from "../components/ui.js";
import { icon } from "../icons.js";
import { toast } from "../components/toast.js";
import { confirmModal } from "../components/modal.js";
import { navigate, resolve } from "../../core/router.js";
import { ACCENTS, LANGUAGES, LANGUAGE_LABEL, APP_NAME, APP_VERSION } from "../../core/config.js";
import { exportJSON, exportCSV, exportMarkdown, exportDb, exportPDF } from "../../services/export.js";

export function render() {
  const s = store.settings();
  const page = h("div", { class: "page settings-page" });
  page.appendChild(breadcrumb([{ label: "Home", href: "#/" }, { label: "Settings" }]));
  page.appendChild(h("div", { class: "page-head" },
    h("div", {}, h("h1", { class: "page-title" }, "Settings"), h("p", { class: "page-sub" }, "Tune the app to your workflow"))));

  // ---- Appearance ----
  const themeSeg = h("div", { class: "segmented" },
    segBtn("Dark", s.theme === "dark", () => store.setSetting("theme", "dark"), "moon"),
    segBtn("Light", s.theme === "light", () => store.setSetting("theme", "light"), "sun")
  );
  const accentRow = h("div", { class: "accent-row" },
    ...ACCENTS.map((a) => {
      const b = h("button", { class: `accent-swatch ${s.accent === a.id ? "is-active" : ""}`, style: { background: a.value }, title: a.label, onClick: () => { store.setSetting("accent", a.id); accentRow.querySelectorAll(".accent-swatch").forEach((x) => x.classList.remove("is-active")); b.classList.add("is-active"); } });
      return b;
    })
  );
  page.appendChild(card({},
    sectionHeader("Appearance", { iconName: "sparkles" }),
    fieldRow("Theme", themeSeg),
    fieldRow("Accent color", accentRow)
  ));

  // ---- Study & review ----
  const langSel = h("select", { class: "input select", onchange: (e) => store.setSetting("defaultLanguage", e.target.value) },
    ...LANGUAGES.map((l) => h("option", { value: l, selected: l === s.defaultLanguage }, LANGUAGE_LABEL[l])));
  const hideToggle = toggle(s.hideSolutionOnReview, (v) => store.setSetting("hideSolutionOnReview", v));
  const dailyGoal = h("input", { class: "input", type: "number", min: "1", value: String(s.dailyGoalProblems || 2), style: { maxWidth: "100px" }, onchange: (e) => store.setSetting("dailyGoalProblems", Number(e.target.value) || 1) });
  const intervalsIn = h("input", { class: "input", value: (s.reviewIntervals || []).join(", "), style: { maxWidth: "240px" } });
  const saveIntervals = () => {
    const arr = intervalsIn.value.split(",").map((x) => parseInt(x.trim(), 10)).filter((n) => Number.isFinite(n) && n > 0).sort((a, b) => a - b);
    if (arr.length) { store.setSetting("reviewIntervals", arr); intervalsIn.value = arr.join(", "); toast("Review intervals saved", "success"); }
    else toast("Enter at least one positive number", "error");
  };
  page.appendChild(card({},
    sectionHeader("Study & review", { iconName: "review" }),
    fieldRow("Default language", langSel),
    fieldRow("Hide solution during review", hideToggle, { hint: "Forces active recall before revealing" }),
    fieldRow("Daily problem goal", dailyGoal),
    fieldRow("Review intervals (days)", h("div", { class: "inline-control" }, intervalsIn, button("Save", { variant: "ghost", size: "sm", onClick: saveIntervals })), { hint: "Spaced-repetition schedule, e.g. 1, 3, 7, 21, 60" })
  ));

  // ---- Roadmap order ----
  const orderCard = card({});
  orderCard.appendChild(sectionHeader("Roadmap order", { iconName: "roadmap", sub: "Reorder how concepts appear" }));
  const orderList = h("div", { class: "order-list" });
  function renderOrder() {
    clear(orderList);
    const concepts = store.concepts();
    concepts.forEach((c, i) => {
      orderList.appendChild(h("div", { class: "order-row" },
        h("span", { class: "order-num" }, String(i + 1)),
        h("span", { class: "order-name" }, c.name),
        h("span", { class: `status-dot status-dot--${c.status}` }),
        h("div", { class: "order-arrows" },
          h("button", { class: "icon-btn icon-btn--ghost", disabled: i === 0, title: "Move up", onClick: () => { store.moveConcept(c.id, -1); renderOrder(); } }, icon("chevronLeft", { size: 14 })),
          h("button", { class: "icon-btn icon-btn--ghost", disabled: i === concepts.length - 1, title: "Move down", onClick: () => { store.moveConcept(c.id, 1); renderOrder(); } }, icon("chevronRight", { size: 14 }))
        )
      ));
    });
  }
  renderOrder();
  orderCard.appendChild(orderList);
  page.appendChild(orderCard);

  // ---- Data & backup ----
  page.appendChild(card({},
    sectionHeader("Data & backup", { iconName: "layers", sub: "Everything is stored locally in SQLite" }),
    h("div", { class: "export-grid" },
      button("Backup .db", { variant: "primary", iconName: "download", onClick: () => { exportDb(); toast("SQLite backup downloaded", "success"); } }),
      button("Export JSON", { variant: "default", iconName: "download", onClick: () => exportJSON() }),
      button("Export CSV", { variant: "default", iconName: "download", onClick: () => exportCSV() }),
      button("Export Markdown", { variant: "default", iconName: "download", onClick: () => exportMarkdown() }),
      button("Export PDF", { variant: "default", iconName: "download", onClick: () => exportPDF() })
    ),
    h("div", { class: "import-row" },
      importButton(".db,.sqlite", "Restore .db", async (file) => {
        const buf = new Uint8Array(await file.arrayBuffer());
        await store.importDbBytes(buf);
        toast("Database restored", "success");
        navigate("/"); resolve();
      }),
      importButton(".json", "Import JSON", async (file) => {
        try {
          const data = JSON.parse(await file.text());
          await store.importBackup(data);
          toast("Backup imported", "success");
          navigate("/"); resolve();
        } catch (e) { toast("Invalid backup file", "error"); }
      })
    ),
    h("p", { class: "muted storage-note" }, icon("alert", { size: 14 }), " Data lives in your browser's local storage for this app (IndexedDB) and is saved as a real SQLite database. Download a .db backup regularly — clearing browser data will erase it.")
  ));

  page.appendChild(card({ className: "about-card" },
    sectionHeader("About", { iconName: "brain" }),
    h("p", { class: "muted" }, `${APP_NAME} v${APP_VERSION} — a local-first DSA second brain. Vanilla JS · SQLite (sql.js) · no telemetry, no network.`)
  ));

  return page;
}

function segBtn(label, active, onClick, iconName) {
  return h("button", { class: `seg ${active ? "is-active" : ""}`, onClick }, icon(iconName, { size: 15 }), h("span", {}, label));
}
function toggle(initial, onChange) {
  let v = initial;
  const t = h("button", { class: `switch ${v ? "is-on" : ""}`, role: "switch", onClick: () => { v = !v; t.classList.toggle("is-on", v); onChange(v); } }, h("span", { class: "switch-knob" }));
  return t;
}
function importButton(accept, label, handler) {
  const input = h("input", { type: "file", accept, style: { display: "none" }, onchange: (e) => { if (e.target.files[0]) handler(e.target.files[0]); e.target.value = ""; } });
  const btn = button(label, { variant: "ghost", iconName: "upload", onClick: () => input.click() });
  return h("span", {}, btn, input);
}
