// Gráfica de barras: comercios visibles por año. Cada <g data-i> es un año en el que se puede hacer clic.
import { state, visible } from "../state.js";
import { $, cssVar } from "../utils/dom.js";

const H = 84, PAD = 16, FONT = "IBM Plex Mono, monospace";

export function drawBars() {
  const svg = $("bars"), W = svg.clientWidth || 300, n = state.years.length;
  const vals = state.years.map((_, i) => visible(i).size), max = Math.max(1, ...vals);
  const bw = W / n, gap = Math.min(10, bw * .25);
  let h = `<line x1="0" x2="${W}" y1="${H - PAD}" y2="${H - PAD}" stroke="${cssVar("--line")}"/>`;
  vals.forEach((v, i) => {
    const bh = (H - PAD - 14) * v / max, x = i * bw + gap / 2, y = H - PAD - bh, cur = i === state.yi;
    const mid = x + (bw - gap) / 2;
    const label = n > 12 ? String(state.years[i]).slice(2) : state.years[i];
    h += `<g data-i="${i}"><rect x="${i * bw}" y="0" width="${bw}" height="${H}" fill="transparent"/>` +
      `<rect x="${x}" y="${y}" width="${bw - gap}" height="${bh}" rx="2" fill="${cur ? cssVar("--accent") : cssVar("--line")}"/>` +
      (cur ? `<text x="${mid}" y="${y - 4}" text-anchor="middle" font-family="${FONT}" font-size="10" fill="${cssVar("--fg")}">${v}</text>` : "") +
      `<text x="${mid}" y="${H - 3}" text-anchor="middle" font-family="${FONT}" font-size="${n > 10 ? 8 : 10}" fill="${cur ? cssVar("--fg") : cssVar("--muted")}">${label}</text></g>`;
  });
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.innerHTML = h;
}
