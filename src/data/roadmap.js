// Canonical DSA roadmap — the single source of truth for concept ids, names and order.
// The concept-content.js module provides the rich reference content keyed by these ids.
// The database seeds one `concepts` row per entry here (preserving order_index).

export const ROADMAP = [
  { id: "big-o",               name: "Time Complexity & Big O" },
  { id: "arrays",              name: "Arrays" },
  { id: "strings",             name: "Strings" },
  { id: "hashing",             name: "Hash Maps / Hash Sets" },
  { id: "two-pointers",        name: "Two Pointers" },
  { id: "sliding-window",      name: "Sliding Window" },
  { id: "prefix-sum",          name: "Prefix Sum" },
  { id: "binary-search",       name: "Binary Search" },
  { id: "sorting",             name: "Sorting" },
  { id: "stack",               name: "Stack" },
  { id: "monotonic-stack",     name: "Monotonic Stack" },
  { id: "queue",               name: "Queue" },
  { id: "monotonic-queue",     name: "Monotonic Queue" },
  { id: "linked-list",         name: "Linked List" },
  { id: "fast-slow-pointers",  name: "Fast & Slow Pointers" },
  { id: "recursion",           name: "Recursion" },
  { id: "trees",               name: "Trees" },
  { id: "bst",                 name: "Binary Search Trees" },
  { id: "tree-traversals",     name: "Tree Traversals" },
  { id: "heap",                name: "Heap / Priority Queue" },
  { id: "trie",                name: "Trie" },
  { id: "backtracking",        name: "Backtracking" },
  { id: "graph-representation", name: "Graph Representation" },
  { id: "dfs",                 name: "DFS" },
  { id: "bfs",                 name: "BFS" },
  { id: "topological-sort",    name: "Topological Sort" },
  { id: "union-find",          name: "Union Find (Disjoint Set)" },
  { id: "shortest-path",       name: "Shortest Path" },
  { id: "mst",                 name: "Minimum Spanning Tree" },
  { id: "greedy",              name: "Greedy" },
  { id: "intervals",           name: "Intervals" },
  { id: "bit-manipulation",    name: "Bit Manipulation" },
  { id: "dp",                  name: "Dynamic Programming" },
  { id: "advanced-dp",         name: "Advanced DP" },
  { id: "segment-tree",        name: "Segment Tree" },
  { id: "fenwick-tree",        name: "Fenwick Tree" },
  { id: "advanced-graph",      name: "Advanced Graph Algorithms" },
];

export const ROADMAP_IDS = ROADMAP.map((c) => c.id);
export const ROADMAP_NAME = Object.fromEntries(ROADMAP.map((c) => [c.id, c.name]));

export function conceptName(id) {
  return ROADMAP_NAME[id] || id || "—";
}
