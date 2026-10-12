// Carga de un conjunto de datos en el mapa (el del DENUE o un CSV).
import { AREA, LOCALE, PALETTE } from "./config.js";
import { fit } from "./map.js";
import { clearMarkers } from "./markers.js";
import { render } from "./render.js";
import { state } from "./state.js";
import { buildChips } from "./ui/chips.js";
import { stopPlay } from "./ui/controls.js";
import { hideDetail } from "./ui/detail.js";
import { $, esc } from "./utils/dom.js";

export function setMsg(text, isError) {
  const msg = $("msg");
  msg.textContent = text;
  msg.className = "msg" + (isError ? " err" : "");
}

const outsideArea = r => r.lat < AREA.minLat || r.lat > AREA.maxLat || r.lng < AREA.minLng || r.lng > AREA.maxLng;

// `source` es "denue" o "csv"; `info` = {name, bad} describe el CSV cargado
export function loadRows(rows, source, info = {}) {
  stopPlay();
  state.rows = rows;
  state.source = source;
  state.years = [...new Set(rows.map(r => r.year))].sort((a, b) => a - b);
  // Categorías y, dentro de cada una, sus actividades; ambas de la más a la menos frecuente
  const count = {}, subCount = {};
  for (const r of rows) {
    r.sub ??= "";
    r.leaf = r.cat + "" + r.sub;
    count[r.cat] = (count[r.cat] || 0) + 1;
    const subs = subCount[r.cat] ??= {};
    subs[r.sub] = (subs[r.sub] || 0) + 1;
  }
  state.cats = Object.keys(count).sort((a, b) => count[b] - count[a]);
  state.tree = state.cats.map(cat => ({
    cat,
    subs: Object.keys(subCount[cat]).sort((a, b) => subCount[cat][b] - subCount[cat][a]).map(name => ({ name, leaf: cat + "" + name })),
  }));
  state.color = {};
  state.cats.forEach((c, i) => { state.color[c] = PALETTE[i % PALETTE.length]; });
  state.active = new Set(rows.map(r => r.leaf));
  state.yi = 0;
  hideDetail();
  clearMarkers();

  const slider = $("yr");
  slider.max = state.years.length - 1;
  slider.value = 0;
  $("srcline").innerHTML = "Mostrando <b>" + esc(source === "denue" ? "DENUE (INEGI)" : info.name) + "</b>: " +
    rows.length.toLocaleString(LOCALE) + " registros, " + state.years[0] + "–" + state.years[state.years.length - 1] + "." +
    (source === "denue" ? " Sube un CSV para ver otros datos." : "");

  const warnings = [];
  if (info.bad) warnings.push(info.bad + " filas omitidas por año o coordenadas inválidas");
  const outside = rows.filter(outsideArea).length;
  if (outside) warnings.push(outside + " registros caen fuera del área de Ciudad del Carmen");
  setMsg(warnings.join(" · "), false);

  buildChips();
  render(false);
  fit();
}
