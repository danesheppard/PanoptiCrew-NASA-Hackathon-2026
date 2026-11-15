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
  replay?: Array<[number, number]>;
  actions?: string[]; // Recommended actions or responses following the event stage
};

type Legend = {
  gradient: [number, number, number][];
  labels: { lowEnd: string; highEnd: string };
  type?: string;
};

type CaseStudy = {
  case: string;
  title: string;
  location: string; // General location of the case study
  event_date: string;
  iconImage?: string; // Optional image representing the case study
  iconSource?: string; // Source or attribution for the icon image
  story: string; // Intro slide for case study
  method: string; // Description of how the case study was conducted
  limitations: string; // Limitations of the case study, e.g., data quality or coverage
  coordinates: Array<number>; // [longitude, latitude] or [minLon, minLat, maxLon, maxLat] depending on the case study
  image_crs: string; // Coordinate reference system of the imagery
  satellite: string; // Satellite used for the imagery
  sources: string[]; // List of sources for the case study
  key_dates: { before: string; event: string; after: string }; // Key dates for the case study: before, during, and after the event
  scene?: {};
  layers?: [
    {
      name: string;
      file: string;
      legend: Legend;
    },
  ];
  pairs?: Array<object>;
  stages: StageArray;
};

export const caseStudies = [
  {
    case: "case2",
    title: "Gandak River flood, Bihar (September 2026)",
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
      imagery: "case2/reference/sentinel2_2026-06-25.webp",
      places: "case2/reference/places.geojson",
    },
    layers: [
      {
        name: "NISAR radar (HH), 2026-08-11, before",
        file: "case2/radar/hh_clean_2026-08-11.webp",
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
        file: "case2/radar/hh_clean_2026-09-28.webp",
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
        file: "case2/water/water_2026-09-04.png",
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
        file: "case2/water/water_2026-09-28.png",
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
        file: "case2/flood/flood_2026-09-04_2026-09-28.png",
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
        file: "case2/flood/flood_2026-09-28_2026-10-10.png",
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
        file: "case2/flood/flood_2026-09-04_2026-09-28.png",
        "water on both dates": 49.3,
        "newly flooded (open water)": 68.2,
        "dry again (water receded)": 17.9,
        "brighter: partly flooded villages, crops, trees": 21.0,
        "darker: possibly submerged vegetation": 68.5,
      },
      {
        reference: "2026-09-28",
        secondary: "2026-10-10",
        file: "case2/flood/flood_2026-09-28_2026-10-10.png",
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
        imagery: "case2/radar/hh_clean_2026-08-11.webp",
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
        imagery: "case2/flood/flood_2026-09-04_2026-09-28.png",
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
        imagery: "case2/flood/flood_2026-09-28_2026-10-10.png",
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
    case: "bhotekoshi-landslide",
    title: "Bhotekoshi landslide, Nepal (August 2026)",
    location: "Bhotekoshi, Nepal",
    iconImage: "nepal.jpg",
    iconSource: "Arjay Neyra via pexels.com",
    coordinates: [85.25, 28.1, 85.6, 28.4],
    method: "Satellite imagery analysis",
    story:
      "On 25 August 2026, part of a glacier on Langtang Lirung broke off and fell into the valley below, damming the river. The next morning the dam burst, and a flood of water and debris swept down the Bhote Koshi, through Rasuwagadhi, Timure and Syabrubesi, killing more than 1,400 people.",
    key_dates: {
      before: "2026-08-19",
      event: "2026-08-25",
      after: "2026-08-31",
    },
    sources: ["Sample source 1", "Sample source 2"],
    stages: [
      {
        type: "leadUp",
        headline: "NISAR was watching the valley every few days",
        metric: {
          label: "Last pass before the collapse",
          value: "7 days before",
        },
        summary:
          "Before 26 August, NISAR passed over the valley every few days. Each pass is compared with the one 12 days earlier: where the ground stays the same, the radar picture stays the same too. Through June, July and August the valley looked normal, steady on the slopes and always changing on the snow and ice. The last pass before the collapse was on 19 August.",
        confidence: "Medium",
        imagery: "case1/coherence_baseline.png",
        legend: {
          gradient: [
            [68, 1, 84],
            [59, 82, 139],
            [33, 145, 140],
            [94, 201, 98],
            [253, 231, 37],
          ],
          labels: { lowEnd: "Always changing", highEnd: "Stable" },
        },
        timeline: "coherence/pairs",
      },
      {
        type: "event",
        headline: "The flood path shows up as ground that changed",
        metric: {
          label: "Ground that changed more than usual",
          value: "11 km²",
        },
        summary:
          "Comparing the passes on 19 August and 31 August, the valley floor changed along a 44 km line, from the collapse site below Langtang Lirung, through Rasuwagadhi and Timure, to Syabrubesi. That is the path of the debris flood: ground torn up, buried or scoured between the two passes.",
        confidence: "High",
        imagery: "case1/coherence_change.png",
        legend: {
          gradient: [
            [252, 171, 143],
            [248, 93, 66],
            [197, 23, 28],
            [103, 0, 13],
          ],
          labels: { lowEnd: "Small decrease", highEnd: "Large decrease" },
        },
        replay: "flood_path.geojson",
      },
      {
        type: "takeaway",
        headline: "Radar maps the damage through cloud, within days",
        metric: { label: "Urgent Response started", value: "2 days after" },
        summary:
          "Radar sees through monsoon cloud, day or night, so within a week of the collapse NISAR had mapped the whole flood path. Along the river, the radar signal from vegetation dropped over about 15 km², where trees and plants were stripped away. Two days after the collapse, NISAR moved the area to Urgent Response, processing new passes faster.",
        confidence: "Medium",
        imagery: "case1/hv_darkening.png",
        legend: {
          gradient: [
            [157, 202, 225],
            [79, 155, 203],
            [25, 102, 173],
            [8, 48, 107],
          ],
          labels: {
            lowEnd: "Slightly darker (",
            highEnd: "Much darker (vegetation lost)",
          },
        },
        actions: [
          "Use 12-day coherence to map damage along a valley soon after a collapse, even under monsoon cloud",
          "Keep regular passes over hanging glaciers above inhabited valleys",
        ],
      },
    ] as StageArray,
    // Example usage:
    // stages: [
    //   { type: "leadUp", headline: "...", metric: { label: "...", value: "..." }, summary: "...", confidence: "...", imagery: "..." },
    //   { type: "event", headline: "...", metric: { label: "...", value: "..." }, summary: "...", confidence: "...", imagery: "..." },
    //   { type: "takeaway", headline: "...", metric: { label: "...", value: "..." }, summary: "...", confidence: "...", imagery: "...", actions: ["..."] }
    // ],
  },
] as CaseStudy[];
