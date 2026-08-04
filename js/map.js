// Leaflet Map Helper

export let map = null;
export let marker = null;
export let routeLine = null;
export let startMarker = null;
export let endMarker = null;

export function createMap(divId = "map") {

    // Normal Map
    const normalLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 22,
            attribution: "© OpenStreetMap"
        }
    );

    // Satellite + Road Names
    const satelliteLayer = L.tileLayer(
        "https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=FNOXfPmFuTaJ024ghSqw",
        {
            tileSize: 512,
            zoomOffset: -1,
            maxZoom: 22,
            attribution: "&copy; MapTiler &copy; OpenStreetMap"
        }
    );

    map = L.map(divId, {
        center: [23.8103, 90.4125],
        zoom: 13,
        layers: [normalLayer]
    });

    L.control.layers({
        "🗺 Normal": normalLayer,
        "🛰 Satellite + Roads": satelliteLayer
    }).addTo(map);

    return map;
}

// ==============================
// Live Marker
// ==============================

export function updateMarker(lat, lng) {

    if (marker) {

        marker.setLatLng([lat, lng]);

    } else {

        marker = L.marker([lat, lng]).addTo(map);

    }

    map.setView([lat, lng], 17);

}

// ==============================
// Draw Route
// ==============================

export function drawRoute(points) {

    if (!points || points.length === 0) return;

    if (routeLine) {

        routeLine.setLatLngs(points);

    } else {

        routeLine = L.polyline(points, {
            color: "#2563eb",
            weight: 5,
            opacity: 0.8
        }).addTo(map);

    }

}

// ==============================
// Start / End Marker
// ==============================

export function showStartEndMarkers(points) {

    if (!points || points.length === 0) return;

    if (startMarker) {
        map.removeLayer(startMarker);
    }

    if (endMarker) {
        map.removeLayer(endMarker);
    }

    startMarker = L.marker(points[0])
        .addTo(map)
        .bindPopup("🟢 Trip Start");

    endMarker = L.marker(points[points.length - 1])
        .addTo(map)
        .bindPopup("🔴 Trip End");

}