@echo off
setlocal
REM ============================================================
REM  OpenClaw portable runtime bootstrap - one-time, needs internet
REM  - requires portable node runtime\data\node.exe in place, v24.15.0+
REM  - installs the openclaw npm package into runtime\openclaw, run by portable node
REM
REM  NOTE: ASCII-only on purpose - see start-all.bat.
REM ============================================================
cd /d "%~dp0"
set "ROOT=%CD%"

if not exist "%ROOT%\runtime\data\node.exe" (
  echo [ERROR] runtime\data\node.exe not found. Place portable node v24.15.0+ first.
  pause
  exit /b 1
)

echo === Portable node version ===
"%ROOT%\runtime\data\node.exe" --version

echo.
echo === Installing openclaw into runtime\openclaw - slow the first time ===
npm install openclaw --prefix "%ROOT%\runtime\openclaw" --no-audit --no-fund
if errorlevel 1 (
  echo [ERROR] openclaw install failed
  pause
  exit /b 1
)

echo.
echo === Verify ===
"%ROOT%\runtime\data\node.exe" "%ROOT%\runtime\openclaw\node_modules\openclaw\openclaw.mjs" --version

echo.
echo ============================================================
echo  Bootstrap complete! Start the OpenClaw gateway via start-all.bat or the Sidecar.
echo ============================================================
pause
