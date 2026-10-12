// Marcadores de los comercios y su animación al cambiar de año (aparecen, desaparecen o se mueven).
import L from "leaflet";
import { emojiFor } from "./emoji.js";
import { map } from "./map.js";
import { state, visible } from "./state.js";
import { cssVar, esc } from "./utils/dom.js";

// key -> { m: capa de Leaflet, cur: {lat, lng, r, o} (posición, radio y opacidad actuales), row }
// En modo emoji la capa es un marcador con un <span> (o.span); si no, un circleMarker.
export const markers = new Map();
let anim = null;
let clickHandler = () => {};

export function onMarkerClick(handler) { clickHandler = handler; }

const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const radius = () => Math.max(3, Math.min(9, map.getZoom() - 8));
const EMOJI_SCALE = 3; // tamaño del emoji en px por cada px de radio del círculo equivalente

// En modo acumulado, los que no se registraron en el año actual se ven atenuados
const isOlder = o => state.mode === "acum" && o.row.year < state.years[state.yi];

function styleFor(o) {
  return {
    radius: o.cur.r,
    color: cssVar("--stroke"),
    weight: o.cur.r > 2 ? 1.2 : 0,
    fillColor: state.color[o.row.cat],
    fillOpacity: o.cur.o * (isOlder(o) ? .45 : .92),
    opacity: o.cur.o,
    ...(state.selected === o.row.key ? { weight: 3, color: cssVar("--fg") } : {}),
  };
}

// Lleva la capa a la posición, tamaño y estilo de o.cur
function paint(o) {
  const c = o.cur;
  o.m.setLatLng([c.lat, c.lng]);
  if (o.span) {
    o.span.textContent = emojiFor(o.row.sub, o.row.cat);
    o.span.style.fontSize = c.r * EMOJI_SCALE + "px";
    o.span.style.opacity = c.o * (isOlder(o) ? .45 : 1);
    o.span.classList.toggle("sel", state.selected === o.row.key);
  } else {
    o.m.setStyle(styleFor(o));
    o.m.setRadius(c.r);
  }
}

export function restyleMarkers() { markers.forEach(paint); }

function finishAnim() {
  if (!anim) return;
  cancelAnimationFrame(anim.raf);
  anim.step(1);
  anim = null;
}

export function clearMarkers() {
  finishAnim();
  markers.forEach(o => map.removeLayer(o.m));
  markers.clear();
}

function createMarker(key, row) {
  const o = { cur: { lat: row.lat, lng: row.lng, r: 0, o: 0 }, row };
  if (state.emoji) {
    const icon = L.divIcon({ className: "emoji-marker", html: "<span></span>", iconSize: [0, 0] });
    o.m = L.marker([row.lat, row.lng], { icon, keyboard: false }).addTo(map);
    o.span = o.m.getElement().firstChild;
  } else {
    o.m = L.circleMarker([row.lat, row.lng], { radius: 0, fillOpacity: 0, opacity: 0 }).addTo(map);
  }
  o.m.bindTooltip(() => esc(o.row.nombre) + ' <span style="color:var(--muted)">· ' + esc(o.row.sub || o.row.cat) + "</span>", { direction: "top", offset: [0, state.emoji ? -10 : -6] });
  o.m.on("click", () => clickHandler(key));
  markers.set(key, o);
  return o;
}

// Lleva los marcadores al año actual y devuelve los comercios visibles (Map key -> fila)
export function renderMarkers(animate = true) {
  finishAnim();
  const target = visible(state.yi), R = radius(), tweens = [];
  markers.forEach((o, key) => {
    if (!target.has(key)) tweens.push({ o, key, from: { ...o.cur }, to: { ...o.cur, r: 0, o: 0 }, kill: true });
  });
  target.forEach((row, key) => {
    const o = markers.get(key) || createMarker(key, row);
    o.row = row;
    tweens.push({ o, key, from: { ...o.cur }, to: { lat: row.lat, lng: row.lng, r: R, o: 1 } });
  });

  const step = p => {
    const e = ease(p);
    for (const t of tweens) {
      const c = t.o.cur;
      for (const k of ["lat", "lng", "r", "o"]) c[k] = t.from[k] + (t.to[k] - t.from[k]) * e;
      paint(t.o);
      if (p >= 1 && t.kill) {
        map.removeLayer(t.o.m);
        if (markers.get(t.key) === t.o) markers.delete(t.key);
      }
    }
  };
  const duration = animate && !reduceMotion ? state.dur * .6 : 0;
  if (!duration) step(1);
  else {
    const t0 = performance.now();
    anim = { step, raf: 0 };
    const loop = now => {
      // La marca de tiempo del cuadro puede ser anterior a t0; sin el límite inferior los radios se disparan
      const p = Math.max(0, Math.min(1, (now - t0) / duration));
      step(p);
      if (p < 1) anim.raf = requestAnimationFrame(loop);
      else anim = null;
    };
    anim.raf = requestAnimationFrame(loop);
  }
  return target;
}

map.on("zoomend", () => {
  finishAnim();
  const R = radius();
  markers.forEach(o => { o.cur.r = R; paint(o); });
});
