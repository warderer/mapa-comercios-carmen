// Ficha del comercio seleccionado.
import { markers, restyleMarkers } from "../markers.js";
import { state } from "../state.js";
import { $, esc } from "../utils/dom.js";

// [2018, 2019, 2020, 2023] -> "2018–2020, 2023"
function rangeText(years) {
  const parts = [];
  let start = years[0], end = years[0];
  for (let i = 1; i <= years.length; i++) {
    if (years[i] === end + 1) end = years[i];
    else { parts.push(start === end ? start : start + "–" + end); start = end = years[i]; }
  }
  return parts.join(", ");
}

export function hideDetail() {
  state.selected = null;
  $("detail").hidden = true;
}

export function select(key) {
  state.selected = key;
  const all = state.rows.filter(r => r.key === key).sort((a, b) => a.year - b.year);
  const moved = new Set(all.map(a => a.lat.toFixed(5) + a.lng.toFixed(5))).size > 1;
  // Se muestra la fila que está en el mapa; si no hay, la más reciente
  const cur = markers.get(key)?.row || all[all.length - 1];
  let extra = "";
  for (const k in cur.extra) extra += `<dt>${esc(k)}</dt><dd>${esc(cur.extra[k])}</dd>`;
  const detail = $("detail");
  detail.hidden = false;
  detail.innerHTML = `<p class="lbl">Comercio seleccionado <button id="closeD">Cerrar</button></p><h2>${esc(cur.nombre)}</h2>
   <div class="row" style="gap:6px;font-size:.85rem"><i class="dot" style="background:${state.color[cur.cat]}"></i>${esc(cur.cat)}</div>
   <dl>${cur.sub ? `<dt>Actividad</dt><dd>${esc(cur.sub)}</dd>` : ""}<dt>Años</dt><dd>${rangeText(all.map(a => a.year))}</dd><dt>Coordenadas</dt><dd style="font-family:var(--mono)">${cur.lat.toFixed(5)}, ${cur.lng.toFixed(5)}</dd>
   ${moved ? "<dt>Domicilio</dt><dd>Cambió de ubicación en el periodo</dd>" : ""}<dt>ID</dt><dd style="font-family:var(--mono)">${esc(key)}</dd>${extra}</dl>`;
  $("closeD").onclick = () => { hideDetail(); restyleMarkers(); };
  restyleMarkers();
}
