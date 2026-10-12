// API key de CARTO: se define en .env como VITE_CARTO_KEY (ver .env.example).
// Si está vacía, el mapa usa los mosaicos estándar de OpenStreetMap.
export const CARTO_KEY = (import.meta.env.VITE_CARTO_KEY ?? "").trim();

export const CENTER = [18.6520, -91.8120];
export const DEFAULT_ZOOM = 14;

// Los registros fuera de este rectángulo se avisan como "fuera del área de Ciudad del Carmen"
export const AREA = { minLat: 18.55, maxLat: 18.85, minLng: -92.0, maxLng: -91.45 };

// Colores por categoría, asignados de la más a la menos frecuente
export const PALETTE = ["#d1495b", "#e09f3e", "#0f8b8d", "#3d5a98", "#8e5ea2", "#5b8c3a", "#b5651d", "#c2577f", "#4a7d9e", "#7a7a2e"];

// Valor de --bg en el tema claro (styles/main.css); sirve para detectar el tema activo
export const LIGHT_BG = "#f3f1ec";

export const LOCALE = "es-MX";
