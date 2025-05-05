/**
 * Crea una capa div que ocupa toda la pantalla y contiene
 * otra capa interna centrada y con un botón de cierre.
 *
 * La capa interna tiene un ancho y alto máximos del 80% y
 * 90% respectivamente, y un borde redondeado y sombra.
 *
 * El botón de cierre tiene una posición absoluta en la esquina
 * superior derecha y un tamaño de fuente de 2rem.
 *
 * @returns {HTMLElement} La capa interna centrada.
 */
function createLayer() {
  const layer = document.createElement('div');
  layer.id = 'rendered-html-layer';
  layer.style.position = 'fixed';
  layer.style.top = '0';
  layer.style.left = '0';
  layer.style.width = '100%';
  layer.style.height = '100%';
  layer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  layer.style.zIndex = '9999';
  layer.style.display = 'flex';
  layer.style.justifyContent = 'center';
  layer.style.alignItems = 'center';
  layer.style.color = 'white';
  layer.style.padding = '20px';
  layer.style.boxSizing = 'border-box';

  // Capa interna centrada
  const innerLayer = document.createElement('div');
  innerLayer.style.position = 'relative';
  innerLayer.style.width = '80%';
  innerLayer.style.height = '90%';
  innerLayer.style.backgroundColor = 'white';
  innerLayer.style.color = 'black';
  innerLayer.style.borderRadius = '12px';
  innerLayer.style.boxShadow = '0 2px 16px rgba(0,0,0,0.2)';
  innerLayer.style.overflow = 'auto';
  innerLayer.style.display = 'flex';
  innerLayer.style.flexDirection = 'column';

  // Botón de cierre
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '12px';
  closeButton.style.right = '16px';
  closeButton.style.background = 'transparent';
  closeButton.style.border = 'none';
  closeButton.style.fontSize = '2rem';
  closeButton.style.cursor = 'pointer';
  closeButton.style.color = '#333';
  closeButton.style.zIndex = '10000';
  closeButton.addEventListener('click', () => {
    layer.remove();
  });

  innerLayer.appendChild(closeButton);
  layer.appendChild(innerLayer);
  document.body.appendChild(layer);
  return innerLayer;
}

/**
 * Converts HTML entities in a string to their corresponding characters.
 *
 * @param {string} text - The HTML-encoded string to be converted.
 * @returns {string} The decoded string with HTML entities replaced by their character equivalents.
 */

function unescapeHTML(text) {
  const temp = document.createElement('textarea');
  temp.innerHTML = text;
  return temp.value;
}

/**
 * Renders the given HTML text as a layer on top of the current page.
 *
 * @param {string} text - The HTML text to be rendered.
 */
function renderHTML(text) {
  const innerLayer = createLayer();
  const content = document.createElement('div');
  content.style.flex = '1';
  content.style.overflow = 'auto';
  content.style.padding = '32px';
  content.innerHTML = unescapeHTML(text);
  innerLayer.appendChild(content);
}

/**
 * Renders a prettified JSON representation of the given object or array.
 *
 * @param {Object|Array} jsonObj - The JSON object or array to be represented.
 */
function renderPrettifiedJSON(jsonObj) {
  const innerLayer = createLayer();
  const content = document.createElement('div');
  content.style.flex = '1';
  content.style.overflow = 'auto';
  content.style.padding = '32px';
  content.appendChild(createCollapsibleJSON(jsonObj));
  innerLayer.appendChild(content);
}

/**
 * Creates a collapsible HTML representation of a JSON object or array.
 *
 * @param {Object|Array} obj - The JSON object or array to be represented.
 * @param {number} level - The indentation level for nested objects/arrays. Default is 0.
 * @returns {HTMLElement} The DOM element containing the collapsible representation.
 */

function createCollapsibleJSON(obj, level = 0) {
  const container = document.createElement('div');
  container.style.marginLeft = level ? '16px' : '0';
  if (Array.isArray(obj)) {
    const summary = document.createElement('span');
    summary.textContent = `[Array(${obj.length})]`;
    summary.style.cursor = 'pointer';
    summary.style.fontWeight = 'bold';
    let collapsed = true;
    const children = document.createElement('div');
    children.style.display = 'none';
    obj.forEach((item, idx) => {
      const itemDiv = document.createElement('div');
      itemDiv.appendChild(createCollapsibleJSON(item, level + 1));
      children.appendChild(itemDiv);
    });
    /**
     * Toggles the display of the child elements by clicking on the summary.
     * Updates the summary text to indicate whether the children are collapsed or expanded.
     */
    summary.onclick = () => {
      collapsed = !collapsed;
      children.style.display = collapsed ? 'none' : 'block';
      summary.textContent = collapsed ? `[Array(${obj.length})]` : `[Array(${obj.length})] ▼`;
    };
    container.appendChild(summary);
    container.appendChild(children);
  } else if (typeof obj === 'object' && obj !== null) {
    const summary = document.createElement('span');
    summary.textContent = '{Object}';
    summary.style.cursor = 'pointer';
    summary.style.fontWeight = 'bold';
    let collapsed = true;
    const children = document.createElement('div');
    children.style.display = 'none';
    Object.keys(obj).forEach(key => {
      const keyDiv = document.createElement('div');
      keyDiv.innerHTML = `<span style='color:#555;'>"${key}"</span>: `;
      keyDiv.appendChild(createCollapsibleJSON(obj[key], level + 1));
      children.appendChild(keyDiv);
    });
    summary.onclick = () => {
      collapsed = !collapsed;
      children.style.display = collapsed ? 'none' : 'block';
      summary.textContent = collapsed ? '{Object}' : '{Object} ▼';
    };
    container.appendChild(summary);
    container.appendChild(children);
  } else {
    const valueSpan = document.createElement('span');
    valueSpan.style.color = '#008';
    valueSpan.textContent = JSON.stringify(obj);
    container.appendChild(valueSpan);
  }
  return container;
}

/**
 * Tries to parse a simple Ruby object (hash or array) into a JSON object.
 *
 * Detects simple cases like {"key"=>"value", :foo=>123, "arr"=>[1,2,3]}
 * and returns the equivalent JSON object or null if it fails.
 *
 * Does not cover all the complex cases (like nested objects or arrays).
 *
 * @param {string} text - The Ruby object to be parsed.
 * @returns {Object|Array|null} The JSON object or array if parsed successfully,
 *                              or null if the parsing fails.
 */
function tryParseRubyObject(text) {
  try {
    let ruby = text.trim();
    // Reemplaza símbolos :foo=> por "foo":
    ruby = ruby.replace(/:([a-zA-Z0-9_]+)\s*=>/g, '"$1":');
    // Reemplaza claves entre comillas "foo"=> por "foo":
    ruby = ruby.replace(/"([^"]+)"\s*=>/g, '"$1":');
    // Reemplaza nil por null
    ruby = ruby.replace(/\bnil\b/g, 'null');
    // Reemplaza true/false
    ruby = ruby.replace(/\btrue\b/g, 'true').replace(/\bfalse\b/g, 'false');
    // Reemplaza => por : (por si queda alguno)
    ruby = ruby.replace(/=>/g, ':');
    // Intenta parsear como JSON
    return JSON.parse(ruby);
  } catch (e) {
    return null;
  }
}

/**
 * Tries to parse a simple PHP object (array or stdClass) into a JSON object.
 *
 * Detects simple cases like array('foo' => 'bar', 'arr' => array(1,2,3))
 * and returns the equivalent JSON object or null if it fails.
 *
 * Does not cover all the complex cases (like nested objects or arrays).
 *
 * @param {string} text - The PHP object to be parsed.
 * @returns {Object|Array|null} The JSON object or array if parsed successfully,
 *                              or null if the parsing fails.
 */
function tryParsePHPObject(text) {
  try {
    let php = text.trim();
    // Reemplaza array( ... ) por [ ... ]
    php = php.replace(/array\s*\(([^)]*)\)/g, '[$1]');
    // Reemplaza 'clave' => por "clave":
    php = php.replace(/'([^']+)'\s*=>/g, '"$1":');
    // Reemplaza stdClass Object\n( ... ) por { ... }
    php = php.replace(/stdClass Object\s*\n*\s*\(([^)]*)\)/g, '{$1}');
    // Reemplaza => por :
    php = php.replace(/=>/g, ':');
    // Reemplaza null, true, false
    php = php.replace(/\bNULL\b/gi, 'null');
    php = php.replace(/\btrue\b/gi, 'true');
    php = php.replace(/\bfalse\b/gi, 'false');
    // Reemplaza comillas simples por dobles
    php = php.replace(/'/g, '"');
    // Intenta parsear como JSON
    return JSON.parse(php);
  } catch (e) {
    return null;
  }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'renderSelectedText') {
    let text = request.text;
    let isJSON = false;
    let jsonObj = null;
    // Intenta JSON
    try {
      jsonObj = JSON.parse(text);
      isJSON = true;
    } catch (e) {
      isJSON = false;
    }
    // Si no es JSON, intenta Ruby
    if (!isJSON) {
      jsonObj = tryParseRubyObject(text);
      isJSON = jsonObj !== null;
    }
    // Si no es Ruby, intenta PHP
    if (!isJSON) {
      jsonObj = tryParsePHPObject(text);
      isJSON = jsonObj !== null;
    }
    if (isJSON) {
      renderPrettifiedJSON(jsonObj);
    } else {
      renderHTML(text);
    }
    sendResponse({ status: 'success' });
  }
});
