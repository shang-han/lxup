---
name: 图片PDF转换
description: "图片转 PDF、PDF 转图片。
  适用于证件扫描件合并成 PDF、把 PDF 每页导出为图片的场景(调用本地脚本,需 pillow、pypdf)"
version: 1.0.0
triggers: [图片转PDF, PDF转图片, 扫描件合并, 导出PDF为图片]
platform: all
requires: [pillow, pypdf]
---

# 图片PDF转换

## 定义
在图片与 PDF 之间做批量转换:多张图片按顺序合成一份 PDF,或把 PDF 每页渲染为图片。

## 适用场景
- 多张证件/单据照片要合成一个 PDF 发出去
- 把 PDF 的某一页或全部导出为图片用于分享
- 扫描件图片归档成 PDF

## 核心能力
- img2pdf:jpg/png 按输入顺序合成 PDF(自动转 RGB)
- pdf2img:每页渲染为 PNG,可指定 DPI
- 支持指定页码范围

## 边界
- 不做 OCR 与内容识别(提取文字见「PDF处理」技能)
- 图片顺序即输入顺序,需要排序的先重命名
- 超大 PDF(>500 页)先提示可能耗时

## 执行流程
脚本位于本技能目录 `scripts/imgpdf_tool.py`,依赖 `pillow`、`pypdf`(缺失时脚本提示安装命令)。

- 图片转 PDF:`python scripts/imgpdf_tool.py img2pdf 1.jpg 2.jpg 3.jpg -o 合并.pdf`
- PDF 转图片:`python scripts/imgpdf_tool.py pdf2img 文档.pdf --outdir ./图片 --dpi 150`
- 指定页:`python scripts/imgpdf_tool.py pdf2img 文档.pdf --pages 1-3 --outdir ./图片`

退出码:0 成功;1 参数/依赖错误;2 处理错误。

## 输出格式
回报输出路径、页数/图片数、文件大小。

## 示例
输入:「把这三张身份证照片合成一个 PDF」
动作:`python scripts/imgpdf_tool.py img2pdf 1.jpg 2.jpg 3.jpg -o 证件.pdf`
回报:「已生成 证件.pdf,3 页,860KB。」

## 注意事项
- 输出路径不与输入文件重名
- 依赖缺失时按脚本提示安装,不要静默失败
