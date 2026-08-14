---
name: Word文档生成
description: "按结构化规格生成 .docx 文档:标题、段落、列表、表格、分页。
  适用于需要产出正式 Word 文件(报告、方案、说明书、制度文档)的场景(调用本地脚本,需 python-docx)"
version: 2.0.0
triggers: [Word, 生成文档, 导出Word, 写报告, 文档排版, docx]
platform: all
requires: [python-docx]
---

# Word文档生成

## 定义
把内容以结构化规格生成真实可编辑的 .docx 文件,解决"聊天里写好了、但用户要一份 Word 文件"的问题。

## 适用场景
- 报告、方案、说明书、制度文档等需要 Word 交付
- 内容已定,需要排版成正式的文档结构
- 需要表格、列表、多级标题、分页

## 核心能力
- 标题/副标题/页脚
- 多级标题、正文段落、项目符号与编号列表
- 表格(带表头)、分页符
- 中文字体自适应(微软雅黑/宋体等),中文不出现西文字体

## 边界
- 只生成文档文件,不修改已有 Word 文件
- 规格里的内容原样排版,不自行添加用户没提供的内容
- 需要改动已有 Word 内容时说明本技能不支持,建议导出后重新生成

## 执行流程
脚本位于本技能目录 `scripts/docx_tool.py`,依赖 `python-docx>=1.0`(缺失时脚本提示安装命令)。

- `python scripts/docx_tool.py build --spec 规格.json -o 文档.docx`
- 从标准输入读规格:`python scripts/docx_tool.py build --spec - -o 文档.docx`

规格(JSON):
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

退出码:0 成功;1 参数/依赖/规格错误;2 处理错误。

## 输出格式
回报生成文件路径、段落块数量、文件大小;内容不在聊天里重复全文,只给结构概览。

## 示例
输入:「把这份培训方案生成 Word,分三节,带签到表」
动作:按内容构造 blocks 规格写入 spec.json,运行 build
回报:「已生成 培训方案.docx,共 3 节 1 张表格,48KB。」

## 注意事项
- 规格文件用 UTF-8 写入,含中文必须确保编码正确
- 表格行数多时注意每行列数一致
- 依赖缺失时按脚本提示执行 `pip install "python-docx>=1.0"`,不要静默失败
