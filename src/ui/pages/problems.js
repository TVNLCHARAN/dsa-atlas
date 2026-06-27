// Problems list with rich filtering, sorting and quick actions.

import { h, clear } from "../../core/dom.js";
import store from "../../services/store.js";
import { card, button, difficultyBadge, badge, emptyState, breadcrumb, iconButton, pill, tag } from "../components/ui.js";
import { icon } from "../icons.js";
import { navigate } from "../../core/router.js";
import { conceptName, ROADMAP } from "../../data/roadmap.js";
import { DIFFICULTIES, PLATFORMS } from "../../core/config.js";
import { formatDuration, formatDateShort, daysBetween, today } from "../../core/dates.js";

const state = {
  q: "", concept: "", difficulty: "", platform: "",
  favorite: false, needReview: false, editorial: false, independent: false,
  range: "all", sort: "recent",
};

function matches(p) {
  if (state.concept && p.concept_id !== state.concept) return false;
  if (state.difficulty && p.difficulty !== state.difficulty) return false;
  if (state.platform && p.platform !== state.platform) return false;
  if (state.favorite && !p.favorite) return false;
  if (state.needReview && !p.need_review) return false;
  if (state.editorial && !p.read_editorial) return false;
  if (state.independent && !p.solved_without_help) return false;
  if (state.range !== "all" && p.solved_date) {
    const days = { "7": 7, "30": 30, "90": 90 }[state.range];
    if (days && -daysBetween(p.solved_date, today()) > days) return false;
  }
  if (state.q) {
    const hay = `${p.title} ${p.sub_pattern || ""} ${(p.tags || []).join(" ")} ${conceptName(p.concept_id)}`.toLowerCase();
    if (!hay.includes(state.q.toLowerCase())) return false;
  }
  return true;
}

const DIFF_ORDER = { Easy: 0, Medium: 1, Hard: 2 };
function sortFn(a, b) {
  switch (state.sort) {
    case "oldest": return (a.solved_date || "").localeCompare(b.solved_date || "");
    case "timeDesc": return (b.time_taken_seconds || 0) - (a.time_taken_seconds || 0);
    case "timeAsc": return (a.time_taken_seconds || 0) - (b.time_taken_seconds || 0);
    case "confidence": return (b.confidence || 0) - (a.confidence || 0);
    case "difficulty": return (DIFF_ORDER[b.difficulty] ?? -1) - (DIFF_ORDER[a.difficulty] ?? -1);
    case "rating": return (b.rating || 0) - (a.rating || 0);
    default: return (b.solved_date || "").localeCompare(a.solved_date || "") || b.id - a.id;
  }
}

function row(p, onChange) {
  const fav = iconButton("star", { title: "Favorite", active: p.favorite, onClick: (e) => { e.stopPropagation(); store.toggleFavorite(p.id); onChange(); } });
  return h("div", { class: "problem-row is-clickable", onClick: () => navigate(`/problem/${p.id}`) },
    h("div", { class: "problem-row-main" },
      h("div", { class: "problem-row-title" }, p.title,
        p.problem_url ? h("a", { href: p.problem_url, target: "_blank", rel: "noopener", class: "ext-mini", onClick: (e) => e.stopPropagation(), title: "Open problem" }, icon("external", { size: 13 })) : null
      ),
      h("div", { class: "problem-row-sub" },
        h("span", {}, conceptName(p.concept_id)),
        p.sub_pattern ? h("span", { class: "dot-sep" }, p.sub_pattern) : null,
        h("span", { class: "dot-sep" }, formatDateShort(p.solved_date)),
        h("span", { class: "dot-sep" }, formatDuration(p.time_taken_seconds))
      )
    ),
    h("div", { class: "problem-row-meta" },
      ...(p.tags || []).slice(0, 2).map(tag),
      p.read_editorial ? badge("editorial", "warning") : null,
      p.need_review ? badge("review", "info") : null,
      h("span", { class: "conf-pill", title: "Confidence" }, `${p.confidence ?? "?"}/10`),
      difficultyBadge(p.difficulty),
      fav
    )
  );
}

export function render() {
  const page = h("div", { class: "page problems-page" });
  page.appendChild(breadcrumb([{ label: "Home", href: "#/" }, { label: "Problems" }]));

  const countEl = h("p", { class: "page-sub" });
  page.appendChild(
    h("div", { class: "page-head" },
      h("div", {}, h("h1", { class: "page-title" }, "Problems"), countEl),
      button("Add problem", { variant: "primary", iconName: "add", onClick: () => navigate("/add") })
    )
  );

  // Filter bar
  const search = h("input", { class: "input filter-search", placeholder: "Filter by title, tag, pattern…", value: state.q, oninput: (e) => { state.q = e.target.value; refresh(); } });
  const conceptSel = selectEl([{ v: "", l: "All concepts" }, ...ROADMAP.map((c) => ({ v: c.id, l: c.name }))], state.concept, (v) => { state.concept = v; refresh(); });
  const platformSel = selectEl([{ v: "", l: "All platforms" }, ...PLATFORMS.map((p) => ({ v: p, l: p }))], state.platform, (v) => { state.platform = v; refresh(); });
  const rangeSel = selectEl([{ v: "all", l: "All time" }, { v: "7", l: "Last 7 days" }, { v: "30", l: "Last 30 days" }, { v: "90", l: "Last 90 days" }], state.range, (v) => { state.range = v; refresh(); });
  const sortSel = selectEl([
    { v: "recent", l: "Newest first" }, { v: "oldest", l: "Oldest first" },
    { v: "timeDesc", l: "Slowest" }, { v: "timeAsc", l: "Fastest" },
    { v: "confidence", l: "Confidence" }, { v: "difficulty", l: "Difficulty" }, { v: "rating", l: "Rating" },
  ], state.sort, (v) => { state.sort = v; refresh(); });

  const diffPills = h("div", { class: "pill-row" },
    pill("All", { active: !state.difficulty, onClick: () => { state.difficulty = ""; refresh(); } }),
    ...DIFFICULTIES.map((d) => pill(d, { active: state.difficulty === d, onClick: () => { state.difficulty = state.difficulty === d ? "" : d; refresh(); } }))
  );
  const flagPills = h("div", { class: "pill-row" },
    pill("★ Favorites", { active: state.favorite, onClick: () => { state.favorite = !state.favorite; refresh(); } }),
    pill("Needs review", { active: state.needReview, onClick: () => { state.needReview = !state.needReview; refresh(); } }),
    pill("Used editorial", { active: state.editorial, onClick: () => { state.editorial = !state.editorial; refresh(); } }),
    pill("Solved alone", { active: state.independent, onClick: () => { state.independent = !state.independent; refresh(); } })
  );

  const filterBar = card({ className: "filter-bar" },
    h("div", { class: "filter-row" }, h("span", { class: "filter-ico" }, icon("search", { size: 16 })), search),
    h("div", { class: "filter-row filter-selects" }, conceptSel, platformSel, rangeSel, sortSel),
    h("div", { class: "filter-row" }, diffPills),
    h("div", { class: "filter-row" }, flagPills)
  );
  page.appendChild(filterBar);

  const listWrap = h("div", { class: "problem-list card" });
  page.appendChild(listWrap);

  function refresh() {
    const all = store.problems().filter(matches).sort(sortFn);
    countEl.textContent = `${all.length} of ${store.problems().length} problems`;
    clear(listWrap);
    if (!all.length) {
      listWrap.appendChild(emptyState({ iconName: "filter", title: "No matching problems", message: "Try clearing some filters." }));
      return;
    }
    all.forEach((p) => listWrap.appendChild(row(p, refresh)));
  }
  refresh();
  return page;
}

function selectEl(options, value, onChange) {
  const sel = h("select", { class: "input select", onchange: (e) => onChange(e.target.value) },
    ...options.map((o) => h("option", { value: o.v, selected: o.v === value }, o.l)));
  return sel;
}
