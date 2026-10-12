// Tema: lo que se pinta con colores leídos de las variables CSS se repinta al cambiar claro/oscuro.
import { refreshBasemap } from "./map.js";
import { restyleMarkers } from "./markers.js";
import { drawBars } from "./ui/bars.js";

function retheme() {
  refreshBasemap();
  restyleMarkers();
  drawBars();
}

export function initTheme() {
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", retheme);
  new MutationObserver(retheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
}
