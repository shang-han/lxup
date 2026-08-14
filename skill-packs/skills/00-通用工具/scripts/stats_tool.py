#!/usr/bin/env python3
# -*- coding: utf-8 -*-
try:
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import argparse, csv, os, sys
try:
    import numpy as np
except ImportError:
    sys.stderr.write('[stats_tool] 缺少依赖 numpy,请先执行: pip install "numpy"\n'); sys.exit(1)
try:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
except ImportError:
    sys.stderr.write('[stats_tool] 缺少依赖 matplotlib,请先执行: pip install "matplotlib"\n'); sys.exit(1)
for fn in ['Microsoft YaHei', 'SimHei', 'PingFang SC', 'Noto Sans CJK SC']:
    try:
        plt.rcParams['font.sans-serif'] = [fn]; plt.rcParams['axes.unicode_minus'] = False; break
    except Exception:
        pass

def main():
    p = argparse.ArgumentParser()
    p.add_argument('analyze'); p.add_argument('input'); p.add_argument('-o','--output', required=True); p.add_argument('--cols'); p.add_argument('--fig-dir', default='.')
    a = p.parse_args()
    with open(a.input, encoding='utf-8-sig', newline='') as f:
        rows = list(csv.reader(f))
    if not rows: sys.stderr.write('[stats_tool] 文件为空\n'); sys.exit(1)
    header, data = rows[0], rows[1:]
    cols = [c.strip() for c in (a.cols or '').split(',') if c.strip()] or header
    os.makedirs(a.fig_dir, exist_ok=True)
    lines = ['# 统计报告', '', '数据: ' + a.input + '(' + str(len(data)) + ' 行)', '']
    issues = []
    for c in cols:
        if c not in header:
            lines.append('- 列「' + c + '」不存在,已跳过'); continue
        i = header.index(c)
        vals = []
        for r in data:
            try: vals.append(float(r[i]))
            except Exception: pass
        missing = len(data) - len(vals)
        arr = np.array(vals)
        if len(arr) == 0:
            lines += ['## ' + c, '- 无有效数值(全部缺失)', '']; continue
        lines += ['## ' + c, '- 样本数: %d,缺失: %d' % (len(arr), missing),
                  '- 均值: %.2f,中位数: %.2f,标准差: %.2f' % (arr.mean(), np.median(arr), arr.std(ddof=1)),
                  '- 最大: %.2f,最小: %.2f' % (arr.max(), arr.min()),
                  '- 四分位数: %.2f / %.2f / %.2f' % (np.percentile(arr,25), np.percentile(arr,50), np.percentile(arr,75)), '']
        fig = os.path.join(a.fig_dir, c + '_hist.png')
        plt.figure(figsize=(6,4)); plt.hist(arr, bins=min(30, max(5, len(arr)//10))); plt.title(c); plt.tight_layout(); plt.savefig(fig); plt.close()
        lines.append('![%s 分布](%s)' % (c, fig))
        if len(arr) >= 10:
            q75, q25 = np.percentile(arr,75), np.percentile(arr,25)
            iqr = q75 - q25
            hi = arr[arr > q75 + 1.5*iqr]
            if len(hi): issues.append('- ' + c + ': %d 个极端大值(> Q3+1.5xIQR=%.2f),建议单独核查' % (len(hi), q75+1.5*iqr))
            if missing / len(data) > 0.1: issues.append('- ' + c + ': 缺失比例 %.0f%%,需关注' % (missing/len(data)*100))
    lines.append('')
    lines = lines + ['## 需关注'] + (issues or ['- 无'])
    open(a.output, 'w', encoding='utf-8').write('\n'.join(lines))
    print('已生成报告 ' + a.output + ' 与图表(目录 ' + a.fig_dir + ')')

main()
