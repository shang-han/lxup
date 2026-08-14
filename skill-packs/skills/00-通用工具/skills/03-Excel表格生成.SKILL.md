---
name: Excel表格生成
description: "生成 .xlsx 表格文件:从 CSV/JSON 转成带样式的 Excel、多工作表、读取与转出。
  适用于需要交付 Excel 数据表格、汇总数据的场景(调用本地脚本,需 openpyxl)"
version: 1.0.0
triggers: [Excel, 生成表格, 导出xlsx, 多工作表, 表格样式]
platform: all
requires: [openpyxl]
---

# Excel表格生成

## 定义
把结构化数据(CSV/JSON)生成真实 .xlsx 文件,或从 xlsx 读取数据/转出 CSV,解决 Excel 文件的产出与读取问题。

## 适用场景
- 数据整理完需要一份 Excel 交付
- 多个数据源要放进一个工作簿的不同工作表
- 从 xlsx 提取数据做后续处理

## 核心能力
- CSV/JSON → xlsx(表头加粗、冻结首行)
- 多工作表:多个数据源对应多个 sheet
- xlsx → CSV / 读取为 Markdown 表格

## 边界
- 不做复杂公式计算引擎与图表(图表见「数据图表」技能)
- 数据按原样写入,不改动数值与顺序
- 大文件(超过 10 万行)先提示用户可能较慢

## 执行流程
脚本位于本技能目录 `scripts/xlsx_tool.py`,依赖 `openpyxl>=3.0`(缺失时脚本提示安装命令)。

- 生成(单/多 sheet):`python scripts/xlsx_tool.py create 输出.xlsx --csv a.csv --csv b.csv --json c.json`
- 读取为 Markdown:`python scripts/xlsx_tool.py read 输入.xlsx --sheet 表名`
- 转 CSV:`python scripts/xlsx_tool.py tocsv 输入.xlsx -o 输出.csv --sheet 表名`

sheet 名默认取源文件名(去扩展名)。退出码:0 成功;1 参数/依赖错误;2 处理错误。

## 输出格式
回报文件路径、工作表清单(每表行数)、文件大小。

## 示例
输入:「把这两个月的销售 CSV 汇总成一个 Excel,两个 sheet」
动作:`python scripts/xlsx_tool.py create 销售汇总.xlsx --csv 1月.csv --csv 2月.csv`
回报:「已生成 销售汇总.xlsx,2 个工作表(1月 320 行、2月 356 行),45KB。」

## 注意事项
- 源 CSV 编码必须是 UTF-8;乱码先走「文件编码转换」技能
- 依赖缺失时按脚本提示执行 `pip install "openpyxl>=3.0"`,不要静默失败
