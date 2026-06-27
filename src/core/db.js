// Low-level SQLite engine wrapper around sql.js (SQLite compiled to WASM).
//
// Responsibilities:
//   - Boot the WASM engine and open (or create) the database.
//   - Persist the binary to IndexedDB (debounced) so data survives reloads.
//   - Provide tiny query helpers (all/get/run/exec) used by the repository.
//
// Everything above this file is storage-engine agnostic: the repository talks to these
// helpers, and could be re-pointed at native SQLite / Postgres without touching the UI.

import { IDB_DATABASE, IDB_STORE, IDB_DB_KEY } from "./config.js";
import { debounce } from "./dom.js";

let SQL = null; // sql.js module
let db = null; // SQL.Database instance

// ---------- IndexedDB blob storage (single key holding the .sqlite bytes) ----------

function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DATABASE, 1);
    req.onupgradeneeded = () => {
      const idb = req.result;
      if (!idb.objectStoreNames.contains(IDB_STORE)) idb.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key) {
  const idb = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key, val) {
  const idb = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(val, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ---------- Boot ----------

export async function initEngine() {
  if (db) return db;
  if (typeof window.initSqlJs !== "function") {
    throw new Error("sql.js failed to load. Ensure vendor/sql-wasm.js is included before the app module.");
  }
  SQL = await window.initSqlJs({ locateFile: (file) => `vendor/${file}` });

  const saved = await idbGet(IDB_DB_KEY);
  if (saved) {
    db = new SQL.Database(new Uint8Array(saved));
  } else {
    db = new SQL.Database();
  }
  return db;
}

export function getDb() {
  if (!db) throw new Error("Database not initialised. Call initEngine() first.");
  return db;
}

// ---------- Query helpers ----------

/** SELECT -> array of row objects. */
export function all(sql, params = []) {
  const stmt = db.prepare(sql);
  try {
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    return rows;
  } finally {
    stmt.free();
  }
}

/** SELECT -> first row object or null. */
export function get(sql, params = []) {
  const rows = all(sql, params);
  return rows.length ? rows[0] : null;
}

/** Scalar SELECT -> first column of first row. */
export function scalar(sql, params = []) {
  const row = get(sql, params);
  if (!row) return null;
  return row[Object.keys(row)[0]];
}

/** INSERT/UPDATE/DELETE. Returns last inserted rowid (useful for INSERT). */
export function run(sql, params = []) {
  db.run(sql, params);
  schedulePersist();
  const r = db.exec("SELECT last_insert_rowid() AS id, changes() AS changes");
  return {
    lastId: r[0]?.values[0][0],
    changes: r[0]?.values[0][1],
  };
}

/** Raw multi-statement execution (DDL, migrations). */
export function exec(sql) {
  db.exec(sql);
  schedulePersist();
}

export function transaction(fn) {
  db.exec("BEGIN");
  try {
    const result = fn();
    db.exec("COMMIT");
    schedulePersist();
    return result;
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

// ---------- Persistence ----------

export function exportBytes() {
  return db.export(); // Uint8Array
}

export async function persistNow() {
  if (!db) return;
  await idbSet(IDB_DB_KEY, db.export());
}

const schedulePersist = debounce(() => {
  persistNow().catch((err) => console.error("[db] persist failed", err));
}, 400);

/** Replace the live database with imported bytes (used by import/restore). */
export function loadFromBytes(bytes) {
  db = new SQL.Database(new Uint8Array(bytes));
  return db;
}

// Best-effort flush on tab close.
window.addEventListener("beforeunload", () => {
  try {
    if (db) {
      const bytes = db.export();
      // Fire-and-forget; IndexedDB writes during unload are best-effort.
      idbSet(IDB_DB_KEY, bytes);
    }
  } catch {
    /* ignore */
  }
});
