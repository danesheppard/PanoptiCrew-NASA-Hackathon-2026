# Case 3, Part A export: Bald Range wildfire seen by NISAR (HV)

Produced by `notebooks/case3.ipynb` (section A9).

Everything the app needs for this fire is written to `data/case3/export/bald_range/` (about 15 MB; committed to git). Same format as case 2: images ready to lay on a web map, numbers in JSON, no Python needed.

```
data/case3/export/bald_range/
  manifest.json                          what everything is: dates, key dates, corners, legend, colours, encodings, file list
  stats.json                             km² per class and per date, thresholds and how they were chosen, validation numbers
  README.md                              this file, for the developer
  reference/sentinel2_2026-08-04.webp    satellite photo before the fire
  reference/sentinel2_2026-09-18.webp    satellite photo after the fire
  reference/burn_severity_optical.png    Sentinel-2 burn severity (dNBR), for comparison
  reference/perimeter.geojson            official BC Wildfire Service fire perimeter K51490 (lon/lat)
  reference/places.geojson               place names (lon/lat)
  radar/hv_raw_<date>.webp               10 images: HV as delivered, grey
  radar/hv_clean_<date>.webp             10 images: HV after the speckle filter, grey (what the rules use)
  radar/hv_clean_<date>.tif              10 rasters: the same values as numbers (40 m), for a "click a pixel" tool
  burn/burn_<date>.png                   6 images: canopy loss since July 25, for every pass after the fire
  burn/burn_<date>.tif                   6 rasters: the same maps as class codes
```

**Key dates** (in `manifest.json` → `key_dates`, matching the app's case stages):

| Stage | Date | Use |
|---|---|---|
| before (lead-up) | 2026-07-25 | last radar pass before the fire; photo of 2026-08-04 |
| during (event) | 2026-08-18 | first pass after ignition, fire still burning: `burn/burn_2026-08-18.png` |
| after (takeaway) | 2026-09-11 | fire out, main result: `burn/burn_2026-09-11.png`; photo of 2026-09-18 |

**How to place the images on the map.** Every `.png` and `.webp` image is in Web Mercator (EPSG:3857) and covers the same rectangle. Its four corners are in `manifest.json` → `image_corners`, as `[lon, lat]` in the order top-left, top-right, bottom-right, bottom-left: exactly what MapLibre's `image` source expects. Transparent pixels mean "nothing here" or "no data".

**Pixel encodings**

| File | Pixel | Meaning |
|---|---|---|
| `radar/*.webp` | grey 0 to 255 (alpha 0 = no data) | dB = -25 + 20 × grey / 255 (black -25 dB, white -5 dB) |
| `radar/hv_clean_*.tif` | uint8, UTM 11N, 40 m | dB = -40 + 0.25 × value; 255 = no data |
| `burn/*.png` | colours below, or transparent | canopy loss since July 25 |
| `burn/*.tif` | uint8 code, UTM 11N, 20 m | 0 no change, 1 canopy loss, 2 severe canopy loss, 255 no data |
| `reference/burn_severity_optical.png` | colours in `manifest.json` → `optical_severity` | Sentinel-2 dNBR classes (unburned to high) |

| Code | Colour | Label |
|---|---|---|
| 1 | `#fec44f` | canopy loss (HV fell at least 1 dB more than the unburned forest) |
| 2 | `#d7301f` | severe canopy loss (at least 2 dB) |
