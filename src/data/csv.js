// Lectura de CSV: detecta el separador y reconoce varios nombres de columna.

// Devuelve una matriz de celdas; ignora las líneas vacías
export function parseCSV(text) {
  text = text.replace(/^﻿/, "");
  const first = text.split(/\r?\n/)[0] || "";
  const sep = first.split(";").length > first.split(",").length ? ";" : first.includes("\t") ? "\t" : ",";
  const out = [];
  let row = [], field = "", quoted = false;
  const endRow = () => {
    row.push(field);
    field = "";
    if (row.some(v => v.trim() !== "")) out.push(row);
    row = [];
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === sep) { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      endRow();
    } else field += c;
  }
  endRow();
  return out;
}

// "Razón Social" -> "razon_social"
const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim().replace(/\s+/g, "_");

// Encabezados aceptados (ya normalizados) para cada campo, del más al menos preferido.
// "actividad" sirve de categoría si no hay otra columna para ella; si la hay, es la subcategoría.
const ALIAS = {
  id: ["id", "clave", "folio", "codigo"],
  nombre: ["nombre", "name", "comercio", "negocio", "razon_social", "establecimiento"],
  cat: ["categoria", "tipo", "giro", "category", "tipo_de_comercio", "sector", "actividad"],
  sub: ["subcategoria", "subtipo", "subgiro", "subcategory", "actividad"],
  year: ["anio", "ano", "year", "periodo"],
  lat: ["lat", "latitud", "latitude", "y"],
  lng: ["lng", "lon", "long", "longitud", "longitude", "x"],
};
const REQUIRED = { year: "anio", lat: "lat", lng: "lng" };

// Convierte el texto de un CSV en filas del mapa. `bad` cuenta las filas omitidas.
export function rowsFromCSV(text) {
  const table = parseCSV(text);
  if (table.length < 2) throw new Error("El archivo no tiene filas de datos debajo del encabezado.");
  const header = table[0].map(norm);
  const idx = {}, used = new Set();
  for (const k in ALIAS) {
    idx[k] = -1;
    for (const alias of ALIAS[k]) {
      const i = header.indexOf(alias);
      if (i >= 0 && !used.has(i)) { idx[k] = i; used.add(i); break; }
    }
  }
  const missing = Object.keys(REQUIRED).filter(k => idx[k] < 0);
  if (missing.length) throw new Error("Faltan columnas: " + missing.map(k => REQUIRED[k]).join(", ") + ". Revisa el encabezado de la primera fila.");

  const rows = [];
  let bad = 0;
  for (const r of table.slice(1)) {
    const get = k => (idx[k] >= 0 ? (r[idx[k]] || "").trim() : "");
    const lat = parseFloat(get("lat").replace(",", "."));
    const lng = parseFloat(get("lng").replace(",", "."));
    const year = parseInt(get("year"), 10);
    if (!isFinite(lat) || !isFinite(lng) || !isFinite(year) || Math.abs(lat) > 90 || Math.abs(lng) > 180) { bad++; continue; }
    const nombre = get("nombre") || "Sin nombre", cat = get("cat") || "Sin categoría";
    // Las columnas no reconocidas se conservan para mostrarlas en el detalle
    const extra = {};
    header.forEach((_, j) => { if (!used.has(j) && r[j] && r[j].trim()) extra[table[0][j].trim()] = r[j].trim(); });
    rows.push({ key: get("id") || nombre + "|" + cat, nombre, cat, sub: get("sub"), year, lat, lng, extra });
  }
  if (!rows.length) throw new Error("Ninguna fila tiene año, latitud y longitud válidos.");
  return { rows, bad };
}
