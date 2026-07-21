"""
微信渠道扫码登录编排服务

真 OpenClaw 网关没有"返回登录二维码"的 RPC——微信登录是 CLI 终端操作
（`openclaw channels login --channel openclaw-weixin`）。本服务在 Python
sidecar 里跑这个登录子进程，把输出里的登录 URL 抓出来、生成二维码图片，
并跟踪扫码状态，通过 WebSocket 实时推给前端。

登录流程（出站连接腾讯微信后端，无需本地公网/LAN 地址）:
  正在启动 → 输出二维码 + 登录 URL → 正在等待操作 → 用户扫码+手机确认
  → 凭证自动保存 → 进程退出(code 0) → 重启网关使微信渠道上线
"""

import asyncio
import base64
import io
import logging
import re

import qrcode

logger = logging.getLogger(__name__)

# 登录输出里的微信授权链接（二维码编码的就是它）
_URL_RE = re.compile(r"https://liteapp\.weixin\.qq\.com/\S+")

# 判定登录成功的关键词（CLI 保存凭证后的提示）
_SUCCESS_KEYWORDS = ("登录成功", "保存成功", "凭证已保存", "logged in", "login success", "授权成功")


def make_qr_data_url(url: str) -> str:
    """把 URL 渲染成 PNG 二维码的 data-url"""
    qr = qrcode.QRCode(box_size=8, border=2, error_correction=qrcode.constants.ERROR_CORRECT_M)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


class WeixinLoginSession:
    """管理一次微信登录子进程"""

    def __init__(self) -> None:
        self.proc: asyncio.subprocess.Process | None = None
        self._task: asyncio.Task | None = None
        self.status = "idle"  # idle|starting|qr_ready|waiting_scan|success|error
        self.message = ""
        self.url: str | None = None
        self.qr_data_url: str | None = None
        self._listeners: list = []

    # ── 状态推送 ──
    def add_listener(self, cb) -> None:
        self._listeners.append(cb)

    def remove_listener(self, cb) -> None:
        self._listeners = [l for l in self._listeners if l is not cb]

    def _emit(self) -> None:
        snap = self.snapshot()
        for cb in list(self._listeners):
            try:
                ret = cb(snap)
                if asyncio.iscoroutine(ret):
                    asyncio.ensure_future(ret)
            except Exception:
                logger.exception("weixin login listener 异常")

    def _set(self, status: str, message: str) -> None:
        self.status = status
        self.message = message
        logger.info("weixin login: %s — %s", status, message)
        self._emit()

    # ── 生命周期 ──
    async def start(self) -> None:
        if self.proc and self.proc.returncode is None:
            return  # 已在运行
        self.url = None
        self.qr_data_url = None
        self._set("starting", "正在启动微信登录…")
        try:
            self.proc = await asyncio.create_subprocess_shell(
                "openclaw channels login --channel openclaw-weixin",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.STDOUT,
            )
        except Exception as e:
            self._set("error", f"无法启动登录进程: {e}")
            return
        self._task = asyncio.create_task(self._read_loop())

    async def _read_loop(self) -> None:
        assert self.proc and self.proc.stdout
        try:
            async for raw in self.proc.stdout:
                line = raw.decode("utf-8", errors="replace").rstrip()
                if not line:
                    continue

                # 抓登录 URL → 生成二维码
                m = _URL_RE.search(line)
                if m:
                    new_url = m.group(0)
                    if new_url != self.url:
                        self.url = new_url
                        try:
                            self.qr_data_url = make_qr_data_url(new_url)
                        except Exception:
                            logger.exception("生成二维码失败")
                            self.qr_data_url = None
                        self._set("qr_ready", "请用手机微信扫描二维码")
                        continue

                # 进入等待扫码阶段
                if "正在等待操作" in line and self.status == "qr_ready":
                    self._set("waiting_scan", "二维码已就绪，等待扫码…")
                    continue

                # 成功关键词
                if any(k in line for k in _SUCCESS_KEYWORDS):
                    self._set("success", "登录成功，正在保存凭证…")

            await self.proc.wait()
            # 以退出码作为最终判定（扫码确认后 CLI 保存凭证并正常退出）
            if self.status != "success":
                if self.proc.returncode == 0:
                    self._set("success", "登录成功")
                else:
                    self._set("error", f"登录进程退出（code {self.proc.returncode}）")
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.exception("weixin login 读取异常")
            self._set("error", f"登录异常: {e}")

    async def stop(self) -> None:
        if self._task and not self._task.done():
            self._task.cancel()
        if self.proc and self.proc.returncode is None:
            try:
                self.proc.kill()
            except Exception:
                pass
        self._set("idle", "已取消")

    def snapshot(self) -> dict:
        return {
            "status": self.status,
            "message": self.message,
            "url": self.url,
            "qrDataUrl": self.qr_data_url,
        }


# 全局单例：同一时间只允许一个登录会话
_session = WeixinLoginSession()


def get_session() -> WeixinLoginSession:
    return _session
