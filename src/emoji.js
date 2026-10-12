// Emoji que representa a un comercio según el nombre de su actividad o categoría.

// Se revisan en orden y gana la primera que coincide (el texto llega sin acentos y en minúsculas),
// así que las más específicas van antes: "agentes de seguros" debe ganarle a "seguros".
const RULES = [
  [/agente|ajustador|gestor/, "🤝"],
  [/afianzador/, "📜"],
  [/pension/, "🏦"],
  [/inversion/, "📈"],
  [/financier|banco|credito/, "💰"],
  [/seguro/, "🛡️"],
  [/cafe|never|refresqu|soda/, "☕"],
  [/restauran|fonda|cocina|comida|marisc|taquer|loncher/, "🍽️"],
  [/farmacia|botica/, "💊"],
  [/hotel|posada|hosped/, "🏨"],
  [/abarrote|miscelanea|super|conveniencia|tienda/, "🛒"],
  [/petrol|gasolin/, "⛽"],
  [/hospital|clinica|consultorio|medic/, "🏥"],
  [/escuela|colegio|educa/, "🎓"],
];
const FALLBACK = "📍";

const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const cache = new Map();

function match(label) {
  if (!cache.has(label)) {
    const text = norm(label);
    cache.set(label, RULES.find(([re]) => re.test(text))?.[1] ?? null);
  }
  return cache.get(label);
}

// Recibe los nombres del más al menos específico (actividad, categoría) y usa el primero que tenga emoji
export function emojiFor(...labels) {
  for (const label of labels) {
    const emoji = label && match(label);
    if (emoji) return emoji;
  }
  return FALLBACK;
}
