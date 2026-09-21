# -*- coding: utf-8 -*-
"""
LXUP 源码硬编码密钥扫描闸门（模式匹配）

目的：出厂包发布前，防止有人把真实第三方 API key / token / 私钥硬编码进
      我们自己手写的源码、随包发给客户。

用法:
    python secret-scan.py <路径> [--strict] [--allowlist <file>]

    <路径>        出厂包 zip 文件（逐条目读），或一个目录（如仓库根，os.walk）
    --strict      硬闸门：存在未豁免命中时 exit 1（默认软闸门：只 WARN、exit 0）
    --allowlist   豁免清单文件；缺省尝试本脚本同目录的 secret-allowlist.txt，
                  文件不存在就当空。每行格式:
                      相对路径::类型::掩码前缀
                  掩码前缀 = 命中值前 12 字符；该段留空则按 路径+类型 整体豁免。
                  以 # 开头的行与空行忽略。

扫描范围（第一设计要点）：只扫"我们自己手写的源码"——
    1) 只扫 EXT 白名单扩展名的文本源码文件；
    2) 跳过 EXCL 里的第三方引擎本体与运行时目录（openclaw / codex / hermes 等
       引擎内含大量示例 key/token，不限定范围会误报到不可用）；
    3) 跳过疑似二进制文件（前 8000 字节含 NUL）与超大文件（>3MB）。

输出：每条命中打印 "类型  相对路径:行号  掩码"；
    掩码 = 命中串前 7 字符 + 省略号 + 后 3 字符，绝不打印完整密钥。
    相对路径统一用正斜杠。

退出码：
    0 = 无未豁免命中；或软闸门（未加 --strict）下虽有未豁免命中（已打印 WARN）
    1 = --strict 且存在未豁免命中（硬阻断）
    2 = 用法 / IO 错误（路径不存在、zip 打不开等）

与 build-release.ps1 第 4 步②的"值匹配"泄露扫描互补、两者都保留：
    那道从母版 openclaw.json 运行时提取真实值扫包（零误报）；
    本道用高信号正则模式扫源码（防源码里凭空硬编码、母版里没有的 key）。

编码约定：本文件不写任何反斜杠字面量（Windows/GBK 环境下易出错）——
    路径分隔统一 chr(92) 归一为正斜杠、省略号用 chr(8230)、正则字符类里 - 放末尾。
"""
import sys
import os
import re
import argparse
import zipfile

ELL = chr(8230)   # 省略号
BSL = chr(92)     # 反斜杠（仅用于把 zip 条目名归一为正斜杠）
NUL = bytes([0])  # 二进制嗅探用

MAX_BYTES = 3 * 1024 * 1024   # 超过 3MB 的文件跳过
SNIFF_BYTES = 8000            # 前 8000 字节含 NUL 视为二进制

# 排除目录（第三方引擎本体 / 运行时 / 构建产物 / 数据目录），一律不扫
EXCL = ('.git', 'node_modules', 'runtime/openclaw', 'runtime/codex', 'runtime/hermes-libs',
        'runtime/openclaw-home', 'runtime/python', 'runtime/data', 'runtime/logs',
        'runtime/codex-home', 'runtime/hermes-home', 'runtime/workspace',
        'control-ui/dist', '__pycache__', 'ai-assistant/data', '.cache', 'skills')

# 只扫这些扩展名的文本源码
EXT = ('.py', '.js', '.ts', '.mjs', '.cjs', '.html', '.md', '.json', '.toml', '.yaml', '.yml',
       '.bat', '.ps1', '.txt', '.env', '.css', '.conf', '.template', '.ini')

# 高信号密钥模式（bytes 正则；字符类里 - 放末尾免转义）
PAT = [
    ('openai/deepseek', re.compile(rb'sk-[A-Za-z0-9_-]{20,}')),
    ('aws',             re.compile(rb'AKIA[0-9A-Z]{16}')),
    ('github',          re.compile(rb'ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{22,}')),
    ('anthropic',       re.compile(rb'sk-ant-[A-Za-z0-9_-]{20,}')),
    ('dashscope',       re.compile(rb'sk-sp-[A-Za-z0-9._-]{12,}')),
    ('slack',           re.compile(rb'xox[baprs]-[A-Za-z0-9-]{10,}')),
    ('privatekey',      re.compile(rb'-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----')),
    ('bearer',          re.compile(rb'[Bb]earer [A-Za-z0-9._-]{25,}')),
]


def norm_rel(name):
    """把条目/文件路径归一成以正斜杠分隔的相对路径。"""
    p = name.replace(BSL, '/').strip()
    while p.startswith('./'):
        p = p[2:]
    return p


def is_excluded(rel):
    """rel 命中 EXCL 任一条（前缀目录，或任意一级同名目录）即排除。"""
    parts = rel.split('/')
    for e in EXCL:
        if rel == e or rel.startswith(e + '/'):
            return True
        if '/' not in e and e in parts:
            return True
    return False


def ext_ok(rel):
    """扩展名在 EXT 白名单内才扫。"""
    dot = rel.rfind('.')
    if dot <= 0:
        return False
    return rel[dot:].lower() in EXT


def looks_binary(data):
    return NUL in data[:SNIFF_BYTES]


def make_mask(val):
    """掩码 = 前 7 字符 + 省略号 + 后 3 字符；绝不输出完整值。"""
    if len(val) > 10:
        return val[:7] + ELL + val[-3:]
    return val[:2] + ELL


def scan_bytes(rel, data, hits):
    for typ, rx in PAT:
        for m in rx.finditer(data):
            val = m.group(0).decode('ascii', 'replace')
            line_no = data[:m.start()].count(10) + 1
            hits.append((typ, rel, line_no, val))


def scan_zip(zip_path, hits, counter):
    try:
        zf = zipfile.ZipFile(zip_path)
    except Exception as e:
        print('[FAIL] 无法打开 zip: %s (%s)' % (zip_path, e))
        return 2
    with zf:
        for info in zf.infolist():
            if info.is_dir():
                continue
            rel = norm_rel(info.filename)
            if not rel or is_excluded(rel) or not ext_ok(rel):
                continue
            if info.file_size > MAX_BYTES:
                continue
            try:
                data = zf.read(info)
            except Exception as e:
                print('WARN: 条目读取失败，跳过: %s (%s)' % (rel, e))
                continue
            if looks_binary(data):
                continue
            counter[0] += 1
            scan_bytes(rel, data, hits)
    return 0


def scan_dir(root, hits, counter):
    for dirpath, dirnames, filenames in os.walk(root):
        keep = []
        for d in dirnames:
            rel_d = norm_rel(os.path.relpath(os.path.join(dirpath, d), root))
            if not is_excluded(rel_d):
                keep.append(d)
        dirnames[:] = keep
        for fn in filenames:
            full = os.path.join(dirpath, fn)
            rel = norm_rel(os.path.relpath(full, root))
            if is_excluded(rel) or not ext_ok(rel):
                continue
            try:
                if os.path.getsize(full) > MAX_BYTES:
                    continue
                with open(full, 'rb') as f:
                    data = f.read()
            except OSError as e:
                print('WARN: 文件读取失败，跳过: %s (%s)' % (rel, e))
                continue
            if looks_binary(data):
                continue
            counter[0] += 1
            scan_bytes(rel, data, hits)
    return 0


def load_allowlist(path):
    rows = []
    if not path or not os.path.isfile(path):
        return rows
    try:
        with open(path, 'rb') as f:
            raw = f.read()
    except OSError as e:
        print('WARN: 豁免清单读取失败，按空处理: %s (%s)' % (path, e))
        return rows
    for line in raw.decode('utf-8', 'replace').splitlines():
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        bits = line.split('::')
        if len(bits) != 3:
            print('WARN: 忽略格式非法的豁免行（应为 相对路径::类型::掩码前缀）: %s' % line)
            continue
        rows.append((norm_rel(bits[0]), bits[1].strip(), bits[2].strip()))
    return rows


def is_allowed(rel, typ, val, rows):
    for r, t, pre in rows:
        if r == rel and t == typ and (not pre or val.startswith(pre)):
            return True
    return False


def main():
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

    ap = argparse.ArgumentParser(
        description='LXUP 源码硬编码密钥扫描（只扫 our-code，第三方引擎/运行时一律排除）')
    ap.add_argument('path', help='出厂包 zip 文件，或一个目录（如仓库根）')
    ap.add_argument('--strict', action='store_true',
                    help='硬闸门：存在未豁免命中时 exit 1（默认软闸门只 WARN、exit 0）')
    ap.add_argument('--allowlist', default=None,
                    help='豁免清单（默认尝试脚本同目录 secret-allowlist.txt，不存在当空）')
    args = ap.parse_args()

    target = args.path
    if not os.path.exists(target):
        print('[FAIL] 路径不存在: %s' % target)
        return 2

    al_path = args.allowlist
    if al_path is None:
        al_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                               'secret-allowlist.txt')
    allow = load_allowlist(al_path)

    hits = []
    counter = [0]
    if os.path.isdir(target):
        mode = '目录'
        rc = scan_dir(target, hits, counter)
    elif os.path.isfile(target) and zipfile.is_zipfile(target):
        mode = 'zip'
        rc = scan_zip(target, hits, counter)
    else:
        print('[FAIL] 目标既不是目录也不是 zip 文件: %s' % target)
        return 2
    if rc != 0:
        return rc

    print('--- ③ 源码硬编码密钥扫描（模式匹配，仅限 our-code）---')
    print('目标: %s （%s 模式）' % (target, mode))
    print('已扫描文本源码文件: %d 个' % counter[0])
    if allow:
        print('豁免清单: %s （%d 条规则）' % (al_path, len(allow)))
    else:
        print('豁免清单: 无（%s 不存在或为空）' % al_path)

    bad = []
    exempt = []
    for typ, rel, ln, val in hits:
        item = (typ, rel, ln, make_mask(val))
        if is_allowed(rel, typ, val, allow):
            exempt.append(item)
        else:
            bad.append(item)
    bad.sort(key=lambda x: (x[1], x[2], x[0]))
    exempt.sort(key=lambda x: (x[1], x[2], x[0]))

    if bad:
        print('')
        print('未豁免命中 %d 处:' % len(bad))
        for typ, rel, ln, m in bad:
            print('  %s  %s:%d  %s' % (typ, rel, ln, m))
    if exempt:
        print('')
        print('已豁免命中 %d 处（按 allowlist，不计入失败）:' % len(exempt))
        for typ, rel, ln, m in exempt:
            print('  [已豁免] %s  %s:%d  %s' % (typ, rel, ln, m))

    print('')
    if bad:
        if args.strict:
            print('FAIL: 发现 %d 处疑似硬编码密钥（见上），--strict 硬闸门阻断。' % len(bad))
            print('处理：确认后从源码删除，或向豁免清单加规则（相对路径::类型::命中值前12字符）。')
            return 1
        print('WARN: 发现 %d 处疑似硬编码密钥（见上）——确认是否为误报；'
              '确认后用 --allowlist 豁免或从源码删除。' % len(bad))
        return 0
    print('[OK] 未发现未豁免的硬编码密钥命中（豁免 %d 处）' % len(exempt))
    return 0


if __name__ == '__main__':
    sys.exit(main())
