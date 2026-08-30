// Leaflet Map Helper

export let map = null;
export let marker = null;

export let routeLine = null;
export let routeOutline = null;

export let startMarker = null;
export let endMarker = null;


// ========================================
// CREATE MAP
// ========================================

export function createMap(divId = "map") {

    // Normal Map
    const normalLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 22,
            attribution: "© OpenStreetMap"
        }
    );

    // Pure Satellite
    const satelliteLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
            maxZoom: 22,
            attribution: "&copy; Esri"
        }
    );

    map = L.map(divId, {

        center: [23.8103, 90.4125],

        zoom: 13,

        layers: [normalLayer],

        zoomControl: true

    });


    // ========================================
    // MAP LAYER SWITCH
    // ========================================

    L.control.layers(
        {
            "🗺 Normal": normalLayer,
            "🛰 Satellite": satelliteLayer
        }
    ).addTo(map);


    return map;
}


// ========================================
// UPDATE LIVE MARKER + SPEED
// ========================================

export function updateMarker(
    lat,
    lng,
    speed = 0
) {

    const speedText =
        Number(speed).toFixed(1) +
        " km/h";


    if (marker) {

        marker.setLatLng([
            lat,
            lng
        ]);

        marker.setTooltipContent(
            "🚗 " + speedText
        );

    } else {

        marker = L.marker([
            lat,
            lng
        ])
        .addTo(map)

        .bindTooltip(
            "🚗 " + speedText,
            {
                permanent: true,

                direction: "top",

                offset: [
                    0,
                    -35
                ],

                className:
                    "speed-tooltip"
            }
        );

    }


    map.setView(
        [lat, lng],
        17
    );
}


// ========================================
// DRAW BEAUTIFUL ROUTE
// ========================================

export function drawRoute(points) {

    if (
        !points ||
        points.length === 0
    ) {

        return;

    }


    // ====================================
    // ROUTE OUTLINE
    // ====================================

    if (routeOutline) {

        routeOutline.setLatLngs(
            points
        );

    } else {

        routeOutline =
            L.polyline(
                points,
                {

                    color: "#ffffff",

                    weight: 9,

                    opacity: 0.9,

                    lineCap: "round",

                    lineJoin: "round"

                }
            ).addTo(map);

    }


    // ====================================
    // MAIN ROUTE LINE
    // ====================================

    if (routeLine) {

        routeLine.setLatLngs(
            points
        );

    } else {

        routeLine =
            L.polyline(
                points,
                {

                    color: "#2563eb",

                    weight: 5,

                    opacity: 0.95,

                    lineCap: "round",

                    lineJoin: "round"

                }
            ).addTo(map);

    }

}


// ========================================
// START & END MARKERS
// ========================================

export function showStartEndMarkers(
    points
) {

    if (
        !points ||
        points.length === 0
    ) {

        return;

    }


    // Remove old Start Marker
    if (startMarker) {

        map.removeLayer(
            startMarker
        );

    }


    // Remove old End Marker
    if (endMarker) {

        map.removeLayer(
            endMarker
        );

    }


    // ====================================
    // START
    // ====================================

    startMarker =
        L.marker(
            points[0]
        )
        .addTo(map)

        .bindPopup(
            "🟢 Trip Start"
        );


    // ====================================
    // END
    // ====================================

    endMarker =
        L.marker(
            points[
                points.length - 1
            ]
        )
        .addTo(map)

        .bindPopup(
            "🔴 Trip End"
        );

}