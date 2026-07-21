@echo off
chcp 65001 >nul
REM ============================================================
REM  LXUP 一键启动所有服务
REM  每个服务在独立窗口运行，关闭窗口即停止对应服务
REM ============================================================
cd /d D:\lxup

echo [1/5] 启动 LXUP Sidecar (7889)...
start "LXUP-Sidecar-7889" cmd /k "cd /d D:\lxup && python -m sidecar.main --port 7889 --db-path D:\lxup\runtime\data\gateway.db"

echo [2/5] 启动 OpenClaw 网关 (18789)...
start "OpenClaw-Gateway-18789" cmd /k "cd /d D:\lxup && openclaw gateway --port 18789 --force"

echo [3/5] 启动 License Server (9000)...
start "License-Server-9000" cmd /k "cd /d D:\lxup && python -m license_server.main --port 9000 --db-path D:\lxup\runtime\data\license.db --jwt-secret lxup-dev-secret-2026"

echo [4/5] 启动 AI 助手 (8080)...
start "AI-Assistant-8080" cmd /k "cd /d D:\lxup\ai-assistant && node server.js"

echo [5/5] 启动前端 (5173)...
start "Frontend-5173" cmd /k "cd /d D:\lxup\control-ui && npm run dev"

echo.
echo ============================================================
echo  全部服务已启动：
echo    Sidecar         http://127.0.0.1:7889   (微信扫码登录桥接)
echo    OpenClaw 网关   http://127.0.0.1:18789  (AI 引擎)
echo    License Server  http://127.0.0.1:9000   (授权服务)
echo    AI 助手         http://127.0.0.1:8080   (独立助手，不经过网关)
echo    前端            http://localhost:5173
echo.
echo  浏览器打开 http://localhost:5173
echo  关闭某个服务 = 关闭对应的命令行窗口
echo ============================================================
pause
