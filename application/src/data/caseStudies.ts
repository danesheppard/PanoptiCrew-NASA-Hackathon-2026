type StageArray = Array<EventStage>;

type EventStage = {
  type: string; // e.g., "leadUp", "event", "takeaway"
  headline: string;
  metric: { label: string; value: string };
  summary: string;
  question?: string;
  confidence: string;
  imagery: string;
  legend?: {
    gradient: [number, number, number][];
    labels: { lowEnd: string; highEnd: string };
    type?: string;
  };
  timeline?: string;
  replay?: Array<[number, number]>;
  actions?: string[];
};

type Legend = {
  gradient: [number, number, number][];
  labels: { lowEnd: string; highEnd: string };
  type?: string;
};

type CaseStudy = {
  case: string;
  title: string;
  event_date: string;
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

const placeholderLeadup: EventStage = {
  type: "leadUp",
  headline: "Sample warning signal headline",
  metric: { label: "Sample indicator change", value: "−00%" },
  summary: "Sample text describing conditions before the event.",
  confidence: "Medium",
  imagery: 'Placeholder: "before" satellite imagery',
};

const placeholderEvent: EventStage = {
  type: "event",
  headline: "Sample impact headline",
  metric: { label: "Sample affected area", value: "0,000 ha" },
  summary: "Sample text describing what changed during the event.",
  confidence: "Medium",
  imagery: 'Placeholder: "during" satellite imagery',
};

const placeholderTakeaway: EventStage = {
  type: "takeaway",
  headline: "Sample lesson headline",
  metric: { label: "Sample warning lead time", value: "0 weeks" },
  summary: "Sample text summarizing what the evidence shows.",
  confidence: "Low",
  imagery: 'Placeholder: "after" satellite imagery',
  actions: [
    "Sample action: monitor the leading indicator",
    "Sample action: prioritize exposed communities",
  ],
};

const common = {
  sources: ["Sample source A (placeholder)", "Sample source B (placeholder)"],
  methods: "Placeholder description of how imagery was processed and compared.",
  limitations: "Placeholder note on resolution, cloud cover, and timing gaps.",
};

export const caseStudies = [
  {
    id: "sample-wildfire",
    title: "Sample Case Study: Wildfire",
    type: "Wildfire",
    location: "Placeholder region, North America",
    iconImage: "nepal.jpg",
    iconSource: "Sample source for wildfire image",
    coordinates: [-120.5, 38.5],
    headline: "Sample: weeks of warning before the fire spread",
    keyMetric: { label: "Sample burned area", value: "0,000 ha" },
    summary: "Sample one-sentence framing of why this wildfire matters.",
    timeline: { start: "2025-07-01", event: "2025-08-15", end: "2025-10-01" },
    ...common,
    stages: [
      placeholderLeadup,
      placeholderEvent,
      placeholderTakeaway,
    ] as StageArray,
  },
  {
    id: "gandak-flood",
    title: "Gandak Flood",
    type: "Flood",
    location: "Placeholder region, South Asia",
    iconImage: "jhenning-flood.jpg",
    iconSource: "Image from jhenning via pixabay.com",
    coordinates: [84.15, 26.1, 84.75, 26.6],
    imageBounds: [
      84.13646446971275, 26.085576677999846, 84.76620208267364,
      26.614634172899674,
    ],
    headline: "Heavy rain in Nepal causes flooding",
    keyMetric: { label: "Sample inundated area", value: "0,000 km²" },
    summary:
      "TO VALIDATE! IS THIS CORRECT? Heavy rain in Nepal on September 26-27, 2026 pushed the Gandak River to a record 91.25m at Bagaha. NISAR passed over the region during this period, capturing satellite imagery of the flooding.",
    timeline: { start: "2026-08-11", event: "2026-09-28", end: "2026-10-10" },
    ...common,
    stages: [
      {
        type: "leadUp",
        headline: "All is calm",
        metric: { label: "Sample indicator change", value: "−00%" },
        summary:
          "On August 11, 2026, the river is clearly visible in the darker parts of the satellite imagery. This is largely unchanged compared to previous months.",
        confidence: "High",
        imagery: "hh_clean_2026-08-11.webp",
      },
      {
        type: "event",
        headline: "Heavy rain triggers flooding (IS THIS CORRECT?)",
        metric: { label: "Sample event metric", value: "00" },
        summary:
          "Flooding occurs as the Gandak River overflows its banks on September 26-27, 2026.",
        confidence: "High",
        imagery: "flood_2026-09-04_2026-09-28.png",
      },
      {
        type: "takeaway",
        headline: "Flood aftermath",
        metric: { label: "Sample takeaway metric", value: "00" },
        summary:
          "The floodwaters recede, leaving behind damaged infrastructure and affected communities.",
        confidence: "Medium",
        imagery: "flood_2026-09-28_2026-10-10.png",
        actions: ["Sample recommended action 1", "Sample recommended action 2"],
      },
    ] as StageArray,
  },
  {
    id: "bhotekoshi-landslide",
    title: "Bhotekoshi landslide, Nepal (August 2026)",
    type: "Landslide",
    location: "Bhotekoshi, Nepal",
    iconImage: "nepal.jpg",
    iconSource: "Arjay Neyra via pexels.com",
    coordinates: [85.25, 28.1, 85.6, 28.4],
    imageBounds: [85.25, 28.1, 85.6, 28.4],
    headline: "Devestating landslide in Bhotekoshi, Nepal",
    keyMetric: { label: "Sample area affected", value: "00 ha" },
    summary:
      "On 25 August 2026, part of a glacier on Langtang Lirung broke off and fell into the valley below, damming the river. The next morning the dam burst, and a flood of water and debris swept down the Bhote Koshi, through Rasuwagadhi, Timure and Syabrubesi, killing more than 1,400 people.",
    question:
      "Were there early warning signs of the landslide that could have given the region time to prepare?",
    timeline: { start: "2026-07-01", event: "2026-08-15", end: "2026-09-01" },
    ...common,
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
        imagery: "coherence_baseline.png",
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
        imagery: "coherence_change.png",
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
        imagery: "hv_darkening.png",
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
];
