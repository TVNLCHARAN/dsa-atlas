// Global constants and default configuration.
// Anything a user can change lives in the `settings` table; these are the defaults.

export const APP_NAME = "DSA Atlas";
export const APP_VERSION = "1.0.0";
export const SCHEMA_VERSION = 1;

// IndexedDB location for the persisted SQLite binary.
export const IDB_DATABASE = "dsa-atlas";
export const IDB_STORE = "kv";
export const IDB_DB_KEY = "sqlite-db";

// Spaced-repetition review intervals (cumulative days, anchored to last re-anchor point).
export const DEFAULT_REVIEW_INTERVALS = [1, 3, 7, 21, 60];

export const DIFFICULTIES = ["Easy", "Medium", "Hard"];
export const PLATFORMS = ["LeetCode", "NeetCode", "Codeforces", "HackerRank", "Other"];
export const LANGUAGES = [
  "python", "cpp", "java", "javascript", "typescript", "go", "rust", "csharp", "kotlin", "c", "ruby", "swift",
];
export const LANGUAGE_LABEL = {
  python: "Python", cpp: "C++", java: "Java", javascript: "JavaScript", typescript: "TypeScript",
  go: "Go", rust: "Rust", csharp: "C#", kotlin: "Kotlin", c: "C", ruby: "Ruby", swift: "Swift",
};

export const REVIEW_RESULTS = {
  solved: { key: "solved", label: "Solved cleanly", confidenceDelta: +1 },
  partial: { key: "partial", label: "Partially remembered", confidenceDelta: 0 },
  forgot: { key: "forgot", label: "Forgot completely", confidenceDelta: -2 },
};

export const CONCEPT_STATUS = {
  LOCKED: "locked",
  CURRENT: "current",
  COMPLETED: "completed",
};

// Curated accent palette (Linear/Vercel-ish).
export const ACCENTS = [
  { id: "indigo", label: "Indigo", value: "#6366f1" },
  { id: "violet", label: "Violet", value: "#8b5cf6" },
  { id: "blue", label: "Blue", value: "#3b82f6" },
  { id: "emerald", label: "Emerald", value: "#10b981" },
  { id: "rose", label: "Rose", value: "#f43f5e" },
  { id: "amber", label: "Amber", value: "#f59e0b" },
  { id: "cyan", label: "Cyan", value: "#06b6d4" },
];

export const DEFAULT_SETTINGS = {
  theme: "dark", // dark | light
  accent: "indigo",
  reviewIntervals: DEFAULT_REVIEW_INTERVALS,
  defaultLanguage: "python",
  hideSolutionOnReview: true,
  dailyGoalProblems: 2, // 1 NeetCode + 1 daily
};

export const GOAL_TYPES = [
  { id: "problems_count", label: "Solve N problems", needsTarget: true, unit: "problems" },
  { id: "concepts_count", label: "Complete N concepts", needsTarget: true, unit: "concepts" },
  { id: "concept_complete", label: "Finish a specific concept", needsConcept: true },
  { id: "streak", label: "Maintain an N-day streak", needsTarget: true, unit: "days" },
  { id: "custom", label: "Custom goal", needsTarget: true, unit: "" },
];
