#!/usr/bin/env python3
# -*- coding: utf-8 -*-
try:
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import argparse, csv, json, sys

def load_csv(p):
    with open(p, encoding='utf-8-sig', newline='') as f:
        rows = list(csv.reader(f))
    if not rows: sys.stderr.write('[compare_tool] ' + p + ' 为空\n'); sys.exit(1)
    return [dict(zip(rows[0], r)) for r in rows[1:]]

def load_json(p):
    data = json.load(open(p, encoding='utf-8'))
    if isinstance(data, dict) and isinstance(data.get('data'), list): data = data['data']
    if not isinstance(data, list) or not all(isinstance(x, dict) for x in data):
        sys.stderr.write('[compare_tool] JSON 需为对象数组\n'); sys.exit(1)
    return data

def compare(old, new, key):
    old_m, new_m = {}, {}
    dup = set()
    for o in old:
        k = o.get(key)
        if k in old_m: dup.add(str(k))
        old_m[k] = o
    for n in new:
        k = n.get(key)
        if k in new_m: dup.add(str(k))
        new_m[k] = n
    if dup:
        sys.stderr.write('[compare_tool] 主键存在重复: ' + ', '.join(sorted(dup)) + '\n'); sys.exit(1)
    added = [k for k in new_m if k not in old_m]
    removed = [k for k in old_m if k not in new_m]
    changed = []
    for k in old_m:
        if k not in new_m: continue
        diffs = {c: (str(old_m[k].get(c,'')), str(new_m[k].get(c,''))) for c in old_m[k] if str(old_m[k].get(c,'')) != str(new_m[k].get(c,''))}
        diffs.update({c: ('', str(new_m[k][c])) for c in new_m[k] if c not in old_m[k]})
        if diffs: changed.append((k, diffs))
    return added, removed, changed

def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest='fmt', required=True)
    for name in ('csv','json'):
        s = sub.add_parser(name); s.add_argument('old'); s.add_argument('new'); s.add_argument('-o','--output', required=True); s.add_argument('--key', required=True)
    a = p.parse_args()
    try:
        if a.fmt == 'csv':
            old = load_csv(a.old); new = load_csv(a.new)
        else:
            old, new = load_json(a.old), load_json(a.new)
    except Exception as e:
        sys.stderr.write('[compare_tool] 读取失败: ' + str(e) + '\n'); sys.exit(1)
    added, removed, changed = compare(old, new, a.key)
    lines = ['# 数据差异报告', '', '主键: ' + a.key, '', '- 新增: %d 条' % len(added), '- 删除: %d 条' % len(removed), '- 变更: %d 条' % len(changed), '']
    if added:
        lines.append('## 新增')
        for k in added: lines.append('- ' + str(k))
        lines.append('')
    if removed:
        lines.append('## 删除')
        for k in removed: lines.append('- ' + str(k))
        lines.append('')
    if changed:
        lines.append('## 变更')
        for k, diffs in changed:
            lines.append('- **' + str(k) + '**: ' + '; '.join(c + ': ' + o + ' -> ' + n for c, (o, n) in diffs.items()))
    open(a.output, 'w', encoding='utf-8').write('\n'.join(lines))
    print('新增 %d 条、删除 %d 条、变更 %d 条,明细见 %s' % (len(added), len(removed), len(changed), a.output))

main()
