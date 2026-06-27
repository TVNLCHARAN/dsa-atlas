// Add / Edit problem — the full capture form. Doubles as the edit form when given ?edit=ID.

import { h } from "../../core/dom.js";
import store from "../../services/store.js";
import { card, sectionHeader, button, breadcrumb, fieldRow } from "../components/ui.js";
import { icon } from "../icons.js";
import { toast } from "../components/toast.js";
import { navigate } from "../../core/router.js";
import { ROADMAP } from "../../data/roadmap.js";
import { DIFFICULTIES, PLATFORMS, LANGUAGES, LANGUAGE_LABEL } from "../../core/config.js";
import { today, secondsBetweenTimes, formatDuration } from "../../core/dates.js";

function input(attrs = {}) {
  return h("input", { class: "input", ...attrs });
}
function textarea(attrs = {}) {
  const ta = h("textarea", { class: "input textarea", rows: 3, ...attrs });
  return ta;
}
function select(options, value, attrs = {}) {
  return h("select", { class: "input select", ...attrs }, ...options.map((o) =>
    h("option", { value: o.v, selected: o.v === value }, o.l)));
}
function codeArea(value, onTab) {
  const ta = h("textarea", { class: "input code-area", rows: 14, spellcheck: "false", placeholder: "Paste your accepted solution…" });
  ta.value = value || "";
  ta.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const s = ta.selectionStart, en = ta.selectionEnd;
      ta.value = ta.value.slice(0, s) + "    " + ta.value.slice(en);
      ta.selectionStart = ta.selectionEnd = s + 4;
    }
  });
  return ta;
}

function ratingStars(initial, onChange) {
  let val = initial || 0;
  const wrap = h("div", { class: "star-rating" });
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const star = h("button", { type: "button", class: "star-btn", onClick: () => { val = i; paint(); onChange(val); } }, icon("star", { size: 20 }));
    stars.push(star);
    wrap.appendChild(star);
  }
  function paint() { stars.forEach((s, i) => s.classList.toggle("is-on", i < val)); }
  paint();
  return { wrap, get: () => val };
}

export function render({ query = {}, params = {} } = {}) {
  const editId = params.id || query.edit;
  const existing = editId ? store.problem(editId) : null;
  const isEdit = !!existing;
  const preConcept = query.concept || existing?.concept_id || store.currentConcept()?.id || "";

  const page = h("div", { class: "page add-problem-page" });
  page.appendChild(breadcrumb([{ label: "Home", href: "#/" }, { label: "Problems", href: "#/problems" }, { label: isEdit ? "Edit" : "Add problem" }]));
  page.appendChild(h("div", { class: "page-head" },
    h("div", {}, h("h1", { class: "page-title" }, isEdit ? "Edit problem" : "Log a solved problem"),
      h("p", { class: "page-sub" }, isEdit ? existing.title : "Capture everything while it's fresh — future-you will thank you."))
  ));

  // ---- field refs ----
  const f = {};
  f.title = input({ placeholder: "e.g. Longest Substring Without Repeating Characters", value: existing?.title || "", required: true });
  f.platform = select(PLATFORMS.map((p) => ({ v: p, l: p })), existing?.platform || "LeetCode");
  f.problem_url = input({ placeholder: "https://leetcode.com/problems/…", value: existing?.problem_url || "" });
  f.solution_url = input({ placeholder: "Link to your solution / writeup", value: existing?.solution_url || "" });
  f.difficulty = select(DIFFICULTIES.map((d) => ({ v: d, l: d })), existing?.difficulty || "Medium");
  f.concept_id = select([{ v: "", l: "— none —" }, ...ROADMAP.map((c) => ({ v: c.id, l: c.name }))], preConcept);
  f.sub_pattern = input({ placeholder: "e.g. variable-size window", value: existing?.sub_pattern || "" });
  f.solved_date = input({ type: "date", value: existing?.solved_date || today() });
  f.time_started = input({ type: "time", value: existing?.time_started || "" });
  f.time_finished = input({ type: "time", value: existing?.time_finished || "" });
  const timeTakenLabel = h("span", { class: "time-taken-display" }, existing ? formatDuration(existing.time_taken_seconds) : "—");
  f.time_taken_override = input({ type: "number", min: "0", placeholder: "min", style: { maxWidth: "100px" }, value: existing?.time_taken_seconds ? Math.round(existing.time_taken_seconds / 60) : "" });
  const recalc = () => {
    const sec = secondsBetweenTimes(f.time_started.value, f.time_finished.value);
    if (sec) { timeTakenLabel.textContent = formatDuration(sec); f.time_taken_override.value = Math.round(sec / 60); }
  };
  f.time_started.addEventListener("change", recalc);
  f.time_finished.addEventListener("change", recalc);

  f.attempts = input({ type: "number", min: "1", value: String(existing?.attempts || 1) });
  f.solved_without_help = checkbox("Solved without help", existing?.solved_without_help);
  f.used_hint = checkbox("Used a hint", existing?.used_hint);
  f.read_editorial = checkbox("Read the editorial", existing?.read_editorial);
  let ratingVal = existing?.rating || 0;
  const rating = ratingStars(ratingVal, (v) => (ratingVal = v));

  f.language = select(LANGUAGES.map((l) => ({ v: l, l: LANGUAGE_LABEL[l] })), existing?.language || store.setting("defaultLanguage", "python"));
  f.code = codeArea(existing?.code);
  f.brute_force = textarea({ placeholder: "Brute-force idea & its complexity…", value: existing?.brute_force || "" });
  f.optimized = textarea({ placeholder: "The optimized approach & why it works…", value: existing?.optimized || "" });
  f.time_complexity = input({ placeholder: "O(n)", value: existing?.time_complexity || "" });
  f.space_complexity = input({ placeholder: "O(1)", value: existing?.space_complexity || "" });

  f.key_insight = textarea({ placeholder: "The one idea that unlocked it…", value: existing?.key_insight || "" });
  f.recognition_clue = textarea({ placeholder: "What in the problem hinted at this pattern?", value: existing?.recognition_clue || "" });
  f.mistakes = textarea({ placeholder: "Where did you go wrong?", value: existing?.mistakes || "" });
  f.alternative_approaches = textarea({ placeholder: "Other valid approaches…", value: existing?.alternative_approaches || "" });
  f.edge_cases_missed = textarea({ placeholder: "Edge cases you missed…", value: existing?.edge_cases_missed || "" });

  let confVal = existing?.confidence ?? 6;
  const confSlider = input({ type: "range", min: "1", max: "10", value: String(confVal), class: "conf-slider" });
  const confOut = h("span", { class: "conf-label" }, `${confVal}/10`);
  confSlider.addEventListener("input", (e) => { confVal = Number(e.target.value); confOut.textContent = `${confVal}/10`; });

  f.need_review = checkbox("Schedule for review", existing ? existing.need_review : true);
  f.favorite = checkbox("Favorite ★", existing?.favorite);
  f.tags = input({ placeholder: "comma, separated, tags", value: (existing?.tags || []).join(", ") });
  f.notes = textarea({ placeholder: "Anything else worth remembering…", rows: 4, value: existing?.notes || "" });

  // ---- layout ----
  page.appendChild(card({ className: "form-card" },
    sectionHeader("Basics", { iconName: "problems" }),
    h("div", { class: "form-grid" },
      fieldRow("Problem title", f.title, { full: true }),
      fieldRow("Platform", f.platform),
      fieldRow("Difficulty", f.difficulty),
      fieldRow("Concept", f.concept_id),
      fieldRow("Sub-pattern", f.sub_pattern),
      fieldRow("Problem URL", f.problem_url, { full: true }),
      fieldRow("Solution URL", f.solution_url, { full: true })
    )
  ));

  page.appendChild(card({ className: "form-card" },
    sectionHeader("Timing & effort", { iconName: "clock" }),
    h("div", { class: "form-grid" },
      fieldRow("Date solved", f.solved_date),
      fieldRow("Time started", f.time_started),
      fieldRow("Time finished", f.time_finished),
      fieldRow("Time taken", h("div", { class: "time-taken-row" }, f.time_taken_override, h("span", { class: "muted" }, "min"), timeTakenLabel)),
      fieldRow("Attempts", f.attempts),
      fieldRow("Rating", rating.wrap)
    ),
    h("div", { class: "checkbox-row" }, f.solved_without_help.wrap, f.used_hint.wrap, f.read_editorial.wrap)
  ));

  page.appendChild(card({ className: "form-card" },
    sectionHeader("Solution & code", { iconName: "code" }),
    h("div", { class: "form-grid" },
      fieldRow("Language", f.language),
      fieldRow("Time complexity", f.time_complexity),
      fieldRow("Space complexity", f.space_complexity)
    ),
    fieldRow("Accepted solution", f.code, { full: true }),
    h("div", { class: "form-grid" },
      fieldRow("Brute-force approach", f.brute_force, { full: true }),
      fieldRow("Optimized approach", f.optimized, { full: true })
    )
  ));

  page.appendChild(card({ className: "form-card" },
    sectionHeader("Analysis & insights", { iconName: "lightbulb" }),
    h("div", { class: "form-grid" },
      fieldRow("Key insight", f.key_insight, { full: true }),
      fieldRow("Recognition clue", f.recognition_clue, { full: true }),
      fieldRow("Mistakes made", f.mistakes, { full: true }),
      fieldRow("Alternative approaches", f.alternative_approaches, { full: true }),
      fieldRow("Edge cases missed", f.edge_cases_missed, { full: true })
    )
  ));

  page.appendChild(card({ className: "form-card" },
    sectionHeader("Reflection & meta", { iconName: "brain" }),
    fieldRow("Confidence after solving", h("div", { class: "conf-control" }, confSlider, confOut)),
    h("div", { class: "checkbox-row" }, f.need_review.wrap, f.favorite.wrap),
    fieldRow("Tags", f.tags, { full: true }),
    fieldRow("Personal notes", f.notes, { full: true })
  ));

  const submit = () => {
    if (!f.title.value.trim()) { toast("Title is required", "error"); f.title.focus(); return; }
    const form = {
      title: f.title.value.trim(),
      platform: f.platform.value,
      problem_url: f.problem_url.value.trim(),
      solution_url: f.solution_url.value.trim(),
      difficulty: f.difficulty.value,
      concept_id: f.concept_id.value || null,
      sub_pattern: f.sub_pattern.value.trim(),
      solved_date: f.solved_date.value || today(),
      time_started: f.time_started.value,
      time_finished: f.time_finished.value,
      time_taken_seconds: f.time_taken_override.value ? Number(f.time_taken_override.value) * 60 : secondsBetweenTimes(f.time_started.value, f.time_finished.value),
      attempts: Number(f.attempts.value) || 1,
      solved_without_help: f.solved_without_help.get(),
      used_hint: f.used_hint.get(),
      read_editorial: f.read_editorial.get(),
      rating: rating.get() || null,
      language: f.language.value,
      code: f.code.value,
      brute_force: f.brute_force.value,
      optimized: f.optimized.value,
      time_complexity: f.time_complexity.value.trim(),
      space_complexity: f.space_complexity.value.trim(),
      key_insight: f.key_insight.value,
      recognition_clue: f.recognition_clue.value,
      mistakes: f.mistakes.value,
      alternative_approaches: f.alternative_approaches.value,
      edge_cases_missed: f.edge_cases_missed.value,
      confidence: confVal,
      need_review: f.need_review.get(),
      favorite: f.favorite.get(),
      tags: f.tags.value.split(",").map((t) => t.trim()).filter(Boolean),
      notes: f.notes.value,
    };
    if (isEdit) {
      store.updateProblem(existing.id, form);
      toast("Problem updated", "success");
      navigate(`/problem/${existing.id}`);
    } else {
      const id = store.addProblem(form);
      toast("Problem logged 🎉", "success");
      navigate(`/problem/${id}`);
    }
  };

  page.appendChild(h("div", { class: "form-actions sticky-actions" },
    button("Cancel", { variant: "ghost", onClick: () => history.back() }),
    button(isEdit ? "Save changes" : "Save problem", { variant: "primary", iconName: "check", onClick: submit })
  ));

  return page;
}

function checkbox(label, checked) {
  const box = h("input", { type: "checkbox", class: "checkbox" });
  box.checked = !!checked;
  const wrap = h("label", { class: "checkbox-label" }, box, h("span", {}, label));
  return { wrap, get: () => box.checked };
}
