"""
Sidecar 用户可见提示语双语目录。

前端在请求 Sidecar 时带 `X-UI-Lang` 头（值为 i18n.locale，如 zh-CN / en），
后端据此选择提示语语言；缺省中文。仅覆盖会原样展示给用户的消息，
日志仍用中文。
"""

from fastapi import Request

# key → (en, zh)
_MSGS: dict[str, tuple[str, str]] = {
    "only_support": ("Only supports {plats}", "仅支持 {plats}"),
    "missing_bins": ("Missing commands: {bins}", "缺少命令: {bins}"),
    "missing_libs": ("Missing Python libs: {libs}", "缺少 Python 库: {libs}"),
    "yaml_invalid": ("Invalid YAML: {detail}", "YAML 格式错误：{detail}"),
    "saved_hot_reload": ("Saved — Hermes hot-reloaded", "已保存，Hermes 热加载生效"),
    "saved_restart": ("Saved (takes effect after gateway restart)", "已保存（下次网关重启生效）"),
    "mem_invalid_file": ("Invalid memory file path: {file}", "无效的记忆文件路径: {file}"),
    # license
    "activate_failed_http": ("Activation failed (HTTP {status})", "激活失败 (HTTP {status})"),
    "cannot_connect_server": ("Cannot reach license server: {e}", "无法连接授权服务器: {e}"),
    "no_valid_token": ("Server did not return a valid token", "服务器未返回有效令牌"),
    "token_invalid_format": ("Invalid token format", "令牌格式无效"),
    "fp_mismatch": ("Device fingerprint mismatch — please retry", "设备指纹不匹配，请重试"),
    "activate_ok": ("Activation succeeded", "激活成功"),
    "not_activated_input": ("Not activated — enter your activation code", "未激活，请输入激活码"),
    "offline_day_remaining": ("Offline day {days}, {remain} days of grace left", "离线第 {days} 天，剩余 {remain} 天"),
    "not_activated": ("Not activated", "未激活"),
    "token_decrypt_failed": ("Cannot decrypt license data — please re-activate", "无法解密授权数据，请重新激活"),
    "revoked_contact": ("License revoked — contact support", "授权已被吊销，请联系客服"),
    "code_bound_other": ("This code is bound to another device", "此码已绑定其他设备"),
    "validate_failed": ("Validation failed", "校验失败"),
    "offline_grace_exceeded": ("Offline over {days} days — connect to validate your license", "离线超过 {days} 天，请连接网络验证授权"),
    "offline_day": ("Cannot reach license server — offline day {days}", "无法连接授权服务器，离线第 {days} 天"),
    "license_valid": ("License valid", "授权有效"),
    "unknown_reason": ("unknown reason", "未知原因"),
    "validate_failed_reason": ("Validation failed: {reason}", "校验失败: {reason}"),
    "device_changed": ("Hardware change detected", "检测到硬件变更"),
    "offline_grace_need_online": ("Offline over {days} days — online validation required", "离线超过 {days} 天，需要联网验证"),
    "license_ok": ("License OK", "授权正常"),
    "device_changed_reactivate": ("Hardware change detected — re-activate with your code", "检测到硬件变更，请使用激活码重新激活"),
    "device_verified": ("Device verified", "设备验证通过"),
    "device_changed_validate": ("Hardware change detected — connect to the network to validate", "检测到硬件变更，请连接网络完成验证"),
    "missing_base_url": ("Missing API Base URL", "缺少 API Base URL"),
    "network_error": ("Network error: {e}", "网络错误: {e}"),
    "install_failed": ("Install failed: {e}", "安装失败: {e}"),
    "deploy_failed": ("Deploy failed: {e}", "部署失败: {e}"),
    "uninstall_failed": ("Uninstall failed: {e}", "卸载失败: {e}"),
    "pre_not_found": ("Preinstalled skill not found: {id}", "预装技能不存在: {id}"),
    "pack_not_found": ("Job pack not found: {id}", "岗位包不存在: {id}"),
    "read_pack_failed": ("Failed to read job pack: {e}", "读取岗位包失败: {e}"),
    "pip_failed": ("pip install failed: {tail}", "pip install 失败: {tail}"),
    "hub_search_failed": ("Skill market search failed: {e}", "技能市场搜索失败: {e}"),
    "search_timeout": ("Skill market search timed out (network unreachable?)", "技能市场搜索超时（网络不可达？）"),
    "install_timeout": ("Install timed out (network unreachable?)", "安装超时（网络不可达？）"),
}


def ui_lang(request: Request | None = None) -> str:
    """从 X-UI-Lang 头取语言；en 开头视为英文，其余中文"""
    if request is None:
        return "zh"
    lang = (request.headers.get("x-ui-lang") or "").lower()
    return "en" if lang.startswith("en") else "zh"


def tr(lang: str, key: str, **vars) -> str:
    en, zh = _MSGS.get(key, (key, key))
    tpl = en if lang == "en" else zh
    try:
        return tpl.format(**vars)
    except Exception:  # noqa: BLE001
        return tpl
