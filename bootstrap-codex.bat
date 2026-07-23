@echo off
setlocal
REM ============================================================
REM  Codex CLI portable runtime bootstrap - one-time, needs internet
REM  - requires portable node runtime\data\node.exe in place, v24.15.0+
REM  - installs the @openai/codex npm package into runtime\codex.
REM    It contains the prebuilt native binary codex.exe, no Rust
REM    needed, and is launched on demand by the Sidecar.
REM  - also clones the upstream source into engines\codex as a
REM    protocol reference - reference only, not used at runtime.
REM
REM  NOTE: ASCII-only on purpose - see start-all.bat.
REM ============================================================
cd /d "%~dp0"
set "ROOT=%CD%"
set "CODEX_VERSION=0.145.0"

if not exist "%ROOT%\runtime\data\node.exe" (
  echo [ERROR] runtime\data\node.exe not found. Place portable node v24.15.0+ first.
  pause
  exit /b 1
)

echo === Portable node version ===
"%ROOT%\runtime\data\node.exe" --version

echo.
echo === [1/3] Installing @openai/codex@%CODEX_VERSION% into runtime\codex - slow the first time ===
npm install @openai/codex@%CODEX_VERSION% --prefix "%ROOT%\runtime\codex" --no-audit --no-fund
if errorlevel 1 (
  echo [ERROR] @openai/codex install failed
  pause
  exit /b 1
)

echo.
echo === [2/3] Verifying the native binary ===
set "CODEX_EXE=%ROOT%\runtime\codex\node_modules\@openai\codex-win32-x64\vendor\x86_64-pc-windows-msvc\bin\codex.exe"
if not exist "%CODEX_EXE%" (
  echo [ERROR] codex.exe not found: this version may not ship a win32-x64 package. Change CODEX_VERSION and retry.
  pause
  exit /b 1
)
"%CODEX_EXE%" --version
if errorlevel 1 (
  echo [ERROR] codex.exe cannot run
  pause
  exit /b 1
)

echo.
echo === [3/3] Cloning upstream reference source into engines\codex - failure is harmless ===
if not exist "%ROOT%\engines\codex\.git" (
  git clone --depth 1 --branch rust-v%CODEX_VERSION% https://github.com/openai/codex "%ROOT%\engines\codex" || git clone --depth 1 https://github.com/openai/codex "%ROOT%\engines\codex" || echo [WARN] source clone failed, skipped - does not affect runtime, only the protocol reference source is missing
) else (
  echo engines\codex already exists, skipping clone
)

if not exist "%ROOT%\runtime\codex-home" mkdir "%ROOT%\runtime\codex-home"

echo.
echo ============================================================
echo  Bootstrap complete! Codex is bridged via the Sidecar on :7889;
echo  no resident process needed. Just run start-all.bat as usual and
echo  switch the console to the Codex engine.
echo ============================================================
pause
