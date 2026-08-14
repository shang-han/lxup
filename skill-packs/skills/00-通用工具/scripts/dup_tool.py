#!/usr/bin/env python3
# -*- coding: utf-8 -*-
try:
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import argparse, hashlib, sys
from pathlib import Path

def hash_file(p, chunk=1024*1024):
    h = hashlib.sha256()
    with open(p, 'rb') as f:
        for b in iter(lambda: f.read(chunk), b''):
            h.update(b)
    return h.hexdigest()

def main():
    p = argparse.ArgumentParser()
    p.add_argument('scan'); p.add_argument('directory'); p.add_argument('-o','--output')
    p.add_argument('--move'); p.add_argument('--delete', action='store_true')
    a = p.parse_args()
    d = Path(a.directory)
    files = [f for f in d.rglob('*') if f.is_file()]
    print('共 ' + str(len(files)) + ' 个文件,开始按内容哈希比对...')
    groups = {}
    for f in files:
        h = hash_file(f)
        groups.setdefault(h, []).append(f)
    dupes = {h: v for h, v in groups.items() if len(v) > 1}
    if not dupes:
        print('未发现重复文件'); return
    freed = 0
    lines = ['# 重复文件清单', '']
    moved = deleted = 0
    for h, group in dupes.items():
        group = sorted(group, key=lambda x: str(x))
        keep = group[0]
        lines.append('- 保留: ' + str(keep))
        for f in group[1:]:
            size = f.stat().st_size
            freed += size
            lines.append('  - 重复: ' + str(f) + ' (' + fmt_size(size) + ')')
            if a.move:
                target = Path(a.move) / f.name
                target.parent.mkdir(parents=True, exist_ok=True)
                n = 1
                while target.exists():
                    target = target.parent / (f.stem + '_' + str(n) + f.suffix); n += 1
                f.rename(target); moved += 1
            elif a.delete:
                f.unlink(); deleted += 1
        lines.append('')
    lines.append('可释放空间: ' + fmt_size(freed))
    if a.output: open(a.output, 'w', encoding='utf-8').write('\n'.join(lines))
    msg = '发现 ' + str(len(dupes)) + ' 组重复文件,可释放 ' + fmt_size(freed)
    if a.move: msg += ',已移动 ' + str(moved) + ' 个到 ' + a.move
    if a.delete: msg += ',已删除 ' + str(deleted) + ' 个'
    if a.output: msg += ',清单: ' + a.output
    print(msg)

def fmt_size(n):
    for unit in ('B','KB','MB','GB'):
        if n < 1024 or unit == 'GB': return ('%.1f %s' % (n, unit)) if unit != 'B' else (str(n) + ' B')
        n /= 1024

main()
