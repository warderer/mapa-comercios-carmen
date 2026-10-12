// Estado compartido de la aplicación.
// Cada fila de `rows` es {key, nombre, cat, sub, leaf, year, lat, lng, extra}: un comercio en un año.
// `sub` es la actividad dentro de la categoría (puede ir vacía) y `leaf` identifica al par categoría+actividad.
export const state = {
  rows: [],
  years: [],          // años presentes en los datos, ordenados
  cats: [],           // categorías, de la más a la menos frecuente
  color: {},          // categoría -> color
  tree: [],           // categorías con sus actividades: [{cat, subs: [{name, leaf}]}]
  active: new Set(),  // hojas (categoría+actividad) marcadas en el filtro
  emoji: false,       // marcadores como emojis en lugar de círculos
  yi: 0,              // índice del año actual dentro de `years`
  mode: "year",       // "year" = solo ese año · "acum" = acumulado hasta ese año
  dur: 1100,          // milisegundos por año al reproducir
  playing: false,
  timer: null,
  selected: null,     // key del comercio seleccionado
};

// Comercios visibles en el año de índice `yi`: Map key -> fila más reciente que aplica
export function visible(yi, mode = state.mode, active = state.active) {
  const year = state.years[yi];
  const out = new Map();
  for (const r of state.rows) {
    if (!active.has(r.leaf)) continue;
    if (mode === "year" ? r.year === year : r.year <= year) {
      const prev = out.get(r.key);
      if (!prev || r.year > prev.year) out.set(r.key, r);
    }
  }
  return out;
}
