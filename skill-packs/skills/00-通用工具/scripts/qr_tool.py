#!/usr/bin/env python3
# -*- coding: utf-8 -*-
try:
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import argparse, sys
try:
    import qrcode
except ImportError:
    sys.stderr.write('[qr_tool] 缺少依赖 qrcode,请先执行: pip install "qrcode[pil]"\n'); sys.exit(1)

def cmd_create(a):
    qr = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=4)
    qr.add_data(a.text); qr.make(fit=True)
    img = qr.make_image(fill_color='black', back_color='white')
    if a.size:
        img = img.resize((a.size, a.size))
    img.save(a.output)
    print('已生成 ' + a.output + ' (' + str(img.size[0]) + 'x' + str(img.size[1]) + ')')

def cmd_read(a):
    try:
        from pyzbar import pyzbar
    except ImportError:
        sys.stderr.write('[qr_tool] 解析需 pyzbar(还需系统 libzbar),可执行: pip install "pyzbar"\n'); sys.exit(1)
    try:
        from PIL import Image
    except ImportError:
        sys.stderr.write('[qr_tool] 解析需 pillow: pip install "pillow"\n'); sys.exit(1)
    results = pyzbar.decode(Image.open(a.input))
    if not results:
        sys.stderr.write('[qr_tool] 未识别到二维码\n'); sys.exit(2)
    for r in results:
        print(r.data.decode('utf-8', errors='replace'))

def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest='cmd', required=True)
    c = sub.add_parser('create'); c.add_argument('text'); c.add_argument('-o','--output', required=True); c.add_argument('--size', type=int); c.set_defaults(func=cmd_create)
    r = sub.add_parser('read'); r.add_argument('input'); r.set_defaults(func=cmd_read)
    a = p.parse_args()
    a.func(a)

main()
