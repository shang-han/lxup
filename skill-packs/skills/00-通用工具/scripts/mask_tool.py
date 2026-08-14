#!/usr/bin/env python3
# -*- coding: utf-8 -*-
try:
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import argparse, re, sys
from pathlib import Path

PATTERNS = {
    'phone': re.compile(r'1[3-9]\d{9}'),
    'id': re.compile(r'\d{17}[\dXx]|\d{15}'),
    'card': re.compile(r'\d{16,19}'),
    'email': re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'),
    'name': re.compile(r'[一-龥]{2,4}(?=(?:先生|女士|同学|经理|总|老师))'),
}

def mask_text(text, modes):
    counts = {}
    def sub(pattern, key, repl):
        nonlocal text
        result, n = pattern.subn(lambda m: repl(m), text)
        text = result
        if n: counts[key] = n
    if 'phone' in modes or 'all' in modes:
        sub(PATTERNS['phone'], 'phone', lambda m: m.group()[:3] + '****' + m.group()[-4:])
    if 'id' in modes or 'all' in modes:
        sub(PATTERNS['id'], 'id', lambda m: m.group()[:3] + '***********' + m.group()[-4:])
    if 'card' in modes or 'all' in modes:
        sub(PATTERNS['card'], 'card', lambda m: m.group()[:4] + ' **** **** ' + m.group()[-4:])
    if 'email' in modes or 'all' in modes:
        sub(PATTERNS['email'], 'email', lambda m: m.group()[:2] + '***@' + m.group().split('@')[1])
    if 'name' in modes or 'all' in modes:
        sub(PATTERNS['name'], 'name', lambda m: m.group()[0] + '**')
    return counts

def main():
    p = argparse.ArgumentParser()
    p.add_argument('mask'); p.add_argument('input'); p.add_argument('-o','--output', required=True); p.add_argument('--mode', default='all')
    a = p.parse_args()
    src = Path(a.input)
    modes = set(x.strip() for x in a.mode.split(','))
    if src.is_dir():
        total = {}
        for f in src.iterdir():
            if not f.is_file() or f.suffix.lower() not in ('.txt','.md','.csv','.log','.json'): continue
            text = f.read_text(encoding='utf-8', errors='ignore')
            c = mask_text(text, modes)
            Path(a.output).mkdir(parents=True, exist_ok=True)
            (Path(a.output) / f.name).write_text(text, encoding='utf-8')
            for k, v in c.items(): total[k] = total.get(k, 0) + v
        print('已脱敏目录到 ' + a.output + ':' + ', '.join(k + ' ' + str(v) + ' 处' for k, v in total.items()))
    else:
        text = src.read_text(encoding='utf-8', errors='ignore')
        counts = mask_text(text, modes)
        Path(a.output).write_text(text, encoding='utf-8')
        print('已脱敏 ' + str(src) + ' -> ' + a.output + ':' + ', '.join(k + ' ' + str(v) + ' 处' for k, v in counts.items()))

main()
