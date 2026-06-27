// Analytics engine — PURE. Consumes the full dataset and derives every metric the
// dashboard / analytics page render. No DB/DOM access, so it's deterministic and testable.

import { CONCEPT_STATUS } from "../core/config.js";
import { conceptName } from "../data/roadmap.js";
import { addDays, daysBetween, monthKey, monthLabel, today, weekKey } from "../core/dates.js";
import { computeStreaks } from "./streak.js";

const DIFFS = ["Easy", "Medium", "Hard"];

function avg(arr) {
  const xs = arr.filter((x) => x != null && !Number.isNaN(x));
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

function reviewDate(r) {
  return (r.reviewed_at || "").slice(0, 10);
}

/** Days that count toward streaks/heatmap activity. */
export function activeDays(problems, reviews, journal) {
  const set = new Set();
  for (const p of problems) if (p.solved_date) set.add(p.solved_date);
  for (const r of reviews) {
    const d = reviewDate(r);
    if (d) set.add(d);
  }
  for (const j of journal) if (j.date) set.add(j.date);
  return set;
}

/** date -> contribution count (problems + reviews). */
export function heatmapCounts(problems, reviews) {
  const map = new Map();
  const bump = (d, n = 1) => d && map.set(d, (map.get(d) || 0) + n);
  for (const p of problems) bump(p.solved_date);
  for (const r of reviews) bump(reviewDate(r));
  return map;
}

/** Build a fixed-length day grid (for the GitHub-style calendar) ending today. */
export function heatmapGrid(countsMap, days = 365, ref = today()) {
  const start = addDays(ref, -(days - 1));
  const cells = [];
  let max = 0;
  for (let i = 0; i < days; i++) {
    const date = addDays(start, i);
    const count = countsMap.get(date) || 0;
    if (count > max) max = count;
    cells.push({ date, count });
  }
  return { cells, max, start, end: ref };
}

function bucketBy(problems, keyFn) {
  const map = new Map();
  for (const p of problems) {
    if (!p.solved_date) continue;
    const k = keyFn(p.solved_date);
    map.set(k, (map.get(k) || 0) + 1);
  }
  return map;
}

/** Last N week buckets (chronological) with solved counts. */
export function perWeek(problems, weeks = 12, ref = today()) {
  const map = bucketBy(problems, weekKey);
  const out = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const refDate = addDays(ref, -i * 7);
    const k = weekKey(refDate);
    out.push({ key: k, label: k.replace(/^\d+-/, ""), count: map.get(k) || 0 });
  }
  return out;
}

export function perMonth(problems, months = 12, ref = today()) {
  const map = bucketBy(problems, monthKey);
  const out = [];
  const [y, m] = ref.split("-").map(Number);
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(y, m - 1 - i, 1);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    out.push({ key: k, label: monthLabel(k), count: map.get(k) || 0 });
  }
  return out;
}

/** Weekly trend of avg confidence and editorial dependency %. */
export function trends(problems, weeks = 12, ref = today()) {
  const byWeek = new Map();
  for (const p of problems) {
    if (!p.solved_date) continue;
    const k = weekKey(p.solved_date);
    if (!byWeek.has(k)) byWeek.set(k, []);
    byWeek.get(k).push(p);
  }
  const conf = [];
  const editorial = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const k = weekKey(addDays(ref, -i * 7));
    const ps = byWeek.get(k) || [];
    const label = k.replace(/^\d+-/, "");
    conf.push({ key: k, label, value: ps.length ? avg(ps.map((p) => p.confidence)) : null });
    editorial.push({
      key: k,
      label,
      value: ps.length ? (ps.filter((p) => p.read_editorial).length / ps.length) * 100 : null,
    });
  }
  return { confidence: conf, editorial };
}

export function conceptStats(problems, concepts) {
  const byConcept = new Map();
  for (const p of problems) {
    const id = p.concept_id || "_unassigned";
    if (!byConcept.has(id)) byConcept.set(id, []);
    byConcept.get(id).push(p);
  }
  return concepts.map((c) => {
    const ps = byConcept.get(c.id) || [];
    return {
      id: c.id,
      name: c.name || conceptName(c.id),
      status: c.status,
      confidence: c.confidence, // 0..100 self-rated concept confidence
      solved: ps.length,
      avgProblemConfidence: ps.length ? avg(ps.map((p) => p.confidence)) : 0, // 1..10
      avgAttempts: ps.length ? avg(ps.map((p) => p.attempts || 1)) : 0,
      avgTimeSec: ps.length ? avg(ps.map((p) => p.time_taken_seconds || 0)) : 0,
      editorialPct: ps.length ? (ps.filter((p) => p.read_editorial).length / ps.length) * 100 : 0,
    };
  });
}

export function reviewAccuracy(reviews) {
  const total = reviews.length;
  const solved = reviews.filter((r) => r.result === "solved").length;
  const partial = reviews.filter((r) => r.result === "partial").length;
  const forgot = reviews.filter((r) => r.result === "forgot").length;
  return {
    total,
    solved,
    partial,
    forgot,
    accuracyPct: total ? (solved / total) * 100 : 0,
    recallPct: total ? ((solved + partial * 0.5) / total) * 100 : 0,
  };
}

/** The single entry point — returns the whole stats object for the UI. */
export function computeAnalytics({ problems = [], reviews = [], journal = [], concepts = [], ref = today() } = {}) {
  const difficulty = { Easy: 0, Medium: 0, Hard: 0 };
  for (const p of problems) if (DIFFS.includes(p.difficulty)) difficulty[p.difficulty]++;

  const solveTimes = problems.map((p) => p.time_taken_seconds || 0).filter((x) => x > 0);
  const totalSolveSec = solveTimes.reduce((a, b) => a + b, 0);
  const journalMinutes = journal.reduce((a, j) => a + (j.time_invested_minutes || 0), 0);

  const completed = concepts.filter((c) => c.status === CONCEPT_STATUS.COMPLETED);
  const cStats = conceptStats(problems, concepts);
  const studied = cStats.filter((c) => c.solved > 0);

  const strongest = [...studied].sort((a, b) => b.avgProblemConfidence - a.avgProblemConfidence).slice(0, 5);
  const weakest = [...studied].sort((a, b) => a.avgProblemConfidence - b.avgProblemConfidence).slice(0, 5);
  const hardest = [...studied]
    .sort((a, b) => b.avgAttempts - a.avgAttempts || b.avgTimeSec - a.avgTimeSec)
    .slice(0, 5);

  const counts = heatmapCounts(problems, reviews);

  return {
    totals: {
      problemsSolved: problems.length,
      conceptsCompleted: completed.length,
      conceptsTotal: concepts.length,
      conceptsInProgress: concepts.filter((c) => c.status === CONCEPT_STATUS.CURRENT).length,
      conceptCompletionPct: concepts.length ? (completed.length / concepts.length) * 100 : 0,
      favorites: problems.filter((p) => p.favorite).length,
      needReview: problems.filter((p) => p.need_review).length,
    },
    difficulty,
    avgSolveTimeSec: solveTimes.length ? totalSolveSec / solveTimes.length : 0,
    totalSolveSec,
    timeStudyingSec: totalSolveSec + journalMinutes * 60,
    editorialDependencyPct: problems.length
      ? (problems.filter((p) => p.read_editorial).length / problems.length) * 100
      : 0,
    hintPct: problems.length ? (problems.filter((p) => p.used_hint).length / problems.length) * 100 : 0,
    independentPct: problems.length
      ? (problems.filter((p) => p.solved_without_help).length / problems.length) * 100
      : 0,
    avgConfidence: avg(problems.map((p) => p.confidence)),
    streaks: computeStreaks(activeDays(problems, reviews, journal), ref),
    perWeek: perWeek(problems, 12, ref),
    perMonth: perMonth(problems, 12, ref),
    trends: trends(problems, 12, ref),
    conceptStats: cStats,
    strongest,
    weakest,
    hardest,
    reviewAccuracy: reviewAccuracy(reviews),
    heatmap: heatmapGrid(counts, 371, ref), // 53 weeks
  };
}
