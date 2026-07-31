import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { L } from '../i18n/index.js';

/**
 * oc-markdown — 把 AI 输出的 Markdown 文本渲染成带样式的 HTML。
 *
 * 安全模型:先把源文本整体 HTML 转义,再由本模块**自行构造**受信标签,
 * 最后经 unsafeHTML 注入。AI 输出里的原始 HTML 只会以纯文本呈现,
 * 链接 href 也做了协议白名单过滤,杜绝 XSS。
 *
 * 支持:标题 / 围栏代码块(带复制) / 行内代码 / 有序无序列表 /
 *       引用 / 表格 / 链接 / 图片 / 粗斜体 / 删除线 / 分割线。
 * 零第三方依赖。
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** 只放行安全协议的 URL,其余一律降级为 '#'. */
function safeUrl(u: string): string {
  const url = u.trim();
  if (/^(https?:|mailto:|#|\/|\.\/|\.\.\/)/i.test(url)) return url;
  return '#';
}

/** 行内语法(输入已是转义后的安全文本)。 */
function inline(s: string): string {
  const stash: string[] = [];
  const keep = (frag: string) => {
    stash.push(frag);
    return '\x00' + (stash.length - 1) + '\x00';
  };

  // 行内代码(先保护,避免内容再被其它规则改写)
  s = s.replace(/`([^`\n]+)`/g, (_m, c: string) => keep('<code class="md-icode">' + c + '</code>'));
  // 图片
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt: string, u: string) =>
    keep(`<img class="md-img" src="${safeUrl(u)}" alt="${alt}" loading="lazy" />`));
  // 链接
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, t: string, u: string) =>
    keep(`<a class="md-a" href="${safeUrl(u)}" target="_blank" rel="noopener noreferrer">${t}</a>`));
  // 粗体
  s = s.replace(/\*\*([^\n]+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/__([^\n]+?)__/g, '<strong>$1</strong>');
  // 斜体
  s = s.replace(/(^|[\s(（])\*([^*\n]+)\*(?=[\s).,!?:;）]|$)/g, '$1<em>$2</em>');
  s = s.replace(/(^|[\s(（])_([^_\n]+)_(?=[\s).,!?:;）]|$)/g, '$1<em>$2</em>');
  // 删除线
  s = s.replace(/~~([^\n]+?)~~/g, '<del>$1</del>');
  // 还原被保护片段
  s = s.replace(/\x00(\d+)\x00/g, (_m, i: string) => stash[Number(i)] ?? '');
  return s;
}

const RE_FENCE = /^```(\w*)\s*$/;
const RE_HR = /^\s*(-{3,}|\*{3,}|_{3,})\s*$/;
const RE_QUOTE = /^\s*&gt;\s?/;
const RE_LIST = /^\s*([-*+]|\d+\.)\s+/;
const RE_OL = /^\s*\d+\.\s+/;

function renderMarkdown(src: string): string {
  const esc = escapeHtml(src.replace(/\r\n/g, '\n').replace(/\r/g, '\n'));
  const lines = esc.split('\n');
  const out: string[] = [];
  const n = lines.length;
  let i = 0;

  const copyLbl = L('common.copy');

  while (i < n) {
    const line = lines[i];

    // 围栏代码块
    const fence = line.match(RE_FENCE);
    if (fence) {
      const lang = fence[1] || '';
      const buf: string[] = [];
      i++;
      while (i < n && !/^```\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++; // 跳过收尾 ```
      out.push(
        '<div class="md-code">' +
          '<div class="md-code__bar">' +
            `<span class="md-code__lang">${escapeHtml(lang) || 'code'}</span>` +
            `<button class="md-copy" type="button" title="${copyLbl}">${copyLbl}</button>` +
          '</div>' +
          '<pre class="md-code__pre"><code>' + buf.join('\n') + '</code></pre>' +
        '</div>'
      );
      continue;
    }

    // 空行
    if (/^\s*$/.test(line)) { i++; continue; }

    // 标题
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const lvl = h[1].length;
      out.push(`<h${lvl} class="md-h md-h${lvl}">${inline(h[2])}</h${lvl}>`);
      i++; continue;
    }

    // 分割线
    if (RE_HR.test(line)) { out.push('<hr class="md-hr" />'); i++; continue; }

    // 引用块
    if (RE_QUOTE.test(line)) {
      const buf: string[] = [];
      while (i < n && RE_QUOTE.test(lines[i])) { buf.push(lines[i].replace(RE_QUOTE, '')); i++; }
      out.push('<blockquote class="md-quote">' + buf.map((l) => inline(l)).join('<br />') + '</blockquote>');
      continue;
    }

    // 表格(当前行含 |,下一行是分隔行)
    if (line.includes('|') && i + 1 < n && lines[i + 1].includes('-') && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1])) {
      const cells = (l: string) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
      const header = cells(line);
      i += 2;
      const rows: string[][] = [];
      while (i < n && lines[i].includes('|') && !/^\s*$/.test(lines[i])) { rows.push(cells(lines[i])); i++; }
      let t = '<div class="md-tablewrap"><table class="md-table"><thead><tr>';
      for (const hd of header) t += `<th>${inline(hd)}</th>`;
      t += '</tr></thead><tbody>';
      for (const r of rows) {
        t += '<tr>';
        for (let ci = 0; ci < header.length; ci++) t += `<td>${inline(r[ci] ?? '')}</td>`;
        t += '</tr>';
      }
      t += '</tbody></table></div>';
      out.push(t);
      continue;
    }

    // 列表
    if (RE_LIST.test(line)) {
      const ordered = RE_OL.test(line);
      const items: string[] = [];
      while (i < n && RE_LIST.test(lines[i])) {
        items.push(lines[i].replace(RE_LIST, ''));
        i++;
      }
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag} class="md-list md-${tag}">` + items.map((it) => `<li>${inline(it)}</li>`).join('') + `</${tag}>`);
      continue;
    }

    // 段落(到空行或下一个块级元素为止)
    const buf: string[] = [line];
    i++;
    while (
      i < n && !/^\s*$/.test(lines[i]) &&
      !/^```/.test(lines[i]) &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !RE_LIST.test(lines[i]) &&
      !RE_QUOTE.test(lines[i]) &&
      !RE_HR.test(lines[i])
    ) { buf.push(lines[i]); i++; }
    out.push('<p class="md-p">' + buf.map((l) => inline(l.trim())).join('<br />') + '</p>');
  }

  return out.join('\n');
}

export class OcMarkdown extends LitElement {
  static styles = css`
    :host { display: block; min-width: 0; }
    .md {
      color: var(--text); font-size: 14px; line-height: 1.7;
      word-break: break-word; overflow-wrap: break-word;
    }
    .md > :first-child { margin-top: 0; }
    .md > :last-child { margin-bottom: 0; }

    /* 段落 / 标题 */
    .md-p { margin: 0 0 10px; }
    .md-h { color: var(--text-strong); font-weight: 700; line-height: 1.35; margin: 16px 0 8px; letter-spacing: -0.01em; }
    .md-h1 { font-size: 19px; padding-bottom: 6px; border-bottom: 1px solid var(--border); }
    .md-h2 { font-size: 16.5px; }
    .md-h3 { font-size: 15px; }
    .md-h4, .md-h5, .md-h6 { font-size: 14px; }

    /* 行内代码 */
    .md-icode {
      font-family: var(--font-mono); font-size: 12.5px;
      background: color-mix(in srgb, var(--accent) 12%, transparent);
      color: var(--accent); border: 1px solid color-mix(in srgb, var(--accent) 22%, transparent);
      border-radius: 5px; padding: 1px 6px; white-space: nowrap;
    }

    /* 代码块 */
    .md-code {
      margin: 12px 0; border: 1px solid var(--border);
      border-radius: var(--radius-md); overflow: hidden;
      background: var(--input);
      transition: border-color var(--duration-fast) ease, box-shadow var(--duration-fast) ease;
    }
    .md-code:hover { border-color: color-mix(in srgb, var(--accent) 45%, var(--border)); box-shadow: 0 2px 14px rgba(0,0,0,0.16); }
    .md-code__bar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 6px 12px; background: var(--bg-hover);
      border-bottom: 1px solid var(--border);
    }
    .md-code__lang {
      font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.08em;
      text-transform: uppercase; color: var(--muted);
    }
    .md-copy {
      font-size: 11px; font-weight: 500; font-family: inherit;
      color: var(--text-soft); background: transparent;
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      padding: 2px 10px; cursor: pointer;
      transition: all var(--duration-fast) ease;
    }
    .md-copy:hover { color: var(--accent); border-color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, transparent); }
    .md-copy.ok { color: var(--success); border-color: var(--success); }
    .md-code__pre {
      margin: 0; padding: 12px 14px; overflow-x: auto;
      scrollbar-width: thin; scrollbar-color: var(--border) transparent;
    }
    .md-code__pre::-webkit-scrollbar { height: 6px; }
    .md-code__pre::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
    .md-code__pre code {
      font-family: var(--font-mono); font-size: 12.5px; line-height: 1.65;
      color: var(--text); white-space: pre;
    }

    /* 列表 */
    .md-list { margin: 4px 0 10px; padding-left: 22px; }
    .md-list li { margin: 3px 0; line-height: 1.65; }
    .md-list li::marker { color: var(--accent); font-weight: 600; }

    /* 引用 */
    .md-quote {
      margin: 10px 0; padding: 8px 14px;
      border-left: 3px solid var(--accent);
      background: color-mix(in srgb, var(--accent) 7%, transparent);
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      color: var(--text-soft); font-style: italic;
    }

    /* 表格 */
    .md-tablewrap { margin: 12px 0; overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius-md); }
    .md-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .md-table th {
      text-align: left; padding: 8px 12px; font-size: 11px; font-weight: 600;
      letter-spacing: 0.04em; color: var(--muted);
      background: var(--bg-hover); border-bottom: 1px solid var(--border); white-space: nowrap;
    }
    .md-table td { padding: 8px 12px; border-bottom: 1px solid var(--border); color: var(--text); }
    .md-table tr:last-child td { border-bottom: none; }
    .md-table tbody tr { transition: background var(--duration-fast) ease; }
    .md-table tbody tr:hover { background: var(--bg-hover); }

    /* 链接 / 图片 / 分割线 */
    .md-a { color: var(--accent); text-decoration: none; border-bottom: 1px solid color-mix(in srgb, var(--accent) 40%, transparent); transition: border-color var(--duration-fast) ease; }
    .md-a:hover { border-bottom-color: var(--accent); }
    .md-img { max-width: 100%; border-radius: var(--radius-md); border: 1px solid var(--border); margin: 6px 0; }
    .md-hr { border: none; height: 1px; margin: 16px 0; background: linear-gradient(90deg, transparent, var(--border-strong), transparent); }
  `;

  @property({ type: String }) text = '';
  @state() private _copiedEl: HTMLElement | null = null;

  private _onClick(e: MouseEvent) {
    const btn = (e.target as HTMLElement).closest('.md-copy') as HTMLElement | null;
    if (!btn) return;
    const code = btn.closest('.md-code')?.querySelector('code');
    const raw = code?.textContent ?? '';
    const done = () => {
      btn.classList.add('ok');
      btn.textContent = L('common.copied');
      this._copiedEl = btn;
      setTimeout(() => {
        btn.classList.remove('ok');
        btn.textContent = L('common.copy');
        if (this._copiedEl === btn) this._copiedEl = null;
      }, 1500);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(raw).then(done).catch(() => this._fallbackCopy(raw, done));
    } else {
      this._fallbackCopy(raw, done);
    }
  }

  private _fallbackCopy(text: string, done: () => void) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch { /* 复制失败静默 */ }
    document.body.removeChild(ta);
  }

  render() {
    return html`<div class="md" @click=${this._onClick}>${unsafeHTML(renderMarkdown(this.text || ''))}</div>`;
  }
}

customElements.define('oc-markdown', OcMarkdown);
