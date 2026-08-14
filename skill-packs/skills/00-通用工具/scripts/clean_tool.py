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

def fmt_size(n):
    for unit in ('B','KB','MB','GB','TB'):
        if n < 1024 or unit == 'TB': return ('%.1f %s' % (n, unit)) if unit != 'B' else (str(n) + ' B')
        n /= 1024

def cmd_scan(a):
    d = Path(a.directory)
    files = [f for f in d.rglob('*') if f.is_file()]
    total = sum(f.stat().st_size for f in files)
    big = [f for f in files if f.stat().st_size >= a.min_size * 1024 * 1024]
    big.sort(key=lambda f: -f.stat().st_size)
    by_ext = {}
    for f in files:
        ext = f.suffix.lower() or '(无扩展名)'
        by_ext[ext] = by_ext.get(ext, 0) + f.stat().st_size
    lines = ['# 大文件与磁盘占用报告', '', '目录: ' + str(d), '总占用: ' + fmt_size(total) + ' (' + str(len(files)) + ' 个文件)', '']
    lines.append('## Top ' + str(min(a.top, len(big))) + ' 大文件')
    for f in big[:a.top]:
        lines.append('- ' + fmt_size(f.stat().st_size) + '  ' + str(f))
    lines += ['', '## 按类型汇总']
    for ext, size in sorted(by_ext.items(), key=lambda x: -x[1])[:15]:
        lines.append('- ' + ext + ': ' + fmt_size(size))
    open(a.output, 'w', encoding='utf-8').write('\n'.join(lines))
    print('目录总占用 ' + fmt_size(total) + ',Top ' + str(min(a.top, len(big))) + ' 大文件见 ' + a.output)

def cmd_emptydirs(a):
    d = Path(a.directory)
    empty = [x for x in d.rglob('*') if x.is_dir() and not any(x.iterdir())]
    lines = ['# 空目录清单', '']
    for e in sorted(empty): lines.append('- ' + str(e))
    open(a.output, 'w', encoding='utf-8').write('\n'.join(lines))
    print('发现 ' + str(len(empty)) + ' 个空目录,清单见 ' + a.output)

def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest='cmd', required=True)
    s = sub.add_parser('scan'); s.add_argument('directory'); s.add_argument('--min-size', type=int, default=100); s.add_argument('--top', type=int, default=30); s.add_argument('-o','--output', required=True); s.set_defaults(func=cmd_scan)
    e = sub.add_parser('emptydirs'); e.add_argument('directory'); e.add_argument('-o','--output', required=True); e.set_defaults(func=cmd_emptydirs)
    a = p.parse_args()
    a.func(a)

main()
