// Collapsible sidebar navigation. Highlights the active route and shows a live "due reviews"
// badge. Collapse state persists in settings.

import { h } from "../../core/dom.js";
import { icon } from "../icons.js";
import { bus, EVENTS } from "../../core/eventbus.js";
import { navigate, currentPath } from "../../core/router.js";
import store from "../../services/store.js";
import { APP_NAME } from "../../core/config.js";

const NAV = [
  { path: "/", label: "Dashboard", iconName: "dashboard", match: (p) => p === "/" },
  { path: "/roadmap", label: "Roadmap", iconName: "roadmap", match: (p) => p.startsWith("/roadmap") || p.startsWith("/concept") },
  { path: "/problems", label: "Problems", iconName: "problems", match: (p) => p.startsWith("/problems") || p.startsWith("/problem") },
  { path: "/review", label: "Review", iconName: "review", match: (p) => p.startsWith("/review"), badge: "due" },
  { path: "/analytics", label: "Analytics", iconName: "analytics", match: (p) => p.startsWith("/analytics") },
  { path: "/calendar", label: "Calendar", iconName: "calendar", match: (p) => p.startsWith("/calendar") },
  { path: "/timeline", label: "Timeline", iconName: "timeline", match: (p) => p.startsWith("/timeline") },
  { path: "/journal", label: "Journal", iconName: "journal", match: (p) => p.startsWith("/journal") },
  { path: "/goals", label: "Goals", iconName: "goals", match: (p) => p.startsWith("/goals") },
];

export function createSidebar() {
  const links = NAV.map((item) => {
    const badge = item.badge ? h("span", { class: "nav-badge", "data-badge": item.badge }) : null;
    const a = h(
      "a",
      { class: "nav-link", href: `#${item.path}`, "data-path": item.path, title: item.label },
      icon(item.iconName, { size: 18 }),
      h("span", { class: "nav-label" }, item.label),
      badge
    );
    a._match = item.match;
    return a;
  });

  const settingsLink = h(
    "a",
    { class: "nav-link", href: "#/settings", "data-path": "/settings", title: "Settings" },
    icon("settings", { size: 18 }),
    h("span", { class: "nav-label" }, "Settings")
  );
  settingsLink._match = (p) => p.startsWith("/settings");

  const collapseBtn = h(
    "button",
    { class: "sidebar-collapse", title: "Collapse sidebar (\\)", onClick: () => toggleCollapse() },
    icon("chevronLeft", { size: 18 })
  );

  const sidebar = h(
    "aside",
    { class: "sidebar" },
    h("div", { class: "sidebar-brand" },
      h("a", { class: "brand", href: "#/" },
        h("span", { class: "brand-mark" }, icon("brain", { size: 20 })),
        h("span", { class: "brand-name" }, APP_NAME)
      ),
      collapseBtn
    ),
    h("nav", { class: "nav-group" }, ...links),
    h("div", { class: "sidebar-foot" }, settingsLink)
  );

  function setActive(path) {
    [...links, settingsLink].forEach((a) => a.classList.toggle("is-active", a._match(path)));
  }
  function refreshBadges() {
    const due = store.dueReviews().length;
    sidebar.querySelectorAll('[data-badge="due"]').forEach((b) => {
      b.textContent = due ? String(due) : "";
      b.classList.toggle("is-empty", !due);
    });
  }

  bus.on(EVENTS.ROUTE, ({ path }) => setActive(path));
  bus.on(EVENTS.PROBLEMS, refreshBadges);
  bus.on(EVENTS.REVIEWS, refreshBadges);

  setActive(currentPath());
  refreshBadges();
  return sidebar;
}

export function toggleCollapse(force) {
  const shell = document.querySelector(".app-shell");
  const collapsed = force != null ? force : !shell.classList.contains("is-collapsed");
  shell.classList.toggle("is-collapsed", collapsed);
  store.setSetting("sidebarCollapsed", collapsed);
}
