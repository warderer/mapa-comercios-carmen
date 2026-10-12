import "./styles/main.css";
import "./styles/leaflet.css";
import { sample } from "./data/sample.js";
import { loadRows } from "./dataset.js";
import { onMarkerClick } from "./markers.js";
import { initTheme } from "./theme.js";
import { initChips } from "./ui/chips.js";
import { initControls } from "./ui/controls.js";
import { initDataInput } from "./ui/dataInput.js";
import { select } from "./ui/detail.js";

onMarkerClick(select);
initControls();
initChips();
initDataInput();
initTheme();

loadRows(sample(), "sample");
