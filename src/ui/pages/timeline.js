// Timeline — a chronological story of the journey, grouped by day.

import { h } from "../../core/dom.js";
import store from "../../services/store.js";
import { card, breadcrumb, emptyState } from "../components/ui.js";
import { icon } from "../icons.js";
import { navigate } from "../../core/router.js";
import { formatDateHuman, relativeDay } from "../../core/dates.js";

const TYPE = {
  solved: { iconName: "check", cls: "ev-solved", verb: "Solved" },
  reviewed: { iconName: "review", cls: "ev-reviewed", verb: "Reviewed" },
  studied: { iconName: "play", cls: "ev-studied", verb: "Started" },
  completed_concept: { iconName: "award", cls: "ev-completed", verb: "Completed" },
  journal: { iconName: "journal", cls: "ev-journal", verb: "Journal" },
  goal: { iconName: "goals", cls: "ev-goal", verb: "Goal" },
};

export function render() {
  const page = h("div", { class: "page timeline-page" });
  page.appendChild(breadcrumb([{ label: "Home", href: "#/" }, { label: "Timeline" }]));
  page.appendChild(h("div", { class: "page-head" },
    h("div", {}, h("h1", { class: "page-title" }, "Timeline"), h("p", { class: "page-sub" }, "Every study session, in order"))));

  const events = store.activity();
  if (!events.length) {
    page.appendChild(emptyState({ iconName: "timeline", title: "Your story starts here", message: "Solve a problem or study a concept to create your first event." }));
    return page;
  }

  // Group by date
  const groups = new Map();
  for (const e of events) {
    if (!groups.has(e.date)) groups.set(e.date, []);
    groups.get(e.date).push(e);
  }

  const wrap = h("div", { class: "timeline" });
  for (const [date, evs] of groups) {
    wrap.appendChild(h("div", { class: "timeline-day" },
      h("div", { class: "timeline-date" }, h("span", { class: "timeline-date-main" }, formatDateHuman(date)), h("span", { class: "timeline-date-rel" }, relativeDay(date))),
      h("div", { class: "timeline-events" },
        ...evs.map((e) => {
          const t = TYPE[e.type] || TYPE.studied;
          const clickable = e.type === "solved" || e.type === "reviewed";
          return h("div", {
            class: `timeline-event ${t.cls} ${clickable ? "is-clickable" : ""}`,
            onClick: clickable && e.ref_id ? () => navigate(`/problem/${e.ref_id}`) : undefined,
          },
            h("span", { class: "timeline-dot" }, icon(t.iconName, { size: 14 })),
            h("div", { class: "timeline-event-body" },
              h("span", { class: "timeline-event-title" }, e.title),
              e.detail ? h("span", { class: "timeline-event-detail" }, e.detail) : null
            )
          );
        })
      )
    ));
  }
  page.appendChild(wrap);
  return page;
}
