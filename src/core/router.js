// Hash-based client router. Works from a static server with zero config and supports
// deep links like #/concept/two-pointers and #/search?q=binary.

import { bus, EVENTS } from "./eventbus.js";

const routes = [];

/** register("/concept/:id", handler) — handler({ params, query, path }) */
export function register(pattern, handler) {
  const keys = [];
  const regex = new RegExp(
    "^" +
      pattern
        .replace(/\/$/, "")
        .replace(/:([A-Za-z0-9_]+)/g, (_, k) => {
          keys.push(k);
          return "([^/]+)";
        }) +
      "/?$"
  );
  routes.push({ regex, keys, handler, pattern });
}

function parse() {
  const raw = location.hash.replace(/^#/, "") || "/";
  const [path, queryStr] = raw.split("?");
  const query = {};
  if (queryStr) {
    for (const part of queryStr.split("&")) {
      const [k, v] = part.split("=");
      query[decodeURIComponent(k)] = decodeURIComponent(v || "");
    }
  }
  return { path: path || "/", query };
}

let notFound = () => {};
export function setNotFound(fn) {
  notFound = fn;
}

export function resolve() {
  const { path, query } = parse();
  for (const r of routes) {
    const m = path.match(r.regex);
    if (m) {
      const params = {};
      r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
      bus.emit(EVENTS.ROUTE, { path, params, query, pattern: r.pattern });
      r.handler({ params, query, path });
      return;
    }
  }
  notFound({ path, query });
}

export function start() {
  window.addEventListener("hashchange", resolve);
  resolve();
}

export function navigate(path) {
  if (location.hash === "#" + path) resolve();
  else location.hash = path;
}

export function currentPath() {
  return parse().path;
}
