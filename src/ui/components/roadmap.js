// Horizontal roadmap strip. Each concept is a node: green=completed, blue=current,
// gray=locked. Clicking opens the concept page. Used on the dashboard and roadmap view.

import { h } from "../../core/dom.js";
import { icon } from "../icons.js";
import { CONCEPT_STATUS } from "../../core/config.js";

function node(concept, index) {
  const status = concept.status || CONCEPT_STATUS.LOCKED;
  const inner =
    status === CONCEPT_STATUS.COMPLETED
      ? icon("check", { size: 16, stroke: 3 })
      : h("span", { class: "rm-node-num" }, String(index + 1));

  return h(
    "a",
    { class: `rm-node rm-node--${status}`, href: `#/concept/${concept.id}`, title: `${concept.name} · ${status}` },
    h("span", { class: "rm-node-dot" }, inner),
    h("span", { class: "rm-node-label" }, concept.name)
  );
}

export function roadmapStrip(concepts, { showProgress = true } = {}) {
  const done = concepts.filter((c) => c.status === CONCEPT_STATUS.COMPLETED).length;
  const wrap = h("div", { class: "roadmap-strip" });

  const track = h("div", { class: "rm-track" });
  concepts.forEach((c, i) => {
    if (i > 0) track.appendChild(h("span", { class: `rm-link ${concepts[i - 1].status === CONCEPT_STATUS.COMPLETED ? "is-done" : ""}` }));
    track.appendChild(node(c, i));
  });

  if (showProgress) {
    wrap.appendChild(
      h("div", { class: "rm-progress-row" },
        h("span", { class: "rm-progress-label" }, `${done} of ${concepts.length} concepts complete`),
        h("div", { class: "rm-progress-bar" },
          h("div", { class: "rm-progress-fill", style: { width: `${(done / concepts.length) * 100}%` } })
        )
      )
    );
  }
  wrap.appendChild(h("div", { class: "rm-scroll" }, track));
  return wrap;
}

/** Full grid layout for the dedicated roadmap page (wraps into rows). */
export function roadmapGrid(concepts) {
  return h(
    "div",
    { class: "roadmap-grid" },
    ...concepts.map((c, i) =>
      h("a", { class: `rm-card rm-card--${c.status}`, href: `#/concept/${c.id}` },
        h("div", { class: "rm-card-top" },
          h("span", { class: `rm-node-dot rm-node--${c.status}` },
            c.status === CONCEPT_STATUS.COMPLETED ? icon("check", { size: 15, stroke: 3 }) : h("span", { class: "rm-node-num" }, String(i + 1))
          ),
          h("span", { class: `rm-status-tag rm-status-tag--${c.status}` }, c.status)
        ),
        h("div", { class: "rm-card-name" }, c.name),
        h("div", { class: "rm-card-meta" },
          h("div", { class: "rm-card-bar" }, h("div", { class: "rm-card-bar-fill", style: { width: `${c.confidence || 0}%` } })),
          h("span", { class: "rm-card-conf" }, `${c.confidence || 0}%`)
        )
      )
    )
  );
}
