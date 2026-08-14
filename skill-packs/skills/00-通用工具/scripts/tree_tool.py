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

EXCLUDE = {'.git', 'node_modules', '__pycache__', '.idea', '.vscode'}

def main():
    p = argparse.ArgumentParser()
    p.add_argument('tree'); p.add_argument('directory'); p.add_argument('-o','--output', required=True)
    p.add_argument('--max-depth', type=int, default=3); p.add_argument('--exclude', nargs='*', default=[])
    p.add_argument('--size', action='store_true')
    a = p.parse_args()
    root = Path(a.directory)
    ex = EXCLUDE | set(a.exclude)
    lines = ['```', root.name + '/']
    n_dir = n_file = 0
    def walk(d, depth, prefix):
        nonlocal n_dir, n_file
        entries = sorted([x for x in d.iterdir() if x.name not in ex], key=lambda x: (x.is_file(), x.name))
        for i, x in enumerate(entries):
            last = i == len(entries) - 1
            branch = '└── ' if last else '├── '
            if x.is_dir():
                lines.append(prefix + branch + x.name + '/'); n_dir += 1
                if depth < a.max_depth:
                    walk(x, depth + 1, prefix + ('    ' if last else '│   '))
            else:
                s = (' (' + fmt_size(x.stat().st_size) + ')') if a.size else ''
                lines.append(prefix + branch + x.name + s); n_file += 1
    walk(root, 1, '')
    lines.append('```')
    lines.append('')
    lines.append('共 ' + str(n_dir) + ' 个目录、' + str(n_file) + ' 个文件')
    open(a.output, 'w', encoding='utf-8').write('\n'.join(lines))
    if len(lines) > 500:
        print('已生成 ' + a.output + ' (超过 500 行,建议减小 --max-depth)')
    else:
        print('已生成 ' + a.output + ' (' + str(n_dir) + ' 目录 / ' + str(n_file) + ' 文件)')

def fmt_size(n):
    for unit in ('B','KB','MB','GB'):
        if n < 1024 or unit == 'GB': return ('%.1f %s' % (n, unit)) if unit != 'B' else (str(n) + ' B')
        n /= 1024

main()
