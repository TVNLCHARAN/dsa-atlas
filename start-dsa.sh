#!/usr/bin/env bash
# DSA Atlas launcher (macOS / Linux). Starts a local server and opens the browser.
cd "$(dirname "$0")" || exit 1
PORT="${PORT:-8123}"

open_url() {
  if command -v xdg-open >/dev/null; then xdg-open "http://localhost:$PORT/" >/dev/null 2>&1
  elif command -v open >/dev/null; then open "http://localhost:$PORT/"
  fi
}

if command -v node >/dev/null; then
  ( sleep 1; open_url ) &
  node server.js "$PORT"
elif command -v python3 >/dev/null; then
  ( sleep 1; open_url ) &
  python3 -m http.server "$PORT"
else
  echo "Node.js or Python 3 required."
  exit 1
fi
