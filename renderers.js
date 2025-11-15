if (typeof BaseRenderer === 'undefined') {
  window.BaseRenderer = class {
    createLayer() {
      const layer = document.createElement('div');
      layer.className = 'rst-overlay';
      layer.id = 'rendered-html-layer';

      const innerLayer = document.createElement('div');
      innerLayer.className = 'rst-inner-layer';

      const title = document.createElement('div');
      title.className = 'rst-header-title';
      title.innerHTML = '<span class="rst-title-icon">📄</span> Rendered Content <span class="rst-esc-hint">Press ESC to close</span>';
      innerLayer.appendChild(title);

      const closeLayer = () => {
        layer.classList.add('rst-closing');
        setTimeout(() => layer.remove(), 200);
      };

      const closeButton = document.createElement('button');
      closeButton.innerHTML = '&times;';
      closeButton.className = 'rst-close-button';
      closeButton.title = 'Close (ESC)';
      closeButton.addEventListener('click', closeLayer);

      const handleKeyPress = (e) => {
        if (e.key === 'Escape') {
          closeLayer();
          document.removeEventListener('keydown', handleKeyPress);
        }
      };
      document.addEventListener('keydown', handleKeyPress);

      innerLayer.appendChild(closeButton);
      layer.appendChild(innerLayer);
      document.body.appendChild(layer);
      return innerLayer;
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
    render(text) {
      const innerLayer = this.createLayer();
      const content = document.createElement('div');
      content.className = 'rst-content rst-html-content';

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

      content.innerHTML = processedText;
      innerLayer.appendChild(content);
    }
  };
}

if (typeof JSONRenderer === 'undefined') {
  window.JSONRenderer = class extends BaseRenderer {
  render(jsonObj) {
    const innerLayer = this.createLayer();
    const content = document.createElement('div');
    content.className = 'rst-content rst-json-content';
    content.appendChild(this.createCollapsibleJSON(jsonObj, 0, null, true));
    innerLayer.appendChild(content);
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
      itemDiv.appendChild(this.createCollapsibleJSON(item, level + 1));

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

    icon.addEventListener('mouseover', () => {
      icon.style.color = '#333';
    });
    icon.addEventListener('mouseout', () => {
      icon.style.color = '#666';
    });

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
      itemDiv.appendChild(this.createCollapsibleJSON(obj[k], level + 1, k));

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

    icon.addEventListener('mouseover', () => {
      icon.style.color = '#333';
    });
    icon.addEventListener('mouseout', () => {
      icon.style.color = '#666';
    });

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
