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
set "OPENCLAW_VERSION=2026.7.1-2"

if not exist "%ROOT%\runtime\data\node.exe" (
  echo [ERROR] runtime\data\node.exe not found. Place portable node v24.15.0+ first.
  pause
  exit /b 1
)

echo === Portable node version ===
"%ROOT%\runtime\data\node.exe" --version

echo.
echo === Installing openclaw@%OPENCLAW_VERSION% into runtime\openclaw - slow the first time ===
call npm install openclaw@%OPENCLAW_VERSION% --prefix "%ROOT%\runtime\openclaw" --no-audit --no-fund
if errorlevel 1 (
  echo [ERROR] openclaw install failed
  pause
  exit /b 1
)

echo.
echo === Stage portable npm beside node.exe ===
set "NPM_CMD="
set "NODE_HOME="
for /f "delims=" %%I in ('where npm.cmd 2^>nul') do (
  if not defined NPM_CMD set "NPM_CMD=%%I"
  if not defined NODE_HOME set "NODE_HOME=%%~dpI"
)
if not defined NPM_CMD goto :npm_warn
set "NODE_HOME=%NODE_HOME:~0,-1%"
copy /y "%NPM_CMD%" "%ROOT%\runtime\data\npm.cmd" >nul
if exist "%NODE_HOME%\npx.cmd" copy /y "%NODE_HOME%\npx.cmd" "%ROOT%\runtime\data\npx.cmd" >nul
if exist "%NODE_HOME%\npm" copy /y "%NODE_HOME%\npm" "%ROOT%\runtime\data\npm" >nul
if exist "%NODE_HOME%\npx" copy /y "%NODE_HOME%\npx" "%ROOT%\runtime\data\npx" >nul
xcopy /y /e /i /q "%NODE_HOME%\node_modules\npm" "%ROOT%\runtime\data\node_modules\npm" >nul
echo [OK] Staged portable npm into runtime\data ^(npm.cmd, npx.cmd, node_modules\npm^).
goto :npm_done
:npm_warn
echo [WARN] npm.cmd not found on PATH - skipped auto-staging of portable npm.
echo        Without it the OpenClaw gateway reports: 'npm.cmd' is not recognized.
echo        Manual fix: copy npm.cmd, npx.cmd and the node_modules\npm folder
echo        from your Node.js install dir into runtime\data\ ^(next to node.exe^).
:npm_done

echo.
echo === Verify ===
"%ROOT%\runtime\data\node.exe" "%ROOT%\runtime\openclaw\node_modules\openclaw\openclaw.mjs" --version

echo.
echo === Preinstall WeChat plugin (needed for QR login; requires network, best-effort) ===
set "OPENCLAW_STATE_DIR=%ROOT%\runtime\openclaw-home"
"%ROOT%\runtime\data\node.exe" "%ROOT%\runtime\openclaw\node_modules\openclaw\openclaw.mjs" plugins install --force @tencent-weixin/openclaw-weixin@2.4.6
if errorlevel 1 (
  echo [WARN] WeChat plugin preinstall failed (offline?). Later manual fix:
  echo        openclaw plugins install @tencent-weixin/openclaw-weixin@2.4.6
)

echo.
echo ============================================================
echo  Bootstrap complete! Start the OpenClaw gateway via start-all.bat or the Sidecar.
echo ============================================================
pause
