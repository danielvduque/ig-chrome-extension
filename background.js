chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: "downloadInsta", title: "Descargar de Instagram", contexts: ["all"] });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "downloadInsta") {
    chrome.tabs.sendMessage(tab.id, { action: "get_url" }, (response) => {
      if (chrome.runtime.lastError || !response || !response.url) return;

      // Si detectamos que sigue siendo un Blob después de intentar el bypass
      if (response.url.startsWith('blob')) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => alert("Instagram ha bloqueado este video. Para bajarlo, prueba a abrir el video en pantalla completa (Reel) y dale clic derecho al nombre de usuario.")
        });
        return;
      }

      // LIMPIEZA DE URL: Instagram añade parámetros que bloquean la descarga externa
      let finalUrl = response.url.includes('?') ? response.url.split('?')[0] : response.url;
      // Pero mantenemos los tokens de seguridad si existen
      if (response.url.includes('token=')) finalUrl = response.url;

      chrome.downloads.download({
        url: response.url, // Usamos la original por si la limpieza falla
        filename: `Insta_${response.user}_${Date.now()}.${response.ext}`,
        conflictAction: "uniquify"
      }, (id) => {
        if (chrome.runtime.lastError) {
          console.error("Error final:", chrome.runtime.lastError.message);
        }
      });
    });
  }
});