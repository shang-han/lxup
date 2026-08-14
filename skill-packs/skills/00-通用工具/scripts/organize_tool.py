#!/usr/bin/env python3
# -*- coding: utf-8 -*-
try:
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import argparse, sys, time
from pathlib import Path

TYPE_MAP = {
    '文档': ('.doc','.docx','.pdf','.txt','.md','.xls','.xlsx','.ppt','.pptx','.csv','.rtf'),
    '图片': ('.jpg','.jpeg','.png','.gif','.webp','.bmp','.svg','.ico'),
    '视频': ('.mp4','.avi','.mov','.mkv','.flv','.wmv'),
    '音频': ('.mp3','.wav','.flac','.aac','.m4a'),
    '压缩包': ('.zip','.rar','.7z','.tar','.gz'),
    '安装包': ('.exe','.msi','.apk','.dmg'),
}

def category(f):
    for cat, exts in TYPE_MAP.items():
        if f.suffix.lower() in exts: return cat
    return '其他'

def plan(a):
    d = Path(a.directory)
    files = [f for f in d.iterdir() if f.is_file() and not f.name.startswith('.')]
    moves = []
    for f in files:
        if a.by == 'ext':
            target = d / category(f)
        else:
            target = d / time.strftime('%Y-%m', time.localtime(f.stat().st_mtime))
        moves.append((f, target))
    return moves

def main():
    p = argparse.ArgumentParser()
    p.add_argument('organize'); p.add_argument('directory'); p.add_argument('--by', choices=['ext','date'], default='ext')
    p.add_argument('--dry-run', action='store_true')
    a = p.parse_args()
    moves = plan(a)
    if not moves:
        print('目录内没有可整理的文件'); return
    stats = {}
    for f, t in moves: stats[t.name] = stats.get(t.name, 0) + 1
    if a.dry_run:
        for k, v in sorted(stats.items()): print(k + ': ' + str(v) + ' 个')
        print('(dry-run,未执行。确认后去掉 --dry-run)')
        return
    for f, t in moves:
        t.mkdir(parents=True, exist_ok=True)
        dest = t / f.name
        if dest.exists(): dest = t / (f.stem + '_1' + f.suffix)
        f.rename(dest)
    print('已归档 ' + str(len(moves)) + ' 个文件: ' + ', '.join(k + ' ' + str(v) for k, v in sorted(stats.items())))

main()
