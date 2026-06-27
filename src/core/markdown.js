// Tiny, safe Markdown -> HTML renderer for concept overviews. Supports headings, bold,
// italics, inline code, links, ordered/unordered lists, and fenced code blocks. HTML is
// escaped first, so user/agent content can't inject markup.

function escapeHtml(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

function inline(s) {
  return escapeHtml(s)
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

const isBlank = (l) => /^\s*$/.test(l);
const isHeading = (l) => /^(#{1,4})\s/.test(l);
const isUl = (l) => /^\s*[-*]\s+/.test(l);
const isOl = (l) => /^\s*\d+\.\s+/.test(l);
const isFence = (l) => /^\s*```/.test(l);

export function mdToHtml(md) {
  if (!md) return "";
  const lines = String(md).split(/\r?\n/);
  let html = "";
  let inUl = false, inOl = false;
  const closeLists = () => {
    if (inUl) { html += "</ul>"; inUl = false; }
    if (inOl) { html += "</ol>"; inOl = false; }
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (isFence(line)) {
      closeLists();
      i++;
      const code = [];
      while (i < lines.length && !isFence(lines[i])) { code.push(lines[i]); i++; }
      i++; // skip closing fence
      html += `<pre class="md-pre"><code>${escapeHtml(code.join("\n"))}</code></pre>`;
      continue;
    }

    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      closeLists();
      const lvl = h[1].length;
      html += `<h${lvl} class="md-h md-h${lvl}">${inline(h[2])}</h${lvl}>`;
      i++;
      continue;
    }

    const ul = line.match(/^\s*[-*]\s+(.*)$/);
    if (ul) {
      if (inOl) { html += "</ol>"; inOl = false; }
      if (!inUl) { html += '<ul class="md-ul">'; inUl = true; }
      html += `<li>${inline(ul[1])}</li>`;
      i++;
      continue;
    }

    const ol = line.match(/^\s*\d+\.\s+(.*)$/);
    if (ol) {
      if (inUl) { html += "</ul>"; inUl = false; }
      if (!inOl) { html += '<ol class="md-ol">'; inOl = true; }
      html += `<li>${inline(ol[1])}</li>`;
      i++;
      continue;
    }

    if (isBlank(line)) { closeLists(); i++; continue; }

    // Paragraph: gather consecutive plain lines.
    closeLists();
    const para = [line];
    i++;
    while (i < lines.length && !isBlank(lines[i]) && !isHeading(lines[i]) && !isUl(lines[i]) && !isOl(lines[i]) && !isFence(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    html += `<p class="md-p">${inline(para.join(" "))}</p>`;
  }
  closeLists();
  return html;
}
