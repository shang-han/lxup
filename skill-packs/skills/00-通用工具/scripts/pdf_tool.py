#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PDF 处理工具 —— 龙虾优盘「通用工具」能力型技能

提供纯对话模型无法完成的文件级操作(必须真实运行本脚本、产出真实文件):
  info     查看页数 / 元数据 / 是否加密
  merge    合并多个 PDF
  split    拆分(抽取指定页 / 逐页拆成多个文件)
  extract  提取全文(按页,带页码分隔)
  rotate   旋转指定页或全部页

依赖: pypdf>=3.0(缺失时给出安装提示并以退出码 1 退出)
退出码: 0 成功; 1 参数/依赖错误; 2 处理错误。
"""
import argparse
import os
import sys

# Windows 控制台/管道下保证中文与特殊字符可正常输出
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass


def _require_pypdf():
    try:
        import pypdf  # noqa: F401
        return pypdf
    except ImportError:
        sys.stderr.write(
            "[pdf_tool] 缺少依赖 pypdf,请先执行: pip install \"pypdf>=3.0\"\n"
        )
        sys.exit(1)


def _check_input(path: str) -> None:
    if not os.path.isfile(path):
        sys.stderr.write(f"[pdf_tool] 源文件不存在: {path}\n")
        sys.exit(2)


def _guard_overwrite(src: str, dst: str) -> None:
    """输出路径与任一源文件相同则中止,避免覆盖原件。"""
    try:
        if dst and os.path.abspath(dst) == os.path.abspath(src):
            sys.stderr.write(f"[pdf_tool] 输出路径与源文件相同,会覆盖原件,已中止: {dst}\n")
            sys.exit(2)
    except Exception:
        pass


def _parse_pages(spec: str, total: int):
    """把 '1,3,5-8' 解析为 0 基页索引列表(用户页码从 1 起)。"""
    pages = []
    for part in spec.split(","):
        part = part.strip()
        if not part:
            continue
        if "-" in part:
            a, b = part.split("-", 1)
            start, end = int(a), int(b)
            if start > end:
                start, end = end, start
        else:
            start = end = int(part)
        if start < 1 or end > total:
            sys.stderr.write(f"[pdf_tool] 页码 {part} 超出范围(共 {total} 页)\n")
            sys.exit(1)
        pages.extend(range(start - 1, end))
    if not pages:
        sys.stderr.write("[pdf_tool] 未解析到有效页码\n")
        sys.exit(1)
    # 去重且保序
    seen, uniq = set(), []
    for p in pages:
        if p not in seen:
            seen.add(p)
            uniq.append(p)
    return uniq


def _human_size(n: int) -> str:
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024 or unit == "GB":
            return f"{n:.0f}{unit}" if unit == "B" else f"{n:.1f}{unit}"
        n /= 1024
    return f"{n:.0f}B"


def cmd_info(args):
    pypdf = _require_pypdf()
    _check_input(args.input)
    try:
        reader = pypdf.PdfReader(args.input)
    except Exception as e:  # noqa: BLE001
        sys.stderr.write(f"[pdf_tool] 打开失败(可能已损坏): {e}\n")
        sys.exit(2)
    meta = reader.metadata or {}
    print(f"文件: {args.input}")
    print(f"页数: {len(reader.pages)}")
    print(f"加密: {'是' if reader.is_encrypted else '否'}")
    for key, label in (("/Title", "标题"), ("/Author", "作者"),
                       ("/Creator", "创建程序"), ("/Producer", "生成器")):
        val = meta.get(key)
        if val:
            print(f"{label}: {val}")


def cmd_merge(args):
    pypdf = _require_pypdf()
    if len(args.inputs) < 2:
        sys.stderr.write("[pdf_tool] 合并至少需要 2 个输入文件\n")
        sys.exit(1)
    for p in args.inputs:
        _check_input(p)
        _guard_overwrite(p, args.output)
    writer = pypdf.PdfWriter()
    total = 0
    try:
        for p in args.inputs:
            reader = pypdf.PdfReader(p)
            for page in reader.pages:
                writer.add_page(page)
                total += 1
        with open(args.output, "wb") as f:
            writer.write(f)
    except Exception as e:  # noqa: BLE001
        sys.stderr.write(f"[pdf_tool] 合并失败: {e}\n")
        sys.exit(2)
    size = _human_size(os.path.getsize(args.output))
    print(f"已合并 {len(args.inputs)} 个文件 -> {args.output}(共 {total} 页, {size})")


def cmd_split(args):
    pypdf = _require_pypdf()
    _check_input(args.input)
    try:
        reader = pypdf.PdfReader(args.input)
    except Exception as e:  # noqa: BLE001
        sys.stderr.write(f"[pdf_tool] 打开失败: {e}\n")
        sys.exit(2)
    total = len(reader.pages)

    if args.each:
        outdir = args.outdir or "."
        os.makedirs(outdir, exist_ok=True)
        base = os.path.splitext(os.path.basename(args.input))[0]
        for i, page in enumerate(reader.pages, 1):
            w = pypdf.PdfWriter()
            w.add_page(page)
            out = os.path.join(outdir, f"{base}_第{i:03d}页.pdf")
            with open(out, "wb") as f:
                w.write(f)
        print(f"已逐页拆分为 {total} 个文件 -> 目录: {outdir}")
        return

    if not args.pages:
        sys.stderr.write("[pdf_tool] 请指定 --pages(如 1-3,5)或 --each\n")
        sys.exit(1)
    _guard_overwrite(args.input, args.output)
    idxs = _parse_pages(args.pages, total)
    w = pypdf.PdfWriter()
    for i in idxs:
        w.add_page(reader.pages[i])
    with open(args.output, "wb") as f:
        w.write(f)
    size = _human_size(os.path.getsize(args.output))
    print(f"已抽取 {len(idxs)} 页 -> {args.output}({size})")


def cmd_extract(args):
    pypdf = _require_pypdf()
    _check_input(args.input)
    try:
        reader = pypdf.PdfReader(args.input)
    except Exception as e:  # noqa: BLE001
        sys.stderr.write(f"[pdf_tool] 打开失败: {e}\n")
        sys.exit(2)
    chunks = []
    empty_pages = 0
    for i, page in enumerate(reader.pages, 1):
        text = (page.extract_text() or "").strip()
        if not text:
            empty_pages += 1
        chunks.append(f"--- 第 {i} 页 ---\n{text}")
    result = "\n\n".join(chunks)
    if args.output:
        _guard_overwrite(args.input, args.output)
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(result)
        print(f"已提取全文 -> {args.output}(共 {len(reader.pages)} 页"
              + (f",其中 {empty_pages} 页无可提取文字,可能为扫描版需 OCR" if empty_pages else "") + ")")
    else:
        print(result)


def cmd_rotate(args):
    pypdf = _require_pypdf()
    _check_input(args.input)
    if args.angle not in (90, 180, 270):
        sys.stderr.write("[pdf_tool] --angle 仅支持 90 / 180 / 270\n")
        sys.exit(1)
    _guard_overwrite(args.input, args.output)
    try:
        reader = pypdf.PdfReader(args.input)
    except Exception as e:  # noqa: BLE001
        sys.stderr.write(f"[pdf_tool] 打开失败: {e}\n")
        sys.exit(2)
    total = len(reader.pages)
    idxs = set(_parse_pages(args.pages, total)) if args.pages else set(range(total))
    w = pypdf.PdfWriter()
    for i, page in enumerate(reader.pages):
        if i in idxs:
            page.rotate(args.angle)
        w.add_page(page)
    with open(args.output, "wb") as f:
        w.write(f)
    scope = f"{len(idxs)} 页" if args.pages else "全部页"
    print(f"已旋转 {scope}(顺时针 {args.angle}°)-> {args.output}")


def main():
    parser = argparse.ArgumentParser(
        prog="pdf_tool.py", description="PDF 文件处理工具(龙虾优盘通用技能)")
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("info", help="查看页数/元数据/加密状态")
    p.add_argument("input")
    p.set_defaults(func=cmd_info)

    p = sub.add_parser("merge", help="合并多个 PDF")
    p.add_argument("inputs", nargs="+", help="两个或以上 PDF")
    p.add_argument("-o", "--output", required=True, help="输出文件")
    p.set_defaults(func=cmd_merge)

    p = sub.add_parser("split", help="拆分 PDF")
    p.add_argument("input")
    p.add_argument("--pages", help="抽取页码,如 1-3,5(从 1 起)")
    p.add_argument("-o", "--output", help="抽取模式的输出文件")
    p.add_argument("--each", action="store_true", help="逐页拆成多个文件")
    p.add_argument("--outdir", help="逐页拆分输出目录(默认当前目录)")
    p.set_defaults(func=cmd_split)

    p = sub.add_parser("extract", help="提取全文")
    p.add_argument("input")
    p.add_argument("-o", "--output", help="输出到文件(缺省打印到屏幕)")
    p.set_defaults(func=cmd_extract)

    p = sub.add_parser("rotate", help="旋转页面")
    p.add_argument("input")
    p.add_argument("--angle", type=int, default=90, choices=[90, 180, 270])
    p.add_argument("--pages", help="指定页码(缺省全部页)")
    p.add_argument("-o", "--output", required=True)
    p.set_defaults(func=cmd_rotate)

    args = parser.parse_args()
    # split 抽取模式需补默认输出名
    if args.command == "split" and not getattr(args, "each", False) and not getattr(args, "output", None):
        args.output = os.path.splitext(args.input)[0] + "_拆分.pdf"
    args.func(args)


if __name__ == "__main__":
    main()
