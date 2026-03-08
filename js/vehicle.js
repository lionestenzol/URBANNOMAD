import { addVehicleLog, getVehicleLogs } from './state.js';

export function calculateMPG(currentMileage, fuelAdded, lastMileage) {
    const milesDriven = currentMileage - lastMileage;
    if (milesDriven <= 0 || fuelAdded <= 0) return 'N/A';
    return (milesDriven / fuelAdded).toFixed(2);
}

export function logVehicle(mileage, fuel) {
    if (!mileage || !fuel) return false;

    const vehicleLogs = getVehicleLogs();
    const newLog = {
        mileage: Number(mileage),
        fuel: Number(fuel),
        time: new Date().toLocaleString(),
        mpg: vehicleLogs.length > 0
            ? calculateMPG(Number(mileage), Number(fuel), vehicleLogs[vehicleLogs.length - 1].mileage)
            : 'First entry'
    };

    addVehicleLog(newLog);
    return true;
}
