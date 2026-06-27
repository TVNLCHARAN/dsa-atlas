// Validates the aggregated concept content against the roadmap and the enriched schema:
// every concept present, required fields well-formed, exactly 5 LeetCode problems, >=3
// videos/articles, markdown overview with a How-to-think section. Run: node tests/content.test.mjs

import assert from "node:assert/strict";
import { ROADMAP_IDS } from "../src/data/roadmap.js";
import { CONCEPT_CONTENT } from "../src/data/concept-content.js";

let passed = 0, failed = 0;
const fail = (msg) => { failed++; console.error(`  ✗ ${msg}`); process.exitCode = 1; };
const ok = (msg) => { passed++; };

const LC = /^https:\/\/leetcode\.com\/problems\/[a-z0-9-]+\/?$/;
const HTTP = /^https?:\/\/.+/;
const DIFF = new Set(["Easy", "Medium", "Hard"]);

const ids = Object.keys(CONCEPT_CONTENT);
console.log(`\nConcept content validation — ${ids.length} concepts\n`);

// Coverage: every roadmap id present, and no stray/typo ids.
for (const id of ROADMAP_IDS) {
  if (!CONCEPT_CONTENT[id]) fail(`MISSING concept: ${id}`); else ok();
}
for (const id of ids) {
  if (!ROADMAP_IDS.includes(id)) fail(`UNKNOWN concept id (typo?): ${id}`);
}
if (ids.length !== ROADMAP_IDS.length) fail(`expected ${ROADMAP_IDS.length} concepts, got ${ids.length}`);

const arr = (v) => Array.isArray(v) ? v : [];
let urlCount = 0, lcCount = 0;

for (const id of ROADMAP_IDS) {
  const c = CONCEPT_CONTENT[id];
  if (!c) continue;
  const e = (cond, what) => { if (!cond) fail(`${id}: ${what}`); };

  e(c.id === id, "id mismatch");
  e(typeof c.name === "string" && c.name.length, "missing name");
  e(typeof c.summary === "string" && c.summary.length > 10, "weak/missing summary");
  e(typeof c.overview === "string" && c.overview.length > 120, "overview too short");
  e(/##\s/.test(c.overview || ""), "overview missing markdown heading");
  e(/how to think/i.test(c.overview || ""), "overview missing 'How to think'");

  e(arr(c.recognition).length >= 4, `recognition < 4 (${arr(c.recognition).length})`);
  e(arr(c.whenToUse).length >= 3, "whenToUse < 3");
  e(arr(c.whenNotToUse).length >= 2, "whenNotToUse < 2");
  e(arr(c.patterns).length >= 3, "patterns < 3");
  for (const p of arr(c.patterns)) e(p && p.name && p.note, "pattern missing name/note");
  e(arr(c.complexity).length >= 1, "no complexity rows");
  for (const r of arr(c.complexity)) e(r && r.time && r.space, `complexity row missing time/space`);
  e(arr(c.edgeCases).length >= 3, "edgeCases < 3");
  e(arr(c.commonMistakes).length >= 3, "commonMistakes < 3");
  e(arr(c.observations).length >= 3, "observations < 3");
  e(c.template && typeof c.template.code === "string" && c.template.code.length > 20, "template code missing");

  const probs = arr(c.problems);
  e(probs.length === 5, `problems != 5 (${probs.length})`);
  for (const p of probs) {
    e(p && p.title && p.url && p.difficulty && p.pattern, `problem missing fields (${p?.title})`);
    e(LC.test(p.url || ""), `problem URL not LeetCode format: ${p?.url}`);
    e(DIFF.has(p.difficulty), `bad difficulty: ${p?.difficulty}`);
    lcCount++;
  }
  const diffs = new Set(probs.map((p) => p.difficulty));
  e(diffs.size >= 2, "problems lack difficulty variety");

  const vids = arr(c.videos);
  e(vids.length >= 3, `videos < 3 (${vids.length})`);
  for (const v of vids) { e(v && v.title && HTTP.test(v.url || ""), `bad video url: ${v?.url}`); urlCount++; }
  const arts = arr(c.articles);
  e(arts.length >= 3, `articles < 3 (${arts.length})`);
  for (const a of arts) { e(a && a.title && HTTP.test(a.url || ""), `bad article url: ${a?.url}`); urlCount++; }
}

console.log(`  checked ${ids.length} concepts · ${lcCount} problems · ${urlCount} video/article links`);
console.log(`\n${failed ? "FAILURES: " + failed : passed + " checks passed."}\n`);
process.exit(process.exitCode || 0);
