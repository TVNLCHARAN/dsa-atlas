// Roadmap transition logic — PURE planning functions. They take the current concept list
// and return a list of { id, fields } updates for the service to persist. No DB access here,
// so the rules (only one "current", promote next on completion, etc.) are unit-testable.

import { CONCEPT_STATUS } from "../core/config.js";
import { nowISO, today } from "../core/dates.js";

export function statusOf(concept) {
  return concept?.status || CONCEPT_STATUS.LOCKED;
}

/** First concept that is neither completed nor current (the natural "next up"). */
export function nextLocked(list) {
  return list.find((c) => c.status === CONCEPT_STATUS.LOCKED) || null;
}

/** Plan: set `id` as the single current concept; demote any other (non-completed) current. */
export function planMarkCurrent(list, id) {
  const updates = [];
  for (const c of list) {
    if (c.id === id) {
      if (c.status !== CONCEPT_STATUS.CURRENT) {
        updates.push({
          id: c.id,
          fields: {
            status: CONCEPT_STATUS.CURRENT,
            started_at: c.started_at || today(),
          },
        });
      }
    } else if (c.status === CONCEPT_STATUS.CURRENT) {
      updates.push({ id: c.id, fields: { status: CONCEPT_STATUS.LOCKED } });
    }
  }
  return updates;
}

/** Plan: mark `id` completed, set confidence, and promote the next locked concept to current. */
export function planComplete(list, id, confidence) {
  const updates = [];
  const target = list.find((c) => c.id === id);
  if (!target) return updates;

  updates.push({
    id,
    fields: {
      status: CONCEPT_STATUS.COMPLETED,
      completed_at: target.completed_at || today(),
      started_at: target.started_at || today(),
      ...(confidence != null ? { confidence } : {}),
    },
  });

  // If nothing is current after this, promote the first remaining locked concept.
  const stillCurrent = list.some((c) => c.id !== id && c.status === CONCEPT_STATUS.CURRENT);
  if (!stillCurrent) {
    const next = list.find((c) => c.id !== id && c.status === CONCEPT_STATUS.LOCKED);
    if (next) {
      updates.push({ id: next.id, fields: { status: CONCEPT_STATUS.CURRENT, started_at: next.started_at || today() } });
    }
  }
  return updates;
}

/** Plan: reopen a completed concept back to current. */
export function planReopen(list, id) {
  return planMarkCurrent(list, id).concat([{ id, fields: { status: CONCEPT_STATUS.CURRENT, completed_at: null } }]);
}

export const _internals = { nowISO };
