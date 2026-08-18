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
    import pymupdf as fitz
except ImportError:
    try:
        import fitz  # 旧版 pymupdf 的模块名
    except ImportError:
        sys.stderr.write('[imgpdf_tool] 缺少依赖 pymupdf,请先执行: pip install "pymupdf"\n'); sys.exit(1)

def cmd_img2pdf(a):
    imgs = []
    for f in a.images:
        im = Image.open(f)
        if im.mode != 'RGB': im = im.convert('RGB')
        imgs.append(im)
    imgs[0].save(a.output, 'PDF', save_all=True, append_images=imgs[1:], resolution=100)
    print('已生成 ' + a.output + ',共 ' + str(len(imgs)) + ' 页')

def parse_pages(spec, total):
    sel = []
    for part in spec.split(','):
        try:
            if '-' in part:
                x, y = part.split('-', 1)
                sel.extend(range(int(x) - 1, min(int(y), total)))
            else:
                i = int(part) - 1
                if 0 <= i < total:
                    sel.append(i)
        except ValueError:
            continue
    return sel

def cmd_pdf2img(a):
    try:
        doc = fitz.open(a.input)
    except Exception as e:
        sys.stderr.write('[imgpdf_tool] 无法打开 PDF: ' + str(e) + '\n'); sys.exit(1)
    total = len(doc)
    sel = list(range(total))
    if a.pages:
        sel = parse_pages(a.pages, total)
        if not sel:
            sys.stderr.write('[imgpdf_tool] 页码范围无效(共 ' + str(total) + ' 页)\n'); sys.exit(1)
    dpi = a.dpi or 150
    outdir = Path(a.outdir); outdir.mkdir(parents=True, exist_ok=True)
    n = 0
    for i in sel:
        pix = doc[i].get_pixmap(dpi=dpi)  # 逐页真实渲染,纯文本页/扫描页均可导出
        pix.save(str(outdir / ('page_%03d.png' % (i + 1))))
        n += 1
    print('已导出 ' + str(n) + ' 页图片到 ' + str(outdir) + '(dpi=' + str(dpi) + ')')

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
