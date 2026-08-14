---
name: CSV数据处理
description: "对 CSV 文件做数据处理:筛选、排序、去重、合并、统计、预览。
  适用于表格数据处理、名单整理、数据清洗的场景(调用本地脚本,标准库无额外依赖)"
version: 1.0.0
triggers: [CSV, 筛选数据, 排序, 去重, 合并表格, 数据统计]
platform: all
requires: []
---

# CSV数据处理

## 定义
对 CSV 文件执行真实的数据操作并输出结果文件,解决大表格无法在聊天里手工处理的问题。

## 适用场景
- 名单/台账需要筛选、排序、去重
- 多个 CSV 按某列合并
- 快速看某列统计与预览

## 核心能力
- filter:按「列=值」筛选
- sort:按列升/降序
- dedup:按列去重(保留首条)
- merge:两文件按指定列横向合并
- stats:数值列的描述统计(计数/和/均值/最大/最小)
- head:预览前 N 行

## 边界
- 只处理 CSV(UTF-8),不做 xlsx(见「Excel表格生成」)
- 不做复杂数据建模与预测
- 统计列必须全为数字,否则报错并列出问题行

## 执行流程
脚本位于本技能目录 `scripts/csv_tool.py`(标准库,无额外依赖)。

- 筛选:`python scripts/csv_tool.py filter 数据.csv -o 结果.csv --where "城市=上海"`
- 排序:`python scripts/csv_tool.py sort 数据.csv -o 结果.csv --by 金额 --desc`
- 去重:`python scripts/csv_tool.py dedup 数据.csv -o 结果.csv --by 手机号`
- 合并:`python scripts/csv_tool.py merge a.csv b.csv -o 结果.csv --on 订单号`
- 统计:`python scripts/csv_tool.py stats 数据.csv --cols 金额,数量`
- 预览:`python scripts/csv_tool.py head 数据.csv -n 10`

退出码:0 成功;1 参数/文件错误;2 处理错误。

## 输出格式
- 产出文件:回报输出路径与行数
- 统计:逐列列出 计数/和/均值/最大/最小

## 示例
输入:「把名单里上海的客户挑出来,按消费金额从高到低」
动作:先 filter 再 sort,回报行数
回报:「筛选后 128 行,已按金额降序保存为 结果.csv。」

## 注意事项
- 编码必须是 UTF-8;乱码先走「文件编码转换」技能
- 列名以文件实际表头为准,操作前先 head 看结构
