import { escapeHTML } from './helpers.js';
import { getLogs, getVehicleLogs, getCoords, getUserResources } from './state.js';
import { zones } from './zones.js';

const gear = [
    { name: "Blackout Curtains", desc: "Essential stealth sleeping setup", icon: "\uD83D\uDD32" },
    { name: "Power Inverter", desc: "Charge devices from your car", icon: "\u26A1" },
    { name: "Portable Toilet", desc: "Emergency hygiene solution", icon: "\uD83D\uDEBD" },
    { name: "Packable Bag", desc: "Compact gear carry for rotation", icon: "\uD83D\uDC5C" },
    { name: "Window Cover", desc: "Privacy and insulation", icon: "\uD83E\uDE9F" },
    { name: "USB Fan", desc: "Cooling without engine running", icon: "\uD83D\uDCA8" }
];

export function updateZoneLogsUI() {
    const container = document.getElementById('zones-log');
    const count = document.getElementById('zones-count');
    const card = document.getElementById('zone-logs-card');
    const logs = getLogs();
    const coords = getCoords();

    count.textContent = logs.length;

    if (logs.length > 0) {
        card.classList.remove('hidden');
    } else {
        card.classList.add('hidden');
    }

    container.innerHTML = '';

    logs.forEach((log) => {
        const item = document.createElement('div');
        item.className = 'log-item';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'item-title';
        titleDiv.textContent = log.location;
        item.appendChild(titleDiv);

        const timeDiv = document.createElement('div');
        timeDiv.className = 'item-subtitle';
        timeDiv.textContent = log.time;
        item.appendChild(timeDiv);

        if (coords && log.coords) {
            const metaDiv = document.createElement('div');
            metaDiv.className = 'item-meta';
            metaDiv.textContent = `\uD83D\uDCCD Lat: ${log.coords.lat.toFixed(4)}, Lng: ${log.coords.lng.toFixed(4)}`;
            item.appendChild(metaDiv);
        }

        container.appendChild(item);
    });
}

export function updateVehicleLogsUI() {
    const container = document.getElementById('vehicle-log');
    const card = document.getElementById('vehicle-logs-card');
    const vehicleLogs = getVehicleLogs();

    if (vehicleLogs.length > 0) {
        card.classList.remove('hidden');
    } else {
        card.classList.add('hidden');
    }

    container.innerHTML = '';

    vehicleLogs.forEach((log) => {
        const item = document.createElement('div');
        item.className = 'log-item';

        const isMpgGood = log.mpg !== 'N/A' && log.mpg !== 'First entry' && Number(log.mpg) > 25;
        const mpgClass = isMpgGood ? 'text-green' : 'text-amber';
        const mpgText = (log.mpg !== 'N/A' && log.mpg !== 'First entry') ? `${log.mpg} MPG` : log.mpg;

        const titleDiv = document.createElement('div');
        titleDiv.className = 'item-title';
        titleDiv.textContent = `${log.mileage.toLocaleString()} miles`;
        item.appendChild(titleDiv);

        const subtitleDiv = document.createElement('div');
        subtitleDiv.className = 'item-subtitle';
        subtitleDiv.textContent = `${log.fuel} gallons`;
        item.appendChild(subtitleDiv);

        const metaDiv = document.createElement('div');
        metaDiv.className = 'flex-between text-sm mt-1';

        const timeSpan = document.createElement('span');
        timeSpan.className = 'item-subtitle';
        timeSpan.textContent = log.time;
        metaDiv.appendChild(timeSpan);

        const mpgSpan = document.createElement('span');
        mpgSpan.className = mpgClass;
        mpgSpan.textContent = mpgText;
        metaDiv.appendChild(mpgSpan);

        item.appendChild(metaDiv);
        container.appendChild(item);
    });
}

export function initZonesList() {
    const container = document.getElementById('zones-list');

    zones.forEach((zone) => {
        const item = document.createElement('div');
        item.className = 'zone-item';
        item.addEventListener('click', () => {
            document.getElementById('location-input').value = zone.name;
        });

        let stars = '';
        for (let i = 0; i < zone.stealth; i++) stars += '\u2605';
        for (let i = zone.stealth; i < 5; i++) stars += '\u2606';

        const iconDiv = document.createElement('div');
        iconDiv.className = 'text-lg mb-1';
        iconDiv.textContent = zone.icon;
        item.appendChild(iconDiv);

        const nameDiv = document.createElement('div');
        nameDiv.className = 'item-title';
        nameDiv.textContent = zone.name;
        item.appendChild(nameDiv);

        const funcDiv = document.createElement('div');
        funcDiv.className = 'text-sm';
        funcDiv.textContent = zone.function;
        item.appendChild(funcDiv);

        const ratingDiv = document.createElement('div');
        ratingDiv.className = 'rating mt-1';
        ratingDiv.textContent = stars;
        item.appendChild(ratingDiv);

        container.appendChild(item);
    });
}

export function initGearList() {
    const container = document.getElementById('gear-list');

    gear.forEach((gearItem) => {
        const element = document.createElement('div');
        element.className = 'gear-item';

        const iconDiv = document.createElement('div');
        iconDiv.className = 'gear-icon';
        iconDiv.textContent = gearItem.icon;
        element.appendChild(iconDiv);

        const infoDiv = document.createElement('div');

        const nameDiv = document.createElement('div');
        nameDiv.className = 'item-title';
        nameDiv.textContent = gearItem.name;
        infoDiv.appendChild(nameDiv);

        const descDiv = document.createElement('div');
        descDiv.className = 'item-subtitle';
        descDiv.textContent = gearItem.desc;
        infoDiv.appendChild(descDiv);

        element.appendChild(infoDiv);
        container.appendChild(element);
    });
}

export function renderResourceResults(results) {
    const container = document.getElementById('resource-results');
    container.innerHTML = '';

    if (results.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'log-item';
        const emptyTitle = document.createElement('div');
        emptyTitle.className = 'item-title';
        emptyTitle.textContent = 'No results found';
        empty.appendChild(emptyTitle);
        const emptySub = document.createElement('div');
        emptySub.className = 'item-subtitle';
        emptySub.textContent = 'No resources within 50km. Try a different category.';
        empty.appendChild(emptySub);
        container.appendChild(empty);
        return;
    }

    results.forEach((r) => {
        const el = document.createElement('div');
        el.className = 'log-item';

        const nameDiv = document.createElement('div');
        nameDiv.className = 'item-title';
        nameDiv.textContent = r.name;
        el.appendChild(nameDiv);

        const distDiv = document.createElement('div');
        distDiv.className = 'item-subtitle';
        distDiv.textContent = `${r.distance.toFixed(2)} km away`;
        el.appendChild(distDiv);

        const metaDiv = document.createElement('div');
        metaDiv.className = 'item-meta';
        metaDiv.textContent = `${r.cost}${r.open ? ' \u00B7 ' + r.open : ''}`;
        el.appendChild(metaDiv);

        container.appendChild(el);
    });
}

export function renderSurvivalResult(result, food, gas) {
    const container = document.getElementById('survival-result');
    container.innerHTML = '';

    const allocItem = document.createElement('div');
    allocItem.className = 'log-item';
    const allocTitle = document.createElement('div');
    allocTitle.className = 'item-title';
    allocTitle.textContent = 'Budget Allocation';
    allocItem.appendChild(allocTitle);
    const allocSub = document.createElement('div');
    allocSub.className = 'item-subtitle';
    const foodPct = Math.round((result.foodRatio || 0.7) * 100);
    allocSub.textContent = `$${result.foodBudget.toFixed(2)} food (${foodPct}%) / $${result.fuelBudget.toFixed(2)} fuel (${100 - foodPct}%)`;
    allocItem.appendChild(allocSub);
    container.appendChild(allocItem);

    const foodItem = document.createElement('div');
    foodItem.className = 'log-item';
    const foodTitle = document.createElement('div');
    foodTitle.className = 'item-title';
    foodTitle.textContent = 'Food Budget';
    foodItem.appendChild(foodTitle);
    const foodSub = document.createElement('div');
    foodSub.className = 'item-subtitle';
    foodSub.textContent = `${result.foodDays} days of food at $${food}/day`;
    foodItem.appendChild(foodSub);
    container.appendChild(foodItem);

    const fuelItem = document.createElement('div');
    fuelItem.className = 'log-item';
    const fuelTitle = document.createElement('div');
    fuelTitle.className = 'item-title';
    fuelTitle.textContent = 'Fuel Range';
    fuelItem.appendChild(fuelTitle);
    const fuelSub = document.createElement('div');
    fuelSub.className = 'item-subtitle';
    fuelSub.textContent = `${result.range.toFixed(0)} miles (${result.gallons.toFixed(1)} gallons at $${gas}/gal)`;
    fuelItem.appendChild(fuelSub);
    container.appendChild(fuelItem);

    const recItem = document.createElement('div');
    recItem.className = 'log-item';
    const recTitle = document.createElement('div');
    recTitle.className = 'item-title';
    recTitle.textContent = 'Recommendation';
    recItem.appendChild(recTitle);
    const foodWarning = result.foodDays < 7 ? '\u26A0\uFE0F Low on food budget \u2014 seek free meal resources' : '\u2705 Food budget looks stable';
    const rangeWarning = result.range < 100 ? '\u26A0\uFE0F Limited range \u2014 minimize driving' : '\u2705 Decent travel range';
    const foodRec = document.createElement('div');
    foodRec.className = 'item-subtitle';
    foodRec.textContent = foodWarning;
    recItem.appendChild(foodRec);
    const rangeRec = document.createElement('div');
    rangeRec.className = 'item-subtitle';
    rangeRec.textContent = rangeWarning;
    recItem.appendChild(rangeRec);
    container.appendChild(recItem);
}

export function renderSpotStatus(name, status) {
    const container = document.getElementById('spot-status');

    const tagIcons = {
        safe: '\u2705', police: '\uD83D\uDE94', unsafe: '\u26A0\uFE0F',
        restroom: '\uD83D\uDEBB', water: '\uD83D\uDCA7', power: '\uD83D\uDD0C'
    };

    const item = document.createElement('div');
    item.className = 'log-item';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'item-title';
    titleDiv.textContent = name;
    item.appendChild(titleDiv);

    for (const [tag, count] of Object.entries(status)) {
        const span = document.createElement('span');
        span.className = 'item-subtitle mr-1';
        span.textContent = `${tagIcons[tag] || ''} ${tag}: ${count} `;
        item.appendChild(span);
    }

    container.innerHTML = '';
    container.appendChild(item);
}

export function renderUserResources() {
    const container = document.getElementById('user-resources-list');
    const card = document.getElementById('user-resources-card');
    const resources = getUserResources();

    if (resources.length === 0) {
        card.classList.add('hidden');
        return;
    }
    card.classList.remove('hidden');
    container.innerHTML = '';

    resources.forEach(r => {
        const item = document.createElement('div');
        item.className = 'log-item flex-between';

        const info = document.createElement('div');
        const nameDiv = document.createElement('div');
        nameDiv.className = 'item-title';
        nameDiv.textContent = r.name;
        info.appendChild(nameDiv);

        const metaDiv = document.createElement('div');
        metaDiv.className = 'item-subtitle';
        metaDiv.textContent = `${r.type} · ${r.cost || 'N/A'} · ${r.open || 'N/A'}`;
        info.appendChild(metaDiv);
        item.appendChild(info);

        const delBtn = document.createElement('button');
        delBtn.className = 'destructive small';
        delBtn.textContent = 'Delete';
        delBtn.setAttribute('data-delete-resource', r.id);
        item.appendChild(delBtn);

        container.appendChild(item);
    });
}

export function showValidationError(elementId, message) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'log-item';
    const sub = document.createElement('div');
    sub.className = 'item-subtitle';
    sub.textContent = message;
    div.appendChild(sub);
    container.appendChild(div);
}
