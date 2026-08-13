---
name: Word文档生成
description: "把结构化内容渲染成真实的 Word(.docx)文件:标题层级、项目符号、编号列表、表格、分页,中文排版(调用本地脚本,需 python-docx)"
version: 1.0.0
triggers: [Word, 生成文档, 导出Word, docx, 写报告, 生成方案, 文档排版]
platform: all
requires: [python-docx]
---

# Word文档生成

## 适用场景
用户要一份**可以保存、打印、发送的 Word 文件**,而不是聊天里的一段文字:工作报告、方案、通知、复盘、制度文档等。你把内容组织成结构化规格,脚本负责渲染成带格式的真实 .docx(中文用中文字体,不会乱排)。

## 核心能力
- 文档标题 + 可选副标题(居中)
- 一/二/三级标题层级
- 正文段落
- 项目符号列表、编号列表
- 表格(带表头加粗)
- 分页符、页脚说明
- 中文默认字体配置

## 脚本调用
脚本位于本技能目录 `scripts/docx_tool.py`,依赖 `python-docx>=1.0`。你负责产出 JSON 规格,脚本负责出文件:

- 从文件:`python scripts/docx_tool.py build --spec 规格.json -o 文档.docx`
- 从标准输入:`echo '<规格JSON>' | python scripts/docx_tool.py build --spec - -o 文档.docx`

规格 JSON 结构:
```json
{
  "title": "文档标题", "subtitle": "可选副标题",
  "blocks": [
    {"type":"h1","text":"一级标题"},
    {"type":"h2","text":"二级标题"},
    {"type":"p","text":"正文段落"},
    {"type":"bullets","items":["要点一","要点二"]},
    {"type":"numbered","items":["第一步","第二步"]},
    {"type":"table","header":["列A","列B"],"rows":[["1","2"]]},
    {"type":"pagebreak"}
  ],
  "footer": "可选页脚"
}
```
block 的 type 支持:h1/h2/h3、p、bullets、numbered、table、pagebreak。
退出码:0 成功;1 参数/依赖/规格错误;2 处理错误。

## 输出格式
生成 .docx 后,回报文件路径与规模;必要时摘要文档结构(几个标题/表格)。

## 示例
输入:「帮我写一份 Q2 经营复盘,要有业绩概览、分渠道表格、改进措施,导出 Word」
动作:组织成规格 JSON(标题 + h1 业绩概览 + bullets + h1 分渠道 + table + numbered 改进措施),运行脚本生成 `Q2经营复盘.docx`
回报:「已生成 Q2经营复盘.docx,含 2 个一级标题、1 张表格。」

## 注意事项
- 必须真实调用脚本生成文件,不能只在对话里贴文字充当"文档"
- 内容组织是你的职责:先想清结构再填 blocks,避免一堆无层级段落
- 表格的 rows 每行列数应与 header 一致
- 依赖缺失时按脚本提示执行 `pip install "python-docx>=1.0"`
- 生成后确认输出路径可写;路径含中文/空格时注意加引号
