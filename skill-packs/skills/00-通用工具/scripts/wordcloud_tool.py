#!/usr/bin/env python3
# -*- coding: utf-8 -*-
try:
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import argparse, os, re, sys
try:
    from wordcloud import WordCloud
except ImportError:
    sys.stderr.write('[wordcloud_tool] 缺少依赖 wordcloud,请先执行: pip install "wordcloud"\n'); sys.exit(1)
try:
    from PIL import Image
    import numpy as np
except ImportError:
    sys.stderr.write('[wordcloud_tool] 缺少依赖 pillow/numpy,请先执行: pip install "pillow" "numpy"\n'); sys.exit(1)

FONT_CANDIDATES = [r'C:\Windows\Fonts\msyh.ttc', r'C:\Windows\Fonts\simhei.ttf', r'C:\Windows\Fonts\simsun.ttc']
STOP = set('的了在是和我有也就人都一个上不很到说要去你会着没有看好自己这那他她它们我们你们他们之其与及或等')

def tokenize(text):
    return re.findall(r'[一-鿿]{2,4}|[A-Za-z][A-Za-z0-9_\-]{2,}', text)

def main():
    p = argparse.ArgumentParser()
    p.add_argument('create'); p.add_argument('input'); p.add_argument('-o','--output', required=True)
    p.add_argument('--mask'); p.add_argument('--size', default='1200x800')
    a = p.parse_args()
    text = open(a.input, encoding='utf-8').read()
    if len(text.strip()) < 100:
        sys.stderr.write('[wordcloud_tool] 文本过短(<100 字),词云意义不大\n'); sys.exit(1)
    freq = {}
    for w in tokenize(text):
        if w.lower() in STOP or len(w) < 2: continue
        freq[w] = freq.get(w, 0) + 1
    if not freq:
        sys.stderr.write('[wordcloud_tool] 未提取到有效词\n'); sys.exit(2)
    w, h = (int(x) for x in a.size.split('x'))
    font = next((f for f in FONT_CANDIDATES if os.path.exists(f)), None)
    mask = None
    if a.mask:
        mask = np.array(Image.open(a.mask).convert('L'))
    wc = WordCloud(font_path=font, width=w, height=h, background_color='white', mask=mask, max_words=300, collocations=False)
    wc.generate_from_frequencies(freq)
    wc.to_file(a.output)
    top = sorted(freq.items(), key=lambda x: -x[1])[:10]
    print('已生成 ' + a.output + '(' + str(len(freq)) + ' 个词)')
    print('前 10 高频词: ' + ', '.join(k + '(' + str(v) + ')' for k, v in top))

main()
