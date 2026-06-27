// Review mode — spaced-repetition session. Hides the solution, lets you re-attempt, then
// grade recall (Solved / Partial / Forgot), which reschedules the next review and updates
// confidence.

import { h, clear } from "../../core/dom.js";
import store from "../../services/store.js";
import { card, button, breadcrumb, difficultyBadge, emptyState, badge } from "../components/ui.js";
import { icon } from "../icons.js";
import { codeBlock } from "../components/code-block.js";
import { toast } from "../components/toast.js";
import { navigate } from "../../core/router.js";
import { conceptName } from "../../data/roadmap.js";
import { ladderLabel } from "../../domain/review-engine.js";
import { REVIEW_RESULTS } from "../../core/config.js";
import { relativeDay } from "../../core/dates.js";

export function render({ query = {} } = {}) {
  const page = h("div", { class: "page review-page" });
  page.appendChild(breadcrumb([{ label: "Home", href: "#/" }, { label: "Review" }]));

  let queue = query.id ? [store.problem(query.id)].filter(Boolean) : store.dueReviews();
  let index = 0;
  let completed = 0;

  const head = h("div", { class: "page-head" });
  const stage = h("div", { class: "review-stage" });
  page.appendChild(head);
  page.appendChild(stage);

  function renderHead() {
    clear(head);
    head.appendChild(h("div", {},
      h("h1", { class: "page-title" }, "Review session"),
      h("p", { class: "page-sub" }, queue.length ? `${index + 1} of ${queue.length} · ${completed} reviewed` : "Nothing due")
    ));
    if (queue.length) {
      const prog = h("div", { class: "review-progress" },
        h("div", { class: "review-progress-fill", style: { width: `${(completed / queue.length) * 100}%` } }));
      head.appendChild(prog);
    }
  }

  function done() {
    clear(stage);
    stage.appendChild(card({ className: "review-done" },
      emptyState({
        iconName: "award",
        title: completed ? `Reviewed ${completed} problem${completed === 1 ? "" : "s"} 🎉` : "All caught up",
        message: completed ? "Great work — your future recall just got stronger." : "No reviews are due right now.",
        action: h("div", { class: "row-gap" },
          button("Back to dashboard", { variant: "primary", onClick: () => navigate("/") }),
          button("Browse problems", { variant: "ghost", onClick: () => navigate("/problems") })
        ),
      })
    ));
  }

  function renderCard() {
    renderHead();
    clear(stage);
    if (index >= queue.length) return done();

    const p = queue[index];
    let revealed = !store.setting("hideSolutionOnReview", true);
    let confVal = p.confidence ?? 6;

    const solutionWrap = h("div", { class: "review-solution" });
    const renderSolution = () => {
      clear(solutionWrap);
      if (!revealed) {
        solutionWrap.appendChild(h("div", { class: "solution-hidden" },
          icon("eyeOff", { size: 22 }),
          h("p", {}, "Solution hidden — try to recall the approach first."),
          button("Reveal solution", { variant: "default", iconName: "eye", onClick: () => { revealed = true; renderSolution(); } })
        ));
      } else {
        if (p.key_insight) solutionWrap.appendChild(h("div", { class: "review-insight" }, icon("lightbulb", { size: 16 }), h("span", {}, p.key_insight)));
        if (p.code) solutionWrap.appendChild(codeBlock(p.code, p.language || "python"));
        else solutionWrap.appendChild(h("p", { class: "muted" }, "No code saved for this problem."));
        if (p.optimized) solutionWrap.appendChild(h("div", { class: "review-extra" }, h("strong", {}, "Optimized: "), p.optimized));
      }
    };
    renderSolution();

    const scratch = h("textarea", { class: "input code-area", rows: 6, placeholder: "Optional scratchpad — re-derive the approach from memory…", spellcheck: "false" });

    const confSlider = h("input", { type: "range", min: "1", max: "10", value: String(confVal), class: "conf-slider" });
    const confOut = h("span", { class: "conf-label" }, `${confVal}/10`);
    confSlider.addEventListener("input", (e) => { confVal = Number(e.target.value); confOut.textContent = `${confVal}/10`; });

    const grade = (result) => {
      const delta = REVIEW_RESULTS[result].confidenceDelta;
      const finalConf = Math.max(1, Math.min(10, confVal + delta));
      store.submitReview(p.id, result, finalConf);
      completed++;
      index++;
      toast(`Marked: ${REVIEW_RESULTS[result].label}`, result === "forgot" ? "info" : "success");
      renderCard();
    };

    stage.appendChild(card({ className: "review-card" },
      h("div", { class: "review-card-head" },
        h("div", {},
          h("a", { class: "review-concept", href: `#/concept/${p.concept_id}` }, conceptName(p.concept_id)),
          h("h2", { class: "review-title" }, p.title)
        ),
        h("div", { class: "review-card-badges" },
          badge(ladderLabel(p), "info"),
          difficultyBadge(p.difficulty),
          p.problem_url ? button("Open", { variant: "ghost", size: "sm", iconName: "external", onClick: () => window.open(p.problem_url, "_blank") }) : null
        )
      ),
      p.recognition_clue ? h("div", { class: "review-clue" }, h("strong", {}, "Recognition clue: "), p.recognition_clue) : null,
      h("div", { class: "review-grid" },
        h("div", {}, h("span", { class: "field-label" }, "Recall scratchpad"), scratch),
        h("div", {}, h("span", { class: "field-label" }, "Solution"), solutionWrap)
      ),
      h("div", { class: "review-controls" },
        h("div", { class: "conf-control" }, h("span", { class: "field-label" }, "Confidence now"), confSlider, confOut),
        h("div", { class: "review-verdict" },
          button("Forgot", { variant: "danger", iconName: "x", onClick: () => grade("forgot") }),
          button("Partial", { variant: "warning", iconName: "dot", onClick: () => grade("partial") }),
          button("Solved", { variant: "primary", iconName: "check", onClick: () => grade("solved") })
        )
      ),
      h("div", { class: "review-skip" },
        button("Skip", { variant: "ghost", size: "sm", onClick: () => { index++; renderCard(); } }),
        h("span", { class: "muted" }, p.next_review_date ? `Was due ${relativeDay(p.next_review_date)}` : "")
      )
    ));
  }

  if (!queue.length) done();
  else renderCard();
  return page;
}
