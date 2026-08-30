// ========================================
// LEAFLET MAP HELPER V5
// ========================================

export let map = null;
export let marker = null;

export let routeLine = null;
export let routeOutline = null;

export let startMarker = null;
export let endMarker = null;


// ========================================
// MAP STATE
// ========================================

let userInteracted = false;


// ========================================
// CREATE MAP
// ========================================

export function createMap(divId = "map") {

    // ====================================
    // NORMAL MAP
    // ====================================

    const normalLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution:
                "© OpenStreetMap contributors"
        }
    );


    // ====================================
    // PURE SATELLITE
    // ====================================

    const satelliteLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
            maxZoom: 19,
            attribution:
                "© Esri"
        }
    );


    // ====================================
    // CREATE MAP
    // ====================================

    map = L.map(divId, {

        center: [
            23.8103,
            90.4125
        ],

        zoom: 13,

        zoomControl: true,

        layers: [
            normalLayer
        ],

        zoomAnimation: true,

        fadeAnimation: true,

        markerZoomAnimation: true,

        touchZoom: true,

        scrollWheelZoom: true,

        doubleClickZoom: true,

        dragging: true

    });


    // ====================================
    // LAYER SWITCH
    // ====================================

    L.control.layers(
        {
            "🗺 Normal": normalLayer,
            "🛰 Satellite": satelliteLayer
        },
        null,
        {
            collapsed: true
        }
    ).addTo(map);


    // ====================================
    // USER MAP INTERACTION
    // ====================================

    map.on(
        "dragstart",
        () => {

            userInteracted = true;

        }
    );


    map.on(
        "zoomstart",
        () => {

            userInteracted = true;

        }
    );


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

    if (!map) {
        return;
    }


    lat = Number(lat);
    lng = Number(lng);
    speed = Number(speed) || 0;


    const speedText =
        speed.toFixed(1) +
        " km/h";


    // ====================================
    // CREATE MARKER
    // ====================================

    if (!marker) {

        marker = L.marker(
            [
                lat,
                lng
            ],
            {
                zIndexOffset: 1000
            }
        )
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


        // First GPS location
        map.setView(
            [
                lat,
                lng
            ],
            17
        );


        return;
    }


    // ====================================
    // MOVE MARKER
    // ====================================

    marker.setLatLng(
        [
            lat,
            lng
        ]
    );


    // ====================================
    // UPDATE SPEED
    // ====================================

    marker.setTooltipContent(
        "🚗 " + speedText
    );


    // ====================================
    // FOLLOW LOCATION
    // ====================================

    if (!userInteracted) {

        map.panTo(
            [
                lat,
                lng
            ],
            {
                animate: true,
                duration: 0.5
            }
        );

    }

}


// ========================================
// DRAW ROUTE
// ========================================

export function drawRoute(points) {

    if (
        !map ||
        !points ||
        points.length === 0
    ) {

        return;
    }


    // ====================================
    // WHITE ROUTE OUTLINE
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
                    opacity: 0.85,
                    lineCap: "round",
                    lineJoin: "round",
                    interactive: false
                }
            ).addTo(map);

    }


    // ====================================
    // BLUE ROUTE
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
                    lineJoin: "round",
                    interactive: false
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
        !map ||
        !points ||
        points.length === 0
    ) {

        return;
    }


    // ====================================
    // REMOVE OLD MARKERS
    // ====================================

    if (startMarker) {

        map.removeLayer(
            startMarker
        );

        startMarker = null;
    }


    if (endMarker) {

        map.removeLayer(
            endMarker
        );

        endMarker = null;
    }


    // ====================================
    // START MARKER
    // ====================================

    startMarker =
        L.marker(
            points[0],
            {
                zIndexOffset: 500
            }
        )
        .addTo(map)
        .bindPopup(
            "🟢 Trip Start"
        );


    // ====================================
    // END MARKER
    // ====================================

    endMarker =
        L.marker(
            points[
                points.length - 1
            ],
            {
                zIndexOffset: 500
            }
        )
        .addTo(map)
        .bindPopup(
            "🔴 Trip End"
        );

}


// ========================================
// ENABLE AUTO FOLLOW
// ========================================

export function enableAutoFollow() {

    userInteracted = false;

}


// ========================================
// FIT COMPLETE ROUTE
// ========================================

export function fitRoute(points) {

    if (
        !map ||
        !points ||
        points.length === 0
    ) {

        return;
    }


    map.fitBounds(
        points,
        {
            padding: [
                40,
                40
            ],

            maxZoom: 17
        }
    );


    userInteracted = true;

}