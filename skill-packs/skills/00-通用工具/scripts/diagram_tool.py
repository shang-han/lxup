#!/usr/bin/env python3
# -*- coding: utf-8 -*-
try:
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import argparse, sys

HTML = """<!DOCTYPE html><html><head><meta charset="utf-8"><title>Mermaid</title>
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
<script>mermaid.initialize({startOnLoad:true, theme:'default'});</script>
<style>body{max-width:960px;margin:24px auto;padding:0 16px;font-family:-apple-system,"Microsoft YaHei",sans-serif}
pre.mermaid{background:#fafafa;border:1px solid #eee;border-radius:8px;padding:16px}</style>
</head><body><pre class="mermaid">
MMD
</pre></body></html>"""

def main():
    p = argparse.ArgumentParser()
    p.add_argument('render'); p.add_argument('input'); p.add_argument('-o','--output', required=True)
    a = p.parse_args()
    try:
        mmd = open(a.input, encoding='utf-8').read()
    except Exception as e:
        sys.stderr.write('[diagram_tool] 无法读取: ' + str(e) + '\n'); sys.exit(1)
    if not mmd.strip():
        sys.stderr.write('[diagram_tool] 输入为空\n'); sys.exit(1)
    if a.output.lower().endswith('.html'):
        open(a.output, 'w', encoding='utf-8').write(HTML.replace('MMD', mmd))
        print('已生成 ' + a.output + '(浏览器打开查看)')
    elif a.output.lower().endswith('.md'):
        open(a.output, 'w', encoding='utf-8').write('```mermaid\n' + mmd.rstrip() + '\n```\n')
        print('已生成 ' + a.output + '(Mermaid 代码块)')
    else:
        sys.stderr.write('[diagram_tool] 输出需为 .html 或 .md\n'); sys.exit(1)

main()
