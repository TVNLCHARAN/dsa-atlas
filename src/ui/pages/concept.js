// Concept page — the per-topic "second brain". Reference content (static), a personal
// notebook (editable, auto-saved), problems solved under the topic, and confidence/status.

import { h, debounce } from "../../core/dom.js";
import store from "../../services/store.js";
import { card, sectionHeader, button, breadcrumb, difficultyBadge, emptyState, progressBar, badge } from "../components/ui.js";
import { icon } from "../icons.js";
import { codeBlock } from "../components/code-block.js";
import { ring, chartEl } from "../components/charts.js";
import { confirmModal } from "../components/modal.js";
import { toast } from "../components/toast.js";
import { navigate } from "../../core/router.js";
import { conceptContent } from "../../data/content.js";
import { mdToHtml } from "../../core/markdown.js";
import { CONCEPT_STATUS } from "../../core/config.js";
import { formatDuration, formatDateShort } from "../../core/dates.js";

let activeTab = "reference";

function bulletList(items, iconName = "dot") {
  return h("ul", { class: "bullet-list" },
    ...(items || []).map((t) => h("li", {}, h("span", { class: "bullet-ico" }, icon(iconName, { size: 14 })), h("span", {}, t)))
  );
}

function complexityTable(rows) {
  if (!rows?.length) return null;
  return h("div", { class: "table-wrap" },
    h("table", { class: "data-table" },
      h("thead", {}, h("tr", {}, h("th", {}, "Operation"), h("th", {}, "Time"), h("th", {}, "Space"), h("th", {}, "Note"))),
      h("tbody", {}, ...rows.map((r) =>
        h("tr", {}, h("td", {}, r.operation), h("td", {}, h("code", { class: "inline-code" }, r.time)), h("td", {}, h("code", { class: "inline-code" }, r.space)), h("td", { class: "muted" }, r.note || ""))
      ))
    )
  );
}

function linkList(items, iconName) {
  if (!items?.length) return h("p", { class: "muted" }, "None yet.");
  return h("div", { class: "ref-links" },
    ...items.map((r) =>
      h("a", { class: "ref-link", href: r.url, target: "_blank", rel: "noopener" },
        icon(iconName, { size: 15 }),
        h("span", { class: "ref-link-title" }, r.title),
        r.source ? h("span", { class: "ref-link-src" }, r.source) : null,
        icon("external", { size: 13 })
      )
    )
  );
}

function patternDefs(items) {
  return h("div", { class: "pattern-defs" },
    ...(items || []).map((p) =>
      h("div", { class: "pattern-def" },
        h("span", { class: "pattern-def-name" }, p.name),
        h("span", { class: "pattern-def-note" }, p.note || "")
      )
    )
  );
}

function coreProblems(items) {
  return h("div", { class: "core-problems" },
    ...(items || []).map((p, i) =>
      h("a", { class: "core-problem", href: p.url, target: "_blank", rel: "noopener" },
        h("span", { class: "core-problem-num" }, String(i + 1)),
        difficultyBadge(p.difficulty),
        h("div", { class: "core-problem-body" },
          h("span", { class: "core-problem-title" }, p.title),
          p.pattern ? h("span", { class: "core-problem-note" }, p.pattern) : null
        ),
        icon("external", { size: 14 })
      )
    )
  );
}

function referenceTab(content) {
  if (!content) return emptyState({ iconName: "book", title: "No reference content", message: "Reference material for this concept hasn't been added." });
  const wrap = h("div", { class: "concept-reference" });

  // Overview — markdown "how to think" explanation (falls back to plain paragraphs).
  const overviewCard = card({});
  overviewCard.appendChild(sectionHeader("Overview", { iconName: "book" }));
  if (content.overview) {
    overviewCard.appendChild(h("div", { class: "md prose-md", html: mdToHtml(content.overview) }));
  } else {
    (content.description || "").split("\n\n").forEach((p) => overviewCard.appendChild(h("p", { class: "prose" }, p)));
  }
  wrap.appendChild(overviewCard);

  if (content.patterns?.length) {
    wrap.appendChild(card({}, sectionHeader("Common patterns & variants", { iconName: "layers" }), patternDefs(content.patterns)));
  }

  const grid = h("div", { class: "concept-2col" });
  grid.appendChild(card({}, sectionHeader("Recognition patterns", { iconName: "eye" }), bulletList(content.recognition, "zap")));
  grid.appendChild(card({}, sectionHeader("Common mistakes", { iconName: "alert" }), bulletList(content.commonMistakes, "alert")));
  grid.appendChild(card({}, sectionHeader("When to use", { iconName: "check" }), bulletList(content.whenToUse, "check")));
  grid.appendChild(card({}, sectionHeader("When NOT to use", { iconName: "x" }), bulletList(content.whenNotToUse, "x")));
  wrap.appendChild(grid);

  if (content.complexity?.length) wrap.appendChild(card({}, sectionHeader("Complexity", { iconName: "clock" }), complexityTable(content.complexity)));
  if (content.edgeCases?.length) wrap.appendChild(card({}, sectionHeader("Edge cases to watch", { iconName: "target" }), bulletList(content.edgeCases, "alert")));

  if (content.template?.code) {
    const tc = card({});
    tc.appendChild(sectionHeader("Template", { iconName: "code", sub: "Reference implementation" }));
    tc.appendChild(codeBlock(content.template.code, content.template.language || "python"));
    wrap.appendChild(tc);
  }

  if (content.observations?.length) wrap.appendChild(card({}, sectionHeader("Key observations", { iconName: "lightbulb" }), bulletList(content.observations, "lightbulb")));

  if (content.problems?.length) {
    wrap.appendChild(card({}, sectionHeader("Core problems to master", { iconName: "problems", sub: "Different variants, easy → hard" }), coreProblems(content.problems)));
  }

  const refs = h("div", { class: "concept-2col" });
  refs.appendChild(card({}, sectionHeader("Videos", { iconName: "play" }), linkList(content.videos, "play")));
  refs.appendChild(card({}, sectionHeader("Articles", { iconName: "book" }), linkList(content.articles, "link")));
  wrap.appendChild(refs);

  return wrap;
}

const NOTEBOOK_FIELDS = [
  { key: "recognition", label: "Recognition patterns", placeholder: "How do I spot this pattern in a problem statement?" },
  { key: "insights", label: "Insights", placeholder: "The mental model that makes this click…" },
  { key: "mistakes", label: "Common mistakes I make", placeholder: "Off-by-one, forgetting to reset state…" },
  { key: "questions", label: "Open questions", placeholder: "Things I still don't fully understand…" },
  { key: "observations", label: "My observations", placeholder: "Patterns I've noticed across problems…" },
  { key: "revisionNotes", label: "Revision notes", placeholder: "Quick refresher for next time…" },
];

function notebookTab(concept) {
  const nb = { ...(concept.notebook || {}) };
  const save = debounce(() => { store.saveConceptNotebook(concept.id, nb); }, 600);

  const wrap = h("div", { class: "concept-notebook" });
  wrap.appendChild(h("p", { class: "muted notebook-hint" }, h("span", {}, icon("sparkles", { size: 14 })), " Auto-saves as you type. This is your personal space for this concept."));

  const grid = h("div", { class: "notebook-grid" });
  for (const f of NOTEBOOK_FIELDS) {
    const ta = h("textarea", {
      class: "notebook-textarea", rows: 5, placeholder: f.placeholder,
      oninput: (e) => { nb[f.key] = e.target.value; save(); },
    });
    ta.value = nb[f.key] || "";
    grid.appendChild(card({ className: "notebook-card" }, h("label", { class: "notebook-label" }, f.label), ta));
  }
  wrap.appendChild(grid);
  return wrap;
}

function problemsTab(concept) {
  const problems = store.problemsByConcept(concept.id);
  const wrap = h("div", { class: "concept-problems" });
  wrap.appendChild(
    h("div", { class: "between" },
      h("p", { class: "muted" }, `${problems.length} problem${problems.length === 1 ? "" : "s"} under ${concept.name}`),
      button("Add problem", { variant: "primary", iconName: "add", size: "sm", onClick: () => navigate(`/add?concept=${concept.id}`) })
    )
  );
  if (!problems.length) {
    wrap.appendChild(emptyState({ iconName: "add", title: "No problems yet", message: "Log a problem to start tracking this concept." }));
    return wrap;
  }
  wrap.appendChild(h("div", { class: "list card" },
    ...problems.map((p) =>
      h("div", { class: "list-row is-clickable", onClick: () => navigate(`/problem/${p.id}`) },
        h("div", { class: "list-row-main" },
          h("span", { class: "list-row-title" }, p.favorite ? "★ " + p.title : p.title),
          h("span", { class: "list-row-sub" }, `${p.sub_pattern || "—"} · ${formatDateShort(p.solved_date)} · ${formatDuration(p.time_taken_seconds)} · conf ${p.confidence ?? "?"}/10`)
        ),
        h("div", { class: "row-tags" },
          p.need_review ? badge("review", "warning") : null,
          difficultyBadge(p.difficulty)
        )
      )
    )
  ));
  return wrap;
}

export function render({ params }) {
  const concept = store.concept(params.id);
  if (!concept) {
    return h("div", { class: "page" }, emptyState({ iconName: "alert", title: "Concept not found", message: params.id }));
  }
  const content = conceptContent(concept.id);
  const stat = store.analytics().conceptStats.find((s) => s.id === concept.id) || { solved: 0 };

  const page = h("div", { class: "page concept-page" });
  page.appendChild(breadcrumb([{ label: "Home", href: "#/" }, { label: "Roadmap", href: "#/roadmap" }, { label: concept.name }]));

  // Hero
  const statusTag = h("span", { class: `status-tag status-tag--${concept.status}` }, concept.status);
  const actions = h("div", { class: "concept-actions" });
  if (concept.status !== CONCEPT_STATUS.CURRENT && concept.status !== CONCEPT_STATUS.COMPLETED)
    actions.appendChild(button("Set as current", { variant: "default", iconName: "play", onClick: () => { store.markConceptCurrent(concept.id); toast("Marked as current concept", "success"); rerender(page, params); } }));
  if (concept.status !== CONCEPT_STATUS.COMPLETED)
    actions.appendChild(button("Mark complete", { variant: "primary", iconName: "check", onClick: () => { store.completeConcept(concept.id, Math.max(concept.confidence, 70)); toast(`${concept.name} completed 🎉`, "success"); rerender(page, params); } }));
  else
    actions.appendChild(button("Reopen", { variant: "ghost", iconName: "review", onClick: () => { store.reopenConcept(concept.id); rerender(page, params); } }));

  const confInput = h("input", { type: "range", min: "0", max: "100", value: String(concept.confidence || 0), class: "conf-slider" });
  const confLabel = h("span", { class: "conf-label" }, `${concept.confidence || 0}%`);
  const ringWrap = chartEl(ring(concept.confidence || 0, { size: 96, stroke: 10, label: `${concept.confidence || 0}%`, sublabel: "confidence" }), "concept-ring");
  confInput.addEventListener("input", (e) => {
    const v = Number(e.target.value);
    confLabel.textContent = `${v}%`;
    ringWrap.replaceChildren();
    ringWrap.innerHTML = ring(v, { size: 96, stroke: 10, label: `${v}%`, sublabel: "confidence" });
  });
  confInput.addEventListener("change", (e) => { store.setConceptConfidence(concept.id, Number(e.target.value)); toast("Confidence updated", "success"); });

  page.appendChild(
    card({ className: "concept-hero" },
      h("div", { class: "concept-hero-left" },
        h("div", { class: "concept-hero-top" }, h("h1", { class: "concept-title" }, concept.name), statusTag),
        content?.summary ? h("p", { class: "concept-summary" }, content.summary) : null,
        h("div", { class: "concept-hero-stats" },
          h("div", { class: "mini-stat" }, h("span", { class: "mini-stat-val" }, stat.solved), h("span", { class: "mini-stat-label" }, "solved")),
          h("div", { class: "mini-stat" }, h("span", { class: "mini-stat-val" }, `${Math.round(stat.editorialPct || 0)}%`), h("span", { class: "mini-stat-label" }, "used editorial")),
          h("div", { class: "mini-stat" }, h("span", { class: "mini-stat-val" }, formatDuration(stat.avgTimeSec)), h("span", { class: "mini-stat-label" }, "avg time"))
        ),
        h("div", { class: "conf-control" }, h("span", { class: "field-label" }, "Self-rated confidence"), confInput, confLabel),
        actions
      ),
      h("div", { class: "concept-hero-right" }, ringWrap)
    )
  );

  // Tabs
  const tabs = ["reference", "notebook", "problems"];
  const tabLabels = { reference: "Reference", notebook: "My Notebook", problems: `Problems (${stat.solved})` };
  const tabBar = h("div", { class: "tab-bar" },
    ...tabs.map((t) => h("button", { class: `tab ${activeTab === t ? "is-active" : ""}`, onClick: () => { activeTab = t; rerender(page, params); } }, tabLabels[t]))
  );
  page.appendChild(tabBar);

  const body = h("div", { class: "tab-body" });
  if (activeTab === "reference") body.appendChild(referenceTab(content));
  else if (activeTab === "notebook") body.appendChild(notebookTab(concept));
  else body.appendChild(problemsTab(concept));
  page.appendChild(body);

  return page;
}

function rerender(oldPage, params) {
  const fresh = render({ params });
  oldPage.replaceWith(fresh);
}
