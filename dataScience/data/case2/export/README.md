# Case 2 export: Gandak River flood seen by NISAR (HH)

Produced by `notebooks/case2_flood_bihar.ipynb`.

Everything the app needs is written to `data/case2/export/` (about 45 MB; the folder is committed to git). The app developer does not need Python: images are ready to lay on a web map, numbers are in JSON.

```
data/case2/export/
  manifest.json                          what everything is: dates, corners, legend, colours, encodings, file list
  stats.json                             km² per class and per date, thresholds and how they were chosen
  README.md                              this section, for the developer
  reference/sentinel2_2026-06-25.webp    satellite photo of the box
  reference/places.geojson               town points and the Gandak River line (lon/lat)
  radar/hh_raw_<date>.webp               7 images: HH as delivered, grey
  radar/hh_clean_<date>.webp             7 images: HH after the speckle filter, grey (what the rules use)
  radar/hh_clean_<date>.tif              7 rasters: the same values as numbers (40 m), for a "click a pixel" tool
  water/water_<date>.png                 7 images: open water on that date (R1 alone)
  flood/flood_<before>_<after>.png       2 images: combined flood map (section 7), coloured
  flood/flood_<before>_<after>.tif       2 rasters: the same map as class codes
```

**How to place the images on the map.** Every `.png` and `.webp` image is in Web Mercator (EPSG:3857, the projection of web maps) and covers the same rectangle. Its four corners are in `manifest.json` → `image_corners`, as `[lon, lat]` in the order top-left, top-right, bottom-right, bottom-left: exactly what MapLibre's `image` source expects. Transparent pixels mean "nothing here" or "no data".

**Pixel encodings**

| File | Pixel | Meaning |
|---|---|---|
| `radar/*.webp` | grey 0 to 255 (alpha 0 = no data) | dB = -25 + 25 × grey / 255 (black -25 dB, white 0 dB) |
| `radar/hh_clean_*.tif` | uint8, UTM 44N, 40 m | dB = -40 + 0.25 × value; 255 = no data |
| `water/*.png` | `#c6dbef` or transparent | open water on that date |
| `flood/*.png` | colours below, or transparent | combined flood map |
| `flood/*.tif` | uint8 code, UTM 44N, 20 m | 0 no change, 1 water both dates, 2 newly flooded, 3 dry again, 4 brighter, 5 darker, 255 no data |

| Code | Colour | Label |
|---|---|---|
| 1 | `#08306b` | water on both dates |
| 2 | `#2b8cbe` | newly flooded (open water) |
| 3 | `#d9b26f` | dry again (water receded) |
| 4 | `#6a51a3` | brighter: partly flooded villages, crops, trees |
| 5 | `#5ab4ac` | darker: possibly submerged vegetation |
