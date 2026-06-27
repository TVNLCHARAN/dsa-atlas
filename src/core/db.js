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
import { bus, EVENTS } from "./eventbus.js";

let SQL = null; // sql.js module
let db = null; // SQL.Database instance

// Storage backend: "file" = real .db on disk via the local server (preferred),
// "indexeddb" = browser fallback when no server API is present (e.g. plain static host).
let backendMode = "indexeddb";
let saveErrorNotified = false;

const API_INFO = "api/info";
const API_DB = "api/db";

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

  let bytes = null;

  // Prefer the local-file backend served by server.js. The X-DSA-Backend header confirms
  // it's our server (a plain static host would 404 /api/info without the header).
  try {
    const info = await fetch(API_INFO, { cache: "no-store" });
    if (info.ok && info.headers.get("X-DSA-Backend") === "file") {
      backendMode = "file";
      const res = await fetch(API_DB, { cache: "no-store" });
      if (res.ok) {
        const buf = new Uint8Array(await res.arrayBuffer());
        bytes = buf.byteLength ? buf : null;
      }
    }
  } catch {
    /* no backend reachable — fall back to browser storage */
  }

  if (backendMode !== "file") {
    const saved = await idbGet(IDB_DB_KEY);
    bytes = saved ? new Uint8Array(saved) : null;
  }

  db = bytes ? new SQL.Database(bytes) : new SQL.Database();
  requestPersistentStorage();
  return db;
}

/** Ask the browser not to evict our IndexedDB fallback under storage pressure. */
async function requestPersistentStorage() {
  try {
    if (navigator?.storage?.persist) {
      const already = await navigator.storage.persisted?.();
      if (!already) await navigator.storage.persist();
    }
  } catch {
    /* not supported — ignore */
  }
}

export function getStorageInfo() {
  return { mode: backendMode };
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
  const bytes = db.export();

  if (backendMode === "file") {
    try {
      const res = await fetch(API_DB, {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: bytes,
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      saveErrorNotified = false;
      return;
    } catch (err) {
      console.error("[db] local file save failed; keeping a browser backup", err);
      if (!saveErrorNotified) {
        saveErrorNotified = true;
        bus.emit(EVENTS.TOAST, {
          message: "Couldn't write the local .db file — is the server window still open? Saved a browser backup for now.",
          type: "error",
        });
      }
      // fall through and keep an IndexedDB backup so nothing is lost
    }
  }

  try {
    await idbSet(IDB_DB_KEY, bytes);
  } catch (e) {
    console.error("[db] IndexedDB persist failed", e);
  }
}

const schedulePersist = debounce(() => {
  persistNow().catch((err) => console.error("[db] persist failed", err));
}, 400);

/** Replace the live database with imported bytes (used by import/restore). */
export function loadFromBytes(bytes) {
  db = new SQL.Database(new Uint8Array(bytes));
  return db;
}

// Best-effort flush on tab close. sendBeacon reliably delivers the bytes to the file
// backend during unload; we also keep an IndexedDB copy as a belt-and-suspenders backup.
window.addEventListener("beforeunload", () => {
  try {
    if (!db) return;
    const bytes = db.export();
    if (backendMode === "file" && navigator.sendBeacon) {
      navigator.sendBeacon(API_DB, new Blob([bytes], { type: "application/octet-stream" }));
    }
    idbSet(IDB_DB_KEY, bytes);
  } catch {
    /* ignore */
  }
});
