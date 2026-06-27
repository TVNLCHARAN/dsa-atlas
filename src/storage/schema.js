// Database schema + migration runner. Versioned via the `meta` table so future schema
// changes are additive and safe. Keeping DDL isolated here means a different storage
// backend can reuse the exact same logical schema.

import { exec, get, run } from "../core/db.js";
import { SCHEMA_VERSION } from "../core/config.js";

const DDL_V1 = `
CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS concepts (
  id            TEXT PRIMARY KEY,
  order_index   INTEGER NOT NULL,
  name          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'locked',   -- locked | current | completed
  confidence    INTEGER NOT NULL DEFAULT 0,       -- 0..100
  notebook_json TEXT NOT NULL DEFAULT '{}',
  started_at    TEXT,
  completed_at  TEXT,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS problems (
  id                     INTEGER PRIMARY KEY AUTOINCREMENT,
  title                  TEXT NOT NULL,
  platform               TEXT,
  problem_url            TEXT,
  solution_url           TEXT,
  difficulty             TEXT,
  concept_id             TEXT,
  sub_pattern            TEXT,
  solved_date            TEXT,
  time_started           TEXT,
  time_finished          TEXT,
  time_taken_seconds     INTEGER DEFAULT 0,
  solved_without_help    INTEGER DEFAULT 0,
  used_hint              INTEGER DEFAULT 0,
  read_editorial         INTEGER DEFAULT 0,
  attempts               INTEGER DEFAULT 1,
  rating                 INTEGER,
  language               TEXT,
  code                   TEXT,
  brute_force            TEXT,
  optimized              TEXT,
  time_complexity        TEXT,
  space_complexity       TEXT,
  mistakes               TEXT,
  key_insight            TEXT,
  recognition_clue       TEXT,
  alternative_approaches TEXT,
  edge_cases_missed      TEXT,
  confidence             INTEGER,
  need_review            INTEGER DEFAULT 0,
  favorite               INTEGER DEFAULT 0,
  tags_json              TEXT DEFAULT '[]',
  notes                  TEXT,
  review_index           INTEGER DEFAULT 0,
  review_anchor          TEXT,
  next_review_date       TEXT,
  last_reviewed_at       TEXT,
  review_graduated       INTEGER DEFAULT 0,
  created_at             TEXT NOT NULL,
  updated_at             TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS code_versions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  problem_id INTEGER NOT NULL,
  label      TEXT,
  language   TEXT,
  code       TEXT,
  note       TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  problem_id       INTEGER NOT NULL,
  due_date         TEXT,
  interval_index   INTEGER,
  reviewed_at      TEXT,
  result           TEXT,            -- solved | partial | forgot
  confidence_after INTEGER,
  created_at       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS journal (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  date                  TEXT UNIQUE NOT NULL,
  concept_id            TEXT,
  biggest_learning      TEXT,
  biggest_mistake       TEXT,
  confidence            INTEGER,
  revise_tomorrow       TEXT,
  time_invested_minutes INTEGER DEFAULT 0,
  notes                 TEXT,
  created_at            TEXT NOT NULL,
  updated_at            TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS goals (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT NOT NULL,
  type         TEXT,
  target       INTEGER,
  concept_id   TEXT,
  created_at   TEXT NOT NULL,
  completed_at TEXT,
  archived     INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS activity (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  type       TEXT,
  ref_id     TEXT,
  title      TEXT,
  detail     TEXT,
  date       TEXT,
  meta_json  TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_problems_concept    ON problems(concept_id);
CREATE INDEX IF NOT EXISTS idx_problems_solved     ON problems(solved_date);
CREATE INDEX IF NOT EXISTS idx_problems_review     ON problems(next_review_date);
CREATE INDEX IF NOT EXISTS idx_problems_favorite   ON problems(favorite);
CREATE INDEX IF NOT EXISTS idx_reviews_problem     ON reviews(problem_id);
CREATE INDEX IF NOT EXISTS idx_codeversions_problem ON code_versions(problem_id);
CREATE INDEX IF NOT EXISTS idx_activity_date       ON activity(date);
`;

function getSchemaVersion() {
  try {
    const row = get("SELECT value FROM meta WHERE key='schema_version'");
    return row ? Number(row.value) : 0;
  } catch {
    return 0; // meta table doesn't exist yet
  }
}

function setSchemaVersion(v) {
  run(
    "INSERT INTO meta(key, value) VALUES('schema_version', ?) " +
      "ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    [String(v)]
  );
}

// Ordered list of migrations. Index 0 is the baseline (v0 -> v1).
const MIGRATIONS = [
  function v1() {
    exec(DDL_V1);
  },
  // Future migrations: function v2() { exec("ALTER TABLE ..."); }, etc.
];

export function migrate() {
  let current = getSchemaVersion();
  for (let v = current; v < MIGRATIONS.length; v++) {
    MIGRATIONS[v]();
    setSchemaVersion(v + 1);
  }
  // Safety: never leave version ahead of known migrations.
  if (getSchemaVersion() > MIGRATIONS.length) setSchemaVersion(MIGRATIONS.length);
  return getSchemaVersion();
}

export { SCHEMA_VERSION };
