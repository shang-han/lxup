#!/usr/bin/env python3
# -*- coding: utf-8 -*-
try:
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import argparse, csv, re, sys
from pathlib import Path

PHONE = re.compile(r'(?<!\d)1[3-9]\d{9}(?!\d)')
EMAIL = re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}')

def main():
    p = argparse.ArgumentParser()
    p.add_argument('extract'); p.add_argument('input'); p.add_argument('-o','--output', required=True); p.add_argument('--recursive', action='store_true')
    a = p.parse_args()
    src = Path(a.input)
    files = src.rglob('*') if src.is_dir() and a.recursive else (src.iterdir() if src.is_dir() else [src])
    seen, found = set(), []
    for f in files:
        if not f.is_file(): continue
        if f.suffix.lower() not in ('.txt','.md','.csv','.log','.json','.html'): continue
        try:
            text = f.read_text(encoding='utf-8', errors='ignore')
        except Exception:
            continue
        for m in PHONE.finditer(text):
            if m.group() not in seen:
                seen.add(m.group()); found.append(('phone', m.group(), f.name))
        for m in EMAIL.finditer(text):
            key = m.group().lower()
            if key not in seen:
                seen.add(key); found.append(('email', m.group(), f.name))
    with open(a.output, 'w', encoding='utf-8-sig', newline='') as fo:
        w = csv.writer(fo); w.writerow(['类型','内容','来源文件'])
        w.writerows(found)
    phones = sum(1 for x in found if x[0]=='phone'); emails = len(found) - phones
    print('提取手机号 ' + str(phones) + ' 个、邮箱 ' + str(emails) + ' 个,已保存 ' + a.output)

main()
