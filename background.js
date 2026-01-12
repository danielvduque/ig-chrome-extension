chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "downloadInsta",
    title: "Descargar Imagen de Instagram",
    contexts: ["all"],
    documentUrlPatterns: ["*://*.instagram.com/*"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "downloadInsta") {
    chrome.tabs.sendMessage(tab.id, { action: "get_url" }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn("Error de conexión (es normal si la página no se ha refrescado):", chrome.runtime.lastError.message);
        return;
      }

      if (response && response.url) {
        const date = new Date().toISOString().split('T')[0];
        const uuid = Math.random().toString(36).substring(2, 8);
        const filename = `${uuid}_${date}.jpg`;

        chrome.downloads.download({
          url: response.url,
          filename: filename
        });
      }
    });
  }
});