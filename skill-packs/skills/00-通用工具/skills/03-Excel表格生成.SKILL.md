---
name: Excel表格生成
description: "生成 .xlsx 表格文件:CSV/JSON 转带样式的 Excel(表头加粗着色、边框、自动列宽、冻结首行)、多工作表、公式单元格、读取与转出。
  适用于交付数据表格、汇总多源数据、制作带公式台账的场景(调用本地脚本,需 openpyxl)"
version: 1.1.0
triggers: [Excel, 生成表格, 导出xlsx, 多工作表, 表格样式, 公式]
platform: all
requires: [openpyxl]
---

# Excel表格生成

## 定义
把结构化数据(CSV/JSON)生成真实 .xlsx 文件,或从 xlsx 读取/转出,产出可直接交付的表格。

## 适用场景
- 数据整理完需要一份 Excel 交付
- 多个数据源放进一个工作簿的不同工作表
- 需要带公式的台账(合计/占比列)
- 从 xlsx 提取数据做后续处理

## 核心能力
- CSV/JSON → xlsx:表头加粗+底色、全表边框、按内容自动列宽、冻结首行
- 多工作表:多个数据源对应多个 sheet,表名取源文件名
- 公式:单元格内容以 = 开头时写为真实公式(如 =SUM(B2:B10))
- xlsx → CSV / 读取为 Markdown 表格

## 边界
- 图表、透视表等复杂功能不在范围(图表见「数据图表」技能)
- 数据按原样写入,不改数值与顺序;公式由用户提供,脚本不代编
- 超过 10 万行先提示可能较慢

## 执行流程
脚本位于本技能目录 `scripts/xlsx_tool.py`,依赖 `openpyxl>=3.0`(缺失时脚本提示安装命令)。

- 生成(单/多 sheet):`python scripts/xlsx_tool.py create 输出.xlsx --csv a.csv --csv b.csv --json c.json`
- 读取为 Markdown:`python scripts/xlsx_tool.py read 输入.xlsx --sheet 表名`
- 转 CSV:`python scripts/xlsx_tool.py tocsv 输入.xlsx -o 输出.csv --sheet 表名`

退出码:0 成功;1 参数/依赖错误;2 处理错误。

## 输出格式
回报文件路径、工作表清单(每表行数)、文件大小。

## 示例
输入:「把这两个月销售 CSV 汇总成一个 Excel,加一列合计公式」
动作:先 csv_tool 补列,或生成后说明公式列可在 Excel 中补;直接 create 两个 sheet
回报:「已生成 销售汇总.xlsx,2 个工作表(1月 320 行、2月 356 行),45KB。」

## 注意事项
- 源 CSV 编码必须是 UTF-8;乱码先走「文件编码转换」技能
- 公式单元格以 = 开头,脚本会原样写为公式,不做公式正确性校验
- 依赖缺失时按脚本提示执行 `pip install "openpyxl>=3.0"`,不要静默失败
