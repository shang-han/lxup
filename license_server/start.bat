@echo off
title License Server

REM ============================================
REM  License Server Startup Script
REM  Change JWT_SECRET and ADMIN_TOKEN below
REM ============================================

set JWT_SECRET=change-to-a-random-secret-at-least-32-chars
set ADMIN_TOKEN=admin321
set PORT=9000
cd /d %~dp0..
set ROOT=%cd%
set DB_PATH=%ROOT%\data\license.db

if not exist "%ROOT%\data" mkdir "%ROOT%\data"

echo ========================================
echo   License Server
echo   Port: %PORT%
echo   DB:   %DB_PATH%
echo   URL:  http://127.0.0.1:%PORT%/admin?token=YOUR_TOKEN
echo ========================================
echo.

python -m license_server.main --port %PORT% --jwt-secret "%JWT_SECRET%" --admin-token "%ADMIN_TOKEN%" --db-path "%DB_PATH%"

pause
