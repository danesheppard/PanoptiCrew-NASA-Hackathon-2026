// Placeholder content only; replace with processed output from dataScience/.
const stages = (place) => ({
  leadUp: {
    summary: `Sample text describing conditions around ${place} before the event.`,
    imagery: 'Placeholder: "before" satellite imagery',
  },
  event: {
    summary: `Sample text describing what changed at ${place} during the event.`,
    imagery: 'Placeholder: "during" satellite imagery',
  },
  takeaway: {
    summary: `Sample text summarizing what the evidence shows about ${place}.`,
    imagery: 'Placeholder: "after" satellite imagery',
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
    timeline: { start: "2024-11-01", event: "2025-03-01", end: "2025-06-01" },
    ...common,
    stages: stages("the drought-affected area"),
  },
];
