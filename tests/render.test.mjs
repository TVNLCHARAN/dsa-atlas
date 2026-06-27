// Headless DOM render test — mounts every page with jsdom and asserts it renders without
// throwing and produces expected content. Catches runtime errors in the UI layer.
//
// Run with: node tests/render.test.mjs   (requires: npm i jsdom)

import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cjsPath = path.join(__dirname, "sql-wasm.cjs");
if (!fs.existsSync(cjsPath)) fs.copyFileSync(path.join(__dirname, "../vendor/sql-wasm.js"), cjsPath);

// jsdom environment
const dom = new JSDOM(`<!DOCTYPE html><html data-theme="dark"><head></head><body><div id="app"></div></body></html>`, { url: "http://localhost/" });
const { window } = dom;
globalThis.window = window;
globalThis.document = window.document;
globalThis.Node = window.Node;
globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);

// sql.js + fake indexeddb
const SQLFactory = require(cjsPath);
window.initSqlJs = (opts) => SQLFactory({ ...opts, locateFile: (f) => path.join(__dirname, "../vendor", f) });
function makeFakeIDB() {
  const data = new Map();
  const fire = (req, res) => setTimeout(() => { req.result = res; req.onsuccess && req.onsuccess({ target: req }); }, 0);
  return { open() { const req = {}; setTimeout(() => { req.result = { objectStoreNames: { contains: () => true }, createObjectStore() {}, transaction() { const s = { get: (k) => { const r = {}; fire(r, data.get(k) || null); return r; }, put: (v, k) => { data.set(k, v); const r = {}; fire(r); return r; } }; const tx = { objectStore: () => s }; setTimeout(() => tx.oncomplete && tx.oncomplete(), 0); return tx; } }; req.onsuccess && req.onsuccess({ target: req }); }, 0); return req; } };
}
globalThis.indexedDB = makeFakeIDB();
window.indexedDB = globalThis.indexedDB;

const { default: store } = await import("../src/services/store.js");
await store.bootstrap();

// seed a problem so detail/review/problems pages have content
const pid = store.addProblem({
  title: "Valid Anagram", platform: "NeetCode", difficulty: "Easy", concept_id: "hashing",
  solved_date: "2026-06-27", time_taken_seconds: 540, attempts: 1, solved_without_help: true,
  language: "python", code: "def is_anagram(s,t):\n    return sorted(s)==sorted(t)",
  confidence: 7, need_review: true, favorite: false, tags: ["string"], key_insight: "count chars",
});
store.saveJournal("2026-06-27", { biggest_learning: "counting", confidence: 7 });
store.addGoal({ title: "50 problems", type: "problems_count", target: 50 });

const pages = [
  ["dashboard", {}],
  ["roadmap", {}],
  ["concept", { params: { id: "big-o" } }],
  ["problems", {}],
  ["add-problem", { query: { concept: "arrays" } }],
  ["problem-detail", { params: { id: pid } }],
  ["review", { query: {} }],
  ["analytics", {}],
  ["calendar", { query: {} }],
  ["timeline", {}],
  ["journal", { query: {} }],
  ["goals", {}],
  ["settings", {}],
  ["search-results", { query: { q: "anagram" } }],
];

let passed = 0;
console.log("\nDOM render (jsdom)\n");
for (const [name, ctx] of pages) {
  try {
    const mod = await import(`../src/ui/pages/${name}.js`);
    const el = mod.render(ctx);
    assert.ok(el && el.nodeType === 1, "did not return an element");
    assert.ok(el.textContent.length > 0, "rendered empty");
    document.getElementById("app").replaceChildren(el);
    passed++;
    console.log(`  ✓ ${name}  (${el.querySelectorAll("*").length} nodes)`);
  } catch (e) {
    console.error(`  ✗ ${name}\n    ${e.stack || e.message}`);
    process.exitCode = 1;
  }
}

// spot-check expected content
try {
  const dash = (await import("../src/ui/pages/dashboard.js")).render({});
  assert.ok(/streak/i.test(dash.textContent), "dashboard missing streak");
  const concept = (await import("../src/ui/pages/concept.js")).render({ params: { id: "two-pointers" } });
  assert.ok(/Two Pointers/.test(concept.textContent), "concept title missing");
  assert.ok(concept.querySelector("table") || /complexity/i.test(concept.textContent), "concept reference content missing");
  console.log("  ✓ content spot-checks");
  passed++;
} catch (e) { console.error(`  ✗ content spot-checks\n    ${e.message}`); process.exitCode = 1; }

console.log(`\n${passed} render checks passed.${process.exitCode ? " (with failures above)" : ""}\n`);
process.exit(process.exitCode || 0);
