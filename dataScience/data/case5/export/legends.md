# Case 5 colour keys not covered by the standard legend

The standard `Legend` in `caseStudies.ts` is a colour **gradient** with a low-end and a high-end label. The maps below are **categories** (named colours, not a scale). In `manifest.json` their legends carry `"type": "categories"` and a `categories` list with the same colours and labels as the tables below, so a legend component can draw one swatch per category.

Transparent pixels on these images mean no change or no data.

### Brighter in HH (`bright_*.png`): event stage

| Hex | RGB | Label |
|---|---|---|
| `#6a51a3` | `[106, 81, 163]` | Brighter in HH by 1 dB or more: burned trunks on bare ground (double bounce) |

### Canopy loss in HV (`burn_*.png`): takeaway stage

| Hex | RGB | Label |
|---|---|---|
| `#fec44f` | `[254, 196, 79]` | Canopy loss (radar HV echo 1 dB lower than the unburned forest) |
| `#d7301f` | `[215, 48, 31]` | Severe canopy loss (2 dB or more) |

### Optical burn severity (`burn_severity_optical.png`)

| Hex | RGB | Label |
|---|---|---|
| `#f0f0f0` | `[240, 240, 240]` | Optical burn severity: unburned |
| `#ffffb2` | `[255, 255, 178]` | Optical burn severity: low |
| `#fecc5c` | `[254, 204, 92]` | Optical burn severity: moderate-low |
| `#fd8d3c` | `[253, 141, 60]` | Optical burn severity: moderate-high |
| `#bd0026` | `[189, 0, 38]` | Optical burn severity: high |

### Radar images (`hv_*.webp`, `hh_*.webp`): a real gradient

Grey from black to white: HV from -25 dB (lakes, rock, bare ground) to -5 dB (dense forest canopy), HH from -20 to 0 dB; the standard gradient legend is enough.
