// Streak computation — PURE. An "active day" is any day with a solved problem, a completed
// review, or a journal entry. The set is assembled by analytics/store and passed in here.

import { addDays, daysBetween, today } from "../core/dates.js";

export function computeStreaks(dates, ref = today()) {
  const set = dates instanceof Set ? dates : new Set(dates);
  const sorted = [...set].filter(Boolean).sort();

  // Longest run of consecutive calendar days.
  let longest = 0;
  let run = 0;
  let prev = null;
  for (const d of sorted) {
    run = prev && daysBetween(d, prev) === 1 ? run + 1 : 1;
    if (run > longest) longest = run;
    prev = d;
  }

  // Current streak counts back from today; if today is empty we still honour a streak
  // that ran through yesterday (so the day isn't "broken" until you actually skip one).
  let current = 0;
  let cursor = set.has(ref) ? ref : addDays(ref, -1);
  while (set.has(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }

  return { current, longest, activeDays: set.size };
}
