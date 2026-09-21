#!/bin/bash
# ============================================================
#  Codex CLI 便携运行时引导 —— 一次性，需联网
#  - 安装 @openai/codex npm 包到 runtime/codex，内含预编译原生二进制，无需 Rust
#  - 由 Sidecar（:7889）按需拉起，无常驻进程
#  - 顺带浅克隆上游源码到 engines/codex（协议参考，不参与运行）
# ============================================================
set -euo pipefail
cd "$(dirname "$0")"
ROOT="$(pwd)"
CODEX_VERSION="0.145.0"

# 找 Node
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
echo "=== [1/3] Installing @openai/codex@$CODEX_VERSION into runtime/codex - slow the first time ==="
npm install "@openai/codex@$CODEX_VERSION" --prefix "$ROOT/runtime/codex" --no-audit --no-fund

echo
echo "=== [2/3] Verifying the native binary ==="
CODEX_BIN=""
for exe in "$ROOT"/runtime/codex/node_modules/@openai/codex-*/vendor/*/bin/codex; do
  [ -x "$exe" ] && CODEX_BIN="$exe" && break
done
if [ -z "$CODEX_BIN" ]; then
  echo "[ERROR] codex binary not found: this version may not ship a native package for this platform. Change CODEX_VERSION and retry."
  exit 1
fi
"$CODEX_BIN" --version

echo
echo "=== [3/3] Cloning upstream reference source into engines/codex - failure is harmless ==="
if [ ! -d "$ROOT/engines/codex/.git" ]; then
  git clone --depth 1 --branch "rust-v$CODEX_VERSION" https://github.com/openai/codex "$ROOT/engines/codex" \
    || git clone --depth 1 https://github.com/openai/codex "$ROOT/engines/codex" \
    || echo "[WARN] source clone failed, skipped - does not affect runtime, only the protocol reference source is missing"
else
  echo "engines/codex already exists, skipping clone"
fi

mkdir -p "$ROOT/runtime/codex-home"

echo
echo "============================================================"
echo " Bootstrap complete! Codex is bridged via the Sidecar on :7889; no resident process needed."
echo "============================================================"
