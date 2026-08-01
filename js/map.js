
// Leaflet Map Helper

export let map = null;
export let marker = null;
export let routeLine = null;

export function createMap(divId = "map") {

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
            maxZoom: 19,
            attribution: "Tiles © Esri"
        }
    );

    map = L.map(divId, {
        center: [23.8103, 90.4125],
        zoom: 13,
        layers: [normalLayer]
    });

    L.control.layers({
        "🗺 Normal": normalLayer,
        "🛰 Satellite": satelliteLayer
    }).addTo(map);

    return map;
}

export function updateMarker(lat, lng) {

    if (marker) {

        marker.setLatLng([lat, lng]);

    } else {

        marker = L.marker([lat, lng]).addTo(map);

    }

    map.setView([lat, lng], 17);
}

export function drawRoute(points) {

    if (!points || points.length === 0) return;

    if (routeLine) {

        routeLine.setLatLngs(points);

    } else {

        routeLine = L.polyline(points, {
            weight: 5
        }).addTo(map);

    }

}
