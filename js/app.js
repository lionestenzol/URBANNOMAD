import { loadSavedState, toggleDarkMode, getCoords, clearLogs, clearVehicleLogsState } from './state.js';
import { logVisit } from './zones.js';
import { logVehicle } from './vehicle.js';
import { updateZoneLogsUI, updateVehicleLogsUI, initZonesList, initGearList, renderResourceResults, renderSurvivalResult, renderSpotStatus, showValidationError } from './ui.js';
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
    });
    document.getElementById(`${tabId}-tab`).classList.add('active');
    document.querySelector(`.tab-trigger[data-tab="${tabId}"]`).classList.add('active');
}

// Resource finder
function loadResources(type) {
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
        mpg: mpgVal
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
        if (logVehicle(mileageInput.value.trim(), fuelInput.value.trim())) {
            updateVehicleLogsUI();
            mileageInput.value = '';
            fuelInput.value = '';
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

    // Survival calculator
    document.getElementById('calc-survival-btn').addEventListener('click', runSurvival);

    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Service worker registration failed — app still works without it
        });
    }
});
