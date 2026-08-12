@echo off
setlocal EnableExtensions DisableDelayedExpansion
REM LXUP single entry point — portable Python only, no wrapper EXE.
cd /d "%~dp0"
set "ROOT=%CD%"

REM Unblock any files marked as "from Internet" (WeChat transfer / zip download).
REM Skip this step if PowerShell is not available (rare pre-Win7 / Server Core).
where powershell >nul 2>&1
if not errorlevel 1 (
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "Get-ChildItem -LiteralPath '%ROOT%' -Recurse -File -Force -ErrorAction SilentlyContinue | Unblock-File -ErrorAction SilentlyContinue" 2>nul
)

set "PYDIR="
for /f "delims=" %%D in ('dir /b /ad /o-n "%ROOT%\runtime\python\cpython-3.11.*-windows-*" 2^>nul') do if not defined PYDIR set "PYDIR=%ROOT%\runtime\python\%%D"
if not defined PYDIR for /f "delims=" %%D in ('dir /b /ad /o-n "%ROOT%\runtime\python\cpython-*-windows-*" 2^>nul') do if not defined PYDIR set "PYDIR=%ROOT%\runtime\python\%%D"
if not defined PYDIR (
  echo [ERROR] Portable Python not found under runtime\python.
  pause
  exit /b 1
)
if not exist "%PYDIR%\python.exe" (
  echo [ERROR] Portable Python executable not found: "%PYDIR%\python.exe"
  pause
  exit /b 1
)

"%PYDIR%\python.exe" "%ROOT%\launcher.py" %*
set "CODE=%ERRORLEVEL%"
if not "%CODE%"=="0" pause
exit /b %CODE%
