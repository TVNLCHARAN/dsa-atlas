// Problem detail — the full record, code version history, review schedule, and actions.

import { h } from "../../core/dom.js";
import store from "../../services/store.js";
import { card, sectionHeader, button, breadcrumb, difficultyBadge, badge, iconButton, emptyState } from "../components/ui.js";
import { icon } from "../icons.js";
import { codeBlock } from "../components/code-block.js";
import { openModal, confirmModal } from "../components/modal.js";
import { toast } from "../components/toast.js";
import { navigate } from "../../core/router.js";
import { conceptName } from "../../data/roadmap.js";
import { LANGUAGE_LABEL } from "../../core/config.js";
import { ladderLabel } from "../../domain/review-engine.js";
import { formatDuration, formatDateHuman, formatDateShort, relativeDay, nowISO } from "../../core/dates.js";

function metaItem(label, value) {
  return h("div", { class: "meta-item" }, h("span", { class: "meta-label" }, label), h("span", { class: "meta-value" }, value));
}

function prose(title, text, iconName) {
  if (!text) return null;
  return card({ className: "prose-card" }, sectionHeader(title, { iconName }), h("p", { class: "prose" }, text));
}

function reviewCard(p, refresh) {
  const next = p.review_graduated ? "Graduated 🎓" : p.next_review_date ? `${relativeDay(p.next_review_date)} (${formatDateShort(p.next_review_date)})` : "Not scheduled";
  return card({ className: "review-status-card" },
    sectionHeader("Spaced repetition", { iconName: "review" }),
    h("div", { class: "review-status-grid" },
      metaItem("Stage", ladderLabel(p)),
      metaItem("Next review", next),
      metaItem("Last reviewed", p.last_reviewed_at ? formatDateShort(p.last_reviewed_at.slice(0, 10)) : "—"),
      metaItem("Reviews done", String(store.reviewHistory(p.id).length))
    ),
    h("div", { class: "review-status-actions" },
      button("Review now", { variant: "primary", iconName: "play", onClick: () => navigate(`/review?id=${p.id}`) }),
      iconButton("review", { title: p.need_review ? "Unflag review" : "Flag for review", active: p.need_review, onClick: () => { store.toggleNeedReview(p.id); refresh(); } })
    )
  );
}

function versionsCard(p, refresh) {
  const versions = store.codeVersions(p.id);
  const c = card({ className: "versions-card" });
  c.appendChild(sectionHeader("Code", { iconName: "code", sub: `${versions.length} saved version${versions.length === 1 ? "" : "s"}`, action: button("Save new version", { variant: "ghost", size: "sm", iconName: "add", onClick: () => openVersionModal(p, refresh) }) }));

  if (p.code) c.appendChild(codeBlock(p.code, p.language || "python", { title: `Current · ${LANGUAGE_LABEL[p.language] || p.language}` }));
  else c.appendChild(h("p", { class: "muted" }, "No solution code saved. Edit the problem to add it."));

  if (versions.length) {
    const hist = h("div", { class: "version-history" });
    versions.forEach((v) => {
      const open = h("div", { class: "version-body", style: { display: "none" } });
      const head = h("div", { class: "version-head is-clickable", onClick: () => { open.style.display = open.style.display === "none" ? "block" : "none"; } },
        icon("chevronRight", { size: 14 }),
        h("span", { class: "version-label" }, v.label || "Version"),
        h("span", { class: "version-meta" }, `${LANGUAGE_LABEL[v.language] || v.language || ""} · ${formatDateShort((v.created_at || "").slice(0, 10))}`),
        v.note ? h("span", { class: "version-note" }, v.note) : null,
        iconButton("trash", { title: "Delete version", onClick: (e) => { e.stopPropagation(); store.removeCodeVersion(v.id); refresh(); } })
      );
      open.appendChild(codeBlock(v.code, v.language || p.language));
      hist.appendChild(h("div", { class: "version-item" }, head, open));
    });
    c.appendChild(h("details", { class: "version-toggle", open: false },
      h("summary", {}, `Version history (${versions.length})`), hist));
  }
  return c;
}

function openVersionModal(p, refresh) {
  const labelSel = h("select", { class: "input select" },
    ...["Updated", "Revision", "Optimized", "Cleaner", "Original"].map((l) => h("option", { value: l }, l)));
  const codeTa = h("textarea", { class: "input code-area", rows: 12, placeholder: "Paste this version of the code…", spellcheck: "false" });
  const noteIn = h("input", { class: "input", placeholder: "Optional note (what changed?)" });
  const handle = openModal({
    title: "Save code version",
    size: "lg",
    content: h("div", { class: "form-grid-single" },
      h("label", { class: "field" }, h("span", { class: "field-label" }, "Label"), labelSel),
      h("label", { class: "field" }, h("span", { class: "field-label" }, "Note"), noteIn),
      h("label", { class: "field field--full" }, h("span", { class: "field-label" }, "Code"), codeTa)
    ),
    actions: [
      h("button", { class: "btn btn--ghost", onClick: () => handle.close() }, "Cancel"),
      h("button", { class: "btn btn--primary", onClick: () => {
        if (!codeTa.value.trim()) { toast("Add some code first", "error"); return; }
        store.addCodeVersion(p.id, { label: labelSel.value, language: p.language, code: codeTa.value, note: noteIn.value });
        toast("Version saved", "success");
        handle.close();
        refresh();
      } }, "Save version"),
    ],
  });
}

export function render({ params }) {
  const p = store.problem(params.id);
  if (!p) return h("div", { class: "page" }, emptyState({ iconName: "alert", title: "Problem not found", message: "It may have been deleted." }));

  const page = h("div", { class: "page problem-detail" });
  const refresh = () => page.replaceWith(render({ params }));

  page.appendChild(breadcrumb([{ label: "Home", href: "#/" }, { label: "Problems", href: "#/problems" }, { label: p.title }]));

  page.appendChild(
    h("div", { class: "page-head" },
      h("div", { class: "detail-title-wrap" },
        h("h1", { class: "page-title" }, p.title),
        h("div", { class: "detail-badges" },
          difficultyBadge(p.difficulty),
          p.platform ? badge(p.platform, "default") : null,
          p.concept_id ? h("a", { class: "concept-link", href: `#/concept/${p.concept_id}` }, conceptName(p.concept_id)) : null,
          p.favorite ? badge("★ favorite", "warning") : null
        )
      ),
      h("div", { class: "detail-actions" },
        p.problem_url ? button("Problem", { variant: "ghost", iconName: "external", onClick: () => window.open(p.problem_url, "_blank") }) : null,
        p.solution_url ? button("Solution", { variant: "ghost", iconName: "link", onClick: () => window.open(p.solution_url, "_blank") }) : null,
        iconButton("star", { title: "Favorite", active: p.favorite, onClick: () => { store.toggleFavorite(p.id); refresh(); } }),
        button("Edit", { variant: "default", iconName: "edit", onClick: () => navigate(`/edit/${p.id}`) }),
        iconButton("trash", { title: "Delete", onClick: () => confirmModal({ title: "Delete problem?", message: `"${p.title}" and its review history will be removed.`, confirmLabel: "Delete", danger: true, onConfirm: () => { store.deleteProblem(p.id); toast("Deleted", "success"); navigate("/problems"); } }) })
      )
    )
  );

  // Meta strip
  page.appendChild(card({ className: "meta-strip" },
    metaItem("Solved", formatDateHuman(p.solved_date)),
    metaItem("Time", formatDuration(p.time_taken_seconds)),
    metaItem("Attempts", String(p.attempts || 1)),
    metaItem("Confidence", `${p.confidence ?? "?"}/10`),
    metaItem("Rating", p.rating ? "★".repeat(p.rating) : "—"),
    metaItem("Independence", p.solved_without_help ? "Solo ✓" : p.used_hint ? "Hint" : p.read_editorial ? "Editorial" : "—"),
    p.time_complexity ? metaItem("Time cx", p.time_complexity) : null,
    p.space_complexity ? metaItem("Space cx", p.space_complexity) : null
  ));

  const grid = h("div", { class: "detail-grid" });
  const left = h("div", { class: "detail-col" });
  const right = h("div", { class: "detail-col" });

  left.appendChild(versionsCard(p, refresh));
  const approaches = [prose("Brute-force approach", p.brute_force, "layers"), prose("Optimized approach", p.optimized, "zap")].filter(Boolean);
  if (approaches.length) left.appendChild(h("div", { class: "stack" }, ...approaches));

  right.appendChild(reviewCard(p, refresh));
  const insights = [
    prose("Key insight", p.key_insight, "lightbulb"),
    prose("Recognition clue", p.recognition_clue, "eye"),
    prose("Mistakes made", p.mistakes, "alert"),
    prose("Alternative approaches", p.alternative_approaches, "layers"),
    prose("Edge cases missed", p.edge_cases_missed, "target"),
    prose("Notes", p.notes, "journal"),
  ].filter(Boolean);
  if (insights.length) right.appendChild(h("div", { class: "stack" }, ...insights));
  if ((p.tags || []).length) right.appendChild(card({}, sectionHeader("Tags", { iconName: "bookmark" }), h("div", { class: "row-tags" }, ...p.tags.map((t) => h("span", { class: "tag-chip" }, t)))));

  grid.appendChild(left);
  grid.appendChild(right);
  page.appendChild(grid);
  return page;
}
