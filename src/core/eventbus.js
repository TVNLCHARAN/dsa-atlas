// Minimal pub/sub. The store emits domain events ("problems:changed", "concepts:changed", …)
// and the UI subscribes to re-render. Keeps UI decoupled from storage/business logic.

class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(fn);
    return () => this.off(event, fn);
  }

  off(event, fn) {
    this.listeners.get(event)?.delete(fn);
  }

  emit(event, payload) {
    this.listeners.get(event)?.forEach((fn) => {
      try {
        fn(payload);
      } catch (err) {
        console.error(`[eventbus] listener for "${event}" threw`, err);
      }
    });
    // Wildcard listeners receive (event, payload).
    this.listeners.get("*")?.forEach((fn) => {
      try {
        fn(event, payload);
      } catch (err) {
        console.error(err);
      }
    });
  }
}

export const bus = new EventBus();

// Canonical event names.
export const EVENTS = {
  DATA_CHANGED: "data:changed",
  PROBLEMS: "problems:changed",
  CONCEPTS: "concepts:changed",
  REVIEWS: "reviews:changed",
  JOURNAL: "journal:changed",
  GOALS: "goals:changed",
  SETTINGS: "settings:changed",
  THEME: "theme:changed",
  TOAST: "toast",
  ROUTE: "route:changed",
};
