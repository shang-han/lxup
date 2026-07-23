@echo off
REM ============================================================
REM  LXUP - stop all services
REM  Stops each service by the port it listens on (and its whole
REM  process tree), so it will NOT kill unrelated python/node
REM  programs on this machine. Requires Administrator.
REM
REM  NOTE: keep this file ASCII-only on purpose. Saving Chinese
REM  text as UTF-8 + "chcp 65001" makes cmd.exe mis-parse batch
REM  lines (splits one line into several commands). ASCII is safe
REM  under every code page and every way of launching the file.
REM ============================================================
setlocal enabledelayedexpansion

REM --- privilege check: fail loudly instead of silently ---
net session >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Administrator privileges are required to stop the services.
    echo         Right-click this file -^> "Run as administrator", then retry.
    echo.
    pause
    exit /b 1
)

echo Stopping all LXUP services...
echo.

REM --- for each service port, find the listening PID and kill its tree ---
set "PORTS=7889 18789 8642 9000 8080 5173"
set "FOUND="
for %%P in (%PORTS%) do (
    set "KILLED="
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr /R /C:":%%P .*LISTENING"') do (
        set "KILLED=1"
        set "FOUND=1"
        echo  -^> port %%P   PID %%a   stopping...
        taskkill /F /T /PID %%a
    )
    if not defined KILLED (
        echo  -^> port %%P   not running, skipped.
    )
)

echo.
if defined FOUND (
    echo All running LXUP services have been stopped.
) else (
    echo No running LXUP services detected.
)
echo.
pause
endlocal
