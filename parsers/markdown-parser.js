/**
 * MarkdownParser - Detects Markdown text and converts it to HTML
 * Raw HTML in the source is escaped, never rendered, so selected text cannot inject markup or scripts.
 */
if (typeof MarkdownParser === 'undefined') {
  const FENCE = /^ {0,3}(`{3,}|~{3,})\s*([\w+#.-]*)/;
  const HEADING = /^ {0,3}(#{1,6})\s+(.*?)(?:\s+#+)?\s*$/;
  const HR = /^ {0,3}([-*_])(?:\s*\1){2,}\s*$/;
  const BLOCKQUOTE = /^ {0,3}>/;
  const LIST_ITEM = /^( *)([-*+]|\d{1,9}[.)])(?:\s+(.*))?$/;
  const SETEXT = /^ {0,3}(=+|-+)\s*$/;
  const TABLE_DIVIDER = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;
  const TASK = /^\[([ xX])\]\s+/;

  const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const escapeHTML = (text) => text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

  // Input is already HTML-escaped, so encoded schemes like "javascript&#58;" never decode to a colon.
  const safeURL = (url) => (/^\s*(javascript|vbscript|data):/i.test(url) ? '#' : url);

  const emphasize = (html) => html
    .replace(/\*\*\*(?=\S)([\s\S]*?\S)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|\W)__(?=\S)([\s\S]*?\S)__(?!\w)/g, '$1<strong>$2</strong>')
    .replace(/\*(?=\S)([\s\S]*?\S)\*/g, '<em>$1</em>')
    .replace(/(^|\W)_(?=\S)([\s\S]*?\S)_(?!\w)/g, '$1<em>$2</em>')
    .replace(/~~(?=\S)([\s\S]*?\S)~~/g, '<del>$1</del>');

  const leadingSpaces = (line) => line.search(/[^ ]|$/);

  const isBlockStart = (line) => FENCE.test(line) || HEADING.test(line) || HR.test(line) ||
    BLOCKQUOTE.test(line) || LIST_ITEM.test(line);

  const isTableStart = (lines, i) => lines[i].includes('|') && TABLE_DIVIDER.test(lines[i + 1] ?? '');

  const splitRow = (line) => line.trim()
    .replace(/^\|/, '')
    .replace(/(?<!\\)\|$/, '')
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replace(/\\\|/g, '|'));

  window.MarkdownParser = {
    /**
     * Heuristically decides whether text is Markdown rather than plain text or HTML.
     * @param {string} text
     * @returns {boolean}
     */
    isMarkdown(text) {
      if (typeof text !== 'string' || !text.trim()) return false;

      const lines = text.split(/\r?\n/);
      const hasStrongSignal = /!?\[[^\]\n]+\]\([^)\s]+\)/.test(text) ||
        lines.some((line, i) => HEADING.test(line) || FENCE.test(line) || isTableStart(lines, i));
      if (hasStrongSignal) return true;

      // Without structural Markdown, closing tags mean the selection is HTML that merely contains list-like lines.
      if (/<\/[a-z][\w-]*\s*>/i.test(text.replace(/`[^`\n]+`/g, ''))) return false;

      const blockSignals = lines.filter((line) => LIST_ITEM.test(line) || BLOCKQUOTE.test(line) || HR.test(line)).length;
      const inlineSignals = (text.match(/\*\*\S[^*\n]*\*\*|__\S[^_\n]*__|`[^`\n]+`|~~\S[^~\n]*~~/g) || []).length;
      return blockSignals + inlineSignals >= 2;
    },

    /**
     * Converts Markdown (CommonMark subset plus GFM tables, task lists and strikethrough) to an HTML string.
     * @param {string} text
     * @returns {string}
     */
    toHTML(text) {
      const lines = text
        .replace(/\u0000/g, '')
        .replace(/\r\n?/g, '\n')
        .replace(/\t/g, '    ')
        .split('\n');
      return this._blocks(lines).join('\n');
    },

    _blocks(lines) {
      const out = [];
      let i = 0;

      while (i < lines.length) {
        const line = lines[i];
        let match;

        if (!line.trim()) {
          i++;
        } else if ((match = line.match(FENCE))) {
          const fence = match[1];
          const code = [];
          i++;
          while (i < lines.length && !lines[i].trim().startsWith(fence)) code.push(lines[i++]);
          i++;
          const langClass = match[2] ? ` class="language-${escapeHTML(match[2])}"` : '';
          out.push(`<pre><code${langClass}>${escapeHTML(code.join('\n'))}</code></pre>`);
        } else if ((match = line.match(HEADING))) {
          const level = match[1].length;
          out.push(`<h${level}>${this._inline(match[2])}</h${level}>`);
          i++;
        } else if (HR.test(line)) {
          out.push('<hr>');
          i++;
        } else if (BLOCKQUOTE.test(line)) {
          const quoted = [];
          while (i < lines.length && BLOCKQUOTE.test(lines[i])) {
            quoted.push(lines[i++].replace(/^ {0,3}> ?/, ''));
          }
          out.push(`<blockquote>\n${this._blocks(quoted).join('\n')}\n</blockquote>`);
        } else if (LIST_ITEM.test(line)) {
          i = this._list(lines, i, out);
        } else if (isTableStart(lines, i)) {
          i = this._table(lines, i, out);
        } else {
          i = this._paragraph(lines, i, out);
        }
      }

      return out;
    },

    _paragraph(lines, i, out) {
      const para = [];
      while (i < lines.length && lines[i].trim()) {
        const setext = lines[i].match(SETEXT);
        if (setext && para.length) {
          const level = setext[1][0] === '=' ? 1 : 2;
          out.push(`<h${level}>${this._inline(para.join('\n').trim())}</h${level}>`);
          return i + 1;
        }
        if (para.length && (isBlockStart(lines[i]) || isTableStart(lines, i))) break;
        para.push(lines[i++]);
      }
      out.push(`<p>${this._inline(para.join('\n').trim())}</p>`);
      return i;
    },

    _list(lines, i, out) {
      const first = lines[i].match(LIST_ITEM);
      const indent = first[1].length;
      const ordered = /\d/.test(first[2]);
      const isSibling = (match) => match && match[1].length === indent && /\d/.test(match[2]) === ordered;
      const items = [];
      let loose = false;

      while (i < lines.length) {
        const line = lines[i];
        const match = line.match(LIST_ITEM);

        if (isSibling(match)) {
          items.push({ lines: [match[3] || ''], offset: indent + match[2].length + 1 });
          i++;
          continue;
        }

        const item = items[items.length - 1];
        if (!line.trim()) {
          let next = i + 1;
          while (next < lines.length && !lines[next].trim()) next++;
          if (next === lines.length) break;
          const continuesItem = leadingSpaces(lines[next]) >= item.offset;
          if (!continuesItem && !isSibling(lines[next].match(LIST_ITEM))) break;
          loose = true;
          if (continuesItem) item.lines.push('');
          i = next;
          continue;
        }

        if (leadingSpaces(line) > indent) {
          item.lines.push(line.slice(Math.min(leadingSpaces(line), item.offset)));
        } else if (isBlockStart(line)) {
          break;
        } else {
          item.lines.push(line.trim());
        }
        i++;
      }

      const tag = ordered ? 'ol' : 'ul';
      const startNumber = parseInt(first[2], 10);
      const start = ordered && startNumber !== 1 ? ` start="${startNumber}"` : '';
      const html = items.map((item) => this._listItem(item.lines, loose)).join('\n');
      out.push(`<${tag}${start}>\n${html}\n</${tag}>`);
      return i;
    },

    _listItem(itemLines, loose) {
      const task = itemLines[0].match(TASK);
      if (task) itemLines[0] = itemLines[0].slice(task[0].length);

      let blocks = this._blocks(itemLines);
      if (!loose) blocks = blocks.map((block) => block.replace(/^<p>([\s\S]*)<\/p>$/, '$1'));

      const open = task
        ? `<li class="rst-task-item"><input type="checkbox" disabled${task[1] === ' ' ? '' : ' checked'}> `
        : '<li>';
      return `${open}${blocks.join('\n')}</li>`;
    },

    _table(lines, i, out) {
      const header = splitRow(lines[i]);
      const aligns = splitRow(lines[i + 1]).map((divider) => {
        if (divider.startsWith(':') && divider.endsWith(':')) return 'center';
        if (divider.endsWith(':')) return 'right';
        if (divider.startsWith(':')) return 'left';
        return null;
      });
      const row = (tag, cells) => `<tr>${header.map((_, col) => {
        const align = aligns[col] ? ` class="rst-align-${aligns[col]}"` : '';
        return `<${tag}${align}>${this._inline(cells[col] || '')}</${tag}>`;
      }).join('')}</tr>`;

      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes('|')) rows.push(row('td', splitRow(lines[i++])));

      const head = `<thead>${row('th', header)}</thead>`;
      const body = rows.length ? `<tbody>${rows.join('')}</tbody>` : '';
      out.push(`<table>${head}${body}</table>`);
      return i;
    },

    // Code spans, escapes and links are swapped for placeholders so emphasis rules never touch their contents.
    _inline(text) {
      const held = [];
      const hold = (html) => `\u0000${held.push(html) - 1}\u0000`;

      let html = text
        .replace(/(`+)([\s\S]*?[^`])\1(?!`)/g, (_, ticks, code) => hold(`<code>${escapeHTML(code.trim())}</code>`))
        .replace(/\\([\\`*_{}\[\]()#+\-.!|~<>])/g, (_, char) => hold(escapeHTML(char)))
        .replace(/<((?:https?:\/\/|mailto:)[^\s<>]+)>/g, (_, url) => hold(`<a href="${escapeHTML(url)}">${escapeHTML(url)}</a>`));

      html = escapeHTML(html)
        .replace(/!\[([^\]]*)\]\(\s*([^\s)]+)(?:\s+&quot;(.*?)&quot;)?\s*\)/g, (_, alt, src, title) =>
          hold(`<img src="${safeURL(src)}" alt="${alt}"${title ? ` title="${title}"` : ''}>`))
        .replace(/\[([^\]]+)\]\(\s*([^\s)]+)(?:\s+&quot;(.*?)&quot;)?\s*\)/g, (_, label, href, title) =>
          hold(`<a href="${safeURL(href)}"${title ? ` title="${title}"` : ''}>${emphasize(label)}</a>`))
        .replace(/(^|[\s(])(https?:\/\/[^\s<]*[^\s<.,:;"')\]])/g, (_, before, url) =>
          `${before}${hold(`<a href="${url}">${url}</a>`)}`);

      html = emphasize(html).replace(/(?: {2,}|\\)\n/g, '<br>\n');

      const restore = (str) => str.replace(/\u0000(\d+)\u0000/g, (_, n) => restore(held[n]));
      return restore(html);
    }
  };
}
