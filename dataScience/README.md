# Data science

One Jupyter notebook per case study. Each notebook finds the NISAR passes over the event, looks at the data, measures the change and exports everything the application needs

| Notebook | Event | Main signal |
|---|---|---|
| `case1.ipynb` | Bhotekoshi glacier collapse and debris flood, Nepal, Aug 2026 | Coherence (GUNW) and HV backscatter (GCOV) |
| `case2.ipynb` | Gandak River flood, Bihar, India, Sep 2026 | Backscatter (GCOV), open water turns dark |
| `case3.ipynb` | Bald Range wildfire, British Columbia, Aug 2026 | HV backscatter (GCOV), burned forest turns dark |
| `case4.ipynb` | Caroline Bezengi oil spill, Hallaniyat Islands, Oman, Jun to Sep 2026 | Backscatter (GCOV), oil calms the sea and turns dark |
| `case5.ipynb` | Thunder Bay 36 wildfire, northwestern Ontario, Jul 2026 | HV backscatter (GCOV), burned forest turns dark |

Each notebook opens with its sources, a summary of the findings and an AI usage acknowledgement

## Setup

1. Python 3.11 or newer, then install the packages

   ```bash
   cd dataScience
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

2. Get an Earthdata Login account and a user token ([how to get a token](https://urs.earthdata.nasa.gov/documentation/for_users/user_token)), then put it in `dataScience/.env`

   ```
   EDL_TOKEN=your-token
   ```

   `.env` is ignored by git, never commit it

3. Open a notebook from `notebooks/` and run it top to bottom

## Structure of a notebook

1. **Data retrieval**: search NASA's CMR for NISAR granules over the area and dates, and read them straight from the cloud
2. **Exploratory data analysis**: what each file holds, which passes cover the area and how complete they are
3. **Case study analysis**: when the passes fall against the event (temporal), where they cover it (geospatial), and the change measured from one pass to the next
4. **Processing for the application**: overlays reprojected to Web Mercator, places and paths as GeoJSON, legends, mini charts and a `manifest.json` in the shape of the `CaseStudy` type in `application/src/data/caseStudies.ts`

## Outputs

- `data/<case>/export/`: everything the application uses for that case, with its own `README.md`. Copy the folder to `application/public/assets/geospatial/<case>/`, the paths in the manifest are already relative to that folder
- `data/<case>/cache/`: downloaded and intermediate rasters, kept so reruns are faster. Ignored by git, safe to delete

## Data

- NISAR L2 GCOV and GUNW products, Provisional quality, from NASA Earthdata / ASF ([NISAR Data User Guide](https://nisar-docs.asf.alaska.edu/))
- Place names and roads from [OpenStreetMap](https://www.openstreetmap.org/), terrain heights from [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/)
- Event details from the news and agency sources listed at the top of each notebook
