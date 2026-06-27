// Dashboard — the daily overview. Streak, heatmap, totals, current concept, reviews due,
// recent problems, pattern confidence, weekly/monthly progress, goals.

import { h } from "../../core/dom.js";
import store from "../../services/store.js";
import { card, sectionHeader, statCard, difficultyBadge, button, emptyState, progressBar } from "../components/ui.js";
import { icon } from "../icons.js";
import { roadmapStrip } from "../components/roadmap.js";
import { ring, bars, donut, heatmapCalendar, chartEl, legend } from "../components/charts.js";
import { navigate } from "../../core/router.js";
import { conceptName } from "../../data/roadmap.js";
import { formatDuration, formatDateShort, relativeDay, today } from "../../core/dates.js";

const DIFF_COLORS = { Easy: "#34d399", Medium: "#fbbf24", Hard: "#fb7185" };

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function dueList(due) {
  if (!due.length) {
    return emptyState({ iconName: "check", title: "All caught up", message: "No reviews due today. Nice and clean." });
  }
  return h("div", { class: "list" },
    ...due.slice(0, 6).map((p) =>
      h("div", { class: "list-row is-clickable", onClick: () => navigate(`/problem/${p.id}`) },
        h("div", { class: "list-row-main" },
          h("span", { class: "list-row-title" }, p.title),
          h("span", { class: "list-row-sub" }, `${conceptName(p.concept_id)} · ${relativeDay(p.next_review_date)}`)
        ),
        difficultyBadge(p.difficulty)
      )
    ),
    due.length > 6 ? h("button", { class: "list-more", onClick: () => navigate("/review") }, `View all ${due.length} due`) : null
  );
}

function recentList(recent) {
  if (!recent.length) {
    return emptyState({ iconName: "add", title: "No problems yet", message: "Add your first solved problem to start the journey.", action: button("Add problem", { variant: "primary", iconName: "add", onClick: () => navigate("/add") }) });
  }
  return h("div", { class: "list" },
    ...recent.map((p) =>
      h("div", { class: "list-row is-clickable", onClick: () => navigate(`/problem/${p.id}`) },
        h("div", { class: "list-row-main" },
          h("span", { class: "list-row-title" }, p.favorite ? "★ " + p.title : p.title),
          h("span", { class: "list-row-sub" }, `${conceptName(p.concept_id)} · ${formatDateShort(p.solved_date)} · ${formatDuration(p.time_taken_seconds)}`)
        ),
        difficultyBadge(p.difficulty)
      )
    )
  );
}

function currentConceptCard(c, a) {
  if (!c) {
    return card({ className: "current-concept-card" },
      emptyState({ iconName: "roadmap", title: "Pick a concept", message: "Choose where to start on the roadmap.", action: button("Open roadmap", { variant: "primary", onClick: () => navigate("/roadmap") }) })
    );
  }
  const stat = a.conceptStats.find((s) => s.id === c.id) || { solved: 0 };
  return card({ className: "current-concept-card" },
    h("div", { class: "cc-head" },
      h("div", {},
        h("span", { class: "cc-eyebrow" }, "Current concept"),
        h("h3", { class: "cc-title" }, c.name),
        h("span", { class: "cc-meta" }, `${stat.solved} problems solved`)
      ),
      chartEl(ring(c.confidence || 0, { size: 88, stroke: 9, label: `${c.confidence || 0}%`, sublabel: "conf" }))
    ),
    h("div", { class: "cc-actions" },
      button("Open concept", { variant: "primary", iconName: "arrowRight", onClick: () => navigate(`/concept/${c.id}`) }),
      button("Add problem", { variant: "ghost", iconName: "add", onClick: () => navigate(`/add?concept=${c.id}`) })
    )
  );
}

function patternConfidence(a) {
  const studied = a.conceptStats.filter((c) => c.solved > 0).sort((x, y) => y.confidence - x.confidence).slice(0, 8);
  if (!studied.length) return emptyState({ iconName: "trendingUp", title: "No pattern data yet", message: "Solve a few problems to build your confidence map." });
  return h("div", { class: "pattern-list" },
    ...studied.map((c) =>
      h("div", { class: "pattern-row is-clickable", onClick: () => navigate(`/concept/${c.id}`) },
        h("span", { class: "pattern-name" }, c.name),
        progressBar(c.confidence, { className: "pattern-bar" }),
        h("span", { class: "pattern-val" }, `${c.confidence}%`)
      )
    )
  );
}

function goalsCard(goals) {
  if (!goals.length) {
    return emptyState({ iconName: "goals", title: "No goals set", message: "Set a target to stay motivated.", action: button("Add goal", { variant: "ghost", iconName: "add", onClick: () => navigate("/goals") }) });
  }
  return h("div", { class: "list" },
    ...goals.filter((g) => !g.archived).slice(0, 4).map((g) =>
      h("div", { class: "goal-mini" },
        h("div", { class: "goal-mini-top" },
          h("span", { class: "goal-mini-title" }, g.title),
          h("span", { class: "goal-mini-count" }, `${g.current}/${g.target}`)
        ),
        progressBar(g.pct, { color: g.done ? "#34d399" : "var(--accent)" })
      )
    )
  );
}

export function render() {
  const d = store.dashboard();
  const a = d.analytics;

  const page = h("div", { class: "page dashboard" });

  // Header
  page.appendChild(
    h("div", { class: "page-head" },
      h("div", {},
        h("h1", { class: "page-title" }, `${greeting()} 👋`),
        h("p", { class: "page-sub" }, `${formatDateShort(today())} · ${d.due.length} review${d.due.length === 1 ? "" : "s"} due · day ${a.streaks.current} of your streak`)
      ),
      h("div", { class: "page-head-actions" },
        d.due.length ? button(`Start review (${d.due.length})`, { variant: "primary", iconName: "review", onClick: () => navigate("/review") }) : button("Add problem", { variant: "primary", iconName: "add", onClick: () => navigate("/add") })
      )
    )
  );

  // Stat row
  page.appendChild(
    h("div", { class: "stat-row" },
      statCard({ label: "Current streak", value: `${a.streaks.current}🔥`, sub: `Longest ${a.streaks.longest}`, iconName: "flame", accent: true, onClick: () => navigate("/analytics") }),
      statCard({ label: "Problems solved", value: a.totals.problemsSolved, sub: `${a.difficulty.Easy}E · ${a.difficulty.Medium}M · ${a.difficulty.Hard}H`, iconName: "problems", onClick: () => navigate("/problems") }),
      statCard({ label: "Concepts done", value: `${a.totals.conceptsCompleted}/${a.totals.conceptsTotal}`, sub: `${Math.round(a.totals.conceptCompletionPct)}% complete`, iconName: "layers", onClick: () => navigate("/roadmap") }),
      statCard({ label: "Avg solve time", value: formatDuration(a.avgSolveTimeSec), sub: `Editorial ${Math.round(a.editorialDependencyPct)}%`, iconName: "clock", onClick: () => navigate("/analytics") }),
      statCard({ label: "Due today", value: d.due.length, sub: `${a.totals.needReview} flagged`, iconName: "review", onClick: () => navigate("/review") })
    )
  );

  // Roadmap strip
  const roadmapCard = card({ className: "roadmap-card" });
  roadmapCard.appendChild(sectionHeader("Roadmap", { iconName: "roadmap", sub: "Your DSA learning path", action: button("View all", { variant: "ghost", size: "sm", onClick: () => navigate("/roadmap") }) }));
  roadmapCard.appendChild(roadmapStrip(d.concepts));
  page.appendChild(roadmapCard);

  // Main grid
  const grid = h("div", { class: "dash-grid" });

  // --- main column ---
  const mainCol = h("div", { class: "dash-col" });
  mainCol.appendChild(currentConceptCard(d.currentConcept, a));

  const reviewCard = card({});
  reviewCard.appendChild(sectionHeader("Reviews due today", { iconName: "review", action: d.due.length ? button("Review", { variant: "ghost", size: "sm", iconName: "play", onClick: () => navigate("/review") }) : null }));
  reviewCard.appendChild(dueList(d.due));
  mainCol.appendChild(reviewCard);

  const recentCard = card({});
  recentCard.appendChild(sectionHeader("Recently solved", { iconName: "clock", action: button("All problems", { variant: "ghost", size: "sm", onClick: () => navigate("/problems") }) }));
  recentCard.appendChild(recentList(d.recent));
  mainCol.appendChild(recentCard);

  const progCard = card({});
  progCard.appendChild(sectionHeader("Weekly progress", { iconName: "trendingUp", sub: "Problems solved per week" }));
  progCard.appendChild(chartEl(bars(a.perWeek.map((w) => ({ label: w.label.replace("W", ""), value: w.count })), { height: 150, showValues: false })));
  mainCol.appendChild(progCard);

  // --- side column ---
  const sideCol = h("div", { class: "dash-col" });

  const heatCard = card({ className: "heatmap-card" });
  heatCard.appendChild(sectionHeader("Activity", { iconName: "calendar", sub: `${a.streaks.activeDays} active days`, action: button("Calendar", { variant: "ghost", size: "sm", onClick: () => navigate("/calendar") }) }));
  const heatWrap = chartEl(heatmapCalendar(a.heatmap), "heatmap-scroll");
  heatWrap.addEventListener("click", (e) => {
    const cell = e.target.closest("[data-date]");
    if (cell) navigate(`/calendar?date=${cell.dataset.date}`);
  });
  heatCard.appendChild(heatWrap);
  heatCard.appendChild(h("div", { class: "hm-legend" }, h("span", {}, "Less"),
    ...[0, 1, 2, 3, 4].map((l) => h("span", { class: `hm-cell-legend hm-${l}` })), h("span", {}, "More")));
  sideCol.appendChild(heatCard);

  const diffCard = card({});
  diffCard.appendChild(sectionHeader("Difficulty mix", { iconName: "layers" }));
  const segs = [
    { label: "Easy", value: a.difficulty.Easy, color: DIFF_COLORS.Easy },
    { label: "Medium", value: a.difficulty.Medium, color: DIFF_COLORS.Medium },
    { label: "Hard", value: a.difficulty.Hard, color: DIFF_COLORS.Hard },
  ];
  diffCard.appendChild(h("div", { class: "donut-row" }, chartEl(donut(segs, { size: 140 })), legend(segs)));
  sideCol.appendChild(diffCard);

  const patCard = card({});
  patCard.appendChild(sectionHeader("Pattern confidence", { iconName: "brain", sub: "Top concepts by confidence" }));
  patCard.appendChild(patternConfidence(a));
  sideCol.appendChild(patCard);

  const goalCard = card({});
  goalCard.appendChild(sectionHeader("Goals", { iconName: "goals", action: button("Manage", { variant: "ghost", size: "sm", onClick: () => navigate("/goals") }) }));
  goalCard.appendChild(goalsCard(d.goals));
  sideCol.appendChild(goalCard);

  grid.appendChild(mainCol);
  grid.appendChild(sideCol);
  page.appendChild(grid);

  return page;
}
