#!/usr/bin/env python3
# -*- coding: utf-8 -*-
try:
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import argparse, csv, sys

def load(p):
    with open(p, encoding='utf-8-sig', newline='') as f:
        rows = list(csv.reader(f))
    if not rows:
        sys.stderr.write('[csv_tool] ' + p + ' 为空\n'); sys.exit(1)
    return rows[0], rows[1:]

def save(p, header, rows):
    with open(p, 'w', encoding='utf-8-sig', newline='') as f:
        w = csv.writer(f); w.writerow(header); w.writerows(rows)

def idx(header, name):
    if name in header: return header.index(name)
    sys.stderr.write('[csv_tool] 列不存在: ' + name + '(表头: ' + ', '.join(header) + ')\n'); sys.exit(1)

def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest='cmd', required=True)
    f = sub.add_parser('filter'); f.add_argument('input'); f.add_argument('-o','--output', required=True); f.add_argument('--where', required=True); f.set_defaults(kind='filter')
    s = sub.add_parser('sort'); s.add_argument('input'); s.add_argument('-o','--output', required=True); s.add_argument('--by', required=True); s.add_argument('--desc', action='store_true'); s.set_defaults(kind='sort')
    d = sub.add_parser('dedup'); d.add_argument('input'); d.add_argument('-o','--output', required=True); d.add_argument('--by', required=True); d.set_defaults(kind='dedup')
    m = sub.add_parser('merge'); m.add_argument('left'); m.add_argument('right'); m.add_argument('-o','--output', required=True); m.add_argument('--on', required=True); m.set_defaults(kind='merge')
    st = sub.add_parser('stats'); st.add_argument('input'); st.add_argument('--cols'); st.set_defaults(kind='stats')
    h = sub.add_parser('head'); h.add_argument('input'); h.add_argument('-n', type=int, default=10); h.set_defaults(kind='head')
    a = p.parse_args()
    try:
        if a.kind == 'head':
            header, rows = load(a.input)
            for r in ([header] + rows)[:a.n]: print(','.join(r))
        elif a.kind == 'filter':
            col, val = (x.strip() for x in a.where.split('=',1))
            header, rows = load(a.input); i = idx(header, col)
            out = [r for r in rows if r[i] == val]
            save(a.output, header, out); print('筛选后 ' + str(len(out)) + ' 行,已保存 ' + a.output)
        elif a.kind == 'sort':
            header, rows = load(a.input); i = idx(header, a.by)
            def key(r):
                try: return (0, float(r[i]))
                except Exception: return (1, r[i])
            rows.sort(key=key, reverse=a.desc)
            save(a.output, header, rows); print('已按 ' + a.by + ' 排序(' + str(len(rows)) + ' 行),保存 ' + a.output)
        elif a.kind == 'dedup':
            header, rows = load(a.input); i = idx(header, a.by)
            seen, out = set(), []
            for r in rows:
                if r[i] in seen: continue
                seen.add(r[i]); out.append(r)
            save(a.output, header, out); print('去重后 ' + str(len(out)) + ' 行(原 ' + str(len(rows)) + '),保存 ' + a.output)
        elif a.kind == 'merge':
            h1, r1 = load(a.left); h2, r2 = load(a.right)
            i1, i2 = idx(h1, a.on), idx(h2, a.on)
            m2 = {r[i2]: r for r in r2}
            header = h1 + [c for c in h2 if c != a.on]
            out = [r + ([m2[r[i1]][j] for j in range(len(h2)) if h2[j] != a.on] if r[i1] in m2 else [''] * (len(header)-len(r))) for r in r1]
            save(a.output, header, out); print('合并 ' + str(len(out)) + ' 行(左 ' + str(len(r1)) + ' 行),保存 ' + a.output)
        elif a.kind == 'stats':
            header, rows = load(a.input)
            cols = [c.strip() for c in (a.cols or '').split(',') if c.strip()] or header
            for c in cols:
                i = idx(header, c)
                nums = []
                try:
                    for r in rows:
                        if r[i] not in ('','-'): nums.append(float(r[i]))
                except ValueError:
                    sys.stderr.write('[csv_tool] 列 ' + c + ' 含非数值,统计中止\n'); sys.exit(2)
                if not nums: print(c + ': 无数值'); continue
                s = sum(nums); n = len(nums)
                print(c + ': 计数 ' + str(n) + ', 和 %.2f, 均值 %.2f, 最大 %.2f, 最小 %.2f' % (s, s/n, max(nums), min(nums)))
    except SystemExit:
        raise
    except Exception as e:
        sys.stderr.write('[csv_tool] 处理错误: ' + str(e) + '\n'); sys.exit(2)

main()
