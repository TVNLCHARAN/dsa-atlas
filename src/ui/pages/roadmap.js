// Roadmap page — the full ordered learning path as a responsive grid of concept cards.

import { h } from "../../core/dom.js";
import store from "../../services/store.js";
import { card, statCard, breadcrumb } from "../components/ui.js";
import { roadmapGrid } from "../components/roadmap.js";
import { CONCEPT_STATUS } from "../../core/config.js";

export function render() {
  const concepts = store.concepts();
  const done = concepts.filter((c) => c.status === CONCEPT_STATUS.COMPLETED).length;
  const current = concepts.find((c) => c.status === CONCEPT_STATUS.CURRENT);

  const page = h("div", { class: "page roadmap-page" });
  page.appendChild(breadcrumb([{ label: "Home", href: "#/" }, { label: "Roadmap" }]));
  page.appendChild(
    h("div", { class: "page-head" },
      h("div", {},
        h("h1", { class: "page-title" }, "DSA Roadmap"),
        h("p", { class: "page-sub" }, `${concepts.length} concepts in linear order · ${done} complete`)
      )
    )
  );

  page.appendChild(
    h("div", { class: "stat-row" },
      statCard({ label: "Completed", value: done, iconName: "check", accent: true }),
      statCard({ label: "In progress", value: current ? 1 : 0, sub: current ? current.name : "—", iconName: "play" }),
      statCard({ label: "Remaining", value: concepts.length - done, iconName: "layers" }),
      statCard({ label: "Overall", value: `${Math.round((done / concepts.length) * 100)}%`, iconName: "trendingUp" })
    )
  );

  page.appendChild(roadmapGrid(concepts));
  return page;
}
