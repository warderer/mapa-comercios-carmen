import { renderMarkers } from "./markers.js";
import { updateReadouts } from "./ui/readouts.js";

// Repinta todo lo que depende del año, el modo o las categorías activas
export function render(animate = true) {
  updateReadouts(renderMarkers(animate));
}
