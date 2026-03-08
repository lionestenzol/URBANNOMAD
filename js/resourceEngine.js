import { resources } from './resources.js';
import { getDistance } from './geo.js';
import { getUserResources } from './state.js';

const MAX_RADIUS_KM = 50;

export function findNearbyResources(userCoords, type) {
  if (!userCoords) return [];

  const allResources = [...resources, ...getUserResources()];
  return allResources
    .filter(r => r.type === type)
    .map(r => ({
      ...r,
      distance: getDistance(userCoords.lat, userCoords.lng, r.lat, r.lng)
    }))
    .filter(r => r.distance <= MAX_RADIUS_KM)
    .sort((a, b) => a.distance - b.distance);
}
