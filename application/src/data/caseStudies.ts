type StageArray = Array<EventStage>;

type EventStage = {
  type: string; // e.g., "leadUp", "event", "takeaway"
  headline: string;
  metric: { label: string; value: string };
  summary: string;
  question?: string;
  confidence: string;
  imagery: string;
  actions?: string[];
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
    id: "sample-flood",
    title: "Sample Case Study: Flood",
    type: "Flood",
    location: "Placeholder region, South Asia",
    iconImage: "nepal.jpg",
    iconSource: "Sample source for flood image",
    coordinates: [90.4, 23.7],
    headline: "Sample: river levels signaled the flood in advance",
    keyMetric: { label: "Sample inundated area", value: "0,000 km²" },
    summary: "Sample one-sentence framing of why this flood matters.",
    timeline: { start: "2025-05-01", event: "2025-06-20", end: "2025-08-01" },
    ...common,
    stages: [
      placeholderLeadup,
      placeholderEvent,
      placeholderTakeaway,
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
        headline: "Sample warning signal headline",
        metric: { label: "Sample indicator change", value: "−00%" },
        summary: "Sample text describing conditions before the event.",
        confidence: "Medium",
        imagery: 'Placeholder: "before" satellite imagery',
      },
      {
        type: "event",
        headline: "Sample event headline",
        metric: { label: "Sample event metric", value: "00" },
        summary: "Sample text describing the event.",
        confidence: "High",
        imagery: 'Placeholder: "during" satellite imagery',
      },
      {
        type: "takeaway",
        headline: "Sample takeaway headline",
        metric: { label: "Sample takeaway metric", value: "00" },
        summary: "Sample text describing the aftermath and lessons learned.",
        confidence: "Medium",
        imagery: 'Placeholder: "after" satellite imagery',
        actions: ["Sample recommended action 1", "Sample recommended action 2"],
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
