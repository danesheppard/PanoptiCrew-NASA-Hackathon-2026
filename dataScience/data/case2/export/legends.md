# Case 2 colour keys not covered by the standard legend

The standard `Legend` in `caseStudies.ts` is a colour **gradient** with a low-end and a high-end label. The maps below are **categories** (named colours, not a scale). In `manifest.json` their legends carry `"type": "categories"` and a `categories` list with the same colours and labels as the tables below, so a legend component can draw one swatch per category.

Transparent pixels on these images mean no change or no data.

### Flood maps (`flood_*.png`): event and takeaway stages

| Hex | RGB | Label |
|---|---|---|
| `#2b8cbe` | `[43, 140, 190]` | Newly flooded (open water) |
| `#08306b` | `[8, 48, 107]` | Water on both dates (river, ponds) |
| `#d9b26f` | `[217, 178, 111]` | Dry again (water receded) |
| `#6a51a3` | `[106, 81, 163]` | Brighter: villages, crops, trees standing in water |
| `#5ab4ac` | `[90, 180, 172]` | Darker: possibly submerged vegetation |

### Open water per date (`water_*.png`)

| Hex | RGB | Label |
|---|---|---|
| `#c6dbef` | `[198, 219, 239]` | Open water on this date |

### Radar images (`hh_*.webp`): a real gradient

Grey from black (-25 dB, calm water) to white (0 dB, villages and dense crops); the standard gradient legend is enough.
