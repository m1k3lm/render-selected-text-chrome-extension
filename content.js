// content.js
const script = document.createElement('script');
script.src = chrome.runtime.getURL('module-content.js');
script.type = 'module';
script.onload = () => {
  script.remove();
};
(document.head || document.documentElement).appendChild(script);

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'renderSelectedText') {
    window.RSTCE.renderSelectedText(request.text);
  }
});
