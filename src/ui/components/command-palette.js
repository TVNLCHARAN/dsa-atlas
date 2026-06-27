// Command palette (Cmd/Ctrl+K). Fuzzy-ish filtering over navigation, actions, concepts
// and a search fallback. Keyboard-first: arrows to move, Enter to run, Esc to close.

import { h, clear } from "../../core/dom.js";
import { icon } from "../icons.js";
import { navigate } from "../../core/router.js";
import store from "../../services/store.js";

let overlay, input, listEl;
let items = [];
let filtered = [];
let active = 0;
let open = false;

function baseCommands() {
  const cmds = [
    { id: "nav-dash", label: "Go to Dashboard", group: "Navigate", iconName: "dashboard", run: () => navigate("/") },
    { id: "nav-roadmap", label: "Go to Roadmap", group: "Navigate", iconName: "roadmap", run: () => navigate("/roadmap") },
    { id: "nav-problems", label: "Go to Problems", group: "Navigate", iconName: "problems", run: () => navigate("/problems") },
    { id: "nav-review", label: "Go to Review", group: "Navigate", iconName: "review", run: () => navigate("/review") },
    { id: "nav-analytics", label: "Go to Analytics", group: "Navigate", iconName: "analytics", run: () => navigate("/analytics") },
    { id: "nav-calendar", label: "Go to Calendar", group: "Navigate", iconName: "calendar", run: () => navigate("/calendar") },
    { id: "nav-timeline", label: "Go to Timeline", group: "Navigate", iconName: "timeline", run: () => navigate("/timeline") },
    { id: "nav-journal", label: "Go to Journal", group: "Navigate", iconName: "journal", run: () => navigate("/journal") },
    { id: "nav-goals", label: "Go to Goals", group: "Navigate", iconName: "goals", run: () => navigate("/goals") },
    { id: "nav-settings", label: "Go to Settings", group: "Navigate", iconName: "settings", run: () => navigate("/settings") },
    { id: "act-add", label: "Add a solved problem", group: "Actions", iconName: "add", run: () => navigate("/add") },
    { id: "act-journal", label: "Write today's journal", group: "Actions", iconName: "journal", run: () => navigate("/journal") },
    { id: "act-theme", label: "Toggle dark / light theme", group: "Actions", iconName: "moon", run: () => store.toggleTheme() },
  ];
  for (const c of store.concepts()) {
    cmds.push({ id: `concept-${c.id}`, label: c.name, sub: `Concept · ${c.status}`, group: "Concepts", iconName: "layers", run: () => navigate(`/concept/${c.id}`) });
  }
  return cmds;
}

function score(query, text) {
  text = text.toLowerCase();
  query = query.toLowerCase();
  if (!query) return 1;
  if (text.includes(query)) return 100 - text.indexOf(query);
  // subsequence match
  let qi = 0;
  for (let i = 0; i < text.length && qi < query.length; i++) if (text[i] === query[qi]) qi++;
  return qi === query.length ? 10 : -1;
}

function render() {
  clear(listEl);
  const q = input.value.trim();
  filtered = items
    .map((it) => ({ it, s: Math.max(score(q, it.label), score(q, it.sub || "") - 5) }))
    .filter((x) => x.s > -1)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.it);

  if (q && filtered.length === 0) {
    filtered = [{ id: "search", label: `Search for “${q}”`, group: "Search", iconName: "search", run: () => navigate(`/search?q=${encodeURIComponent(q)}`) }];
  } else if (q) {
    filtered.push({ id: "search", label: `Search everything for “${q}”`, group: "Search", iconName: "search", run: () => navigate(`/search?q=${encodeURIComponent(q)}`) });
  }

  active = Math.min(active, filtered.length - 1);
  if (active < 0) active = 0;

  let lastGroup = null;
  filtered.forEach((it, i) => {
    if (it.group !== lastGroup) {
      listEl.appendChild(h("div", { class: "cmd-group" }, it.group));
      lastGroup = it.group;
    }
    listEl.appendChild(
      h("div", {
        class: `cmd-item ${i === active ? "is-active" : ""}`,
        onMouseenter: () => { active = i; highlight(); },
        onClick: () => execute(i),
      },
        icon(it.iconName || "arrowRight", { size: 16 }),
        h("span", { class: "cmd-label" }, it.label),
        it.sub ? h("span", { class: "cmd-sub" }, it.sub) : null
      )
    );
  });
}

function highlight() {
  listEl.querySelectorAll(".cmd-item").forEach((el, i) => el.classList.toggle("is-active", i === active));
  listEl.querySelectorAll(".cmd-item")[active]?.scrollIntoView({ block: "nearest" });
}

function execute(i) {
  const it = filtered[i];
  if (!it) return;
  closePalette();
  it.run();
}

export function openPalette() {
  if (open) return;
  items = baseCommands();
  overlay.classList.add("is-in");
  open = true;
  input.value = "";
  active = 0;
  render();
  setTimeout(() => input.focus(), 30);
}

export function closePalette() {
  overlay.classList.remove("is-in");
  open = false;
}

export function togglePalette() {
  open ? closePalette() : openPalette();
}

export function mountCommandPalette() {
  input = h("input", { class: "cmd-input", placeholder: "Type a command or search…", spellcheck: "false", autocomplete: "off" });
  listEl = h("div", { class: "cmd-list" });
  const panel = h("div", { class: "cmd-panel" },
    h("div", { class: "cmd-input-row" }, icon("search", { size: 18 }), input),
    listEl,
    h("div", { class: "cmd-foot" },
      h("span", {}, h("kbd", {}, "↑"), h("kbd", {}, "↓"), " navigate"),
      h("span", {}, h("kbd", {}, "↵"), " select"),
      h("span", {}, h("kbd", {}, "esc"), " close")
    )
  );
  overlay = h("div", { class: "cmd-overlay" }, panel);
  overlay.addEventListener("mousedown", (e) => { if (e.target === overlay) closePalette(); });
  input.addEventListener("input", () => { active = 0; render(); });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); active = Math.min(active + 1, filtered.length - 1); highlight(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); active = Math.max(active - 1, 0); highlight(); }
    else if (e.key === "Enter") { e.preventDefault(); execute(active); }
    else if (e.key === "Escape") { e.preventDefault(); closePalette(); }
  });
  document.body.appendChild(overlay);
}
