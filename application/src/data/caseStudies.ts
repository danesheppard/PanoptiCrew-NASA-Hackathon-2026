type StageArray = Array<EventStage>;

type EventStage = {
  type: string; // e.g., "leadUp", "event", "takeaway"
  headline: string;
  metric: { label: string; value: string };
  summary: string;
  question?: string;
  confidence: string;
  imagery: string;
  legend?: Legend;
  timeline?: string;
  replay?: Array<[number, number]> | string; // Inline [longitude, latitude] points or a GeoJSON line path under public/assets/geospatial.
  actions?: string[]; // Recommended actions or responses following the event stage
  chart?: string; // Optional chart associated with the event stage
  camera?: [number, number, number]; // Optional Three.js camera position [x, y, z].
};

type Legend = {
  gradient: [number, number, number][]; // RGB color stops.
  labels: { lowEnd: string; highEnd: string };
  type?: string;
  categories?: Array<{
    color: [number, number, number]; // RGB swatch color.
    label: string;
  }>;
};

type CaseStudy = {
  case: string;
  type: string; // e.g., "flood", "earthquake", "storm"
  title: string;
  location: string; // General location of the case study, e.g., river and country
  event_date: string;
  iconImage?: string; // Optional image representing the case study
  iconSource?: string; // Source or attribution for the icon image
  story: string; // Intro slide for case study
  method: string; // Description of how the case study was conducted
  limitations: string; // Limitations of the case study, e.g., data quality or coverage
  coordinates: Array<number>; // Geographic bounds: [west, south, east, north].
  image_crs: string; // Coordinate reference system of the imagery
  satellite: string; // Satellite used for the imagery
  sources: string[]; // List of sources for the case study
  key_dates: { before: string; event: string; after: string }; // Key dates for the case study: before, during, and after the event
  scene?: { places?: string; flood_path_km?: number; [key: string]: unknown }; // Optional scene assets and replay metadata.
  layers?: Array<{
    name: string;
    file: string;
    legend: Legend;
  }>;
  pairs?: Array<object>;
  camera?: [number, number, number]; // Optional default Three.js camera position [x, y, z].
  stages: StageArray;
};

export const caseStudies = [
  {
    case: "case2",
    type: "Flood",
    title: "Gandak River flood, Bihar (September 2026)",
    location: "Gandak River, Bihar",
    event_date: "2026-09-28",
    story:
      "Heavy rain over Nepal's Gandak basin in late September 2026 sent the river to record levels in Bihar: 91.25 m at Bagaha and 64.64 m at Dumariaghat, in Gopalganj. On the morning of September 28 the Valmikinagar barrage released about 543,500 cusecs. NISAR's L-band radar passed over the Gopalganj floodplain that evening: monsoon clouds blind optical satellites, but radar sees through them.",
    method:
      "Each radar image is converted to decibels and cleaned with a 5 x 5 median filter (speckle). Open water: HH darker than -16 dB, the value that catches 9 river pixels in 10 and no dry-field pixels in two test areas. Brighter or darker: HH changed by 3 dB or more, three times the normal movement of dry fields, kept only in patches of 9 or more pixels within 500 m of new water. Areas are counted in 20 m pixels (2,500 pixels = 1 km²).",
    limitations:
      "Provisional NISAR data (calibrated, not yet officially validated). Thresholds were measured on this scene only. A 2 to 3 km noise stripe was blanked on Sep 4 and Sep 28 (about 200 km²) and 6% of the area is outside the radar swath, so flooding there is not counted. Violet and teal areas are possibly flooded, not certain.",
    coordinates: [84.136464, 26.085577, 84.766202, 26.614634],
    image_crs: "EPSG:3857",
    satellite:
      "NISAR (NASA-ISRO), L-band, track 149 descending, frame 75, HH channel",
    sources: [
      "NISAR L2 GCOV, Provisional (NISAR_L2_GCOV_PROVISIONAL_V1), NASA Earthdata / ASF",
      "Sentinel-2 L2A photo (ESA Copernicus), via Earth Search",
      "OpenStreetMap, towns and river",
      "Water levels and barrage discharge: Bihar Water Resources Department, reported in the press; SANDRP, 2026: Making Sense of Gandak Flood II: https://sandrp.in/2026/11/05/2026-making-sense-of-gandak-flood-ii/",
      "Analysis: https://github.com/danesheppard/PanoptiCrew-NASA-Hackathon-2026 (dataScience/notebooks/case2.ipynb)",
    ],
    key_dates: {
      before: "2026-08-11",
      event: "2026-09-28",
      after: "2026-10-10",
    },
    scene: {
      imagery: "case2/sentinel2_2026-06-25.webp",
      places: "case2/places.geojson",
    },
    layers: [
      {
        name: "NISAR radar (HH), 2026-08-11, before",
        file: "case2/hh_clean_2026-08-11.webp",
        legend: {
          gradient: [
            [0, 0, 0],
            [255, 255, 255],
          ],
          labels: {
            lowEnd: "-25 dB: dark, calm water",
            highEnd: "0 dB: bright, villages and dense crops",
          },
        },
      },
      {
        name: "NISAR radar (HH), 2026-09-28, flood peak",
        file: "case2/hh_clean_2026-09-28.webp",
        legend: {
          gradient: [
            [0, 0, 0],
            [255, 255, 255],
          ],
          labels: {
            lowEnd: "-25 dB: dark, calm water",
            highEnd: "0 dB: bright, villages and dense crops",
          },
        },
      },
      {
        name: "Open water, 2026-09-04",
        file: "case2/water_2026-09-04.png",
        legend: {
          type: "categories",
          gradient: [[198, 219, 239]],
          labels: {
            lowEnd: "Open water on this date",
            highEnd: "Open water on this date",
          },
          categories: [
            {
              color: [198, 219, 239],
              label: "Open water on this date",
            },
          ],
        },
      },
      {
        name: "Open water, 2026-09-28",
        file: "case2/water_2026-09-28.png",
        legend: {
          type: "categories",
          gradient: [[198, 219, 239]],
          labels: {
            lowEnd: "Open water on this date",
            highEnd: "Open water on this date",
          },
          categories: [
            {
              color: [198, 219, 239],
              label: "Open water on this date",
            },
          ],
        },
      },
      {
        name: "Flood map, 2026-09-04 → 2026-09-28",
        file: "case2/flood_2026-09-04_2026-09-28.png",
        legend: {
          type: "categories",
          gradient: [
            [43, 140, 190],
            [8, 48, 107],
            [217, 178, 111],
            [106, 81, 163],
            [90, 180, 172],
          ],
          labels: {
            lowEnd: "Newly flooded (open water)",
            highEnd: "Darker: possibly submerged vegetation",
          },
          categories: [
            {
              color: [43, 140, 190],
              label: "Newly flooded (open water)",
            },
            {
              color: [8, 48, 107],
              label: "Water on both dates (river, ponds)",
            },
            {
              color: [217, 178, 111],
              label: "Dry again (water receded)",
            },
            {
              color: [106, 81, 163],
              label: "Brighter: villages, crops, trees standing in water",
            },
            {
              color: [90, 180, 172],
              label: "Darker: possibly submerged vegetation",
            },
          ],
        },
      },
      {
        name: "Recession, 2026-09-28 → 2026-10-10",
        file: "case2/flood_2026-09-28_2026-10-10.png",
        legend: {
          type: "categories",
          gradient: [
            [43, 140, 190],
            [8, 48, 107],
            [217, 178, 111],
            [106, 81, 163],
            [90, 180, 172],
          ],
          labels: {
            lowEnd: "Newly flooded (open water)",
            highEnd: "Darker: possibly submerged vegetation",
          },
          categories: [
            {
              color: [43, 140, 190],
              label: "Newly flooded (open water)",
            },
            {
              color: [8, 48, 107],
              label: "Water on both dates (river, ponds)",
            },
            {
              color: [217, 178, 111],
              label: "Dry again (water receded)",
            },
            {
              color: [106, 81, 163],
              label: "Brighter: villages, crops, trees standing in water",
            },
            {
              color: [90, 180, 172],
              label: "Darker: possibly submerged vegetation",
            },
          ],
        },
      },
    ],
    pairs: [
      {
        reference: "2026-09-04",
        secondary: "2026-09-28",
        file: "case2/flood_2026-09-04_2026-09-28.png",
        "water on both dates": 49.3,
        "newly flooded (open water)": 68.2,
        "dry again (water receded)": 17.9,
        "brighter: partly flooded villages, crops, trees": 21.0,
        "darker: possibly submerged vegetation": 68.5,
      },
      {
        reference: "2026-09-28",
        secondary: "2026-10-10",
        file: "case2/flood_2026-09-28_2026-10-10.png",
        "water on both dates": 25.7,
        "newly flooded (open water)": 12.8,
        "dry again (water receded)": 93.0,
        "brighter: partly flooded villages, crops, trees": 10.5,
        "darker: possibly submerged vegetation": 31.2,
      },
    ],
    stages: [
      {
        type: "leadUp",
        headline: "Before: the Gandak in its monsoon bed",
        metric: {
          label: "of open water on Sep 4, the starting point of the comparison",
          value: "68 km²",
        },
        summary:
          "On August 11 the Gandak is the dark ribbon across the top of the image: calm water acts like a mirror for radar and sends the pulse away. Every pixel darker than -16 dB, a value we measured on the river itself, counts as open water. Our flood comparison starts from the last pass before the flood, September 4, when the river covered 68 km².",
        confidence: "High",
        imagery: "case2/hh_clean_2026-08-11.webp",
        legend: {
          gradient: [
            [0, 0, 0],
            [255, 255, 255],
          ],
          labels: {
            lowEnd: "-25 dB: dark, calm water",
            highEnd: "0 dB: bright, villages and dense crops",
          },
        },
      },
      {
        type: "event",
        headline: "Flood peak: the river spreads over the floodplain",
        metric: {
          label: "newly flooded open water",
          value: "68 km²",
        },
        summary:
          "Comparing September 4 and 28 pixel by pixel, open water grows from 68 to 119 km². Water leaves three signatures: open water turns dark (blue); villages, crops and trees standing in water turn brighter, because the pulse bounces between the water and walls or stems (violet, 21 km²); fully submerged vegetation turns darker without reaching open water (teal, 68 km², possibly flooded).",
        confidence: "High",
        imagery: "case2/flood_2026-09-04_2026-09-28.png",
        legend: {
          type: "categories",
          gradient: [
            [43, 140, 190],
            [8, 48, 107],
            [217, 178, 111],
            [106, 81, 163],
            [90, 180, 172],
          ],
          labels: {
            lowEnd: "Newly flooded (open water)",
            highEnd: "Darker: possibly submerged vegetation",
          },
          categories: [
            {
              color: [43, 140, 190],
              label: "Newly flooded (open water)",
            },
            {
              color: [8, 48, 107],
              label: "Water on both dates (river, ponds)",
            },
            {
              color: [217, 178, 111],
              label: "Dry again (water receded)",
            },
            {
              color: [106, 81, 163],
              label: "Brighter: villages, crops, trees standing in water",
            },
            {
              color: [90, 180, 172],
              label: "Darker: possibly submerged vegetation",
            },
          ],
        },
      },
      {
        type: "takeaway",
        headline: "The water recedes, the risk does not end",
        metric: {
          label: "dry again by October 10",
          value: "93 km²",
        },
        summary:
          "By October 10 open water is back to 46 km² (sand: land that dried out). Two days after our peak image, on September 30, the Sheetalpur embankment breached in Gopalganj's Baikunthpur block, and more than 200 villages were inundated across six districts. NISAR passes every 12 days can follow such events through the clouds.",
        confidence: "Medium",
        imagery: "case2/flood_2026-09-28_2026-10-10.png",
        legend: {
          type: "categories",
          gradient: [
            [43, 140, 190],
            [8, 48, 107],
            [217, 178, 111],
            [106, 81, 163],
            [90, 180, 172],
          ],
          labels: {
            lowEnd: "Newly flooded (open water)",
            highEnd: "Darker: possibly submerged vegetation",
          },
          categories: [
            {
              color: [43, 140, 190],
              label: "Newly flooded (open water)",
            },
            {
              color: [8, 48, 107],
              label: "Water on both dates (river, ponds)",
            },
            {
              color: [217, 178, 111],
              label: "Dry again (water receded)",
            },
            {
              color: [106, 81, 163],
              label: "Brighter: villages, crops, trees standing in water",
            },
            {
              color: [90, 180, 172],
              label: "Darker: possibly submerged vegetation",
            },
          ],
        },
        actions: [
          "Check the villages next to the violet areas first: buildings and crops standing in water.",
          "Repeat the map on every 12-day NISAR pass to follow the water, even under monsoon clouds.",
          "Use the teal areas to widen the search, as probably flooded, not as certain water.",
        ],
      },
    ],
  },
  {
    case: "case1",
    type: "Flood",
    title: "Bhotekoshi glacier collapse and debris flood, Nepal (August 2026)",
    location: "Bhotekoshi River, Nepal",
    event_date: "2026-08-26",
    story:
      "On the morning of 26 August 2026, rock and glacier ice broke off Langtang Lirung and briefly dammed the river. The flood that followed swept down the Bhote Koshi through Rasuwagadhi, Timure and Syabrubesi, killing more than 1,400 people",
    method:
      "Coherence measures how similar the ground's radar fingerprint is between two passes 12 days apart. Ground that was ripped up, buried or flooded in between loses coherence, so a drop compared with the usual coherence marks where the flood went. Backscatter before and after, averaged to 50 m, shows how the surface changed",
    limitations:
      "Passes are 12 days apart, so the radar brackets the collapse (19 and 31 August) rather than catching it. Coherence is at 80 m, so narrow channels blur, and steep slopes facing away from the radar have gaps",
    coordinates: [85.25, 28.1, 85.6, 28.4],
    image_crs: "EPSG:3857",
    satellite: "NISAR (NASA-ISRO), L-band, track 98 ascending, frame 16",
    sources: [
      "NISAR L2 GUNW and GCOV, Provisional (NISAR_L2_GUNW_PROVISIONAL_V1, NISAR_L2_GCOV_PROVISIONAL_V1), NASA Earthdata / ASF",
      "NISAR Data User Guide: https://nisar-docs.asf.alaska.edu/",
      "ICIMOD, event timeline: https://www.icimod.org/kyirong-rasuwa-flood-2026-nepal-china-border/",
      "OpenStreetMap, town locations",
      "Esri World Imagery and AWS Terrain Tiles, 3D scene",
      "Analysis: https://github.com/danesheppard/PanoptiCrew-NASA-Hackathon-2026 (dataScience/notebooks/case1.ipynb)",
    ],
    key_dates: {
      before: "2026-08-19",
      event: "2026-08-26",
      after: "2026-08-31",
    },
    scene: {
      terrain: "case1/terrain.png",
      terrain_encoding: "terrarium: height (m) = R * 256 + G + B / 256 - 32768",
      height_range_m: [1158, 7212],
      imagery: "case1/imagery.jpg",
      places: "case1/places.geojson",
      flood_path: "case1/flood_path.geojson",
      flood_path_km: 44.4,
    },
    layers: [
      {
        name: "Usual coherence (before)",
        file: "case1/coherence_baseline.png",
        legend: {
          gradient: [
            [68, 1, 84],
            [59, 82, 139],
            [33, 145, 140],
            [94, 201, 98],
            [253, 231, 37],
          ],
          labels: {
            lowEnd: "Always changing",
            highEnd: "Stable",
          },
        },
      },
      {
        name: "Coherence Aug 19 → Aug 31",
        file: "case1/coherence_event.png",
        legend: {
          gradient: [
            [68, 1, 84],
            [59, 82, 139],
            [33, 145, 140],
            [94, 201, 98],
            [253, 231, 37],
          ],
          labels: {
            lowEnd: "Always changing",
            highEnd: "Stable",
          },
        },
      },
      {
        name: "Coherence drop",
        file: "case1/coherence_change.png",
        legend: {
          gradient: [
            [252, 171, 143],
            [248, 93, 66],
            [197, 23, 28],
            [103, 0, 13],
          ],
          labels: {
            lowEnd: "Small drop",
            highEnd: "Large drop",
          },
        },
      },
      {
        name: "Vegetation loss (HV darker)",
        file: "case1/hv_darkening.png",
        legend: {
          gradient: [
            [157, 202, 225],
            [79, 155, 203],
            [25, 102, 173],
            [8, 48, 107],
          ],
          labels: {
            lowEnd: "Slightly darker",
            highEnd: "Much darker (vegetation lost)",
          },
        },
      },
      {
        name: "HH change",
        file: "case1/hh_change.png",
        legend: {
          gradient: [
            [5, 48, 97],
            [107, 172, 209],
            [247, 246, 246],
            [228, 128, 102],
            [103, 0, 31],
          ],
          labels: {
            lowEnd: "Darker after",
            highEnd: "Brighter after",
          },
        },
      },
    ],
    pairs: [
      {
        reference: "2026-05-27",
        secondary: "2026-06-08",
        file: "case1/coherence_0527_0608.png",
        mean_coherence: 0.407,
        path_coherence: 0.404,
        spans_event: false,
      },
      {
        reference: "2026-06-08",
        secondary: "2026-06-20",
        file: "case1/coherence_0608_0620.png",
        mean_coherence: 0.48,
        path_coherence: 0.472,
        spans_event: false,
      },
      {
        reference: "2026-06-20",
        secondary: "2026-07-02",
        file: "case1/coherence_0620_0702.png",
        mean_coherence: 0.485,
        path_coherence: 0.458,
        spans_event: false,
      },
      {
        reference: "2026-07-02",
        secondary: "2026-07-14",
        file: "case1/coherence_0702_0714.png",
        mean_coherence: 0.498,
        path_coherence: 0.419,
        spans_event: false,
      },
      {
        reference: "2026-07-14",
        secondary: "2026-07-26",
        file: "case1/coherence_0714_0726.png",
        mean_coherence: 0.614,
        path_coherence: 0.545,
        spans_event: false,
      },
      {
        reference: "2026-07-26",
        secondary: "2026-08-19",
        file: "case1/coherence_0726_0819.png",
        mean_coherence: 0.573,
        path_coherence: 0.423,
        spans_event: false,
      },
      {
        reference: "2026-08-19",
        secondary: "2026-08-31",
        file: "case1/coherence_0819_0831.png",
        mean_coherence: 0.612,
        path_coherence: 0.247,
        spans_event: true,
      },
      {
        reference: "2026-08-31",
        secondary: "2026-09-12",
        file: "case1/coherence_0831_0912.png",
        mean_coherence: 0.541,
        path_coherence: 0.35,
        spans_event: false,
      },
      {
        reference: "2026-09-12",
        secondary: "2026-09-24",
        file: "case1/coherence_0912_0924.png",
        mean_coherence: 0.516,
        path_coherence: 0.515,
        spans_event: false,
      },
      {
        reference: "2026-09-24",
        secondary: "2026-10-06",
        file: "case1/coherence_0924_1006.png",
        mean_coherence: 0.256,
        path_coherence: 0.384,
        spans_event: false,
      },
      {
        reference: "2026-10-06",
        secondary: "2026-10-18",
        file: "case1/coherence_1006_1018.png",
        mean_coherence: 0.518,
        path_coherence: 0.598,
        spans_event: false,
      },
    ],
    stages: [
      {
        type: "leadUp",
        headline: "NISAR was watching the valley every few days",
        metric: {
          label: "Last pass before the collapse",
          value: "7 days before",
        },
        summary:
          "Before 26 August, NISAR passed over the valley every few days. Each pass is compared with the one 12 days earlier: where the ground stays the same, the radar picture stays the same too. Through June, July and August the valley looked normal, steady on the slopes and always changing on the snow and ice. The last pass before the collapse was on 19 August",
        confidence: "Medium",
        imagery: "case1/coherence_baseline.png",
        timeline: "case1/coherence",
        legend: {
          gradient: [
            [68, 1, 84],
            [59, 82, 139],
            [33, 145, 140],
            [94, 201, 98],
            [253, 231, 37],
          ],
          labels: {
            lowEnd: "Always changing",
            highEnd: "Stable",
          },
        },
        chart: "case1/lead_up.png",
      },
      {
        type: "event",
        headline: "The flood path shows up as ground that changed",
        metric: {
          label: "Ground that changed more than usual",
          value: "11 km²",
        },
        summary:
          "Comparing the passes on 19 August and 31 August, the valley floor changed along a 44 km line, from the collapse site below Langtang Lirung, through Rasuwagadhi and Timure, to Syabrubesi. That is the path of the debris flood: ground torn up, buried or scoured between the two passes",
        confidence: "High",
        imagery: "case1/coherence_change.png",
        replay: "case1/flood_path.geojson",
        legend: {
          gradient: [
            [252, 171, 143],
            [248, 93, 66],
            [197, 23, 28],
            [103, 0, 13],
          ],
          labels: {
            lowEnd: "Small drop",
            highEnd: "Large drop",
          },
        },
        chart: "case1/event.png",
      },
      {
        type: "takeaway",
        headline: "Radar maps the damage through cloud cover, within days",
        metric: {
          label: "Urgent Response started",
          value: "2 days after",
        },
        summary:
          "Radar sees through monsoon cloud, day or night, so within a week of the collapse NISAR had mapped the whole flood path. Along the river, the radar signal from vegetation dropped over about 15 km², where trees and plants were stripped away. 2 days after the collapse, NISAR moved the area to Urgent Response, processing new passes faster",
        confidence: "Medium",
        imagery: "case1/hv_darkening.png",
        actions: [
          "Use 12-day coherence to map damage along a valley soon after a collapse, even under monsoon cloud",
          "Keep regular passes over hanging glaciers above inhabited valleys",
        ],
        legend: {
          gradient: [
            [157, 202, 225],
            [79, 155, 203],
            [25, 102, 173],
            [8, 48, 107],
          ],
          labels: {
            lowEnd: "Slightly darker",
            highEnd: "Much darker (vegetation lost)",
          },
        },
        chart: "case1/takeaway.png",
      },
    ],
  },
  {
    case: "case3",
    type: "Wildfire",
    title: "Bald Range wildfire, Summerland, British Columbia (August 2026)",
    location: "Summerland, British Columbia",
    event_date: "2026-08-07",
    story:
      "On the evening of August 7, 2026 a wildfire started in the hills west of Summerland, in British Columbia's Okanagan valley. After a long drought, strong westerly winds pushed it downhill towards Okanagan Lake: about 5,000 ha burned in three hours and 15,600 ha by August 10. More than 20,000 people in Summerland and Peachland were ordered to leave, an 80-year-old woman died while evacuating, and about 150 structures were damaged or destroyed; in Faulder only 8 of 81 homes survived. The fire was held on August 28 at about 25,200 ha. NISAR's L-band radar sees through the smoke and into the forest canopy.",
    method:
      "The HV radar channel measures the forest canopy: the wave bounces in needles and branches. For every pixel we compare HV after the fire with July 25 (before), and remove the common change of the unburned forest 1 to 6 km around the fire (rain, calibration). In that unburned forest HV moves by about 0.6 dB on its own, so a drop of 1 dB (2 times) marks canopy loss and 2 dB (3 times) severe canopy loss, on land that was vegetated before and in patches of 9 or more pixels. The result is checked against the official fire perimeter and the Sentinel-2 burn severity.",
    limitations:
      "Provisional NISAR data (calibrated, not yet officially validated). The radar sees the canopy: light ground fires under a canopy that survived are not detected. NISAR has no data between July 27 and August 10, so the first days of the fire are not imaged. Rain on August 30 and partial coverage in October add noise. Logging also lowers HV; it is told apart by the date and the official perimeter.",
    coordinates: [-120.066303, 49.469633, -119.61584, 49.750396],
    image_crs: "EPSG:3857",
    satellite:
      "NISAR (NASA-ISRO), L-band, track 71 descending, frame 63, HV channel",
    sources: [
      "NISAR L2 GCOV, Provisional (NISAR_L2_GCOV_PROVISIONAL_V1), NASA Earthdata / ASF",
      "BC Wildfire Service fire perimeter K51490, BC Data Catalogue (PROT_CURRENT_FIRE_POLYS_SP)",
      "Sentinel-2 L2A photos and burn severity (ESA Copernicus), via Earth Search",
      "OpenStreetMap, place names",
      "BC Wildfire Service, Bald Range incident K51490; Castanet, Summerland Review, Kelowna Capital News, CBC News and The Canadian Press (August to October 2026)",
      "Wikipedia, Bald Range fire: https://en.wikipedia.org/wiki/Bald_Range_fire",
      "Analysis: https://github.com/danesheppard/PanoptiCrew-NASA-Hackathon-2026 (dataScience/notebooks/case3.ipynb)",
    ],
    key_dates: {
      before: "2026-07-25",
      event: "2026-08-18",
      after: "2026-09-11",
    },
    scene: {
      imagery: "case3/sentinel2_2026-08-04.webp",
      imagery_after: "case3/sentinel2_2026-09-18.webp",
      places: "case3/places.geojson",
      perimeter: "case3/perimeter.geojson",
    },
    layers: [
      {
        name: "NISAR radar (HV), 2026-07-25, before",
        file: "case3/hv_clean_2026-07-25.webp",
        legend: {
          gradient: [
            [0, 0, 0],
            [255, 255, 255],
          ],
          labels: {
            lowEnd: "-25 dB: dark, water, rock or bare ground",
            highEnd: "-5 dB: bright, dense forest canopy",
          },
        },
      },
      {
        name: "NISAR radar (HV), 2026-09-11, after",
        file: "case3/hv_clean_2026-09-11.webp",
        legend: {
          gradient: [
            [0, 0, 0],
            [255, 255, 255],
          ],
          labels: {
            lowEnd: "-25 dB: dark, water, rock or bare ground",
            highEnd: "-5 dB: bright, dense forest canopy",
          },
        },
      },
      {
        name: "Canopy loss, 2026-07-25 → 2026-08-18",
        file: "case3/burn_2026-08-18.png",
        legend: {
          type: "categories",
          gradient: [
            [254, 196, 79],
            [215, 48, 31],
          ],
          labels: {
            lowEnd:
              "Canopy loss (radar echo 1 dB lower than the unburned forest)",
            highEnd: "Severe canopy loss (2 dB or more)",
          },
          categories: [
            {
              color: [254, 196, 79],
              label:
                "Canopy loss (radar echo 1 dB lower than the unburned forest)",
            },
            {
              color: [215, 48, 31],
              label: "Severe canopy loss (2 dB or more)",
            },
          ],
        },
      },
      {
        name: "Canopy loss, 2026-07-25 → 2026-09-11",
        file: "case3/burn_2026-09-11.png",
        legend: {
          type: "categories",
          gradient: [
            [254, 196, 79],
            [215, 48, 31],
          ],
          labels: {
            lowEnd:
              "Canopy loss (radar echo 1 dB lower than the unburned forest)",
            highEnd: "Severe canopy loss (2 dB or more)",
          },
          categories: [
            {
              color: [254, 196, 79],
              label:
                "Canopy loss (radar echo 1 dB lower than the unburned forest)",
            },
            {
              color: [215, 48, 31],
              label: "Severe canopy loss (2 dB or more)",
            },
          ],
        },
      },
      {
        name: "Optical burn severity (Sentinel-2), 2026-08-04 → 2026-09-18",
        file: "case3/burn_severity_optical.png",
        legend: {
          type: "categories",
          gradient: [
            [240, 240, 240],
            [255, 255, 178],
            [254, 204, 92],
            [253, 141, 60],
            [189, 0, 38],
          ],
          labels: {
            lowEnd: "Optical burn severity: unburned",
            highEnd: "Optical burn severity: high",
          },
          categories: [
            {
              color: [240, 240, 240],
              label: "Optical burn severity: unburned",
            },
            {
              color: [255, 255, 178],
              label: "Optical burn severity: low",
            },
            {
              color: [254, 204, 92],
              label: "Optical burn severity: moderate-low",
            },
            {
              color: [253, 141, 60],
              label: "Optical burn severity: moderate-high",
            },
            {
              color: [189, 0, 38],
              label: "Optical burn severity: high",
            },
          ],
        },
      },
    ],
    pairs: [
      {
        reference: "2026-07-25",
        secondary: "2026-08-18",
        file: "case3/burn_2026-08-18.png",
        "canopy loss": 40.5,
        "severe canopy loss": 7.4,
        "inside perimeter (km²)": 41.0,
        "outside perimeter (km²)": 6.9,
      },
      {
        reference: "2026-07-25",
        secondary: "2026-08-30",
        file: "case3/burn_2026-08-30.png",
        "canopy loss": 65.5,
        "severe canopy loss": 7.4,
        "inside perimeter (km²)": 40.6,
        "outside perimeter (km²)": 32.4,
      },
      {
        reference: "2026-07-25",
        secondary: "2026-09-11",
        file: "case3/burn_2026-09-11.png",
        "canopy loss": 53.6,
        "severe canopy loss": 29.0,
        "inside perimeter (km²)": 74.2,
        "outside perimeter (km²)": 8.5,
      },
      {
        reference: "2026-07-25",
        secondary: "2026-09-23",
        file: "case3/burn_2026-09-23.png",
        "canopy loss": 51.5,
        "severe canopy loss": 39.2,
        "inside perimeter (km²)": 82.5,
        "outside perimeter (km²)": 8.2,
      },
      {
        reference: "2026-07-25",
        secondary: "2026-10-05",
        file: "case3/burn_2026-10-05.png",
        "canopy loss": 47.9,
        "severe canopy loss": 32.1,
        "inside perimeter (km²)": 69.9,
        "outside perimeter (km²)": 10.1,
      },
      {
        reference: "2026-07-25",
        secondary: "2026-10-17",
        file: "case3/burn_2026-10-17.png",
        "canopy loss": 47.9,
        "severe canopy loss": 44.2,
        "inside perimeter (km²)": 82.5,
        "outside perimeter (km²)": 9.7,
      },
    ],
    stages: [
      {
        type: "leadUp",
        headline: "Before: the forests above Summerland",
        metric: {
          label: "last NISAR pass before the fire started",
          value: "13 days before",
        },
        summary:
          "On July 25, after weeks of drought, the forests west of Summerland are bright in the radar's HV channel: the wave bounces many times in needles and branches before coming back. Lakes, rock and bare ground are dark. This is the reference image: the next NISAR pass came on August 18, after the fire had started, because NISAR has no data between July 27 and August 10.",
        confidence: "High",
        imagery: "case3/hv_clean_2026-07-25.webp",
        legend: {
          gradient: [
            [0, 0, 0],
            [255, 255, 255],
          ],
          labels: {
            lowEnd: "-25 dB: dark, water, rock or bare ground",
            highEnd: "-5 dB: bright, dense forest canopy",
          },
        },
      },
      {
        type: "event",
        headline: "During the fire: the canopy echo collapses",
        metric: {
          label:
            "of canopy already lost inside the fire perimeter on August 18",
          value: "41 km²",
        },
        summary:
          "On August 18, eleven days after ignition, the fire was still burning (about 22,000 ha) while most of Summerland was allowed back home. The radar echo of the forest had dropped clearly over 41 km² inside the fire perimeter. We compare each pixel with July 25 and remove what the unburned forest around the fire did on its own (rain, season), so only the change caused by the fire remains. Yellow: canopy loss; red: severe canopy loss.",
        confidence: "Medium",
        imagery: "case3/burn_2026-08-18.png",
        legend: {
          type: "categories",
          gradient: [
            [254, 196, 79],
            [215, 48, 31],
          ],
          labels: {
            lowEnd:
              "Canopy loss (radar echo 1 dB lower than the unburned forest)",
            highEnd: "Severe canopy loss (2 dB or more)",
          },
          categories: [
            {
              color: [254, 196, 79],
              label:
                "Canopy loss (radar echo 1 dB lower than the unburned forest)",
            },
            {
              color: [215, 48, 31],
              label: "Severe canopy loss (2 dB or more)",
            },
          ],
        },
      },
      {
        type: "takeaway",
        headline: "After: where the forest canopy burned",
        metric: {
          label:
            "of forest canopy lost by September 11, 90% of it inside the official perimeter",
          value: "83 km²",
        },
        summary:
          "Once the fire was held, NISAR shows 83 km² of lost canopy, 29 km² of it severe. An independent optical check agrees: the radar flags 82% of the areas Sentinel-2 rates as high burn severity and only 2% of unburned land. Light ground fires under a surviving canopy are not seen: the radar answers where the forest canopy burned.",
        confidence: "High",
        imagery: "case3/burn_2026-09-11.png",
        legend: {
          type: "categories",
          gradient: [
            [254, 196, 79],
            [215, 48, 31],
          ],
          labels: {
            lowEnd:
              "Canopy loss (radar echo 1 dB lower than the unburned forest)",
            highEnd: "Severe canopy loss (2 dB or more)",
          },
          categories: [
            {
              color: [254, 196, 79],
              label:
                "Canopy loss (radar echo 1 dB lower than the unburned forest)",
            },
            {
              color: [215, 48, 31],
              label: "Severe canopy loss (2 dB or more)",
            },
          ],
        },
        actions: [
          "Map canopy loss with NISAR while a fire is still burning: radar sees through the smoke that blinds optical satellites.",
          "Start erosion and debris-flow checks on the slopes with severe canopy loss (red) above Summerland, whose drinking-water source was damaged.",
          "Inside the official perimeter, areas without canopy loss likely burned lightly: use them to plan surveys and replanting.",
        ],
      },
    ],
  },
  {
    case: "case4",
    title: "Caroline Bezengi oil spill, Hallaniyat Islands, Oman (June to September 2026)",
    location: "Hallaniyat Islands, Oman",
    event_date: "2026-06-23",
    story: "On 8 June 2026 an explosion disabled the Caroline Bezengi, a sanctioned tanker carrying close to a million barrels of Russian crude. Around 23 June it ended up on the rocks at Jazirat Al Qibliyyah, one of the Hallaniyat Islands off Oman, and leaked through the monsoon. By 10 August Oman put the slick at about 390 km², and on 13 August oil reached the beaches at Ras Madrakah",
    method: "Oil smooths the small wind ripples on the sea, so it sends less of the radar pulse back and looks darker than the water around it. On every NISAR pass over the wreck, sea pixels at least 1.5 dB darker than the sea within about 12 km, in patches of 2 km² or more, are marked as slick. Frequency B images at 80 m, HH or VV",
    limitations: "Calm patches of sea with little wind also look dark, so some marked areas may not be oil. At L-band the slicks here are only 1 to 2 dB darker than the sea on most passes. The box covers the wreck and the coast up to Ras Madrakah, not the whole slick, and passes are about 6 days apart, with no data from 27 July to 10 August",
    coordinates: [55.8, 17.2, 58, 19.2],
    image_crs: "EPSG:3857",
    satellite: "NISAR (NASA-ISRO), L-band, track 150 descending (HH) and track 56 ascending (VV)",
    sources: [
      "NISAR L2 GCOV, Provisional (NISAR_L2_GCOV_PROVISIONAL_V1), NASA Earthdata / ASF",
      "NISAR Data User Guide: https://nisar-docs.asf.alaska.edu/",
      "Maritime Executive, grounding and timeline: https://maritime-executive.com/article/stricken-tanker-caroline-bezengi-continues-to-leak-oil-off-oman",
      "Reuters via gCaptain, slick size: https://gcaptain.com/oil-spill-off-oman-from-tanker-under-sanctions-against-russia-spreads-over-huge-area/",
      "Al Jazeera, oil on the coast: https://www.aljazeera.com/news/2026/8/13/oman-says-oil-spill-from-stricken-tanker-has-reached-its-coast",
      "OpenStreetMap and Wikipedia, place locations",
      "Analysis: https://github.com/danesheppard/PanoptiCrew-NASA-Hackathon-2026 (dataScience/notebooks/case4.ipynb)",
    ],
    key_dates: {
      before: "2026-06-18",
      event: "2026-09-16",
      after: "2026-10-10",
    },
    scene: {
      places: "case4/places.geojson",
    },
    layers: [
      {
        name: "NISAR radar, Jun 18, before the spill",
        file: "case4/radar_before.png",
        legend: {
          gradient: [
            [0, 0, 0],
            [255, 255, 255],
          ],
          labels: {
            lowEnd: "-25 dB: calm water or oil",
            highEnd: "-5 dB: rough sea, land",
          },
        },
      },
      {
        name: "NISAR radar, Sep 16",
        file: "case4/radar_event.png",
        legend: {
          gradient: [
            [0, 0, 0],
            [255, 255, 255],
          ],
          labels: {
            lowEnd: "-25 dB: calm water or oil",
            highEnd: "-5 dB: rough sea, land",
          },
        },
      },
      {
        name: "Slick, Sep 16",
        file: "case4/slick_event.png",
        legend: {
          type: "categories",
          gradient: [
            [220, 40, 40],
          ],
          labels: {
            lowEnd: "Slick",
            highEnd: "Slick",
          },
          categories: [
            {
              color: [220, 40, 40],
              label: "Slick: sea at least 1.5 dB darker than around it",
            },
          ],
        },
      },
      {
        name: "Slick footprint, June to October",
        file: "case4/slick_footprint.png",
        legend: {
          gradient: [
            [254, 217, 118],
            [253, 140, 60],
            [226, 25, 28],
            [128, 0, 38],
          ],
          labels: {
            lowEnd: "Slick on 1 pass",
            highEnd: "Slick on 4 passes",
          },
        },
      },
    ],
    pairs: [
      {
        date: "2026-06-18",
        stack: "056_A",
        file: "case4/slick_20260618_056_A.png",
        slick_km2: 5.8,
        farthest_from_wreck_km: 207.4,
      },
      {
        date: "2026-06-24",
        stack: "150_D",
        file: "case4/slick_20260624_150_D.png",
        slick_km2: 8.8,
        farthest_from_wreck_km: 51.1,
      },
      {
        date: "2026-06-30",
        stack: "056_A",
        file: "case4/slick_20260630_056_A.png",
        slick_km2: 0,
        farthest_from_wreck_km: 0,
      },
      {
        date: "2026-07-06",
        stack: "150_D",
        file: "case4/slick_20260706_150_D.png",
        slick_km2: 0,
        farthest_from_wreck_km: 0,
      },
      {
        date: "2026-07-12",
        stack: "056_A",
        file: "case4/slick_20260712_056_A.png",
        slick_km2: 2,
        farthest_from_wreck_km: 4.4,
      },
      {
        date: "2026-07-18",
        stack: "150_D",
        file: "case4/slick_20260718_150_D.png",
        slick_km2: 0,
        farthest_from_wreck_km: 0,
      },
      {
        date: "2026-07-24",
        stack: "056_A",
        file: "case4/slick_20260724_056_A.png",
        slick_km2: 78.9,
        farthest_from_wreck_km: 121.9,
      },
      {
        date: "2026-08-11",
        stack: "150_D",
        file: "case4/slick_20260811_150_D.png",
        slick_km2: 0,
        farthest_from_wreck_km: 0,
      },
      {
        date: "2026-08-17",
        stack: "056_A",
        file: "case4/slick_20260817_056_A.png",
        slick_km2: 104,
        farthest_from_wreck_km: 96.5,
      },
      {
        date: "2026-08-23",
        stack: "150_D",
        file: "case4/slick_20260823_150_D.png",
        slick_km2: 23.6,
        farthest_from_wreck_km: 54.9,
      },
      {
        date: "2026-08-29",
        stack: "056_A",
        file: "case4/slick_20260829_056_A.png",
        slick_km2: 11.8,
        farthest_from_wreck_km: 48.3,
      },
      {
        date: "2026-09-04",
        stack: "150_D",
        file: "case4/slick_20260904_150_D.png",
        slick_km2: 192.4,
        farthest_from_wreck_km: 200,
      },
      {
        date: "2026-09-10",
        stack: "056_A",
        file: "case4/slick_20260910_056_A.png",
        slick_km2: 238,
        farthest_from_wreck_km: 224,
      },
      {
        date: "2026-09-16",
        stack: "150_D",
        file: "case4/slick_20260916_150_D.png",
        slick_km2: 295.2,
        farthest_from_wreck_km: 156.6,
      },
      {
        date: "2026-09-22",
        stack: "056_A",
        file: "case4/slick_20260922_056_A.png",
        slick_km2: 241.5,
        farthest_from_wreck_km: 73.4,
      },
      {
        date: "2026-09-28",
        stack: "150_D",
        file: "case4/slick_20260928_150_D.png",
        slick_km2: 23.1,
        farthest_from_wreck_km: 195.9,
      },
      {
        date: "2026-10-10",
        stack: "150_D",
        file: "case4/slick_20261010_150_D.png",
        slick_km2: 0,
        farthest_from_wreck_km: 0,
      },
    ],
    stages: [
      {
        type: "leadUp",
        headline: "A tanker on the rocks, with NISAR passing every few days",
        metric: {
          label: "first pass after the tanker went aground",
          value: "1 day",
        },
        summary: "An explosion disabled the Caroline Bezengi, carrying close to a million barrels of crude, on 8 June. Around 23 June it ended up on the rocks at the southwest tip of Jazirat Al Qibliyyah, in the Hallaniyat Islands. NISAR passed over the islands on 18 June and again on 24 June. On radar the sea is grey, the wind's small ripples sending part of the pulse back",
        confidence: "Medium",
        imagery: "case4/radar_before.png",
        legend: {
          gradient: [
            [0, 0, 0],
            [255, 255, 255],
          ],
          labels: {
            lowEnd: "-25 dB: calm water or oil",
            highEnd: "-5 dB: rough sea, land",
          },
        },
        chart: "case4/lead_up.png",
      },
      {
        type: "event",
        headline: "The slick shows up as calm, dark water",
        metric: {
          label: "of slick in view on 16 September",
          value: "295 km²",
        },
        summary: "Oil smooths the ripples on the sea, so less of the radar pulse comes back and the slick looks darker than the water around it. On 16 September, dark streaks run north-east from the wreck for up to 157 km. Oman put the whole slick at about 390 km² on 10 August, and on 13 August oil reached the beaches at Ras Madrakah",
        confidence: "Medium",
        imagery: "case4/slick_event.png",
        legend: {
          type: "categories",
          gradient: [
            [220, 40, 40],
          ],
          labels: {
            lowEnd: "Slick",
            highEnd: "Slick",
          },
          categories: [
            {
              color: [220, 40, 40],
              label: "Slick: sea at least 1.5 dB darker than around it",
            },
          ],
        },
        chart: "case4/event.png",
      },
      {
        type: "takeaway",
        headline: "Regular passes followed the spill all summer",
        metric: {
          label: "passes over the wreck, June to October",
          value: "17",
        },
        summary: "NISAR never switched this area to emergency processing, yet its regular passes saw the wreck about every 6 days. Put together, they show where the oil went: 1086 km² of sea had a slick on at least one pass, mostly north-east of the islands. Radar sees the sea day or night and through cloud, so it can follow a spill when the weather keeps boats and planes away",
        confidence: "Medium",
        imagery: "case4/slick_footprint.png",
        legend: {
          gradient: [
            [254, 217, 118],
            [253, 140, 60],
            [226, 25, 28],
            [128, 0, 38],
          ],
          labels: {
            lowEnd: "Slick on 1 pass",
            highEnd: "Slick on 4 passes",
          },
        },
        chart: "case4/takeaway.png",
        actions: [
          "Map slicks on every regular NISAR pass near a stricken ship, without waiting for an emergency request",
          "Use the drift direction to warn the coast and protected areas downwind early",
        ],
      },
    ],
  },
  {
    case: "case5",
    title:
      "Thunder Bay 36 wildfire, Wabakimi, northwestern Ontario (July 2026)",
    event_date: "2026-07-12",
    story:
      "In early July 2026, after a warm, dry spring, lightning storms started many fires across northwestern Ontario. Around Wabakimi Provincial Park several of them merged on July 12 into Thunder Bay 36, which passed 315,000 ha by July 22: the largest wildfire ever recorded in Ontario. It reached remote First Nations with no road access. On July 13 the residents of Namaygoosisagagun (Collins) fled by boat across Collins Lake as their community burned; much of Whitewater Lake First Nation was destroyed days later, and Armstrong and Whitesand First Nation were evacuated. NISAR's L-band radar sees through the smoke and into the boreal forest.",
    method:
      "For every 40 m pixel we compare the radar after the fire with July 11 (before), and remove the common change of the unburned forest 1 to 6 km around the fire (weather, season). Two signals mark the burn: the HH echo rises when the canopy is gone and the pulse bounces between the ground and the burned trunks (seen on July 23), and the HV echo of the canopy drops (clearest on September 21). Each threshold is 2 times (3 times for severe) the normal movement of the unburned forest, on land that was vegetated before and in patches of 9 or more pixels. The result is checked against the official fire perimeter, the Sentinel-2 burn severity and the satellite fire detections.",
    limitations:
      "Provisional NISAR data (calibrated, not yet officially validated). The canopy-loss signal varies from one pass to the next, most likely with the moisture of the burned ground: on September 9 it almost disappears. Light ground fires under a surviving canopy are not detected. Pixels are 40 m. The western end of the southern lobe had already burned in early June, before the July 11 reference pass, so only its later change is seen; NISAR has no data between July 27 and August 10. Logging and other fires also change the echo; they are told apart by the date, the fire detections and the official perimeters.",
    coordinates: [-90.110517, 49.962597, -88.652044, 51.097615],
    image_crs: "EPSG:3857",
    satellite:
      "NISAR (NASA-ISRO), L-band, track 41 descending, frame 63, HV and HH channels",
    sources: [
      "NISAR L2 GCOV, Provisional (NISAR_L2_GCOV_PROVISIONAL_V1), NASA Earthdata / ASF",
      "Ontario Ministry of Natural Resources, In-year Fire Perimeters (THU036), Land Information Ontario",
      "Canadian Wildland Fire Information System (Natural Resources Canada), satellite fire detections",
      "Sentinel-2 L2A photos and burn severity (ESA Copernicus), via Earth Search",
      "Canadian Geographical Names Database (Natural Resources Canada), place names",
      "CBC News, TBNewsWatch, SNNewsWatch and Sudbury.com (July to August 2026); Wikipedia, Thunder Bay 36 Fire: https://en.wikipedia.org/wiki/Thunder_Bay_36_Fire",
      "Analysis: https://github.com/danesheppard/PanoptiCrew-NASA-Hackathon-2026 (dataScience/notebooks/case5.ipynb)",
    ],
    key_dates: {
      before: "2026-07-11",
      event: "2026-07-23",
      after: "2026-09-21",
    },
    scene: {
      imagery: "case5/sentinel2_before.webp",
      imagery_after: "case5/sentinel2_after.webp",
      places: "case5/places.geojson",
      perimeter: "case5/perimeter.geojson",
    },
    layers: [
      {
        name: "NISAR radar (HV), 2026-07-11, before",
        file: "case5/hv_clean_2026-07-11.webp",
        legend: {
          gradient: [
            [0, 0, 0],
            [255, 255, 255],
          ],
          labels: {
            lowEnd: "-25 dB: dark, lakes, rock or bare ground",
            highEnd: "-5 dB: bright, dense forest canopy",
          },
        },
      },
      {
        name: "NISAR radar (HV), 2026-09-21, after",
        file: "case5/hv_clean_2026-09-21.webp",
        legend: {
          gradient: [
            [0, 0, 0],
            [255, 255, 255],
          ],
          labels: {
            lowEnd: "-25 dB: dark, lakes, rock or bare ground",
            highEnd: "-5 dB: bright, dense forest canopy",
          },
        },
      },
      {
        name: "Burned forest brighter in HH, 2026-07-11 → 2026-07-23",
        file: "case5/bright_2026-07-23.png",
        legend: {
          type: "categories",
          gradient: [[106, 81, 163]],
          labels: {
            lowEnd:
              "Brighter in HH by 1 dB or more: burned trunks on bare ground (double bounce)",
            highEnd:
              "Brighter in HH by 1 dB or more: burned trunks on bare ground (double bounce)",
          },
          categories: [
            {
              color: [106, 81, 163],
              label:
                "Brighter in HH by 1 dB or more: burned trunks on bare ground (double bounce)",
            },
          ],
        },
      },
      {
        name: "Canopy loss (HV), 2026-07-11 → 2026-09-21",
        file: "case5/burn_2026-09-21.png",
        legend: {
          type: "categories",
          gradient: [
            [254, 196, 79],
            [215, 48, 31],
          ],
          labels: {
            lowEnd:
              "Canopy loss (radar HV echo 1 dB lower than the unburned forest)",
            highEnd: "Severe canopy loss (2 dB or more)",
          },
          categories: [
            {
              color: [254, 196, 79],
              label:
                "Canopy loss (radar HV echo 1 dB lower than the unburned forest)",
            },
            {
              color: [215, 48, 31],
              label: "Severe canopy loss (2 dB or more)",
            },
          ],
        },
      },
      {
        name: "Optical burn severity (Sentinel-2), early July → September 20 to 22",
        file: "case5/burn_severity_optical.png",
        legend: {
          type: "categories",
          gradient: [
            [240, 240, 240],
            [255, 255, 178],
            [254, 204, 92],
            [253, 141, 60],
            [189, 0, 38],
          ],
          labels: {
            lowEnd: "Optical burn severity: unburned",
            highEnd: "Optical burn severity: high",
          },
          categories: [
            {
              color: [240, 240, 240],
              label: "Optical burn severity: unburned",
            },
            {
              color: [255, 255, 178],
              label: "Optical burn severity: low",
            },
            {
              color: [254, 204, 92],
              label: "Optical burn severity: moderate-low",
            },
            {
              color: [253, 141, 60],
              label: "Optical burn severity: moderate-high",
            },
            {
              color: [189, 0, 38],
              label: "Optical burn severity: high",
            },
          ],
        },
      },
    ],
    pairs: [
      {
        reference: "2026-07-11",
        secondary: "2026-07-23",
        file: "case5/burn_2026-07-23.png",
        file_brighter: "case5/bright_2026-07-23.png",
        "canopy loss": 158.1,
        "severe canopy loss": 9.7,
        "brighter HH (km²)": 1857.1,
        "canopy loss inside (km²)": 14.4,
        "canopy loss outside (km²)": 153.5,
        "brighter HH inside (km²)": 1514.0,
        "brighter HH outside (km²)": 343.1,
      },
      {
        reference: "2026-07-11",
        secondary: "2026-08-16",
        file: "case5/burn_2026-08-16.png",
        file_brighter: "case5/bright_2026-08-16.png",
        "canopy loss": 658.9,
        "severe canopy loss": 247.2,
        "brighter HH (km²)": 2196.0,
        "canopy loss inside (km²)": 690.9,
        "canopy loss outside (km²)": 215.2,
        "brighter HH inside (km²)": 1115.3,
        "brighter HH outside (km²)": 1080.7,
      },
      {
        reference: "2026-07-11",
        secondary: "2026-09-09",
        file: "case5/burn_2026-09-09.png",
        file_brighter: "case5/bright_2026-09-09.png",
        "canopy loss": 258.3,
        "severe canopy loss": 20.0,
        "brighter HH (km²)": 1916.7,
        "canopy loss inside (km²)": 201.3,
        "canopy loss outside (km²)": 77.0,
        "brighter HH inside (km²)": 1386.1,
        "brighter HH outside (km²)": 530.6,
      },
      {
        reference: "2026-07-11",
        secondary: "2026-09-21",
        file: "case5/burn_2026-09-21.png",
        file_brighter: "case5/bright_2026-09-21.png",
        "canopy loss": 1055.9,
        "severe canopy loss": 424.6,
        "brighter HH (km²)": 903.1,
        "canopy loss inside (km²)": 1273.9,
        "canopy loss outside (km²)": 206.7,
        "brighter HH inside (km²)": 554.9,
        "brighter HH outside (km²)": 348.2,
      },
      {
        reference: "2026-07-11",
        secondary: "2026-10-03",
        file: "case5/burn_2026-10-03.png",
        file_brighter: "case5/bright_2026-10-03.png",
        "canopy loss": 737.5,
        "severe canopy loss": 120.1,
        "brighter HH (km²)": 1598.1,
        "canopy loss inside (km²)": 696.3,
        "canopy loss outside (km²)": 161.2,
        "brighter HH inside (km²)": 1134.5,
        "brighter HH outside (km²)": 463.6,
      },
      {
        reference: "2026-07-11",
        secondary: "2026-10-15",
        file: "case5/burn_2026-10-15.png",
        file_brighter: "case5/bright_2026-10-15.png",
        "canopy loss": 626.7,
        "severe canopy loss": 66.1,
        "brighter HH (km²)": 1812.7,
        "canopy loss inside (km²)": 511.1,
        "canopy loss outside (km²)": 181.7,
        "brighter HH inside (km²)": 1293.0,
        "brighter HH outside (km²)": 519.7,
      },
    ],
    stages: [
      {
        type: "leadUp",
        headline: "Before: the boreal forest of Wabakimi",
        metric: {
          label: "last NISAR pass before the fire got its name",
          value: "1 day before",
        },
        summary:
          "On July 11 the boreal forest around Wabakimi Provincial Park is bright in the radar's HV channel: the wave bounces many times in needles, leaves and branches before coming back. The hundreds of lakes are black. Lightning had started fires in the region since July 6; the next day several of them merged into Thunder Bay 36.",
        confidence: "High",
        imagery: "case5/hv_clean_2026-07-11.webp",
        legend: {
          gradient: [
            [0, 0, 0],
            [255, 255, 255],
          ],
          labels: {
            lowEnd: "-25 dB: dark, lakes, rock or bare ground",
            highEnd: "-5 dB: bright, dense forest canopy",
          },
        },
      },
      {
        type: "event",
        headline: "During the fire: the burned forest lights up",
        metric: {
          label: "of burned forest already brighter in the radar on July 23",
          value: "1,514 km²",
        },
        summary:
          "On July 23, eleven days after the fire got its name, it had passed 315,000 ha and was still out of control; between July 12 and 22 satellites had detected flames inside its perimeter 48,239 times. Where the canopy burned, the radar's HH echo got brighter over 1,514 km²: with the needles gone, the pulse bounces between the ground and the standing burned trunks and comes straight back, the same double bounce as the flooded villages of case 2.",
        confidence: "High",
        imagery: "case5/bright_2026-07-23.png",
        legend: {
          type: "categories",
          gradient: [[106, 81, 163]],
          labels: {
            lowEnd:
              "Brighter in HH by 1 dB or more: burned trunks on bare ground (double bounce)",
            highEnd:
              "Brighter in HH by 1 dB or more: burned trunks on bare ground (double bounce)",
          },
          categories: [
            {
              color: [106, 81, 163],
              label:
                "Brighter in HH by 1 dB or more: burned trunks on bare ground (double bounce)",
            },
          ],
        },
      },
      {
        type: "takeaway",
        headline: "After: where the boreal canopy burned",
        metric: {
          label:
            "of forest canopy lost by September 21, 86% of it inside the official perimeter",
          value: "1,481 km²",
        },
        summary:
          "On September 21 the canopy loss stands out in the HV channel: 1,481 km², 425 km² of it severe. An independent optical check agrees: together, the two radar signals flag 88% of the forest Sentinel-2 rates as high burn severity, and only 8% of unburned forest. On some passes, most likely when the burned ground is wet, the canopy loss is partly hidden: one radar pass is not enough for a boreal fire.",
        confidence: "Medium",
        imagery: "case5/burn_2026-09-21.png",
        legend: {
          type: "categories",
          gradient: [
            [254, 196, 79],
            [215, 48, 31],
          ],
          labels: {
            lowEnd:
              "Canopy loss (radar HV echo 1 dB lower than the unburned forest)",
            highEnd: "Severe canopy loss (2 dB or more)",
          },
          categories: [
            {
              color: [254, 196, 79],
              label:
                "Canopy loss (radar HV echo 1 dB lower than the unburned forest)",
            },
            {
              color: [215, 48, 31],
              label: "Severe canopy loss (2 dB or more)",
            },
          ],
        },
        actions: [
          "Map burned forest with NISAR while a fire is still burning: radar sees through the smoke over areas no road reaches.",
          "Share the burn maps with Namaygoosisagagun and Whitewater Lake First Nations to plan rebuilding and safe access.",
          "Combine several radar passes and both channels: one pass can hide the canopy loss, the double bounce keeps showing the burn.",
        ],
      },
    ],
  },
] as CaseStudy[];
