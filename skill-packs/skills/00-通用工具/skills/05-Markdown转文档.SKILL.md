---
name: Markdown转文档
description: "把 Markdown 文件转成 Word 或 HTML 文件。
  适用于内容已用 Markdown 写好、需要交付 Word/网页版文件的场景(调用本地脚本,需 python-docx、markdown)"
version: 1.0.0
triggers: [Markdown转Word, md转docx, Markdown转HTML, md转html]
platform: all
requires: [python-docx, markdown]
---

# Markdown转文档

## 定义
把 Markdown 文本转换为 .docx 或 .html 文件,保留标题层级、列表、表格与代码块结构。

## 适用场景
- 笔记/文档是 Markdown,要发给用 Word 的人
- 需要把 Markdown 发布成单文件网页
- 批量转换多个 md 文件

## 核心能力
- md → docx:标题/段落/列表/代码块
- md → html:完整页面(内联样式,可离线打开)
- 支持批量转换目录

## 边界
- 复杂 md 语法(脚注、数学公式、Mermaid)按原文保留或降级,不报错
- 不做样式定制;需要定制版式请转 Word 后手工调整

## 执行流程
脚本位于本技能目录 `scripts/md_tool.py`,依赖 `markdown`、`python-docx`(缺失时脚本提示安装命令)。

- 单文件:`python scripts/md_tool.py convert 文档.md -o 文档.docx`(按输出扩展名决定 docx/html)
- 批量:`python scripts/md_tool.py convert ./目录 -o ./输出目录 --format docx`

退出码:0 成功;1 参数/依赖错误;2 处理错误。

## 输出格式
回报输出文件清单与数量。

## 示例
输入:「把这几个 md 笔记都转成 Word」
动作:`python scripts/md_tool.py convert ./笔记 -o ./导出 --format docx`
回报:「已转换 5 个文件到 ./导出,共 1.2MB。」

## 注意事项
- 源文件用 UTF-8 编码;乱码先走「文件编码转换」技能
- 依赖缺失时按脚本提示安装,不要静默失败
