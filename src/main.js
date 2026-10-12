import "./styles/main.css";
import "./styles/leaflet.css";
import { loadData } from "./dataset.js";
import { onMarkerClick } from "./markers.js";
import { initTheme } from "./theme.js";
import { initChips } from "./ui/chips.js";
import { initControls } from "./ui/controls.js";
import { select } from "./ui/detail.js";

onMarkerClick(select);
initControls();
initChips();
initTheme();

loadData();
