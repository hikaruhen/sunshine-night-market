@echo off
setlocal
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 22 or later is required. Please install Node.js first.
  pause
  exit /b 1
)
node "%~dp0scripts\start-preview.mjs"
if errorlevel 1 (
  echo Preview could not start. See the message above.
  pause
  exit /b 1
)
if /I not "%~1"=="--no-open" start "" "http://127.0.0.1:5173/"
endlocal
