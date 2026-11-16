# Case 2 export: Gandak River flood seen by NISAR (HH)

Produced by `notebooks/case2.ipynb` (section 9). Copy this folder to `application/public/assets/geospatial/case2/`

Every image covers the box in `manifest.json` → `coordinates`, in Web Mercator (EPSG:3857). Transparent pixels mean nothing to show

| File | What it is |
|---|---|
| `manifest.json` | the case study for the app, same structure as `CaseStudy` in `caseStudies.ts` |
| `extra.json` | details the app does not use yet: image corners, encodings, file lists, statistics, thresholds |
| `legends.md` | colours of the flood map categories, which the standard gradient legend cannot hold |
| `sentinel2_2026-06-25.webp` | satellite photo of the box, before the flood |
| `places.geojson` | towns and the Gandak River line |
| `hh_raw_*.webp`, `hh_clean_*.webp` | NISAR HH radar on the 7 dates, as delivered and after the speckle filter |
| `hh_clean_*.tif` | the same radar as numbers (40 m), encoding in `extra.json` |
| `water_*.png` | open water on each of the 7 dates |
| `flood_*.png`, `flood_*.tif` | flood maps Sep 4 → Sep 28 and Sep 28 → Oct 10, coloured and as class codes |
