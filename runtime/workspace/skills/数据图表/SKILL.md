---
name: 数据图表
description: "把数据渲染成真实的图表图片(柱状/折线/饼图,支持多系列),中文标签不乱码(调用本地脚本,需 matplotlib)"
version: 1.0.0
triggers: [图表, 柱状图, 折线图, 饼图, 数据可视化, 画图, 生成图表]
platform: all
requires: [matplotlib]
---

# 数据图表

## 适用场景
用户有数据、想要一张**图**:营收对比、趋势走势、占比构成等。纯对话模型只能描述数据或画字符画,本技能调用脚本生成真正的 PNG 图表图片,中文坐标/标题正常显示。

## 核心能力
- 柱状图(bar):单系列或多系列分组对比
- 折线图(line):趋势,带数据点标记
- 饼图(pie):占比构成,自动百分比
- 标题、坐标轴标签、单位、图例、网格
- 中文字体自动适配(避免方框乱码)

## 脚本调用
脚本位于本技能目录 `scripts/chart_tool.py`,依赖 `matplotlib>=3.5`。你负责把数据整理成 JSON 规格:

- 从文件:`python scripts/chart_tool.py build --spec 规格.json -o 图表.png`
- 从标准输入:`echo '<规格JSON>' | python scripts/chart_tool.py build --spec - -o 图表.png`

规格 JSON 结构:
```json
{
  "type": "bar",
  "title": "季度营收对比",
  "xlabel": "季度", "ylabel": "营收", "unit": "万元",
  "labels": ["Q1","Q2","Q3","Q4"],
  "values": [120,150,180,210],
  "series": [
    {"name":"2024","values":[120,150,180,210]},
    {"name":"2025","values":[140,175,205,240]}
  ]
}
```
- type:bar / line / pie
- 单系列用 `labels` + `values`;多系列用 `series`(bar/line)
- 饼图只用 `labels` + `values`(数量须一致)
退出码:0 成功;1 参数/依赖/规格错误;2 处理错误。

## 输出格式
生成 PNG 后,回报文件路径与图表类型;脚本会提示命中的中文字体,若提示"未找到中文字体"需告知用户中文可能显示异常。

## 示例
输入:「把这两年的季度营收画成柱状图对比」
动作:整理成多系列 bar 规格,运行脚本生成 `季度营收对比.png`
回报:「已生成 季度营收对比.png(柱状图,2 个系列)。」

## 注意事项
- 必须真实调用脚本出图,不能用文字/字符画代替
- 先确认数据是数字;每个系列的 values 数量必须与 labels 一致
- 图表类型选错会误导阅读:对比用柱状、趋势用折线、占比用饼图
- 数据点多时考虑是否简化,避免图表拥挤
- 依赖缺失时按脚本提示执行 `pip install "matplotlib>=3.5"`
