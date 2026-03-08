import { addLog, getCoords } from './state.js';

export const zones = [
    { name: "Gym", function: "Shower, workout, rest", stealth: 5, icon: "\uD83C\uDFCB\uFE0F" },
    { name: "Storage Unit", function: "Offload gear, rotate items", stealth: 5, icon: "\uD83D\uDCE6" },
    { name: "Paid Parking", function: "Safe overnight rest", stealth: 5, icon: "\uD83C\uDD7F\uFE0F" },
    { name: "Library", function: "Wi-Fi, naps, study", stealth: 4, icon: "\uD83D\uDCDA" },
    { name: "Park", function: "Outdoor rest and recovery", stealth: 3, icon: "\uD83C\uDF33" },
    { name: "Fast Food", function: "Cheap food, Wi-Fi, power nap", stealth: 3, icon: "\uD83C\uDF54" },
    { name: "Mall", function: "Restrooms, lounges, Wi-Fi", stealth: 4, icon: "\uD83D\uDECD\uFE0F" },
    { name: "Overpass", function: "Stealth nap zone", stealth: 2, icon: "\uD83C\uDF09" },
    { name: "Back Road", function: "Quick rest zone", stealth: 3, icon: "\uD83D\uDEE3\uFE0F" }
];

export function logVisit(locationName) {
    if (!locationName) return false;

    const coords = getCoords();
    addLog({
        location: locationName,
        time: new Date().toLocaleString(),
        coords: coords || { lat: 0, lng: 0 }
    });

    return true;
}
