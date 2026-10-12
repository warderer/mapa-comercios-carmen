// Lecturas del panel: año, cambio contra el año anterior, conteo por categoría y actividad, y barras.
import { LOCALE } from "../config.js";
import { state, visible } from "../state.js";
import { $ } from "../utils/dom.js";
import { drawBars } from "./bars.js";

// `target` son los comercios visibles en el año actual (Map key -> fila)
export function updateReadouts(target) {
  const year = state.years[state.yi];
  $("yearnum").textContent = year ?? "—";
  $("yearbig").textContent = year ?? "";
  $("yr").value = state.yi;

  const delta = $("delta"), total = "<b>" + target.size.toLocaleString(LOCALE) + "</b> comercios";
  if (state.yi > 0) {
    const prev = visible(state.yi - 1);
    let added = 0, gone = 0;
    target.forEach((_, k) => { if (!prev.has(k)) added++; });
    if (state.mode === "year") prev.forEach((_, k) => { if (!target.has(k)) gone++; });
    delta.innerHTML = total + " · <span class='up'>+" + added + " nuevos</span>" +
      (state.mode === "year" ? " · <span class='down'>−" + gone + " ya no están</span>" : "") +
      " vs " + state.years[state.yi - 1];
  } else delta.innerHTML = total + " en el primer año";

  // Conteo por categoría y por actividad; cada casilla del filtro lleva su clave en data-key
  const count = {};
  target.forEach(r => {
    count[r.cat] = (count[r.cat] || 0) + 1;
    count[r.leaf] = (count[r.leaf] || 0) + 1;
  });
  document.querySelectorAll("#chips .n").forEach(el => { el.textContent = count[el.dataset.key] || 0; });
  drawBars();
}
