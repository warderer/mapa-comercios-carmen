# Mapa de comercios de Ciudad del Carmen

Mapa interactivo que muestra cómo cambian los establecimientos de Ciudad del Carmen, Campeche, año con año (2015–2026), con datos del DENUE (INEGI). Es un producto del proyecto de investigación de la UNACAR «Crisis y oportunidad: Inteligencia de mercado, economía social y transformación digital para micro y pequeñas empresas de Ciudad del Carmen» (responsable: Dr. Benjamín Tass Herrera).

Toda la interfaz, los comentarios del código y los mensajes de commit están en español.

## Comandos

```bash
npm run dev      # servidor de desarrollo (Vite)
npm run build    # genera dist/
npm run preview  # sirve dist/ para revisar el build
```

No hay pruebas automáticas ni linter. Para verificar un cambio hay que abrir la app en el navegador; `npm run build` solo detecta errores de sintaxis e imports.

## Stack

- Vite + JavaScript con módulos ES, sin framework ni TypeScript.
- Leaflet 1.9 desde npm. No se importa `leaflet/dist/leaflet.css`: `src/styles/leaflet.css` trae los estilos mínimos, hechos con las variables del tema. Si se usa una pieza nueva de Leaflet (popups, capas, etc.), hay que añadir ahí su CSS.
- `vite.config.js` usa `base: "./"` para que `dist/` funcione en cualquier subcarpeta.

## API key

La clave de CARTO (mosaicos del mapa base) se lee de `VITE_CARTO_KEY` en `.env`, que está en `.gitignore`. Sin clave se usan los mosaicos de OpenStreetMap. Nunca escribir la clave en el código ni commitearla. `legacy/` (el artefacto HTML original, con la clave dentro) también está ignorado.

## Estructura

```
index.html            marcado: panel (logo, título, proyecto, controles, filtro, créditos) y mapa
src/
  main.js             punto de entrada: conecta los módulos y carga los datos
  config.js           API key, centro del mapa, paleta, locale
  state.js            estado compartido (`state`) y `visible()`
  dataset.js          carga los datos y arma categorías, actividades y colores
  map.js              mapa Leaflet, mosaicos, contorno de respaldo y `fit()`
  markers.js          marcadores (círculos o emojis) y su animación
  render.js           `render()`: repinta marcadores y lecturas
  emoji.js            emoji de cada actividad, por palabras clave
  theme.js            repintado al cambiar tema claro/oscuro
  data/               denue.js (lector), comercios-cdc-denue.json, land.json (costa)
  ui/                 controls, chips (filtro), bars, readouts, detail
  styles/             main.css y leaflet.css
  assets/             logotipo UNACAR (blanco)
```

## Cómo funciona

- **Datos**: `data/denue.js` descarga el JSON y devuelve una fila por establecimiento y año. El DENUE se levanta por semestre (`periodo`: `2016-1`, `2016-2`); el mapa es anual, así que de cada año se usa el semestre más reciente. El JSON tiene 2,946 registros de 386 establecimientos en dos sectores: cafeterías (una actividad) y servicios financieros y de seguros (cinco actividades).
- **Fila**: `{key, nombre, cat, sub, leaf, year, lat, lng, extra}`. `cat` es el sector, `sub` la actividad y `leaf` el par sector+actividad, que es la unidad del filtro (`state.active` es un conjunto de `leaf`).
- **Flujo**: cualquier cambio de año, modo o filtro modifica `state` y llama a `render()`, que anima los marcadores y actualiza conteos y barras. `visible(yi)` decide qué comercios se ven en un año.
- **Modos**: "Ese año" muestra los registrados en el año; "Acumulado" muestra todos los registrados hasta ese año, atenuando los que no aparecen en el actual.
- **Marcadores**: círculos en canvas coloreados por sector, o emojis (marcadores DOM) según la actividad. Son capas distintas: al cambiar de modo se recrean.
- **Dependencias entre módulos**: no hay ciclos de imports. `markers.js` no importa la interfaz; el clic se conecta en `main.js` con `onMarkerClick(select)`.

## Convenciones

- Los colores salen de variables CSS (`--bg`, `--accent`, etc.) con tema claro y oscuro. Lo que se pinta desde JS (marcadores, barras) lee las variables con `cssVar()` y se repinta en `theme.js`.
- El tema sigue al sistema hasta que se usa el botón junto al logotipo, que fija `data-theme` en `<html>` y lo guarda en `localStorage` (clave `tema`); un script en el `<head>` de `index.html` lo aplica antes de pintar.
- El texto que viene de los datos pasa por `esc()` antes de insertarse como HTML.
- El logotipo es blanco: solo debe ir sobre la franja `--brand`.
- Para añadir un sector o actividad nueva al JSON no hace falta tocar código, salvo `emoji.js` si se quiere un emoji propio (por defecto sale 📍).
