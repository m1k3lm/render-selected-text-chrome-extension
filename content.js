if (!window.rstInitialized) {
  window.rstInitialized = true;
  
  const jsonRenderer = new JSONRenderer();
  const htmlRenderer = new HTMLRenderer();

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
        htmlRenderer.render(text);
      }

      sendResponse({ status: 'success' });
    }
  });
}
