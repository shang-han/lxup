#!/bin/bash
# ============================================================
#  Hermes 便携运行时引导 —— 一次性，需联网
#  - 用 uv 下载独立 Python 3.11 到 runtime/python
#  - 从 PyPI 装 hermes-agent + 依赖到 runtime/hermes-libs（可重定位）
#  - 重新打本地补丁（scripts/apply_hermes_patches.py），保留 CORS 流式修复
#  - 创建 runtime/hermes-home（config / 会话 / 日志）
# ============================================================
set -euo pipefail
cd "$(dirname "$0")"
ROOT="$(pwd)"
PYVER="3.11"
HERMES_VER="0.18.2"

if ! command -v uv >/dev/null 2>&1; then
  echo "[ERROR] uv not found. Install: brew install uv   (or https://docs.astral.sh/uv/)"
  exit 1
fi

echo "============================================================"
echo "  Hermes portable runtime bootstrap"
echo "  Project root: $ROOT"
echo "============================================================"

echo
echo "[1/6] Downloading standalone Python $PYVER into runtime/python ..."
uv python install "$PYVER" --install-dir "$ROOT/runtime/python"

# 找便携 Python：macOS 独立构建在 cpython-*/bin/python3，Windows 在 cpython-*/python.exe
PYTHON=""
for d in "$ROOT"/runtime/python/cpython-*/bin/python3; do
  [ -x "$d" ] && PYTHON="$d"
done
if [ -z "$PYTHON" ]; then
  for d in "$ROOT"/runtime/python/cpython-*/python.exe; do
    [ -x "$d" ] && PYTHON="$d"
  done
fi
if [ -z "$PYTHON" ]; then
  echo "[ERROR] Python install dir not found under runtime/python"
  exit 1
fi
echo "      Python: $PYTHON"

echo
echo "[2/6] Making sure pip is available ..."
"$PYTHON" -m ensurepip --upgrade >/dev/null 2>&1 || true

echo
echo "[3/6] Installing hermes-agent==$HERMES_VER + deps from PyPI into runtime/hermes-libs - slow the first time ..."
uv pip install --python "$PYTHON" --target "$ROOT/runtime/hermes-libs" "hermes-agent==$HERMES_VER" aiohttp==3.14.1

echo
echo "[4/6] Installing LXUP general-tool skill deps (pypdf / python-docx / matplotlib / Pillow) ..."
uv pip install --python "$PYTHON" --break-system-packages "pypdf>=3.0" "python-docx>=1.0" "matplotlib>=3.5" "Pillow>=10.0" \
  || echo "[WARN] General-tool deps install failed - those skills will report missing libs."

echo
echo "[5/6] Re-applying local patches to vendored hermes-agent (idempotent) ..."
"$PYTHON" "$ROOT/scripts/apply_hermes_patches.py"

echo
echo "[6/6] Creating runtime/hermes-home ..."
mkdir -p "$ROOT/runtime/hermes-home"

echo
echo "============================================================"
echo " Bootstrap complete!"
echo " Now start the gateway via LXUP.app."
echo "============================================================"
