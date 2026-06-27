@echo off
REM ============================================================
REM  DSA Atlas launcher  -  double-click this file to start.
REM  Starts a tiny local server, then opens your browser.
REM  100%% offline. Closing the server window stops the app.
REM ============================================================
title DSA Atlas
cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel%==0 (
  echo Starting DSA Atlas with Node...
  start "DSA Atlas Server" /min cmd /c "node server.js"
  timeout /t 1 /nobreak >nul
  start "" "http://localhost:8123/"
  exit /b
)

where python >nul 2>nul
if %errorlevel%==0 (
  echo Starting DSA Atlas with Python...
  start "DSA Atlas Server" /min cmd /c "python -m http.server 8123"
  timeout /t 1 /nobreak >nul
  start "" "http://localhost:8123/"
  exit /b
)

echo.
echo   Could not find Node.js or Python.
echo   Install either one, then double-click this file again.
echo.
pause
