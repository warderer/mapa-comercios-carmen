# Comercios de Ciudad del Carmen

Mapa interactivo que muestra cómo cambian los comercios de Ciudad del Carmen año con año, con los datos del DENUE (INEGI) o con un CSV propio de una fila por comercio y por año.

## Uso

```bash
npm install
cp .env.example .env   # y pega tu API key de CARTO en VITE_CARTO_KEY
npm run dev            # servidor de desarrollo
npm run build          # genera dist/, listo para subir a cualquier servidor
```

## API key

La clave de CARTO se lee de `VITE_CARTO_KEY` en `.env`, que no se sube a git. Sin clave, el mapa usa los mosaicos de OpenStreetMap.

La clave queda incluida en el JavaScript que genera `npm run build`, porque el navegador la necesita para pedir los mosaicos. Restríngela a tu dominio en el panel de CARTO.

## Estructura

```
index.html            marcado de la página
src/
  main.js             punto de entrada: conecta los módulos y carga los datos del DENUE
  config.js           API key, centro del mapa, paleta, área de la ciudad
  state.js            estado compartido y cálculo de comercios visibles
  map.js              mapa Leaflet, mosaicos y contorno de respaldo
  markers.js          marcadores y su animación
  render.js           repinta marcadores y lecturas
  dataset.js          carga un conjunto de datos en el mapa
  theme.js            repintado al cambiar tema claro/oscuro
  data/               datos del DENUE, lector de CSV y contorno de la costa
  ui/                 controles, filtro por categoría, barras, lecturas, detalle, entrada de datos
  styles/             estilos de la página y estilos mínimos de Leaflet
```
