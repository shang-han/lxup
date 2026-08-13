#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据图表生成工具 —— 龙虾优盘「通用工具」能力型技能

把数据(JSON 规格)渲染成**真实的图表图片**(PNG)。纯对话模型只会描述数据,
画不出图;本脚本负责真正出图,并配置中文字体避免标签乱码。

用法:
  python chart_tool.py build --spec 规格.json -o 图表.png
  python chart_tool.py build --spec -        -o 图表.png   # 从标准输入读规格

规格(JSON):
  {
    "type": "bar | line | pie",        # 柱状 / 折线 / 饼图
    "title": "图表标题",
    "xlabel": "X 轴", "ylabel": "Y 轴",
    "labels": ["一季度","二季度","三季度"],
    "values": [120, 150, 180],          # 单系列
    "series": [                         # 可选,多系列(bar/line)
      {"name":"2024","values":[120,150,180]},
      {"name":"2025","values":[140,160,200]}
    ],
    "unit": "万元"                       # 可选,数值标签后缀
  }

依赖: matplotlib>=3.5。退出码: 0 成功; 1 参数/依赖/规格错误; 2 处理错误。
"""
import argparse
import json
import os
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
    sys.stdin.reconfigure(encoding="utf-8")
except Exception:
    pass

# 常见中文字体候选;matplotlib 会选用系统里真实存在的那个
_CJK_FONTS = ["Microsoft YaHei", "SimHei", "PingFang SC", "Noto Sans CJK SC", "WenQuanYi Zen Hei"]


def _require_mpl():
    try:
        import matplotlib  # noqa: F401
        return matplotlib
    except ImportError:
        sys.stderr.write('[chart_tool] 缺少依赖 matplotlib,请先执行: pip install "matplotlib>=3.5"\n')
        sys.exit(1)


def _setup_cjk():
    """配置中文字体与负号显示;返回实际命中的字体名(便于排查)。"""
    import matplotlib
    from matplotlib import font_manager
    available = {f.name for f in font_manager.fontManager.ttflist}
    chosen = next((f for f in _CJK_FONTS if f in available), None)
    if chosen:
        matplotlib.rcParams["font.sans-serif"] = [chosen] + matplotlib.rcParams.get("font.sans-serif", [])
    matplotlib.rcParams["axes.unicode_minus"] = False
    return chosen


def _to_numbers(values):
    try:
        return [float(v) for v in values]
    except (TypeError, ValueError):
        sys.stderr.write("[chart_tool] values 必须都是数字\n")
        sys.exit(1)


def build(spec: dict, output: str):
    _require_mpl()
    import matplotlib
    matplotlib.use("Agg")  # 无界面后端,服务器/便携环境可用
    import matplotlib.pyplot as plt

    if not isinstance(spec, dict):
        sys.stderr.write("[chart_tool] 规格必须是 JSON 对象\n")
        sys.exit(1)

    chart_type = spec.get("type", "bar")
    labels = spec.get("labels") or []
    unit = spec.get("unit", "")
    font_hit = _setup_cjk()

    fig, ax = plt.subplots(figsize=(8, 5), dpi=120)

    if chart_type == "pie":
        values = _to_numbers(spec.get("values") or [])
        if len(values) != len(labels):
            sys.stderr.write("[chart_tool] 饼图要求 labels 与 values 数量一致\n")
            sys.exit(1)
        ax.pie(values, labels=labels, autopct="%1.1f%%", startangle=90)
        ax.axis("equal")

    else:
        series = spec.get("series")
        if series:
            groups = [(s.get("name", f"系列{i+1}"), _to_numbers(s.get("values") or []))
                      for i, s in enumerate(series)]
        else:
            groups = [(spec.get("ylabel") or "数值", _to_numbers(spec.get("values") or []))]

        import numpy as np
        x = np.arange(len(labels))
        n = len(groups)
        width = 0.8 / n if chart_type == "bar" else 0
        for i, (name, values) in enumerate(groups):
            if len(values) != len(labels):
                sys.stderr.write(f"[chart_tool] 系列「{name}」的 values 数量与 labels 不一致\n")
                sys.exit(1)
            if chart_type == "bar":
                offset = (i - (n - 1) / 2) * width
                ax.bar(x + offset, values, width, label=name)
            elif chart_type == "line":
                ax.plot(x, values, marker="o", label=name)
            else:
                sys.stderr.write(f"[chart_tool] 未知图表类型: {chart_type}(支持 bar/line/pie)\n")
                sys.exit(1)
        ax.set_xticks(x)
        ax.set_xticklabels(labels)
        if n > 1 or series:
            ax.legend()
        if spec.get("xlabel"):
            ax.set_xlabel(spec["xlabel"])
        if spec.get("ylabel"):
            ax.set_ylabel(spec["ylabel"] + (f"({unit})" if unit else ""))
        ax.grid(axis="y", linestyle="--", alpha=0.4)

    if spec.get("title"):
        ax.set_title(spec["title"])

    fig.tight_layout()
    try:
        fig.savefig(output)
    except Exception as e:  # noqa: BLE001
        sys.stderr.write(f"[chart_tool] 保存失败: {e}\n")
        sys.exit(2)
    finally:
        plt.close(fig)

    note = f",字体:{font_hit}" if font_hit else ",警告:未找到中文字体,中文可能显示为方框"
    print(f"已生成图表 -> {output}({chart_type}{note})")


def cmd_build(args):
    if args.spec == "-":
        raw = sys.stdin.read()
    else:
        if not os.path.isfile(args.spec):
            sys.stderr.write(f"[chart_tool] 规格文件不存在: {args.spec}\n")
            sys.exit(1)
        with open(args.spec, "r", encoding="utf-8") as f:
            raw = f.read()
    try:
        spec = json.loads(raw)
    except json.JSONDecodeError as e:
        sys.stderr.write(f"[chart_tool] 规格 JSON 解析失败: {e}\n")
        sys.exit(1)
    build(spec, args.output)


def main():
    parser = argparse.ArgumentParser(prog="chart_tool.py", description="数据图表生成工具(龙虾优盘通用技能)")
    sub = parser.add_subparsers(dest="command", required=True)
    p = sub.add_parser("build", help="按 JSON 规格生成图表图片")
    p.add_argument("--spec", required=True, help="规格 JSON 文件,或 - 表示标准输入")
    p.add_argument("-o", "--output", required=True, help="输出图片路径(.png)")
    p.set_defaults(func=cmd_build)
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
