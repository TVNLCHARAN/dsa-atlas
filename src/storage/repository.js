// Repository layer — the ONLY module that knows table/column shapes.
//
// Everything above (domain logic, services, UI) consumes plain JS objects with:
//   - snake_case keys matching columns (e.g. solved_without_help)
//   - booleans as true/false (stored as 0/1)
//   - JSON columns surfaced as parsed values under a friendly key:
//       problems.tags_json   -> .tags     (array)
//       concepts.notebook_json -> .notebook (object)
//       activity.meta_json    -> .meta     (object)
//
// To migrate to native SQLite / Postgres later, reimplement this file against a new
// `db` driver. The domain/UI layers stay untouched.

import { all, get, run, scalar } from "../core/db.js";
import { nowISO } from "../core/dates.js";

// Per-table metadata: column whitelist, boolean columns, and json column -> friendly key.
const SCHEMA = {
  concepts: {
    columns: ["id", "order_index", "name", "status", "confidence", "notebook_json", "started_at", "completed_at", "created_at", "updated_at"],
    bool: [],
    json: { notebook_json: "notebook" },
  },
  problems: {
    columns: [
      "id", "title", "platform", "problem_url", "solution_url", "difficulty", "concept_id", "sub_pattern",
      "solved_date", "time_started", "time_finished", "time_taken_seconds",
      "solved_without_help", "used_hint", "read_editorial", "attempts", "rating", "language",
      "code", "brute_force", "optimized", "time_complexity", "space_complexity",
      "mistakes", "key_insight", "recognition_clue", "alternative_approaches", "edge_cases_missed",
      "confidence", "need_review", "favorite", "tags_json", "notes",
      "review_index", "review_anchor", "next_review_date", "last_reviewed_at", "review_graduated",
      "created_at", "updated_at",
    ],
    bool: ["solved_without_help", "used_hint", "read_editorial", "need_review", "favorite", "review_graduated"],
    json: { tags_json: "tags" },
  },
  code_versions: {
    columns: ["id", "problem_id", "label", "language", "code", "note", "created_at"],
    bool: [], json: {},
  },
  reviews: {
    columns: ["id", "problem_id", "due_date", "interval_index", "reviewed_at", "result", "confidence_after", "created_at"],
    bool: [], json: {},
  },
  journal: {
    columns: ["id", "date", "concept_id", "biggest_learning", "biggest_mistake", "confidence", "revise_tomorrow", "time_invested_minutes", "notes", "created_at", "updated_at"],
    bool: [], json: {},
  },
  goals: {
    columns: ["id", "title", "type", "target", "concept_id", "created_at", "completed_at", "archived"],
    bool: ["archived"], json: {},
  },
  activity: {
    columns: ["id", "type", "ref_id", "title", "detail", "date", "meta_json", "created_at"],
    bool: [], json: { meta_json: "meta" },
  },
};

function fromRow(table, row) {
  if (!row) return null;
  const meta = SCHEMA[table];
  const out = { ...row };
  for (const b of meta.bool) if (b in out) out[b] = !!out[b];
  for (const [col, key] of Object.entries(meta.json)) {
    let parsed = key === "notebook" ? {} : key === "tags" ? [] : null;
    try {
      if (out[col]) parsed = JSON.parse(out[col]);
    } catch { /* keep default */ }
    out[key] = parsed;
    delete out[col];
  }
  return out;
}

function toRow(table, obj) {
  const meta = SCHEMA[table];
  const jsonByKey = Object.fromEntries(Object.entries(meta.json).map(([col, key]) => [key, col]));
  const boolSet = new Set(meta.bool);
  const row = {};
  for (const col of meta.columns) {
    if (col in obj) {
      let v = obj[col];
      if (boolSet.has(col)) v = v ? 1 : 0;
      row[col] = v === undefined ? null : v;
    }
  }
  // Friendly json keys -> *_json columns.
  for (const [key, col] of Object.entries(jsonByKey)) {
    if (key in obj) row[col] = JSON.stringify(obj[key] ?? (key === "tags" ? [] : {}));
  }
  return row;
}

function insert(table, obj) {
  const row = toRow(table, obj);
  const cols = Object.keys(row);
  const placeholders = cols.map(() => "?").join(", ");
  const sql = `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${placeholders})`;
  const { lastId } = run(sql, cols.map((c) => row[c]));
  return lastId;
}

function update(table, id, obj, idCol = "id") {
  const row = toRow(table, obj);
  delete row[idCol];
  const cols = Object.keys(row);
  if (!cols.length) return 0;
  const setClause = cols.map((c) => `${c} = ?`).join(", ");
  const { changes } = run(`UPDATE ${table} SET ${setClause} WHERE ${idCol} = ?`, [...cols.map((c) => row[c]), id]);
  return changes;
}

// ---------------------------------------------------------------------------
// CONCEPTS
// ---------------------------------------------------------------------------
export const concepts = {
  list() {
    return all("SELECT * FROM concepts ORDER BY order_index ASC").map((r) => fromRow("concepts", r));
  },
  get(id) {
    return fromRow("concepts", get("SELECT * FROM concepts WHERE id = ?", [id]));
  },
  insert(obj) {
    const ts = nowISO();
    return insert("concepts", { created_at: ts, updated_at: ts, ...obj });
  },
  update(id, fields) {
    return update("concepts", id, { ...fields, updated_at: nowISO() });
  },
  exists(id) {
    return !!scalar("SELECT 1 FROM concepts WHERE id = ?", [id]);
  },
  currentId() {
    return scalar("SELECT id FROM concepts WHERE status='current' ORDER BY order_index ASC LIMIT 1");
  },
};

// ---------------------------------------------------------------------------
// PROBLEMS
// ---------------------------------------------------------------------------
export const problems = {
  all() {
    return all("SELECT * FROM problems ORDER BY solved_date DESC, id DESC").map((r) => fromRow("problems", r));
  },
  get(id) {
    return fromRow("problems", get("SELECT * FROM problems WHERE id = ?", [id]));
  },
  insert(obj) {
    const ts = nowISO();
    return insert("problems", { created_at: ts, updated_at: ts, ...obj });
  },
  update(id, fields) {
    return update("problems", id, { ...fields, updated_at: nowISO() });
  },
  remove(id) {
    run("DELETE FROM code_versions WHERE problem_id = ?", [id]);
    run("DELETE FROM reviews WHERE problem_id = ?", [id]);
    run("DELETE FROM activity WHERE type='solved' AND ref_id = ?", [String(id)]);
    return run("DELETE FROM problems WHERE id = ?", [id]).changes;
  },
  byConcept(conceptId) {
    return all("SELECT * FROM problems WHERE concept_id = ? ORDER BY solved_date DESC, id DESC", [conceptId])
      .map((r) => fromRow("problems", r));
  },
  recent(limit = 8) {
    return all("SELECT * FROM problems ORDER BY datetime(created_at) DESC LIMIT ?", [limit])
      .map((r) => fromRow("problems", r));
  },
  dueForReview(dateStr) {
    return all(
      "SELECT * FROM problems WHERE review_graduated = 0 AND ((next_review_date IS NOT NULL AND next_review_date <= ?) OR need_review = 1) ORDER BY next_review_date ASC, id ASC",
      [dateStr]
    ).map((r) => fromRow("problems", r));
  },
  count() {
    return scalar("SELECT COUNT(*) FROM problems") || 0;
  },
};

// ---------------------------------------------------------------------------
// CODE VERSIONS
// ---------------------------------------------------------------------------
export const codeVersions = {
  add(obj) {
    return insert("code_versions", { created_at: nowISO(), ...obj });
  },
  forProblem(problemId) {
    return all("SELECT * FROM code_versions WHERE problem_id = ? ORDER BY datetime(created_at) DESC", [problemId])
      .map((r) => fromRow("code_versions", r));
  },
  remove(id) {
    return run("DELETE FROM code_versions WHERE id = ?", [id]).changes;
  },
};

// ---------------------------------------------------------------------------
// REVIEWS (log of completed reviews — feeds accuracy analytics)
// ---------------------------------------------------------------------------
export const reviews = {
  add(obj) {
    return insert("reviews", { created_at: nowISO(), ...obj });
  },
  all() {
    return all("SELECT * FROM reviews ORDER BY datetime(reviewed_at) DESC").map((r) => fromRow("reviews", r));
  },
  forProblem(problemId) {
    return all("SELECT * FROM reviews WHERE problem_id = ? ORDER BY datetime(reviewed_at) DESC", [problemId])
      .map((r) => fromRow("reviews", r));
  },
};

// ---------------------------------------------------------------------------
// JOURNAL
// ---------------------------------------------------------------------------
export const journal = {
  all() {
    return all("SELECT * FROM journal ORDER BY date DESC").map((r) => fromRow("journal", r));
  },
  forDate(dateStr) {
    return fromRow("journal", get("SELECT * FROM journal WHERE date = ?", [dateStr]));
  },
  upsert(dateStr, fields) {
    const existing = this.forDate(dateStr);
    if (existing) {
      update("journal", existing.id, { ...fields, updated_at: nowISO() });
      return existing.id;
    }
    const ts = nowISO();
    return insert("journal", { date: dateStr, created_at: ts, updated_at: ts, ...fields });
  },
};

// ---------------------------------------------------------------------------
// GOALS
// ---------------------------------------------------------------------------
export const goals = {
  all() {
    return all("SELECT * FROM goals ORDER BY archived ASC, datetime(created_at) DESC").map((r) => fromRow("goals", r));
  },
  insert(obj) {
    return insert("goals", { created_at: nowISO(), ...obj });
  },
  update(id, fields) {
    return update("goals", id, fields);
  },
  remove(id) {
    return run("DELETE FROM goals WHERE id = ?", [id]).changes;
  },
};

// ---------------------------------------------------------------------------
// ACTIVITY (timeline + heatmap source)
// ---------------------------------------------------------------------------
export const activity = {
  log(obj) {
    return insert("activity", { created_at: nowISO(), ...obj });
  },
  all() {
    return all("SELECT * FROM activity ORDER BY date DESC, datetime(created_at) DESC").map((r) => fromRow("activity", r));
  },
  forDate(dateStr) {
    return all("SELECT * FROM activity WHERE date = ? ORDER BY datetime(created_at) DESC", [dateStr])
      .map((r) => fromRow("activity", r));
  },
};

// ---------------------------------------------------------------------------
// SETTINGS (typed key/value, JSON-encoded values)
// ---------------------------------------------------------------------------
export const settings = {
  get(key, fallback = null) {
    const row = get("SELECT value FROM settings WHERE key = ?", [key]);
    if (!row) return fallback;
    try {
      return JSON.parse(row.value);
    } catch {
      return row.value;
    }
  },
  set(key, value) {
    run(
      "INSERT INTO settings(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      [key, JSON.stringify(value)]
    );
  },
  all() {
    const out = {};
    for (const row of all("SELECT key, value FROM settings")) {
      try { out[row.key] = JSON.parse(row.value); } catch { out[row.key] = row.value; }
    }
    return out;
  },
};

export const repo = { concepts, problems, codeVersions, reviews, journal, goals, activity, settings };
export default repo;
