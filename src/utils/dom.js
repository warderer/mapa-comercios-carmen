export const $ = id => document.getElementById(id);

// Valor actual de una variable CSS (cambia con el tema claro/oscuro)
export const cssVar = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const ENTITIES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
export const esc = s => String(s).replace(/[&<>"]/g, c => ENTITIES[c]);
