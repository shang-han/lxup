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

def plan(a):
    d = Path(a.directory)
    files = sorted([f for f in d.iterdir() if f.is_file()])
    if a.ext:
        files = [f for f in files if f.suffix.lower() == a.ext.lower()]
    pairs = []
    used = set(f.name.lower() for f in d.iterdir())
    if a.replace:
        old, new = a.replace
        for f in files:
            if old not in f.stem: continue
            nname = f.stem.replace(old, new) + f.suffix
            n = 2
            base = nname
            while nname.lower() in used:
                nname = Path(base).stem + '_' + str(n) + Path(base).suffix; n += 1
            pairs.append((f.name, nname)); used.add(nname.lower())
    elif a.pattern:
        for i, f in enumerate(files, start=a.start):
            nname = a.pattern.replace('{n}', str(i)) + f.suffix
            pairs.append((f.name, nname))
    else:
        for f in files:
            nname = (a.prefix or '') + f.stem + (a.suffix or '') + f.suffix
            if nname == f.name: continue
            n = 2; base = nname
            while nname.lower() in used:
                nname = Path(base).stem + '_' + str(n) + Path(base).suffix; n += 1
            pairs.append((f.name, nname)); used.add(nname.lower())
    return d, pairs

def main():
    p = argparse.ArgumentParser()
    p.add_argument('rename'); p.add_argument('directory'); p.add_argument('--pattern'); p.add_argument('--start', type=int, default=1)
    p.add_argument('--replace', nargs=2, metavar=('OLD','NEW')); p.add_argument('--prefix', default=''); p.add_argument('--suffix', default='')
    p.add_argument('--ext'); p.add_argument('--dry-run', action='store_true')
    a = p.parse_args()
    d, pairs = plan(a)
    if not pairs:
        print('没有需要重命名的文件'); return
    if a.dry_run:
        for old, new in pairs[:10]: print(old + ' -> ' + new)
        if len(pairs) > 10: print('... 共 ' + str(len(pairs)) + ' 个')
        print('(dry-run,未执行。确认后去掉 --dry-run)')
        return
    for old, new in pairs:
        (d / old).rename(d / new)
    print('已重命名 ' + str(len(pairs)) + ' 个文件')

main()
