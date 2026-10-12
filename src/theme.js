// Tema claro/oscuro: sigue al sistema hasta que se usa el botón, que fija data-theme en <html> y lo recuerda.
// Lo que se pinta con colores leídos de las variables CSS se repinta al cambiar.
import { refreshBasemap } from "./map.js";
import { restyleMarkers } from "./markers.js";
import { drawBars } from "./ui/bars.js";
import { $, isDark } from "./utils/dom.js";

const STORAGE_KEY = "tema"; // el script de index.html lee la misma clave
const ICON_MOON = '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="currentColor"/></svg>';
const ICON_SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4" fill="currentColor"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/></svg>';

// El botón muestra el tema al que se cambiaría
function syncButton() {
  const dark = isDark(), label = dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
  const button = $("theme");
  button.innerHTML = dark ? ICON_SUN : ICON_MOON;
  button.title = label;
  button.setAttribute("aria-label", label);
}

function retheme() {
  syncButton();
  refreshBasemap();
  restyleMarkers();
  drawBars();
}

function toggleTheme() {
  const theme = isDark() ? "light" : "dark";
  document.documentElement.dataset.theme = theme; // el MutationObserver dispara retheme()
  try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) { /* sin almacenamiento: dura hasta recargar */ }
}

export function initTheme() {
  syncButton();
  $("theme").onclick = toggleTheme;
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", retheme);
  new MutationObserver(retheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
}
