#!/usr/bin/env python3
# -*- coding: utf-8 -*-
try:
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import argparse, csv, json, re, sys
from pathlib import Path
try:
    from pypdf import PdfReader
except ImportError:
    sys.stderr.write('[invoice_tool] 缺少依赖 pypdf,请先执行: pip install "pypdf>=3.0"\n'); sys.exit(1)

PATTERNS = {
    'invoice_no': [r'发票号码[:：]\s*([0-9]{8,20})', r'No\.?\s*([0-9]{8,20})'],
    'date': [r'开票日期[:：]\s*(\d{4}年\d{1,2}月\d{1,2}日|\d{4}-\d{2}-\d{2})'],
    'amount': [r'价税合计[^0-9¥￥]{0,10}[¥￥]?\s*([0-9,]+\.\d{2})', r'\(小写\)[¥￥]?\s*([0-9,]+\.\d{2})', r'合\s*计[^0-9¥￥]{0,10}[¥￥]?\s*([0-9,]+\.\d{2})'],
    'buyer': [r'名\s*称[:：]\s*([^\n]{2,50})'],
    'buyer_tax': [r'纳税人识别号[:：]\s*([0-9A-Z]{15,20})'],
}

def extract_text(text):
    out = {}
    for key, pats in PATTERNS.items():
        for pat in pats:
            m = re.search(pat, text)
            if m:
                out[key] = m.group(1).replace(',',''); break
        else:
            out[key] = None
    return out

def pdf_text(path):
    r = PdfReader(str(path))
    return '\n'.join((page.extract_text() or '') for page in r.pages)

def main():
    p = argparse.ArgumentParser()
    p.add_argument('extract'); p.add_argument('input'); p.add_argument('-o','--output')
    a = p.parse_args()
    src = Path(a.input)
    if src.is_dir():
        files = sorted([f for f in src.iterdir() if f.suffix.lower() in ('.pdf','.txt')])
        items = []
        for f in files:
            text = pdf_text(f) if f.suffix.lower() == '.pdf' else f.read_text(encoding='utf-8')
            if not text.strip():
                sys.stderr.write('[invoice_tool] ' + f.name + ': 无文字层(扫描版?),跳过\n'); continue
            items.append({'file': f.name, **extract_text(text)})
        if a.output:
            header = ['file','invoice_no','date','amount','buyer','buyer_tax']
            with open(a.output,'w',encoding='utf-8-sig',newline='') as fo:
                w = csv.writer(fo); w.writerow(header)
                for it in items: w.writerow([it.get(h) or '' for h in header])
        total = sum(float(i['amount']) for i in items if i['amount'])
        msg = '已提取 ' + str(len(items)) + ' 张'
        if total: msg += ',合计 {:,.2f} 元'.format(total)
        if a.output: msg += ',台账: ' + a.output
        print(msg)
        if len(items) < len(files): print('提示: 部分文件无文字层,需 OCR')
    else:
        text = pdf_text(src) if src.suffix.lower() == '.pdf' else src.read_text(encoding='utf-8')
        if not text.strip():
            sys.stderr.write('[invoice_tool] 无文字层(扫描版?),无法提取\n'); sys.exit(2)
        out = extract_text(text)
        print(json.dumps(out, ensure_ascii=False, indent=2))
        if a.output: json.dump(out, open(a.output,'w',encoding='utf-8'), ensure_ascii=False, indent=2)

main()
