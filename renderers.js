if (typeof BaseRenderer === 'undefined') {
  window.BaseRenderer = class {
    /**
     * Opens the terminal-style overlay window and returns its scrollable content element.
     * @param {string} contentClass - Extra classes for the content element
     * @param {{theme?: string, format?: string}} options - Theme name and source format label
     * @returns {HTMLElement}
     */
    createLayer(contentClass, { theme = 'dark', format = 'text' } = {}) {
      const layer = this._element('div', 'rst-overlay');
      layer.id = 'rendered-html-layer';
      layer.dataset.rstTheme = theme;

      const innerLayer = this._element('div', 'rst-inner-layer');
      innerLayer.setAttribute('role', 'dialog');
      innerLayer.setAttribute('aria-label', `Rendered ${format}`);

      const closeLayer = () => {
        document.removeEventListener('keydown', handleKeyPress);
        layer.classList.add('rst-closing');
        setTimeout(() => layer.remove(), 150);
      };
      const handleKeyPress = (e) => {
        if (e.key === 'Escape') closeLayer();
      };
      document.addEventListener('keydown', handleKeyPress);

      const closeButton = this._element('button', 'rst-close-button');
      closeButton.type = 'button';
      closeButton.title = 'Close (Esc)';
      closeButton.setAttribute('aria-label', 'Close');
      closeButton.addEventListener('click', closeLayer);

      const controls = this._element('div', 'rst-window-controls');
      controls.append(closeButton, this._element('span', 'rst-window-dot'), this._element('span', 'rst-window-dot'));

      const title = this._element('div', 'rst-header-title');
      title.textContent = `render-selected-text \u2014 ${format}`;

      const hint = this._element('kbd', 'rst-esc-hint');
      hint.textContent = 'esc';

      const titlebar = this._element('div', 'rst-titlebar');
      titlebar.append(controls, title, hint);

      const prompt = this._element('div', 'rst-prompt');
      prompt.append(this._element('span', 'rst-prompt-symbol', '$'), ` render --format=${format}`);

      const content = this._element('div', `rst-content ${contentClass}`);
      content.appendChild(prompt);

      innerLayer.append(titlebar, content);
      layer.appendChild(innerLayer);
      document.body.appendChild(layer);
      return content;
    }

    mountHTML(html, contentClass, options) {
      this.createLayer(contentClass, options).insertAdjacentHTML('beforeend', html);
    }

    _element(tag, className, text) {
      const element = document.createElement(tag);
      element.className = className;
      if (text) element.textContent = text;
      return element;
    }

    unescapeHTML(text) {
      const temp = document.createElement('textarea');
      temp.innerHTML = text;
      return temp.value;
    }
  };
}

if (typeof HTMLRenderer === 'undefined') {
  window.HTMLRenderer = class extends BaseRenderer {
    render(text, options) {
      let processedText = text;
      const looksEscaped = /\\["nrt\\]/.test(text);
      if (looksEscaped) {
        let toParse = text.replace(/\\[nrt]/g, '').replace(/\\\\/g, "\\");
        if (!(toParse.startsWith('"') && toParse.endsWith('"')) &&
            !(toParse.startsWith("'") && toParse.endsWith("'"))) {
          toParse = '"' + toParse.replace(/"/g, '\\"') + '"';
        }
        processedText = text;
      }

      this.mountHTML(processedText, 'rst-html-content', options);
    }
  };
}

if (typeof JSONRenderer === 'undefined') {
  window.JSONRenderer = class extends BaseRenderer {
  static EXPANDED_LEVELS = 2;

  render(jsonObj, options) {
    this.createLayer('rst-json-content', options).appendChild(this.createCollapsibleJSON(jsonObj, 0, null, true));
  }

  createCollapsibleJSON(obj, level = 0, key = null, startExpanded = false) {
    const container = document.createElement('div');
    container.className = 'rst-json-container';
    if (level === 0) {
      container.classList.add('level-0');
    } else if (level > 0) {
      container.classList.add('level-indent');
    }

    if (key !== null) {
      const keySpan = document.createElement('span');
      keySpan.className = 'rst-key';
      keySpan.textContent = `"${key}"`;
      container.appendChild(keySpan);

      const colon = document.createElement('span');
      colon.className = 'rst-colon';
      colon.textContent = ': ';
      container.appendChild(colon);
    }

    if (Array.isArray(obj)) {
      this._renderArray(obj, container, level, startExpanded);
    } else if (typeof obj === 'object' && obj !== null) {
      this._renderObject(obj, container, level, startExpanded);
    } else {
      this._renderPrimitive(obj, container);
    }

    return container;
  }

  _renderArray(obj, container, level, startExpanded) {
    if (obj.length === 0) {
      const emptyArray = document.createElement('span');
      emptyArray.className = 'rst-empty-array';
      emptyArray.textContent = '[]';
      container.appendChild(emptyArray);
      return;
    }

    const wrapper = document.createElement('span');
    wrapper.className = 'rst-wrapper';

    const icon = this._createIcon(startExpanded);
    const summary = document.createElement('span');
    summary.className = 'rst-summary';

    const bracket = document.createElement('span');
    bracket.className = 'rst-bracket';
    bracket.textContent = '[';

    const preview = document.createElement('span');
    preview.className = 'rst-preview';
    preview.textContent = startExpanded ? '' : `${obj.length}`;

    const closeBracket = document.createElement('span');
    closeBracket.className = 'rst-ellipsis';
    closeBracket.textContent = startExpanded ? '' : ' … ]';

    summary.appendChild(icon);
    summary.appendChild(bracket);
    summary.appendChild(preview);
    summary.appendChild(closeBracket);

    let collapsed = !startExpanded;
    const children = document.createElement('div');
    children.className = startExpanded ? 'rst-children visible' : 'rst-children hidden';

    obj.forEach((item, idx) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'rst-child-item';
      itemDiv.appendChild(this.createCollapsibleJSON(item, level + 1, null, level + 1 < JSONRenderer.EXPANDED_LEVELS));

      if (idx < obj.length - 1) {
        const comma = document.createElement('span');
        comma.className = 'rst-comma';
        comma.textContent = ',';
        itemDiv.appendChild(comma);
      }

      children.appendChild(itemDiv);
    });

    const closingLine = document.createElement('div');
    closingLine.className = 'rst-closing-bracket';
    closingLine.textContent = ']';
    children.appendChild(closingLine);

    summary.addEventListener('click', (e) => {
      e.stopPropagation();
      collapsed = !collapsed;
      children.className = collapsed ? 'rst-children hidden' : 'rst-children visible';
      icon.textContent = collapsed ? '▶' : '▼';
      closeBracket.textContent = collapsed ? ' … ]' : '';
      preview.textContent = collapsed ? `${obj.length}` : '';
    });

    wrapper.appendChild(summary);
    container.appendChild(wrapper);
    container.appendChild(children);
  }

  _renderObject(obj, container, level, startExpanded) {
    const keys = Object.keys(obj);

    if (keys.length === 0) {
      const emptyObject = document.createElement('span');
      emptyObject.className = 'rst-empty-object';
      emptyObject.textContent = '{}';
      container.appendChild(emptyObject);
      return;
    }

    const wrapper = document.createElement('span');
    wrapper.className = 'rst-wrapper';

    const icon = this._createIcon(startExpanded);
    const summary = document.createElement('span');
    summary.className = 'rst-summary';

    const brace = document.createElement('span');
    brace.className = 'rst-brace';
    brace.textContent = '{';

    const preview = document.createElement('span');
    preview.className = 'rst-preview';
    if (!startExpanded && keys.length > 0) {
      const firstKey = keys[0];
      preview.textContent = keys.length === 1 ? `"${firstKey}"` : `${keys.length}`;
    }

    const closeBrace = document.createElement('span');
    closeBrace.className = 'rst-ellipsis';
    closeBrace.textContent = startExpanded ? '' : ' … }';

    summary.appendChild(icon);
    summary.appendChild(brace);
    summary.appendChild(preview);
    summary.appendChild(closeBrace);

    let collapsed = !startExpanded;
    const children = document.createElement('div');
    children.className = startExpanded ? 'rst-children visible' : 'rst-children hidden';

    keys.forEach((k, idx) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'rst-child-item';
      itemDiv.appendChild(this.createCollapsibleJSON(obj[k], level + 1, k, level + 1 < JSONRenderer.EXPANDED_LEVELS));

      if (idx < keys.length - 1) {
        const comma = document.createElement('span');
        comma.className = 'rst-comma';
        comma.textContent = ',';
        itemDiv.appendChild(comma);
      }

      children.appendChild(itemDiv);
    });

    const closingLine = document.createElement('div');
    closingLine.className = 'rst-closing-brace';
    closingLine.textContent = '}';
    children.appendChild(closingLine);

    summary.addEventListener('click', (e) => {
      e.stopPropagation();
      collapsed = !collapsed;
      children.className = collapsed ? 'rst-children hidden' : 'rst-children visible';
      icon.textContent = collapsed ? '▶' : '▼';
      closeBrace.textContent = collapsed ? ' … }' : '';

      if (collapsed && keys.length > 0) {
        const firstKey = keys[0];
        preview.textContent = keys.length === 1 ? `"${firstKey}"` : `${keys.length}`;
      } else {
        preview.textContent = '';
      }
    });

    wrapper.appendChild(summary);
    container.appendChild(wrapper);
    container.appendChild(children);
  }

  _renderPrimitive(obj, container) {
    const valueSpan = document.createElement('span');
    valueSpan.className = 'rst-value';

    if (typeof obj === 'string') {
      valueSpan.classList.add('rst-value-string');
      valueSpan.textContent = JSON.stringify(obj);
    } else if (typeof obj === 'number') {
      valueSpan.classList.add('rst-value-number');
      valueSpan.textContent = obj;
    } else if (typeof obj === 'boolean') {
      valueSpan.classList.add('rst-value-boolean');
      valueSpan.textContent = obj;
    } else if (obj === null) {
      valueSpan.classList.add('rst-value-null');
      valueSpan.textContent = 'null';
    } else {
      valueSpan.classList.add('rst-value-default');
      valueSpan.textContent = JSON.stringify(obj);
    }

    container.appendChild(valueSpan);
  }

  _createIcon(isExpanded) {
    const icon = document.createElement('span');
    icon.className = 'rst-icon';
    icon.textContent = isExpanded ? '▼' : '▶';
    return icon;
  }
  };
}

if (typeof MarkdownRenderer === 'undefined') {
  window.MarkdownRenderer = class extends BaseRenderer {
    render(markdown, options) {
      this.mountHTML(MarkdownParser.toHTML(markdown), 'rst-html-content rst-markdown-content', options);
    }
  };
}
