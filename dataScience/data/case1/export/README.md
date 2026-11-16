# Case 1 export: Bhotekoshi glacier collapse and debris flood seen by NISAR

Produced by `notebooks/case1.ipynb` (section 4). Copy this folder to `application/public/assets/geospatial/case1/`

Every image covers the box in `manifest.json` → `coordinates`, in Web Mercator (EPSG:3857). Transparent pixels mean nothing to show

| File | What it is |
|---|---|
| `reference/terrain.png` | elevation, terrarium encoding, 512 x 498 px |
| `reference/imagery.jpg` | satellite photo, 2039 x 1984 px |
| `reference/places.geojson` | collapse site and towns, with km along the flood path |
| `flood_path.geojson` | traced flood path, 44.4 km |
| `coherence/coherence_baseline.png`, `coherence_event.png`, `coherence_change.png` | coherence layers, legend in the manifest |
| `coherence/pairs/*.png` | one coherence layer per 12-day pair, for a timeline |
| `backscatter/hv_darkening.png`, `hh_change.png` | backscatter change at 50 m |
| `charts/*.png` | mini chart for each stage, shown on the story card |
| `manifest.json` | the case study for the app, same structure as `CaseStudy` in `caseStudies.ts` |
| `extra.json` | details from the analysis the app doesn't use yet |
