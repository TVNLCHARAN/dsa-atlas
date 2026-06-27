// Global search across problems, concepts, notebooks, notes, mistakes, insights, code,
// tags and reference links. Dataset is small (a personal corpus), so a linear scan with
// snippet extraction is instant and avoids an FTS dependency.

import repo from "../storage/repository.js";
import { conceptName } from "../data/roadmap.js";
import { searchableConceptText } from "../data/content.js";

function snippet(haystack, q, span = 60) {
  const i = haystack.toLowerCase().indexOf(q);
  if (i < 0) return "";
  const start = Math.max(0, i - span);
  const end = Math.min(haystack.length, i + q.length + span);
  return (start > 0 ? "…" : "") + haystack.slice(start, end).replace(/\s+/g, " ").trim() + (end < haystack.length ? "…" : "");
}

export function globalSearch(query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return { problems: [], concepts: [], total: 0 };

  const problems = [];
  for (const p of repo.problems.all()) {
    const hay = [
      p.title, p.notes, p.mistakes, p.key_insight, p.recognition_clue,
      p.alternative_approaches, p.edge_cases_missed, p.code, p.brute_force, p.optimized,
      p.sub_pattern, (p.tags || []).join(" "), conceptName(p.concept_id),
      p.problem_url, p.solution_url, p.time_complexity, p.space_complexity,
    ].filter(Boolean).join("\n");
    if (hay.toLowerCase().includes(q)) {
      problems.push({
        type: "problem",
        id: p.id,
        title: p.title,
        subtitle: [p.difficulty, conceptName(p.concept_id)].filter(Boolean).join(" · "),
        href: `#/problem/${p.id}`,
        snippet: snippet(hay, q),
        favorite: p.favorite,
      });
    }
  }

  const concepts = [];
  for (const c of repo.concepts.list()) {
    const notebook = c.notebook || {};
    const notebookText = Object.values(notebook)
      .map((v) => (Array.isArray(v) ? v.join(" ") : typeof v === "string" ? v : ""))
      .join("\n");
    const hay = [c.name, notebookText, searchableConceptText(c.id)].filter(Boolean).join("\n");
    if (hay.toLowerCase().includes(q)) {
      concepts.push({
        type: "concept",
        id: c.id,
        title: c.name,
        subtitle: `Concept · ${c.status}`,
        href: `#/concept/${c.id}`,
        snippet: snippet(hay, q),
      });
    }
  }

  return { problems, concepts, total: problems.length + concepts.length };
}
