// Toast notifications. Anything can call toast("Saved"); pages don't manage DOM lifecycle.

import { h } from "../../core/dom.js";
import { icon } from "../icons.js";
import { bus, EVENTS } from "../../core/eventbus.js";

let container;

const ICONS = { success: "check", error: "alert", info: "sparkles" };

export function mountToasts() {
  container = h("div", { class: "toast-container" });
  document.body.appendChild(container);
  bus.on(EVENTS.TOAST, ({ message, type }) => show(message, type));
}

function show(message, type = "info") {
  if (!container) return;
  const t = h(
    "div",
    { class: `toast toast--${type}` },
    icon(ICONS[type] || "sparkles", { size: 16 }),
    h("span", {}, message)
  );
  container.appendChild(t);
  requestAnimationFrame(() => t.classList.add("is-in"));
  setTimeout(() => {
    t.classList.remove("is-in");
    setTimeout(() => t.remove(), 250);
  }, 2600);
}

export function toast(message, type = "info") {
  bus.emit(EVENTS.TOAST, { message, type });
}
