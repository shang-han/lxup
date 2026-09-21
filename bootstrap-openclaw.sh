#!/bin/bash
# ============================================================
#  OpenClaw 便携运行时引导 —— 一次性，需联网
#  - 需要便携 Node 就位（runtime/data/node，或系统 node v24.15.0+）
#  - 安装 openclaw npm 包到 runtime/openclaw，由便携 node 运行
#  - 版本与 Windows 版保持一致（见 bootstrap-openclaw.bat 的 OPENCLAW_VERSION）
# ============================================================
set -euo pipefail
cd "$(dirname "$0")"
ROOT="$(pwd)"
OPENCLAW_VERSION="2026.7.1-2"

# 找 Node：便携 runtime/data/node 优先，回退系统 node
NODE="$ROOT/runtime/data/node"
[ -x "$NODE" ] || NODE="/usr/local/bin/node"
[ -x "$NODE" ] || NODE="/opt/homebrew/bin/node"
[ -x "$NODE" ] || NODE="$(command -v node 2>/dev/null || true)"
if [ -z "$NODE" ] || [ ! -x "$NODE" ]; then
  echo "[ERROR] Node not found. Place portable node v24.15.0+ at runtime/data/node, or install Node."
  exit 1
fi

echo "=== Portable node version ==="
"$NODE" --version

echo
echo "=== Installing openclaw@$OPENCLAW_VERSION into runtime/openclaw - slow the first time ==="
npm install "openclaw@$OPENCLAW_VERSION" --prefix "$ROOT/runtime/openclaw" --no-audit --no-fund
# npm 11+ 的 allowScripts 安全特性会拦安装脚本（postinstall 打包内置插件），需放行；
# 旧版 npm 无此命令则跳过
(cd "$ROOT/runtime/openclaw" && npm install-scripts approve --all >/dev/null 2>&1 || true)

echo
echo "=== Verify ==="
"$NODE" "$ROOT/runtime/openclaw/node_modules/openclaw/openclaw.mjs" --version

echo
echo "=== Preinstall WeChat plugin (needed for QR login; requires network, best-effort) ==="
export OPENCLAW_STATE_DIR="$ROOT/runtime/openclaw-home"
mkdir -p "$OPENCLAW_STATE_DIR"
"$NODE" "$ROOT/runtime/openclaw/node_modules/openclaw/openclaw.mjs" plugins install --force @tencent-weixin/openclaw-weixin@2.4.6 \
  || echo "[WARN] WeChat plugin preinstall failed (offline?). Later manual fix:"
echo "        openclaw plugins install @tencent-weixin/openclaw-weixin@2.4.6"

echo
echo "============================================================"
echo " Bootstrap complete! Start the OpenClaw gateway via LXUP.app or the Sidecar."
echo "============================================================"
