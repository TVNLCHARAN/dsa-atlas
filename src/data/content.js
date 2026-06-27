// Accessor over the generated static concept reference content.
// concept-content.js is produced separately and keyed by concept id.

import { CONCEPT_CONTENT } from "./concept-content.js";

export { CONCEPT_CONTENT };

export function conceptContent(id) {
  return CONCEPT_CONTENT[id] || null;
}

/** Flattened text for global search indexing. */
export function searchableConceptText(id) {
  const c = CONCEPT_CONTENT[id];
  if (!c) return "";
  return [
    c.summary,
    c.description,
    (c.recognition || []).join(" "),
    (c.whenToUse || []).join(" "),
    (c.whenNotToUse || []).join(" "),
    (c.commonMistakes || []).join(" "),
    (c.observations || []).join(" "),
    c.template?.code,
  ]
    .filter(Boolean)
    .join("\n");
}
