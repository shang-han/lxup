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
    sys.stderr.write('[imgpdf_tool] 缺少依赖 pillow,请先执行: pip install "pillow>=9.0"\n'); sys.exit(1)
try:
    from pypdf import PdfReader
except ImportError:
    sys.stderr.write('[imgpdf_tool] 缺少依赖 pypdf,请先执行: pip install "pypdf>=3.0"\n'); sys.exit(1)

def cmd_img2pdf(a):
    imgs = []
    for f in a.images:
        im = Image.open(f)
        if im.mode != 'RGB': im = im.convert('RGB')
        imgs.append(im)
    imgs[0].save(a.output, 'PDF', save_all=True, append_images=imgs[1:], resolution=100)
    print('已生成 ' + a.output + ',共 ' + str(len(imgs)) + ' 页')

def cmd_pdf2img(a):
    r = PdfReader(a.input)
    total = len(r.pages)
    sel = list(range(total))
    if a.pages:
        sel = []
        for part in a.pages.split(','):
            if '-' in part:
                x, y = part.split('-',1); sel.extend(range(int(x)-1, int(y)))
            else:
                sel.append(int(part)-1)
    outdir = Path(a.outdir); outdir.mkdir(parents=True, exist_ok=True)
    n = 0
    for i in sel:
        page = r.pages[i]
        img = None
        try:
            if page.images:
                img = page.images[0].image
        except Exception:
            img = None
        if img is None:
            sys.stderr.write('[imgpdf_tool] 第 ' + str(i+1) + ' 页无内嵌图像,跳过\n'); continue
        Image.open(img).convert('RGB').save(outdir / ('page_%03d.png' % (i+1)))
        n += 1
    if n == 0:
        sys.stderr.write('[imgpdf_tool] 未能导出任何页(该 PDF 可能为纯文本页)\n'); sys.exit(2)
    print('已导出 ' + str(n) + ' 页图片到 ' + str(outdir))

def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest='cmd', required=True)
    i = sub.add_parser('img2pdf'); i.add_argument('images', nargs='+'); i.add_argument('-o','--output', required=True); i.set_defaults(func=cmd_img2pdf)
    f = sub.add_parser('pdf2img'); f.add_argument('input'); f.add_argument('--outdir', required=True); f.add_argument('--dpi', type=int); f.add_argument('--pages'); f.set_defaults(func=cmd_pdf2img)
    a = p.parse_args()
    try:
        a.func(a)
    except SystemExit:
        raise
    except Exception as e:
        sys.stderr.write('[imgpdf_tool] 处理错误: ' + str(e) + '\n'); sys.exit(2)

main()
