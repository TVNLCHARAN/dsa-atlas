// Hand-rolled SVG charts — zero dependencies, theme-aware via currentColor / CSS vars.
// Each function returns an SVG markup string; chartEl() wraps it in a sized element.

import { h } from "../../core/dom.js";
import { esc } from "../../core/dom.js";
import { addDays, parseDate } from "../../core/dates.js";

export function chartEl(svgString, className = "") {
  return h("div", { class: `chart ${className}`, html: svgString });
}

// ---------------------------------------------------------------- progress ring
export function ring(pct, { size = 120, stroke = 10, color = "var(--accent)", trackColor = "var(--ring-track)", label = null, sublabel = null } = {}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct || 0));
  const offset = c * (1 - clamped / 100);
  const cx = size / 2;
  return `
  <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="ring">
    <circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="${trackColor}" stroke-width="${stroke}"/>
    <circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}"
      stroke-linecap="round" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"
      transform="rotate(-90 ${cx} ${cx})" style="transition: stroke-dashoffset .8s cubic-bezier(.4,0,.2,1)"/>
    ${label != null ? `<text x="${cx}" y="${cx - 2}" text-anchor="middle" class="ring-label">${esc(label)}</text>` : ""}
    ${sublabel != null ? `<text x="${cx}" y="${cx + 16}" text-anchor="middle" class="ring-sub">${esc(sublabel)}</text>` : ""}
  </svg>`;
}

// ---------------------------------------------------------------- bar chart
export function bars(data, { height = 170, color = "var(--accent)", barWidth = 0, gap = 6, showValues = false, maxLabels = 12 } = {}) {
  if (!data.length) return emptyChart(height);
  const max = Math.max(1, ...data.map((d) => d.value));
  const n = data.length;
  const padL = 4, padR = 4, padB = 22, padT = 8;
  const innerW = 600;
  const bw = barWidth || (innerW - padL - padR - gap * (n - 1)) / n;
  const innerH = height - padB - padT;
  const labelEvery = Math.ceil(n / maxLabels);

  let rects = "";
  data.forEach((d, i) => {
    const x = padL + i * (bw + gap);
    const bh = (d.value / max) * innerH;
    const y = padT + innerH - bh;
    rects += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(0, bh).toFixed(1)}" rx="3" fill="${color}" class="bar"><title>${esc(d.label)}: ${d.value}</title></rect>`;
    if (showValues && d.value) rects += `<text x="${(x + bw / 2).toFixed(1)}" y="${(y - 4).toFixed(1)}" text-anchor="middle" class="bar-val">${d.value}</text>`;
    if (i % labelEvery === 0) rects += `<text x="${(x + bw / 2).toFixed(1)}" y="${height - 6}" text-anchor="middle" class="axis-label">${esc(d.label)}</text>`;
  });
  return `<svg viewBox="0 0 ${innerW} ${height}" preserveAspectRatio="none" width="100%" height="${height}" class="barchart">${rects}</svg>`;
}

// ---------------------------------------------------------------- line / area chart
export function line(series, { height = 170, color = "var(--accent)", area = true, maxLabels = 8, yMax = null } = {}) {
  const vals = series.map((s) => s.value);
  const present = vals.filter((v) => v != null);
  if (!present.length) return emptyChart(height);
  const max = yMax != null ? yMax : Math.max(1, ...present);
  const min = 0;
  const n = series.length;
  const innerW = 600;
  const padL = 6, padR = 6, padB = 22, padT = 10;
  const innerH = height - padB - padT;
  const xFor = (i) => padL + (i * (innerW - padL - padR)) / Math.max(1, n - 1);
  const yFor = (v) => padT + innerH - ((v - min) / (max - min || 1)) * innerH;

  let d = "";
  let started = false;
  const pts = [];
  series.forEach((s, i) => {
    if (s.value == null) { started = false; return; }
    const x = xFor(i), y = yFor(s.value);
    pts.push([x, y, i, s]);
    d += started ? ` L ${x.toFixed(1)} ${y.toFixed(1)}` : ` M ${x.toFixed(1)} ${y.toFixed(1)}`;
    started = true;
  });

  let areaPath = "";
  if (area && pts.length > 1) {
    const first = pts[0], last = pts[pts.length - 1];
    areaPath = `<path d="${d} L ${last[0].toFixed(1)} ${(padT + innerH).toFixed(1)} L ${first[0].toFixed(1)} ${(padT + innerH).toFixed(1)} Z" fill="url(#lg)" opacity="0.18"/>`;
  }
  const dots = pts.map(([x, y, , s]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.5" fill="${color}"><title>${esc(s.label)}: ${Math.round(s.value)}</title></circle>`).join("");
  const labelEvery = Math.ceil(n / maxLabels);
  const labels = series.map((s, i) => (i % labelEvery === 0 ? `<text x="${xFor(i).toFixed(1)}" y="${height - 6}" text-anchor="middle" class="axis-label">${esc(s.label)}</text>` : "")).join("");

  return `<svg viewBox="0 0 ${innerW} ${height}" preserveAspectRatio="none" width="100%" height="${height}" class="linechart">
    <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
    ${areaPath}
    <path d="${d}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}${labels}
  </svg>`;
}

// ---------------------------------------------------------------- donut
export function donut(segments, { size = 150, stroke = 22, gap = 0.02 } = {}) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  if (!total) return `<div class="chart-empty" style="height:${size}px">No data</div>`;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const cx = size / 2;
  let offsetAcc = 0;
  let arcs = "";
  segments.forEach((s) => {
    if (!s.value) return;
    const frac = s.value / total;
    const len = Math.max(0, frac - gap) * c;
    const dash = `${len.toFixed(2)} ${(c - len).toFixed(2)}`;
    const rot = offsetAcc * 360 - 90;
    arcs += `<circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="${s.color}" stroke-width="${stroke}" stroke-dasharray="${dash}" transform="rotate(${rot} ${cx} ${cx})"><title>${esc(s.label)}: ${s.value}</title></circle>`;
    offsetAcc += frac;
  });
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="donut">${arcs}
    <text x="${cx}" y="${cx - 1}" text-anchor="middle" class="ring-label">${total}</text>
    <text x="${cx}" y="${cx + 15}" text-anchor="middle" class="ring-sub">total</text></svg>`;
}

// ---------------------------------------------------------------- sparkline
export function sparkline(values, { width = 120, height = 32, color = "var(--accent)" } = {}) {
  if (!values.length) return "";
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const step = width / Math.max(1, values.length - 1);
  const d = values.map((v, i) => `${i === 0 ? "M" : "L"} ${(i * step).toFixed(1)} ${(height - ((v - min) / (max - min || 1)) * height).toFixed(1)}`).join(" ");
  return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" class="sparkline"><path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

// ---------------------------------------------------------------- calendar heatmap
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function heatmapCalendar(grid, { cell = 12, gap = 3, clickable = true } = {}) {
  const { cells, max, start } = grid;
  const startDow = parseDate(start).getDay(); // 0=Sun
  const totalSlots = startDow + cells.length;
  const cols = Math.ceil(totalSlots / 7);
  const w = cols * (cell + gap) + 30;
  const h = 7 * (cell + gap) + 20;

  const level = (count) => (count === 0 ? 0 : Math.min(4, Math.ceil((count / Math.max(1, max)) * 4)));

  let rects = "";
  let monthLabels = "";
  let lastMonth = -1;
  cells.forEach((c, i) => {
    const slot = startDow + i;
    const col = Math.floor(slot / 7);
    const row = slot % 7;
    const x = 30 + col * (cell + gap);
    const y = 14 + row * (cell + gap);
    rects += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="2.5" class="hm-cell hm-${level(c.count)}" data-date="${c.date}" data-count="${c.count}" ${clickable ? 'tabindex="0"' : ""}><title>${c.date}: ${c.count} ${c.count === 1 ? "activity" : "activities"}</title></rect>`;
    const m = parseDate(c.date).getMonth();
    if (row === 0 && m !== lastMonth) {
      monthLabels += `<text x="${x}" y="10" class="hm-month">${MONTHS[m]}</text>`;
      lastMonth = m;
    }
  });
  const dow = ["", "Mon", "", "Wed", "", "Fri", ""];
  const dowLabels = dow.map((d, i) => (d ? `<text x="0" y="${14 + i * (cell + gap) + cell - 2}" class="hm-dow">${d}</text>` : "")).join("");

  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" class="heatmap-svg">${monthLabels}${dowLabels}${rects}</svg>`;
}

function emptyChart(height) {
  return `<div class="chart-empty" style="height:${height}px">Not enough data yet</div>`;
}

// Legend helper for difficulty donut etc.
export function legend(items) {
  return h(
    "div",
    { class: "chart-legend" },
    ...items.map((it) =>
      h("div", { class: "legend-item" },
        h("span", { class: "legend-dot", style: { background: it.color } }),
        h("span", { class: "legend-label" }, it.label),
        it.value != null ? h("span", { class: "legend-value" }, String(it.value)) : null
      )
    )
  );
}
