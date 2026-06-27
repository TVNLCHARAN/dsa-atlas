// Export / backup service: JSON, CSV, Markdown, the raw .db file, and print-to-PDF.
// All client-side — nothing leaves the machine.

import repo from "../storage/repository.js";
import store from "./store.js";
import { APP_NAME, APP_VERSION } from "../core/config.js";
import { conceptName } from "../data/roadmap.js";
import { conceptContent } from "../data/content.js";
import { today, formatDateHuman, formatDuration } from "../core/dates.js";

export function triggerDownload(filename, content, mime = "application/octet-stream") {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function buildBackup() {
  return {
    app: APP_NAME,
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      concepts: repo.concepts.list(),
      problems: repo.problems.all(),
      reviews: repo.reviews.all(),
      journal: repo.journal.all(),
      goals: repo.goals.all(),
      activity: repo.activity.all(),
      settings: repo.settings.all(),
      codeVersions: repo.problems.all().flatMap((p) => repo.codeVersions.forProblem(p.id)),
    },
  };
}

export function exportJSON() {
  const json = JSON.stringify(buildBackup(), null, 2);
  triggerDownload(`dsa-atlas-${today()}.json`, json, "application/json");
}

export function exportDb() {
  const bytes = store.exportDbBytes();
  triggerDownload(`dsa-atlas-${today()}.db`, new Blob([bytes], { type: "application/x-sqlite3" }));
}

function csvEscape(v) {
  if (v == null) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export function exportCSV() {
  const cols = [
    "id", "title", "platform", "difficulty", "concept_id", "sub_pattern", "solved_date",
    "time_taken_seconds", "attempts", "rating", "confidence", "solved_without_help",
    "used_hint", "read_editorial", "need_review", "favorite", "language",
    "time_complexity", "space_complexity", "tags", "problem_url", "solution_url",
  ];
  const rows = repo.problems.all().map((p) =>
    cols.map((c) => csvEscape(c === "tags" ? (p.tags || []).join("; ") : p[c])).join(",")
  );
  const csv = [cols.join(","), ...rows].join("\n");
  triggerDownload(`dsa-atlas-problems-${today()}.csv`, csv, "text/csv");
}

export function buildMarkdown() {
  const concepts = repo.concepts.list();
  const problems = repo.problems.all();
  const byConcept = new Map();
  for (const p of problems) {
    const k = p.concept_id || "_unassigned";
    if (!byConcept.has(k)) byConcept.set(k, []);
    byConcept.get(k).push(p);
  }

  const lines = [];
  lines.push(`# ${APP_NAME} — Knowledge Base`);
  lines.push(`_Exported ${formatDateHuman(today())} · ${problems.length} problems · ${concepts.filter((c) => c.status === "completed").length}/${concepts.length} concepts complete_\n`);

  for (const c of concepts) {
    const ps = byConcept.get(c.id) || [];
    if (!ps.length && c.status === "locked" && c.confidence === 0) continue;
    lines.push(`\n## ${c.name}  \`${c.status}\` · confidence ${c.confidence}/100`);
    const content = conceptContent(c.id);
    if (content?.summary) lines.push(`\n_${content.summary}_`);
    const nb = c.notebook || {};
    for (const [label, key] of [["Recognition", "recognition"], ["Insights", "insights"], ["Common mistakes", "mistakes"], ["Observations", "observations"], ["Revision notes", "revisionNotes"]]) {
      if (nb[key]) lines.push(`\n**${label}:** ${Array.isArray(nb[key]) ? nb[key].join("; ") : nb[key]}`);
    }
    if (ps.length) {
      lines.push(`\n### Problems (${ps.length})`);
      for (const p of ps) {
        lines.push(`- **${p.title}** (${p.difficulty || "?"}) — ${formatDuration(p.time_taken_seconds)}, conf ${p.confidence ?? "?"}/10${p.favorite ? " ⭐" : ""}`);
        if (p.key_insight) lines.push(`  - 💡 ${p.key_insight}`);
        if (p.mistakes) lines.push(`  - ⚠️ ${p.mistakes}`);
      }
    }
  }
  return lines.join("\n");
}

export function exportMarkdown() {
  triggerDownload(`dsa-atlas-${today()}.md`, buildMarkdown(), "text/markdown");
}

/** PDF export = open the browser print dialog on a print-styled report (Save as PDF). */
export function exportPDF() {
  window.print();
}
