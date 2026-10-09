if (!window.rstInitialized) {
  window.rstInitialized = true;

  const jsonRenderer = new JSONRenderer();
  const htmlRenderer = new HTMLRenderer();
  const markdownRenderer = new MarkdownRenderer();

  // Chrome's contextMenus selectionText drops line breaks, which Markdown needs to tell blocks apart.
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
    const markdown = pageSelection.trim() ? pageSelection : text;
    if (MarkdownParser.isMarkdown(markdown)) {
      markdownRenderer.render(markdown, { theme, format: 'markdown' });
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
