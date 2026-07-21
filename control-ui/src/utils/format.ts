export function formatDate(ts) {
  if (!ts) return '\u2014';
  const d = new Date(ts);
  if (isNaN(d.getTime())) return '\u2014';
  return d.toLocaleString();
}

export function formatRelative(ts) {
  if (!ts) return '\u2014';
  const now = Date.now();
  const then = new Date(ts).getTime();
  const diff = now - then;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}

export function formatCount(n) {
  if (n == null) return '\u2014';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}

export function formatBytes(bytes) {
  if (bytes == null) return '\u2014';
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + ' GB';
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + ' MB';
  if (bytes >= 1e3) return (bytes / 1e3).toFixed(1) + ' KB';
  return bytes + ' B';
}

export function formatDuration(ms) {
  if (ms == null) return '\u2014';
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const s = sec % 60;
  if (min < 60) return `${min}m ${s}s`;
  const hr = Math.floor(min / 60);
  const m = min % 60;
  if (hr < 24) return `${hr}h ${m}m`;
  const days = Math.floor(hr / 24);
  const h = hr % 24;
  return `${days}d ${h}h`;
}

export function slugify(str) {
  return (str ?? '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/, '').slice(0, 64) || 'main';
}
