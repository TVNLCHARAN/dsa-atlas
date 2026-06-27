// Syntax-highlighted, copyable code block. Uses the vendored highlight.js (window.hljs,
// loaded as a classic script in index.html). Degrades to plain monospace if hljs is absent.

import { h } from "../../core/dom.js";
import { icon } from "../icons.js";
import { LANGUAGE_LABEL } from "../../core/config.js";
import { toast } from "./toast.js";

const HLJS_LANG = {
  python: "python", cpp: "cpp", c: "c", java: "java", javascript: "javascript",
  typescript: "typescript", go: "go", rust: "rust", csharp: "csharp", kotlin: "kotlin",
  ruby: "ruby", swift: "swift",
};

export function codeBlock(code, language = "python", { title = null, compact = false } = {}) {
  const pre = h("pre", { class: `code-pre ${compact ? "code-pre--compact" : ""}` });
  const codeEl = h("code", {});
  const lang = HLJS_LANG[language] || language;

  if (window.hljs && code) {
    try {
      const res = window.hljs.getLanguage(lang)
        ? window.hljs.highlight(code, { language: lang, ignoreIllegals: true })
        : window.hljs.highlightAuto(code);
      codeEl.innerHTML = res.value;
      codeEl.classList.add("hljs");
    } catch {
      codeEl.textContent = code;
    }
  } else {
    codeEl.textContent = code || "";
  }
  pre.appendChild(codeEl);

  const copyBtn = h(
    "button",
    {
      class: "code-copy",
      title: "Copy code",
      onClick: async () => {
        try {
          await navigator.clipboard.writeText(code || "");
          toast("Code copied", "success");
        } catch {
          toast("Copy failed", "error");
        }
      },
    },
    icon("copy", { size: 14 }),
    h("span", {}, "Copy")
  );

  return h(
    "div",
    { class: "code-block" },
    h("div", { class: "code-bar" },
      h("span", { class: "code-lang" }, title || LANGUAGE_LABEL[language] || language || "code"),
      copyBtn
    ),
    pre
  );
}
