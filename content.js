let lastElement = null;
document.addEventListener("contextmenu", (e) => { lastElement = e.target; }, true);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "get_url") {
    let foundUrl = null;
    let ext = "jpg";
    let user = "usuario";

    const container = lastElement?.closest('article') || lastElement?.closest('div[role="dialog"]') || lastElement?.closest('section');

    // Intentar obtener el usuario
    const userTag = container?.querySelector('header a, h2 a');
    if (userTag) user = userTag.innerText.split('\n')[0].trim();

    // BUSCADOR DE VIDEO (Bypass de Blob)
    const video = container?.querySelector('video');
    if (video) {
      ext = "mp4";
      // 1. Intentar sacar la URL de los metadatos de la página
      const scripts = document.querySelectorAll('script');
      for (let script of scripts) {
        if (script.innerText.includes('video_url')) {
          // Buscamos una URL que termine en .mp4 dentro del texto del script
          const match = script.innerText.match(/"video_url":"([^"]+)"/);
          if (match && match[1]) {
            foundUrl = match[1].replace(/\\u0026/g, '&');
            break;
          }
        }
      }

      // 2. Si falla, buscar el poster o la versión de previsualización que a veces es el MP4 real
      if (!foundUrl || foundUrl.startsWith('blob')) {
        foundUrl = video.getAttribute('src') || video.src;
      }
    } else {
      // BUSCADOR DE IMAGEN
      const img = container?.querySelector('img');
      if (img) {
        foundUrl = img.src;
        ext = "jpg";
      }
    }

    sendResponse({ url: foundUrl, user: user, ext: ext });
  }
  return true;
});