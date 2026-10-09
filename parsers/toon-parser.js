/**
 * TOONParser - Decodes TOON (Token-Oriented Object Notation, https://github.com/toon-format/spec)
 * Targets spec v4.4 strict decoding. Numbers decode to JS doubles, so out-of-range integers are approximated.
 */
if (typeof TOONParser === 'undefined') {
  const NUMBER = /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?$/;
  const BRACKET = /^\[(0|[1-9][0-9]*)(:)?(\t|\|)?\]/;
  const DELIMITERS = [',', '|', '\t'];

  const fail = (message) => {
    throw new SyntaxError(`TOON: ${message}`);
  };

  const trimSpaces = (text) => text.replace(/^ +| +$/g, '');

  // Positions of the first unquoted occurrence of each wanted character; quoted spans hide everything inside them.
  const scanUnquoted = (text, wanted) => {
    const found = {};
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (inQuotes) {
        if (char === '\\') i++;
        else if (char === '"') inQuotes = false;
      } else if (char === '"') {
        inQuotes = true;
      } else if (wanted.includes(char) && !(char in found)) {
        found[char] = i;
      }
    }
    return found;
  };

  const parseQuoted = (token) => {
    let value = '';
    for (let i = 1; i < token.length; i++) {
      const char = token[i];
      if (char === '"') {
        if (i !== token.length - 1) fail('characters after closing quote');
        return value;
      }
      if (char !== '\\') {
        value += char;
        continue;
      }
      const next = token[++i];
      if (next === '\\' || next === '"') value += next;
      else if (next === 'n') value += '\n';
      else if (next === 'r') value += '\r';
      else if (next === 't') value += '\t';
      else if (next === 'u') {
        const hex = token.slice(i + 1, i + 5);
        if (!/^[0-9a-fA-F]{4}$/.test(hex)) fail('invalid \\u escape');
        const code = parseInt(hex, 16);
        if (code >= 0xd800 && code <= 0xdfff) fail('surrogate escape');
        value += String.fromCharCode(code);
        i += 4;
      } else {
        fail('invalid escape sequence');
      }
    }
    return fail('unterminated string');
  };

  const decodeKey = (token) => (token.startsWith('"') ? parseQuoted(token) : token);

  const parsePrimitive = (rawToken) => {
    const token = trimSpaces(rawToken);
    if (token.startsWith('"')) return parseQuoted(token);
    if (token === 'true') return true;
    if (token === 'false') return false;
    if (token === 'null') return null;
    if (NUMBER.test(token)) {
      const number = Number(token);
      return number === 0 ? 0 : number;
    }
    return token;
  };

  const splitDelimited = (text, delimiter) => {
    const tokens = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (inQuotes && char === '\\') {
        current += char + (text[i + 1] ?? '');
        i++;
        continue;
      }
      if (char === '"') inQuotes = !inQuotes;
      if (char === delimiter && !inQuotes) {
        tokens.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    tokens.push(current);
    return tokens.map(parsePrimitive);
  };

  // Materialize keys such as __proto__ as ordinary own properties.
  const setOwn = (object, key, value) => {
    if (Object.prototype.hasOwnProperty.call(object, key)) fail(`duplicate key "${key}"`);
    Object.defineProperty(object, key, { value, enumerable: true, writable: true, configurable: true });
  };

  const matchingBrace = (text, open) => {
    let depth = 0;
    let inQuotes = false;
    for (let i = open; i < text.length; i++) {
      const char = text[i];
      if (inQuotes) {
        if (char === '\\') i++;
        else if (char === '"') inQuotes = false;
      } else if (char === '"') {
        inQuotes = true;
      } else if (char === '{') {
        depth++;
      } else if (char === '}' && --depth === 0) {
        return i;
      }
    }
    return fail('unmatched brace in field list');
  };

  const parseFieldList = (text, delimiter) => {
    const unquoted = scanUnquoted(text, DELIMITERS);
    if (DELIMITERS.some((d) => d !== delimiter && d in unquoted)) fail('field list uses a different delimiter');

    const entries = [];
    let start = 0;
    let depth = 0;
    let inQuotes = false;
    for (let i = 0; i <= text.length; i++) {
      const char = text[i];
      if (inQuotes) {
        if (char === '\\') i++;
        else if (char === '"') inQuotes = false;
        continue;
      }
      if (char === '"') inQuotes = true;
      else if (char === '{') depth++;
      else if (char === '}') depth--;
      else if ((char === delimiter && depth === 0) || i === text.length) {
        entries.push(text.slice(start, i));
        start = i + 1;
      }
    }

    const names = new Set();
    return entries.map((rawEntry) => {
      const entry = trimSpaces(rawEntry);
      const brace = scanUnquoted(entry, ['{'])['{'];
      const nameToken = brace === undefined ? entry : entry.slice(0, brace);
      if (!nameToken || /[ \t]$/.test(nameToken)) fail('empty or malformed field name');
      const name = decodeKey(nameToken);
      if (names.has(name)) fail(`duplicate field "${name}"`);
      names.add(name);
      if (brace === undefined) return { name, children: null };
      const close = matchingBrace(entry, brace);
      if (close !== entry.length - 1) fail('unexpected text after nested field group');
      return { name, children: parseFieldList(entry.slice(brace + 1, close), delimiter) };
    });
  };

  const countLeaves = (fields) => fields.reduce((sum, f) => sum + (f.children ? countLeaves(f.children) : 1), 0);

  const buildRow = (fields, cells) => {
    let next = 0;
    const walk = (list) => {
      const object = {};
      for (const field of list) setOwn(object, field.name, field.children ? walk(field.children) : cells[next++]);
      return object;
    };
    return walk(fields);
  };

  const parseHeader = (content) => {
    const bracket = scanUnquoted(content, ['['])['['];
    const keyText = content.slice(0, bracket);
    if (/[ \t]$/.test(keyText)) fail('whitespace before bracket segment');

    const match = BRACKET.exec(content.slice(bracket));
    if (!match) fail('malformed bracket segment');
    const [segment, length, keyedMarker, delimiterSymbol] = match;
    const delimiter = delimiterSymbol || ',';
    let after = content.slice(bracket + segment.length);

    let fields = null;
    if (after.startsWith('{')) {
      const close = matchingBrace(after, 0);
      fields = parseFieldList(after.slice(1, close), delimiter);
      after = after.slice(close + 1);
    }
    if (!after.startsWith(':')) fail('missing colon after header');

    const inline = trimSpaces(after.slice(1));
    if (keyedMarker && !fields) fail('keyed header without field list');
    if (fields && inline) fail('inline content after fields-bearing header');

    return {
      key: keyText === '' ? null : decodeKey(keyText),
      length: Number(length),
      keyed: Boolean(keyedMarker),
      delimiter,
      fields,
      inline,
    };
  };

  const isHeaderLine = (content) => {
    const found = scanUnquoted(content, [':', '[']);
    return ':' in found && '[' in found && found['['] < found[':'];
  };

  const isListItem = (content) => content === '-' || content.startsWith('- ');

  class Decoder {
    constructor(text, indentSize) {
      this.lines = this._prepare(text, indentSize);
      this.index = 0;
      this.lastConsumed = -1;
      this.sawStructure = false;
    }

    _prepare(text, indentSize) {
      return text.replace(/^﻿/, '').split('\n')
        .map((line) => (line.endsWith('\r') ? line.slice(0, -1) : line).replace(/ +$/, ''))
        .filter((line) => !/^ *#/.test(line))
        .map((line) => {
          if (line === '') return { blank: true };
          const indentation = line.match(/^[ \t]*/)[0];
          if (indentation.includes('\t')) fail('tab in indentation');
          if (indentation.length % indentSize !== 0) fail('indentation is not a multiple of the indent size');
          return { blank: false, depth: indentation.length / indentSize, content: line.slice(indentation.length) };
        });
    }

    peek() {
      while (this.index < this.lines.length && this.lines[this.index].blank) this.index++;
      return this.index < this.lines.length ? this.lines[this.index] : null;
    }

    consume() {
      this.lastConsumed = this.index;
      return this.lines[this.index++];
    }

    // Blank lines may not appear between the first and last content line of an array or keyed scope.
    assertNoBlankLines(first, last) {
      for (let i = first + 1; i < last; i++) {
        if (this.lines[i].blank) fail('blank line inside array scope');
      }
    }

    decodeDocument() {
      const first = this.peek();
      if (!first) return {};
      if (first.depth !== 0) fail('document starts indented');

      let value;
      if (first.content === '[]') {
        this.consume();
        value = [];
      } else if (first.content.startsWith('[') && isHeaderLine(first.content)) {
        this.consume();
        const header = parseHeader(first.content);
        value = header.keyed ? this.keyedObject(header, 0) : this.array(header, 0);
      } else if (this.lines.filter((l) => !l.blank).length === 1 && !(':' in scanUnquoted(first.content, [':']))) {
        return parsePrimitive(first.content);
      } else {
        value = this.objectBody(0, {});
      }
      if (this.peek()) fail('unexpected content after root value');
      return value;
    }

    objectBody(depth, object) {
      for (let line = this.peek(); line && line.depth >= depth; line = this.peek()) {
        if (line.depth > depth) fail('unexpected indentation');
        this.consume();
        this.field(line.content, depth, object);
      }
      return object;
    }

    field(content, depth, object) {
      if (isHeaderLine(content)) {
        const header = parseHeader(content);
        if (header.key === null) fail('keyless header outside root or list item');
        setOwn(object, header.key, header.keyed ? this.keyedObject(header, depth) : this.array(header, depth));
        return;
      }

      const colon = scanUnquoted(content, [':'])[':'];
      if (colon === undefined) fail('expected "key: value"');
      const key = decodeKey(trimSpaces(content.slice(0, colon)));
      const valueText = trimSpaces(content.slice(colon + 1));

      if (valueText === '[]') {
        this.sawStructure = true;
        setOwn(object, key, []);
      } else if (valueText !== '') {
        setOwn(object, key, parsePrimitive(valueText));
      } else {
        const next = this.peek();
        if (next && next.depth > depth) {
          if (next.depth !== depth + 1) fail('indentation jump');
          this.sawStructure = true;
        }
        setOwn(object, key, this.objectBody(depth + 1, {}));
      }
    }

    array(header, depth) {
      this.sawStructure = true;
      if (header.fields) return this.tabularRows(header, depth);
      if (header.inline) {
        const values = splitDelimited(header.inline, header.delimiter);
        if (values.length !== header.length) fail(`expected ${header.length} values, found ${values.length}`);
        return values;
      }
      return this.listItems(header, depth);
    }

    tabularRows(header, depth) {
      const leaves = countLeaves(header.fields);
      const rows = [];
      const first = this.index;
      for (let line = this.peek(); line && line.depth > depth; line = this.peek()) {
        if (line.depth > depth + 1) fail('unexpected indentation in tabular rows');
        const found = scanUnquoted(line.content, [header.delimiter, ':']);
        const isRow = !(':' in found) || (header.delimiter in found && found[header.delimiter] < found[':']);
        if (!isRow) break;
        this.consume();
        const cells = splitDelimited(line.content, header.delimiter);
        if (cells.length !== leaves) fail(`row has ${cells.length} cells, expected ${leaves}`);
        rows.push(buildRow(header.fields, cells));
      }
      if (rows.length !== header.length) fail(`expected ${header.length} rows, found ${rows.length}`);
      if (rows.length) this.assertNoBlankLines(this.firstContentIndex(first), this.lastConsumed);
      return rows;
    }

    keyedObject(header, depth) {
      this.sawStructure = true;
      const leaves = countLeaves(header.fields);
      const object = {};
      let entries = 0;
      const first = this.index;
      for (let line = this.peek(); line && line.depth > depth; line = this.peek()) {
        if (line.depth > depth + 1) fail('unexpected indentation in keyed entries');
        const colon = scanUnquoted(line.content, [':'])[':'];
        if (colon === undefined) fail('keyed entry without colon');
        this.consume();
        const remainder = trimSpaces(line.content.slice(colon + 1));
        const cells = remainder === '' ? [] : splitDelimited(remainder, header.delimiter);
        if (cells.length !== leaves) fail(`entry has ${cells.length} cells, expected ${leaves}`);
        setOwn(object, decodeKey(trimSpaces(line.content.slice(0, colon))), buildRow(header.fields, cells));
        entries++;
      }
      if (entries !== header.length) fail(`expected ${header.length} entries, found ${entries}`);
      if (entries) this.assertNoBlankLines(this.firstContentIndex(first), this.lastConsumed);
      return object;
    }

    listItems(header, depth) {
      const items = [];
      const first = this.index;
      for (let line = this.peek(); line && line.depth > depth; line = this.peek()) {
        if (line.depth > depth + 1) fail('unexpected indentation in list');
        if (!isListItem(line.content)) break;
        this.consume();
        items.push(this.listItem(line.content.slice(1).replace(/^ +/, ''), depth + 1));
      }
      if (items.length !== header.length) fail(`expected ${header.length} list items, found ${items.length}`);
      if (items.length) this.assertNoBlankLines(this.firstContentIndex(first), this.lastConsumed);
      return items;
    }

    listItem(content, depth) {
      if (content === '') return {};
      if (content === '[]') return [];
      if (isHeaderLine(content)) {
        const header = parseHeader(content);
        if (header.key === null) {
          if (header.fields) fail('keyless fields-bearing header in list item');
          return this.array(header, depth);
        }
      } else if (!(':' in scanUnquoted(content, [':']))) {
        return parsePrimitive(content);
      }
      // A list-item object's first field sits on the hyphen line but behaves as depth + 1 (spec §10).
      const object = {};
      this.field(content, depth + 1, object);
      return this.objectBody(depth + 1, object);
    }

    firstContentIndex(from) {
      let i = from;
      while (this.lines[i].blank) i++;
      return i;
    }
  }

  const removeCommonIndent = (lines) => {
    const indents = lines.filter((l) => l.trim() && !/^ *#/.test(l)).map((l) => l.match(/^ */)[0].length);
    const common = indents.length ? Math.min(...indents) : 0;
    return { lines: lines.map((l) => l.slice(Math.min(common, l.match(/^ */)[0].length))), indents: indents.map((n) => n - common) };
  };

  window.TOONParser = {
    /**
     * Strictly decodes a TOON document.
     * @param {string} text
     * @param {{indentSize?: number}} options
     * @returns {*} Decoded value
     * @throws {SyntaxError} When the document is not valid TOON
     */
    decode(text, { indentSize = 2 } = {}) {
      return new Decoder(text, indentSize).decodeDocument();
    },

    /**
     * Decodes selected text when it is a structured TOON document, inferring its indentation.
     * Returns null for invalid TOON and for text without TOON structure (array headers or nested objects),
     * so plain "key: value" prose is not mistaken for TOON.
     * @param {string} text
     * @returns {Object|Array|null}
     */
    parse(text) {
      if (typeof text !== 'string' || !text.trim()) return null;
      const { lines, indents } = removeCommonIndent(text.replace(/\r\n?/g, '\n').split('\n'));
      const indentSize = Math.min(...indents.filter((n) => n > 0), Infinity);
      try {
        const decoder = new Decoder(lines.join('\n'), Number.isFinite(indentSize) ? indentSize : 2);
        const value = decoder.decodeDocument();
        return decoder.sawStructure && value !== null && typeof value === 'object' ? value : null;
      } catch (e) {
        return null;
      }
    }
  };
}
