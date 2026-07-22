@echo off
chcp 65001 >nul
setlocal
REM ============================================================
REM  OpenClaw 便携运行时引导（一次性，需联网）
REM  - 需要便携 node runtime\data\node.exe 已就位（v24.15.0+）
REM  - 把 openclaw npm 包装进 runtime\openclaw（由便携 node 运行）
REM ============================================================
cd /d "%~dp0"
set "ROOT=%CD%"

if not exist "%ROOT%\runtime\data\node.exe" (
  echo [错误] 未找到 runtime\data\node.exe，请先放入便携 node v24.15.0+
  pause
  exit /b 1
)

echo === 便携 node 版本 ===
"%ROOT%\runtime\data\node.exe" --version

echo.
echo === 安装 openclaw 到 runtime\openclaw，首次较久 ===
npm install openclaw --prefix "%ROOT%\runtime\openclaw" --no-audit --no-fund
if errorlevel 1 (
  echo [错误] openclaw 安装失败
  pause
  exit /b 1
)

echo.
echo === 验证 ===
"%ROOT%\runtime\data\node.exe" "%ROOT%\runtime\openclaw\node_modules\openclaw\openclaw.mjs" --version

echo.
echo ============================================================
echo  引导完成！可用 start-all.bat 或 Sidecar 启动 OpenClaw 网关。
echo ============================================================
pause
