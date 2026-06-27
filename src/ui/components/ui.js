// Shared presentational primitives. Small, composable, framework-free.

import { h } from "../../core/dom.js";
import { icon } from "../icons.js";

export function card(attrs = {}, ...children) {
  const { className = "", ...rest } = attrs;
  return h("div", { class: `card ${className}`, ...rest }, ...children);
}

export function sectionHeader(title, { action = null, sub = null, iconName = null } = {}) {
  return h(
    "div",
    { class: "section-header" },
    h("div", { class: "section-header-left" },
      iconName ? h("span", { class: "section-header-icon" }, icon(iconName, { size: 16 })) : null,
      h("div", {},
        h("h2", { class: "section-title" }, title),
        sub ? h("p", { class: "section-sub" }, sub) : null
      )
    ),
    action || null
  );
}

export function statCard({ label, value, sub = null, iconName = null, accent = false, onClick = null }) {
  return h(
    "button",
    { class: `stat-card ${accent ? "stat-card--accent" : ""} ${onClick ? "is-clickable" : ""}`, onClick: onClick || undefined, type: "button" },
    iconName ? h("span", { class: "stat-icon" }, icon(iconName, { size: 18 })) : null,
    h("div", { class: "stat-body" },
      h("div", { class: "stat-value" }, String(value)),
      h("div", { class: "stat-label" }, label),
      sub != null ? h("div", { class: "stat-sub" }, sub) : null
    )
  );
}

export function badge(text, variant = "default") {
  return h("span", { class: `badge badge--${variant}` }, text);
}

export function difficultyBadge(diff) {
  const v = { Easy: "easy", Medium: "medium", Hard: "hard" }[diff] || "default";
  return badge(diff || "—", v);
}

export function button(label, { variant = "default", iconName = null, onClick = null, type = "button", size = "", title = "" } = {}) {
  return h(
    "button",
    { class: `btn btn--${variant} ${size ? "btn--" + size : ""}`, type, onClick: onClick || undefined, title },
    iconName ? icon(iconName, { size: 16 }) : null,
    label ? h("span", {}, label) : null
  );
}

export function iconButton(iconName, { onClick, title = "", variant = "ghost", active = false } = {}) {
  return h(
    "button",
    { class: `icon-btn icon-btn--${variant} ${active ? "is-active" : ""}`, title, "aria-label": title, onClick: onClick || undefined, type: "button" },
    icon(iconName, { size: 18 })
  );
}

export function progressBar(pct, { className = "", color = "var(--accent)" } = {}) {
  const clamped = Math.max(0, Math.min(100, pct || 0));
  return h(
    "div",
    { class: `progress ${className}` },
    h("div", { class: "progress-fill", style: { width: `${clamped}%`, background: color } })
  );
}

export function emptyState({ iconName = "sparkles", title, message, action = null }) {
  return h(
    "div",
    { class: "empty-state" },
    h("div", { class: "empty-icon" }, icon(iconName, { size: 28 })),
    h("h3", {}, title),
    message ? h("p", {}, message) : null,
    action || null
  );
}

export function pill(text, { onClick = null, active = false } = {}) {
  return h("button", { class: `pill ${active ? "is-active" : ""}`, type: "button", onClick: onClick || undefined }, text);
}

export function kbd(...keys) {
  return h("span", { class: "kbd-group" }, ...keys.map((k) => h("kbd", {}, k)));
}

export function spinner() {
  return h("div", { class: "spinner" });
}

export function tag(text) {
  return h("span", { class: "tag-chip" }, text);
}

export function fieldRow(label, control, { hint = null, full = false } = {}) {
  return h(
    "label",
    { class: `field ${full ? "field--full" : ""}` },
    h("span", { class: "field-label" }, label),
    control,
    hint ? h("span", { class: "field-hint" }, hint) : null
  );
}

export function breadcrumb(items) {
  const nodes = [];
  items.forEach((it, i) => {
    nodes.push(it.href ? h("a", { class: "crumb", href: it.href }, it.label) : h("span", { class: "crumb crumb--current" }, it.label));
    if (i < items.length - 1) nodes.push(h("span", { class: "crumb-sep" }, icon("chevronRight", { size: 13 })));
  });
  return h("nav", { class: "breadcrumb" }, ...nodes);
}
