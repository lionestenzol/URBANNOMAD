let logs = [];
let vehicleLogs = [];
let coords = null;
let darkMode = false;
let userResources = [];
let survivalSplit = 0.7;

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
    userResources = tryLocalStorage('get', 'urbanNomadUserResources') || [];
    survivalSplit = tryLocalStorage('get', 'urbanNomadSurvivalSplit') || 0.7;

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

export function getUserResources() {
    return userResources;
}

export function addUserResource(resource) {
    resource.id = 'user_' + Date.now();
    userResources.push(resource);
    tryLocalStorage('set', 'urbanNomadUserResources', userResources);
}

export function removeUserResource(id) {
    userResources = userResources.filter(r => r.id !== id);
    tryLocalStorage('set', 'urbanNomadUserResources', userResources);
}

export function getSurvivalSplit() {
    return survivalSplit;
}

export function setSurvivalSplit(val) {
    survivalSplit = val;
    tryLocalStorage('set', 'urbanNomadSurvivalSplit', val);
}

export function exportAllData() {
    return {
        version: 1,
        exportDate: new Date().toISOString(),
        logs: tryLocalStorage('get', 'urbanNomadLogs') || [],
        vehicleLogs: tryLocalStorage('get', 'urbanNomadVehicleLogs') || [],
        spotReports: tryLocalStorage('get', 'urbanNomadSpotReports') || [],
        userResources: tryLocalStorage('get', 'urbanNomadUserResources') || [],
        darkMode: tryLocalStorage('get', 'urbanNomadDarkMode') || false,
        survivalSplit: tryLocalStorage('get', 'urbanNomadSurvivalSplit') || 0.7
    };
}

export function importAllData(data) {
    if (!data || typeof data !== 'object' || !data.version) {
        return { success: false, error: 'Invalid backup file format' };
    }
    try {
        if (data.logs) tryLocalStorage('set', 'urbanNomadLogs', data.logs);
        if (data.vehicleLogs) tryLocalStorage('set', 'urbanNomadVehicleLogs', data.vehicleLogs);
        if (data.spotReports) tryLocalStorage('set', 'urbanNomadSpotReports', data.spotReports);
        if (data.userResources) tryLocalStorage('set', 'urbanNomadUserResources', data.userResources);
        if (data.darkMode !== undefined) tryLocalStorage('set', 'urbanNomadDarkMode', data.darkMode);
        if (data.survivalSplit !== undefined) tryLocalStorage('set', 'urbanNomadSurvivalSplit', data.survivalSplit);
        return { success: true };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

export function refreshCoords() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                resolve(coords);
            },
            (err) => {
                reject(err);
            }
        );
    });
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
