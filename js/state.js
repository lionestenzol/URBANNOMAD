let logs = [];
let vehicleLogs = [];
let coords = null;
let darkMode = false;

function tryLocalStorage(action, key, value) {
    try {
        if (action === 'get') {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        }
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn('localStorage unavailable:', e.message);
        return null;
    }
}

export function loadSavedState() {
    logs = tryLocalStorage('get', 'urbanNomadLogs') || [];
    vehicleLogs = tryLocalStorage('get', 'urbanNomadVehicleLogs') || [];
    darkMode = tryLocalStorage('get', 'urbanNomadDarkMode') || false;

    if (darkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('theme-icon').textContent = '\u2600\uFE0F';
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
            },
            () => {
                coords = null;
            }
        );
    }
}

export function getLogs() {
    return logs;
}

export function getVehicleLogs() {
    return vehicleLogs;
}

export function getCoords() {
    return coords;
}

export function isDarkMode() {
    return darkMode;
}

export function addLog(entry) {
    logs.push(entry);
    tryLocalStorage('set', 'urbanNomadLogs', logs);
}

export function clearLogs() {
    logs = [];
    tryLocalStorage('set', 'urbanNomadLogs', logs);
}

export function addVehicleLog(entry) {
    vehicleLogs.push(entry);
    tryLocalStorage('set', 'urbanNomadVehicleLogs', vehicleLogs);
}

export function clearVehicleLogsState() {
    vehicleLogs = [];
    tryLocalStorage('set', 'urbanNomadVehicleLogs', vehicleLogs);
}

export function toggleDarkMode() {
    darkMode = !darkMode;
    tryLocalStorage('set', 'urbanNomadDarkMode', darkMode);

    if (darkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('theme-icon').textContent = '\u2600\uFE0F';
    } else {
        document.body.classList.remove('dark-mode');
        document.getElementById('theme-icon').textContent = '\uD83C\uDF19';
    }
}
