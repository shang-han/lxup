@echo off
chcp 65001 >nul
cd /d %~dp0

if not exist .env (
    echo [提示] 未找到 .env，已从 .env.example 复制，请先填写 API_KEY 再启动。
    copy /y .env.example .env >nul
    notepad .env
)

echo 正在启动 LXUP AI 助手（端口见 .env，默认 8080）...
node server.js
pause
