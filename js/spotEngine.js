let spotReports = [];

const SPOT_TAGS = ["safe", "police", "unsafe", "restroom", "water", "power"];

function reportSpot({ name, tag, spotCoords }) {
  if (!SPOT_TAGS.includes(tag)) return false;

  spotReports.push({
    name,
    tag,
    coords: spotCoords,
    time: Date.now()
  });

  return true;
}

function getSpotReports(name) {
  return spotReports.filter(r => r.name === name);
}

function getSpotStatus(name) {
  const list = getSpotReports(name);
  const counts = {};

  list.forEach(r => {
    if (!counts[r.tag]) counts[r.tag] = 0;
    counts[r.tag]++;
  });

  return counts;
}
