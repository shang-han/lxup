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
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.stderr.write('[watermark_tool] 缺少依赖 pillow,请先执行: pip install "pillow>=9.0"\n'); sys.exit(1)

FONTS = [r'C:\Windows\Fonts\msyh.ttc', r'C:\Windows\Fonts\simhei.ttf', r'C:\Windows\Fonts\simsun.ttc']

def font(size):
    for f in FONTS:
        if Path(f).exists():
            try: return ImageFont.truetype(f, size)
            except Exception: pass
    return ImageFont.load_default()

def watermark(im, text, pos, opacity):
    im = im.convert('RGBA')
    size = max(18, im.size[0] // 20)
    f = font(size)
    overlay = Image.new('RGBA', im.size, (0,0,0,0))
    d = ImageDraw.Draw(overlay)
    bbox = d.textbbox((0,0), text, font=f)
    tw, th = bbox[2]-bbox[0], bbox[3]-bbox[1]
    w, h = im.size
    x, y = {'tl': (8, 8), 'tr': (w-8, 8), 'bl': (8, h-8), 'br': (w-8, h-8), 'center': (w//2, h//2)}[pos]
    if pos.endswith('r'): x -= tw + 8
    if pos.endswith('b'): y -= th + 8
    if pos == 'center': x -= tw//2; y -= th//2
    d.text((x, y), text, font=f, fill=(60,60,60,opacity))
    return Image.alpha_composite(im, overlay).convert('RGB')

def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest='cmd', required=True)
    ad = sub.add_parser('add'); ad.add_argument('input'); ad.add_argument('-o','--output', required=True); ad.add_argument('--text', required=True); ad.add_argument('--pos', default='br'); ad.add_argument('--opacity', type=int, default=120); ad.set_defaults(kind='add')
    bt = sub.add_parser('batch'); bt.add_argument('directory'); bt.add_argument('--text', required=True); bt.add_argument('--pos', default='br'); bt.add_argument('--outdir', required=True); bt.set_defaults(kind='batch')
    a = p.parse_args()
    if a.kind == 'add':
        watermark(Image.open(a.input), a.text, a.pos, a.opacity).save(a.output)
        print('已生成 ' + a.output)
    else:
        out = Path(a.outdir); out.mkdir(parents=True, exist_ok=True)
        n = 0
        for f in sorted(Path(a.directory).iterdir()):
            if f.suffix.lower() not in ('.jpg','.jpeg','.png','.webp','.bmp'): continue
            watermark(Image.open(f), a.text, a.pos, 120).save(out / f.name)
            n += 1
        print('已为 ' + str(n) + ' 张图片添加水印,输出到 ' + str(out))

main()
