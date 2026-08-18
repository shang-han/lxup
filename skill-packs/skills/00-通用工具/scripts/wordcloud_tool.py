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
    import jieba
except ImportError:
    sys.stderr.write('[wordcloud_tool] 缺少依赖 jieba,请先执行: pip install "jieba"\n'); sys.exit(1)
try:
    from PIL import Image
    import numpy as np
except ImportError:
    sys.stderr.write('[wordcloud_tool] 缺少依赖 pillow/numpy,请先执行: pip install "pillow" "numpy"\n'); sys.exit(1)

FONT_CANDIDATES = [r'C:\Windows\Fonts\msyh.ttc', r'C:\Windows\Fonts\simhei.ttf', r'C:\Windows\Fonts\simsun.ttc']

# 内置中文停用词(单字虚词 + 常用口语词)
STOP = set('的了在是和我有也就人都一个上不很到说要去你会着没有看好自己这那他她它们我们你们他们之其与及或等')
STOP.update([
    '可以','就是','还是','因为','所以','但是','如果','没有','什么','怎么','为什么',
    '这个','那个','一个','我们','你们','他们','已经','现在','进行','通过','对于',
    '以及','或者','然后','还有','一些','一样','可能','应该','需要','自己','一下',
    '这些','那些','时候','情况','问题','方式','方面','大家','觉得','认为','知道',
])

URL_RE = re.compile(r'https?://\S+|www\.\S+')
EMAIL_RE = re.compile(r'[\w.\-]+@[\w\-]+(\.[\w\-]+)+')
NUM_RE = re.compile(r'^\d+([.,]\d+)?%?$')

def load_stopwords(path):
    try:
        return set(ln.strip() for ln in open(path, encoding='utf-8') if ln.strip())
    except Exception as e:
        sys.stderr.write('[wordcloud_tool] 无法读取停用词文件: ' + str(e) + '\n'); sys.exit(1)

def tokenize(text):
    """jieba 精确模式分词;剔除网址/邮箱/纯数字/纯符号"""
    text = URL_RE.sub(' ', text)
    text = EMAIL_RE.sub(' ', text)
    out = []
    for w in jieba.cut(text):
        w = w.strip()
        if not w or NUM_RE.match(w):
            continue
        if re.fullmatch(r'[\W_]+', w):  # 纯符号(标点/emoji 等)
            continue
        if re.search(r'[A-Za-z一-鿿]', w):  # 至少含一个中英文字符
            out.append(w)
    return out

def main():
    p = argparse.ArgumentParser()
    p.add_argument('create'); p.add_argument('input'); p.add_argument('-o','--output', required=True)
    p.add_argument('--mask'); p.add_argument('--size', default='1200x800'); p.add_argument('--stopwords')
    a = p.parse_args()
    text = open(a.input, encoding='utf-8').read()
    if len(text.strip()) < 100:
        sys.stderr.write('[wordcloud_tool] 文本过短(<100 字),词云意义不大\n'); sys.exit(1)
    stop = STOP | (load_stopwords(a.stopwords) if a.stopwords else set())
    freq = {}
    for w in tokenize(text):
        if w.lower() in stop or len(w) < 2:
            continue
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
