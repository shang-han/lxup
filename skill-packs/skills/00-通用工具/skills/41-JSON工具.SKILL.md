---
name: JSON工具
description: "JSON 美化、校验、字段提取、结构概览。
  适用于接口调试、配置处理、数据分析取值的场景(调用本地脚本,标准库无额外依赖)"
version: 1.0.0
triggers: [JSON, 美化, 格式化, 校验json, 提取字段, json格式]
platform: all
requires: []
---

# JSON工具

## 定义
对 JSON 文件做美化、校验、字段提取等真实操作并输出结果文件。

## 适用场景
- 压缩成一行的 JSON 看不清,要美化
- 校验 JSON 是否合法、定位错误位置
- 从大 JSON 里提取某个字段

## 核心能力
- pretty:缩进美化(可排序键)
- validate:校验合法性,报错给出行列
- get:按路径取字段(a.b[0].c)
- keys:列出顶层结构

## 边界
- 只处理 JSON 格式文件
- 不修改语义,美化不改变数据
- 超大文件(>100MB)先提示

## 执行流程
脚本位于本技能目录 `scripts/json_tool.py`(标准库,无额外依赖)。

- 美化:`python scripts/json_tool.py pretty 数据.json -o 美化.json`
- 校验:`python scripts/json_tool.py validate 数据.json`
- 取字段:`python scripts/json_tool.py get 数据.json --path "data.list.0.name"`
- 结构:`python scripts/json_tool.py keys 数据.json`

退出码:0 成功;1 参数/JSON 语法错误;2 处理错误。

## 输出格式
validate 失败:报错行/列与原因;get:字段值;keys:顶层键与类型。

## 示例
输入:「这个 JSON 打不开,帮我看看哪错了」
动作:validate → 报错「第 23 行第 5 列:缺少逗号」

## 注意事项
- 校验报错后不要猜着改,把错误位置给用户确认
