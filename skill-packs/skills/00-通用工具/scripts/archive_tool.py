#!/usr/bin/env python3
# -*- coding: utf-8 -*-
try:
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import argparse, sys, tarfile, zipfile
from pathlib import Path

def zip_dir(d, out, exclude):
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
        n = 0
        for f in d.rglob('*'):
            if f.is_dir(): continue
            rel = str(f.relative_to(d))
            if any(x in rel for x in exclude): continue
            z.write(f, rel); n += 1
    return n

def tar_dir(d, out, exclude):
    with tarfile.open(out, 'w:gz') as t:
        n = 0
        for f in d.rglob('*'):
            if f.is_dir(): continue
            rel = str(f.relative_to(d))
            if any(x in rel for x in exclude): continue
            t.add(f, arcname=rel); n += 1
    return n

def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest='cmd', required=True)
    z = sub.add_parser('zip'); z.add_argument('source'); z.add_argument('-o','--output', required=True); z.add_argument('--exclude', nargs='*', default=[]); z.set_defaults(kind='zip')
    u = sub.add_parser('unzip'); u.add_argument('input'); u.add_argument('-o','--output', required=True); u.set_defaults(kind='unzip')
    t = sub.add_parser('tar'); t.add_argument('source'); t.add_argument('-o','--output', required=True); t.add_argument('--exclude', nargs='*', default=[]); t.set_defaults(kind='tar')
    ut = sub.add_parser('untar'); ut.add_argument('input'); ut.add_argument('-o','--output', required=True); ut.set_defaults(kind='untar')
    a = p.parse_args()
    try:
        if a.kind == 'zip':
            src = Path(a.source)
            if src.is_dir():
                n = zip_dir(src, a.output, a.exclude)
            else:
                with zipfile.ZipFile(a.output, 'w', zipfile.ZIP_DEFLATED) as zf:
                    zf.write(src, src.name); n = 1
            out = Path(a.output); print('已打包 ' + a.output + '(' + str(n) + ' 个文件,' + fmt_size(out.stat().st_size) + ')')
        elif a.kind == 'unzip':
            with zipfile.ZipFile(a.input) as zf: zf.extractall(a.output)
            print('已解压到 ' + a.output)
        elif a.kind == 'tar':
            n = tar_dir(Path(a.source), a.output, a.exclude)
            print('已打包 ' + a.output + '(' + str(n) + ' 个文件)')
        else:
            with tarfile.open(a.input) as tf: tf.extractall(a.output)
            print('已解压到 ' + a.output)
    except Exception as e:
        sys.stderr.write('[archive_tool] 处理错误: ' + str(e) + '\n'); sys.exit(2)

def fmt_size(n):
    for unit in ('B','KB','MB','GB'):
        if n < 1024 or unit == 'GB': return ('%.1f %s' % (n, unit)) if unit != 'B' else (str(n) + ' B')
        n /= 1024

main()
