#!/usr/bin/env python3
# -*- coding: utf-8 -*-
try:
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import argparse, sys
from pathlib import Path

def sniff(p):
    raw = p.read_bytes()
    for enc in ('utf-8', 'gbk', 'gb18030', 'utf-16', 'big5'):
        try:
            raw.decode(enc)
            return enc, None
        except UnicodeDecodeError as e:
            if enc == 'utf-8':
                return None, e
    return None, None

def cmd_detect(a):
    enc, err = sniff(Path(a.input))
    if enc == 'utf-8':
        print('编码: UTF-8(无需转换)')
    elif enc:
        print('编码: ' + enc + '(建议转换为 UTF-8)')
    else:
        print('无法确定为 UTF-8(可能是 GBK/GB18030,可尝试 convert)')

def convert_one(p, out, backup):
    raw = p.read_bytes()
    enc = 'gb18030'
    try:
        text = raw.decode('gb18030')
        if text.encode('gb18030') != raw: raise ValueError
    except Exception:
        try:
            text = raw.decode('utf-8')
            if '�' in text: raise ValueError
            return False  # 已是 UTF-8,跳过
        except Exception:
            sys.stderr.write('[encoding_tool] 无法识别编码: ' + str(p) + '\n')
            return False
    if backup and out != p:
        bak = p.with_suffix(p.suffix + '.bak')
        p.rename(bak)
        p.write_text('', encoding='utf-8')
        p.write_bytes(text.encode('utf-8'))
    else:
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(text, encoding='utf-8')
    return True

def cmd_convert(a):
    src = Path(a.input)
    if src.is_dir():
        files = [f for f in src.rglob('*') if f.is_file()] if a.recursive else [f for f in src.iterdir() if f.is_file()]
        n = 0
        for f in files:
            if f.suffix.lower() in ('.py','.pyc','.exe','.dll','.png','.jpg','.zip'): continue
            if convert_one(f, f, a.backup): n += 1
        print('已转换 ' + str(n) + ' 个文件' + ('(原文件已备份为 .bak)' if a.backup else ''))
    else:
        out = Path(a.output) if a.output else src
        if out == src and not a.backup:
            sys.stderr.write('[encoding_tool] 输出与源文件相同,请用 --backup 或指定 -o\n'); sys.exit(1)
        ok = convert_one(src, out, a.backup)
        if ok:
            print('已转换 ' + str(src) + ' -> ' + str(out))
        else:
            print(str(src) + ' 已是 UTF-8 或无法识别,未转换')
            sys.exit(2)

def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest='cmd', required=True)
    d = sub.add_parser('detect'); d.add_argument('input'); d.set_defaults(func=cmd_detect)
    c = sub.add_parser('convert'); c.add_argument('input'); c.add_argument('-o','--output'); c.add_argument('--recursive', action='store_true'); c.add_argument('--backup', action='store_true'); c.set_defaults(func=cmd_convert)
    a = p.parse_args()
    a.func(a)

main()
