// Mapa Leaflet: mosaicos de CARTO u OpenStreetMap y, si no cargan, un contorno simplificado de la costa.
import L from "leaflet";
import { CARTO_KEY, CENTER, DEFAULT_ZOOM, LIGHT_BG } from "./config.js";
import LAND from "./data/land.json";
import { state } from "./state.js";
import { $, cssVar } from "./utils/dom.js";

export const map = L.map("map", { preferCanvas: true, zoomControl: false, minZoom: 10, maxZoom: 18 }).setView(CENTER, DEFAULT_ZOOM);
L.control.zoom({ position: "topright" }).addTo(map);
map.attributionControl.setPrefix(false);

const HIDDEN = { fillOpacity: 0, opacity: 0 };
const landStyle = () => ({ color: cssVar("--land-edge"), weight: 1, fillColor: cssVar("--land"), fillOpacity: 1, opacity: 1 });
const landLayer = L.geoJSON(LAND, { interactive: false, style: landStyle }).addTo(map);

const isDark = () => cssVar("--bg").toLowerCase() !== LIGHT_BG;
let tilesOk = false, tiles = null;

function addTiles() {
  if (tiles) map.removeLayer(tiles);
  const style = isDark() ? "dark_all" : "light_all";
  const osm = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
  tiles = CARTO_KEY
    ? L.tileLayer("https://basemaps.cartocdn.com/rastertiles/" + style + "/{z}/{x}/{y}.png?key=" + encodeURIComponent(CARTO_KEY), {
        maxZoom: 19,
        attribution: osm + ' · © <a href="https://carto.com/attributions">CARTO</a>',
      })
    : L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: osm });
  // Con el primer mosaico cargado se oculta el contorno; si falla antes, se queda el contorno
  tiles.on("tileload", () => {
    if (!tilesOk) { tilesOk = true; landLayer.setStyle(HIDDEN); $("note").hidden = true; }
  });
  tiles.on("tileerror", () => {
    if (!tilesOk) { map.removeLayer(tiles); tiles = null; showFallbackNote(); }
  });
  tiles.addTo(map);
}

function showFallbackNote() {
  map.attributionControl.addAttribution("Contorno: Natural Earth");
  const note = $("note");
  note.hidden = false;
  note.textContent = "Mapa base simplificado: no se pudieron cargar los mosaicos externos. Revisa tu conexión a internet y recarga la página para ver las calles de OpenStreetMap.";
}

// Repinta el mapa base cuando cambia el tema claro/oscuro
export function refreshBasemap() {
  landLayer.setStyle(tilesOk ? HIDDEN : landStyle());
  if (tilesOk) addTiles();
}

// Encuadra los comercios de las categorías activas
export function fit() {
  const pts = state.rows.filter(r => state.active.has(r.cat)).map(r => [r.lat, r.lng]);
  if (pts.length) map.fitBounds(L.latLngBounds(pts).pad(.12), { maxZoom: 16 });
  else map.setView(CENTER, DEFAULT_ZOOM);
}

addTiles();
map.on("mousemove", e => { $("coords").textContent = e.latlng.lat.toFixed(5) + ", " + e.latlng.lng.toFixed(5); });
