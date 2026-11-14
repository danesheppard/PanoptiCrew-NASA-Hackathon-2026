// Placeholder content only; replace with processed output from dataScience/.
const stages = (place) => ({
  leadUp: {
    headline: "Sample warning signal headline",
    metric: { label: "Sample indicator change", value: "−00%" },
    summary: `Sample text describing conditions around ${place} before the event.`,
    confidence: "Medium",
    imagery: 'Placeholder: "before" satellite imagery',
  },
  event: {
    headline: "Sample impact headline",
    metric: { label: "Sample affected area", value: "0,000 ha" },
    summary: `Sample text describing what changed at ${place} during the event.`,
    confidence: "Medium",
    imagery: 'Placeholder: "during" satellite imagery',
  },
  takeaway: {
    headline: "Sample lesson headline",
    metric: { label: "Sample warning lead time", value: "0 weeks" },
    summary: `Sample text summarizing what the evidence shows about ${place}.`,
    confidence: "Low",
    imagery: 'Placeholder: "after" satellite imagery',
    actions: [
      "Sample action: monitor the leading indicator",
      "Sample action: prioritize exposed communities",
    ],
  },
});

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
    coordinates: [-120.5, 38.5],
    headline: "Sample: weeks of warning before the fire spread",
    keyMetric: { label: "Sample burned area", value: "0,000 ha" },
    summary: "Sample one-sentence framing of why this wildfire matters.",
    timeline: { start: "2025-07-01", event: "2025-08-15", end: "2025-10-01" },
    ...common,
    stages: stages("the wildfire area"),
  },
  {
    id: "sample-flood",
    title: "Sample Case Study: Flood",
    type: "Flood",
    location: "Placeholder region, South Asia",
    coordinates: [90.4, 23.7],
    headline: "Sample: river levels signaled the flood in advance",
    keyMetric: { label: "Sample inundated area", value: "0,000 km²" },
    summary: "Sample one-sentence framing of why this flood matters.",
    timeline: { start: "2025-05-01", event: "2025-06-20", end: "2025-08-01" },
    ...common,
    stages: stages("the flooded area"),
  },
  {
    id: "sample-drought",
    title: "Sample Case Study: Drought",
    type: "Drought",
    location: "Placeholder region, East Africa",
    coordinates: [38.7, 9.0],
    headline: "Sample: vegetation stress preceded the drought",
    keyMetric: { label: "Sample cropland affected", value: "00%" },
    summary: "Sample one-sentence framing of why this drought matters.",
    timeline: { start: "2024-11-01", event: "2025-03-01", end: "2025-06-01" },
    ...common,
    stages: stages("the drought-affected area"),
  },
];
