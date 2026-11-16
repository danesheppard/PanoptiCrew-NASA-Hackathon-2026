# Case 3 colour keys not covered by the standard legend

The standard `Legend` in `caseStudies.ts` is a colour **gradient** with a low-end and a high-end label. The maps below are **categories** (named colours, not a scale). In `manifest.json` their legends carry `"type": "categories"` and a `categories` list with the same colours and labels as the tables below, so a legend component can draw one swatch per category.

Transparent pixels on these images mean no change or no data.

### Canopy loss maps (`burn_*.png`): event and takeaway stages

| Hex | RGB | Label |
|---|---|---|
| `#fec44f` | `[254, 196, 79]` | Canopy loss (radar echo 1 dB lower than the unburned forest) |
| `#d7301f` | `[215, 48, 31]` | Severe canopy loss (2 dB or more) |

### Optical burn severity (`burn_severity_optical.png`)

| Hex | RGB | Label |
|---|---|---|
| `#f0f0f0` | `[240, 240, 240]` | Optical burn severity: unburned |
| `#ffffb2` | `[255, 255, 178]` | Optical burn severity: low |
| `#fecc5c` | `[254, 204, 92]` | Optical burn severity: moderate-low |
| `#fd8d3c` | `[253, 141, 60]` | Optical burn severity: moderate-high |
| `#bd0026` | `[189, 0, 38]` | Optical burn severity: high |

### Radar images (`hv_*.webp`): a real gradient

Grey from black (-25 dB: water, rock, bare ground) to white (-5 dB: dense forest canopy); the standard gradient legend is enough.
