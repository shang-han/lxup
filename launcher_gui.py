#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""LXUP Launcher - Tkinter GUI v3"""

import ctypes, hashlib, json, math, os, shutil, socket, stat, subprocess, sys, tempfile, threading, time, zipfile
if sys.platform == 'win32':
    try: ctypes.windll.shcore.SetProcessDpiAwareness(1)
    except Exception:
        try: ctypes.windll.user32.SetProcessDPIAware()
        except Exception: pass
from datetime import datetime
import tkinter as tk
from tkinter import Tk, Toplevel, Frame, Label, Button, Text, Canvas, Scrollbar, messagebox, ttk
from urllib.error import HTTPError
from urllib.request import Request, urlopen


class HttpResponse:
    def __init__(self, response):
        self._response = response
        self.status_code = getattr(response, "status", 200)
        self.headers = response.headers

    def raise_for_status(self):
        if self.status_code >= 400:
            raise RuntimeError(f"HTTP {self.status_code}")

    def json(self):
        return json.loads(self._response.read().decode("utf-8"))

    def iter_content(self, chunk_size=8192):
        while True:
            chunk = self._response.read(chunk_size)
            if not chunk: break
            yield chunk

    def close(self):
        self._response.close()


def http_get(url, timeout, headers=None, stream=False):
    request = Request(url, headers=headers or {}, method="GET")
    try:
        return HttpResponse(urlopen(request, timeout=timeout))
    except HTTPError as exc:
        return HttpResponse(exc)

def root_dir():
    if getattr(sys, "frozen", False): return os.path.dirname(os.path.abspath(sys.executable))
    return os.path.dirname(os.path.abspath(__file__))

ROOT = root_dir(); RUNTIME = os.path.join(ROOT, "runtime"); LOG_DIR = os.path.join(RUNTIME, "logs")
ICON_PATH = os.path.join(ROOT, "LXUP-icon.ico"); VERSION_FILE = os.path.join(RUNTIME, "version.json")
NODE = os.path.join(RUNTIME, "data", "node.exe")
OPENCLAW_ENTRY = os.path.join(RUNTIME, "openclaw", "node_modules", "openclaw", "openclaw.mjs")
VITE_JS = os.path.join(ROOT, "control-ui", "node_modules", "vite", "bin", "vite.js")
AI_SERVER_JS = os.path.join(ROOT, "ai-assistant", "server.js")
SIDECAR_MAIN = os.path.join(ROOT, "sidecar", "main.py")
HERMES_MAIN = os.path.join(RUNTIME, "hermes-libs", "hermes_cli", "main.py")
FRONTEND_PORT = 5173; SIDECAR_PORT = 7889; LOCK_PORT = 47889
FRONTEND_URL = f"http://localhost:{FRONTEND_PORT}"
SERVICES = [
    {"name": "Sidecar", "port": SIDECAR_PORT}, {"name": "OpenClaw", "port": 18789},
    {"name": "Hermes", "port": 8642}, {"name": "AI Assistant", "port": 8080},
    {"name": "Frontend", "port": FRONTEND_PORT},
]
UPDATE_URL = "https://www.hyx-agent.cn/lxup/update"
CNW = 0x08000000; CNP = 0x00000200; DETACHED = CNW | CNP
_lock_sock = None

def load_version():
    try:
        with open(VERSION_FILE, "r", encoding="utf-8") as f: return json.load(f)
    except: return {"version": "unknown", "build_date": "unknown", "app_name": "LXUP"}

def port_open(port, host="127.0.0.1", timeout=0.5):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(timeout); return s.connect_ex((host, port)) == 0
    except: return False

def acquire_lock():
    global _lock_sock
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try: s.bind(("127.0.0.1", LOCK_PORT))
    except OSError: s.close(); return False
    _lock_sock = s; return True

def portable_python():
    base = os.path.join(RUNTIME, "python")
    if os.path.isdir(base):
        cands = sorted(d for d in os.listdir(base) if d.startswith("cpython-"))
        if cands:
            exe = os.path.join(base, cands[-1], "python.exe")
            if os.path.isfile(exe): return exe
    return None

def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""): h.update(chunk)
    return h.hexdigest()

class ServiceManager:
    def __init__(self, log_cb, progress_cb=None):
        self.log = log_cb; self.progress = progress_cb or (lambda *a: None); self.processes = []
    def base_env(self):
        return {"OPENCLAW_STATE_DIR": os.path.join(RUNTIME, "openclaw-home"),
                "LICENSE_SERVER_URL": "http://49.233.171.82:9000"}
    def spawn(self, name, argv, cwd, env=None, logfile=None):
        out = subprocess.DEVNULL
        if logfile:
            try:
                os.makedirs(LOG_DIR, exist_ok=True)
                out = open(os.path.join(LOG_DIR, logfile), "ab")
            except: out = subprocess.DEVNULL
        full_env = os.environ.copy()
        if env: full_env.update(env)
        try:
            proc = subprocess.Popen(argv, cwd=cwd, env=full_env, stdout=out, stderr=subprocess.STDOUT,
                                    stdin=subprocess.DEVNULL, creationflags=DETACHED)
            self.log(f"  ✅ 已启动 {name} (PID {proc.pid})"); self.processes.append(proc); return proc
        except Exception as e: self.log(f"  ❌ 启动 {name} 失败: {e}"); return None
    def wait_for_port(self, port, process=None, timeout=60):
        deadline = time.time() + timeout
        while time.time() < deadline:
            if port_open(port): return True
            if process is not None and process.poll() is not None: return False
            time.sleep(1)
        return port_open(port)
    @staticmethod
    def listening_pids():
        pids = set()
        try:
            result = subprocess.run(["netstat", "-ano", "-p", "tcp"], capture_output=True,
                                    text=True, errors="replace", check=False, creationflags=CNW)
            ports = {str(svc["port"]) for svc in SERVICES}
            for line in result.stdout.splitlines():
                fields = line.split()
                if len(fields) < 5 or fields[0].upper() != "TCP": continue
                if fields[3].upper() != "LISTENING": continue
                endpoint = fields[1].strip("[]")
                if ":" not in endpoint: continue
                port = endpoint.rsplit(":", 1)[-1]
                if port in ports and fields[4].isdigit(): pids.add(int(fields[4]))
        except Exception:
            pass
        return pids

    def stop_all(self):
        tracked = {proc.pid for proc in self.processes if proc is not None and proc.poll() is None}
        found = self.listening_pids()
        for pid in sorted(found - tracked): self.log(f"  🔎 发现运行中的服务 PID {pid}")
        pids = tracked | found
        stopped = 0
        for pid in sorted(pids, reverse=True):
            try:
                result = subprocess.run(["taskkill", "/F", "/T", "/PID", str(pid)],
                                        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                                        check=False, creationflags=CNW)
                if result.returncode == 0:
                    stopped += 1; self.log(f"  ⏹ 已停止 PID {pid}")
                else:
                    self.log(f"  ⚠️ 停止 PID {pid} 失败（返回码 {result.returncode}）")
            except Exception as e:
                self.log(f"  ⚠️ 停止 PID {pid} 失败: {e}")
        deadline = time.time() + 10
        while time.time() < deadline and self.listening_pids(): time.sleep(0.25)
        remaining = self.listening_pids()
        if remaining: self.log(f"  ⚠️ 仍有服务端口被占用（PID {', '.join(map(str, sorted(remaining)))})")
        self.processes.clear()
        self.log(f"  共停止 {stopped} 个进程" if stopped else "  没有运行中的进程")
    def start_all(self, py):
        os.makedirs(LOG_DIR, exist_ok=True); env = self.base_env(); self.processes.clear()
        def launch(name, argv, cwd, se, lf, port, timeout=60):
            self.progress(name, "starting")
            proc = self.spawn(name, argv, cwd, se, lf)
            if proc is None:
                self.progress(name, "error"); return False
            if not self.wait_for_port(port, proc, timeout):
                self.log(f"  ❌ {name} 未在端口 {port} 上监听")
                self.progress(name, "error"); self.stop_all(); return False
            self.log(f"  ✅ {name} 就绪: 127.0.0.1:{port}")
            self.progress(name, "running"); return True
        if not launch("Sidecar", [py, "-m", "sidecar.main", "--db-path",
                       os.path.join(RUNTIME, "data", "gateway.db"),
                       "--port", str(SIDECAR_PORT)],
                       cwd=ROOT, se=env, lf="sidecar.log", port=SIDECAR_PORT): return False
        if os.path.isfile(OPENCLAW_ENTRY) and os.path.isfile(NODE):
            ge = dict(env)
            ge["PATH"] = os.pathsep.join([os.path.dirname(NODE), os.path.dirname(py), ge.get("PATH", "")])
            if not launch("OpenClaw", [NODE, OPENCLAW_ENTRY, "gateway", "--port", "18789", "--force"],
                          cwd=ROOT, se=ge, lf="openclaw-gateway.log", port=18789, timeout=120): return False
        hh = os.path.join(RUNTIME, "hermes-home"); os.makedirs(hh, exist_ok=True)
        he = dict(env)
        he["PATH"] = os.pathsep.join([os.path.dirname(NODE), os.path.dirname(py), he.get("PATH", "")])
        he.update({"HERMES_HOME": hh, "PYTHONPATH": os.path.join(RUNTIME, "hermes-libs"),
                   "API_SERVER_ENABLED": "true", "API_SERVER_HOST": "127.0.0.1",
                   "API_SERVER_PORT": "8642", "API_SERVER_KEY": "lxup-hermes-dev-2026",
                   "API_SERVER_CORS_ORIGINS": "*"})
        if not launch("Hermes", [py, "-m", "hermes_cli.main", "gateway", "run", "--replace"],
                      cwd=ROOT, se=he, lf="hermes-gateway.log", port=8642): return False
        if not launch("AI Assistant", [NODE, "server.js"], cwd=os.path.join(ROOT, "ai-assistant"),
                      se=env, lf="ai-assistant.log", port=8080): return False
        if not launch("Frontend", [NODE, VITE_JS], cwd=os.path.join(ROOT, "control-ui"),
                      se=env, lf="frontend.log", port=FRONTEND_PORT): return False
        self.log("  🎉 全部服务启动成功！"); return True
    def preflight(self):
        fatals, warns = [], []; longest = ROOT
        skipped = (os.path.join(RUNTIME, "openclaw-home"), os.path.join(RUNTIME, "codex-home"),
                   os.path.join(RUNTIME, "hermes-home"), LOG_DIR)
        try:
            for base, dirs, files in os.walk(ROOT):
                dirs[:] = [d for d in dirs if not any(os.path.join(base, d).startswith(p) for p in skipped)]
                for name in files:
                    full = os.path.join(base, name)
                    if len(full) > len(longest): longest = full
        except: pass
        if len(longest) >= 235: fatals.append(f"路径过长（{len(longest)} 字符），请将 LXUP 移到短路径目录")
        py = portable_python()
        if py is None:
            if getattr(sys, "frozen", False): fatals.append("便携 Python 缺失，请先运行 bootstrap-hermes.bat")
            else: py = sys.executable; warns.append("便携 Python 缺失，暂用系统解释器")
        if not os.path.isfile(NODE): fatals.append("便携 node.exe 缺失，请先运行 bootstrap-openclaw.bat")
        for name, path in [("Sidecar", SIDECAR_MAIN), ("Hermes", HERMES_MAIN),
                           ("OpenClaw", OPENCLAW_ENTRY), ("前端", VITE_JS), ("AI 助手", AI_SERVER_JS)]:
            if not os.path.isfile(path): fatals.append(f"{name} 不存在 ({path})")
        return py, fatals, warns

class UpdateManager:
    def __init__(self, vi, log_cb, prog_cb=None):
        self.cv = vi.get("version", "unknown"); self.log = log_cb
        self.prog = prog_cb or (lambda p, m: None)
    def check_update(self):
        self.log("🔍 正在检查更新...")
        try:
            r = http_get(UPDATE_URL, timeout=15, headers={"User-Agent": f"LXUP/{self.cv}"})
            if r.status_code != 200: self.log(f"  ⚠️ 服务器返回 {r.status_code}"); return None
            data = r.json(); sv = data.get("version", "")
            if not sv: self.log("  ⚠️ 服务器未返回版本信息"); return None
            self.log(f"  📋 当前版本: {self.cv} | 服务器版本: {sv}")
            if self._vcmp(sv, self.cv) <= 0: self.log("  ✅ 已是最新版本"); return None
            return data
        except Exception as e: self.log(f"  ❌ 检查更新失败: {e}"); return None
    @staticmethod
    def _vcmp(a, b):
        def p(v):
            try: return [int(x) for x in v.split(".")]
            except: return [0]
        pa, pb = p(a), p(b)
        for x, y in zip(pa, pb):
            if x > y: return 1
            if x < y: return -1
        return (len(pa) > len(pb)) - (len(pa) < len(pb))
    def download_file(self, url, sha256="", expected_size=0):
        td = tempfile.mkdtemp(prefix="lxup_update_"); tf = os.path.join(td, "update.zip")
        response = None
        keep_download = False
        try:
            response = http_get(url, stream=True, timeout=300,
                                    headers={"User-Agent": f"LXUP/{self.cv}"})
            response.raise_for_status()
            try: total = int(response.headers.get("Content-Length") or response.headers.get("content-length") or 0)
            except (TypeError, ValueError): total = 0
            if total <= 0:
                try: total = int(expected_size or 0)
                except (TypeError, ValueError): total = 0
            dl = 0
            self.prog(0 if total else None, "准备下载..." if total else "下载中（正在计算大小）...")
            with open(tf, "wb") as f:
                for chunk in response.iter_content(chunk_size=1024 * 64):
                    if not chunk: continue
                    f.write(chunk); dl += len(chunk)
                    if total > 0:
                        self.prog(min(100, int(dl * 100 / total)),
                                  f"下载中 {dl / 1024 / 1024:.1f}MB / {total / 1024 / 1024:.1f}MB")
                    else:
                        self.prog(None, f"下载中 {dl / 1024 / 1024:.1f}MB")
            if total > 0:
                self.prog(100, f"下载完成 {dl // 1024}KB")
            else:
                self.prog(100, f"下载完成 {dl / 1024 / 1024:.1f}MB")
            if sha256:
                actual = sha256_file(tf)
                if actual.lower() != sha256.lower():
                    self.log("  ❌ SHA256 校验失败"); return None
                self.log("  ✅ 文件校验通过")
            keep_download = True
            return tf
        except Exception as e:
            self.log(f"  ❌ 下载失败: {e}"); return None
        finally:
            if response is not None:
                try: response.close()
                except Exception: pass
            if not keep_download:
                try: shutil.rmtree(td)
                except Exception: pass

    def apply_update(self, zp, full=True):
        self.log("  📦 正在解压更新包..."); self.prog(0, "解压中...")
        preserve = {"runtime/openclaw-home", "runtime/hermes-home", "runtime/codex-home", "runtime/logs"}
        root_real = os.path.realpath(ROOT)
        active_exe = os.path.realpath(sys.executable) if getattr(sys, "frozen", False) else ""
        try:
            with zipfile.ZipFile(zp, "r") as zf:
                infos = zf.infolist(); total = len(infos)
                wrapper = all((info.filename.replace("\\", "/").split("/", 1)[0] == "LXUP")
                              for info in infos if info.filename.replace("\\", "/").strip("/"))
                for i, info in enumerate(infos):
                    raw = info.filename.replace("\\", "/")
                    parts = raw.split("/")
                    if wrapper and parts and parts[0] == "LXUP": parts = parts[1:]
                    rel = "/".join(parts).strip("/")
                    if not rel or "\x00" in rel or rel.startswith(("/", "\\")) or ":" in rel.split("/", 1)[0]:
                        raise ValueError(f"非法更新路径: {info.filename}")
                    if any(part in ("", ".", "..") for part in rel.split("/")):
                        raise ValueError(f"非法更新路径: {info.filename}")
                    target = os.path.abspath(os.path.join(ROOT, *rel.split("/")))
                    try:
                        if os.path.commonpath((root_real, os.path.realpath(os.path.dirname(target)))) != root_real:
                            raise ValueError(f"更新路径越界: {info.filename}")
                    except ValueError:
                        raise ValueError(f"更新路径越界: {info.filename}")
                    rel_key = rel.lower()
                    preserve_hit = any(rel_key == p or rel_key.startswith(p + "/") for p in preserve)
                    current_exe = active_exe and os.path.normcase(os.path.realpath(target)) == os.path.normcase(active_exe)
                    current_exe = current_exe or (rel_key == "lxup启动器.exe" and os.path.normcase(target) == os.path.normcase(os.path.join(ROOT, "LXUP启动器.exe")))
                    if stat.S_ISLNK(info.external_attr >> 16):
                        raise ValueError(f"不支持符号链接: {info.filename}")
                    if info.is_dir() or raw.endswith("/"):
                        if not preserve_hit and not current_exe: os.makedirs(target, exist_ok=True)
                    elif preserve_hit:
                        self.log(f"  ⏭ 跳过用户数据: {rel}")
                    elif current_exe:
                        self.log("  ⏭ 跳过正在运行的 LXUP启动器.exe")
                    else:
                        os.makedirs(os.path.dirname(target), exist_ok=True)
                        with zf.open(info) as src, open(target, "wb") as dst:
                            shutil.copyfileobj(src, dst, length=1024 * 1024)
                    self.prog(int((i + 1) * 100 / total) if total else 100, f"解压中 {i + 1}/{total}")
            self.prog(100, "解压完成")
            self.log("  ✅ 更新包解压完成")
            return True
        except Exception as e:
            self.log(f"  ❌ 解压更新包失败: {e}"); return False
        finally:
            try: shutil.rmtree(os.path.dirname(zp))
            except Exception: pass

# ─────────────────────────────────────────────────────────────
#  现代化启动器 UI（原生 Tk 控件版：低 CPU / 低延迟）
# ─────────────────────────────────────────────────────────────

BG        = "#EAF4FD"
CARD      = "#FFFFFF"
BORDER    = "#C9DDF5"
INK       = "#17233D"
MUTED     = "#7B8496"
DARK_1    = "#FFFFFF"
DARK_2    = "#DCEBFA"
ACCENT    = "#0099FF"
ACCENT_HI = "#2FADFF"
DANGER    = "#FF5B5B"
DANGER_HI = "#FF7A7A"
GOLD      = "#F59E0B"
CONSOLE_BG = "#0B1426"
CONSOLE_BD = "#1E2A42"
CONSOLE_FG = "#D6DEEA"

F_TITLE = ("Microsoft YaHei UI", 16, "bold")
F_SUB   = ("Microsoft YaHei UI", 8)
F_BTN   = ("Microsoft YaHei UI", 10, "bold")
F_CARD_N= ("Microsoft YaHei UI", 9, "bold")
F_CARD_P= ("Consolas", 8)
F_STAT  = ("Microsoft YaHei UI", 8, "bold")
F_LOG   = ("Consolas", 9)
F_FOOT  = ("Microsoft YaHei UI", 8)

_SERVICE_CODES = {
    "Sidecar": "SC", "OpenClaw": "OC", "Hermes": "HE",
    "AI Assistant": "AI", "Frontend": "FE",
}

def _rrect_pts(x1, y1, x2, y2, r):
    r = max(0, min(r, (x2 - x1) / 2, (y2 - y1) / 2))
    pts = []
    for cx, cy, a0, a1 in ((x2-r, y1+r, -90, 0), (x2-r, y2-r, 0, 90),
                           (x1+r, y2-r, 90, 180), (x1+r, y1+r, 180, 270)):
        for a in range(a0, a1 + 1, 6):
            rad = math.radians(a)
            pts.extend((cx + r * math.cos(rad), cy + r * math.sin(rad)))
    return pts

def _rrect(cv, x1, y1, x2, y2, r, fill, outline="", width=1, tags=None):
    kw = {"fill": fill, "outline": outline, "width": width, "smooth": True}
    if tags: kw["tags"] = tags
    return cv.create_polygon(_rrect_pts(x1, y1, x2, y2, r), **kw)

def _mix2(c1, c2, t):
    t = max(0.0, min(1.0, t))
    return "#%02x%02x%02x" % tuple(round(int(c1[i:i+2], 16) * (1 - t) + int(c2[i:i+2], 16) * t) for i in (1, 3, 5))

def _draw_icon_items(cv, cx, cy, kind, color, size=14, tags=()):
    s = size
    if kind == "play":
        cv.create_polygon(cx-s*0.45, cy-s*0.62, cx+s*0.62, cy, cx-s*0.45, cy+s*0.62,
                          fill=color, outline="", tags=tags)
    elif kind == "stop":
        _rrect(cv, cx-s*0.55, cy-s*0.55, cx+s*0.55, cy+s*0.55, 3, color, tags=tags)
    elif kind == "globe":
        # 外径对齐 stop(0.55s):圆形视觉面积大,若与三角同框会显得大一圈
        cv.create_oval(cx-s*0.55, cy-s*0.55, cx+s*0.55, cy+s*0.55, outline=color, width=2, tags=tags)
        cv.create_oval(cx-s*0.23, cy-s*0.55, cx+s*0.23, cy+s*0.55, outline=color, width=1, tags=tags)
        cv.create_line(cx-s*0.55, cy, cx+s*0.55, cy, fill=color, width=1, tags=tags)
    elif kind == "refresh":
        cv.create_arc(cx-s*0.55, cy-s*0.55, cx+s*0.55, cy+s*0.55, start=35, extent=285, style="arc",
                      outline=color, width=2, tags=tags)
        cv.create_polygon(cx+s*0.32, cy-s*0.40, cx+s*0.49, cy-s*0.12, cx+s*0.19, cy-s*0.10,
                          fill=color, outline="", tags=tags)
    elif kind == "check":
        cv.create_line(cx-s*0.5, cy, cx-s*0.12, cy+s*0.42, cx+s*0.55, cy-s*0.48,
                       fill=color, width=2, capstyle="round", joinstyle="round", tags=tags)

class RoundedButton(tk.Canvas):
    TONES = {
        "primary": (ACCENT, ACCENT_HI, "#0F8CE0", "#FFFFFF"),
        "danger":  (DANGER, DANGER_HI, "#E04449", "#FFFFFF"),
        "neutral": ("#FFFFFF", "#F2F7FC", "#E3EDF7", INK),
        "subtle":  ("#E3F1FD", "#D6EAFD", "#C7E2FC", "#0969B8"),
    }
    def __init__(self, master, text, command=None, tone="primary", icon="", height=46, font=F_BTN, width=None):
        super().__init__(master, height=height, width=(width or 1), bg=BG,
                         highlightthickness=0, bd=0)
        self._base = text; self._text = text; self._command = command
        self._tone_key = tone; self._icon = icon; self._font = font; self._height = height
        self._enabled = True; self._loading = False; self._flash = False; self._breathing = False
        self._hovered = False; self._pressed = False; self._phase = 0; self._resize_job = None
        self.bind("<Configure>", self._on_configure)
        self.bind("<Enter>", self._on_enter); self.bind("<Leave>", self._on_leave)
        self.bind("<ButtonPress-1>", self._on_press); self.bind("<ButtonRelease-1>", self._on_release)
        self.configure(cursor="hand2")
        self._layout()

    def _on_configure(self, e):
        if self._resize_job is not None:
            try: self.after_cancel(self._resize_job)
            except Exception: pass
        self._resize_job = self.after(45, self._layout)

    def _tone_colors(self):
        if self._flash:
            return (ACCENT, ACCENT_HI, "#0F8CE0", "#FFFFFF")
        return self.TONES[self._tone_key]

    def _layout(self):
        self._resize_job = None
        self.delete("all")
        w = max(16, self.winfo_width()); h = self.winfo_height()
        r = (h - 2) / 2
        _rrect(self, 0, 1, w - 1, h - 1, r, ACCENT, tags=("bg",))
        pad = max(11, h * 0.24)
        if self._icon:
            ix = pad + 15
            bg0, hov0, prs0, fg0 = self._tone_colors()
            _draw_icon_items(self, ix, h / 2, self._icon, fg0, 14, tags=("icn",))
            tx = ix + 18
        else:
            tx = w / 2
        self.create_text(tx, h / 2, text=self._text, font=self._font, fill="#FFFFFF",
                         anchor=("w" if self._icon else "center"), tags=("txt",))
        self._paint()

    def _paint(self):
        if not self.winfo_exists(): return
        bg, hover, press, fg = self._tone_colors()
        if not self._enabled:
            bg = "#C4D4E4"; hover = bg; press = bg; fg = "#FFFFFF"
        elif self._pressed:
            bg = press
        elif self._hovered:
            bg = hover
        elif self._breathing:
            bg = ACCENT_HI
        self.itemconfigure("bg", fill=bg, outline=bg)
        self.itemconfigure("txt", fill=fg, text=self._text)
        # line 类元素不支持 outline,逐项按类型设置
        for it in self.find_withtag("icn"):
            self.itemconfigure(it, fill=fg)
            if self.type(it) != "line":
                self.itemconfigure(it, outline=fg)
        try: self.itemconfigure("icn", fill=fg)
        except Exception: pass
        try: self.itemconfigure("icn", outline=fg)
        except Exception: pass
        self.configure(cursor="hand2" if self._enabled else "arrow")

    def set_text(self, text):
        self._base = text
        if not self._loading: self._text = text
        self._paint()

    def set_enabled(self, enabled):
        if self._enabled == enabled: return
        self._enabled = enabled
        # 禁用时保留 loading 文案，启动中按钮仍显示“启动中…”动画
        self._paint()

    def set_breathing(self, on):
        if self._breathing == on: return
        self._breathing = bool(on); self._paint()

    def set_loading(self, loading):
        self._loading = bool(loading); self._phase = 0
        self._text = self._base + (" ·" if loading else "")
        self._paint()
        if loading: self._tick_loading()

    def _tick_loading(self):
        if not self._loading or not self.winfo_exists(): return
        self._text = self._base + " " + ("." * (1 + (self._phase % 3)))
        self._phase += 1
        self._paint()
        self.after(420, self._tick_loading)

    def flash_success(self):
        self._flash = True
        self._old_text, self._old_icon = self._text, self._icon
        self._text = "✓ 已启动"
        self._paint()
        def restore():
            self._flash = False
            self._text, self._icon = self._old_text, self._old_icon
            self._paint()
        self.after(1500, restore)

    def _on_enter(self, e=None): self._hovered = True; self._paint()
    def _on_leave(self, e=None): self._hovered = False; self._pressed = False; self._paint()
    def _on_press(self, e=None): self._pressed = True; self._paint()
    def _on_release(self, e=None):
        was = self._pressed; self._pressed = False
        if was and self._enabled and not self._loading and self._command:
            self._command()
        self._paint()

class RoundedProgress(tk.Canvas):
    def __init__(self, master, height=8):
        super().__init__(master, height=height, width=1, bg=BG, highlightthickness=0, bd=0)
        self._pct = 0.0; self._active = False; self._indeterminate = False
        self._error = False; self._phase = 0.0; self._resize_job = None; self._tick_job = None
        self.bind("<Configure>", self._on_configure)
        self._layout()

    def _on_configure(self, e):
        if self._resize_job is not None:
            try: self.after_cancel(self._resize_job)
            except Exception: pass
        self._resize_job = self.after(45, self._layout)

    def _layout(self):
        self._resize_job = None
        self.delete("all")
        w = max(20, self.winfo_width()); h = max(6, self.winfo_height())
        self._pw, self._ph = w, h
        _rrect(self, 0, 0, w - 1, h - 1, (h - 1) / 2, "#CFE1F4", tags=("track",))
        _rrect(self, 0, 0, max(2, int((w - 2) * self._pct / 100)), h - 1,
               (h - 1) / 2, DANGER if self._error else ACCENT, tags=("fill",))
        self._draw_stripe()

    def _draw_stripe(self):
        self.delete("stripe")
        if not self._indeterminate or not self._active: return
        w, h = self._pw, self._ph
        span = max(52, w * 0.30)
        x = -span + (w + span) * (self._phase % 2.0) / 2.0
        self.create_rectangle(x, 1, x + span, h - 1, fill=ACCENT, outline=ACCENT, tags=("stripe",))

    def set_value(self, pct):
        self._pct = max(0, min(100, float(pct))); self._indeterminate = False
        self._active = True; self._error = False
        if not self._resize_job:
            self._layout()

    def set_indeterminate(self, on):
        self._indeterminate = bool(on); self._active = True; self._error = False
        if on:
            self._phase = 0; self._draw_stripe()
            if not self._tick_job: self._tick()
        else:
            self.delete("stripe")

    def set_error(self):
        self._error = True
        self.itemconfigure("fill", fill=DANGER)

    def reset(self):
        self._pct = 0; self._active = False; self._indeterminate = False; self._error = False
        self.delete("stripe")
        self.itemconfigure("fill", fill=ACCENT)
        self.coords("fill", 0, 0, 0, self._ph - 1)

    def _tick(self):
        if not self.winfo_exists(): self._tick_job = None; return
        if self._indeterminate and self._active:
            self._phase += 0.09
            self._draw_stripe()
            self._tick_job = self.after(30, self._tick)
        else:
            self._tick_job = None

class ServiceCard(tk.Canvas):
    STATUS = {
        "waiting":  ("#E9F1FA", "#7A8494", "#ADB6C2", "等待中"),
        "starting": ("#FFF3D9", "#A96A08", GOLD,       "启动中"),
        "running":  ("#E2F6EC", "#0E8052", ACCENT,     "运行中"),
        "stopping": ("#FDE9E1", "#C05621", "#F97316",  "停止中"),
        "error":    ("#FDE7E8", "#C53030", DANGER,     "失败"),
    }
    def __init__(self, master, svc, on_click=None):
        super().__init__(master, height=78, width=1, bg=BG, highlightthickness=0, bd=0)
        self.svc = svc; self._on_click = on_click
        self._status = "waiting"; self._detail = ""; self._phase = 0
        self._hovered = False; self._anim_job = None; self._resize_job = None
        self.bind("<Configure>", self._on_configure)
        self.bind("<Enter>", self._on_enter); self.bind("<Leave>", self._on_leave)
        self.bind("<Button-1>", lambda e: self._on_click and self._on_click(self.svc))
        self.configure(cursor="hand2")
        self._layout()

    def _on_configure(self, e):
        if self._resize_job is not None:
            try: self.after_cancel(self._resize_job)
            except Exception: pass
        self._resize_job = self.after(45, self._layout)

    def _layout(self):
        self._resize_job = None
        self.delete("all")
        w = max(48, self.winfo_width()); h = self.winfo_height()
        self._cw, self._ch = w, h
        _rrect(self, 0, 2, w - 1, h - 3, 14, CARD, outline=BORDER, width=1, tags=("bg",))
        cy = h / 2
        _rrect(self, 12, cy - 17, 46, cy + 17, 12, "#E5F3FF", tags=("bubble",))
        self.create_text(29, cy, text=_SERVICE_CODES.get(self.svc["name"], "??"),
                         font=("Consolas", 8, "bold"), fill=ACCENT, tags=("code",))
        self.create_text(54, cy - 9, text=self.svc["name"], font=F_CARD_N, fill=INK,
                         anchor="w", tags=("name",))
        self.create_text(54, cy + 9, text=f":{self.svc['port']}", font=F_CARD_P, fill=MUTED,
                         anchor="w", tags=("port",))
        self._pill_w = 64; self._pill_x = max(62, w - self._pill_w - 10)
        _rrect(self, self._pill_x, cy - 10, min(w - 8, self._pill_x + self._pill_w), cy + 10,
               10, "#E9F1FA", tags=("pill",))
        self.create_oval(self._pill_x + 6, cy - 4, self._pill_x + 14, cy + 4,
                         fill="#ADB6C2", outline="", tags=("dot",))
        self.create_oval(self._pill_x + 6, cy - 4, self._pill_x + 14, cy + 4,
                         outline="", tags=("ring",))
        self.create_text(self._pill_x + 20, cy, text="等待中", font=F_STAT, fill="#7A8494",
                         anchor="w", tags=("stxt",))
        self._paint()

    def _paint(self):
        if not self.winfo_exists(): return
        pill, fg, dot, label = self.STATUS[self._status]
        self.itemconfigure("bg", outline=_mix2(BORDER, ACCENT, 0.55) if self._hovered else BORDER)
        self.itemconfigure("bubble", fill=_mix2("#FFFFFF", dot, 0.14))
        self.itemconfigure("pill", fill=pill)
        self.itemconfigure("stxt", text=label, fill=fg)
        self.itemconfigure("code", fill=fg)

    def set_status(self, status, detail=""):
        if status not in self.STATUS: status = "waiting"
        if status == self._status and detail == self._detail: return
        self._status = status; self._detail = detail; self._phase = 0
        self._paint(); self._ensure_anim()

    def _ensure_anim(self):
        if self._status in ("starting", "stopping", "running") and not self._anim_job:
            self._animate()
        elif self._status in ("waiting", "error") and self._anim_job:
            self._anim_job = None

    def _animate(self):
        if self._status not in ("starting", "stopping", "running"):
            self._anim_job = None; return
        self.pulse(self._phase); self._phase += 1
        self._anim_job = self.after(500 if self._status == "running" else 800, self._animate)

    def pulse(self, tick):
        if not self.winfo_exists(): return
        cy = self._ch / 2
        st = self.STATUS[self._status]
        if self._status == "running":
            pulse = 3.2 + 1.4 * abs(math.sin(tick * 0.30))
            self.coords("ring", self._pill_x + 10 - pulse, cy - pulse,
                        self._pill_x + 10 + pulse, cy + pulse)
            self.itemconfigure("ring", outline=st[2])
            self.coords("dot", self._pill_x + 6, cy - 4, self._pill_x + 14, cy + 4)
            self.itemconfigure("dot", fill=st[2])
        elif self._status in ("starting", "stopping"):
            r = 4 if tick % 2 else 2.6
            self.coords("dot", self._pill_x + 10 - r, cy - r, self._pill_x + 10 + r, cy + r)
            self.itemconfigure("dot", fill=st[2])
            self.coords("ring", self._pill_x + 6, cy - 4, self._pill_x + 14, cy + 4)
            self.itemconfigure("ring", outline="")
        else:
            self.coords("dot", self._pill_x + 10 - 4, cy - 4, self._pill_x + 10 + 4, cy + 4)
            self.itemconfigure("dot", fill=st[2])

    def _on_enter(self, e=None): self._hovered = True; self._paint()
    def _on_leave(self, e=None): self._hovered = False; self._paint()

class HeaderBar(tk.Canvas):
    def __init__(self, master, logo_image=None, title="LXUP 龙虾优盘", subtitle="", height=72):
        super().__init__(master, height=height, width=1, bg=BG, highlightthickness=0, bd=0)
        self._logo = logo_image; self._title = title; self._subtitle = subtitle
        self._badge = "未启动"; self._badge_fg = "#7A8494"; self._badge_bg = "#E9F1FA"
        self._resize_job = None; self._float = 0
        self.bind("<Configure>", self._on_configure)
        self._layout()

    def _on_configure(self, e):
        if self._resize_job is not None:
            try: self.after_cancel(self._resize_job)
            except Exception: pass
        self._resize_job = self.after(45, self._layout)

    def _layout(self):
        self._resize_job = None
        self.delete("all")
        w = max(200, self.winfo_width()); h = self.winfo_height()
        _rrect(self, 0, 0, w - 1, h - 1, 16, CARD, outline=BORDER, width=1, tags=("bg",))
        if self._logo is not None:
            self.create_image(28, h / 2 + self._float, image=self._logo, tags=("logo",))
        else:
            _rrect(self, 9, h / 2 - 23 + self._float, 47, h / 2 + 23 + self._float, 11,
                   "#E5F3FF", outline="#C9DDF5", tags=("logo",))
            self.create_text(28, h / 2 + self._float, text="LX", font=("Consolas", 13, "bold"),
                             fill=ACCENT, tags=("logo",))
        self.create_text(62, h / 2 - 11 + self._float, text=self._title, font=F_TITLE,
                         fill=INK, anchor="w", tags=("logo",))
        self.create_text(62, h / 2 + 12 + self._float, text=self._subtitle, font=F_SUB,
                         fill=MUTED, anchor="w", tags=("logo",))
        bw = max(92, self.tk.call("font", "measure", F_STAT, self._badge) + 34)
        bx = w - bw - 18
        _rrect(self, bx, h / 2 - 13, w - 14, h / 2 + 13, 13, self._badge_bg,
               outline=_mix2(self._badge_bg, "#000000", 0.10), tags=("badge",))
        self.create_oval(bx + 12, h / 2 - 3, bx + 18, h / 2 + 3, fill=self._badge_fg,
                         outline="", tags=("bdot",))
        self.create_text(bx + 26, h / 2, text=self._badge, font=F_STAT, fill=self._badge_fg,
                         anchor="w", tags=("btxt",))

    def set_badge(self, text, fg, bg):
        if (text, fg, bg) == (self._badge, self._badge_fg, self._badge_bg): return
        self._badge, self._badge_fg, self._badge_bg = text, fg, bg
        self._layout()

    def float_logo(self, tick):
        self._float = 1 if tick % 2 else 0
        if self._logo is not None:
            self.move("logo", 0, 1 if tick % 2 else -1)
        else:
            self.move("logo", 0, 1 if tick % 2 else -1)

class RoundedConsole(tk.Canvas):
    def __init__(self, master):
        super().__init__(master, bg=BG, highlightthickness=0, bd=0)
        self.text = Text(self, font=F_LOG, bg=CONSOLE_BG, fg=CONSOLE_FG,
                         insertbackground="white", relief="flat", bd=0,
                         padx=10, pady=8, state="disabled", wrap="word")
        self.scroll = Scrollbar(self, command=self.text.yview)
        self.text.configure(yscrollcommand=self.scroll.set)
        self.text.tag_configure("info", foreground=CONSOLE_FG)
        self.text.tag_configure("ok", foreground="#4ADE80")
        self.text.tag_configure("warn", foreground="#FBBF24")
        self.text.tag_configure("err", foreground="#F87171")
        self._resize_job = None
        self.bind("<Configure>", self._on_configure)

    def _on_configure(self, e):
        if self._resize_job is not None:
            try: self.after_cancel(self._resize_job)
            except Exception: pass
        self._resize_job = self.after(45, self._layout)

    def _layout(self):
        self._resize_job = None
        self.delete("all")
        w = max(80, self.winfo_width()); h = max(60, self.winfo_height())
        _rrect(self, 0, 0, w - 1, h - 1, 14, CONSOLE_BD, tags=("bg",))
        _rrect(self, 1, 1, w - 2, h - 2, 13, CONSOLE_BG, tags=("bg2",))
        tw = max(40, w - 36); th = max(30, h - 18)
        self.create_window(14, 9, width=tw, height=th, window=self.text, anchor="nw", tags=("txtwin",))
        self.create_window(w - 18, 9, width=12, height=th, window=self.scroll, anchor="nw", tags=("sbwin",))

class LauncherApp:
    def __init__(self):
        self.root = Tk(); self.root.title("LXUP 启动器")
        self.root.geometry("860x660"); self.root.minsize(720, 560)
        self.root.configure(bg=BG)
        if os.path.isfile(ICON_PATH): self.root.iconbitmap(ICON_PATH)
        self.vi = load_version(); self.vs = self.vi.get("version", "unknown")
        self._busy = False; self._running_count = 0; self._front_open = False
        self._service_cards = {}; self._toast_win = None; self._logo = None
        self._loading_phase = 0; self._pulse_tick = 0; self._poll_stop = False
        self.svc = ServiceManager(self._log, self._on_service_progress)
        self._build_ui(); self._start_poll_thread()
        self._logo_float(); self._breathe_primary()
        self.root.update_idletasks()
        x = (self.root.winfo_screenwidth() - self.root.winfo_reqwidth()) // 2
        y = (self.root.winfo_screenheight() - self.root.winfo_reqheight()) // 2
        self.root.geometry(f"+{x}+{y}")

    # ── UI 构建 ──────────────────────────────────────────
    def _build_ui(self):
        outer = Frame(self.root, bg=BG)
        outer.pack(fill="both", expand=True, padx=16, pady=(10, 8))

        # 顶部圆角浅色卡 + 悬浮 logo
        self._load_logo()
        self._hdr = HeaderBar(outer, logo_image=self._logo, title="LXUP 龙虾优盘",
                              subtitle="多引擎 AI 控制台", height=72)
        self._hdr.pack(fill="x")

        # 四个圆角主按钮
        act = Frame(outer, bg=BG); act.pack(fill="x", pady=(12, 4))
        for i in range(4): act.grid_columnconfigure(i, weight=1, uniform="actions")
        self._bs = RoundedButton(act, "一键启动", command=self._on_start, tone="primary", icon="play", height=46)
        self._bk = RoundedButton(act, "停止全部", command=self._on_stop, tone="danger", icon="stop", height=46)
        self._bb = RoundedButton(act, "打开控制台", command=self._on_browser, tone="neutral", icon="globe", height=46)
        self._bu = RoundedButton(act, "检查更新", command=self._on_update, tone="subtle", icon="refresh", height=46)
        for i, b in enumerate((self._bs, self._bk, self._bb, self._bu)):
            b.grid(row=0, column=i, sticky="ew", padx=4)

        # 圆角细进度条
        pf = Frame(outer, bg=BG); pf.pack(fill="x", pady=(0, 2))
        plrow = Frame(pf, bg=BG); plrow.pack(fill="x")
        self._pl = Label(plrow, text="就绪", font=("Microsoft YaHei UI", 9, "bold"), bg=BG, fg=INK, anchor="w")
        self._pl.pack(side="left")
        self._pct = Label(plrow, text="", font=("Consolas", 9), bg=BG, fg=MUTED, anchor="e")
        self._pct.pack(side="right")
        self._pb = RoundedProgress(pf, height=8); self._pb.pack(fill="x", pady=(4, 0))

        # 服务卡片
        svch = Frame(outer, bg=BG); svch.pack(fill="x", pady=(8, 2))
        Label(svch, text="服务状态", font=("Microsoft YaHei UI", 11, "bold"), bg=BG, fg=INK).pack(anchor="w")
        self._svc_frame = Frame(outer, bg=BG); self._svc_frame.pack(fill="x", pady=(4, 6))
        for svc in SERVICES:
            self._service_cards[svc["name"]] = ServiceCard(
                self._svc_frame, svc, on_click=lambda s: self._on_service_click(s))
        self._svc_frame.bind("<Configure>", self._reflow_services)

        # 底部信息栏（先于日志区 pack）
        ft = Frame(outer, bg=BG); ft.pack(fill="x", side="bottom", pady=(6, 0))
        self._ft = Label(ft, text="单实例运行 · 点击服务卡片可复制端口",
                         font=F_FOOT, bg=BG, fg=MUTED)
        self._ft.pack(side="left")

        # 日志
        lf = Frame(outer, bg=BG); lf.pack(fill="both", expand=True, pady=(2, 0))
        lhead = Frame(lf, bg=BG); lhead.pack(fill="x")
        Label(lhead, text="运行日志", font=("Microsoft YaHei UI", 11, "bold"), bg=BG, fg=INK).pack(side="left")
        clear = Label(lhead, text="清空日志", font=("Microsoft YaHei UI", 8), bg=BG, fg=ACCENT,
                      cursor="hand2", padx=4, pady=2)
        clear.pack(side="right"); clear.bind("<Button-1>", lambda e: self._clear_logs())
        self._console = RoundedConsole(lf); self._console.pack(fill="both", expand=True, pady=(4, 0))
        self._lt = self._console.text
        self._log("  启动器就绪，等待操作")
        self._update_buttons()

    def _load_logo(self):
        if not os.path.isfile(ICON_PATH): return
        try:
            from PIL import Image, ImageTk
            img = Image.open(ICON_PATH).resize((44, 44), Image.LANCZOS)
            self._logo = ImageTk.PhotoImage(img)
        except Exception:
            self._logo = None

    def _update_header(self):
        if self._busy:
            badge, bg, fg = ("启动中" if self._busy == "start" else "停止中"), "#FFF3D9", "#A96A08"
        elif self._running_count == len(SERVICES):
            badge, bg, fg = "全部在线", "#E2F6EC", "#0E8052"
        elif self._running_count:
            badge, bg, fg = f"{self._running_count}/{len(SERVICES)} 在线", "#FFF3D9", "#A96A08"
        else:
            badge, bg, fg = "未启动", "#E9EDF3", "#7A8494"
        self._hdr.set_badge(badge, fg, bg)

    def _reflow_services(self, event):
        w = max(240, event.width - 8)
        cols = 5 if w >= 840 else (4 if w >= 680 else (3 if w >= 520 else 2))
        for i in range(cols): self._svc_frame.grid_columnconfigure(i, weight=1, uniform="svc")
        for i, svc in enumerate(SERVICES):
            card = self._service_cards[svc["name"]]
            card.grid_forget()
            card.grid(row=i // cols, column=i % cols, sticky="ew", padx=4, pady=4)

    # ── 后台轮询：端口检测完全不在 UI 线程做 ────────────────
    def _start_poll_thread(self):
        def loop():
            while not self._poll_stop:
                try:
                    busy_at_capture = self._busy
                    if not busy_at_capture:
                        flags = [(svc, port_open(svc["port"])) for svc in SERVICES]
                        front = port_open(FRONTEND_PORT)
                    else:
                        flags, front = [], self._front_open
                    self._ui(lambda flags=flags, front=front, b=busy_at_capture:
                             self._apply_poll(flags, front, b))
                except Exception:
                    pass
                time.sleep(2)
        threading.Thread(target=loop, daemon=True).start()

    def _apply_poll(self, flags, front, busy_at_capture=False):
        if self._poll_stop or self._busy or busy_at_capture: return
        self._running_count = sum(1 for _, running in flags if running)
        self._front_open = front
        for svc, running in flags:
            card = self._service_cards.get(svc["name"])
            if card: card.set_status("running" if running else "waiting")
        self._update_buttons(); self._update_header()

    def _update_buttons(self):
        all_running = self._running_count == len(SERVICES)
        self._bs.set_enabled(not self._busy and not all_running)
        self._bk.set_enabled(not self._busy and self._running_count > 0)
        self._bb.set_enabled(not self._busy and self._front_open)
        self._bu.set_enabled(not self._busy)

    # ── 线程安全 UI 调度 ─────────────────────────────────
    def _ui(self, fn):
        try: self.root.after(0, fn)
        except Exception: pass

    def _on_service_progress(self, name, phase):
        self._ui(lambda: self._apply_service_progress(name, phase))

    def _apply_service_progress(self, name, phase):
        card = self._service_cards.get(name)
        if not card: return
        card.set_status(phase)
        done = sum(1 for c in self._service_cards.values() if c._status == "running")
        n = len(self._service_cards)
        self._running_count = done
        if phase == "running":
            pct = done * 100 // n
            self._pb.set_value(pct)
            self._pl.configure(text=f"正在启动 {name}（{done}/{n}）")
            self._pct.configure(text=f"{pct}%")
            if done == n: self._pl.configure(text="全部服务已就绪")
        elif phase == "error":
            self._pb.set_value(0)
            self._pl.configure(text=f"{name} 启动失败，详见日志")
            self._pct.configure(text="")
        elif phase == "starting":
            self._pl.configure(text=f"正在启动 {name}…")
        self._update_header()

    # ── 启动 / 停止 ──────────────────────────────────────
    def _on_start(self):
        if self._busy: return
        self._busy = "start"; self._running_count = 0
        for card in self._service_cards.values(): card.set_status("waiting")
        self._pb.set_value(0)
        self._pl.configure(text="正在检查运行环境…"); self._pct.configure(text="")
        self._bs.set_loading(True); self._update_buttons(); self._update_header()
        def _do():
            py, fatals, warns = self.svc.preflight()
            for w in warns: self._log(f"  ⚠️ {w}")
            if fatals:
                for e in fatals: self._log(f"  ❌ {e}")
                self._ui(self._start_failed); return
            ok = self.svc.start_all(py)
            self._ui(lambda: self._start_finished(ok))
        threading.Thread(target=_do, daemon=True).start()

    def _start_failed(self):
        self._busy = False; self._running_count = 0
        self._bs.set_loading(False); self._pb.set_value(0)
        self._pl.configure(text="启动未完成，请查看日志"); self._pct.configure(text="")
        self._update_buttons(); self._update_header(); self._show_toast("启动失败，请查看日志", "error")

    def _start_finished(self, ok):
        self._busy = False; self._bs.set_loading(False)
        self._running_count = len(SERVICES) if ok else self._running_count
        self._front_open = port_open(FRONTEND_PORT)
        if ok:
            self._bs.flash_success()
            self._pb.set_value(100)
            self._pl.configure(text="全部服务已就绪"); self._pct.configure(text="100%")
            self._show_toast("全部服务已就绪，正在打开控制台", "ok")
            try:
                subprocess.Popen(["cmd", "/c", "start", "", FRONTEND_URL], creationflags=CNW)
                self._log(f"  🌐 已打开浏览器：{FRONTEND_URL}")
            except Exception as e:
                self._log(f"  ❌ 打开浏览器失败：{e}")
        self._update_buttons(); self._update_header()

    def _on_stop(self):
        if self._busy: return
        self._busy = "stop"
        for card in self._service_cards.values():
            if card._status == "running": card.set_status("stopping")
        self._pb.set_indeterminate(True)
        self._pl.configure(text="正在停止全部服务…"); self._pct.configure(text="")
        self._bk.set_loading(True); self._update_buttons(); self._update_header()
        def _do():
            self.svc.stop_all()
            self._ui(self._stop_finished)
        threading.Thread(target=_do, daemon=True).start()

    def _stop_finished(self):
        self._busy = False; self._running_count = 0; self._front_open = False
        self._bk.set_loading(False); self._pb.set_value(0)
        for card in self._service_cards.values(): card.set_status("waiting")
        self._pl.configure(text="已全部停止"); self._pct.configure(text="")
        self._update_buttons(); self._update_header(); self._show_toast("服务已全部停止", "ok")

    def _on_service_click(self, svc):
        try:
            self.root.clipboard_clear(); self.root.clipboard_append(f"127.0.0.1:{svc['port']}")
            self._show_toast(f"已复制 127.0.0.1:{svc['port']}", "info")
        except Exception as e:
            self._log(f"  ⚠️ 复制端口失败: {e}")

    # ── 控制台 / 更新 ────────────────────────────────────
    def _on_browser(self):
        if self._busy: return
        try:
            subprocess.Popen(["cmd", "/c", "start", "", FRONTEND_URL], creationflags=CNW)
            self._log(f"  🌐 已打开浏览器：{FRONTEND_URL}")
        except Exception as e:
            self._log(f"  ❌ 打开浏览器失败：{e}")

    def _on_update(self):
        if self._busy: return
        self._bu.set_loading(True); self._bs.set_enabled(False); self._bk.set_enabled(False)
        def _do():
            um = UpdateManager(self.vi, self._log, self._prog)
            data = um.check_update()
            def _review():
                self._bu.set_loading(False)
                self._bs.set_enabled(True); self._bk.set_enabled(True)
                if not data: return
                sv = data.get("version", ""); cl = data.get("changelog", ""); mv = data.get("min_version", "0.0.0")
                pkgs = data.get("packages", {}); dp = pkgs.get("patch", {}); pc = pkgs.get("patch_chain", [])
                if UpdateManager._vcmp(self.vs, mv) < 0: ut = "full"
                elif dp and dp.get("from") == self.vs: ut = "patch"
                elif pc and pc[0].get("from") == self.vs and len(pc) <= 3: ut = "chain"
                else: ut = "full"
                mm = {"full": "全量下载", "patch": "增量更新", "chain": f"增量链（{len(pc)} 步）"}
                msg = f"发现新版本：{sv}\n\n当前版本：{self.vs}\n更新方式：{mm.get(ut, ut)}\n\n更新内容：\n{cl}"
                if messagebox.askyesno("发现新版本", msg, parent=self.root): self._do_update(ut, data)
            self._ui(_review)
        threading.Thread(target=_do, daemon=True).start()

    def _prog(self, pct, msg):
        def _do():
            if pct is None:
                self._pb.set_indeterminate(True)
                self._pct.configure(text="")
            else:
                self._pb.set_value(pct)
                self._pct.configure(text=f"{round(pct)}%")
            self._pl.configure(text=msg)
        self._ui(_do)

    def _do_update(self, ut, data):
        self._bs.set_enabled(False); self._bk.set_enabled(False); self._bu.set_enabled(False)
        def _do():
            um = UpdateManager(self.vi, self._log, self._prog); pkgs = data.get("packages", {})
            if ut == "patch":
                pkg = pkgs.get("patch", {}); url = pkg.get("url", ""); sha = pkg.get("sha256", "")
            elif ut == "chain":
                for step in pkgs.get("patch_chain", []):
                    url = step.get("url", ""); sha = step.get("sha256", "")
                    self._log(f"  📦 正在应用补丁 {step.get('from')} → {step.get('to')}...")
                    tmp = um.download_file(url, sha, step.get("size", 0))
                    if not tmp: self._log("  ❌ 补丁下载失败"); self._ui(self._restore); return
                    if not um.apply_update(tmp, False): self._log("  ❌ 补丁应用失败"); self._ui(self._restore); return
                    self._log(f"  ✅ 补丁 {step.get('from')} → {step.get('to')} 已应用")
                self._save_ver(data.get("version", ""))
                self._log(f"  🎉 更新完成！新版本：v{data.get('version')}"); self._ui(self._done); return
            else:
                pkg = pkgs.get("full", {}); url = pkg.get("url", ""); sha = pkg.get("sha256", "")
            if not url: self._log("  ❌ 未找到更新包地址"); self._ui(self._restore); return
            tmp = um.download_file(url, sha, pkg.get("size", 0))
            if not tmp: self._log("  ❌ 下载失败"); self._ui(self._restore); return
            if um.apply_update(tmp, True):
                self._save_ver(data.get("version", ""))
                self._log(f"  🎉 更新完成！新版本：v{data.get('version')}"); self._log("  🔄 请关闭并重新启动启动器")
                self._ui(self._done)
            else:
                self._log("  ❌ 更新失败"); self._ui(self._restore)
        threading.Thread(target=_do, daemon=True).start()

    def _save_ver(self, v):
        try:
            d = load_version(); d["version"] = v; d["build_date"] = datetime.now().strftime("%Y-%m-%d")
            os.makedirs(os.path.dirname(VERSION_FILE), exist_ok=True)
            with open(VERSION_FILE, "w", encoding="utf-8") as f: json.dump(d, f, ensure_ascii=False, indent=2)
        except Exception as e:
            self._log(f"  ⚠️ 保存版本号失败：{e}")

    def _restore(self):
        self._pb.set_value(0)
        self._pl.configure(text="就绪"); self._pct.configure(text="")
        self._bs.set_enabled(True); self._bk.set_enabled(True)
        self._bu.set_enabled(True); self._bu.set_loading(False)
        self._update_buttons(); self._update_header()

    def _done(self):
        self._restore(); self.vi = load_version(); self.vs = self.vi.get("version", "unknown")
        self._ft.configure(text=f"版本 {self.vs} | 更新完成，请重启")
        messagebox.showinfo("更新完成", f"已更新到 v{self.vs}\n请关闭并重新启动启动器。", parent=self.root)

    # ── 轻量动画：只改 Label 文字/颜色，不重绘 Canvas ─────
    def _logo_float(self):
        try:
            self._logo_tick = getattr(self, "_logo_tick", 0) + 1
            self._hdr.float_logo(self._logo_tick)
            self.root.after(900, self._logo_float)
        except Exception:
            try: self.root.after(900, self._logo_float)
            except Exception: pass

    def _breathe_primary(self):
        try:
            self._breath_tick = getattr(self, "_breath_tick", 0) + 1
            idle = (not self._busy and getattr(self._bs, "_enabled", False)
                    and not getattr(self._bs, "_loading", False))
            self._bs.set_breathing(bool(idle and self._breath_tick % 2 == 0))
            self.root.after(1200, self._breathe_primary)
        except Exception:
            try: self.root.after(1200, self._breathe_primary)
            except Exception: pass


    # ── 日志 / Toast ─────────────────────────────────────
    def _log(self, msg):
        def _do():
            try:
                low = msg.lower()
                if "❌" in msg or "失败" in msg or "error" in low or "不存在" in msg:
                    tag = "err"
                elif "⚠" in msg or "警告" in msg or "warn" in low:
                    tag = "warn"
                elif "✅" in msg or "ready" in low or "就绪" in msg or "启动成功" in msg or "启动器" in msg:
                    tag = "ok"
                else:
                    tag = "info"
                self._lt.configure(state="normal")
                self._lt.insert("end", f"[{time.strftime('%H:%M:%S')}] {msg}\n", tag)
                if int(self._lt.index("end-1c").split(".")[0]) > 1200:
                    self._lt.delete("1.0", "100.0")
                self._lt.see("end"); self._lt.configure(state="disabled")
            except Exception:
                pass
        try: self.root.after(0, _do)
        except Exception: pass

    def _clear_logs(self):
        try:
            self._lt.configure(state="normal"); self._lt.delete("1.0", "end")
            self._lt.configure(state="disabled")
        except Exception: pass

    def _show_toast(self, msg, kind="info"):
        try:
            if self._toast_win is not None and self._toast_win.winfo_exists():
                self._toast_win.destroy()
        except Exception: pass
        top = Toplevel(self.root); top.overrideredirect(True); top.attributes("-topmost", True)
        color = {"ok": ACCENT, "error": DANGER, "info": "#3B82F6"}.get(kind, ACCENT)
        Label(top, text=f"  {msg}  ", font=("Microsoft YaHei UI", 9, "bold"),
              bg=color, fg="#FFFFFF", padx=12, pady=8).pack()
        top.update_idletasks()
        w = top.winfo_reqwidth(); h = top.winfo_reqheight()
        x = self.root.winfo_rootx() + self.root.winfo_width() - w - 18
        y = self.root.winfo_rooty() + self.root.winfo_height() - h - 18
        top.geometry(f"{w}x{h}+{max(0, x)}+{max(0, y)}")
        self._toast_win = top
        def close():
            try: top.destroy()
            except Exception: pass
            self._toast_win = None
        self.root.after(1800, close)

    def run(self):
        try:
            self.root.mainloop()
        finally:
            self._poll_stop = True
def main():
    if not acquire_lock():
        messagebox.showwarning("LXUP 启动器", "另一个启动器实例正在运行，请勿重复启动。"); return 1
    LauncherApp().run(); return 0

if __name__ == "__main__":
    sys.exit(main())
