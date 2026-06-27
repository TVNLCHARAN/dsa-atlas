// Application entry point. Boots the SQLite engine, builds the shell, wires routes.

import { h, clear, mount } from "../core/dom.js";
import { register, start, setNotFound, navigate } from "../core/router.js";
import { bus, EVENTS } from "../core/eventbus.js";
import store from "../services/store.js";
import { APP_NAME } from "../core/config.js";

import { createSidebar, toggleCollapse } from "./components/sidebar.js";
import { createTopbar } from "./components/topbar.js";
import { mountToasts, toast } from "./components/toast.js";
import { mountCommandPalette } from "./components/command-palette.js";
import { installShortcuts } from "./shortcuts.js";
import { emptyState } from "./components/ui.js";

import * as dashboard from "./pages/dashboard.js";
import * as roadmap from "./pages/roadmap.js";
import * as concept from "./pages/concept.js";
import * as problems from "./pages/problems.js";
import * as problemDetail from "./pages/problem-detail.js";
import * as addProblem from "./pages/add-problem.js";
import * as review from "./pages/review.js";
import * as analytics from "./pages/analytics.js";
import * as calendar from "./pages/calendar.js";
import * as timeline from "./pages/timeline.js";
import * as journal from "./pages/journal.js";
import * as goals from "./pages/goals.js";
import * as settings from "./pages/settings.js";
import * as searchResults from "./pages/search-results.js";

const ROUTES = [
  ["/", dashboard, "Dashboard"],
  ["/roadmap", roadmap, "Roadmap"],
  ["/concept/:id", concept, "Concept"],
  ["/problems", problems, "Problems"],
  ["/problem/:id", problemDetail, "Problem"],
  ["/add", addProblem, "Add problem"],
  ["/edit/:id", addProblem, "Edit problem"],
  ["/review", review, "Review"],
  ["/analytics", analytics, "Analytics"],
  ["/calendar", calendar, "Calendar"],
  ["/timeline", timeline, "Timeline"],
  ["/journal", journal, "Journal"],
  ["/goals", goals, "Goals"],
  ["/settings", settings, "Settings"],
  ["/search", searchResults, "Search"],
];

let viewEl, mainEl;

function renderPage(mod, ctx, label) {
  document.title = `${label} · ${APP_NAME}`;
  try {
    const page = mod.render(ctx);
    mount(viewEl, page);
  } catch (err) {
    console.error("[app] page render failed", err);
    mount(viewEl, h("div", { class: "page" }, emptyState({ iconName: "alert", title: "Something went wrong", message: String(err?.message || err) })));
  }
  if (mainEl) mainEl.scrollTop = 0;
}

function buildShell() {
  const app = document.getElementById("app");
  viewEl = h("main", { class: "view", id: "view" });
  mainEl = h("div", { class: "app-main" }, createTopbar(), viewEl);
  const shell = h("div", { class: "app-shell" },
    createSidebar(),
    mainEl,
    h("div", { class: "mobile-scrim", onClick: () => shell.classList.remove("mobile-open") })
  );
  mount(app, shell);

  if (store.setting("sidebarCollapsed")) shell.classList.add("is-collapsed");

  // Close mobile sidebar on navigation.
  bus.on(EVENTS.ROUTE, () => shell.classList.remove("mobile-open"));
}

function wireRoutes() {
  for (const [path, mod, label] of ROUTES) {
    register(path, (ctx) => renderPage(mod, ctx, label));
  }
  setNotFound(() => navigate("/"));
}

async function boot() {
  const splash = document.getElementById("splash");
  try {
    await store.bootstrap();
  } catch (err) {
    console.error(err);
    if (splash) splash.innerHTML = `<div class="splash-error"><h2>Couldn't start the database</h2><p>${String(err?.message || err)}</p><p class="muted">Make sure you opened the app through the launcher (a local server), not by double-clicking index.html directly.</p></div>`;
    return;
  }

  buildShell();
  mountToasts();
  mountCommandPalette();
  installShortcuts();
  wireRoutes();
  start();

  if (splash) splash.remove();

  // Periodic safety persist.
  setInterval(() => store.persist(), 60_000);
}

boot();
