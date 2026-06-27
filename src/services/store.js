// Application store — the business-logic facade the UI talks to.
//
// It is the ONLY thing the UI imports for data. It composes the repository (storage) with
// the domain modules (review engine, roadmap logic, analytics), enforces cross-cutting rules
// (schedule a review when a problem is added, log activity, keep concept status coherent),
// and emits change events so views can re-render.

import repo from "../storage/repository.js";
import { initEngine, exportBytes, loadFromBytes, persistNow, exec } from "../core/db.js";
import { migrate } from "../storage/schema.js";
import { bus, EVENTS } from "../core/eventbus.js";
import { DEFAULT_SETTINGS, CONCEPT_STATUS, ACCENTS } from "../core/config.js";
import { ROADMAP } from "../data/roadmap.js";
import { today, nowISO, secondsBetweenTimes } from "../core/dates.js";
import { initialSchedule, applyReview, confidenceDelta, clampConfidence } from "../domain/review-engine.js";
import { planMarkCurrent, planComplete, planReopen } from "../domain/roadmap-logic.js";
import { computeAnalytics } from "../domain/analytics.js";

let _settings = { ...DEFAULT_SETTINGS };

export const store = {
  // ---------------------------------------------------------------- bootstrap
  async bootstrap() {
    await initEngine();
    migrate();
    this._seedConcepts();
    this._ensureSettings();
    _settings = { ...DEFAULT_SETTINGS, ...repo.settings.all() };
    this.applyTheme();
    await persistNow();
    return true;
  },

  _seedConcepts() {
    let anyCurrent = false;
    ROADMAP.forEach((c, i) => {
      if (!repo.concepts.exists(c.id)) {
        repo.concepts.insert({
          id: c.id,
          order_index: i,
          name: c.name,
          status: i === 0 ? CONCEPT_STATUS.CURRENT : CONCEPT_STATUS.LOCKED,
          confidence: 0,
          notebook: {},
        });
        if (i === 0) anyCurrent = true;
      }
    });
    if (!repo.concepts.currentId()) {
      const list = repo.concepts.list();
      const next = list.find((c) => c.status !== CONCEPT_STATUS.COMPLETED);
      if (next) repo.concepts.update(next.id, { status: CONCEPT_STATUS.CURRENT, started_at: today() });
    }
  },

  _ensureSettings() {
    const existing = repo.settings.all();
    for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
      if (!(k in existing)) repo.settings.set(k, v);
    }
  },

  // ---------------------------------------------------------------- settings
  settings() {
    return { ..._settings };
  },
  setting(key, fallback) {
    return key in _settings ? _settings[key] : fallback;
  },
  setSetting(key, value) {
    _settings[key] = value;
    repo.settings.set(key, value);
    bus.emit(EVENTS.SETTINGS, { key, value });
    if (key === "theme" || key === "accent") this.applyTheme();
  },
  applyTheme() {
    const root = document.documentElement;
    const dark = (_settings.theme || "dark") === "dark";
    root.setAttribute("data-theme", dark ? "dark" : "light");
    const accent = ACCENTS.find((a) => a.id === _settings.accent) || ACCENTS[0];
    root.style.setProperty("--accent", accent.value);
    // Swap the highlight.js theme stylesheet to match.
    const dl = document.getElementById("hljs-dark");
    const ll = document.getElementById("hljs-light");
    if (dl) dl.disabled = !dark;
    if (ll) ll.disabled = dark;
    bus.emit(EVENTS.THEME, _settings.theme);
  },
  toggleTheme() {
    this.setSetting("theme", _settings.theme === "dark" ? "light" : "dark");
  },

  // ---------------------------------------------------------------- concepts
  concepts() {
    return repo.concepts.list();
  },
  concept(id) {
    return repo.concepts.get(id);
  },
  currentConcept() {
    const id = repo.concepts.currentId();
    return id ? repo.concepts.get(id) : null;
  },
  _applyConceptPlan(plan) {
    for (const { id, fields } of plan) repo.concepts.update(id, fields);
  },
  markConceptCurrent(id) {
    this._applyConceptPlan(planMarkCurrent(repo.concepts.list(), id));
    this._logActivity({ type: "studied", ref_id: id, title: `Started ${repo.concepts.get(id)?.name}`, date: today() });
    bus.emit(EVENTS.CONCEPTS);
  },
  completeConcept(id, confidence) {
    this._applyConceptPlan(planComplete(repo.concepts.list(), id, confidence));
    this._logActivity({ type: "completed_concept", ref_id: id, title: `Completed ${repo.concepts.get(id)?.name}`, date: today() });
    bus.emit(EVENTS.CONCEPTS);
  },
  reopenConcept(id) {
    this._applyConceptPlan(planReopen(repo.concepts.list(), id));
    bus.emit(EVENTS.CONCEPTS);
  },
  setConceptConfidence(id, value) {
    repo.concepts.update(id, { confidence: Math.max(0, Math.min(100, Math.round(value))) });
    bus.emit(EVENTS.CONCEPTS);
  },
  moveConcept(id, dir) {
    const list = repo.concepts.list();
    const i = list.findIndex((c) => c.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    const a = list[i], b = list[j];
    repo.concepts.update(a.id, { order_index: b.order_index });
    repo.concepts.update(b.id, { order_index: a.order_index });
    bus.emit(EVENTS.CONCEPTS);
  },
  saveConceptNotebook(id, notebook) {
    repo.concepts.update(id, { notebook });
    bus.emit(EVENTS.CONCEPTS);
  },

  // ---------------------------------------------------------------- problems
  problems() {
    return repo.problems.all();
  },
  problem(id) {
    return repo.problems.get(Number(id));
  },
  problemsByConcept(conceptId) {
    return repo.problems.byConcept(conceptId);
  },

  addProblem(form) {
    const solved_date = form.solved_date || today();
    const time_taken_seconds =
      form.time_taken_seconds != null && form.time_taken_seconds !== ""
        ? Number(form.time_taken_seconds)
        : secondsBetweenTimes(form.time_started, form.time_finished);

    const intervals = _settings.reviewIntervals || DEFAULT_SETTINGS.reviewIntervals;
    const schedule = initialSchedule(solved_date, intervals);

    const record = {
      ...form,
      solved_date,
      time_taken_seconds,
      tags: Array.isArray(form.tags) ? form.tags : parseTags(form.tags),
      ...schedule,
    };
    delete record.id;
    const id = repo.problems.insert(record);

    if (form.code) {
      repo.codeVersions.add({ problem_id: id, label: "Original", language: form.language, code: form.code, note: "First accepted solution" });
    }
    this._logActivity({
      type: "solved",
      ref_id: String(id),
      title: form.title,
      detail: [form.difficulty, form.concept_id && conceptDisplay(form.concept_id)].filter(Boolean).join(" · "),
      date: solved_date,
      meta: { difficulty: form.difficulty, concept_id: form.concept_id },
    });

    // Keep the roadmap honest: studying a locked concept marks it current.
    if (form.concept_id) {
      const c = repo.concepts.get(form.concept_id);
      if (c && c.status === CONCEPT_STATUS.LOCKED) {
        this._applyConceptPlan(planMarkCurrent(repo.concepts.list(), form.concept_id));
      }
      // Seed concept confidence from first problem if untouched.
      if (c && (c.confidence == null || c.confidence === 0) && form.confidence) {
        repo.concepts.update(form.concept_id, { confidence: Math.round(form.confidence * 10) });
      }
    }

    bus.emit(EVENTS.PROBLEMS);
    bus.emit(EVENTS.CONCEPTS);
    return id;
  },

  updateProblem(id, fields) {
    repo.problems.update(Number(id), fields);
    bus.emit(EVENTS.PROBLEMS);
  },

  deleteProblem(id) {
    repo.problems.remove(Number(id));
    bus.emit(EVENTS.PROBLEMS);
  },

  toggleFavorite(id) {
    const p = this.problem(id);
    if (!p) return;
    repo.problems.update(p.id, { favorite: !p.favorite });
    bus.emit(EVENTS.PROBLEMS);
  },
  toggleNeedReview(id) {
    const p = this.problem(id);
    if (!p) return;
    repo.problems.update(p.id, { need_review: !p.need_review });
    bus.emit(EVENTS.PROBLEMS);
  },

  // ---------------------------------------------------------------- code versions
  codeVersions(problemId) {
    return repo.codeVersions.forProblem(Number(problemId));
  },
  addCodeVersion(problemId, { label, language, code, note }) {
    repo.codeVersions.add({ problem_id: Number(problemId), label, language, code, note });
    bus.emit(EVENTS.PROBLEMS);
  },
  removeCodeVersion(id) {
    repo.codeVersions.remove(Number(id));
    bus.emit(EVENTS.PROBLEMS);
  },

  // ---------------------------------------------------------------- reviews
  dueReviews(dateStr = today()) {
    return repo.problems.dueForReview(dateStr);
  },
  reviewHistory(problemId) {
    return repo.reviews.forProblem(Number(problemId));
  },
  submitReview(problemId, result, confidenceAfter) {
    const p = this.problem(problemId);
    if (!p) return;
    const intervals = _settings.reviewIntervals || DEFAULT_SETTINGS.reviewIntervals;
    const conf = confidenceAfter != null ? confidenceAfter : clampConfidence(p.confidence, confidenceDelta(result));
    const schedule = applyReview(p, result, intervals);

    repo.reviews.add({
      problem_id: p.id,
      due_date: p.next_review_date,
      interval_index: p.review_index,
      reviewed_at: nowISO(),
      result,
      confidence_after: conf,
    });
    repo.problems.update(p.id, { ...schedule, confidence: conf, last_reviewed_at: nowISO() });
    this._logActivity({
      type: "reviewed",
      ref_id: String(p.id),
      title: `Reviewed ${p.title}`,
      detail: result,
      date: today(),
      meta: { result },
    });
    bus.emit(EVENTS.REVIEWS);
    bus.emit(EVENTS.PROBLEMS);
  },

  // ---------------------------------------------------------------- journal
  journalAll() {
    return repo.journal.all();
  },
  journal(dateStr) {
    return repo.journal.forDate(dateStr);
  },
  saveJournal(dateStr, fields) {
    repo.journal.upsert(dateStr, fields);
    bus.emit(EVENTS.JOURNAL);
  },

  // ---------------------------------------------------------------- goals
  goals() {
    return repo.goals.all();
  },
  addGoal(goal) {
    repo.goals.insert(goal);
    bus.emit(EVENTS.GOALS);
  },
  updateGoal(id, fields) {
    repo.goals.update(Number(id), fields);
    bus.emit(EVENTS.GOALS);
  },
  deleteGoal(id) {
    repo.goals.remove(Number(id));
    bus.emit(EVENTS.GOALS);
  },

  // ---------------------------------------------------------------- activity / timeline
  activity() {
    return repo.activity.all();
  },
  activityForDate(d) {
    return repo.activity.forDate(d);
  },
  _logActivity(obj) {
    repo.activity.log(obj);
  },

  // ---------------------------------------------------------------- analytics / dashboard
  dataset() {
    return {
      problems: repo.problems.all(),
      reviews: repo.reviews.all(),
      journal: repo.journal.all(),
      concepts: repo.concepts.list(),
    };
  },
  analytics() {
    return computeAnalytics({ ...this.dataset(), ref: today() });
  },
  dashboard() {
    const ds = this.dataset();
    const analytics = computeAnalytics({ ...ds, ref: today() });
    return {
      analytics,
      concepts: ds.concepts,
      currentConcept: ds.concepts.find((c) => c.status === CONCEPT_STATUS.CURRENT) || null,
      due: repo.problems.dueForReview(today()),
      recent: repo.problems.recent(6),
      todayJournal: repo.journal.forDate(today()),
      goals: this.goalsWithProgress(analytics),
    };
  },

  goalsWithProgress(analytics = this.analytics()) {
    const goals = repo.goals.all();
    return goals.map((g) => {
      let current = 0;
      let target = g.target || 0;
      if (g.type === "problems_count") current = analytics.totals.problemsSolved;
      else if (g.type === "concepts_count") current = analytics.totals.conceptsCompleted;
      else if (g.type === "streak") current = analytics.streaks.longest;
      else if (g.type === "concept_complete") {
        const c = repo.concepts.get(g.concept_id);
        target = 1;
        current = c && c.status === CONCEPT_STATUS.COMPLETED ? 1 : 0;
      } else if (g.type === "custom") {
        current = Math.min(target, analytics.totals.problemsSolved);
      }
      const pct = target ? Math.min(100, (current / target) * 100) : 0;
      const done = target ? current >= target : false;
      if (done && !g.completed_at) repo.goals.update(g.id, { completed_at: today() });
      return { ...g, current, target, pct, done };
    });
  },

  // ---------------------------------------------------------------- backup / import
  exportDbBytes() {
    return exportBytes();
  },
  async importDbBytes(bytes) {
    loadFromBytes(bytes);
    migrate();
    this._seedConcepts();
    _settings = { ...DEFAULT_SETTINGS, ...repo.settings.all() };
    this.applyTheme();
    await persistNow();
    bus.emit(EVENTS.DATA_CHANGED);
    bus.emit(EVENTS.PROBLEMS);
    bus.emit(EVENTS.CONCEPTS);
  },
  async persist() {
    await persistNow();
  },

  /** Restore from a JSON backup produced by export.js (full repopulate). */
  async importBackup(backup) {
    const d = backup?.data;
    if (!d) throw new Error("Invalid backup: missing data");
    exec(
      "DELETE FROM problems; DELETE FROM concepts; DELETE FROM reviews; DELETE FROM journal;" +
      "DELETE FROM goals; DELETE FROM activity; DELETE FROM code_versions; DELETE FROM settings;"
    );
    (d.concepts || []).forEach((c) => repo.concepts.insert(c));
    (d.problems || []).forEach((p) => repo.problems.insert(p));
    (d.codeVersions || []).forEach((v) => repo.codeVersions.add(v));
    (d.reviews || []).forEach((r) => repo.reviews.add(r));
    (d.journal || []).forEach((j) => repo.journal.upsert(j.date, j));
    (d.goals || []).forEach((g) => repo.goals.insert(g));
    (d.activity || []).forEach((a) => repo.activity.log(a));
    Object.entries(d.settings || {}).forEach(([k, v]) => repo.settings.set(k, v));
    this._seedConcepts();
    _settings = { ...DEFAULT_SETTINGS, ...repo.settings.all() };
    this.applyTheme();
    await persistNow();
    bus.emit(EVENTS.DATA_CHANGED);
    bus.emit(EVENTS.PROBLEMS);
    bus.emit(EVENTS.CONCEPTS);
  },
};

function parseTags(str) {
  if (!str) return [];
  return String(str)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function conceptDisplay(id) {
  return ROADMAP.find((c) => c.id === id)?.name || id;
}
conceptDisplay.cache = null;

export default store;
