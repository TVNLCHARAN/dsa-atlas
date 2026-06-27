// Pure-logic tests for the domain layer. Run with: node tests/domain.test.mjs
// These modules have no DOM/DB dependency, so they're fully testable headless.

import assert from "node:assert/strict";
import { initialSchedule, applyReview, clampConfidence } from "../src/domain/review-engine.js";
import { computeStreaks } from "../src/domain/streak.js";
import { planMarkCurrent, planComplete } from "../src/domain/roadmap-logic.js";
import { computeAnalytics } from "../src/domain/analytics.js";
import { addDays, daysBetween, secondsBetweenTimes, weekKey, monthKey } from "../src/core/dates.js";

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1; }
}

const I = [1, 3, 7, 21, 60];

console.log("\nDates");
test("addDays / daysBetween", () => {
  assert.equal(addDays("2026-06-01", 3), "2026-06-04");
  assert.equal(addDays("2026-02-27", 2), "2026-03-01"); // 2026 not leap
  assert.equal(daysBetween("2026-06-10", "2026-06-01"), 9);
});
test("secondsBetweenTimes incl. midnight wrap", () => {
  assert.equal(secondsBetweenTimes("10:00", "10:45"), 45 * 60);
  assert.equal(secondsBetweenTimes("23:50", "00:10"), 20 * 60);
});
test("week/month keys", () => {
  assert.equal(monthKey("2026-06-27"), "2026-06");
  assert.match(weekKey("2026-06-27"), /^2026-W\d\d$/);
});

console.log("\nReview engine");
test("initialSchedule anchors to solved date", () => {
  const s = initialSchedule("2026-06-01", I);
  assert.deepEqual(s, { review_index: 0, review_anchor: "2026-06-01", next_review_date: "2026-06-02", review_graduated: false });
});
test("solved advances the ladder", () => {
  const r = applyReview({ review_index: 0, review_anchor: "2026-06-01" }, "solved", I);
  assert.equal(r.review_index, 1);
  assert.equal(r.next_review_date, "2026-06-04"); // anchor + 3
  assert.equal(r.review_graduated, false);
});
test("solved at last interval graduates", () => {
  const r = applyReview({ review_index: 4, review_anchor: "2026-06-01" }, "solved", I);
  assert.equal(r.review_graduated, true);
  assert.equal(r.next_review_date, null);
});
test("partial repeats current level re-anchored to today", () => {
  const r = applyReview({ review_index: 2, review_anchor: "2026-06-01" }, "partial", I, "2026-06-10");
  assert.equal(r.review_index, 2);
  assert.equal(r.review_anchor, "2026-06-10");
  assert.equal(r.next_review_date, "2026-06-17"); // today + 7
});
test("forgot restarts from today", () => {
  const r = applyReview({ review_index: 3, review_anchor: "2026-06-01" }, "forgot", I, "2026-06-10");
  assert.equal(r.review_index, 0);
  assert.equal(r.next_review_date, "2026-06-11");
});
test("clampConfidence bounds 1..10", () => {
  assert.equal(clampConfidence(10, +1), 10);
  assert.equal(clampConfidence(1, -2), 1);
  assert.equal(clampConfidence(5, +2), 7);
});

console.log("\nStreaks");
test("current streak counts back from today", () => {
  const s = computeStreaks(["2026-06-25", "2026-06-26", "2026-06-27"], "2026-06-27");
  assert.equal(s.current, 3);
  assert.equal(s.longest, 3);
});
test("streak survives if yesterday active but today not", () => {
  const s = computeStreaks(["2026-06-25", "2026-06-26"], "2026-06-27");
  assert.equal(s.current, 2);
});
test("gap breaks the current streak", () => {
  const s = computeStreaks(["2026-06-20", "2026-06-26", "2026-06-27"], "2026-06-27");
  assert.equal(s.current, 2);
  assert.equal(s.longest, 2);
});

console.log("\nRoadmap logic");
const concepts = [
  { id: "a", status: "current", order_index: 0 },
  { id: "b", status: "locked", order_index: 1 },
  { id: "c", status: "locked", order_index: 2 },
];
test("planMarkCurrent demotes previous current", () => {
  const plan = planMarkCurrent(concepts, "b");
  const byId = Object.fromEntries(plan.map((p) => [p.id, p.fields.status]));
  assert.equal(byId.b, "current");
  assert.equal(byId.a, "locked");
});
test("planComplete completes and promotes next locked", () => {
  const plan = planComplete(concepts, "a", 80);
  const byId = Object.fromEntries(plan.map((p) => [p.id, p.fields]));
  assert.equal(byId.a.status, "completed");
  assert.equal(byId.a.confidence, 80);
  assert.equal(byId.b.status, "current"); // promoted
});

console.log("\nAnalytics");
test("computeAnalytics aggregates totals, difficulty, streaks", () => {
  const problems = [
    { difficulty: "Easy", solved_date: "2026-06-26", time_taken_seconds: 600, confidence: 7, read_editorial: false, solved_without_help: true, concept_id: "a", attempts: 1 },
    { difficulty: "Medium", solved_date: "2026-06-27", time_taken_seconds: 1800, confidence: 5, read_editorial: true, solved_without_help: false, concept_id: "a", attempts: 2 },
    { difficulty: "Hard", solved_date: "2026-06-27", time_taken_seconds: 3600, confidence: 3, read_editorial: true, solved_without_help: false, concept_id: "b", attempts: 4 },
  ];
  const a = computeAnalytics({
    problems, reviews: [], journal: [],
    concepts: [{ id: "a", name: "A", status: "completed", confidence: 80 }, { id: "b", name: "B", status: "current", confidence: 40 }],
    ref: "2026-06-27",
  });
  assert.equal(a.totals.problemsSolved, 3);
  assert.deepEqual(a.difficulty, { Easy: 1, Medium: 1, Hard: 1 });
  assert.equal(a.streaks.current, 2); // 26th + 27th
  assert.equal(Math.round(a.editorialDependencyPct), 67);
  assert.equal(a.totals.conceptsCompleted, 1);
  assert.ok(a.avgSolveTimeSec > 0);
  assert.equal(a.heatmap.cells.length, 371);
});

console.log(`\n${passed} checks passed.${process.exitCode ? " (with failures above)" : ""}\n`);
