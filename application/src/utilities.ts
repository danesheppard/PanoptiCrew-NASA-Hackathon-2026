export function calculateCentroid(coordinates: number[]): number[] {
  if (coordinates.length === 2) return coordinates;
  const [minLng, minLat, maxLng, maxLat] = coordinates;
  return [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
}
