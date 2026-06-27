// Headless integration test of the FULL storage + service stack:
// sql.js engine -> schema/migrations -> repository -> store (business logic).
// We mock the few browser globals (window/document/indexedDB) the storage layer touches.
//
// Run with: node tests/integration.test.mjs

import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// sql.js is a UMD module — provision a .cjs copy so Node can require it as CommonJS.
const cjsPath = path.join(__dirname, "sql-wasm.cjs");
if (!fs.existsSync(cjsPath)) fs.copyFileSync(path.join(__dirname, "../vendor/sql-wasm.js"), cjsPath);

// ---- minimal in-memory IndexedDB shim (single store, key/value) ----
function makeFakeIDB() {
  const data = new Map();
  const fireSoon = (req, result) => setTimeout(() => { req.result = result; req.onsuccess && req.onsuccess({ target: req }); }, 0);
  return {
    open() {
      const req = {};
      setTimeout(() => {
        const db = {
          objectStoreNames: { contains: () => true },
          createObjectStore() {},
          transaction() {
            const store = {
              get(key) { const r = {}; fireSoon(r, data.get(key) || null); return r; },
              put(val, key) { data.set(key, val); const r = {}; fireSoon(r, undefined); return r; },
            };
            const tx = { objectStore: () => store };
            setTimeout(() => tx.oncomplete && tx.oncomplete(), 0);
            return tx;
          },
        };
        req.result = db;
        req.onsuccess && req.onsuccess({ target: req });
      }, 0);
      return req;
    },
  };
}

// ---- mock browser globals BEFORE importing the app modules ----
const SQLFactory = require(cjsPath);
globalThis.window = {
  initSqlJs: (opts) => SQLFactory({ ...opts, locateFile: (f) => path.join(__dirname, "../vendor", f) }),
  addEventListener() {},
};
globalThis.document = {
  documentElement: { setAttribute() {}, style: { setProperty() {} } },
  getElementById: () => null,
  addEventListener() {},
};
globalThis.indexedDB = makeFakeIDB();

const { default: store } = await import("../src/services/store.js");
const repo = (await import("../src/storage/repository.js")).default;
const { buildBackup } = await import("../src/services/export.js");

let passed = 0;
const test = (name, fn) => { try { fn(); passed++; console.log(`  ✓ ${name}`); } catch (e) { console.error(`  ✗ ${name}\n    ${e.stack || e.message}`); process.exitCode = 1; } };

console.log("\nIntegration (sql.js + schema + repository + store)\n");

await store.bootstrap();

test("bootstrap seeds 37 concepts, big-o current", () => {
  const cs = store.concepts();
  assert.equal(cs.length, 37);
  assert.equal(cs[0].id, "big-o");
  assert.equal(store.currentConcept().id, "big-o");
});

let pid;
test("addProblem persists all field types correctly", () => {
  pid = store.addProblem({
    title: "Two Sum", platform: "LeetCode", difficulty: "Easy", concept_id: "hashing",
    sub_pattern: "complement map", solved_date: "2026-06-27", time_taken_seconds: 720,
    attempts: 1, solved_without_help: true, used_hint: false, read_editorial: false,
    rating: 5, language: "python", code: "def two_sum(nums, t):\n    seen={}\n    ...",
    time_complexity: "O(n)", space_complexity: "O(n)", key_insight: "store complements",
    confidence: 8, need_review: true, favorite: true, tags: ["array", "hashmap"], notes: "classic",
  });
  const p = store.problem(pid);
  assert.equal(p.title, "Two Sum");
  assert.equal(p.solved_without_help, true);      // boolean roundtrip
  assert.equal(p.favorite, true);
  assert.deepEqual(p.tags, ["array", "hashmap"]);  // json roundtrip
  assert.equal(p.time_taken_seconds, 720);
  assert.equal(p.next_review_date, "2026-06-28");  // scheduled +1
  assert.equal(p.review_graduated, false);
});

test("addProblem created an Original code version", () => {
  const v = store.codeVersions(pid);
  assert.equal(v.length, 1);
  assert.equal(v[0].label, "Original");
});

test("studying a locked concept marks it current", () => {
  assert.equal(store.concept("hashing").status, "current");
});

test("problem appears in review queue (need_review flag)", () => {
  const due = store.dueReviews("2026-06-27");
  assert.ok(due.some((p) => p.id === pid));
});

test("submitReview logs review + advances schedule + sets confidence", () => {
  store.submitReview(pid, "solved", 9);
  const p = store.problem(pid);
  assert.equal(p.review_index, 1);
  assert.equal(p.confidence, 9);
  assert.equal(p.need_review, false); // cleared by review
  assert.equal(store.reviewHistory(pid).length, 1);
});

test("dashboard + analytics compute", () => {
  const d = store.dashboard();
  assert.equal(d.analytics.totals.problemsSolved, 1);
  assert.equal(d.analytics.difficulty.Easy, 1);
  assert.ok(d.recent.length >= 1);
});

test("global search finds the problem", async () => {
  const { globalSearch } = await import("../src/services/search.js");
  const r = globalSearch("complement");
  assert.ok(r.problems.some((x) => x.id === pid));
});

test("completeConcept marks completed + promotes next", () => {
  store.completeConcept("big-o", 90);
  assert.equal(store.concept("big-o").status, "completed");
  assert.equal(store.concept("big-o").confidence, 90);
});

test("addCodeVersion appends to history", () => {
  store.addCodeVersion(pid, { label: "Optimized", language: "python", code: "# faster", note: "cleanup" });
  assert.equal(store.codeVersions(pid).length, 2);
});

test("journal + goals persist", () => {
  store.saveJournal("2026-06-27", { biggest_learning: "hash maps", confidence: 8, time_invested_minutes: 60 });
  assert.equal(store.journal("2026-06-27").biggest_learning, "hash maps");
  store.addGoal({ title: "100 problems", type: "problems_count", target: 100 });
  const g = store.goalsWithProgress();
  assert.equal(g[0].current, 1);
  assert.equal(g[0].target, 100);
});

test("moveConcept reorders", () => {
  const before = store.concepts().map((c) => c.id);
  store.moveConcept(before[1], -1);
  const after = store.concepts().map((c) => c.id);
  assert.equal(after[0], before[1]);
  store.moveConcept(after[0], 1); // restore
});

test("backup -> importBackup roundtrip preserves data", async () => {
  const backup = buildBackup();
  assert.equal(backup.data.problems.length, 1);
  await store.importBackup(backup);
  assert.equal(store.problems().length, 1);
  assert.equal(store.concepts().length, 37);
  assert.equal(store.problem(store.problems()[0].id).tags.length, 2);
});

test("activity timeline recorded events", () => {
  const acts = store.activity();
  assert.ok(acts.some((a) => a.type === "solved"));
  assert.ok(acts.some((a) => a.type === "reviewed"));
});

console.log(`\n${passed} integration checks passed.${process.exitCode ? " (with failures above)" : ""}\n`);
process.exit(process.exitCode || 0);
