#!/usr/bin/env python3
# -*- coding: utf-8 -*-
try:
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import argparse, json, sys
from pathlib import Path

def load(p):
    try:
        return json.load(open(p, encoding='utf-8'))
    except json.JSONDecodeError as e:
        sys.stderr.write('[json_tool] JSON 语法错误: 第 ' + str(e.lineno) + ' 行第 ' + str(e.colno) + ' 列: ' + e.msg + '\n')
        sys.exit(1)

def cmd_pretty(a):
    data = load(a.input)
    json.dump(data, open(a.output, 'w', encoding='utf-8'), ensure_ascii=False, indent=a.indent, sort_keys=a.sort)
    print('已美化 ' + a.input + ' -> ' + a.output)

def cmd_validate(a):
    load(a.input)
    print('JSON 合法')

def cmd_get(a):
    data = load(a.input)
    cur = data
    for part in a.path.replace('[', '.[').split('.'):
        part = part.strip()
        if not part: continue
        if part.startswith('['):
            cur = cur[int(part[1:-1])]
        else:
            cur = cur[part]
    print(json.dumps(cur, ensure_ascii=False, indent=2))

def cmd_keys(a):
    data = load(a.input)
    if isinstance(data, dict):
        for k, v in data.items():
            print(k + ': ' + type(v).__name__ + (('[' + str(len(v)) + ']') if isinstance(v, list) else ''))
    else:
        print('顶层为 ' + type(data).__name__)

def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest='cmd', required=True)
    pr = sub.add_parser('pretty'); pr.add_argument('input'); pr.add_argument('-o','--output', required=True); pr.add_argument('--indent', type=int, default=2); pr.add_argument('--sort', action='store_true'); pr.set_defaults(func=cmd_pretty)
    v = sub.add_parser('validate'); v.add_argument('input'); v.set_defaults(func=cmd_validate)
    g = sub.add_parser('get'); g.add_argument('input'); g.add_argument('--path', required=True); g.set_defaults(func=cmd_get)
    k = sub.add_parser('keys'); k.add_argument('input'); k.set_defaults(func=cmd_keys)
    a = p.parse_args()
    a.func(a)

main()
