if (!window.rstInitialized) {
  window.rstInitialized = true;

  const jsonRenderer = new JSONRenderer();
  const htmlRenderer = new HTMLRenderer();
  const markdownRenderer = new MarkdownRenderer();

  // Chrome's contextMenus selectionText drops line breaks, which TOON and Markdown need to tell lines apart.
  const readPageSelection = () => {
    const field = document.activeElement;
    if (typeof field?.selectionStart === 'number') {
      return field.value.slice(field.selectionStart, field.selectionEnd);
    }
    return window.getSelection().toString();
  };

  const render = (text, theme) => {
    const structuredParsers = [['json', JSONParser], ['ruby', RubyParser], ['php', PHPParser]];
    for (const [format, parser] of structuredParsers) {
      const jsonObj = parser.parse(text);
      if (jsonObj !== null) {
        jsonRenderer.render(jsonObj, { theme, format });
        return;
      }
    }

    const pageSelection = readPageSelection();
    const multilineText = pageSelection.trim() ? pageSelection : text;
    const toon = TOONParser.parse(multilineText);
    if (toon !== null) {
      jsonRenderer.render(toon, { theme, format: 'toon' });
    } else if (MarkdownParser.isMarkdown(multilineText)) {
      markdownRenderer.render(multilineText, { theme, format: 'markdown' });
    } else {
      htmlRenderer.render(text, { theme, format: 'html' });
    }
  };

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'renderSelectedText') {
      RSTSettings.loadTheme().then((theme) => {
        render(request.text, theme);
        sendResponse({ status: 'success' });
      });
      return true;
    }
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync' || !changes.theme) return;
    const theme = RSTSettings.normalizeTheme(changes.theme.newValue);
    document.querySelectorAll('.rst-overlay').forEach((overlay) => {
      overlay.dataset.rstTheme = theme;
    });
  });
}
