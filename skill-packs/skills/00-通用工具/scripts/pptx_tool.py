#!/usr/bin/env python3
# -*- coding: utf-8 -*-
try:
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import argparse, sys
try:
    from pptx import Presentation
    from pptx.util import Pt
except ImportError:
    sys.stderr.write('[pptx_tool] 缺少依赖 python-pptx,请先执行: pip install "python-pptx>=0.6.21"\n'); sys.exit(1)

def main():
    p = argparse.ArgumentParser()
    p.add_argument('create'); p.add_argument('-o','--output', required=True); p.add_argument('--outline', required=True)
    a = p.parse_args()
    try:
        lines = open(a.outline, encoding='utf-8').read().splitlines()
    except Exception as e:
        sys.stderr.write('[pptx_tool] 无法读取大纲: ' + str(e) + '\n'); sys.exit(1)
    prs = Presentation()
    cover_title = None
    slides = []
    cur = None
    for ln in lines:
        s = ln.rstrip()
        if s.startswith('# '):
            cover_title = s[2:].strip()
        elif s.startswith('## '):
            cur = {'title': s[3:].strip(), 'items': []}; slides.append(cur)
        elif cur is not None and s.startswith('- '):
            cur['items'].append(s[2:].strip())
    if cover_title:
        sl = prs.slides.add_slide(prs.slide_layouts[0]); sl.shapes.title.text = cover_title
    for item in slides:
        sl = prs.slides.add_slide(prs.slide_layouts[1]); sl.shapes.title.text = item['title']
        tf = sl.placeholders[1].text_frame; tf.clear()
        for i, it in enumerate(item['items']):
            para = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
            para.text = it
            if len(item['items']) > 5:
                for run in para.runs: run.font.size = Pt(18)
    if not slides and not cover_title:
        sys.stderr.write('[pptx_tool] 大纲无内容(需 # 或 ## 开头)\n'); sys.exit(1)
    prs.save(a.output)
    print('已生成 ' + a.output + ',共 ' + str(len(prs.slides._sldIdLst)) + ' 页')

main()
