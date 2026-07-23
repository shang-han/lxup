@echo off
chcp 65001 >nul
setlocal
REM ============================================================
REM  Codex CLI 便携运行时引导（一次性，需联网）
REM  - 需要便携 node runtime\data\node.exe 已就位（v24.15.0+）
REM  - 把 @openai/codex npm 装进 runtime\codex（内含预编译原生
REM    二进制 codex.exe，无需 Rust 环境），由 Sidecar 按需拉起
REM  - 另克隆上游源码到 engines\codex 作协议参考（仅参考，不参与运行）
REM ============================================================
cd /d "%~dp0"
set "ROOT=%CD%"
set "CODEX_VERSION=0.145.0"

if not exist "%ROOT%\runtime\data\node.exe" (
  echo [错误] 未找到 runtime\data\node.exe，请先放入便携 node v24.15.0+
  pause
  exit /b 1
)

echo === 便携 node 版本 ===
"%ROOT%\runtime\data\node.exe" --version

echo.
echo === [1/3] 安装 @openai/codex@%CODEX_VERSION% 到 runtime\codex，首次较久 ===
npm install @openai/codex@%CODEX_VERSION% --prefix "%ROOT%\runtime\codex" --no-audit --no-fund
if errorlevel 1 (
  echo [错误] @openai/codex 安装失败
  pause
  exit /b 1
)

echo.
echo === [2/3] 校验原生二进制 ===
set "CODEX_EXE=%ROOT%\runtime\codex\node_modules\@openai\codex-win32-x64\vendor\x86_64-pc-windows-msvc\bin\codex.exe"
if not exist "%CODEX_EXE%" (
  echo [错误] 未找到 codex.exe：该版本可能未发布 win32-x64 平台包，请更换 CODEX_VERSION 后重试
  pause
  exit /b 1
)
"%CODEX_EXE%" --version
if errorlevel 1 (
  echo [错误] codex.exe 无法运行
  pause
  exit /b 1
)

echo.
echo === [3/3] 克隆上游参考源码到 engines\codex（失败不影响使用）===
if not exist "%ROOT%\engines\codex\.git" (
  git clone --depth 1 --branch rust-v%CODEX_VERSION% https://github.com/openai/codex "%ROOT%\engines\codex" || git clone --depth 1 https://github.com/openai/codex "%ROOT%\engines\codex" || echo [警告] 源码克隆失败，已跳过（不影响运行，仅缺协议参考源码）
) else (
  echo engines\codex 已存在，跳过克隆
)

if not exist "%ROOT%\runtime\codex-home" mkdir "%ROOT%\runtime\codex-home"

echo.
echo ============================================================
echo  引导完成！Codex 经 Sidecar(:7889) 桥接，无需常驻进程，
echo  start-all.bat 照常启动即可，控制台切到 Codex 引擎使用。
echo ============================================================
pause
