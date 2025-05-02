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
  document.body.appendChild(layer);
  return layer;
}

function renderHTML(text) {
  const layer = createLayer();
  const content = document.createElement('div');
  content.innerHTML = text;
  layer.appendChild(content);
}

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  if (request.action === 'renderSelectedText') {
    renderHTML(request.text);
  }
});
