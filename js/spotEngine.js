const STORAGE_KEY = 'urbanNomadSpotReports';

let spotReports = loadSpotReports();

const SPOT_TAGS = ["safe", "police", "unsafe", "restroom", "water", "power"];

function loadSpotReports() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveSpotReports() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(spotReports));
  } catch (e) {
    console.warn('localStorage unavailable:', e.message);
  }
}

export function reportSpot({ name, tag, spotCoords }) {
  if (!SPOT_TAGS.includes(tag)) return false;

  spotReports.push({
    name,
    tag,
    coords: spotCoords,
    time: Date.now()
  });

  saveSpotReports();
  return true;
}

export function getSpotReports(name) {
  return spotReports.filter(r => r.name === name);
}

export function getSpotStatus(name) {
  const list = getSpotReports(name);
  const counts = {};

  list.forEach(r => {
    if (!counts[r.tag]) counts[r.tag] = 0;
    counts[r.tag]++;
  });

  return counts;
}
