// Daily journal — one reflective entry per day, auto-linked to that day's solved problems.

import { h, clear, debounce } from "../../core/dom.js";
import store from "../../services/store.js";
import { card, sectionHeader, button, breadcrumb, fieldRow, difficultyBadge } from "../components/ui.js";
import { icon } from "../icons.js";
import { toast } from "../components/toast.js";
import { navigate } from "../../core/router.js";
import { ROADMAP, conceptName } from "../../data/roadmap.js";
import { today, formatDateHuman, formatDateShort } from "../../core/dates.js";

export function render({ query = {} } = {}) {
  let date = query.date || today();
  const page = h("div", { class: "page journal-page" });
  page.appendChild(breadcrumb([{ label: "Home", href: "#/" }, { label: "Journal" }]));

  const dateInput = h("input", { type: "date", class: "input", value: date, max: today(), onchange: (e) => { date = e.target.value; renderEntry(); } });
  page.appendChild(h("div", { class: "page-head" },
    h("div", {}, h("h1", { class: "page-title" }, "Daily journal"), h("p", { class: "page-sub" }, "Reflect while it's fresh — tomorrow-you reviews this")),
    h("div", { class: "page-head-actions" }, h("span", { class: "field-label" }, "Date"), dateInput)
  ));

  const entryWrap = h("div", {});
  page.appendChild(entryWrap);

  function renderEntry() {
    clear(entryWrap);
    const j = store.journal(date) || {};
    const dayProblems = store.problems().filter((p) => p.solved_date === date);
    const current = store.currentConcept();

    const f = {};
    f.concept_id = h("select", { class: "input select" },
      [{ v: "", l: "— none —" }, ...ROADMAP.map((c) => ({ v: c.id, l: c.name }))].map((o) =>
        h("option", { value: o.v, selected: o.v === (j.concept_id || current?.id || "") }, o.l)));
    f.time = h("input", { class: "input", type: "number", min: "0", placeholder: "minutes", value: j.time_invested_minutes || "" });
    f.confidence = h("input", { class: "conf-slider", type: "range", min: "1", max: "10", value: String(j.confidence || 6) });
    const confOut = h("span", { class: "conf-label" }, `${j.confidence || 6}/10`);
    f.confidence.addEventListener("input", (e) => (confOut.textContent = `${e.target.value}/10`));
    f.learning = h("textarea", { class: "input textarea", rows: 2, placeholder: "Biggest thing you learned today…" }); f.learning.value = j.biggest_learning || "";
    f.mistake = h("textarea", { class: "input textarea", rows: 2, placeholder: "Biggest mistake or sticking point…" }); f.mistake.value = j.biggest_mistake || "";
    f.revise = h("textarea", { class: "input textarea", rows: 2, placeholder: "What should you revise tomorrow?" }); f.revise.value = j.revise_tomorrow || "";
    f.notes = h("textarea", { class: "input textarea", rows: 5, placeholder: "Free-form notes…" }); f.notes.value = j.notes || "";

    const save = () => {
      store.saveJournal(date, {
        concept_id: f.concept_id.value || null,
        time_invested_minutes: Number(f.time.value) || 0,
        confidence: Number(f.confidence.value),
        biggest_learning: f.learning.value,
        biggest_mistake: f.mistake.value,
        revise_tomorrow: f.revise.value,
        notes: f.notes.value,
      });
      toast("Journal saved", "success");
    };
    const autosave = debounce(save, 800);
    [f.learning, f.mistake, f.revise, f.notes].forEach((el) => el.addEventListener("input", autosave));
    [f.concept_id, f.time, f.confidence].forEach((el) => el.addEventListener("change", autosave));

    // Today's solved problems (auto-derived)
    const problemsBlock = dayProblems.length
      ? h("div", { class: "journal-problems" },
          ...dayProblems.map((p) => h("div", { class: "list-row is-clickable", onClick: () => navigate(`/problem/${p.id}`) },
            h("div", { class: "list-row-main" }, h("span", { class: "list-row-title" }, p.title), h("span", { class: "list-row-sub" }, conceptName(p.concept_id))),
            difficultyBadge(p.difficulty))))
      : h("p", { class: "muted" }, "No problems logged this day yet.");

    entryWrap.appendChild(h("div", { class: "journal-grid" },
      card({ className: "journal-main" },
        sectionHeader(formatDateHuman(date), { iconName: "journal" }),
        h("div", { class: "form-grid" },
          fieldRow("Today's concept", f.concept_id),
          fieldRow("Time invested (min)", f.time),
          fieldRow("Confidence today", h("div", { class: "conf-control" }, f.confidence, confOut))
        ),
        fieldRow("Biggest learning", f.learning, { full: true }),
        fieldRow("Biggest mistake", f.mistake, { full: true }),
        fieldRow("Revise tomorrow", f.revise, { full: true }),
        fieldRow("Notes", f.notes, { full: true }),
        h("div", { class: "form-actions" }, button("Save entry", { variant: "primary", iconName: "check", onClick: save }))
      ),
      card({ className: "journal-side" },
        sectionHeader("Solved this day", { iconName: "check" }),
        problemsBlock
      )
    ));
  }

  renderEntry();

  // Past entries
  const past = store.journalAll().filter((j) => j.date !== date);
  if (past.length) {
    const list = card({ className: "journal-history" });
    list.appendChild(sectionHeader("Past entries", { iconName: "clock" }));
    list.appendChild(h("div", { class: "list" },
      ...past.slice(0, 30).map((j) => h("div", { class: "list-row is-clickable", onClick: () => { date = j.date; dateInput.value = j.date; renderEntry(); window.scrollTo({ top: 0, behavior: "smooth" }); } },
        h("div", { class: "list-row-main" },
          h("span", { class: "list-row-title" }, formatDateShort(j.date)),
          h("span", { class: "list-row-sub" }, j.biggest_learning || j.notes || conceptName(j.concept_id) || "—")),
        h("span", { class: "conf-pill" }, `${j.confidence || "?"}/10`)))));
    page.appendChild(list);
  }

  return page;
}
