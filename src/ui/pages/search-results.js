// Search results — instant global search across the whole knowledge base.

import { h, clear } from "../../core/dom.js";
import { globalSearch } from "../../services/search.js";
import { card, breadcrumb, emptyState, badge } from "../components/ui.js";
import { icon } from "../icons.js";
import { navigate } from "../../core/router.js";

export function render({ query = {} } = {}) {
  const page = h("div", { class: "page search-page" });
  page.appendChild(breadcrumb([{ label: "Home", href: "#/" }, { label: "Search" }]));

  const input = h("input", { class: "input search-big", placeholder: "Search problems, concepts, notes, code, insights…", value: query.q || "", spellcheck: "false" });
  page.appendChild(h("div", { class: "page-head" }, h("div", { class: "search-input-wrap" }, icon("search", { size: 20 }), input)));

  const results = h("div", { class: "search-results" });
  page.appendChild(results);

  function run() {
    const q = input.value.trim();
    clear(results);
    if (!q) { results.appendChild(emptyState({ iconName: "search", title: "Search everything", message: "Titles, concepts, tags, notes, mistakes, insights, recognition patterns, code and links." })); return; }
    const r = globalSearch(q);
    if (!r.total) { results.appendChild(emptyState({ iconName: "search", title: "No results", message: `Nothing matched “${q}”.` })); return; }

    results.appendChild(h("p", { class: "search-count" }, `${r.total} result${r.total === 1 ? "" : "s"} for “${q}”`));

    if (r.concepts.length) {
      results.appendChild(group("Concepts", r.concepts, "layers"));
    }
    if (r.problems.length) {
      results.appendChild(group("Problems", r.problems, "problems"));
    }
  }

  function group(label, items, iconName) {
    return card({ className: "search-group" },
      h("div", { class: "search-group-head" }, icon(iconName, { size: 16 }), h("span", {}, `${label} (${items.length})`)),
      ...items.map((it) =>
        h("div", { class: "search-result is-clickable", onClick: () => navigate(it.href.replace("#", "")) },
          h("div", { class: "search-result-main" },
            h("span", { class: "search-result-title" }, it.title),
            it.snippet ? h("span", { class: "search-result-snippet", html: highlight(it.snippet, input.value.trim()) }) : null
          ),
          h("span", { class: "search-result-sub" }, it.subtitle)
        ))
    );
  }

  input.addEventListener("input", run);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const first = results.querySelector(".search-result");
      first?.click();
    }
  });
  run();
  setTimeout(() => input.focus(), 40);
  return page;
}

function highlight(text, q) {
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  if (!q) return esc(text);
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return esc(text);
  return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) + "</mark>" + esc(text.slice(i + q.length));
}
