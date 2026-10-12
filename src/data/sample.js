// Datos de ejemplo (simulados): se generan con una semilla fija, así que siempre salen iguales.
import LAND from "./land.json";

// Generador pseudoaleatorio con semilla
function mulberry(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function inPoly(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}

const YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

// [categoría, cuántos, pesos de apertura por año, probabilidad de cierre por año, prefijos del nombre]
const CATEGORIES = [
  ["Servicios petroleros", 34, [14, 2, 1, 1, 2, 4, 5, 5], [0, .22, .25, .15, .06, .04, .05, .05], ["Logística", "Soldaduras", "Suministros", "Inspecciones", "Marítima"]],
  ["Restaurantes y fondas", 46, [18, 3, 2, 4, 6, 6, 5, 4], [0, .05, .16, .06, .05, .05, .05, .05], ["Fonda", "Cocina", "Mariscos", "Taquería", "Loncheria"]],
  ["Abarrotes", 30, [20, 2, 2, 2, 1, 1, 1, 1], [0, .04, .05, .05, .05, .06, .06, .06], ["Abarrotes", "Miscelánea", "Tienda"]],
  ["Tiendas de conveniencia", 24, [4, 2, 2, 3, 3, 4, 3, 3], [0, .01, .01, .01, .02, .01, .01, .01], ["Súper", "Mini súper", "Tienda 24h"]],
  ["Farmacias", 20, [6, 1, 4, 4, 2, 1, 1, 1], [0, .03, .02, .03, .04, .04, .04, .04], ["Farmacia", "Botica", "Farmacia"]],
  ["Hoteles", 16, [10, 0, 0, 0, 1, 2, 2, 1], [0, .12, .15, .08, .03, .02, .02, .02], ["Hotel", "Posada", "Suites"]],
];
const NAMES = ["del Carmen", "La Ceiba", "Puerto Real", "del Malecón", "Isla", "Las Gaviotas", "El Faro", "Manigua", "Tortuguero", "La Puntilla", "San Nicolás", "Playa Norte", "Benito Juárez", "El Camarón", "Morelos", "Santa Rita"];

export function sample() {
  const rnd = mulberry(20261005);
  // El polígono corto de LAND es la isla; el largo es tierra firme
  const island = LAND.coordinates.find(p => p[0].length < 80)[0];
  const randomPoint = () => {
    for (;;) {
      const x = -91.842 + rnd() * 0.07, y = 18.646 + rnd() * 0.04;
      if (inPoly(x, y, island)) return [y, x];
    }
  };
  const rows = [];
  let k = 0;
  for (const [cat, count, openWeights, closeProb, prefixes] of CATEGORIES) {
    const total = openWeights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < count; i++) {
      // Año de apertura, sorteado según los pesos
      let r = rnd() * total, open = 0;
      while (r > openWeights[open]) { r -= openWeights[open]; open++; }
      let [lat, lng] = randomPoint();
      const id = "e" + String(++k).padStart(3, "0");
      const nombre = prefixes[Math.floor(rnd() * prefixes.length)] + " " + NAMES[Math.floor(rnd() * NAMES.length)];
      const moves = rnd() < .07;
      for (let yi = open; yi < YEARS.length; yi++) {
        if (yi > open && rnd() < closeProb[yi]) break;
        if (moves && yi === open + 2) [lat, lng] = randomPoint();
        rows.push({ key: id, nombre, cat, year: YEARS[yi], lat, lng, extra: {} });
      }
    }
  }
  return rows;
}
