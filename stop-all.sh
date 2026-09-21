#!/bin/bash
# ============================================================
#  LXUP - stop all services（macOS/Linux）
#  按各服务监听端口定位 PID，终止其进程树。
#  端口与 launcher_gui.py / stop-all.bat 保持一致。
# ============================================================
set -u

PORTS="7889 18789 8642 8080 5173"
FOUND=0

kill_tree() {
  local pid="$1"
  local pgid
  pgid=$(ps -o pgid= -p "$pid" 2>/dev/null | tr -d ' ')
  if [ -n "$pgid" ] && [ "$pgid" = "$pid" ]; then
    # 进程组组长（launcher 以 start_new_session 启动）→ 整组杀，连带子进程
    kill -9 -- "-$pgid" 2>/dev/null
  else
    kill -9 "$pid" 2>/dev/null
  fi
}

echo "Stopping all LXUP services..."
echo
for P in $PORTS; do
  PIDS=$(lsof -nP -iTCP:"$P" -sTCP:LISTEN -t 2>/dev/null)
  if [ -z "$PIDS" ]; then
    echo "  -> port $P   not running, skipped."
    continue
  fi
  for PID in $PIDS; do
    echo "  -> port $P   PID $PID   stopping..."
    kill_tree "$PID" || echo "     [WARN] Could not stop PID $PID"
    FOUND=1
  done
done
echo
if [ "$FOUND" = "1" ]; then
  echo "All running LXUP services have been stopped."
else
  echo "No running LXUP services detected."
fi
