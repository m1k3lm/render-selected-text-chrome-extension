chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    id: "renderSelectedText",
    title: "Render selected text",
    contexts: ["selection"]
  }, function() {
    if (chrome.runtime.lastError) {
      console.error("Error al crear el menú contextual:", chrome.runtime.lastError);
    }
  });
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "renderSelectedText") {
    chrome.tabs.sendMessage(tab.id, { action: "renderSelectedText", text: info.selectionText });
  }
});
