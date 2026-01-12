console.log("InstaDownloader: Script inyectado con éxito.");

let lastElement = null;

// Capturamos el elemento justo al hacer clic derecho
document.addEventListener("contextmenu", (e) => {
  lastElement = e.target;
}, true);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "get_url") {
    // Buscamos la imagen con un selector más agresivo
    // 1. Si es una imagen directa
    // 2. Si es el contenedor que tiene una imagen dentro
    // 3. Si es la capa transparente de Instagram, buscamos hacia atrás (sibling)
    let img = lastElement.tagName === 'IMG' ? lastElement : null;

    if (!img) {
      // Instagram suele poner la imagen como un hermano anterior del div transparente
      const parent = lastElement.closest('div');
      img = parent?.querySelector('img') || parent?.previousElementSibling?.querySelector('img');
    }

    // Intentar obtener el nombre de usuario
    const article = lastElement.closest('article');
    const user = article?.querySelector('header a')?.innerText?.split('\n')[0].trim() || "usuario";

    if (img && img.src) {
      sendResponse({ url: img.src, user: user });
    } else {
      console.log("No se detectó imagen en este elemento:", lastElement);
      sendResponse({ url: null });
    }
  }
  return true; // CRÍTICO: Mantiene el puerto abierto para respuestas asíncronas
});