chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    id: "renderSelectedText",
    title: "Render selected text",
    contexts: ["selection"]
  }, function() {
    if (chrome.runtime.lastError) {
      console.error("Error creating context menu:", chrome.runtime.lastError);
    }
  });
});

chrome.contextMenus.onClicked.addListener(async function(info, tab) {
  if (info.menuItemId === "renderSelectedText") {
    try {
      // Inject CSS
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ["styles.css"]
      });

      // Inject scripts in order
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: [
          "parsers/json-parser.js",
          "parsers/ruby-parser.js",
          "parsers/php-parser.js",
          "parsers/toon-parser.js",
          "parsers/markdown-parser.js",
          "settings.js",
          "renderers.js",
          "content.js"
        ]
      });

      // Send message to render the selected text
      await chrome.tabs.sendMessage(tab.id, { 
        action: "renderSelectedText", 
        text: info.selectionText 
      });
    } catch (error) {
      console.log('Cannot render on this page:', error.message);
    }
  }
});
