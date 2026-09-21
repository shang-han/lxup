<#
.SYNOPSIS
    LXUP 出厂包（工厂包）一键构建：重建 exe -> 打包 -> 自动验证。

.DESCRIPTION
    步骤：
      1) 探测便携 python（runtime\python\cpython-3.11*\python.exe）
      2) 用便携 python 跑 PyInstaller 重建 LXUP启动器.exe（onefile + windowed + 图标），
         构建产物复制回仓库根覆盖
      3) 跑 scripts\build-factory.py 打出厂包 zip
      4) 自动验证：关键条目检查 + 动态密钥泄露扫描
         （密钥值运行时从母版 runtime\openclaw-home\openclaw.json 提取，脚本内绝不明文硬编码）
    任一步失败立即停止并打印是哪一步。口径详见 scripts\打包说明.md。

.USAGE
    cd D:\lxup
    powershell -NoProfile -ExecutionPolicy Bypass -File scripts\build-release.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File scripts\build-release.ps1 -SkipExe
    powershell -NoProfile -ExecutionPolicy Bypass -File scripts\build-release.ps1 -OutDir E:\deliver

.PARAMETER OutDir
    输出目录（透传给 build-factory.py 的 env LXUP_OUT）。
    默认 = <仓库根的上级>\lxup-release-<version>，例如 D:\lxup-release-2.4.0。

.PARAMETER SkipExe
    跳过第 2 步（不重建 exe，用仓库根现有的 LXUP启动器.exe），只打包 + 验证。

.NOTES
    本文件必须保存为 UTF-8 **with BOM**：Windows PowerShell 5.1 无 BOM 时按系统 ANSI(GBK)
    解码 .ps1，会把 'LXUP启动器' 等中文字面量弄乱，导致 PyInstaller 产物名/复制目标错位。
#>
[CmdletBinding()]
param(
    [string]$OutDir = '',
    [switch]$SkipExe
)

$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch { }

$script:StepName = 'init'
function Step([string]$Name) {
    $script:StepName = $Name
    Write-Host ''
    Write-Host ("== {0} ==" -f $Name) -ForegroundColor Cyan
}
function Fail([string]$Msg) {
    Write-Host ''
    Write-Host ("[FAIL] 步骤「{0}」失败: {1}" -f $script:StepName, $Msg) -ForegroundColor Red
    throw ("步骤「{0}」失败: {1}" -f $script:StepName, $Msg)
}
function Ok([string]$Msg) { Write-Host ("  [OK] {0}" -f $Msg) -ForegroundColor Green }
function Info([string]$Msg) { Write-Host ("  {0}" -f $Msg) }

$repoRoot = Split-Path -Parent $PSScriptRoot
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'

Write-Host 'LXUP 出厂包一键构建'
Info ("仓库根 : {0}" -f $repoRoot)
Info ("跳过 exe: {0}" -f [bool]$SkipExe)

# ---------------------------------------------------------------- 步骤 0：前置检查
Step '0/4 前置检查'
foreach ($p in @('launcher_gui.py', 'LXUP-icon.ico', 'runtime\version.json', 'scripts\build-factory.py')) {
    if (-not (Test-Path -LiteralPath (Join-Path $repoRoot $p))) { Fail ("仓库缺少必需文件: {0}" -f $p) }
}
$versionFile = Join-Path $repoRoot 'runtime\version.json'
try { $version = (Get-Content -LiteralPath $versionFile -Raw -Encoding UTF8 | ConvertFrom-Json).version }
catch { Fail ("无法解析 runtime\version.json: {0}" -f $_.Exception.Message) }
if ([string]::IsNullOrWhiteSpace($version)) { Fail 'runtime\version.json 里没有 version 字段' }
$version = [string]$version
Ok ("版本 {0}" -f $version)

# ---------------------------------------------------------------- 步骤 1：探测便携 python
Step '1/4 探测便携 python'
$pyBase = Join-Path $repoRoot 'runtime\python'
if (-not (Test-Path -LiteralPath $pyBase)) { Fail ("目录不存在: {0}" -f $pyBase) }

function Get-PyPatchKey([string]$Name) {
    $m = [regex]::Match($Name, '^cpython-3\.11\.(\d+)')
    if ($m.Success) { return [int]$m.Groups[1].Value }
    return -1
}
function Test-HasPyInstaller([string]$Dir) {
    return (Test-Path -LiteralPath (Join-Path $Dir 'Scripts\pyinstaller.exe'))
}

$pyCandidates = @(Get-ChildItem -LiteralPath $pyBase -Directory -Filter 'cpython-3.11*' -ErrorAction SilentlyContinue |
    Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'python.exe') })
if ($pyCandidates.Count -eq 0) {
    Fail ("未在 {0} 下找到 cpython-3.11*\python.exe（runtime 不入 git，换机器需先拷便携运行时）" -f $pyBase)
}
# 优先装了 PyInstaller 的；再按 patch 号降序；最后按目录名降序。
# 这样能跳过旧空壳目录 cpython-3.11-windows-x86_64-none（无 patch 号，key = -1）。
$pyDir = ($pyCandidates | Sort-Object `
    @{ Expression = { if (Test-HasPyInstaller $_.FullName) { 1 } else { 0 } }; Descending = $true }, `
    @{ Expression = { Get-PyPatchKey $_.Name }; Descending = $true }, `
    @{ Expression = { $_.Name }; Descending = $true } |
    Select-Object -First 1).FullName
$pythonExe = Join-Path $pyDir 'python.exe'
if (-not (Test-Path -LiteralPath $pythonExe)) { Fail ("便携 python 不可用: {0}" -f $pythonExe) }
Ok ("便携 python: {0}" -f $pythonExe)
foreach ($c in $pyCandidates) { Info ("候选: {0}{1}" -f $c.Name, $(if (Test-HasPyInstaller $c.FullName) { '  (含 PyInstaller)' } else { '' })) }

# ---------------------------------------------------------------- 输出目录
if ([string]::IsNullOrWhiteSpace($OutDir)) {
    $outRoot = Join-Path (Split-Path -Parent $repoRoot) ('lxup-release-' + $version)
} else {
    $outRoot = $OutDir
}
$outRoot = [System.IO.Path]::GetFullPath($outRoot)
$zipPath = Join-Path $outRoot ('LXUP-factory-v' + $version + '.zip')
Info ("输出目录: {0}" -f $outRoot)
Info ("产物 zip: {0}" -f $zipPath)
if ((Split-Path -Parent $outRoot) -eq $repoRoot -or $outRoot -eq $repoRoot -or $outRoot.StartsWith($repoRoot + '\')) {
    Write-Host '  [WARN] 输出目录在仓库内，产物 zip 会被 build-factory.py 自动跳过（不会自己打进自己）' -ForegroundColor Yellow
}

# ---------------------------------------------------------------- 步骤 2：重建 exe
Step '2/4 重建 LXUP启动器.exe'
$launcherName = 'LXUP启动器'
$launcherExe = Join-Path $repoRoot ($launcherName + '.exe')
if ($SkipExe) {
    if (-not (Test-Path -LiteralPath $launcherExe)) {
        Fail ("-SkipExe 指定了但仓库根没有 {0}.exe，无从打包" -f $launcherName)
    }
    Ok ('已跳过（使用仓库根现有 exe）')
    Info ((Get-Item -LiteralPath $launcherExe).LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss'))
} else {
    # 注意：PS 5.1 下重定向 native 命令的 stderr（2>$null）+ EAP=Stop 会把 stderr 变成终止错误，
    # 所以这一段临时降级 EAP，只看退出码。
    $prevEap = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    & $pythonExe -c 'import PyInstaller, sys; sys.stdout.write(str(PyInstaller.__version__))' 2>$null
    $pyiCode = $LASTEXITCODE
    $ErrorActionPreference = $prevEap
    if ($pyiCode -ne 0) {
        Fail ("便携 python 里没有 PyInstaller。安装: `"{0}`" -m pip install pyinstaller --break-system-packages" -f $pythonExe)
    }
    Info 'PyInstaller 可用'

    # 构建产物必须落在仓库外：build-factory.py 的排除表里没有 build/ dist/，
    # 落在仓库根会把几十 MB 构建垃圾打进客户包。
    $buildTmp = Join-Path $env:TEMP ('lxup-exe-' + $stamp)
    New-Item -ItemType Directory -Path $buildTmp -Force | Out-Null
    $distDir = Join-Path $buildTmp 'dist'
    $workDir = Join-Path $buildTmp 'build'
    Info ("临时构建目录: {0}" -f $buildTmp)

    $pyiArgs = @(
        '-m', 'PyInstaller',
        '--noconfirm', '--clean', '--onefile', '--windowed',
        '--name', $launcherName,
        '--icon', (Join-Path $repoRoot 'LXUP-icon.ico'),
        '--distpath', $distDir,
        '--workpath', $workDir,
        '--specpath', $buildTmp,
        (Join-Path $repoRoot 'launcher_gui.py')
    )
    Push-Location $buildTmp
    try { & $pythonExe @pyiArgs }
    finally { Pop-Location }
    if ($LASTEXITCODE -ne 0) { Fail ("PyInstaller 退出码 {0}" -f $LASTEXITCODE) }

    $builtExe = Join-Path $distDir ($launcherName + '.exe')
    if (-not (Test-Path -LiteralPath $builtExe)) { Fail ("PyInstaller 没产出 {0}" -f $builtExe) }

    # 复制回仓库根覆盖（打包时才会进包）。启动器正在运行会占用文件 -> 给明确提示。
    try {
        Copy-Item -LiteralPath $builtExe -Destination $launcherExe -Force
    } catch {
        Fail ("复制回仓库根失败（{0}.exe 可能正在运行，先跑 stop-all.bat 再重试）: {1}" -f $launcherName, $_.Exception.Message)
    }
    $size = [math]::Round((Get-Item -LiteralPath $launcherExe).Length / 1MB, 1)
    Ok ("已重建并覆盖仓库根 {0}.exe ({1} MB)" -f $launcherName, $size)
    Remove-Item -LiteralPath $buildTmp -Recurse -Force -ErrorAction SilentlyContinue
}

# ---------------------------------------------------------------- 步骤 3：打包
Step '3/4 打出厂包'
New-Item -ItemType Directory -Path $outRoot -Force | Out-Null
$buildScript = Join-Path $PSScriptRoot 'build-factory.py'
Set-Item -Path 'Env:LXUP_OUT' -Value $outRoot
try {
    & $pythonExe $buildScript
    $packCode = $LASTEXITCODE
} finally {
    Remove-Item -Path 'Env:LXUP_OUT' -ErrorAction SilentlyContinue
}
if ($packCode -ne 0) { Fail ("build-factory.py 退出码 {0}" -f $packCode) }
if (-not (Test-Path -LiteralPath $zipPath)) { Fail ("打包脚本正常结束但找不到产物: {0}" -f $zipPath) }
Ok ("出厂包已生成: {0}" -f $zipPath)

# ---------------------------------------------------------------- 步骤 4：自动验证
Step '4/4 自动验证（关键条目 + 动态密钥泄露扫描）'
# 验证脚本写成 UTF-8(无 BOM) 临时文件再交给便携 python 跑：
# 直接 here-string 走管道喂 `python -` 在 PS 5.1 下会把中文按 ASCII 编码弄乱。
$verifySrc = @'
# -*- coding: utf-8 -*-
# LXUP 出厂包自动验证（由 scripts/build-release.ps1 生成到 %TEMP% 后调用，可随时删）
# 用法: <便携python> lxup-verify-factory.py <zip路径> <仓库根>
# 安全原则: 本脚本不硬编码任何真实密钥；密钥值一律运行时从母版
#           <仓库根>/runtime/openclaw-home/openclaw.json 动态提取，再去包里做字节级扫描。
import sys, os, re, json, zipfile

sys.stdout.reconfigure(encoding='utf-8')

if len(sys.argv) < 3:
    print('[FAIL] 用法: python lxup-verify-factory.py <zip路径> <仓库根>')
    sys.exit(2)

zip_path, repo_root = sys.argv[1], sys.argv[2]
fails = []

if not os.path.isfile(zip_path):
    print('[FAIL] zip 不存在: %s' % zip_path)
    sys.exit(2)

REQUIRED = [
    'LXUP启动器.exe', 'launcher_gui.py', 'LXUP-icon.ico', 'README.md',
    '龙虾U盘使用说明.html',
    'runtime/version.json',
    # 三必带之③：便携 node 旁的 npm（缺了客户机报 'npm.cmd' 不是内部或外部命令）
    'runtime/data/node.exe', 'runtime/data/npm.cmd', 'runtime/data/npx.cmd',
    'runtime/data/node_modules/npm/bin/npm-cli.js',
    # 三必带之①：脱敏 openclaw.json（缺了网关报 Missing config）
    'runtime/openclaw-home/openclaw.json',
    'runtime/openclaw/node_modules/openclaw/openclaw.mjs',
    'sidecar/main.py', 'control-ui/dist/index.html',
    'ai-assistant/server.js', 'skill-packs/manifest.json',
]
# 进包必须为 0 字节（会被 AI 边用边填真实信息）
BLANK = [
    'runtime/workspace/USER.md',
    'runtime/workspace/MEMORY.md',
    'runtime/workspace/IDENTITY.md',
]
FORBIDDEN = [
    '.sidecar.ready', 'runtime/data/.sidecar.ready', 'runtime/data/sidecar.log',
    'runtime/data/gateway.db', 'runtime/data/gateway.db-wal',
    'runtime/data/gateway.db-shm', 'runtime/data/gateway.db-journal',
    'package-lock.json', '_swap_launcher.bat',
    'LXUP启动器.exe.new', 'LXUP启动器.exe.old',
    'runtime/python/.gitignore',
]
FORBIDDEN_PREFIX = [
    '.git/', '__pycache__/',
    'runtime/hermes-home/', 'runtime/codex-home/', 'runtime/logs/',
    'ai-assistant/data/',
    'runtime/python/.temp/', 'runtime/python/.lock/',
    'runtime/python/cpython-3.11-windows-x86_64-none/',  # 旧空壳解释器
]

print('--- ① 关键条目检查 ---')
zf = zipfile.ZipFile(zip_path)
names = set(zf.namelist())
print('包内条目数: %d' % len(names))

for r in REQUIRED:
    if r not in names:
        fails.append('缺少关键条目: %s' % r)

# 便携 python：不写死 patch 版本，只要有一个 cpython-3.11.<n>-*/python.exe 即可
py_hits = [n for n in names
           if re.match(r'^runtime/python/cpython-3\.11\.\d+-[^/]+/python\.exe$', n)]
if not py_hits:
    fails.append('包内没有便携 python.exe (runtime/python/cpython-3.11.<n>-*/python.exe)')
else:
    print('便携 python: %s' % py_hits[0])

# 三必带之②：plugins 本体，按包内配置的 plugins.load.paths 逐条核（不写死插件名）
cfg = None
try:
    cfg = json.loads(zf.read('runtime/openclaw-home/openclaw.json').decode('utf-8'))
except Exception as e:
    fails.append('包内 openclaw.json 读不出来/不是合法 JSON: %s' % e)

plugin_dirs = set()
if isinstance(cfg, dict):
    paths = ((cfg.get('plugins') or {}).get('load') or {}).get('paths') or []
    if not isinstance(paths, list) or not paths:
        fails.append('包内 openclaw.json 的 plugins.load.paths 为空（客户机会报 plugin path not found）')
    for p in paths:
        if not isinstance(p, str) or not p.strip():
            fails.append('plugins.load.paths 里有非法项: %r' % (p,))
            continue
        pp = p.replace('\\', '/').strip()
        while pp.startswith('./'):
            pp = pp[2:]
        prefix = pp.rstrip('/') + '/'
        plugin_dirs.add(prefix)
        cnt = sum(1 for n in names if n.startswith(prefix))
        if cnt == 0:
            fails.append('插件本体缺失（plugins.load.paths 指向但包里没有文件）: %s' % pp)
        else:
            print('插件 %s -> %d 个文件' % (pp, cnt))
    plug_total = sum(1 for n in names if n.startswith('runtime/openclaw-home/plugins/'))
    if plug_total == 0:
        fails.append('包内 runtime/openclaw-home/plugins/ 一个文件都没有')

# openclaw-home 里除了脱敏配置与 plugins，不该有别的（登录态/凭据/日志）
stray = [n for n in names
         if n.startswith('runtime/openclaw-home/')
         and n != 'runtime/openclaw-home/openclaw.json'
         and not n.startswith('runtime/openclaw-home/plugins/')]
if stray:
    fails.append('runtime/openclaw-home 下有 %d 个不该进包的条目，例如 %s'
                 % (len(stray), stray[:3]))

# workspace 三文件必须存在且 0 字节
for b in BLANK:
    if b not in names:
        fails.append('缺少应置空的 workspace 文件: %s' % b)
    elif zf.getinfo(b).file_size != 0:
        fails.append('%s 进包未置空（%d 字节）' % (b, zf.getinfo(b).file_size))

for f in FORBIDDEN:
    if f in names:
        fails.append('不该进包的条目出现了: %s' % f)
for p in FORBIDDEN_PREFIX:
    hit = [n for n in names if n.startswith(p) or ('/' + p) in n]
    if hit:
        fails.append('不该进包的目录出现了: %s (%d 个，例如 %s)' % (p, len(hit), hit[:2]))

pyc = [n for n in names if n.endswith('.pyc')]
if pyc:
    fails.append('包内有 %d 个 .pyc' % len(pyc))

# 中文文件名必须带 UTF-8 标志位，否则 Linux unzip 乱码
non_ascii_noflag = [n for n in names
                    if not n.isascii() and not (zf.getinfo(n).flag_bits & 0x800)]
if non_ascii_noflag:
    fails.append('%d 个中文名条目缺 UTF-8 标志位(0x800)，例如 %s'
                 % (len(non_ascii_noflag), non_ascii_noflag[:2]))

print('--- 脱敏口径检查（包内 openclaw.json）---')
if isinstance(cfg, dict):
    tok = ((cfg.get('gateway') or {}).get('auth') or {}).get('token')
    if tok != 'dev-local-token':
        fails.append('包内 gateway.auth.token 不是 dev-local-token')
    else:
        print('gateway.auth.token = dev-local-token')
    if cfg.get('channels') != {}:
        fails.append('包内 channels 未清空（应为 {}）')
    else:
        print('channels = {}')
    left = []

    def _walk_cfg(obj, path=''):
        if isinstance(obj, dict):
            for k, v in obj.items():
                np = path + '/' + k
                if k == 'apiKey' and isinstance(v, str) and v.strip():
                    left.append(np)
                _walk_cfg(v, np)
        elif isinstance(obj, list):
            for i, v in enumerate(obj):
                _walk_cfg(v, '%s[%d]' % (path, i))
    _walk_cfg(cfg)
    if left:
        fails.append('包内 openclaw.json 仍有 %d 个非空 apiKey: %s' % (len(left), left[:5]))
    else:
        print('包内无非空 apiKey')

print('--- ② 密钥泄露扫描（值从母版动态提取，不打印明文）---')
master = os.path.join(repo_root, 'runtime', 'openclaw-home', 'openclaw.json')
if not os.path.isfile(master):
    fails.append('母版配置不存在，无法做泄露扫描: %s' % master)
secrets = []
# 公开占位符：这些值本就是写死在源码/文档/脱敏配置里的默认值，不是秘密。
# 从母版 token/apiKey 提取待扫密钥时要排除，否则会对包内正常含这些值的文件误报"泄露"
# （例如 gateway.auth.token 脱敏后就是 dev-local-token，它到处都在）。
PUBLIC_PLACEHOLDERS = {'dev-local-token', 'CHANGE_ME', 'change-me', 'your-api-key', 'replace-me', 'sk-xxxx'}
if os.path.isfile(master):
    with open(master, 'r', encoding='utf-8') as f:
        mcfg = json.load(f)

    def _collect(obj, path=''):
        if isinstance(obj, dict):
            for k, v in obj.items():
                np = path + '/' + k
                if k in ('apiKey', 'token') and isinstance(v, str) and v.strip() and v.strip() not in PUBLIC_PLACEHOLDERS:
                    secrets.append((np, v.strip()))
                _collect(v, np)
        elif isinstance(obj, list):
            for i, v in enumerate(obj):
                _collect(v, '%s[%d]' % (path, i))
    _collect(mcfg)

if not secrets:
    fails.append('母版 openclaw.json 里没提取到任何 apiKey/token，扫描等于没扫（请检查母版）')
else:
    print('母版提取到 %d 个密钥值: %s' % (len(secrets), ', '.join(p for p, _ in secrets)))
    needles = [(p, v.encode('utf-8')) for p, v in secrets]
    leaks = []
    scanned = 0
    for info in zf.infolist():
        if info.is_dir():
            continue
        try:
            with zf.open(info) as fh:
                data = fh.read()
        except Exception as e:
            fails.append('解压失败，无法扫描: %s (%s)' % (info.filename, e))
            continue
        scanned += 1
        for label, nd in needles:
            if nd in data:
                leaks.append((info.filename, label))
    print('已扫描 %d 个文件' % scanned)
    if leaks:
        for fn, label in leaks:
            fails.append('密钥泄露: 包内 %s 命中母版 %s 的值' % (fn, label))
    else:
        print('未发现任何母版密钥值泄露')

zf.close()

print('')
if fails:
    print('[FAIL] 验证未通过，共 %d 项：' % len(fails))
    for m in fails:
        print('  - ' + m)
    sys.exit(1)
print('[OK] 验证全部通过：关键条目齐、脱敏到位、无密钥泄露')
sys.exit(0)
'@

$verifyPath = Join-Path $env:TEMP ('lxup-verify-factory-' + $stamp + '.py')
[System.IO.File]::WriteAllText($verifyPath, $verifySrc, (New-Object System.Text.UTF8Encoding($false)))
Info ("验证脚本: {0}" -f $verifyPath)
try {
    & $pythonExe $verifyPath $zipPath $repoRoot
    $verifyCode = $LASTEXITCODE
} finally {
    Remove-Item -LiteralPath $verifyPath -Force -ErrorAction SilentlyContinue
}
if ($verifyCode -ne 0) { Fail ("自动验证未通过（退出码 {0}），请勿交付该包" -f $verifyCode) }
Ok '自动验证通过'

# ---- ③ 源码硬编码密钥扫描（模式匹配，与上面②的"值匹配"互补，两道都保留）----
# 当前为软闸门(warn-only)；确认连续多次发版零误报后，改成加 --strict 变成硬阻断
$scanScript = Join-Path $PSScriptRoot 'secret-scan.py'
Write-Host ''
Write-Host '--- ③ 源码硬编码密钥扫描（secret-scan.py，软闸门 warn-only，不阻断构建）---' -ForegroundColor Cyan
if (-not (Test-Path -LiteralPath $scanScript)) {
    Write-Host ("  [WARN] 未找到 {0}，本项跳过" -f $scanScript) -ForegroundColor Yellow
} else {
    # 软闸门：stdout 直接透传进构建日志；无论有无命中都不 Fail，只看一眼退出码做提示
    & $pythonExe $scanScript $zipPath
    $scanCode = $LASTEXITCODE
    if ($scanCode -ne 0) {
        Write-Host ("  [WARN] secret-scan.py 退出码 {0}（软闸门阶段不阻断构建，请人工核查上方命中清单）" -f $scanCode) -ForegroundColor Yellow
    }
}

Write-Host ''
Write-Host '=== 一键构建完成 ===' -ForegroundColor Green
Info ("版本    : {0}" -f $version)
Info ("产物    : {0}" -f $zipPath)
Info ("sha256  : 见上方 build-factory.py 输出")
Write-Host ''
Write-Host '还剩一步人工验证（会占 18789 端口、需联网，故未自动化）：解压冒烟。' -ForegroundColor Yellow
Write-Host '命令见 scripts\打包说明.md 的「验证三步 / ③ 解压冒烟」。' -ForegroundColor Yellow
