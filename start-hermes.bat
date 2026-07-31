@echo off
setlocal
REM ============================================================
REM  Start the Hermes gateway - portable Python, api_server :8642
REM  Hermes' OWN gateway, independent of OpenClaw; both can run
REM  at the same time. Run bootstrap-hermes.bat first.
REM
REM  NOTE: ASCII-only on purpose - see start-all.bat.
REM ============================================================
cd /d "%~dp0"
set "ROOT=%CD%"

set "PYDIR="
for /d %%D in ("%ROOT%\runtime\python\cpython-*") do set "PYDIR=%%D"
if not defined PYDIR (
  echo [ERROR] Portable Python not found. Run bootstrap-hermes.bat first.
  pause
  exit /b 1
)
set "PYTHON=%PYDIR%\python.exe"
if not exist "%ROOT%\runtime\hermes-libs" (
  echo [ERROR] runtime\hermes-libs not found. Run bootstrap-hermes.bat first.
  pause
  exit /b 1
)

set "HERMES_HOME=%ROOT%\runtime\hermes-home"
if not exist "%HERMES_HOME%" mkdir "%HERMES_HOME%"
REM hermes code + deps are all in hermes-libs via pip; no longer needs engines/hermes source
set "PYTHONPATH=%ROOT%\runtime\hermes-libs"

REM Enable the api_server platform - Hermes' own HTTP + SSE chat gateway
set "API_SERVER_ENABLED=true"
set "API_SERVER_HOST=127.0.0.1"
set "API_SERVER_PORT=8642"
set "API_SERVER_KEY=lxup-hermes-dev-2026"
set "API_SERVER_CORS_ORIGINS=*"

echo ============================================================
echo  Starting Hermes gateway  http://127.0.0.1:8642
echo  HERMES_HOME: %HERMES_HOME%
echo ============================================================
"%PYTHON%" -m hermes_cli.main gateway run
pause
