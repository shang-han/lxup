@echo off
chcp 65001 >nul
REM ============================================================
REM  LXUP 停止所有服务
REM  注意：会终止所有 python / node 进程（本机若跑着其他
REM  Python/Node 程序请慎用，或手动关闭对应的服务窗口）
REM ============================================================
echo 正在停止所有 LXUP 服务...
taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
echo 已停止。
pause
