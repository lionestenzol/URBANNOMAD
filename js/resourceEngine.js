import { resources } from './resources.js';
import { getDistance } from './geo.js';

export function findNearbyResources(userCoords, type) {
  if (!userCoords) return [];

  return resources
    .filter(r => r.type === type)
    .map(r => ({
      ...r,
      distance: getDistance(userCoords.lat, userCoords.lng, r.lat, r.lng)
    }))
    .sort((a, b) => a.distance - b.distance);
}
