// Global keyboard shortcuts. Vim-style "g <key>" jumps, single-key actions, and the
// command palette. Typing in inputs is respected (only Cmd/Ctrl+K and Esc pass through).

import { navigate } from "../core/router.js";
import { togglePalette, openPalette } from "./components/command-palette.js";
import { focusSearch } from "./components/topbar.js";
import { toggleCollapse } from "./components/sidebar.js";
import { openModal } from "./components/modal.js";
import { h } from "../core/dom.js";
import store from "../services/store.js";

const GOTO = {
  d: "/", r: "/roadmap", p: "/problems", v: "/review", a: "/analytics",
  c: "/calendar", t: "/timeline", j: "/journal", o: "/goals", s: "/settings",
};

const SHORTCUT_HELP = [
  ["Cmd / Ctrl + K", "Command palette"],
  ["/", "Focus search"],
  ["a", "Add a problem"],
  ["t", "Toggle theme"],
  ["\\", "Collapse sidebar"],
  ["?", "This help"],
  ["g then d", "Dashboard"],
  ["g then r", "Roadmap"],
  ["g then p", "Problems"],
  ["g then v", "Review"],
  ["g then a", "Analytics"],
  ["g then c", "Calendar"],
  ["g then t", "Timeline"],
  ["g then j", "Journal"],
  ["g then o", "Goals"],
  ["g then s", "Settings"],
];

let gPending = false;
let gTimer = null;

function inEditable(el) {
  return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
}

function showHelp() {
  openModal({
    title: "Keyboard shortcuts",
    size: "sm",
    content: h("div", { class: "shortcut-help" },
      ...SHORTCUT_HELP.map(([k, label]) =>
        h("div", { class: "shortcut-row" },
          h("span", { class: "shortcut-desc" }, label),
          h("kbd", {}, k)
        )
      )
    ),
  });
}

export function installShortcuts() {
  document.addEventListener("keydown", (e) => {
    const mod = e.metaKey || e.ctrlKey;

    if (mod && e.key.toLowerCase() === "k") {
      e.preventDefault();
      togglePalette();
      return;
    }
    if (inEditable(e.target)) return; // don't hijack typing
    if (e.altKey || e.ctrlKey || e.metaKey) return;

    if (gPending) {
      const dest = GOTO[e.key.toLowerCase()];
      gPending = false;
      clearTimeout(gTimer);
      if (dest) { e.preventDefault(); navigate(dest); }
      return;
    }

    switch (e.key) {
      case "g":
        gPending = true;
        gTimer = setTimeout(() => (gPending = false), 800);
        break;
      case "/":
        e.preventDefault();
        focusSearch();
        break;
      case "a":
        e.preventDefault();
        navigate("/add");
        break;
      case "t":
        store.toggleTheme();
        break;
      case "\\":
        e.preventDefault();
        toggleCollapse();
        break;
      case "?":
        e.preventDefault();
        showHelp();
        break;
    }
  });
}
