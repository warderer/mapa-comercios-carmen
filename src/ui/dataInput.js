// Entrada de datos: subir un CSV, arrastrarlo sobre la página, pegarlo o volver al ejemplo.
import { rowsFromCSV } from "../data/csv.js";
import { sample } from "../data/sample.js";
import { loadRows, setMsg } from "../dataset.js";
import { $ } from "../utils/dom.js";

function loadText(text, name) {
  try {
    const { rows, bad } = rowsFromCSV(text);
    loadRows(rows, "csv", { name, bad });
  } catch (e) {
    setMsg(e.message, true);
  }
}

function loadFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => loadText(reader.result, file.name);
  reader.readAsText(file);
}

async function copyTemplate(ev) {
  const button = ev.target, fmt = $("fmt");
  try {
    await navigator.clipboard.writeText(fmt.textContent);
    button.textContent = "Copiada";
  } catch (_) {
    // Sin permiso de portapapeles: se deja seleccionada para copiarla a mano
    const range = document.createRange();
    range.selectNodeContents(fmt);
    const selection = getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    button.textContent = "Seleccionada, copia con Ctrl+C";
  }
  setTimeout(() => { button.textContent = "Copiar plantilla"; }, 2200);
}

export function initDataInput() {
  $("file").addEventListener("change", e => { loadFile(e.target.files[0]); e.target.value = ""; });
  $("showPaste").onclick = () => {
    const box = $("pasteBox");
    box.hidden = !box.hidden;
    if (!box.hidden) $("paste").focus();
  };
  $("loadPaste").onclick = () => loadText($("paste").value, "datos pegados");
  $("loadSample").onclick = () => loadRows(sample(), "sample");
  $("copyFmt").onclick = copyTemplate;

  const app = $("app");
  ["dragenter", "dragover"].forEach(type => app.addEventListener(type, e => { e.preventDefault(); app.classList.add("dragover"); }));
  ["dragleave", "drop"].forEach(type => app.addEventListener(type, e => {
    e.preventDefault();
    if (type === "drop" || e.target === app) app.classList.remove("dragover");
  }));
  app.addEventListener("drop", e => loadFile(e.dataTransfer.files[0]));
}
