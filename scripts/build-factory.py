# -*- coding: utf-8 -*-
"""LXUP 出厂包（工厂包）打包脚本 —— 仓库内可移植版。

用法: <便携python> scripts\\build-factory.py  (可选 env LXUP_OUT=<输出目录>)

  # 例（便携 python 路径用 glob 探测，见 find_portable_python()）：
  #   D:\\lxup\\runtime\\python\\cpython-3.11.15-windows-x86_64-none\\python.exe scripts\\build-factory.py
  # 一键（含 exe 重建 + 打包 + 验证）：
  #   powershell -ExecutionPolicy Bypass -File scripts\\build-release.ps1

路径口径（不再写死，换机器/换盘符直接能跑）：
  ROOT  = 本脚本所在目录的上级（脚本固定放在 <ROOT>/scripts/ 下）
  OUT   = env LXUP_OUT；未设置时为 <ROOT> 的上级目录下的 lxup-release-<version>
  version 取 <ROOT>/runtime/version.json 的 version 字段
  产物名 = LXUP-factory-v<version>.zip

辅助模式（供 build-release.ps1 / 文档调用，不打包）：
  --locate-python  只打印探测到的便携 python.exe 绝对路径
  --print-zip      只打印本次将生成的 zip 绝对路径

出厂包口径 = 更新包口径 + openclaw 引擎本体 + codex 引擎本体，
并额外必带三样（缺任一，客户机 OpenClaw 网关起不来）：
  ① 脱敏后的 runtime/openclaw-home/openclaw.json（见 _sanitized_openclaw_config）
  ② runtime/openclaw-home/plugins/ 整目录（配置 plugins.load.paths 指向的插件本体）
  ③ 便携 node 旁的 npm（已随 runtime/data/ 母版一起进包，本脚本无需特殊处理）
详细口径与验证步骤见 scripts/打包说明.md。
"""
import sys, os, glob, json, re, zipfile, hashlib
sys.stdout.reconfigure(encoding='utf-8')

# ROOT 由脚本自身位置推导：脚本在 <ROOT>/scripts/build-factory.py
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read_version():
    """从 runtime/version.json 读版本号；读不到就直接报错（版本号决定产物名，不能瞎猜）。"""
    path = os.path.join(ROOT, 'runtime', 'version.json')
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        raise SystemExit('[FATAL] 无法读取 %s: %s' % (path, e))
    ver = str(data.get('version', '')).strip()
    if not ver:
        raise SystemExit('[FATAL] %s 里缺少 version 字段' % path)
    return ver


def find_portable_python():
    """探测便携 python：runtime/python/cpython-3.11*/python.exe。

    runtime/python 下可能同时存在旧的空壳目录 cpython-3.11-windows-x86_64-none
    （已在 EXCLUDE_DIRS 里被排除，不进包）与真正在用的 cpython-3.11.<patch>-...。
    规则：优先带 patch 号的目录，patch 号大的优先；同分时优先装了 PyInstaller 的那个
    （重建 LXUP启动器.exe 需要）。找不到返回 None。
    """
    base = os.path.join(ROOT, 'runtime', 'python')
    cands = []
    for d in glob.glob(os.path.join(base, 'cpython-3.11*')):
        if not os.path.isdir(d):
            continue
        if not os.path.isfile(os.path.join(d, 'python.exe')):
            continue
        m = re.match(r'^cpython-3\.11\.(\d+)', os.path.basename(d))
        patch = int(m.group(1)) if m else -1
        has_pyi = os.path.isfile(os.path.join(d, 'Scripts', 'pyinstaller.exe'))
        cands.append((patch, 1 if has_pyi else 0, os.path.basename(d), d))
    if not cands:
        return None
    # 排序键：patch 号降序 -> 有 pyinstaller 优先 -> 目录名降序
    cands.sort(key=lambda c: (c[0], c[1], c[2]), reverse=True)
    return cands[0][3]


if '--locate-python' in sys.argv[1:]:
    py = find_portable_python()
    if not py:
        raise SystemExit('[FATAL] 未在 %s 下找到 cpython-3.11*\\python.exe'
                         % os.path.join(ROOT, 'runtime', 'python'))
    print(py)
    raise SystemExit(0)

VERSION = read_version()
OUT = os.environ.get('LXUP_OUT', '').strip() or os.path.join(
    os.path.dirname(ROOT), 'lxup-release-' + VERSION)
zip_path = os.path.join(OUT, 'LXUP-factory-v%s.zip' % VERSION)

if '--print-zip' in sys.argv[1:]:
    print(zip_path)
    raise SystemExit(0)

# 出厂包 = 更新包口径 + openclaw 引擎本体 + codex 引擎本体
EXCLUDE_DIRS = {
    '.git', '__pycache__', 'node_modules/.cache',
    'runtime/openclaw-home', 'runtime/hermes-home', 'runtime/codex-home', 'runtime/logs',
    'ai-assistant/data',
    'engines',  # bootstrap-codex 会 clone openai/codex 协议参考源码到 engines\codex，运行时不需要，绝不进客户包
    'runtime/python/cpython-3.11-windows-x86_64-none',
    'runtime/python/.temp', 'runtime/python/.lock',
}
EXCLUDE_FILES = {
    '.sidecar.ready', 'runtime/data/.sidecar.ready',
    'package-lock.json', '_swap_launcher.bat',
    'LXUP启动器.exe.new', 'LXUP启动器.exe.old',
    'runtime/data/gateway.db', 'runtime/data/gateway.db-wal',
    'runtime/data/gateway.db-shm', 'runtime/data/gateway.db-journal',
    'runtime/data/sidecar.log',
    'runtime/python/.gitignore',
}

def norm(rel):
    return rel.replace(os.sep, '/')

# workspace 里会被 AI 边用边填内容的个人文件：进包时一律置空，
# 母版上无论怎么用都不会把真实信息打进客户包。
WORKSPACE_BLANK_FILES = {
    'runtime/workspace/USER.md',
    'runtime/workspace/MEMORY.md',
    'runtime/workspace/IDENTITY.md',
}

def is_excluded_dir(rel):
    return any(rel == x or rel.startswith(x + '/') for x in EXCLUDE_DIRS)

# 出厂必须带一份脱敏 openclaw.json：runtime/openclaw-home 整个被排除，
# 但没有这份配置网关会直接拒绝就绪（Missing config / gateway.mode）。
# 口径与 build-portable.ps1 一致：token 重置、apiKey 清空、通道清空。
def _sanitized_openclaw_config():
    src = os.path.join(ROOT, 'runtime', 'openclaw-home', 'openclaw.json')
    if not os.path.isfile(src):
        # 三必带之①：没有它客户机网关直接 Missing config，宁可打包失败也别出坏包。
        raise SystemExit('[FATAL] 母版 openclaw.json 不存在: %s' % src)
    with open(src, 'r', encoding='utf-8') as f:
        cfg = json.load(f)
    gw = cfg.get('gateway')
    if isinstance(gw, dict) and isinstance(gw.get('auth'), dict):
        gw['auth']['token'] = 'dev-local-token'
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
    return json.dumps(cfg, ensure_ascii=False, indent=2).encode('utf-8')

os.makedirs(OUT, exist_ok=True)

# 若 LXUP_OUT 被指到仓库内，避免把正在写的 zip 自己打进去。
zip_abs = os.path.abspath(zip_path)
root_abs = os.path.abspath(ROOT)
try:
    inside_root = os.path.commonpath([zip_abs, root_abs]) == root_abs
except ValueError:
    # 不同盘符（Windows）时 commonpath 会抛 ValueError，此时必然不在仓库内
    inside_root = False
if inside_root:
    print('[WARN] LXUP_OUT 位于仓库内，产物 zip 自身会被跳过：%s' % zip_abs)

# 预检：三必带之①②先算好/先确认存在，再开始写 zip。
# 这样一旦母版缺东西，是直接报错退出，而不是留下一个残缺的 zip 被误当成好包。
cfg_data = _sanitized_openclaw_config()
plugins_root = os.path.join(ROOT, 'runtime', 'openclaw-home', 'plugins')
if not os.path.isdir(plugins_root):
    raise SystemExit('[FATAL] 三必带之②缺失：插件目录不存在 %s' % plugins_root)
if not any(True for _b, _d, _f in os.walk(plugins_root) if _f):
    raise SystemExit('[FATAL] 三必带之②缺失：插件目录是空的 %s' % plugins_root)

# 三必带之③：便携 node 旁必须有 npm（bootstrap-openclaw.bat 会自动 stage 进来）。
# 裸跑本脚本（不经 build-release.ps1 的验证段）时，缺 npm 也要当场拦下，
# 否则会打出一个"客户机装插件时才发现 npm.cmd 找不到"的坏包。
npm_cmd = os.path.join(ROOT, 'runtime', 'data', 'npm.cmd')
npm_cli = os.path.join(ROOT, 'runtime', 'data', 'node_modules', 'npm', 'bin', 'npm-cli.js')
if not (os.path.isfile(npm_cmd) and os.path.isfile(npm_cli)):
    raise SystemExit(
        '[FATAL] 三必带之③缺失：runtime/data 里没有便携 node 旁的 npm\n'
        '        需要: %s\n        需要: %s\n'
        '        补救: 跑一次 bootstrap-openclaw.bat（它会自动把系统 npm stage 进 runtime/data），别手工拷。'
        % (npm_cmd, npm_cli))

count = 0; total = 0
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
    for base, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in {'.git', '__pycache__'}]
        keep = []
        for d in dirs:
            rel = norm(os.path.relpath(os.path.join(base, d), ROOT))
            if not is_excluded_dir(rel):
                keep.append(d)
        dirs[:] = keep
        for name in files:
            if name.endswith('.pyc'):
                continue
            full = os.path.join(base, name)
            if inside_root and os.path.abspath(full) == zip_abs:
                continue
            rel = norm(os.path.relpath(full, ROOT))
            if rel in EXCLUDE_FILES:
                continue
            if rel in WORKSPACE_BLANK_FILES:
                data = b''
            else:
                with open(full, 'rb') as src:
                    data = src.read()
            info = zipfile.ZipInfo.from_file(full, rel)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.flag_bits |= 0x800
            zf.writestr(info, data)
            count += 1
            total += info.file_size

    cfg_rel = 'runtime/openclaw-home/openclaw.json'
    cfg_info = zipfile.ZipInfo(cfg_rel)
    cfg_info.compress_type = zipfile.ZIP_DEFLATED
    cfg_info.flag_bits |= 0x800
    zf.writestr(cfg_info, cfg_data)
    count += 1
    total += len(cfg_data)

    # 出厂必须带 openclaw 插件本体：配置里 plugins.load.paths 指向
    # openclaw-home/plugins/ 下的四个插件，不带上它们网关配置校验会直接失败。
    # plugins_root 已在上方预检时确认存在且非空。
    for base, dirs, files in os.walk(plugins_root):
        dirs[:] = [d for d in dirs if d != '.git']
        for name in files:
            if name.endswith('.pyc'):
                continue
            full = os.path.join(base, name)
            rel = norm(os.path.relpath(full, ROOT))
            with open(full, 'rb') as src:
                data = src.read()
            info = zipfile.ZipInfo.from_file(full, rel)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.flag_bits |= 0x800
            zf.writestr(info, data)
            count += 1
            total += info.file_size

h = hashlib.sha256()
with open(zip_path, 'rb') as f:
    for c in iter(lambda: f.read(1024 * 1024), b''):
        h.update(c)

print('出厂包打包完成')
print('版本:', VERSION)
print('仓库根:', ROOT)
print('文件数:', count)
print('未压缩:', round(total / 1024 / 1024), 'MB')
print('压缩后:', round(os.path.getsize(zip_path) / 1024 / 1024, 1), 'MB')
print('sha256:', h.hexdigest())
print('路径:', zip_path)
