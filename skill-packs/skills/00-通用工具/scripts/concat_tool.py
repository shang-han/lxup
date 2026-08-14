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
try:
    from PIL import Image
except ImportError:
    sys.stderr.write('[concat_tool] 缺少依赖 pillow,请先执行: pip install "pillow>=9.0"\n'); sys.exit(1)

def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest='cmd', required=True)
    c = sub.add_parser('concat'); c.add_argument('images', nargs='+'); c.add_argument('-o','--output', required=True); c.add_argument('--direction', default='vertical'); c.add_argument('--gap', type=int, default=0); c.add_argument('--bg', default='white'); c.set_defaults(kind='concat')
    g = sub.add_parser('grid'); g.add_argument('directory'); g.add_argument('-o','--output', required=True); g.add_argument('--cols', type=int, required=True); g.add_argument('--gap', type=int, default=0); g.add_argument('--bg', default='white'); g.set_defaults(kind='grid')
    a = p.parse_args()
    if a.kind == 'concat':
        ims = [Image.open(f).convert('RGB') for f in a.images]
        if a.direction == 'vertical':
            w = max(im.width for im in ims)
            h = sum(im.height for im in ims) + a.gap * (len(ims)-1)
            canvas = Image.new('RGB', (w, h), a.bg)
            y = 0
            for im in ims:
                canvas.paste(im, ((w-im.width)//2, y)); y += im.height + a.gap
        else:
            w = sum(im.width for im in ims) + a.gap * (len(ims)-1)
            h = max(im.height for im in ims)
            canvas = Image.new('RGB', (w, h), a.bg)
            x = 0
            for im in ims:
                canvas.paste(im, (x, (h-im.height)//2)); x += im.width + a.gap
        canvas.save(a.output)
        print('已生成 ' + a.output + '(%dx%d)' % (canvas.width, canvas.height))
    else:
        files = sorted([f for f in Path(a.directory).iterdir() if f.suffix.lower() in ('.jpg','.jpeg','.png','.webp','.bmp')])
        if not files:
            sys.stderr.write('[concat_tool] 目录内无图片\n'); sys.exit(1)
        ims = [Image.open(f).convert('RGB') for f in files]
        cell_w = max(im.width for im in ims); cell_h = max(im.height for im in ims)
        rows = (len(ims) + a.cols - 1) // a.cols
        w = cell_w * a.cols + a.gap * (a.cols-1)
        h = cell_h * rows + a.gap * (rows-1)
        canvas = Image.new('RGB', (w, h), a.bg)
        for i, im in enumerate(ims):
            r, cc = divmod(i, a.cols)
            canvas.paste(im, (cc*(cell_w+a.gap)+(cell_w-im.width)//2, r*(cell_h+a.gap)+(cell_h-im.height)//2))
        canvas.save(a.output)
        print('已生成 ' + a.output + '(' + str(len(ims)) + ' 张,' + str(a.cols) + ' 列)')

main()
