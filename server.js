#!/usr/bin/env node
/*
 * Tiny zero-dependency static file server for DSA Atlas.
 * Serves the app over http://localhost so ES modules + the SQLite WASM binary load
 * reliably (file:// blocks both). Everything stays 100% local — no network calls.
 *
 *   node server.js [port]
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.argv[2] || process.env.PORT || 8123);

// The single source of truth: a real SQLite file on disk. The browser loads it on open
// (GET /api/db) and writes it back on every change (POST /api/db). Override with DSA_DB.
const DB_FILE = process.env.DSA_DB || path.join(ROOT, "data", "dsa-atlas.db");
fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".db": "application/x-sqlite3",
  ".map": "application/json",
};

const server = http.createServer((req, res) => {
  const reqUrl = (req.url || "/").split("?")[0];

  // ---- Local SQLite file backend API ----
  // The X-DSA-Backend header lets the client distinguish this server from a plain static one.
  if (reqUrl === "/api/info") {
    let exists = false, size = 0, mtime = null;
    try { const st = fs.statSync(DB_FILE); exists = true; size = st.size; mtime = st.mtime.toISOString(); } catch {}
    res.writeHead(200, { "Content-Type": "application/json", "X-DSA-Backend": "file", "Cache-Control": "no-store" });
    return res.end(JSON.stringify({ backend: "file", path: DB_FILE, exists, size, mtime }));
  }

  if (reqUrl === "/api/db" && req.method === "GET") {
    return fs.readFile(DB_FILE, (err, data) => {
      if (err) { res.writeHead(404, { "X-DSA-Backend": "file" }); return res.end("no-db"); }
      res.writeHead(200, { "Content-Type": "application/x-sqlite3", "X-DSA-Backend": "file", "Cache-Control": "no-store" });
      res.end(data);
    });
  }

  if (reqUrl === "/api/db" && req.method === "POST") {
    const chunks = [];
    let bytes = 0;
    req.on("data", (c) => { chunks.push(c); bytes += c.length; });
    req.on("end", () => {
      const buf = Buffer.concat(chunks);
      if (!buf.length) { res.writeHead(400); return res.end("empty"); }
      // Atomic write: temp file then rename, so a crash mid-write can't corrupt the db.
      const tmp = `${DB_FILE}.tmp-${process.pid}`;
      fs.writeFile(tmp, buf, (err) => {
        if (err) { res.writeHead(500); return res.end("write-failed"); }
        fs.rename(tmp, DB_FILE, (err2) => {
          if (err2) { res.writeHead(500); return res.end("rename-failed"); }
          res.writeHead(200, { "Content-Type": "application/json", "X-DSA-Backend": "file" });
          res.end(JSON.stringify({ ok: true, bytes: buf.length }));
        });
      });
    });
    req.on("error", () => { try { res.writeHead(500); res.end("err"); } catch {} });
    return;
  }

  try {
    let urlPath = decodeURIComponent(reqUrl);
    if (urlPath === "/") urlPath = "/index.html";

    // Resolve safely within ROOT (block path traversal).
    const filePath = path.join(ROOT, path.normalize(urlPath));
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403);
      return res.end("Forbidden");
    }

    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        return res.end("Not found: " + urlPath);
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        "Content-Type": MIME[ext] || "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      fs.createReadStream(filePath).pipe(res);
    });
  } catch (e) {
    res.writeHead(500);
    res.end("Server error");
  }
});

server.listen(PORT, () => {
  console.log(`\n  🧠  DSA Atlas running at  http://localhost:${PORT}`);
  console.log(`  💾  Data file: ${DB_FILE}`);
  console.log("\n  Open the URL above in your browser. Press Ctrl+C to stop.\n");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n  Port ${PORT} is in use. Try:  node server.js ${PORT + 1}\n`);
  } else {
    console.error(err);
  }
  process.exit(1);
});
