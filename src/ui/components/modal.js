// Generic modal/dialog system. openModal returns a handle with .close().

import { h, clear } from "../../core/dom.js";
import { icon } from "../icons.js";

let portal;
const stack = [];

function ensurePortal() {
  if (!portal) {
    portal = h("div", { class: "modal-portal" });
    document.body.appendChild(portal);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && stack.length) {
        const top = stack[stack.length - 1];
        if (top.dismissable) top.close();
      }
    });
  }
  return portal;
}

export function openModal({ title = "", content, actions = [], size = "md", dismissable = true, onClose = null } = {}) {
  ensurePortal();
  const body = content instanceof Node ? content : h("div", { html: String(content ?? "") });

  const overlay = h("div", { class: "modal-overlay" });
  const footer = actions.length
    ? h("div", { class: "modal-footer" }, ...actions)
    : null;

  const dialog = h(
    "div",
    { class: `modal modal--${size}`, role: "dialog", "aria-modal": "true" },
    h("div", { class: "modal-header" },
      h("h3", { class: "modal-title" }, title),
      dismissable ? h("button", { class: "icon-btn icon-btn--ghost", onClick: () => handle.close(), title: "Close (Esc)" }, icon("x", { size: 18 })) : null
    ),
    h("div", { class: "modal-body" }, body),
    footer
  );
  overlay.appendChild(dialog);

  if (dismissable) {
    overlay.addEventListener("mousedown", (e) => {
      if (e.target === overlay) handle.close();
    });
  }

  const handle = {
    el: dialog,
    dismissable,
    close() {
      overlay.classList.remove("is-in");
      const idx = stack.indexOf(handle);
      if (idx >= 0) stack.splice(idx, 1);
      setTimeout(() => {
        overlay.remove();
        if (!stack.length && portal) clear(portal);
      }, 200);
      onClose?.();
    },
  };

  portal.appendChild(overlay);
  stack.push(handle);
  requestAnimationFrame(() => overlay.classList.add("is-in"));
  // Focus first input/button.
  setTimeout(() => dialog.querySelector("input, textarea, select, button")?.focus(), 60);
  return handle;
}

export function confirmModal({ title = "Are you sure?", message = "", confirmLabel = "Confirm", danger = false, onConfirm }) {
  const handle = openModal({
    title,
    size: "sm",
    content: h("p", { class: "modal-message" }, message),
    actions: [
      h("button", { class: "btn btn--ghost", onClick: () => handle.close() }, "Cancel"),
      h("button", {
        class: `btn ${danger ? "btn--danger" : "btn--primary"}`,
        onClick: () => { handle.close(); onConfirm?.(); },
      }, confirmLabel),
    ],
  });
  return handle;
}
