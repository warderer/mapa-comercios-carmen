// Carga de los datos del DENUE en el mapa.
import { PALETTE } from "./config.js";
import { loadDenue } from "./data/denue.js";
import { fit } from "./map.js";
import { clearMarkers } from "./markers.js";
import { render } from "./render.js";
import { state } from "./state.js";
import { buildChips } from "./ui/chips.js";
import { stopPlay } from "./ui/controls.js";
import { hideDetail } from "./ui/detail.js";
import { $ } from "./utils/dom.js";

function setMsg(text, isError) {
  const msg = $("msg");
  msg.textContent = text;
  msg.className = "msg" + (isError ? " err" : "");
}

function loadRows(rows) {
  stopPlay();
  state.rows = rows;
  state.years = [...new Set(rows.map(r => r.year))].sort((a, b) => a - b);
  // Categorías y, dentro de cada una, sus actividades; ambas de la más a la menos frecuente
  const count = {}, subCount = {};
  for (const r of rows) {
    r.sub ??= "";
    r.leaf = r.cat + "\x1f" + r.sub;
    count[r.cat] = (count[r.cat] || 0) + 1;
    const subs = subCount[r.cat] ??= {};
    subs[r.sub] = (subs[r.sub] || 0) + 1;
  }
  state.cats = Object.keys(count).sort((a, b) => count[b] - count[a]);
  state.tree = state.cats.map(cat => ({
    cat,
    subs: Object.keys(subCount[cat]).sort((a, b) => subCount[cat][b] - subCount[cat][a]).map(name => ({ name, leaf: cat + "\x1f" + name })),
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

  buildChips();
  render(false);
  fit();
}

export async function loadData() {
  setMsg("Cargando datos del DENUE…", false);
  try {
    loadRows(await loadDenue());
    setMsg("", false);
  } catch (e) {
    setMsg(e.message, true);
  }
}
