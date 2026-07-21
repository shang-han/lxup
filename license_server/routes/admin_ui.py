"""
管理后台 Web UI — GET /admin?token=xxx

管理员专属，普通用户访问 /admin 收到 403，不知道此入口存在。
URL 传入 token 后自动认证，无需手动登录。
"""

from fastapi import APIRouter, Query, Request
from fastapi.responses import HTMLResponse, Response

from ..config import LicenseServerConfig

router = APIRouter(tags=["admin-ui"])

ADMIN_HTML = r"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>License Server — 管理后台</title>
<style>
  :root{--bg:#0f1117;--card:#1a1d27;--border:#2a2d3a;--text:#e1e4ed;--muted:#8b8fa3;--accent:#6c8aff;--danger:#f04770;--success:#2ecc71;--warn:#f0a040;--radius:8px}
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:var(--bg);color:var(--text);min-height:100vh}
  .container{max-width:1100px;margin:0 auto;padding:24px}
  header{display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;padding-bottom:16px;border-bottom:1px solid var(--border)}
  header h1{font-size:22px;font-weight:700}
  button{background:var(--accent);color:#fff;border:none;padding:8px 18px;border-radius:var(--radius);cursor:pointer;font-size:14px;font-weight:500}
  button:hover{opacity:.85}
  button:disabled{opacity:.5;cursor:not-allowed}
  button.danger{background:var(--danger)}
  button.small{padding:4px 10px;font-size:12px}
  input,select{background:var(--bg);color:var(--text);border:1px solid var(--border);padding:8px 12px;border-radius:var(--radius);font-size:14px;outline:none}
  input:focus,select:focus{border-color:var(--accent)}
  .login-box{max-width:400px;margin:120px auto;background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:32px}
  .login-box h2{margin-bottom:20px}
  .login-box input{width:100%;margin-bottom:12px;padding:10px 14px}
  .login-box button{width:100%;padding:10px}
  .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px}
  .stat-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:18px}
  .stat-card .label{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.5px}
  .stat-card .value{font-size:28px;font-weight:700;margin-top:4px}
  .stat-card.active .value{color:var(--accent)}
  .stat-card.used .value{color:var(--warn)}
  .stat-card.revoked .value{color:var(--danger)}
  .panel{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:20px}
  .panel h3{font-size:16px;margin-bottom:16px}
  .row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px}
  .row>*{flex:1;min-width:120px}
  table{width:100%;border-collapse:collapse}
  th,td{padding:10px 12px;text-align:left;border-bottom:1px solid var(--border);font-size:13px}
  th{color:var(--muted);font-weight:600;font-size:12px;text-transform:uppercase}
  .badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600}
  .badge.active{background:rgba(108,138,255,.15);color:var(--accent)}
  .badge.used{background:rgba(240,160,64,.15);color:var(--warn)}
  .badge.revoked{background:rgba(240,71,112,.15);color:var(--danger)}
  .hidden{display:none!important}
  .empty{text-align:center;padding:40px;color:var(--muted)}
  .pagination{display:flex;gap:8px;justify-content:center;margin-top:16px}
  .pagination button{min-width:32px}
  .generated-codes{background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);padding:14px;margin-top:12px;max-height:300px;overflow:auto}
  .generated-codes .code{font-family:"SF Mono","Fira Code",monospace;font-size:14px;padding:4px 0;letter-spacing:1px;user-select:all;cursor:pointer}
  .code:hover{background:var(--border)}
  .toast{position:fixed;top:20px;right:20px;padding:12px 20px;background:var(--card);border:1px solid var(--border);border-radius:var(--radius);font-size:13px;z-index:1000}
  #loginErr{color:var(--danger);font-size:13px;margin-top:8px}
</style>
</head>
<body>

<!-- 登录界面（仅当未通过 URL 传 token 时显示） -->
<div id="loginBox" class="login-box hidden">
  <h2>License Server</h2>
  <p style="color:var(--muted);font-size:13px;margin-bottom:16px">请输入管理令牌</p>
  <input type="password" id="tokenInput" placeholder="Admin Token" autocomplete="off">
  <button id="loginBtn">登 录</button>
  <div id="loginErr"></div>
</div>

<!-- 主界面 -->
<div id="app" class="container hidden">
  <header>
    <h1>License Server 管理后台</h1>
    <button class="small" id="logoutBtn">退出</button>
  </header>

  <div class="stats" id="stats"></div>

  <div class="panel">
    <h3>生成激活码</h3>
    <div class="row">
      <input type="number" id="genCount" value="10" min="1" max="100" placeholder="数量">
      <input type="text" id="genBatch" placeholder="批次标识 (可选)">
      <input type="text" id="genNote" placeholder="备注 (可选)">
      <button id="genBtn">生成</button>
    </div>
    <div id="genResult" class="generated-codes hidden"></div>
  </div>

  <div class="panel">
    <h3>激活码列表</h3>
    <div class="row">
      <select id="filterStatus">
        <option value="">全部状态</option>
        <option value="active">未使用</option>
        <option value="used">已使用</option>
        <option value="revoked">已吊销</option>
      </select>
      <input type="text" id="filterBatch" placeholder="搜索批次...">
      <button id="refreshBtn">刷新</button>
    </div>
    <table>
      <thead><tr><th>前缀</th><th>状态</th><th>批次</th><th>绑定设备</th><th>备注</th><th>生成时间</th><th>操作</th></tr></thead>
      <tbody id="codeTable"></tbody>
    </table>
    <div class="pagination" id="pagination"></div>
  </div>
</div>

<script>
(function(){
  "use strict";

  // ── 初始化：从 URL 或 localStorage 获取 token ──
  var TOKEN = "";
  var URL_TOKEN = new URLSearchParams(window.location.search).get("token") || "";

  function getToken() {
    if (TOKEN) return TOKEN;
    try { TOKEN = localStorage.getItem("lx_admin_token") || ""; } catch(e) {}
    return TOKEN;
  }
  function setToken(t) {
    TOKEN = t;
    try { localStorage.setItem("lx_admin_token", t); } catch(e) {}
  }
  function clearToken() {
    TOKEN = "";
    try { localStorage.removeItem("lx_admin_token"); } catch(e) {}
  }

  // URL 传入 token → 自动设置
  if (URL_TOKEN) {
    setToken(URL_TOKEN);
    // 清理 URL 中的 token，避免泄露在浏览器历史
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }

  // ── DOM 引用 ──
  var $ = function(id){ return document.getElementById(id); };
  var loginBox = $("loginBox");
  var appDiv = $("app");
  var loginErr = $("loginErr");
  var codeTable = $("codeTable");
  var genResult = $("genResult");

  // ── API 调用 ──
  function api(method, path, body) {
    var opts = { method: method, headers: { "Authorization": "Bearer " + getToken() } };
    if (body) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }
    return fetch(path, opts).then(function(r) {
      if (!r.ok) {
        return r.json().then(function(d) { throw new Error(d.detail || "HTTP " + r.status); });
      }
      return r.json();
    });
  }

  // ── 显示/隐藏 ──
  function showApp() {
    loginBox.classList.add("hidden");
    appDiv.classList.remove("hidden");
    loadStats();
    loadCodes();
  }
  function showLogin(err) {
    appDiv.classList.add("hidden");
    loginBox.classList.remove("hidden");
    if (err) { loginErr.textContent = err; }
    $("tokenInput").focus();
  }

  // ── 登录 ──
  function doLogin() {
    var t = $("tokenInput").value.trim();
    if (!t) return;
    var btn = $("loginBtn");
    btn.disabled = true;
    btn.textContent = "验证中...";
    loginErr.textContent = "";
    setToken(t);
    api("GET", "/admin/codes?limit=1").then(function() {
      showApp();
    }).catch(function(e) {
      clearToken();
      loginErr.textContent = "令牌无效";
      btn.disabled = false;
      btn.textContent = "登 录";
    });
  }

  // ── 退出 ──
  function doLogout() {
    clearToken();
    showLogin();
  }

  // ── 统计 ──
  function loadStats() {
    Promise.all([
      api("GET", "/admin/codes?limit=1"),
      api("GET", "/admin/codes?status=active&limit=1"),
      api("GET", "/admin/codes?status=used&limit=1"),
      api("GET", "/admin/codes?status=revoked&limit=1"),
    ]).then(function(results) {
      $("stats").innerHTML =
        '<div class="stat-card total"><div class="label">总计</div><div class="value">'+results[0].total+'</div></div>'+
        '<div class="stat-card active"><div class="label">未使用</div><div class="value">'+results[1].total+'</div></div>'+
        '<div class="stat-card used"><div class="label">已使用</div><div class="value">'+results[2].total+'</div></div>'+
        '<div class="stat-card revoked"><div class="label">已吊销</div><div class="value">'+results[3].total+'</div></div>';
    }).catch(function(e) {
      if (e.message.indexOf("401") >= 0 || e.message.indexOf("403") >= 0) {
        clearToken(); showLogin("会话已过期，请重新登录");
      }
    });
  }

  // ── 生成激活码 ──
  function doGenerate() {
    var count = parseInt($("genCount").value) || 10;
    var batch = $("genBatch").value.trim() || null;
    var note = $("genNote").value.trim() || null;
    var btn = $("genBtn");
    btn.disabled = true;
    btn.textContent = "生成中...";
    api("POST", "/admin/codes/generate", { count: count, batch_id: batch, note: note })
      .then(function(d) {
        genResult.classList.remove("hidden");
        genResult.innerHTML =
          '<p style="color:var(--success);margin-bottom:8px">成功生成 <b>'+d.count+'</b> 个激活码 (批次: '+d.batch_id+')</p>'+
          '<p style="color:var(--muted);font-size:12px;margin-bottom:8px">以下激活码仅显示一次，请立即复制保存</p>'+
          d.codes.map(function(c) {
            return '<div class="code" onclick="navigator.clipboard.writeText(\''+c+'\');var t=this;t.style.color=\'var(--success)\';setTimeout(function(){t.style.color=\'\'},1500)">'+c+'</div>';
          }).join("");
        loadStats(); loadCodes();
      })
      .catch(function(e) { alert("生成失败: " + e.message); })
      .finally(function() { btn.disabled = false; btn.textContent = "生成"; });
  }

  // ── 列表 ──
  var currentPage = 1;
  var PAGE_SIZE = 20;

  function loadCodes(page) {
    if (page) currentPage = page;
    var status = $("filterStatus").value;
    var batchId = $("filterBatch").value.trim();
    var params = "?limit=" + PAGE_SIZE + "&offset=" + ((currentPage - 1) * PAGE_SIZE);
    if (status) params += "&status=" + status;
    if (batchId) params += "&batch_id=" + batchId;

    api("GET", "/admin/codes" + params).then(function(d) {
      if (d.codes.length === 0) {
        codeTable.innerHTML = '<tr><td colspan="7" class="empty">暂无数据</td></tr>';
      } else {
        codeTable.innerHTML = d.codes.map(function(c) {
          var sc = c.status === "active" ? "active" : c.status === "used" ? "used" : "revoked";
          var st = c.status === "active" ? "未使用" : c.status === "used" ? "已使用" : "已吊销";
          var time = c.created_at ? new Date(c.created_at).toLocaleString("zh-CN") : "-";
          var revoke = c.status !== "revoked"
            ? '<button class="small danger revoke-btn" data-id="'+c.id+'">吊销</button>'
            : '<span style="color:var(--muted);font-size:12px">已吊销</span>';
          return '<tr><td style="font-family:monospace;letter-spacing:1px">'+c.code_prefix+'...</td>'+
            '<td><span class="badge '+sc+'">'+st+'</span></td>'+
            '<td>'+(c.batch_id||"-")+'</td><td>'+(c.bound_device||"-")+'</td><td>'+(c.note||"-")+'</td>'+
            '<td>'+time+'</td><td>'+revoke+'</td></tr>';
        }).join("");
        // 绑定吊销按钮事件
        codeTable.querySelectorAll(".revoke-btn").forEach(function(btn) {
          btn.addEventListener("click", function() { doRevoke(this.dataset.id); });
        });
      }
      // 分页
      var totalPages = Math.ceil(d.total / PAGE_SIZE);
      var pageHtml = "";
      if (totalPages > 1) {
        for (var i = 1; i <= totalPages; i++) {
          pageHtml += '<button class="small" style="'+(i===currentPage?'background:var(--accent)':'background:var(--border)')+'" data-page="'+i+'">'+i+'</button>';
        }
      }
      $("pagination").innerHTML = pageHtml;
      $("pagination").querySelectorAll("button").forEach(function(btn) {
        btn.addEventListener("click", function() { loadCodes(parseInt(this.dataset.page)); });
      });
    }).catch(function(e) {
      codeTable.innerHTML = '<tr><td colspan="7" class="empty">加载失败: '+e.message+'</td></tr>';
    });
  }

  // ── 吊销 ──
  function doRevoke(id) {
    if (!confirm("确定要吊销此激活码吗？\n\n吊销后，绑定设备将无法通过在线校验。")) return;
    api("POST", "/admin/codes/" + id + "/revoke")
      .then(function() { loadStats(); loadCodes(currentPage); showToast("已吊销"); })
      .catch(function(e) { alert("吊销失败: " + e.message); });
  }

  function showToast(msg) {
    var t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function() { t.remove(); }, 2500);
  }

  // ── 事件绑定 ──
  $("loginBtn").addEventListener("click", doLogin);
  $("tokenInput").addEventListener("keydown", function(e) { if (e.key === "Enter") doLogin(); });
  $("logoutBtn").addEventListener("click", doLogout);
  $("genBtn").addEventListener("click", doGenerate);
  $("refreshBtn").addEventListener("click", function() { loadCodes(1); });
  $("filterStatus").addEventListener("change", function() { loadCodes(1); });
  $("filterBatch").addEventListener("keydown", function(e) { if (e.key === "Enter") loadCodes(1); });

  // ── 启动：检查是否已认证 ──
  if (getToken()) {
    // 有 token → 验证有效性
    api("GET", "/admin/codes?limit=1").then(function() {
      showApp();
    }).catch(function() {
      clearToken();
      showLogin(URL_TOKEN ? "URL 中的令牌无效" : "");
    });
  } else {
    showLogin();
  }
})();
</script>
</body>
</html>"""


@router.get("/admin", response_class=HTMLResponse)
async def admin_ui(
    request: Request,
    token: str | None = Query(None, description="管理令牌"),
):
    """管理后台页面 — 仅管理员可访问"""
    config: LicenseServerConfig = request.app.state.config

    # 未配置 admin_token → 开发模式，允许免认证
    if not config.admin_token:
        return ADMIN_HTML

    # 配置了 admin_token → URL 必须携带正确 token
    if token != config.admin_token:
        return Response(
            content="<html><body><h1>403 Forbidden</h1></body></html>",
            status_code=403,
            media_type="text/html",
        )

    return ADMIN_HTML
