#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
图片处理工具 —— 龙虾优盘「通用工具」能力型技能

对图片文件做真实操作(调用 Pillow):格式转换、缩放、裁剪、旋转、压缩、查看信息。
纯对话模型只能"描述"图片,本脚本真正产出处理后的图片文件。

用法:
  python image_tool.py info    输入.png
  python image_tool.py convert 输入.png -o 输出.jpg --quality 85 --max-side 1280
  python image_tool.py resize  输入.png --scale 0.5 -o 输出.png   (或 --width 800 / --height 600)
  python image_tool.py crop    输入.png --box 10,10,200,150 -o 输出.png   (或 --center 400,300)
  python image_tool.py rotate  输入.png --angle 90 -o 输出.png

依赖: Pillow>=10.0。退出码: 0 成功; 1 参数/依赖错误; 2 处理错误。
"""
import argparse
import os
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
    sys.stdin.reconfigure(encoding="utf-8")
except Exception:
    pass


def _require_pil():
    try:
        from PIL import Image  # noqa: F401
        return Image
    except ImportError:
        sys.stderr.write('[image_tool] 缺少依赖 Pillow,请先执行: pip install "Pillow>=10.0"\n')
        sys.exit(1)


def _check_input(path: str):
    if not os.path.isfile(path):
        sys.stderr.write(f"[image_tool] 图片不存在: {path}\n")
        sys.exit(2)


def _open(path: str):
    Image = _require_pil()
    _check_input(path)
    try:
        img = Image.open(path)
        img.load()
        return img
    except Exception as e:  # noqa: BLE001
        sys.stderr.write(f"[image_tool] 打开失败(可能不是图片或已损坏): {e}\n")
        sys.exit(2)


def _flatten_alpha(img, fmt: str):
    """目标格式不支持透明(JPEG/BMP)时,把透明通道铺白底转 RGB。"""
    if fmt.upper() in ("JPEG", "JPG", "BMP") and img.mode in ("RGBA", "LA", "P"):
        from PIL import Image
        bg = Image.new("RGB", img.size, (255, 255, 255))
        rgba = img.convert("RGBA")
        bg.paste(rgba, mask=rgba.split()[-1])
        return bg
    return img


def _out_format(output: str) -> str:
    ext = os.path.splitext(output)[1].lower().lstrip(".")
    return {"jpg": "JPEG"}.get(ext, ext.upper())


def _save(img, output: str, quality: int | None):
    fmt = _out_format(output)
    img = _flatten_alpha(img, fmt)
    kwargs = {}
    if quality and fmt in ("JPEG", "WEBP"):
        kwargs["quality"] = quality
    try:
        img.save(output, format=fmt if fmt else None, **kwargs)
    except Exception as e:  # noqa: BLE001
        sys.stderr.write(f"[image_tool] 保存失败: {e}\n")
        sys.exit(2)
    print(f"已输出 -> {output}({img.size[0]}x{img.size[1]}, {os.path.getsize(output)} 字节)")


def cmd_info(args):
    img = _open(args.input)
    print(f"文件: {args.input}")
    print(f"格式: {img.format}  模式: {img.mode}")
    print(f"尺寸: {img.size[0]} x {img.size[1]} 像素")
    print(f"大小: {os.path.getsize(args.input)} 字节")


def cmd_convert(args):
    img = _open(args.input)
    if args.max_side:
        img.thumbnail((args.max_side, args.max_side))
    _save(img, args.output, args.quality)


def cmd_resize(args):
    img = _open(args.input)
    w0, h0 = img.size
    if args.scale:
        nw, nh = int(w0 * args.scale), int(h0 * args.scale)
    elif args.width and args.height:
        nw, nh = args.width, args.height
    elif args.width:
        nw = args.width; nh = int(h0 * args.width / w0)
    elif args.height:
        nh = args.height; nw = int(w0 * args.height / h0)
    else:
        sys.stderr.write("[image_tool] 请指定 --scale 或 --width/--height\n")
        sys.exit(1)
    nw, nh = max(1, nw), max(1, nh)
    _save(img.resize((nw, nh)), args.output, args.quality)


def _parse_box(spec: str):
    try:
        nums = [int(x) for x in spec.split(",")]
    except ValueError:
        sys.stderr.write(f"[image_tool] --box 应为 left,top,right,bottom 四个整数: {spec}\n")
        sys.exit(1)
    if len(nums) != 4:
        sys.stderr.write("[image_tool] --box 需要 4 个值\n")
        sys.exit(1)
    return tuple(nums)


def cmd_crop(args):
    img = _open(args.input)
    w0, h0 = img.size
    if args.box:
        l, t, r, b = _parse_box(args.box)
    elif args.center:
        try:
            cw, ch = [int(x) for x in args.center.split(",")]
        except ValueError:
            sys.stderr.write("[image_tool] --center 应为 宽,高\n")
            sys.exit(1)
        l = max(0, (w0 - cw) // 2); t = max(0, (h0 - ch) // 2)
        r = min(w0, l + cw); b = min(h0, t + ch)
    else:
        sys.stderr.write("[image_tool] 请指定 --box 或 --center\n")
        sys.exit(1)
    if l >= r or t >= b:
        sys.stderr.write(f"[image_tool] 裁剪区域无效: ({l},{t},{r},{b}),图像 {w0}x{h0}\n")
        sys.exit(1)
    _save(img.crop((l, t, r, b)), args.output, args.quality)


def cmd_rotate(args):
    img = _open(args.input)
    # 90/180/270 用无损 transpose;任意角度用 rotate(expand 扩边)
    from PIL import Image
    if args.angle in (90, -270):
        out = img.transpose(Image.Transpose.ROTATE_90)
    elif args.angle in (180, -180):
        out = img.transpose(Image.Transpose.ROTATE_180)
    elif args.angle in (270, -90):
        out = img.transpose(Image.Transpose.ROTATE_270)
    else:
        out = img.rotate(args.angle, expand=True)
    _save(out, args.output, args.quality)


def main():
    parser = argparse.ArgumentParser(prog="image_tool.py", description="图片处理工具(龙虾优盘通用技能)")
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("info", help="查看图片信息")
    p.add_argument("input"); p.set_defaults(func=cmd_info)

    p = sub.add_parser("convert", help="格式转换/压缩")
    p.add_argument("input"); p.add_argument("-o", "--output", required=True)
    p.add_argument("--quality", type=int, help="JPEG/WebP 质量 1-95")
    p.add_argument("--max-side", type=int, help="长边上限(等比缩小)")
    p.set_defaults(func=cmd_convert)

    p = sub.add_parser("resize", help="缩放")
    p.add_argument("input"); p.add_argument("-o", "--output", required=True)
    p.add_argument("--scale", type=float, help="缩放比例,如 0.5")
    p.add_argument("--width", type=int); p.add_argument("--height", type=int)
    p.add_argument("--quality", type=int)
    p.set_defaults(func=cmd_resize)

    p = sub.add_parser("crop", help="裁剪")
    p.add_argument("input"); p.add_argument("-o", "--output", required=True)
    p.add_argument("--box", help="left,top,right,bottom")
    p.add_argument("--center", help="居中裁剪 宽,高")
    p.add_argument("--quality", type=int)
    p.set_defaults(func=cmd_crop)

    p = sub.add_parser("rotate", help="旋转")
    p.add_argument("input"); p.add_argument("-o", "--output", required=True)
    p.add_argument("--angle", type=int, default=90, help="角度(90/180/270 无损,任意角度扩边)")
    p.add_argument("--quality", type=int)
    p.set_defaults(func=cmd_rotate)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
