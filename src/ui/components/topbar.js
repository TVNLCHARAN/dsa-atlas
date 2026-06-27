// Sticky top navigation: persistent global search, command palette trigger, theme toggle,
// quick "Add problem". Mobile menu button toggles the sidebar.

import { h } from "../../core/dom.js";
import { icon } from "../icons.js";
import { navigate } from "../../core/router.js";
import { openPalette } from "./command-palette.js";
import store from "../../services/store.js";
import { bus, EVENTS } from "../../core/eventbus.js";

export function createTopbar() {
  const search = h("input", {
    class: "topbar-search-input",
    type: "search",
    placeholder: "Search problems, concepts, notes…",
    spellcheck: "false",
    onKeydown: (e) => {
      if (e.key === "Enter" && search.value.trim()) navigate(`/search?q=${encodeURIComponent(search.value.trim())}`);
      if (e.key === "Escape") search.blur();
    },
  });
  search._isSearch = true;

  const themeBtn = h(
    "button",
    { class: "icon-btn icon-btn--ghost", title: "Toggle theme (t)", onClick: () => store.toggleTheme() },
    icon(store.setting("theme") === "dark" ? "sun" : "moon", { size: 18 })
  );
  const syncTheme = () => {
    themeBtn.replaceChildren(icon(store.setting("theme") === "dark" ? "sun" : "moon", { size: 18 }));
  };
  bus.on(EVENTS.THEME, syncTheme);

  const menuBtn = h(
    "button",
    { class: "icon-btn icon-btn--ghost topbar-menu", title: "Menu", onClick: () => document.querySelector(".app-shell")?.classList.toggle("mobile-open") },
    icon("menu", { size: 20 })
  );

  return h(
    "header",
    { class: "topbar" },
    menuBtn,
    h("div", { class: "topbar-search", onClick: () => search.focus() },
      icon("search", { size: 16 }),
      search,
      h("span", { class: "topbar-search-hint" }, h("kbd", {}, "/"))
    ),
    h("div", { class: "topbar-actions" },
      h("button", { class: "cmd-trigger", title: "Command palette (Ctrl/Cmd K)", onClick: () => openPalette() },
        icon("command", { size: 14 }), h("span", {}, "K")
      ),
      themeBtn,
      h("button", { class: "btn btn--primary btn--sm", onClick: () => navigate("/add") },
        icon("add", { size: 16 }), h("span", {}, "Add problem")
      )
    )
  );
}

/** Focus the global search box (used by the "/" shortcut). */
export function focusSearch() {
  document.querySelector(".topbar-search-input")?.focus();
}
