// Controles de tiempo: deslizador de año, reproducción, velocidad, modo y encuadre.
import { fit } from "../map.js";
import { render } from "../render.js";
import { state } from "../state.js";
import { $ } from "../utils/dom.js";
import { drawBars } from "./bars.js";

const ICON_PLAY = '<svg viewBox="0 0 16 16"><path d="M4 2.5v11l9-5.5z" fill="currentColor"/></svg>';
const ICON_PAUSE = '<svg viewBox="0 0 16 16"><path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" fill="currentColor"/></svg>';

export function goYear(i) {
  state.yi = Math.max(0, Math.min(state.years.length - 1, i));
  render(true);
}

export function stopPlay() {
  state.playing = false;
  clearTimeout(state.timer);
  $("app").classList.remove("playing");
  $("play").innerHTML = ICON_PLAY;
  $("play").setAttribute("aria-label", "Reproducir animación");
}

function tick() {
  if (!state.playing) return;
  if (state.yi >= state.years.length - 1) { stopPlay(); return; }
  goYear(state.yi + 1);
  state.timer = setTimeout(tick, state.dur);
}

function togglePlay() {
  if (state.playing) { stopPlay(); return; }
  state.playing = true;
  $("app").classList.add("playing"); // oculta los botones del mapa (styles/main.css)
  $("play").innerHTML = ICON_PAUSE;
  $("play").setAttribute("aria-label", "Pausar animación");
  // Desde el último año, vuelve a empezar
  if (state.yi >= state.years.length - 1) { goYear(0); state.timer = setTimeout(tick, state.dur); }
  else tick();
}

function setMode(mode) {
  state.mode = mode;
  $("m-year").setAttribute("aria-pressed", mode === "year");
  $("m-acum").setAttribute("aria-pressed", mode === "acum");
  render(true);
}

export function initControls() {
  $("play").innerHTML = ICON_PLAY;
  $("play").onclick = togglePlay;
  $("yr").addEventListener("input", e => { stopPlay(); goYear(+e.target.value); });
  $("bars").addEventListener("click", e => {
    const g = e.target.closest("g[data-i]");
    if (g) { stopPlay(); goYear(+g.dataset.i); }
  });

  const showSpeed = () => { $("spdv").textContent = (state.dur / 1000).toFixed(1) + " s por año"; };
  $("spd").addEventListener("input", e => { state.dur = +e.target.value; showSpeed(); });
  showSpeed();

  $("m-year").onclick = () => setMode("year");
  $("m-acum").onclick = () => setMode("acum");
  $("fit").onclick = fit;
  addEventListener("resize", drawBars);
}
