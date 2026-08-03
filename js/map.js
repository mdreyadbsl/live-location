// Leaflet Map Helper

export let map = null;
export let marker = null;
export let routeLine = null;

export function createMap(divId = "map") {

    if (map) {
        return map;
    }

    const normalLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution: "© OpenStreetMap"
        }
    );

    const satelliteLayer = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
        maxZoom: 20,
        attribution: "Tiles © Esri"
    }
);

// Road / Place Labels
const labelLayer = L.tileLayer(
    "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    {
        maxZoom: 20,
        attribution: "© Esri Labels"
    }
);

// Satellite + Labels
const satelliteWithLabels = L.layerGroup([
    satelliteLayer,
    labelLayer
]);

    map = L.map(divId, {
        center: [23.8103, 90.4125],
        zoom: 13,
        layers: [normalLayer]
    });

    L.control.layers({
    "🗺 Normal": normalLayer,
    "🛰 Satellite + Roads": satelliteWithLabels
}).addTo(map);

    return map;
}

export function updateMarker(lat, lng) {

    if (!map) return;

    if (marker) {

        marker.setLatLng([lat, lng]);

    } else {

        marker = L.marker([lat, lng]).addTo(map);

    }

    map.setView([lat, lng], 17);

}

export function drawRoute(points) {

    if (!map || !points || points.length === 0) return;

    if (routeLine) {

        routeLine.setLatLngs(points);

    } else {

        routeLine = L.polyline(points, {
            weight: 5,
            color: "#2563eb"
        }).addTo(map);

    }

}