@echo off
REM ============================================================
REM  LXUP - start all services
REM  Each service runs in its own window; close that window to
REM  stop the service.
REM
REM  NOTE: ASCII-only on purpose. Chinese text saved as UTF-8 +
REM  "chcp 65001" makes cmd.exe mis-parse batch lines.
REM ============================================================
cd /d D:\lxup

echo [1/5] Starting LXUP Sidecar (7889)...
start "LXUP-Sidecar-7889" cmd /k "cd /d D:\lxup && python -m sidecar.main --port 7889 --db-path D:\lxup\runtime\data\gateway.db"

echo [2/5] Starting OpenClaw gateway (18789)...
start "OpenClaw-Gateway-18789" cmd /k "cd /d D:\lxup && D:\lxup\runtime\data\node.exe D:\lxup\runtime\openclaw\node_modules\openclaw\openclaw.mjs gateway --port 18789 --force"

echo [3/5] Starting Hermes gateway (8642)...
start "Hermes-Gateway-8642" cmd /k "cd /d D:\lxup && start-hermes.bat"

echo [4/5] Starting AI Assistant (8080)...
start "AI-Assistant-8080" cmd /k "cd /d D:\lxup\ai-assistant && D:\lxup\runtime\data\node.exe server.js"

echo [5/5] Starting Frontend (5173)...
start "Frontend-5173" cmd /k "cd /d D:\lxup\control-ui && D:\lxup\runtime\data\node.exe node_modules\vite\bin\vite.js"

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
