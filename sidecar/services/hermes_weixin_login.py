"""
Hermes 微信渠道扫码登录编排服务

通过便携 Python 运行 hermes 的 qr_login() 函数，
抓输出中的二维码 URL → 生成 PNG 二维码，
跟踪扫码状态，通过 WebSocket 实时推给前端。

登录流程：
  正在启动 → 输出二维码 + 登录 URL → 正在等待操作 → 用户扫码+手机确认
  → 凭证自动保存 → 进程退出(code 0) → 更新 config.yaml 使微信渠道上线
"""

import asyncio
import base64
import io
import logging
import os
import re
import sys

import qrcode

from ..platform import portable_python

logger = logging.getLogger(__name__)

# 登录输出里的微信授权链接（二维码编码的就是它）
_URL_RE = re.compile(r"https://liteapp\.weixin\.qq\.com/\S+")

# 判定登录成功的关键词
_SUCCESS_KEYWORDS = ("登录成功", "保存成功", "凭证已保存", "logged in", "login success", "授权成功", "连接成功")


# 项目根目录
_SERVICES_DIR = os.path.dirname(os.path.abspath(__file__))
_SIDECAR_DIR = os.path.dirname(_SERVICES_DIR)
PROJECT_ROOT = os.path.dirname(_SIDECAR_DIR)


def make_qr_data_url(url: str) -> str:
    """把 URL 渲染成 PNG 二维码的 data-url"""
    qr = qrcode.QRCode(box_size=8, border=2, error_correction=qrcode.constants.ERROR_CORRECT_M)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def _portable_python() -> str | None:
    """便携 Python：runtime/python/cpython-*（平台差异见 sidecar/platform.py）"""
    return portable_python(PROJECT_ROOT)


def _hermes_cli_main() -> str:
    """hermes_cli/main.py 路径"""
    return os.path.join(PROJECT_ROOT, "runtime", "hermes-libs", "hermes_cli", "main.py")


class HermesWeixinLoginSession:
    """管理一次 Hermes 微信登录子进程"""

    _TAIL_LINES = 5

    def __init__(self) -> None:
        self.proc: asyncio.subprocess.Process | None = None
        self._task: asyncio.Task | None = None
        self.status = "idle"  # idle|starting|qr_ready|waiting_scan|success|error
        self.message = ""
        self.url: str | None = None
        self.qr_data_url: str | None = None
        self._listeners: list = []
        self._tail: list[str] = []
        self._restart_callback = None

    def add_listener(self, cb) -> None:
        self._listeners.append(cb)

    def remove_listener(self, cb) -> None:
        self._listeners = [l for l in self._listeners if l is not cb]

    def set_restart_callback(self, cb) -> None:
        """登录成功后回调：用于重启 Hermes 网关使微信渠道上线"""
        self._restart_callback = cb

    def _save_weixin_platform(self, line: str) -> None:
        """解析 LOGIN_SUCCESS 凭证，写入 config.yaml 的 platforms.weixin。

        Hermes 网关只从 config.yaml 的 platforms 段加载消息渠道，
        不写这步的话网关重启后仍是「0 渠道」，微信消息不会回。
        """
        payload = line[len("LOGIN_SUCCESS:"):].strip()
        creds = {}
        for part in payload.split(","):
            if "=" in part:
                k, v = part.split("=", 1)
                creds[k.strip()] = v.strip()
        account_id = creds.get("account_id", "")
        token = creds.get("token", "")
        base_url = creds.get("base_url", "")
        if not account_id or not token:
            logger.warning("解析微信凭证失败: %s", line)
            return
        try:
            import yaml
        except Exception:
            logger.exception("yaml 不可用")
            return
        config_path = os.path.join(PROJECT_ROOT, "runtime", "hermes-home", "config.yaml")
        try:
            cfg = {}
            if os.path.isfile(config_path):
                with open(config_path, "r", encoding="utf-8") as f:
                    cfg = yaml.safe_load(f) or {}
            if not isinstance(cfg, dict):
                cfg = {}
            platforms = cfg.setdefault("platforms", {})
            weixin = platforms.setdefault("weixin", {})
            weixin["enabled"] = True
            weixin["token"] = token
            extra = weixin.setdefault("extra", {})
            extra["account_id"] = account_id
            extra["base_url"] = base_url
            with open(config_path, "w", encoding="utf-8") as f:
                yaml.safe_dump(cfg, f, allow_unicode=True, sort_keys=False)
            logger.info("微信平台配置已写入 config.yaml: account=%s", account_id)
        except Exception:
            logger.exception("写入微信平台配置失败")

    def _emit(self) -> None:
        snap = self.snapshot()
        for cb in list(self._listeners):
            try:
                ret = cb(snap)
                if asyncio.iscoroutine(ret):
                    asyncio.ensure_future(ret)
            except Exception:
                logger.exception("hermes weixin login listener 异常")

    def _set(self, status: str, message: str) -> None:
        self.status = status
        self.message = message
        logger.info("hermes weixin login: %s — %s", status, message)
        self._emit()

    async def start(self) -> None:
        """启动登录子进程（用便携 Python 运行 hermes gateway setup 的微信部分）"""
        if self.proc and self.proc.returncode is None:
            return  # 已在运行

        python_exe = _portable_python()
        if not python_exe:
            self._set("error", "便携 Python 未找到，请先运行 bootstrap-hermes.bat")
            return

        # 构造运行命令：用便携 Python 运行一个内联脚本调用 qr_login
        hermes_home = os.path.join(PROJECT_ROOT, "runtime", "hermes-home")
        hermes_libs = os.path.join(PROJECT_ROOT, "runtime", "hermes-libs")

        # 内联 Python 脚本：导入 qr_login 并执行
        inline_script = f"""
import sys, os
sys.path.insert(0, {hermes_libs!r})
os.environ.setdefault('HERMES_HOME', {hermes_home!r})
import asyncio
from gateway.platforms.weixin import qr_login
try:
    result = asyncio.run(qr_login({hermes_home!r}))
    if result:
        print(f'LOGIN_SUCCESS:account_id={{result.get("account_id","")}},token={{result.get("token","")}},base_url={{result.get("base_url","")}}')
    else:
        print('LOGIN_FAILED:timeout')
        sys.exit(1)
except Exception as e:
    print(f'LOGIN_ERROR:{{e}}')
    sys.exit(2)
"""
        self.url = None
        self.qr_data_url = None
        self._tail = []
        self._set("starting", "正在启动微信登录…")

        try:
            self.proc = await asyncio.create_subprocess_exec(
                python_exe, "-c", inline_script,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.STDOUT,
                cwd=hermes_libs,
                env={**os.environ, "HERMES_HOME": hermes_home, "PYTHONPATH": hermes_libs},
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
                self._tail.append(line)
                if len(self._tail) > self._TAIL_LINES:
                    self._tail.pop(0)

                # 检测成功（从凭证输出）→ 落盘 platforms.weixin 配置，网关重启后才加载微信渠道
                if line.startswith("LOGIN_SUCCESS:"):
                    self._save_weixin_platform(line)
                    self._set("success", "登录成功，正在保存凭证…")
                    continue

                # 检测失败
                if line.startswith("LOGIN_FAILED:") or line.startswith("LOGIN_ERROR:"):
                    self._set("error", f"登录失败: {line.split(':', 1)[1]}")
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

                if "已扫码" in line:
                    self._set("waiting_scan", "已扫码，请在微信中确认…")
                    continue

                # 成功关键词
                if any(k in line for k in _SUCCESS_KEYWORDS):
                    self._set("success", "登录成功，正在保存凭证…")

            await self.proc.wait()
            if self.status != "success":
                if self.proc.returncode == 0:
                    self._set("success", "登录成功")
                else:
                    tail = " | ".join(self._tail[-self._TAIL_LINES:]) if self._tail else "无输出"
                    self._set("error", f"登录进程退出（code {self.proc.returncode}）: {tail}")
            else:
                # 登录成功 → 重启网关，让新凭证生效、微信渠道上线
                self._set("success", "登录成功，正在重启网关…")
                if self._restart_callback:
                    try:
                        await self._restart_callback()
                    except Exception:
                        logger.exception("重启 Hermes 网关失败")
                        self._set("error", "网关重启失败，请手动重启")
                        return
                self._set("success", "登录成功，微信渠道已接入")
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.exception("hermes weixin login 读取异常")
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


# 全局单例
_session = HermesWeixinLoginSession()


def get_session() -> HermesWeixinLoginSession:
    return _session
