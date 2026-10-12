import "./styles/main.css";
import "./styles/leaflet.css";
import { onMarkerClick } from "./markers.js";
import { initTheme } from "./theme.js";
import { initChips } from "./ui/chips.js";
import { initControls } from "./ui/controls.js";
import { initDataInput, showDenue } from "./ui/dataInput.js";
import { select } from "./ui/detail.js";

onMarkerClick(select);
initControls();
initChips();
initDataInput();
initTheme();

showDenue();
