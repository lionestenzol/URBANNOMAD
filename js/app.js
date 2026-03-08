import { loadSavedState, toggleDarkMode, getCoords, clearLogs, clearVehicleLogsState, refreshCoords, addUserResource, removeUserResource, getSurvivalSplit, setSurvivalSplit, getVehicleLogs, exportAllData, importAllData } from './state.js';
import { logVisit } from './zones.js';
import { logVehicle } from './vehicle.js';
import { updateZoneLogsUI, updateVehicleLogsUI, initZonesList, initGearList, renderResourceResults, renderSurvivalResult, renderSpotStatus, showValidationError, renderUserResources } from './ui.js';
import { findNearbyResources } from './resourceEngine.js';
import { calculateSurvival } from './survivalEngine.js';
import { reportSpot, getSpotStatus } from './spotEngine.js';

// Tab switching
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-trigger').forEach(trigger => {
        trigger.classList.remove('active');
        trigger.setAttribute('aria-selected', 'false');
    });
    document.getElementById(`${tabId}-tab`).classList.add('active');
    const activeTab = document.querySelector(`.tab-trigger[data-tab="${tabId}"]`);
    activeTab.classList.add('active');
    activeTab.setAttribute('aria-selected', 'true');
}

// Resource finder
async function loadResources(type) {
    try {
        await refreshCoords();
    } catch {
        // proceed with existing coords
    }
    const coords = getCoords();
    if (!coords) {
        showValidationError('resource-results', 'Location unavailable. Enable location access to find nearby resources.');
        return;
    }
    const results = findNearbyResources(coords, type);
    renderResourceResults(results);
}

// Survival calculator
function runSurvival() {
    const money = Number(document.getElementById('money').value);
    const food = Number(document.getElementById('food').value);
    const gas = Number(document.getElementById('gas').value);
    const mpgVal = Number(document.getElementById('mpg-input').value);

    if (!money || !food || !gas || !mpgVal) {
        showValidationError('survival-result', 'Please fill in all fields');
        return;
    }

    if (money <= 0 || food <= 0 || gas <= 0 || mpgVal <= 0) {
        showValidationError('survival-result', 'All values must be positive numbers');
        return;
    }

    const result = calculateSurvival({
        money,
        dailyFood: food,
        gasPrice: gas,
        mpg: mpgVal,
        foodRatio: getSurvivalSplit()
    });

    renderSurvivalResult(result, food, gas);
}

// Spot reporting
function submitSpotReport(tag) {
    const nameInput = document.getElementById('spot-name-input');
    const name = nameInput.value.trim();

    if (!name) return;

    const coords = getCoords();
    reportSpot({
        name,
        tag,
        spotCoords: coords || { lat: 0, lng: 0 }
    });

    const status = getSpotStatus(name);
    renderSpotStatus(name, status);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSavedState();
    initZonesList();
    initGearList();
    updateZoneLogsUI();
    updateVehicleLogsUI();
    renderUserResources();

    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleDarkMode);

    // Tab switching
    document.querySelectorAll('.tab-trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
            switchTab(trigger.getAttribute('data-tab'));
        });
    });

    // Zone logging
    document.getElementById('log-zone-btn').addEventListener('click', () => {
        const input = document.getElementById('location-input');
        const location = input.value.trim();
        if (logVisit(location)) {
            updateZoneLogsUI();
            input.value = '';
        }
    });

    // Vehicle logging
    document.getElementById('log-vehicle-btn').addEventListener('click', () => {
        const mileageInput = document.getElementById('mileage-input');
        const fuelInput = document.getElementById('fuel-input');
        const errorDiv = document.getElementById('vehicle-error');
        errorDiv.innerHTML = '';
        const result = logVehicle(mileageInput.value.trim(), fuelInput.value.trim());
        if (result.success) {
            updateVehicleLogsUI();
            mileageInput.value = '';
            fuelInput.value = '';
        } else if (result.error === 'odometer') {
            showValidationError('vehicle-error', 'Mileage must be higher than the last entry.');
        }
    });

    // Clear buttons
    document.getElementById('clear-zones-btn').addEventListener('click', () => {
        clearLogs();
        updateZoneLogsUI();
    });

    document.getElementById('clear-vehicle-btn').addEventListener('click', () => {
        clearVehicleLogsState();
        updateVehicleLogsUI();
    });

    // User resources
    document.getElementById('use-my-location-btn').addEventListener('click', () => {
        const c = getCoords();
        if (c) {
            document.getElementById('user-resource-lat').value = c.lat.toFixed(4);
            document.getElementById('user-resource-lng').value = c.lng.toFixed(4);
        }
    });

    document.getElementById('add-resource-btn').addEventListener('click', () => {
        const name = document.getElementById('user-resource-name').value.trim();
        const type = document.getElementById('user-resource-type').value;
        const lat = parseFloat(document.getElementById('user-resource-lat').value);
        const lng = parseFloat(document.getElementById('user-resource-lng').value);
        const cost = document.getElementById('user-resource-cost').value.trim() || 'Unknown';
        const open = document.getElementById('user-resource-hours').value.trim() || '';

        if (!name || isNaN(lat) || isNaN(lng)) return;

        addUserResource({ name, type, lat, lng, cost, open });
        renderUserResources();
        document.getElementById('user-resource-name').value = '';
        document.getElementById('user-resource-lat').value = '';
        document.getElementById('user-resource-lng').value = '';
        document.getElementById('user-resource-cost').value = '';
        document.getElementById('user-resource-hours').value = '';
    });

    document.getElementById('user-resources-list').addEventListener('click', (e) => {
        if (e.target.hasAttribute('data-delete-resource')) {
            removeUserResource(e.target.getAttribute('data-delete-resource'));
            renderUserResources();
        }
    });

    // GPS refresh
    document.getElementById('refresh-location-btn').addEventListener('click', async () => {
        const btn = document.getElementById('refresh-location-btn');
        btn.textContent = 'Locating...';
        btn.disabled = true;
        try {
            await refreshCoords();
            btn.textContent = 'Location Updated';
        } catch {
            btn.textContent = 'Location Failed';
        }
        setTimeout(() => {
            btn.textContent = 'Refresh Location';
            btn.disabled = false;
        }, 2000);
    });

    // Resource buttons
    document.querySelectorAll('[data-resource]').forEach(btn => {
        btn.addEventListener('click', () => {
            loadResources(btn.getAttribute('data-resource'));
        });
    });

    // Spot report buttons
    document.querySelectorAll('[data-spot-tag]').forEach(btn => {
        btn.addEventListener('click', () => {
            submitSpotReport(btn.getAttribute('data-spot-tag'));
        });
    });

    // Survival split slider
    const splitSlider = document.getElementById('survival-split');
    splitSlider.value = getSurvivalSplit() * 100;
    function updateSplitLabel(pct) {
        document.getElementById('split-label').textContent = `Food: ${pct}% / Fuel: ${100 - pct}%`;
    }
    updateSplitLabel(Math.round(getSurvivalSplit() * 100));
    splitSlider.addEventListener('input', (e) => {
        const pct = parseInt(e.target.value);
        setSurvivalSplit(pct / 100);
        updateSplitLabel(pct);
    });

    // Auto-fill MPG from vehicle logs
    const vLogs = getVehicleLogs();
    if (vLogs.length > 1) {
        const lastMpg = vLogs[vLogs.length - 1].mpg;
        if (lastMpg !== 'N/A' && lastMpg !== 'First entry') {
            document.getElementById('mpg-input').value = lastMpg;
        }
    }

    // Survival calculator
    document.getElementById('calc-survival-btn').addEventListener('click', runSurvival);

    // Export data
    document.getElementById('export-btn').addEventListener('click', () => {
        const data = exportAllData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const date = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `urban-nomad-backup-${date}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // Import data
    document.getElementById('import-btn').addEventListener('click', () => {
        const fileInput = document.getElementById('import-file');
        const statusEl = document.getElementById('import-status');

        if (!fileInput.files.length) {
            showValidationError('import-status', 'Please select a file first.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!confirm('This will replace all current data. Continue?')) return;
                const result = importAllData(data);
                if (result.success) {
                    statusEl.textContent = 'Import successful. Reloading...';
                    setTimeout(() => location.reload(), 1000);
                } else {
                    showValidationError('import-status', result.error);
                }
            } catch {
                showValidationError('import-status', 'Invalid JSON file.');
            }
        };
        reader.readAsText(fileInput.files[0]);
    });

    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Service worker registration failed — app still works without it
        });
    }
});
