// Estado compartido de la aplicación.
// Cada fila de `rows` es {key, nombre, cat, year, lat, lng, extra}: un comercio en un año.
export const state = {
  rows: [],
  years: [],          // años presentes en los datos, ordenados
  cats: [],           // categorías, de la más a la menos frecuente
  color: {},          // categoría -> color
  active: new Set(),  // categorías marcadas
  yi: 0,              // índice del año actual dentro de `years`
  mode: "year",       // "year" = solo ese año · "acum" = acumulado hasta ese año
  dur: 1100,          // milisegundos por año al reproducir
  playing: false,
  timer: null,
  source: "denue",    // "denue" | "csv"
  selected: null,     // key del comercio seleccionado
};

// Comercios visibles en el año de índice `yi`: Map key -> fila más reciente que aplica
export function visible(yi, mode = state.mode, active = state.active) {
  const year = state.years[yi];
  const out = new Map();
  for (const r of state.rows) {
    if (!active.has(r.cat)) continue;
    if (mode === "year" ? r.year === year : r.year <= year) {
      const prev = out.get(r.key);
      if (!prev || r.year > prev.year) out.set(r.key, r);
    }
  }
  return out;
}
