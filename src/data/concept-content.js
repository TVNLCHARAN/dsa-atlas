// Aggregated static reference content for every roadmap concept.
// Content is authored in per-batch files under ./concepts/ (kept small so each is easy to
// edit). They're merged here into a single map keyed by concept id, consumed by the
// concept page and global search via ./content.js.

import { BATCH as B1 } from "./concepts/batch1.js";
import { BATCH as B2 } from "./concepts/batch2.js";
import { BATCH as B3 } from "./concepts/batch3.js";
import { BATCH as B4 } from "./concepts/batch4.js";
import { BATCH as B5 } from "./concepts/batch5.js";
import { BATCH as B6 } from "./concepts/batch6.js";

export const CONCEPT_CONTENT = { ...B1, ...B2, ...B3, ...B4, ...B5, ...B6 };
