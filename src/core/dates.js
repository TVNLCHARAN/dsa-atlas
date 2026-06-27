// Date utilities. All "dates" in the app are local-time, day-resolution strings: "YYYY-MM-DD".
// Timestamps (created_at/updated_at) are full ISO strings. Keeping date math local-time
// avoids the classic off-by-one-day UTC bugs in streaks/heatmaps/reviews.

export function pad2(n) {
  return String(n).padStart(2, "0");
}

/** Local "YYYY-MM-DD" for a Date (defaults to now). */
export function toDateStr(d = new Date()) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function today() {
  return toDateStr(new Date());
}

export function nowISO() {
  return new Date().toISOString();
}

/** Parse "YYYY-MM-DD" into a local-time Date at midnight. */
export function parseDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** Add n days to a "YYYY-MM-DD" string, return a "YYYY-MM-DD" string. */
export function addDays(str, n) {
  const d = parseDate(str) || new Date();
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

/** Whole-day difference a - b (both "YYYY-MM-DD"). Positive when a is later. */
export function daysBetween(a, b) {
  const da = parseDate(a);
  const db = parseDate(b);
  if (!da || !db) return 0;
  return Math.round((da - db) / 86400000);
}

export function isPastOrToday(dateStr, ref = today()) {
  return daysBetween(dateStr, ref) <= 0;
}

/** "HH:MM" -> minutes since midnight. */
export function timeToMinutes(t) {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h)) return null;
  return h * 60 + (m || 0);
}

/** Seconds between two "HH:MM" times on the same day (handles wrap past midnight). */
export function secondsBetweenTimes(start, end) {
  const s = timeToMinutes(start);
  const e = timeToMinutes(end);
  if (s == null || e == null) return 0;
  let diff = e - s;
  if (diff < 0) diff += 24 * 60; // crossed midnight
  return diff * 60;
}

export function formatDuration(seconds) {
  if (!seconds || seconds < 0) return "—";
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function formatDateHuman(str) {
  const d = parseDate(str);
  if (!d) return "—";
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatDateShort(str) {
  const d = parseDate(str);
  if (!d) return "—";
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function dowName(str) {
  const d = parseDate(str);
  return d ? DOW[d.getDay()] : "";
}

/** Relative phrasing for review/timeline UIs. */
export function relativeDay(dateStr, ref = today()) {
  const diff = daysBetween(dateStr, ref);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff < 0) return `${-diff} days ago`;
  return `in ${diff} days`;
}

/** ISO week key "YYYY-Www" for weekly aggregation. */
export function weekKey(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return "";
  const tmp = new Date(d);
  tmp.setHours(0, 0, 0, 0);
  // Thursday-based ISO week
  tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
  const week1 = new Date(tmp.getFullYear(), 0, 4);
  const wn =
    1 +
    Math.round(((tmp - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${tmp.getFullYear()}-W${pad2(wn)}`;
}

export function monthKey(dateStr) {
  return dateStr ? dateStr.slice(0, 7) : "";
}

export function monthLabel(key) {
  const [y, m] = key.split("-").map(Number);
  return `${MONTHS[(m || 1) - 1]} ${y}`;
}
