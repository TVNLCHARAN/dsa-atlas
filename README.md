# 🧠 DSA Atlas

A **local-first second brain** for your Data Structures & Algorithms journey — a roadmap,
a problem log, spaced-repetition review, a per-concept notebook, and rich analytics. Built
to be opened **every day** while you grind LeetCode and NeetCode.

Plain **HTML + CSS + JavaScript** (ES modules, no framework, no build step). Storage is a
**real SQLite database** running in your browser via [sql.js](https://sql.js.org)
(SQLite compiled to WebAssembly), persisted locally and exportable as a `.db` file.
**100% offline. No accounts, no network, no telemetry.**

---

## 🚀 Run it

**Double-click `start-dsa.bat`** (Windows). It starts a tiny local server and opens your
browser at `http://localhost:8123`.

> A local server is used (instead of opening `index.html` directly) because browsers block
> ES modules and the SQLite WASM binary over `file://`. The server is a ~60-line zero-dependency
> Node script that only serves these files from your machine — nothing leaves your computer.

Other ways to start:

```bash
npm start            # or:  node server.js          (Node)
./start-dsa.sh       # macOS / Linux
python -m http.server 8123    # then open http://localhost:8123
```

Requirements: **Node.js** *or* **Python 3** (you have both). No `npm install` needed to run the app.

---

## ✨ Features

- **Dashboard** — streak, GitHub-style activity heatmap, totals, current concept + confidence,
  reviews due today, recently solved, avg solve time, editorial dependency, pattern-confidence,
  weekly/monthly progress, goals.
- **Roadmap** — the 37-concept linear path with status colors (🟢 completed · 🔵 current · ⚪ locked).
  Click any node to open its page.
- **Concept pages** — curated reference (recognition patterns, when to use / not, complexity tables,
  common mistakes, idiomatic template code, key observations, videos & articles) **plus** your own
  auto-saving notebook and the problems you've solved under that topic.
- **Add Problem** — a thorough capture form: timing, attempts, independence flags, rating, code,
  brute-force/optimized approaches, complexity, insights, recognition clue, edge cases, confidence,
  tags, notes.
- **Spaced repetition** — every problem is auto-scheduled for review on a **Day 1 / 3 / 7 / 21 / 60**
  ladder. Review mode hides the solution for active recall, then you grade *Solved / Partial / Forgot*,
  which reschedules and updates confidence.
- **Code storage** — current solution + full **version history** (Original / Updated / Revision …),
  syntax-highlighted, copyable.
- **Analytics** — throughput per week/month, difficulty mix, confidence & editorial-dependency trends,
  review accuracy, concept completion, strongest / weakest / hardest concepts.
- **Calendar · Timeline · Daily Journal · Goals · Global Search** (titles, concepts, tags, notes,
  mistakes, insights, recognition patterns, code, links).
- **Command palette** (`Cmd/Ctrl + K`), keyboard shortcuts, dark/light themes, accent colors,
  collapsible sidebar, smooth animations, fully responsive.
- **Export / Backup** — `.db`, JSON, CSV, Markdown, and Print-to-PDF. Restore from `.db` or JSON.

---

## ⌨️ Keyboard shortcuts

| Key | Action | | Key | Action |
|---|---|---|---|---|
| `Cmd/Ctrl + K` | Command palette | | `g` then `d` | Dashboard |
| `/` | Focus search | | `g` then `r` | Roadmap |
| `a` | Add a problem | | `g` then `p` | Problems |
| `t` | Toggle theme | | `g` then `v` | Review |
| `\` | Collapse sidebar | | `g` then `a` | Analytics |
| `?` | Shortcut help | | `g` then `j` / `o` / `s` | Journal / Goals / Settings |

---

## 🗂️ Where your data lives

Your database is stored in the browser's **IndexedDB** for this app (origin `localhost:8123`),
saved as a real SQLite binary on every change. **Download a `.db` backup regularly**
(Settings → Data & backup) — clearing browser data will erase the local copy. The exported
`.db` opens in any SQLite tool (DB Browser, `sqlite3`, etc.).

---

## 🏛️ Architecture

Clean separation so the **storage backend can change without touching the UI**:

```
index.html ── vendor/ (sql.js, highlight.js)        # offline libraries
src/
  core/        config · dates · dom · eventbus · router · db (sql.js engine + IndexedDB persistence)
  storage/     schema (DDL + migrations) · repository (the ONLY layer that knows tables/columns)
  domain/      review-engine · streak · roadmap-logic · analytics      ← pure, unit-tested
  services/    store (business-logic facade) · search · export
  data/        roadmap (37 concepts) · concept-content (reference) · content accessor
  ui/          app (bootstrap) · shortcuts · icons
    components/ sidebar · topbar · command-palette · charts · roadmap · code-block · modal · toast · ui
    pages/      dashboard · roadmap · concept · problems · add-problem · problem-detail · review
                analytics · calendar · timeline · journal · goals · settings · search-results
  styles/      base · layout · components · pages · print
server.js · start-dsa.bat · start-dsa.sh           # local launcher
tests/         domain.test · integration.test · render.test
```

**The seam:** UI → `services/store.js` → `storage/repository.js` → `core/db.js`. Domain logic
(review engine, analytics, streaks, roadmap rules) is pure and has no DB/DOM dependency. To
migrate to native SQLite or Postgres later, reimplement `repository.js` against a new driver —
the domain and UI layers stay untouched.

### Spaced-repetition model
`review_index` points at the next interval; `next_review_date = review_anchor + intervals[index]`.
*Solved* advances the ladder (graduates after the last interval); *Partial* repeats the current
level re-anchored to today; *Forgot* restarts from Day 1. Intervals are editable in Settings.

---

## 🧪 Tests

```bash
npm test                 # pure domain logic (no deps)              — 15 checks
npm run test:integration # full stack: sql.js + schema + store      — 14 checks
npm run test:render      # every page rendered headlessly (needs: npm i jsdom)
```

`test:integration` and `test:render` auto-copy `vendor/sql-wasm.js` to a `.cjs` shim so Node can
load it (sql.js ships as a UMD/browser module).

---

## 🛠️ Tech

Vanilla JS (ES modules) · SQLite via sql.js (WASM) · highlight.js · hand-rolled SVG charts ·
no framework, no bundler, no runtime dependencies.

MIT licensed. Built to be hacked on — every file is small and single-purpose.
