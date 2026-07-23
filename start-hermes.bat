@echo off
chcp 65001 >nul
setlocal
REM ============================================================
REM  启动 Hermes 网关（用项目内便携 Python，api_server :8642）
REM  Hermes 引擎「自己的」网关，独立于 OpenClaw，可与之同时运行。
REM  首次使用请先运行 bootstrap-hermes.bat。
REM ============================================================
cd /d "%~dp0"
set "ROOT=%CD%"

set "PYDIR="
for /d %%D in ("%ROOT%\runtime\python\cpython-*") do set "PYDIR=%%D"
if not defined PYDIR (
  echo [错误] 未找到便携 Python，请先运行 bootstrap-hermes.bat
  pause
  exit /b 1
)
set "PYTHON=%PYDIR%\python.exe"
if not exist "%ROOT%\runtime\hermes-libs" (
  echo [错误] 未找到 runtime\hermes-libs，请先运行 bootstrap-hermes.bat
  pause
  exit /b 1
)

set "HERMES_HOME=%ROOT%\runtime\hermes-home"
if not exist "%HERMES_HOME%" mkdir "%HERMES_HOME%"
REM hermes 代码 + 依赖都在 hermes-libs（pip 安装），不再依赖 engines/hermes 源码
set "PYTHONPATH=%ROOT%\runtime\hermes-libs"

REM 启用 api_server 平台（Hermes 自己的 HTTP + SSE 聊天网关）
set "API_SERVER_ENABLED=true"
set "API_SERVER_HOST=127.0.0.1"
set "API_SERVER_PORT=8642"
set "API_SERVER_KEY=lxup-hermes-dev-2026"
set "API_SERVER_CORS_ORIGINS=*"

echo ============================================================
echo  启动 Hermes 网关  http://127.0.0.1:8642
echo  HERMES_HOME: %HERMES_HOME%
echo ============================================================
"%PYTHON%" -m hermes_cli.main gateway run
pause
