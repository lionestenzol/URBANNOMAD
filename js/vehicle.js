import { addVehicleLog, getVehicleLogs } from './state.js';

export function calculateMPG(currentMileage, fuelAdded, lastMileage) {
    const milesDriven = currentMileage - lastMileage;
    if (milesDriven <= 0 || fuelAdded <= 0) return 'N/A';
    return (milesDriven / fuelAdded).toFixed(2);
}

export function logVehicle(mileage, fuel) {
    const m = Number(mileage);
    const f = Number(fuel);
    if (!mileage || !fuel || isNaN(m) || isNaN(f) || m <= 0 || f <= 0) {
        return { success: false, error: 'invalid' };
    }

    const vehicleLogs = getVehicleLogs();
    if (vehicleLogs.length > 0 && m <= vehicleLogs[vehicleLogs.length - 1].mileage) {
        return { success: false, error: 'odometer' };
    }

    const newLog = {
        mileage: m,
        fuel: f,
        time: new Date().toLocaleString(),
        mpg: vehicleLogs.length > 0
            ? calculateMPG(m, f, vehicleLogs[vehicleLogs.length - 1].mileage)
            : 'First entry'
    };

    addVehicleLog(newLog);
    return { success: true };
}
