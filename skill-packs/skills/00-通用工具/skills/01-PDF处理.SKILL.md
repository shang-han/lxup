---
name: PDF处理
description: "对 PDF 文件做真实操作:合并、拆分、抽取页面、提取全文、旋转、查看信息。
  适用于需要改动 PDF 文件本身(而不是谈论 PDF)的场景(调用本地脚本,需 pypdf)"
version: 2.0.0
triggers: [PDF, 合并PDF, 拆分PDF, PDF提取文字, PDF抽取页面, PDF旋转, PDF页数]
platform: all
requires: [pypdf]
---

# PDF处理

## 定义
本技能用于对 PDF 文件本身执行真实操作,解决"纯对话做不到、必须产文件"的 PDF 任务。

## 适用场景
- 多份 PDF 要合并成一份
- 按页码范围拆分 PDF、抽取某几页
- 把 PDF 里的文字提取成文本
- 旋转页面、查看页数和元数据

## 核心能力
- 合并:多份 PDF 按顺序拼成一份
- 拆分:抽取指定页码范围,或逐页拆成多个文件
- 提取全文:按页输出,带「第 N 页」分隔
- 旋转:指定页或全部页(顺时针 90/180/270°)
- 查看:页数、元数据(标题/作者/创建程序)、是否加密

## 边界
- 只处理 PDF 文件,不做 PDF 内容创作与评论
- 加密 PDF 大多无法操作,需用户提供密码
- 扫描版(图片型)PDF 无法提取文字,须说明需 OCR,不假装成功

## 执行流程
脚本位于本技能目录 `scripts/pdf_tool.py`,依赖 `pypdf>=3.0`(缺失时脚本提示安装命令)。页码从 1 起;范围用 `a-b`,多组用逗号。

- 查看信息:`python scripts/pdf_tool.py info 输入.pdf`
- 合并:`python scripts/pdf_tool.py merge a.pdf b.pdf -o 合并.pdf`
- 抽取指定页:`python scripts/pdf_tool.py split 输入.pdf --pages 1-3,5 -o 部分.pdf`
- 逐页拆分:`python scripts/pdf_tool.py split 输入.pdf --each --outdir ./拆分/`
- 提取全文:`python scripts/pdf_tool.py extract 输入.pdf -o 文字.txt`(不写 -o 则打印到屏幕)
- 旋转:`python scripts/pdf_tool.py rotate 输入.pdf --angle 90 --pages 1,2 -o 输出.pdf`

退出码:0 成功;1 参数/依赖错误;2 处理错误。

## 输出格式
- 产出文件的操作:回报路径、页数、文件大小
- 提取全文:每页以 `--- 第 N 页 ---` 分隔
- 查看信息:逐项列出页数、加密状态、标题/作者/创建程序

## 示例
输入:「把这两份合同合并成一个 PDF」
动作:运行 `python scripts/pdf_tool.py merge 合同1.pdf 合同2.pdf -o 合同-合并.pdf`
回报:「已合并为 合同-合并.pdf,共 12 页,1.3MB。」

## 注意事项
- 必须真实调用脚本产出文件,不能只描述步骤
- 先确认源文件存在、路径正确;输出路径不得与源文件相同(脚本自动拦截覆盖)
- 依赖缺失时按脚本提示执行 `pip install "pypdf>=3.0"`,不要静默失败
