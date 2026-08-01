
// ================================
// Utility Functions
// Live Location Tracker V2
// ================================

// Format Time
export function formatTime(timestamp) {

    const date = new Date(timestamp);

    return date.toLocaleTimeString();
}

// Format Date
export function formatDate(timestamp) {

    const date = new Date(timestamp);

    return date.toLocaleDateString();
}

// GPS Accuracy
export function formatAccuracy(value) {

    return Math.round(value) + " m";
}

// Speed (meter/sec → km/h)
export function formatSpeed(speed) {

    if (speed == null) return "0 km/h";

    return (speed * 3.6).toFixed(1) + " km/h";
}

// Distance (meter → km)
export function formatDistance(meter) {

    return (meter / 1000).toFixed(2) + " km";
}

// Internet Status
export function isOnline() {

    return navigator.onLine;
}

// Status Text
export function getConnectionStatus() {

    return navigator.onLine ? "🟢 ONLINE" : "🔴 OFFLINE";
}

// Calculate Distance (Haversine Formula)
export function calculateDistance(lat1, lon1, lat2, lon2) {

    const R = 6371000;

    const dLat = (lat2 - lat1) * Math.PI / 180;

    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +

        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *

        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

// Battery Level
export async function getBatteryLevel() {

    if (!navigator.getBattery) {

        return "Unknown";
    }

    const battery = await navigator.getBattery();

    return Math.round(battery.level * 100) + "%";
}
