// Filtro por tipo de comercio: una casilla por categoría y el botón de marcar/quitar todos.
import { render } from "../render.js";
import { state } from "../state.js";
import { $, esc } from "../utils/dom.js";

function syncToggleAll() {
  $("toggleAll").textContent = state.active.size ? "Quitar todos" : "Marcar todos";
}

// Reconstruye la lista a partir de state.cats
export function buildChips() {
  const box = $("chips");
  box.innerHTML = "";
  state.cats.forEach((cat, i) => {
    const label = document.createElement("label");
    label.className = "chip";
    label.innerHTML = `<input type="checkbox" id="cat-${i}" checked><i class="dot" style="background:${state.color[cat]}"></i><span>${esc(cat)}</span><span class="n" data-cat="${esc(cat)}">0</span>`;
    label.querySelector("input").addEventListener("change", ev => {
      if (ev.target.checked) state.active.add(cat);
      else state.active.delete(cat);
      label.classList.toggle("off", !ev.target.checked);
      syncToggleAll();
      render(true);
    });
    box.appendChild(label);
  });
  syncToggleAll();
}

export function initChips() {
  $("toggleAll").onclick = () => {
    const on = !state.active.size;
    state.active = new Set(on ? state.cats : []);
    document.querySelectorAll("#chips label").forEach(label => {
      label.querySelector("input").checked = on;
      label.classList.toggle("off", !on);
    });
    syncToggleAll();
    render(true);
  };
}
