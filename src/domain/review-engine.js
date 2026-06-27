// Spaced-repetition engine — PURE functions, no DB/DOM. Unit-testable in Node.
//
// Model:
//   review_index    = which interval is NEXT (0-based into the intervals array)
//   review_anchor   = reference date the upcoming interval is measured from
//   next_review_date = review_anchor + intervals[review_index]   (null when graduated)
//
// On creation, anchor = solved date, index = 0  -> first review at solved + intervals[0].
// Default intervals: [1, 3, 7, 21, 60]  (the "Day 1/3/7/21/60" schedule).

import { DEFAULT_REVIEW_INTERVALS, REVIEW_RESULTS } from "../core/config.js";
import { addDays, today } from "../core/dates.js";

export function initialSchedule(solvedDate, intervals = DEFAULT_REVIEW_INTERVALS) {
  return {
    review_index: 0,
    review_anchor: solvedDate,
    next_review_date: addDays(solvedDate, intervals[0]),
    review_graduated: false,
  };
}

/**
 * Given a problem's current schedule and a review result, return the fields to persist.
 * result: "solved" | "partial" | "forgot"
 */
export function applyReview(problem, result, intervals = DEFAULT_REVIEW_INTERVALS, ref = today()) {
  const idx = Number(problem.review_index ?? 0);
  const anchor = problem.review_anchor || problem.solved_date || ref;
  const base = { need_review: false }; // a completed review clears the manual flag

  if (result === "solved") {
    const next = idx + 1;
    if (next >= intervals.length) {
      return { ...base, review_index: next, next_review_date: null, review_graduated: true };
    }
    return {
      ...base,
      review_index: next,
      review_anchor: anchor,
      next_review_date: addDays(anchor, intervals[next]),
      review_graduated: false,
    };
  }

  if (result === "partial") {
    // Repeat the current level, re-anchored to today.
    const gap = intervals[idx] ?? intervals[0];
    return {
      ...base,
      review_index: idx,
      review_anchor: ref,
      next_review_date: addDays(ref, gap),
      review_graduated: false,
    };
  }

  // forgot -> restart the ladder from today
  return {
    ...base,
    review_index: 0,
    review_anchor: ref,
    next_review_date: addDays(ref, intervals[0]),
    review_graduated: false,
  };
}

export function confidenceDelta(result) {
  return REVIEW_RESULTS[result]?.confidenceDelta ?? 0;
}

/** Human label for the current ladder position, e.g. "Review 3 of 5". */
export function ladderLabel(problem, intervals = DEFAULT_REVIEW_INTERVALS) {
  if (problem.review_graduated) return "Graduated";
  const idx = Number(problem.review_index ?? 0);
  return `Review ${Math.min(idx + 1, intervals.length)} of ${intervals.length}`;
}

/** Clamp a 1..10 confidence after applying a delta. */
export function clampConfidence(value, delta = 0, min = 1, max = 10) {
  return Math.max(min, Math.min(max, (Number(value) || 5) + delta));
}
