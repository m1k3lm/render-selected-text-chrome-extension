chrome.runtime.onStartup.addListener(function() {
  chrome.contextMenus.update({
    id: "renderSelectedText",
    title: "Render selected text",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "renderSelectedText") {
    chrome.tabs.sendMessage(tab.id, { action: "renderSelectedText", text: info.selectionText });
  }
});
