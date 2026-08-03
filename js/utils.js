// ================================
// Utility Functions
// Live Location Tracker V2.0
// ================================

// Format Time
export function formatTime(timestamp) {
    if (!timestamp) return "---";
    return new Date(timestamp).toLocaleTimeString();
}

// Format Date
export function formatDate(timestamp) {
    if (!timestamp) return "---";
    return new Date(timestamp).toLocaleDateString();
}

// GPS Accuracy
export function formatAccuracy(value) {
    if (value == null) return "---";
    return Math.round(value) + " m";
}

// Speed (m/s → km/h)
export function formatSpeed(speed) {
    if (speed == null) return "0.0 km/h";
    return (speed * 3.6).toFixed(1) + " km/h";
}

// Distance (meter → km)
export function formatDistance(meter) {
    if (!meter) return "0.00 km";
    return (meter / 1000).toFixed(2) + " km";
}

// Internet Status
export function isOnline() {
    return navigator.onLine;
}

export function getConnectionStatus() {
    return navigator.onLine ? "🟢 ONLINE" : "🔴 OFFLINE";
}

// Haversine Distance
export function calculateDistance(lat1, lon1, lat2, lon2) {

    const R = 6371000;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// Battery Level
export async function getBatteryLevel() {

    if (!("getBattery" in navigator)) {
        return "Unsupported";
    }

    try {

        const battery = await navigator.getBattery();

        return Math.round(battery.level * 100) + "%";

    } catch {

        return "Unknown";

    }

}