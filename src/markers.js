// Marcadores de los comercios y su animación al cambiar de año (aparecen, desaparecen o se mueven).
import L from "leaflet";
import { map } from "./map.js";
import { state, visible } from "./state.js";
import { cssVar, esc } from "./utils/dom.js";

// key -> { m: circleMarker, cur: {lat, lng, r, o} (posición, radio y opacidad actuales), row }
export const markers = new Map();
let anim = null;
let clickHandler = () => {};

export function onMarkerClick(handler) { clickHandler = handler; }

const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const radius = () => Math.max(3, Math.min(9, map.getZoom() - 8));

function styleFor(o) {
  // En modo acumulado, los que no se registraron en el año actual se ven atenuados
  const older = state.mode === "acum" && o.row.year < state.years[state.yi];
  return {
    radius: o.cur.r,
    color: cssVar("--stroke"),
    weight: o.cur.r > 2 ? 1.2 : 0,
    fillColor: state.color[o.row.cat],
    fillOpacity: o.cur.o * (older ? .45 : .92),
    opacity: o.cur.o,
    ...(state.selected === o.row.key ? { weight: 3, color: cssVar("--fg") } : {}),
  };
}

export function restyleMarkers() { markers.forEach(o => o.m.setStyle(styleFor(o))); }

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
  o.m = L.circleMarker([row.lat, row.lng], { radius: 0, fillOpacity: 0, opacity: 0 }).addTo(map);
  o.m.bindTooltip(() => esc(o.row.nombre) + ' <span style="color:var(--muted)">· ' + esc(o.row.cat) + "</span>", { direction: "top", offset: [0, -6] });
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
      t.o.m.setLatLng([c.lat, c.lng]);
      t.o.m.setStyle(styleFor(t.o));
      t.o.m.setRadius(c.r);
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
      const p = Math.min(1, (now - t0) / duration);
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
  markers.forEach(o => { o.cur.r = R; o.m.setRadius(R); });
});
