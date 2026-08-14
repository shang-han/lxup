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
    from PIL.ExifTags import TAGS, GPSTAGS
except ImportError:
    sys.stderr.write('[exif_tool] 缺少依赖 pillow,请先执行: pip install "pillow>=9.0"\n'); sys.exit(1)

def get_exif(im):
    try:
        return im._getexif() or {}
    except Exception:
        return {}

def human(exif):
    out = {}
    for k, v in exif.items():
        tag = TAGS.get(k, k)
        if tag == 'GPSInfo':
            g = {}
            for gk, gv in v.items():
                g[GPSTAGS.get(gk, gk)] = str(gv)
            out[tag] = g
        else:
            out[tag] = str(v)[:80]
    return out

def cmd_info(a):
    im = Image.open(a.input)
    exif = human(get_exif(im))
    if not exif:
        print('该图片无 EXIF 元数据')
        return
    for k in ('Make','Model','DateTime','GPSInfo'):
        if k in exif: print(k + ': ' + str(exif[k]))
    if not any(k in exif for k in ('Make','Model','DateTime','GPSInfo')):
        print('EXIF 字段: ' + ', '.join(exif.keys()))

def strip_one(src, dst):
    im = Image.open(src)
    data = list(im.getdata())
    clean = Image.new(im.mode, im.size)
    clean.putdata(data)
    clean.save(dst)

def cmd_strip(a):
    strip_one(a.input, a.output)
    print('已清除元数据,输出 ' + a.output)

def cmd_batch(a):
    out = Path(a.outdir); out.mkdir(parents=True, exist_ok=True)
    n = 0
    for f in sorted(Path(a.directory).iterdir()):
        if f.suffix.lower() not in ('.jpg','.jpeg','.png','.tiff','.webp'): continue
        strip_one(f, out / f.name); n += 1
    print('已清理 ' + str(n) + ' 张图片到 ' + str(out))

def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest='cmd', required=True)
    i = sub.add_parser('info'); i.add_argument('input'); i.set_defaults(func=cmd_info)
    s = sub.add_parser('strip'); s.add_argument('input'); s.add_argument('-o','--output', required=True); s.set_defaults(func=cmd_strip)
    b = sub.add_parser('batch'); b.add_argument('directory'); b.add_argument('--outdir', required=True); b.set_defaults(func=cmd_batch)
    a = p.parse_args()
    try:
        a.func(a)
    except SystemExit:
        raise
    except Exception as e:
        sys.stderr.write('[exif_tool] 处理错误: ' + str(e) + '\n'); sys.exit(2)

main()
