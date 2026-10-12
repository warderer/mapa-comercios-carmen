// Datos por defecto: establecimientos de Ciudad del Carmen según el DENUE (INEGI).
import url from "./comercios-cdc-denue.json?url";

// Campos del registro que se muestran en el detalle, con su etiqueta
const EXTRA = {
  razon_social: "Razón social",
  personal: "Personal",
  asentamiento: "Asentamiento",
  cp: "C.P.",
  fecha_alta: "Alta en el DENUE",
};

function toRow(r, sectores) {
  const extra = {};
  for (const k in EXTRA) if (r[k] != null && r[k] !== "") extra[EXTRA[k]] = String(r[k]);
  return {
    key: String(r.id),
    nombre: r.nombre,
    cat: sectores[r.sector]?.etiqueta || r.sector,
    sub: r.actividad,
    year: r.anio,
    lat: r.lat,
    lng: r.lng,
    extra,
  };
}

let cache = null;

// Devuelve una fila por establecimiento y año. El DENUE se levanta por semestre:
// si un establecimiento aparece en los dos semestres de un año, se usa el más reciente.
export function loadDenue() {
  cache ??= fetch(url)
    .then(res => {
      if (!res.ok) throw new Error("No se pudieron cargar los datos del DENUE (" + res.status + ").");
      return res.json();
    })
    .then(({ meta, registros }) => {
      const latest = new Map();
      for (const r of registros) {
        const k = r.id + "|" + r.anio, prev = latest.get(k);
        if (!prev || r.periodo > prev.periodo) latest.set(k, r);
      }
      return [...latest.values()].map(r => toRow(r, meta.sectores));
    });
  return cache;
}
