---
name: 图片处理
description: "对图片文件做真实操作:格式转换、压缩、缩放、裁剪、旋转、查看信息(调用本地脚本,需 Pillow)"
version: 1.0.0
triggers: [图片, 图片转换, 压缩图片, 图片缩放, 裁剪图片, 图片旋转, 改图片格式, 图片尺寸]
platform: all
requires: [Pillow]
---

# 图片处理

## 适用场景
用户要对**图片文件本身**做处理:把 PNG 转成 JPG、压缩图片体积、调整尺寸、裁剪局部、旋转方向、查看分辨率格式。纯对话模型只能描述图片,本技能调用脚本真正产出处理后的图片文件。

## 核心能力
- 格式转换:PNG/JPG/WebP/BMP 互转(透明图转 JPG 自动铺白底)
- 压缩:指定质量、限制长边等比缩小
- 缩放:按比例或指定宽/高(单边给值自动保比例)
- 裁剪:按坐标区域,或居中裁剪指定尺寸
- 旋转:90/180/270 无损,任意角度自动扩边
- 查看信息:格式、色彩模式、尺寸、文件大小

## 脚本调用
脚本位于本技能目录 `scripts/image_tool.py`,依赖 `Pillow>=10.0`:

- 查看:`python scripts/image_tool.py info 图.png`
- 转换/压缩:`python scripts/image_tool.py convert 图.png -o 图.jpg --quality 85 --max-side 1280`
- 缩放:`python scripts/image_tool.py resize 图.png --scale 0.5 -o 小图.png`(或 `--width 800`)
- 裁剪:`python scripts/image_tool.py crop 图.png --box 10,10,200,150 -o 裁剪.png`(或 `--center 400,300`)
- 旋转:`python scripts/image_tool.py rotate 图.png --angle 90 -o 旋转.png`

坐标 box 为 `left,top,right,bottom`(从左上角起,像素)。退出码:0 成功;1 参数/依赖错误;2 处理错误。

## 输出格式
产出图片后,回报路径、新尺寸、文件大小;转换时说明目标格式。

## 示例
输入:「这张截图太大了,压成 JPG,长边不超过 1280」
动作:`python scripts/image_tool.py convert 截图.png -o 截图.jpg --quality 85 --max-side 1280`
回报:「已输出 截图.jpg(1280x720,210KB)。」

## 注意事项
- 必须真实调用脚本产出文件,不能只描述
- JPG 不支持透明;带透明通道的图转 JPG 脚本会自动铺白底
- 裁剪坐标不要超出图像范围(脚本会校验)
- 放大图片不会增加清晰度,只会增大体积——按需提醒用户
- 依赖缺失时按脚本提示执行 `pip install "Pillow>=10.0"`
