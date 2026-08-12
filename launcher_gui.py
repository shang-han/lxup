#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""LXUP Launcher - Tkinter GUI v3"""

import hashlib, json, os, shutil, socket, subprocess, sys, tempfile, threading, time, zipfile
from datetime import datetime
from tkinter import Tk, Frame, Label, Button, Text, Canvas, Scrollbar, messagebox, ttk
import requests

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
    def __init__(self, log_cb): self.log = log_cb; self.processes = []
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
    def stop_all(self):
        stopped = 0
        for proc in reversed(self.processes):
            if proc is None or proc.poll() is not None: continue
            try:
                subprocess.run(["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                               check=False, creationflags=CNW); stopped += 1
                self.log(f"  ⏹ 已停止 PID {proc.pid}")
            except Exception as e: self.log(f"  ⚠️ 停止 PID {proc.pid} 失败: {e}")
        self.processes.clear()
        self.log(f"  共停止 {stopped} 个进程" if stopped else "  没有运行中的进程")
    def start_all(self, py):
        os.makedirs(LOG_DIR, exist_ok=True); env = self.base_env(); self.processes.clear()
        def launch(name, argv, cwd, se, lf, port, timeout=60):
            proc = self.spawn(name, argv, cwd, se, lf)
            if proc is None: return False
            if not self.wait_for_port(port, proc, timeout):
                self.log(f"  ❌ {name} 未在端口 {port} 上监听"); self.stop_all(); return False
            self.log(f"  ✅ {name} 就绪: 127.0.0.1:{port}"); return True
        if not launch("Sidecar", [py, "-m", "sidecar.main", "--db-path",
                       os.path.join(RUNTIME, "data", "gateway.db"),
                       "--port", str(SIDECAR_PORT)],
                       cwd=ROOT, se=env, lf="sidecar.log", port=SIDECAR_PORT): return False
        if os.path.isfile(OPENCLAW_ENTRY) and os.path.isfile(NODE):
            ge = dict(env); ge["PATH"] = os.path.dirname(py) + os.pathsep + ge.get("PATH", "")
            if not launch("OpenClaw", [NODE, OPENCLAW_ENTRY, "gateway", "--port", "18789", "--force"],
                          cwd=ROOT, se=ge, lf="openclaw-gateway.log", port=18789, timeout=120): return False
        hh = os.path.join(RUNTIME, "hermes-home"); os.makedirs(hh, exist_ok=True)
        he = dict(env); he["PATH"] = os.path.dirname(py) + os.pathsep + he.get("PATH", "")
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
            r = requests.get(UPDATE_URL, timeout=15, headers={"User-Agent": f"LXUP/{self.cv}"})
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
    def download_file(self, url, sha256=""):
        td = tempfile.mkdtemp(prefix="lxup_update_"); tf = os.path.join(td, "update.zip")
        self.log("   正在下载...")
        try:
            r = requests.get(url, stream=True, timeout=300, headers={"User-Agent": f"LXUP/{self.cv}"})
            r.raise_for_status(); total = int(r.headers.get("content-length", 0)); dl = 0
            with open(tf, "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk); dl += len(chunk)
                    if total > 0: self.prog(int(dl * 100 / total), f"下载中 {dl // 1024}KB / {total // 1024}KB")
            if sha256:
                actual = sha256_file(tf)
                if actual.lower() != sha256.lower(): self.log("  ❌ SHA256 校验失败"); os.remove(tf); return None
                self.log("  ✅ 文件校验通过")
            return tf
        except Exception as e:
            self.log(f"  ❌ 下载失败: {e}")
            if os.path.isfile(tf): os.remove(tf)
            return None
    def apply_update(self, zp, full=True):
        self.log("  📦 正在解压更新包..."); self.prog(0, "解压中...")
        preserve = {os.path.join(RUNTIME, "openclaw-home"), os.path.join(RUNTIME, "hermes-home"),
                    os.path.join(RUNTIME, "codex-home"), LOG_DIR}
        try:
            with zipfile.ZipFile(zp, "r") as zf:
                members = zf.namelist(); total = len(members)
                for i, m in enumerate(members):
                    if any(os.path.join(ROOT, m).startswith(p) for p in preserve): continue
                    target = os.path.join(ROOT, m)
                    if m.endswith("/"): os.makedirs(target, exist_ok=True)
                    else:
                        os.makedirs(os.path.dirname(target), exist_ok=True)
                        with zf.open(m) as src, open(target, "wb") as dst: dst.write(src.read())
                    self.prog(int((i + 1) * 100 / total) if total else 100, f"解压中 {i + 1}/{total}")
            self.log("  ✅ 更新包解压完成")
            try: shutil.rmtree(os.path.dirname(zp))
            except: pass
            return True
        except Exception as e: self.log(f"  ❌ 解压更新包失败: {e}"); return False

class LauncherApp:
    def __init__(self):
        self.root = Tk(); self.root.title("LXUP 启动器"); self.root.geometry("680x720")
        self.root.resizable(False, False); self.root.configure(bg="#f5f5f5")
        if os.path.isfile(ICON_PATH): self.root.iconbitmap(ICON_PATH)
        self.vi = load_version(); self.vs = self.vi.get("version", "unknown")
        self.svc = ServiceManager(self._log); self._running = False
        self._build_ui(); self._poll()
        self.root.update_idletasks()
        x = (self.root.winfo_screenwidth() - self.root.winfo_reqwidth()) // 2
        y = (self.root.winfo_screenheight() - self.root.winfo_reqheight()) // 2
        self.root.geometry(f"+{x}+{y}")

    def _build_ui(self):
        style = ttk.Style(); style.theme_use("clam")
        hdr = Frame(self.root, bg="#2c3e50", height=70); hdr.pack(fill="x"); hdr.pack_propagate(False)
        if os.path.isfile(ICON_PATH):
            try:
                from PIL import Image, ImageTk
                img = Image.open(ICON_PATH).resize((48, 48), Image.LANCZOS)
                self._ip = ImageTk.PhotoImage(img)
                Label(hdr, image=self._ip, bg="#2c3e50").pack(side="left", padx=16, pady=11)
            except: pass
        tf = Frame(hdr, bg="#2c3e50"); tf.pack(side="left", fill="y", expand=True); tf.pack_propagate(False)
        Label(tf, text="LXUP 龙虾优盘", font=("Microsoft YaHei UI", 18, "bold"), fg="#fff", bg="#2c3e50").pack(anchor="w", pady=(12, 0))
        Label(tf, text=f"v{self.vs} | 多引擎 AI 控制台", font=("Microsoft YaHei UI", 9), fg="#aab7c4", bg="#2c3e50").pack(anchor="w")
        sf = Frame(self.root, bg="#f5f5f5"); sf.pack(fill="x", padx=20, pady=(16, 8))
        Label(sf, text="服务状态", font=("Microsoft YaHei UI", 12, "bold"), bg="#f5f5f5", fg="#2c3e50").pack(anchor="w")
        self._cv = Canvas(sf, bg="#fff", highlightbackground="#e0e0e0", highlightthickness=1, height=180)
        self._cv.pack(fill="x", pady=4)
        bf = Frame(self.root, bg="#f5f5f5"); bf.pack(fill="x", padx=20, pady=8)
        self._bs = Button(bf, text="▶ 启动全部", font=("Microsoft YaHei UI", 11, "bold"), bg="#27ae60", fg="white",
                           relief="flat", bd=0, padx=20, pady=8, cursor="hand2", command=self._on_start)
        self._bs.pack(side="left", padx=(0, 8))
        self._bk = Button(bf, text=" 停止全部", font=("Microsoft YaHei UI", 11, "bold"), bg="#c0392b", fg="white",
                           relief="flat", bd=0, padx=20, pady=8, cursor="hand2", command=self._on_stop)
        self._bk.pack(side="left", padx=(0, 8))
        self._bb = Button(bf, text="🌐 打开控制台", font=("Microsoft YaHei UI", 11), bg="#3498db", fg="white",
                           relief="flat", bd=0, padx=16, pady=8, cursor="hand2", command=self._on_browser)
        self._bb.pack(side="left")
        self._bu = Button(bf, text="🔄 检查更新", font=("Microsoft YaHei UI", 11), bg="#8e44ad", fg="white",
                           relief="flat", bd=0, padx=16, pady=8, cursor="hand2", command=self._on_update)
        self._bu.pack(side="right")
        self._pf = Frame(self.root, bg="#f5f5f5"); self._pf.pack(fill="x", padx=20); self._pf.pack_forget()
        self._pb = ttk.Progressbar(self._pf, mode="determinate", maximum=100); self._pb.pack(fill="x", pady=2)
        self._pl = Label(self._pf, text="", font=("Microsoft YaHei UI", 9), bg="#f5f5f5", fg="#666"); self._pl.pack(anchor="w")
        lf = Frame(self.root, bg="#f5f5f5"); lf.pack(fill="both", expand=True, padx=20, pady=(8, 12))
        Label(lf, text="运行日志", font=("Microsoft YaHei UI", 12, "bold"), bg="#f5f5f5", fg="#2c3e50").pack(anchor="w")
        li = Frame(lf, bg="#1e1e1e"); li.pack(fill="both", expand=True, pady=4)
        self._lt = Text(li, font=("Consolas", 9), bg="#1e1e1e", fg="#d4d4d4", insertbackground="white",
                         relief="flat", bd=0, padx=8, pady=8, state="disabled")
        ls = Scrollbar(li, command=self._lt.yview); self._lt.configure(yscrollcommand=ls.set)
        ls.pack(side="right", fill="y"); self._lt.pack(side="left", fill="both", expand=True)
        ft = Frame(self.root, bg="#ecf0f1", height=28); ft.pack(fill="x", side="bottom"); ft.pack_propagate(False)
        self._ft = Label(ft, text=f"版本 {self.vs} | 就绪", font=("Microsoft YaHei UI", 8), bg="#ecf0f1", fg="#7f8c8d")
        self._ft.pack(side="left", padx=12)

    def _log(self, msg):
        def _do():
            self._lt.configure(state="normal")
            self._lt.insert("end", f"[{time.strftime('%H:%M:%S')}] {msg}\n")
            self._lt.see("end"); self._lt.configure(state="disabled")
        self.root.after(0, _do)

    def _poll(self):
        self._cv.delete("all"); w = self._cv.winfo_width() or 640
        for i, svc in enumerate(SERVICES):
            running = port_open(svc["port"]); y = i * 34 + 4
            color = "#27ae60" if running else "#bdc3c7"
            self._cv.create_oval(16, y + 6, 28, y + 18, fill=color, outline="")
            self._cv.create_text(40, y + 12, anchor="w", text=svc["name"], font=("Segoe UI", 10), fill="#2c3e50")
            self._cv.create_text(200, y + 12, anchor="w", text=f":{svc['port']}", font=("Consolas", 9), fill="#95a5a6")
            st = "运行中" if running else "已停止"; sc = "#27ae60" if running else "#95a5a6"
            self._cv.create_text(w - 60, y + 12, anchor="e", text=st, font=("Segoe UI", 9, "bold"), fill=sc)
            if i < len(SERVICES) - 1: self._cv.create_line(16, y + 34, w - 16, y + 34, fill="#ecf0f1")
        self.root.after(2000, self._poll)

    def _on_start(self):
        if self._running: self._log("  ⚠️ 服务已在运行中"); return
        self._running = True; self._bs.configure(state="disabled", text=" 启动中...")
        def _do():
            py, fatals, warns = self.svc.preflight()
            for w in warns: self._log(f"  ⚠️ {w}")
            if fatals:
                for e in fatals: self._log(f"  ❌ {e}")
                self._log("  ❌ 前置检查不通过，无法启动")
                self.root.after(0, lambda: self._bs.configure(state="normal", text="▶ 启动全部"))
                self._running = False; return
            ok = self.svc.start_all(py)
            self.root.after(0, lambda: self._bs.configure(state="normal", text="▶ 启动全部"))
            if ok:
                try:
                    subprocess.Popen(["cmd", "/c", "start", "", FRONTEND_URL], creationflags=CNW)
                    self._log(f"  🌐 已打开浏览器：{FRONTEND_URL}")
                except: pass
            self._running = False
        threading.Thread(target=_do, daemon=True).start()

    def _on_stop(self): self.svc.stop_all()

    def _on_browser(self):
        try:
            subprocess.Popen(["cmd", "/c", "start", "", FRONTEND_URL], creationflags=CNW)
            self._log(f"  🌐 已打开浏览器：{FRONTEND_URL}")
        except Exception as e: self._log(f"  ❌ 打开浏览器失败：{e}")

    def _on_update(self):
        self._bu.configure(state="disabled", text="检查中...")
        def _do():
            um = UpdateManager(self.vi, self._log, self._prog)
            data = um.check_update()
            self.root.after(0, lambda: self._bu.configure(state="normal", text="🔄 检查更新"))
            if not data: return
            sv = data.get("version", ""); cl = data.get("changelog", ""); mv = data.get("min_version", "0.0.0")
            pkgs = data.get("packages", {}); dp = pkgs.get("patch", {}); pc = pkgs.get("patch_chain", [])
            if UpdateManager._vcmp(self.vs, mv) < 0: ut = "full"
            elif dp and dp.get("from") == self.vs: ut = "patch"
            elif pc and pc[0].get("from") == self.vs and len(pc) <= 3: ut = "chain"
            else: ut = "full"
            mm = {"full": "全量下载", "patch": "增量更新", "chain": f"增量链（{len(pc)} 步）"}
            msg = f"发现新版本：{sv}\n\n当前版本：{self.vs}\n更新方式：{mm.get(ut, ut)}\n\n更新内容：\n{cl}"
            if messagebox.askyesno("发现新版本", msg, parent=self.root):
                self._do_update(ut, data)
        threading.Thread(target=_do, daemon=True).start()

    def _prog(self, pct, msg):
        def _do(): self._pf.pack(fill="x", padx=20); self._pb["value"] = pct; self._pl.configure(text=msg)
        self.root.after(0, _do)

    def _do_update(self, ut, data):
        self._bs.configure(state="disabled"); self._bk.configure(state="disabled")
        self._bu.configure(state="disabled")
        def _do():
            um = UpdateManager(self.vi, self._log, self._prog); pkgs = data.get("packages", {})
            if ut == "patch":
                pkg = pkgs.get("patch", {}); url = pkg.get("url", ""); sha = pkg.get("sha256", "")
            elif ut == "chain":
                for step in pkgs.get("patch_chain", []):
                    url = step.get("url", ""); sha = step.get("sha256", "")
                    self._log(f"  📦 正在应用补丁 {step.get('from')} → {step.get('to')}...")
                    tmp = um.download_file(url, sha)
                    if not tmp: self._log("  ❌ 补丁下载失败"); self.root.after(0, self._restore); return
                    if not um.apply_update(tmp, False): self._log("  ❌ 补丁应用失败"); self.root.after(0, self._restore); return
                    self._log(f"  ✅ 补丁 {step.get('from')} → {step.get('to')} 已应用")
                self._save_ver(data.get("version", ""))
                self._log(f"  🎉 更新完成！新版本：v{data.get('version')}"); self.root.after(0, self._done); return
            else:
                pkg = pkgs.get("full", {}); url = pkg.get("url", ""); sha = pkg.get("sha256", "")
            if not url: self._log("  ❌ 未找到更新包地址"); self.root.after(0, self._restore); return
            tmp = um.download_file(url, sha)
            if not tmp: self._log("  ❌ 下载失败"); self.root.after(0, self._restore); return
            if um.apply_update(tmp, True):
                self._save_ver(data.get("version", ""))
                self._log(f"  🎉 更新完成！新版本：v{data.get('version')}"); self._log("  🔄 请关闭并重新启动启动器")
                self.root.after(0, self._done)
            else: self._log("  ❌ 更新失败"); self.root.after(0, self._restore)
        threading.Thread(target=_do, daemon=True).start()

    def _save_ver(self, v):
        try:
            d = load_version(); d["version"] = v; d["build_date"] = datetime.now().strftime("%Y-%m-%d")
            os.makedirs(os.path.dirname(VERSION_FILE), exist_ok=True)
            with open(VERSION_FILE, "w", encoding="utf-8") as f: json.dump(d, f, ensure_ascii=False, indent=2)
        except Exception as e: self._log(f"  ⚠️ 保存版本号失败：{e}")

    def _restore(self):
        self._bs.configure(state="normal", text="▶ 启动全部")
        self._bk.configure(state="normal"); self._bu.configure(state="normal", text="🔄 检查更新")
        self._pf.pack_forget()

    def _done(self):
        self._restore(); self.vi = load_version(); self.vs = self.vi.get("version", "unknown")
        self._ft.configure(text=f"版本 {self.vs} | 更新完成，请重启")
        messagebox.showinfo("更新完成", f"已更新到 v{self.vs}\n请关闭并重新启动启动器。", parent=self.root)

    def run(self): self.root.mainloop()

def main():
    if not acquire_lock():
        messagebox.showwarning("LXUP 启动器", "另一个启动器实例正在运行，请勿重复启动。"); return 1
    LauncherApp().run(); return 0

if __name__ == "__main__":
    sys.exit(main())
