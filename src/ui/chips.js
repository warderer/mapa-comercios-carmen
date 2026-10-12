// Filtro por tipo de comercio: una casilla por categoría, sus actividades desplegables,
// el botón de marcar/quitar todos y la opción de ver emojis en lugar de círculos.
import { emojiFor } from "../emoji.js";
import { clearMarkers } from "../markers.js";
import { render } from "../render.js";
import { state } from "../state.js";
import { $, esc } from "../utils/dom.js";

const CHEVRON = '<svg viewBox="0 0 10 10"><path d="M3 1.5 7 5 3 8.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Casillas en pantalla: {el, input, leaves}. La de una categoría agrupa las hojas de sus actividades.
let chips = [];

// Refleja state.active y state.emoji en las casillas
function syncChips() {
  for (const { el, input, leaves } of chips) {
    const on = leaves.filter(l => state.active.has(l)).length;
    input.checked = on === leaves.length;
    input.indeterminate = on > 0 && on < leaves.length;
    el.classList.toggle("off", on === 0);
  }
  $("chips").classList.toggle("emoji", state.emoji);
  $("toggleAll").textContent = state.active.size ? "Quitar todos" : "Marcar todos";
}

function createChip({ label, key, color, emoji, leaves, sub }) {
  const el = document.createElement("label");
  el.className = "chip" + (sub ? " sub" : "");
  el.innerHTML = `<input type="checkbox"><i class="dot" style="background:${color}"></i><i class="emo">${emoji}</i><span>${esc(label)}</span><span class="n" data-key="${esc(key)}">0</span>`;
  const input = el.querySelector("input");
  input.addEventListener("change", () => {
    for (const l of leaves) {
      if (input.checked) state.active.add(l);
      else state.active.delete(l);
    }
    syncChips();
    render(true);
  });
  chips.push({ el, input, leaves });
  return el;
}

// Reconstruye la lista a partir de state.tree; las actividades empiezan colapsadas
export function buildChips() {
  const box = $("chips");
  box.innerHTML = "";
  chips = [];
  const hasSubs = g => g.subs.some(s => s.name);
  const nested = state.tree.some(hasSubs);
  state.tree.forEach((g, i) => {
    const color = state.color[g.cat];
    const head = createChip({ label: g.cat, key: g.cat, color, emoji: emojiFor(g.cat), leaves: g.subs.map(s => s.leaf) });
    if (!nested) { box.appendChild(head); return; }

    const row = document.createElement("div");
    row.className = "chiprow";
    box.appendChild(row);
    if (!hasSubs(g)) { row.append(document.createElement("span"), head); return; }

    const subs = document.createElement("div");
    subs.className = "subchips";
    subs.id = "subs-" + i;
    subs.hidden = true;
    for (const s of g.subs) {
      subs.appendChild(createChip({ label: s.name || "Sin especificar", key: s.leaf, color, emoji: emojiFor(s.name, g.cat), leaves: [s.leaf], sub: true }));
    }
    const twisty = document.createElement("button");
    twisty.className = "twisty";
    twisty.type = "button";
    twisty.innerHTML = CHEVRON;
    twisty.setAttribute("aria-controls", subs.id);
    twisty.setAttribute("aria-expanded", "false");
    twisty.setAttribute("aria-label", "Actividades de " + g.cat);
    twisty.onclick = () => {
      subs.hidden = !subs.hidden;
      twisty.setAttribute("aria-expanded", !subs.hidden);
    };
    row.append(twisty, head);
    box.appendChild(subs);
  });
  syncChips();
}

export function initChips() {
  $("toggleAll").onclick = () => {
    state.active = new Set(state.active.size ? [] : chips.flatMap(c => c.leaves));
    syncChips();
    render(true);
  };
  $("emoji").addEventListener("change", e => {
    state.emoji = e.target.checked;
    syncChips();
    // Los círculos y los emojis son capas distintas: se vuelven a crear
    clearMarkers();
    render(false);
  });
}
