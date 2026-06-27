// Goals — set targets (problem counts, concept completion, streaks) and track progress.

import { h } from "../../core/dom.js";
import store from "../../services/store.js";
import { card, sectionHeader, button, breadcrumb, emptyState, progressBar, badge } from "../components/ui.js";
import { icon } from "../icons.js";
import { openModal, confirmModal } from "../components/modal.js";
import { toast } from "../components/toast.js";
import { GOAL_TYPES } from "../../core/config.js";
import { ROADMAP } from "../../data/roadmap.js";
import { formatDateShort } from "../../core/dates.js";

const PRESETS = [
  { title: "Solve 100 problems", type: "problems_count", target: 100 },
  { title: "Solve 300 problems", type: "problems_count", target: 300 },
  { title: "Complete NeetCode 250", type: "problems_count", target: 250 },
  { title: "Maintain a 100-day streak", type: "streak", target: 100 },
  { title: "Finish all 37 concepts", type: "concepts_count", target: 37 },
];

export function render() {
  const page = h("div", { class: "page goals-page" });
  page.appendChild(breadcrumb([{ label: "Home", href: "#/" }, { label: "Goals" }]));
  page.appendChild(h("div", { class: "page-head" },
    h("div", {}, h("h1", { class: "page-title" }, "Goals"), h("p", { class: "page-sub" }, "Targets that keep the streak alive")),
    button("New goal", { variant: "primary", iconName: "add", onClick: () => openGoalModal() })
  ));

  const goals = store.goalsWithProgress();
  const active = goals.filter((g) => !g.archived);

  if (!active.length) {
    page.appendChild(card({}, emptyState({ iconName: "goals", title: "No goals yet", message: "Pick a quick preset or create your own." })));
    page.appendChild(card({ className: "preset-card" },
      sectionHeader("Quick presets", { iconName: "sparkles" }),
      h("div", { class: "preset-grid" },
        ...PRESETS.map((p) => button(p.title, { variant: "ghost", iconName: "target", onClick: () => { store.addGoal(p); toast("Goal added", "success"); rerender(page); } })))
    ));
    return page;
  }

  page.appendChild(h("div", { class: "goals-grid" },
    ...active.map((g) =>
      card({ className: `goal-card ${g.done ? "is-done" : ""}` },
        h("div", { class: "goal-card-head" },
          h("span", { class: "goal-icon" }, icon(g.done ? "award" : "target", { size: 18 })),
          g.done ? badge("Completed", "success") : badge(`${Math.round(g.pct)}%`, "info"),
          h("button", { class: "icon-btn icon-btn--ghost goal-del", title: "Delete", onClick: () => confirmModal({ title: "Delete goal?", message: g.title, danger: true, confirmLabel: "Delete", onConfirm: () => { store.deleteGoal(g.id); rerender(page); } }) }, icon("trash", { size: 16 }))
        ),
        h("h3", { class: "goal-title" }, g.title),
        h("div", { class: "goal-count" }, h("span", { class: "goal-current" }, g.current), h("span", { class: "goal-target" }, ` / ${g.target}`)),
        progressBar(g.pct, { color: g.done ? "#34d399" : "var(--accent)" }),
        g.completed_at ? h("p", { class: "muted goal-done-date" }, `Completed ${formatDateShort(g.completed_at)}`) : null
      )
    )
  ));
  return page;
}

function openGoalModal() {
  const titleIn = h("input", { class: "input", placeholder: "Goal title" });
  const typeSel = h("select", { class: "input select" }, ...GOAL_TYPES.map((t) => h("option", { value: t.id }, t.label)));
  const targetIn = h("input", { class: "input", type: "number", min: "1", placeholder: "Target", value: "100" });
  const conceptSel = h("select", { class: "input select" }, ...ROADMAP.map((c) => h("option", { value: c.id }, c.name)));
  const targetField = h("label", { class: "field" }, h("span", { class: "field-label" }, "Target"), targetIn);
  const conceptField = h("label", { class: "field", style: { display: "none" } }, h("span", { class: "field-label" }, "Concept"), conceptSel);

  const sync = () => {
    const t = GOAL_TYPES.find((x) => x.id === typeSel.value);
    targetField.style.display = t.needsConcept ? "none" : "block";
    conceptField.style.display = t.needsConcept ? "block" : "none";
    if (!titleIn.value) titleIn.placeholder = t.label;
  };
  typeSel.addEventListener("change", sync);
  sync();

  const handle = openModal({
    title: "New goal",
    content: h("div", { class: "form-grid-single" },
      h("label", { class: "field" }, h("span", { class: "field-label" }, "Title"), titleIn),
      h("label", { class: "field" }, h("span", { class: "field-label" }, "Type"), typeSel),
      targetField, conceptField
    ),
    actions: [
      h("button", { class: "btn btn--ghost", onClick: () => handle.close() }, "Cancel"),
      h("button", { class: "btn btn--primary", onClick: () => {
        const t = GOAL_TYPES.find((x) => x.id === typeSel.value);
        const title = titleIn.value.trim() || t.label;
        store.addGoal({
          title, type: typeSel.value,
          target: t.needsConcept ? 1 : Number(targetIn.value) || 1,
          concept_id: t.needsConcept ? conceptSel.value : null,
        });
        toast("Goal created", "success");
        handle.close();
        rerender(document.querySelector(".goals-page"));
      } }, "Create goal"),
    ],
  });
}

function rerender(page) {
  if (page) page.replaceWith(render());
}
