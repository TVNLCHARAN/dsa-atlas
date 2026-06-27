// Calendar — GitHub-style contribution heatmap. Click any day to see what happened.

import { h, clear } from "../../core/dom.js";
import store from "../../services/store.js";
import { card, sectionHeader, breadcrumb, emptyState, difficultyBadge, badge } from "../components/ui.js";
import { icon } from "../icons.js";
import { heatmapCalendar, chartEl } from "../components/charts.js";
import { navigate } from "../../core/router.js";
import { conceptName } from "../../data/roadmap.js";
import { formatDateHuman, formatDuration, today } from "../../core/dates.js";

export function render({ query = {} } = {}) {
  const a = store.analytics();
  let selected = query.date || today();

  const page = h("div", { class: "page calendar-page" });
  page.appendChild(breadcrumb([{ label: "Home", href: "#/" }, { label: "Calendar" }]));
  page.appendChild(h("div", { class: "page-head" },
    h("div", {}, h("h1", { class: "page-title" }, "Calendar"),
      h("p", { class: "page-sub" }, `${a.streaks.activeDays} active days · ${a.totals.problemsSolved} problems`))));

  const heatCard = card({ className: "heatmap-card" });
  heatCard.appendChild(sectionHeader("Contributions", { iconName: "calendar", sub: "Last 53 weeks" }));
  const heatWrap = chartEl(heatmapCalendar(a.heatmap), "heatmap-scroll");
  heatWrap.addEventListener("click", (e) => {
    const cell = e.target.closest("[data-date]");
    if (cell) { selected = cell.dataset.date; renderDay(); markSelected(); }
  });
  heatCard.appendChild(heatWrap);
  heatCard.appendChild(h("div", { class: "hm-legend" }, h("span", {}, "Less"),
    ...[0, 1, 2, 3, 4].map((l) => h("span", { class: `hm-cell-legend hm-${l}` })), h("span", {}, "More")));
  page.appendChild(heatCard);

  const dayCard = card({ className: "day-detail-card" });
  page.appendChild(dayCard);

  function markSelected() {
    heatWrap.querySelectorAll("[data-date]").forEach((el) => el.classList.toggle("is-selected", el.dataset.date === selected));
  }

  function renderDay() {
    clear(dayCard);
    dayCard.appendChild(sectionHeader(formatDateHuman(selected), { iconName: "clock" }));
    const problems = store.problems().filter((p) => p.solved_date === selected);
    const activity = store.activityForDate(selected);
    const journal = store.journal(selected);

    if (!problems.length && !activity.length && !journal) {
      dayCard.appendChild(emptyState({ iconName: "calendar", title: "Nothing logged", message: "No activity recorded for this day." }));
      return;
    }

    const totalTime = problems.reduce((s, p) => s + (p.time_taken_seconds || 0), 0) + (journal?.time_invested_minutes || 0) * 60;
    dayCard.appendChild(h("div", { class: "day-stats" },
      stat(problems.length, "problems"),
      stat(formatDuration(totalTime), "time"),
      stat(new Set(problems.map((p) => p.concept_id).filter(Boolean)).size, "concepts")
    ));

    if (problems.length) {
      dayCard.appendChild(h("div", { class: "list" },
        ...problems.map((p) =>
          h("div", { class: "list-row is-clickable", onClick: () => navigate(`/problem/${p.id}`) },
            h("div", { class: "list-row-main" },
              h("span", { class: "list-row-title" }, p.title),
              h("span", { class: "list-row-sub" }, `${conceptName(p.concept_id)} · ${formatDuration(p.time_taken_seconds)}`)
            ),
            difficultyBadge(p.difficulty)
          ))
      ));
    }
    if (journal) {
      const j = journal;
      dayCard.appendChild(h("div", { class: "day-journal" },
        sectionHeader("Journal", { iconName: "journal" }),
        j.biggest_learning ? h("p", {}, h("strong", {}, "Learned: "), j.biggest_learning) : null,
        j.biggest_mistake ? h("p", {}, h("strong", {}, "Mistake: "), j.biggest_mistake) : null,
        j.notes ? h("p", { class: "prose" }, j.notes) : null,
        h("a", { class: "link", href: `#/journal?date=${selected}` }, "Open in journal →")
      ));
    }
  }

  renderDay();
  setTimeout(markSelected, 30);
  return page;
}

function stat(value, label) {
  return h("div", { class: "mini-stat" }, h("span", { class: "mini-stat-val" }, String(value)), h("span", { class: "mini-stat-label" }, label));
}
