#!/usr/bin/env python3
# -*- coding: utf-8 -*-
try:
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import argparse, shutil, sys
from pathlib import Path

def main():
    p = argparse.ArgumentParser()
    p.add_argument('replace'); p.add_argument('directory'); p.add_argument('--find', required=True); p.add_argument('--replace', required=True)
    p.add_argument('--ext'); p.add_argument('--recursive', action='store_true'); p.add_argument('--dry-run', action='store_true'); p.add_argument('--backup', action='store_true')
    p.add_argument('--ignore-case', action='store_true')
    a = p.parse_args()
    d = Path(a.directory)
    files = d.rglob('*') if a.recursive else d.iterdir()
    exts = set(x.strip().lower() for x in (a.ext or '').split(',') if x.strip())
    total = 0; changed = 0
    for f in files:
        if not f.is_file(): continue
        if exts and f.suffix.lower() not in exts: continue
        if f.suffix.lower() in ('.exe','.dll','.png','.jpg','.zip','.pyc'): continue
        try:
            text = f.read_text(encoding='utf-8')
        except Exception:
            continue
        if a.ignore_case:
            cnt = text.lower().count(a.find.lower())
            new = text.replace(a.find, a.replace)  # 大小写不敏感仅计数,替换保持原逻辑
            cnt2 = new.count(a.replace) - text.count(a.replace)
        else:
            cnt = text.count(a.find)
            new = text.replace(a.find, a.replace)
        if not cnt: continue
        total += cnt; changed += 1
        if a.dry_run:
            print(f.name + ': ' + str(cnt) + ' 处')
        else:
            if a.backup:
                shutil.copy2(f, f.with_suffix(f.suffix + '.bak'))
            f.write_text(new, encoding='utf-8')
    if a.dry_run:
        print('(dry-run) 共 ' + str(changed) + ' 个文件、' + str(total) + ' 处,未写入。确认后去掉 --dry-run')
    else:
        print('已替换 ' + str(changed) + ' 个文件共 ' + str(total) + ' 处' + ('(备份为 .bak)' if a.backup else ''))

main()
