@echo off
REM ============================================================
REM  LXUP - start all services
REM  Each service runs in its own window; close that window to
REM  stop the service.
REM
REM  NOTE: ASCII-only on purpose. Chinese text saved as UTF-8 +
REM  "chcp 65001" makes cmd.exe mis-parse batch lines.
REM ============================================================
cd /d "%~dp0"
set "ROOT=%~dp0"

REM OpenClaw state (config / plugins / channel state / sessions) lives inside
REM the portable runtime dir, not the user profile. All child windows inherit
REM this variable; keep it in sync if the project is moved.
set "OPENCLAW_STATE_DIR=%ROOT%runtime\openclaw-home"

REM License validation server (activation codes). Sidecar reads this;
REM for local testing point it at a local license_server (e.g. :9000).
set "LICENSE_SERVER_URL=http://49.233.171.82:9000"

REM Portable Python shared by Sidecar (and Hermes). bootstrap-hermes.bat
REM installs a standalone CPython into runtime\python\cpython-*; use it here
REM so the Sidecar runs on the bundled interpreter with its deps, not the
REM system `python` on PATH (which lacks sqlalchemy etc.).
set "PYDIR="
for /d %%D in ("%ROOT%runtime\python\cpython-*") do set "PYDIR=%%D"
if not defined PYDIR (
  echo [ERROR] Portable Python not found under runtime\python. Run bootstrap-hermes.bat first.
  pause
  exit /b 1
)
set "PYTHON=%PYDIR%\python.exe"
REM Bare `python` in agent commands (LXUP general-tool skill scripts) must
REM resolve to the bundled interpreter with the preinstalled libraries,
REM not the system python (which may not exist or lack the deps).
set "PATH=%PYDIR%;%PATH%"

REM ------------------------------------------------------------
REM Port pre-check: if another LXUP/OpenClaw copy already holds a
REM service port, starting anyway would silently cross-wire the
REM stacks (UI/sidecar talking to the OTHER instance's gateway,
REM especially Hermes which fails softly on a busy port). Refuse.
REM ------------------------------------------------------------
echo Checking service ports (7889 18789 8642 8080 5173)...
set "CONFLICT=0"
for %%P in (7889 18789 8642 8080 5173) do (
  netstat -ano | findstr /R /C:":%%P " | findstr /C:"LISTENING" >nul && (
    echo [ERROR] Port %%P is already in use - another LXUP/OpenClaw instance is running.
    echo         Run stop-all.bat there (or close its windows^), then retry.
    set "CONFLICT=1"
  )
)
if "%CONFLICT%"=="1" (
  pause
  exit /b 1
)

echo [1/5] Starting LXUP Sidecar (7889)...
start "LXUP-Sidecar-7889" cmd /k "cd /d "%ROOT%" && "%PYTHON%" -m sidecar.main --db-path "%ROOT%runtime\data\gateway.db" --port 7889"

echo [2/5] Starting OpenClaw gateway (18789)...
start "OpenClaw-Gateway-18789" cmd /k "cd /d "%ROOT%" && "%ROOT%runtime\data\node.exe" "%ROOT%runtime\openclaw\node_modules\openclaw\openclaw.mjs" gateway --port 18789 --force"

echo [3/5] Starting Hermes gateway (8642)...
start "Hermes-Gateway-8642" cmd /k "cd /d "%ROOT%" && start-hermes.bat"

echo [4/5] Starting AI Assistant (8080)...
start "AI-Assistant-8080" cmd /k "cd /d "%ROOT%ai-assistant" && "%ROOT%runtime\data\node.exe" server.js"

echo [5/5] Starting Frontend (5173)...
start "Frontend-5173" cmd /k "cd /d "%ROOT%control-ui" && "%ROOT%runtime\data\node.exe" node_modules\vite\bin\vite.js"

echo.
echo ============================================================
echo  All services started:
echo    Sidecar         http://127.0.0.1:7889   - WeChat QR login bridge
echo    OpenClaw GW     http://127.0.0.1:18789  - engine / realtime chat
echo    Hermes GW       http://127.0.0.1:8642   - engine / realtime chat, bootstrap first
echo    AI Assistant    http://127.0.0.1:8080   - standalone, bypasses gateway
echo    Frontend        http://localhost:5173
echo.
echo  Open http://localhost:5173 in your browser.
echo  First time with Hermes: run engines\hermes\bootstrap-portable.bat first.
echo  To stop a single service, close its command window.
echo ============================================================
pause
