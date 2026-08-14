#!/usr/bin/env python3
# -*- coding: utf-8 -*-
try:
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import argparse, json, sys
from datetime import date
try:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
except ImportError:
    sys.stderr.write('[gantt_tool] 缺少依赖 matplotlib,请先执行: pip install "matplotlib"\n'); sys.exit(1)
for fn in ['Microsoft YaHei', 'SimHei', 'PingFang SC', 'Noto Sans CJK SC']:
    try:
        plt.rcParams['font.sans-serif'] = [fn]; plt.rcParams['axes.unicode_minus'] = False; break
    except Exception:
        pass

def d(s): return date.fromisoformat(s.strip())

def main():
    p = argparse.ArgumentParser()
    p.add_argument('create'); p.add_argument('-o','--output', required=True); p.add_argument('--data', required=True)
    a = p.parse_args()
    try:
        spec = json.load(open(a.data, encoding='utf-8'))
        tasks = spec['tasks']
    except Exception as e:
        sys.stderr.write('[gantt_tool] 数据错误: ' + str(e) + '\n'); sys.exit(1)
    for t in tasks:
        if t.get('milestone'): continue
        try:
            if d(t['start']) > d(t['end']):
                sys.stderr.write('[gantt_tool] 任务「' + t['name'] + '」结束早于开始\n'); sys.exit(1)
        except ValueError as e:
            sys.stderr.write('[gantt_tool] 日期格式需为 YYYY-MM-DD: ' + str(e) + '\n'); sys.exit(1)
    tasks = sorted(tasks, key=lambda t: d(t['start']))
    fig, ax = plt.subplots(figsize=(max(8, len(tasks)*0.4), max(4, len(tasks)*0.45)))
    for i, t in enumerate(tasks):
        if t.get('milestone'):
            ax.scatter([d(t['start'])], [i], marker='D', color='#c62828', s=80, zorder=3)
            ax.text(d(t['start']), i+0.25, t['name'], fontsize=9, va='bottom')
        else:
            start, end = d(t['start']), d(t['end'])
            ax.barh(i, (end-start).days+1, left=start, height=0.55, color='#4c8bf5', alpha=0.9)
            ax.text(start, i, ' '+t['name'], fontsize=9, va='center')
    ax.set_yticks([]); ax.set_title(spec.get('title','项目排期'))
    if tasks:
        mn = min(d(t['start']) for t in tasks); mx = max(d(t['end'] if not t.get('milestone') else t['start']) for t in tasks)
        ax.set_xlim(mn, mx)
    plt.tight_layout(); plt.savefig(a.output, dpi=120); plt.close()
    print('已生成 ' + a.output + '(' + str(len(tasks)) + ' 个任务)')

main()
