#!/usr/bin/env python3
# -*- coding: utf-8 -*-
try:
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import argparse, csv, json, sys
try:
    import yaml
except ImportError:
    sys.stderr.write('[conv_tool] 缺少依赖 pyyaml,请先执行: pip install "pyyaml"\n'); sys.exit(1)
try:
    import markdown
except ImportError:
    sys.stderr.write('[conv_tool] 缺少依赖 markdown,请先执行: pip install "markdown"\n'); sys.exit(1)

def read_csv(p):
    with open(p, encoding='utf-8-sig', newline='') as f:
        rows = list(csv.reader(f))
    return [dict(zip(rows[0], r)) for r in rows[1:]]

def write_csv(p, objs):
    if not objs: open(p,'w',encoding='utf-8-sig',newline='').close(); return
    header = list(objs[0].keys())
    with open(p, 'w', encoding='utf-8-sig', newline='') as f:
        w = csv.writer(f); w.writerow(header)
        for o in objs: w.writerow([o.get(k,'') for k in header])

def convert(src, dst):
    a, b = src.lower().rsplit('.',1)[-1], dst.lower().rsplit('.',1)[-1]
    if a == b:
        open(dst,'w',encoding='utf-8').write(open(src,encoding='utf-8').read())
    elif (a,b) == ('csv','json'):
        json.dump(read_csv(src), open(dst,'w',encoding='utf-8'), ensure_ascii=False, indent=2)
    elif (a,b) == ('json','csv'):
        objs = json.load(open(src,encoding='utf-8'))
        if isinstance(objs, dict) and isinstance(objs.get('data'), list): objs = objs['data']
        write_csv(dst, objs)
    elif (a,b) == ('json','yaml'):
        yaml.safe_dump(json.load(open(src,encoding='utf-8')), open(dst,'w',encoding='utf-8'), allow_unicode=True, sort_keys=False)
    elif (a,b) == ('yaml','json'):
        json.dump(yaml.safe_load(open(src,encoding='utf-8')), open(dst,'w',encoding='utf-8'), ensure_ascii=False, indent=2)
    elif (a,b) == ('md','html'):
        text = open(src,encoding='utf-8').read()
        open(dst,'w',encoding='utf-8').write('<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>'+markdown.markdown(text, extensions=['extra','tables'])+'</body></html>')
    elif (a,b) == ('txt','md'):
        open(dst,'w',encoding='utf-8').write(open(src,encoding='utf-8').read())
    else:
        sys.stderr.write('[conv_tool] 不支持 ' + a + ' -> ' + b + '(支持: csv<->json, json<->yaml, md->html, txt->md)\n'); sys.exit(1)

def main():
    p = argparse.ArgumentParser()
    p.add_argument('convert'); p.add_argument('src'); p.add_argument('-o','--output')
    a = p.parse_args()
    import pathlib
    src = pathlib.Path(a.src)
    if src.is_dir():
        outdir = pathlib.Path(a.output) if a.output else src
        outdir.mkdir(parents=True, exist_ok=True)
        n = 0
        for f in sorted(src.iterdir()):
            if f.is_file() and f.suffix.lower() in ('.csv','.json','.yaml','.md','.txt'):
                target = {'csv':'json','json':'csv','yaml':'json','md':'html','txt':'md'}.get(f.suffix.lower()[1:])
                if not target: continue
                convert(str(f), str(outdir / (f.stem + '.' + target))); n += 1
        print('已转换 ' + str(n) + ' 个文件到 ' + str(outdir))
    else:
        if not a.output:
            sys.stderr.write('[conv_tool] 单文件转换需 -o 输出路径\n'); sys.exit(1)
        convert(str(src), a.output); print('已转换 ' + str(src) + ' -> ' + a.output)

main()
