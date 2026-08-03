// Leaflet Map Helper

export let map = null;
export let marker = null;
export let routeLine = null;

export function createMap(divId = "map") {

    // Normal Map
    const normalLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 22,
            attribution: "© OpenStreetMap"
        }
    );

    // MapTiler Satellite Hybrid (Satellite + Road Names)
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
            color: "#2563eb",
            weight: 5,
            opacity: 0.8
        }).addTo(map);

    }

}