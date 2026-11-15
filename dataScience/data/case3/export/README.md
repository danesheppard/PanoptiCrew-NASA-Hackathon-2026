# Case 3 export: Bald Range wildfire seen by NISAR (HV)

Produced by `notebooks/case3.ipynb` (section 9). Copy this folder to `application/public/assets/geospatial/case3/`

Every image covers the box in `manifest.json` → `coordinates`, in Web Mercator (EPSG:3857). Transparent pixels mean nothing to show

| File | What it is |
|---|---|
| `manifest.json` | the case study for the app, same structure as `CaseStudy` in `caseStudies.ts` |
| `extra.json` | details the app does not use yet: image corners, encodings, file lists, statistics, validation |
| `legends.md` | colours of the burn and severity categories, which the standard gradient legend cannot hold |
| `sentinel2_2026-08-04.webp`, `sentinel2_2026-09-18.webp` | satellite photos before and after the fire |
| `burn_severity_optical.png` | Sentinel-2 burn severity (dNBR classes), for comparison |
| `perimeter.geojson` | official BC Wildfire Service perimeter of fire K51490 |
| `places.geojson` | place names |
| `hv_raw_*.webp`, `hv_clean_*.webp` | NISAR HV radar on the 10 dates, as delivered and after the speckle filter |
| `hv_clean_*.tif` | the same radar as numbers (40 m), encoding in `extra.json` |
| `burn_*.png`, `burn_*.tif` | canopy loss since July 25 for each pass after the fire, coloured and as class codes |
