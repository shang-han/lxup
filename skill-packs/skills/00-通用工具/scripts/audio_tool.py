#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
语音转写工具 —— 龙虾优盘「通用工具」能力型技能

把音频**真实转写成文字**(调用 faster-whisper 离线模型),并可输出带时间轴的 SRT 字幕。
纯对话模型听不到音频,本技能负责真正的语音识别。

用法:
  python audio_tool.py transcribe 录音.wav -o 文稿.txt
  python audio_tool.py transcribe 录音.wav --srt 字幕.srt --model small --language zh

说明:
  - WAV(PCM)走内置 numpy 加载,零额外依赖;mp3/m4a 等需 faster-whisper 自带的解码器(av)。
  - 模型首次使用会从 HuggingFace 下载并缓存(tiny≈39M / base≈74M / small≈244M);
    离线部署应预先把模型缓存打进便携环境。
依赖: faster-whisper>=1.0、numpy。退出码: 0 成功; 1 参数/依赖错误; 2 处理错误。
"""
import argparse
import os
import sys
import wave

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
    sys.stdin.reconfigure(encoding="utf-8")
except Exception:
    pass

TARGET_SR = 16000  # whisper 要求 16kHz 单声道


def _require_fw():
    try:
        import faster_whisper  # noqa: F401
        return faster_whisper
    except ImportError:
        sys.stderr.write('[audio_tool] 缺少依赖 faster-whisper,请先执行: pip install "faster-whisper>=1.0"\n')
        sys.exit(1)


def _check_input(path: str):
    if not os.path.isfile(path):
        sys.stderr.write(f"[audio_tool] 音频不存在: {path}\n")
        sys.exit(2)


def _wav_to_float32(path: str):
    """读取 PCM WAV → 16kHz 单声道 float32 numpy 数组(numpy 重采样,不依赖 audioop)。"""
    import numpy as np
    try:
        wf = wave.open(path, "rb")
    except Exception as e:  # noqa: BLE001
        sys.stderr.write(f"[audio_tool] WAV 打开失败: {e}\n")
        sys.exit(2)
    ch, sw, fr = wf.getnchannels(), wf.getsampwidth(), wf.getframerate()
    raw = wf.readframes(wf.getnframes())
    wf.close()
    if sw == 2:
        data = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
    elif sw == 4:
        data = np.frombuffer(raw, dtype=np.int32).astype(np.float32) / 2147483648.0
    elif sw == 1:
        data = (np.frombuffer(raw, dtype=np.uint8).astype(np.float32) - 128.0) / 128.0
    else:
        sys.stderr.write(f"[audio_tool] 不支持的位深 {sw*8}bit(支持 8/16/32bit PCM)\n")
        sys.exit(2)
    if ch > 1:
        data = data.reshape(-1, ch).mean(axis=1)
    if fr != TARGET_SR:  # 线性插值重采样
        dur = len(data) / fr
        new_len = max(1, int(dur * TARGET_SR))
        x_old = np.linspace(0.0, dur, num=len(data), endpoint=False)
        x_new = np.linspace(0.0, dur, num=new_len, endpoint=False)
        data = np.interp(x_new, x_old, data)
    return data.astype(np.float32)


def _load_audio(path: str):
    """WAV 走原生加载;其它格式交给 faster-whisper 内置解码(需 av)。"""
    if path.lower().endswith(".wav"):
        return _wav_to_float32(path)
    return path


def _fmt_ts(t: float) -> str:
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def cmd_transcribe(args):
    _require_fw()
    from faster_whisper import WhisperModel
    _check_input(args.input)
    audio = _load_audio(args.input)

    sys.stderr.write(f"[audio_tool] 加载模型 {args.model}(首次使用需联网下载并缓存)...\n")
    try:
        model = WhisperModel(args.model, device=args.device, compute_type=args.compute)
    except Exception as e:  # noqa: BLE001
        sys.stderr.write(
            f"[audio_tool] 模型加载失败: {e}\n"
            f"  提示: 首次使用需联网下载模型。国内网络可先设镜像:\n"
            f"        set HF_ENDPOINT=https://hf-mirror.com   (Windows)\n"
            f"        export HF_ENDPOINT=https://hf-mirror.com (macOS/Linux)\n"
            f"  离线环境应预先把模型缓存打进便携目录,或改用更小的 --model tiny。\n")
        sys.exit(2)

    try:
        segments, info = model.transcribe(
            audio, language=(args.language or None), vad_filter=True)
        segments = list(segments)
    except Exception as e:  # noqa: BLE001
        sys.stderr.write(
            f"[audio_tool] 转写失败: {e}\n"
            f"  提示: 非 WAV 格式需要解码器,可先转成 WAV 再试。\n")
        sys.exit(2)

    text = "\n".join(s.text.strip() for s in segments).strip()
    sys.stderr.write(
        f"[audio_tool] 识别语言: {info.language}(置信 {info.language_probability:.2f})"
        f"  时长: {info.duration:.1f}s  分段: {len(segments)}\n")

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(text + "\n")
        sys.stderr.write(f"[audio_tool] 文稿已写入 -> {args.output}\n")
    else:
        print(text)

    if args.srt:
        lines = []
        for i, s in enumerate(segments, 1):
            lines += [str(i), f"{_fmt_ts(s.start)} --> {_fmt_ts(s.end)}", s.text.strip(), ""]
        with open(args.srt, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))
        sys.stderr.write(f"[audio_tool] 字幕已写入 -> {args.srt}\n")

    if not segments:
        sys.stderr.write("[audio_tool] 未识别到语音内容(可能是静音或纯音乐)。\n")


def main():
    parser = argparse.ArgumentParser(prog="audio_tool.py", description="语音转写工具(龙虾优盘通用技能)")
    sub = parser.add_subparsers(dest="command", required=True)
    p = sub.add_parser("transcribe", help="音频转文字(可出 SRT 字幕)")
    p.add_argument("input")
    p.add_argument("-o", "--output", help="文稿输出到文件(缺省打印到屏幕)")
    p.add_argument("--srt", help="同时输出 SRT 字幕文件")
    p.add_argument("--model", default="small", help="tiny/base/small/medium/large,默认 small")
    p.add_argument("--language", help="语言代码如 zh/en,缺省自动检测")
    p.add_argument("--device", default="cpu")
    p.add_argument("--compute", default="int8", help="int8/int8_float32/float16 等")
    p.set_defaults(func=cmd_transcribe)
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
