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

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'renderSelectedText') {
      const text = request.text;
      let jsonObj = null;

      jsonObj = JSONParser.parse(text);
      if (jsonObj === null) jsonObj = RubyParser.parse(text);
      if (jsonObj === null) jsonObj = PHPParser.parse(text);

      if (jsonObj !== null) {
        jsonRenderer.render(jsonObj);
      } else {
        const pageSelection = readPageSelection();
        const markdown = pageSelection.trim() ? pageSelection : text;
        if (MarkdownParser.isMarkdown(markdown)) {
          markdownRenderer.render(markdown);
        } else {
          htmlRenderer.render(text);
        }
      }

      sendResponse({ status: 'success' });
    }
  });
}
