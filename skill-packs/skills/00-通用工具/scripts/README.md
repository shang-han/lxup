# 通用工具技能脚本

本目录脚本由引擎(agent)在执行**能力型技能**时真实调用。与岗位技能包的纯提示词技能不同,
能力型技能必须实际运行这些脚本、产出真实文件,而不是仅描述步骤。

所有脚本统一约定:UTF-8 输入输出(已处理 Windows 控制台/管道);缺依赖时打印安装命令并以
退出码 1 退出;参数错误 1、处理错误 2、成功 0。各脚本 `-h` 查看完整用法。

## pdf_tool.py — PDF 处理
- 依赖:`pip install "pypdf>=3.0"`
- 子命令:`info` / `merge` / `split` / `extract` / `rotate`
- 示例:`python pdf_tool.py merge a.pdf b.pdf -o 合并.pdf`

## docx_tool.py — Word 文档生成
- 依赖:`pip install "python-docx>=1.0"`
- 子命令:`build`(按 JSON 规格生成 .docx,含标题/列表/表格/分页,中文排版)
- 示例:`python docx_tool.py build --spec 规格.json -o 报告.docx`

## chart_tool.py — 数据图表
- 依赖:`pip install "matplotlib>=3.5"`
- 子命令:`build`(按 JSON 规格出柱状/折线/饼图 PNG,中文字体自适应)
- 示例:`python chart_tool.py build --spec 规格.json -o 图.png`

## image_tool.py — 图片处理
- 依赖:`pip install "Pillow>=10.0"`
- 子命令:`info` / `convert` / `resize` / `crop` / `rotate`(透明图转 JPG 自动铺白底)
- 示例:`python image_tool.py convert 图.png -o 图.jpg --quality 85 --max-side 1280`

## audio_tool.py — 语音转写
- 依赖:`pip install "faster-whisper>=1.0"`(含 numpy)
- 子命令:`transcribe`(离线语音识别,出文稿/SRT 字幕;WAV 零额外依赖)
- 示例:`python audio_tool.py transcribe 录音.wav -o 文稿.txt --srt 字幕.srt --language zh`
- **模型需下载**:首次联网从 HuggingFace 拉取;国内设 `HF_ENDPOINT=https://hf-mirror.com`;离线应预缓存

> 便携部署:龙虾优盘的便携 Python 运行时应预装 pypdf / python-docx / matplotlib / Pillow /
> faster-whisper(建议写入 bootstrap 或引擎 requirements),语音模型需预缓存,保证离线开箱即用。
