# Case 4 export: Caroline Bezengi oil spill seen by NISAR

Produced by `notebooks/case4.ipynb` (section 4). Copy these files to `application/public/assets/geospatial/case4/`

Every image covers the box in `manifest.json` → `coordinates`, in Web Mercator (EPSG:3857), 1024 x 980 px. Transparent pixels mean nothing to show

| File | What it is |
|---|---|
| `radar_before.png`, `radar_event.png` | NISAR radar in grey, before the spill and on the pass with the most slick |
| `slick_event.png` | slick on that pass, red |
| `slick_footprint.png` | how many passes saw a slick at each spot |
| `slick_<date>_<stack>.png` | slick on each pass, for a timeline |
| `places.geojson` | labels for the 3D view |
| `lead_up.png`, `event.png`, `takeaway.png` | mini chart for each stage |
| `manifest.json` | the case study for the app, same structure as `CaseStudy` in `caseStudies.ts` |
