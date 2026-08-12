@echo off
setlocal EnableExtensions DisableDelayedExpansion
cd /d "%~dp0"
set "ROOT=%CD%"

REM Unblock files marked as "from Internet" (WeChat / zip download).
where powershell >nul 2>&1
if not errorlevel 1 (
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "Get-ChildItem -LiteralPath '%ROOT%\..' -Recurse -File -Force -ErrorAction SilentlyContinue | Unblock-File -ErrorAction SilentlyContinue" 2>nul
)

set "NODE=%ROOT%\..\runtime\data\node.exe"
if not exist "%NODE%" (
  echo [ERROR] Portable node.exe not found: %NODE%
  pause
  exit /b 1
)

if not exist .env (
    echo [提示] 未找到 .env，已从 .env.example 复制，请先填写 API_KEY 再启动。
    copy /y .env.example .env >nul
    notepad .env
)

echo 正在启动 LXUP AI 助手（端口见 .env，默认 8080）...
"%NODE%" server.js
set "CODE=%ERRORLEVEL%"
if not "%CODE%"=="0" pause
exit /b %CODE%
