# Case 5 export: Thunder Bay 36 wildfire seen by NISAR (HV and HH)

Produced by `notebooks/case5.ipynb` (section 9). Copy this folder to `application/public/assets/geospatial/case5/`

Every image covers the box in `manifest.json` → `coordinates`, in Web Mercator (EPSG:3857). Transparent pixels mean nothing to show

| File | What it is |
|---|---|
| `manifest.json` | the case study for the app, same structure as `CaseStudy` in `caseStudies.ts` |
| `extra.json` | details the app does not use yet: image corners, encodings, file lists, statistics, validation |
| `legends.md` | colours of the categories, which the standard gradient legend cannot hold |
| `sentinel2_before.webp`, `sentinel2_after.webp` | satellite photos before (early July) and after (September 20 to 22) the fire |
| `burn_severity_optical.png` | Sentinel-2 burn severity (dNBR classes), for comparison |
| `perimeter.geojson` | official Ontario perimeter of fire THU036 |
| `places.geojson` | communities and Wabakimi Provincial Park |
| `hv_raw_*.webp`, `hv_clean_*.webp`, `hh_clean_*.webp` | NISAR radar on the 9 dates (40 m), grey |
| `hv_clean_*.tif` | HV as numbers (80 m), encoding in `extra.json` |
| `burn_*.png`, `burn_*.tif` | HV canopy loss since July 11 for each pass after the fire |
| `bright_*.png`, `bright_*.tif` | HH brighter since July 11 for each pass after the fire |
