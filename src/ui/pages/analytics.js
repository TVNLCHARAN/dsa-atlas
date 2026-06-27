// Analytics — the full data picture: throughput, trends, distributions, concept strengths.

import { h } from "../../core/dom.js";
import store from "../../services/store.js";
import { card, sectionHeader, statCard, breadcrumb, emptyState, progressBar } from "../components/ui.js";
import { bars, line, donut, ring, chartEl, legend } from "../components/charts.js";
import { navigate } from "../../core/router.js";
import { formatDuration } from "../../core/dates.js";

const DIFF_COLORS = { Easy: "#34d399", Medium: "#fbbf24", Hard: "#fb7185" };
const REVIEW_COLORS = { solved: "#34d399", partial: "#fbbf24", forgot: "#fb7185" };

function conceptRankList(items, valueFn, suffix = "") {
  if (!items.length) return h("p", { class: "muted" }, "Not enough data yet.");
  return h("div", { class: "rank-list" },
    ...items.map((c, i) =>
      h("div", { class: "rank-row is-clickable", onClick: () => navigate(`/concept/${c.id}`) },
        h("span", { class: "rank-num" }, `${i + 1}`),
        h("span", { class: "rank-name" }, c.name),
        h("span", { class: "rank-val" }, `${valueFn(c)}${suffix}`)
      )
    )
  );
}

export function render() {
  const a = store.analytics();
  const page = h("div", { class: "page analytics-page" });
  page.appendChild(breadcrumb([{ label: "Home", href: "#/" }, { label: "Analytics" }]));
  page.appendChild(h("div", { class: "page-head" },
    h("div", {}, h("h1", { class: "page-title" }, "Analytics"), h("p", { class: "page-sub" }, "Your DSA journey by the numbers"))));

  if (!a.totals.problemsSolved) {
    page.appendChild(emptyState({ iconName: "analytics", title: "No data yet", message: "Solve and log a few problems to unlock analytics." }));
    return page;
  }

  page.appendChild(h("div", { class: "stat-row" },
    statCard({ label: "Problems solved", value: a.totals.problemsSolved, iconName: "problems" }),
    statCard({ label: "Current streak", value: `${a.streaks.current}`, sub: "days", iconName: "flame", accent: true }),
    statCard({ label: "Longest streak", value: `${a.streaks.longest}`, sub: "days", iconName: "award" }),
    statCard({ label: "Avg solve time", value: formatDuration(a.avgSolveTimeSec), iconName: "clock" }),
    statCard({ label: "Review accuracy", value: `${Math.round(a.reviewAccuracy.accuracyPct)}%`, sub: `${a.reviewAccuracy.total} reviews`, iconName: "review" }),
    statCard({ label: "Time invested", value: formatDuration(a.timeStudyingSec), iconName: "zap" })
  ));

  const grid = h("div", { class: "analytics-grid" });

  // Throughput
  grid.appendChild(card({ className: "span-2" }, sectionHeader("Problems per week", { iconName: "trendingUp" }),
    chartEl(bars(a.perWeek.map((w) => ({ label: w.label.replace("W", ""), value: w.count })), { height: 180, showValues: true }))));
  grid.appendChild(card({ className: "span-2" }, sectionHeader("Problems per month", { iconName: "calendar" }),
    chartEl(bars(a.perMonth.map((m) => ({ label: m.label.slice(0, 3), value: m.count })), { height: 180, showValues: true }))));

  // Difficulty + review accuracy donuts
  const diffSegs = [
    { label: "Easy", value: a.difficulty.Easy, color: DIFF_COLORS.Easy },
    { label: "Medium", value: a.difficulty.Medium, color: DIFF_COLORS.Medium },
    { label: "Hard", value: a.difficulty.Hard, color: DIFF_COLORS.Hard },
  ];
  grid.appendChild(card({}, sectionHeader("Difficulty", { iconName: "layers" }),
    h("div", { class: "donut-row" }, chartEl(donut(diffSegs)), legend(diffSegs))));

  const ra = a.reviewAccuracy;
  const raSegs = [
    { label: "Solved", value: ra.solved, color: REVIEW_COLORS.solved },
    { label: "Partial", value: ra.partial, color: REVIEW_COLORS.partial },
    { label: "Forgot", value: ra.forgot, color: REVIEW_COLORS.forgot },
  ];
  grid.appendChild(card({}, sectionHeader("Review accuracy", { iconName: "review" }),
    ra.total ? h("div", { class: "donut-row" }, chartEl(donut(raSegs)), legend(raSegs)) : h("p", { class: "muted" }, "No reviews completed yet.")));

  // Trends
  grid.appendChild(card({ className: "span-2" }, sectionHeader("Confidence trend", { iconName: "brain", sub: "Avg confidence per week (1–10)" }),
    chartEl(line(a.trends.confidence, { height: 170, yMax: 10 }))));
  grid.appendChild(card({ className: "span-2" }, sectionHeader("Editorial dependency", { iconName: "book", sub: "% of problems needing the editorial" }),
    chartEl(line(a.trends.editorial, { height: 170, yMax: 100, color: "#fb7185" }))));

  // Concept completion
  const completionCard = card({});
  completionCard.appendChild(sectionHeader("Concept completion", { iconName: "roadmap" }));
  completionCard.appendChild(h("div", { class: "completion-ring" },
    chartEl(ring(a.totals.conceptCompletionPct, { size: 130, label: `${Math.round(a.totals.conceptCompletionPct)}%`, sublabel: `${a.totals.conceptsCompleted}/${a.totals.conceptsTotal}` }))));
  grid.appendChild(completionCard);

  // Dependency mix
  grid.appendChild(card({}, sectionHeader("Independence", { iconName: "zap" }),
    h("div", { class: "dep-stats" },
      depRow("Solved solo", a.independentPct, "#34d399"),
      depRow("Used a hint", a.hintPct, "#fbbf24"),
      depRow("Read editorial", a.editorialDependencyPct, "#fb7185")
    )));

  // Concept rankings
  grid.appendChild(card({}, sectionHeader("Strongest concepts", { iconName: "award" }), conceptRankList(a.strongest, (c) => `${c.confidence}%`)));
  grid.appendChild(card({}, sectionHeader("Weakest concepts", { iconName: "target" }), conceptRankList(a.weakest, (c) => `${c.confidence}%`)));
  grid.appendChild(card({ className: "span-2" }, sectionHeader("Most difficult concepts", { iconName: "alert", sub: "By average attempts" }), conceptRankList(a.hardest, (c) => c.avgAttempts.toFixed(1), " att")));

  page.appendChild(grid);
  return page;
}

function depRow(label, pct, color) {
  return h("div", { class: "dep-row" },
    h("div", { class: "dep-top" }, h("span", {}, label), h("span", { class: "dep-val" }, `${Math.round(pct)}%`)),
    progressBar(pct, { color })
  );
}
