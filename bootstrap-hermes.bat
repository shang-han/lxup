@echo off
chcp 65001 >nul
setlocal
REM ============================================================
REM  Hermes 便携运行时引导（一次性，需联网）
REM  - 用 uv 下载独立 Python 3.11 到 runtime\python
REM  - 从 PyPI 安装 hermes-agent 及依赖到 runtime\hermes-libs（可重定位）
REM  - 创建 runtime\hermes-home（Hermes 家目录，配置/会话/日志都在这）
REM  完成后用 start-hermes.bat 启动网关。
REM ============================================================
cd /d "%~dp0"
set "ROOT=%CD%"
set "PYVER=3.11"
set "HERMES_VER=0.18.2"

echo ============================================================
echo  Hermes 便携运行时引导
echo  项目根目录: %ROOT%
echo ============================================================

where uv >nul 2>&1
if errorlevel 1 (
  echo [错误] 未找到 uv，请先安装 uv（https://docs.astral.sh/uv/）。
  pause
  exit /b 1
)

echo.
echo [1/4] 下载独立 Python %PYVER% 到 runtime\python ...
uv python install %PYVER% --install-dir "%ROOT%\runtime\python"
if errorlevel 1 ( echo [错误] Python 下载失败 & pause & exit /b 1 )

set "PYDIR="
for /d %%D in ("%ROOT%\runtime\python\cpython-*") do set "PYDIR=%%D"
if not defined PYDIR ( echo [错误] 未找到 Python 安装目录 & pause & exit /b 1 )
set "PYTHON=%PYDIR%\python.exe"
echo       Python: %PYTHON%

echo.
echo [2/4] 确保 pip 可用 ...
"%PYTHON%" -m ensurepip --upgrade >nul 2>&1

echo.
echo [3/4] 从 PyPI 安装 hermes-agent==%HERMES_VER% 及依赖到 runtime\hermes-libs（首次较久）...
"%PYTHON%" -m pip install --no-warn-script-location --target "%ROOT%\runtime\hermes-libs" hermes-agent==%HERMES_VER% aiohttp==3.14.1
if errorlevel 1 ( echo [错误] 依赖安装失败 & pause & exit /b 1 )

echo.
echo [4/4] 创建 runtime\hermes-home ...
if not exist "%ROOT%\runtime\hermes-home" mkdir "%ROOT%\runtime\hermes-home"

echo.
echo ============================================================
echo  引导完成！
echo  现在可运行 start-hermes.bat 启动 Hermes 网关。
echo ============================================================
pause
