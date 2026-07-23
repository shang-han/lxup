@echo off
setlocal
REM ============================================================
REM  Hermes portable runtime bootstrap - one-time, needs internet
REM  - uses uv to download a standalone Python 3.11 into runtime\python
REM  - installs hermes-agent + deps from PyPI into runtime\hermes-libs, relocatable
REM  - creates runtime\hermes-home - Hermes home: config / sessions / logs
REM  When done, start the gateway with start-hermes.bat.
REM
REM  NOTE: ASCII-only on purpose - see start-all.bat.
REM ============================================================
cd /d "%~dp0"
set "ROOT=%CD%"
set "PYVER=3.11"
set "HERMES_VER=0.18.2"

echo ============================================================
echo  Hermes portable runtime bootstrap
echo  Project root: %ROOT%
echo ============================================================

where uv >nul 2>&1
if errorlevel 1 (
  echo [ERROR] uv not found. Install uv first - https://docs.astral.sh/uv/
  pause
  exit /b 1
)

echo.
echo [1/4] Downloading standalone Python %PYVER% into runtime\python ...
uv python install %PYVER% --install-dir "%ROOT%\runtime\python"
if errorlevel 1 ( echo [ERROR] Python download failed & pause & exit /b 1 )

set "PYDIR="
for /d %%D in ("%ROOT%\runtime\python\cpython-*") do set "PYDIR=%%D"
if not defined PYDIR ( echo [ERROR] Python install dir not found & pause & exit /b 1 )
set "PYTHON=%PYDIR%\python.exe"
echo       Python: %PYTHON%

echo.
echo [2/4] Making sure pip is available ...
"%PYTHON%" -m ensurepip --upgrade >nul 2>&1

echo.
echo [3/4] Installing hermes-agent==%HERMES_VER% + deps from PyPI into runtime\hermes-libs - slow the first time ...
"%PYTHON%" -m pip install --no-warn-script-location --target "%ROOT%\runtime\hermes-libs" hermes-agent==%HERMES_VER% aiohttp==3.14.1
if errorlevel 1 ( echo [ERROR] Dependency install failed & pause & exit /b 1 )

echo.
echo [4/4] Creating runtime\hermes-home ...
if not exist "%ROOT%\runtime\hermes-home" mkdir "%ROOT%\runtime\hermes-home"

echo.
echo ============================================================
echo  Bootstrap complete!
echo  Now run start-hermes.bat to start the Hermes gateway.
echo ============================================================
pause
