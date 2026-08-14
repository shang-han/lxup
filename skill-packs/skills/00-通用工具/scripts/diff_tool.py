#!/usr/bin/env python3
# -*- coding: utf-8 -*-
try:
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import argparse, difflib, sys

def main():
    p = argparse.ArgumentParser()
    p.add_argument('diff'); p.add_argument('old'); p.add_argument('new'); p.add_argument('--html')
    a = p.parse_args()
    try:
        old = open(a.old, encoding='utf-8').read().splitlines()
        new = open(a.new, encoding='utf-8').read().splitlines()
    except UnicodeDecodeError:
        sys.stderr.write('[diff_tool] 二进制文件不支持对比(请先确认是文本)\n'); sys.exit(1)
    except Exception as e:
        sys.stderr.write('[diff_tool] 读取失败: ' + str(e) + '\n'); sys.exit(1)
    if a.html:
        d = difflib.HtmlDiff()
        open(a.html, 'w', encoding='utf-8').write(d.make_file(old, new, a.old, a.new))
        print('已生成高亮差异页 ' + a.html)
    else:
        for line in difflib.unified_diff(old, new, fromfile=a.old, tofile=a.new, lineterm=''):
            print(line)
    sm = difflib.SequenceMatcher(None, old, new)
    add = delete = 0
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == 'insert': add += j2 - j1
        elif tag == 'delete': delete += i2 - i1
        elif tag == 'replace':
            delete += i2 - i1; add += j2 - j1
    if add == delete == 0:
        print('两份文件内容相同')
    else:
        print('差异统计: 新增 ' + str(add) + ' 行、删除 ' + str(delete) + ' 行')

main()
