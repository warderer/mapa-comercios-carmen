// API key de CARTO: se define en .env como VITE_CARTO_KEY (ver .env.example).
// Si está vacía, el mapa usa los mosaicos estándar de OpenStreetMap.
export const CARTO_KEY = (import.meta.env.VITE_CARTO_KEY ?? "").trim();

export const CENTER = [18.6520, -91.8120];
export const DEFAULT_ZOOM = 14;

// Al encuadrar, niveles de zoom que se suman al que mostraría todos los comercios.
// Con 1 la ciudad se ve más de cerca; en pantallas angostas los comercios de las orillas pueden quedar fuera.
export const FIT_ZOOM_BOOST = 1;
export const FIT_MAX_ZOOM = 16;

// Colores por categoría, asignados de la más a la menos frecuente
export const PALETTE = ["#d1495b", "#e09f3e", "#0f8b8d", "#3d5a98", "#8e5ea2", "#5b8c3a", "#b5651d", "#c2577f", "#4a7d9e", "#7a7a2e"];

// Valor de --bg en el tema claro (styles/main.css); sirve para detectar el tema activo
export const LIGHT_BG = "#f3f1ec";

export const LOCALE = "es-MX";
