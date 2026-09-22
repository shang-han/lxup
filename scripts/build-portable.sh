#!/bin/bash
# ============================================================
#  LXUP 便携包构建（macOS）—— 对应 Windows 的 build-portable.ps1
#
#  用法：bash scripts/build-portable.sh [输出目录]
#  默认输出到 <项目根>/../deliverables/LXUP-Portable-<时间戳>.zip
#
#  做的事：
#    - 打包启动器（LXUP.app）+ 前端 + sidecar + 三个引擎运行时
#    - 清理本机痕迹（API Key / 登录态 / 会话 / 激活态）
#    - 校验关键文件，打成 zip
#
#  注意：正式交付前还需对 LXUP.app 做正式签名 + 公证（见 README）。
# ============================================================
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_DIR="${1:-$PROJECT_ROOT/../deliverables}"
STAMP="$(date +%Y%m%d-%H%M%S)"
PACKAGE_NAME="LXUP"
STAGE_ROOT="$OUTPUT_DIR/$PACKAGE_NAME"
ARCHIVE_PATH="$OUTPUT_DIR/LXUP-Portable-$STAMP.zip"

log() { echo "[build-portable] $*"; }
die() { echo "[build-portable] ERROR: $*" >&2; exit 1; }

# ── 前置检查 ──────────────────────────────────────────────
[ -d "$STAGE_ROOT" ] && die "staging dir already exists: $STAGE_ROOT"
[ -f "$ARCHIVE_PATH" ] && die "archive already exists: $ARCHIVE_PATH"
command -v zip >/dev/null 2>&1 || die "zip is required (install via xcode-select or brew)"

log "Output:      $ARCHIVE_PATH"
log "Staging:     $STAGE_ROOT"

mkdir -p "$STAGE_ROOT"

# 复制工具（rsync 带排除；无 rsync 时回退 cp -R）
copy_tree() {
  local src="$1" dst="$2"; shift 2
  if command -v rsync >/dev/null 2>&1; then
    rsync -a "$@" "$src/" "$dst/"
  else
    cp -R "$src" "$dst" 2>/dev/null || true
  fi
}

# ── 1. 启动器 ─────────────────────────────────────────────
[ -d "$PROJECT_ROOT/LXUP.app" ] || die "LXUP.app missing"
log "复制启动器 LXUP.app ..."
cp -R "$PROJECT_ROOT/LXUP.app" "$STAGE_ROOT/"

# ── 2. 项目文件 ───────────────────────────────────────────
log "复制项目文件 ..."
for f in launcher_gui.py LXUP-icon.ico README.md \
         bootstrap-openclaw.sh bootstrap-hermes.sh bootstrap-codex.sh stop-all.sh; do
  [ -f "$PROJECT_ROOT/$f" ] && cp "$PROJECT_ROOT/$f" "$STAGE_ROOT/"
done

# ── 3. 目录树 ─────────────────────────────────────────────
log "复制目录树 ..."
copy_tree "$PROJECT_ROOT/ai-assistant" "$STAGE_ROOT/ai-assistant" --exclude='/data/' --exclude='start.bat'
copy_tree "$PROJECT_ROOT/control-ui" "$STAGE_ROOT/control-ui" --exclude='/dist/'
copy_tree "$PROJECT_ROOT/sidecar" "$STAGE_ROOT/sidecar" --exclude='__pycache__/'
# 只保留 bootstrap-hermes 运行时依赖的 apply_hermes_patches.py，
# 打包/发布工具（build-factory/build-release/secret-scan/打包说明/build-portable）不进客户包
mkdir -p "$STAGE_ROOT/scripts"
cp "$PROJECT_ROOT/scripts/apply_hermes_patches.py" "$STAGE_ROOT/scripts/"
copy_tree "$PROJECT_ROOT/skill-packs" "$STAGE_ROOT/skill-packs"

# ── 4. 运行时 ─────────────────────────────────────────────
log "复制运行时 ..."
mkdir -p "$STAGE_ROOT/runtime"

copy_tree "$PROJECT_ROOT/runtime/codex" "$STAGE_ROOT/runtime/codex"
copy_tree "$PROJECT_ROOT/runtime/hermes-libs" "$STAGE_ROOT/runtime/hermes-libs"
# 去掉 TS 源码/映射（运行不需要，也减小体积）
copy_tree "$PROJECT_ROOT/runtime/openclaw" "$STAGE_ROOT/runtime/openclaw" \
  --exclude='*.map' --exclude='*.ts' --exclude='*.mts' --exclude='*.cts'

# 便携 Python（runtime/python/cpython-*，取版本号最长者）
PY_NAME="$(cd "$PROJECT_ROOT/runtime/python" 2>/dev/null && ls -d cpython-* 2>/dev/null | tail -1)"
[ -n "$PY_NAME" ] || die "bundled Python missing under runtime/python"
mkdir -p "$STAGE_ROOT/runtime/python"
copy_tree "$PROJECT_ROOT/runtime/python/$PY_NAME" "$STAGE_ROOT/runtime/python/$PY_NAME" --exclude='.lock'

# 便携 Node（runtime/data/node）；缺失时告警（交付包会退化为依赖系统 node）
mkdir -p "$STAGE_ROOT/runtime/data"
if [ -f "$PROJECT_ROOT/runtime/data/node" ]; then
  cp "$PROJECT_ROOT/runtime/data/node" "$STAGE_ROOT/runtime/data/"
else
  log "WARN: runtime/data/node 缺失 —— 便携 Node 未打包，交付包将依赖目标机系统 node"
fi

# ── 5. workspace 人格文件 ─────────────────────────────────
mkdir -p "$STAGE_ROOT/runtime/workspace"
for f in AGENTS.md HEARTBEAT.md IDENTITY.md SOUL.md TOOLS.md USER.md MEMORY.md; do
  [ -f "$PROJECT_ROOT/runtime/workspace/$f" ] || continue
  case "$f" in
    IDENTITY.md|USER.md|MEMORY.md) : > "$STAGE_ROOT/runtime/workspace/$f" ;;  # AI 边用边填的个人文件，进包一律置空
    *) cp "$PROJECT_ROOT/runtime/workspace/$f" "$STAGE_ROOT/runtime/workspace/" ;;
  esac
done

# ── 6. 引擎家目录（只留静态技能，不带登录态/会话）──────────
mkdir -p "$STAGE_ROOT/runtime/hermes-home" "$STAGE_ROOT/runtime/codex-home" "$STAGE_ROOT/runtime/openclaw-home"

[ -d "$PROJECT_ROOT/runtime/hermes-home/skills" ] && \
  copy_tree "$PROJECT_ROOT/runtime/hermes-home/skills" "$STAGE_ROOT/runtime/hermes-home/skills" \
    --exclude='.curator_backups' --exclude='*.lock'
[ -d "$PROJECT_ROOT/runtime/codex-home/skills" ] && \
  copy_tree "$PROJECT_ROOT/runtime/codex-home/skills" "$STAGE_ROOT/runtime/codex-home/skills" --exclude='*.lock'

# openclaw-home：配置 + 已装插件（npm/projects），不带 agents/sessions/logs 等用户态
[ -f "$PROJECT_ROOT/runtime/openclaw-home/openclaw.json" ] && \
  cp "$PROJECT_ROOT/runtime/openclaw-home/openclaw.json" "$STAGE_ROOT/runtime/openclaw-home/"
[ -d "$PROJECT_ROOT/runtime/openclaw-home/npm" ] && \
  copy_tree "$PROJECT_ROOT/runtime/openclaw-home/npm" "$STAGE_ROOT/runtime/openclaw-home/npm"

# ── 7. 清理 openclaw.json 里的本机痕迹 ────────────────────
log "清理 openclaw.json 本机痕迹 ..."
if [ -f "$STAGE_ROOT/runtime/openclaw-home/openclaw.json" ]; then
  python3 - "$STAGE_ROOT/runtime/openclaw-home/openclaw.json" <<'PY'
import json, sys
p = sys.argv[1]
cfg = json.load(open(p, encoding='utf-8'))
gw = cfg.get('gateway') or {}
if isinstance(gw, dict):
    gw.setdefault('auth', {})['token'] = 'dev-local-token'
    cfg['gateway'] = gw
# 递归清空所有 apiKey 字段（与 build-factory.py 的 _blank_keys 对齐），并清渠道登录态
def _blank_keys(obj):
    if isinstance(obj, dict):
        for k, v in list(obj.items()):
            if k == 'apiKey' and isinstance(v, str) and v:
                obj[k] = ''
            else:
                _blank_keys(v)
    elif isinstance(obj, list):
        for item in obj:
            _blank_keys(item)
_blank_keys(cfg)
cfg['channels'] = {}
# 清空模型提供方 + 默认模型（客户从零配置，不把开发机模型配置带进包）
m = cfg.get('models')
if isinstance(m, dict):
    m['providers'] = {}
a = cfg.get('agents')
if isinstance(a, dict) and isinstance(a.get('defaults'), dict):
    a['defaults'].pop('model', None)
# 通道插件仍启用（deepseek/weixin/qqbot/wecom）
entries = (cfg.get('plugins') or {}).get('entries') or {}
cfg.setdefault('plugins', {})['entries'] = {k: {'enabled': True} for k in entries}
json.dump(cfg, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('  cleaned openclaw.json')
PY
fi

# ── 8. 校验关键文件 ───────────────────────────────────────
log "校验关键文件 ..."
REQUIRED=(
  "LXUP.app/Contents/MacOS/launcher"
  "launcher_gui.py"
  "control-ui/node_modules/vite/bin/vite.js"
  "runtime/openclaw/node_modules/openclaw/openclaw.mjs"
  "runtime/hermes-libs/hermes_cli/main.py"
)
for r in "${REQUIRED[@]}"; do
  [ -e "$STAGE_ROOT/$r" ] || die "missing required file: $r"
done

# ── 9. 打 zip ─────────────────────────────────────────────
log "创建 zip ..."
mkdir -p "$OUTPUT_DIR"
( cd "$OUTPUT_DIR" && zip -qr "$ARCHIVE_PATH" "$PACKAGE_NAME" )

# ── 9.5 密钥泄露扫描（复用 Windows 的 secret-scan.py，硬闸门）──
# 扫 staging 目录（相对路径无 LXUP 前缀，EXCL 才能正确排除第三方引擎目录）
log "密钥泄露扫描 ..."
if [ -f "$PROJECT_ROOT/scripts/secret-scan.py" ]; then
  python3 "$PROJECT_ROOT/scripts/secret-scan.py" "$STAGE_ROOT" --strict
fi

log "完成："
log "  Portable folder: $STAGE_ROOT"
log "  ZIP archive:     $ARCHIVE_PATH"
