---
name: PPT演示文稿生成
description: "按大纲生成 .pptx 演示文稿:每页标题+要点,自动排版。
  适用于需要快速产出演示文稿草稿、汇报材料的场景(调用本地脚本,需 python-pptx)"
version: 1.0.0
triggers: [PPT, 演示文稿, 生成幻灯片, 汇报材料, pptx]
platform: all
requires: [python-pptx]
---

# PPT演示文稿生成

## 定义
把 Markdown 大纲生成真实 .pptx 文件,每页一个主题,解决"内容有了、但要做成 PPT"的问题。

## 适用场景
- 汇报、培训、方案讲解需要 PPT 草稿
- 已有文字大纲,快速变成幻灯片结构
- 需要统一版式的多页演示

## 核心能力
- Markdown 大纲 → pptx:一级标题为页标题,其下要点为正文
- 首页用大纲标题做封面
- 中文字体自适应

## 边界
- 生成的是排版好的草稿,不含动画、模板美化与配图
- 只按大纲内容生成,不自行扩充论述
- 需要精修版式时说明可在 PowerPoint 里继续编辑

## 执行流程
脚本位于本技能目录 `scripts/pptx_tool.py`,依赖 `python-pptx>=0.6.21`(缺失时脚本提示安装命令)。

- `python scripts/pptx_tool.py create 输出.pptx --outline 大纲.md`
- 大纲格式:`# 封面标题`、`## 页面标题`、其下 `- 要点` 为正文

退出码:0 成功;1 参数/依赖错误;2 处理错误。

## 输出格式
回报文件路径、页数、文件大小。

## 示例
输入:「把这个产品介绍大纲做成 PPT」
动作:整理为 outline.md,运行 `python scripts/pptx_tool.py create 产品介绍.pptx --outline outline.md`
回报:「已生成 产品介绍.pptx,共 8 页,210KB。」

## 注意事项
- 大纲文件用 UTF-8 写入
- 每页要点控制在 5 条以内,过多会自动缩小字号
- 依赖缺失时按脚本提示执行 `pip install "python-pptx>=0.6.21"`,不要静默失败
