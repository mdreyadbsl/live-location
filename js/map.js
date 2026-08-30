// ========================================
// LEAFLET MAP HELPER V4
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

let firstLocation = true;
let userInteracted = false;

let routeRequestTimer = null;
let lastRoutePointCount = 0;


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
            attribution: "© OpenStreetMap contributors"
        }
    );


    // ====================================
    // PURE SATELLITE
    // ====================================

    const satelliteLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
            maxZoom: 19,
            attribution: "© Esri"
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

        // Smooth zoom
        zoomAnimation: true,

        // Better mobile touch
        touchZoom: true,

        scrollWheelZoom: true,

        doubleClickZoom: true,

        boxZoom: true,

        keyboard: true

    });


    // ====================================
    // MAP LAYER SWITCH
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
    // DETECT USER MAP MOVEMENT
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

        marker =
            L.marker(
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

                "🚗 " +
                speedText,

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


        // First location
        map.setView(
            [
                lat,
                lng
            ],
            17
        );


        firstLocation = false;


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

        "🚗 " +
        speedText

    );


    // ====================================
    // FOLLOW LIVE LOCATION
    // ====================================

    // Only follow if user hasn't manually
    // moved/zoomed the map.

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
// ROAD ROUTE
// ========================================

async function getRoadRoute(points) {

    if (
        !points ||
        points.length < 2
    ) {

        return null;

    }


    try {

        // Use first and latest point
        // to avoid huge URL requests.

        const start =
            points[0];

        const end =
            points[
                points.length - 1
            ];


        const url =
            "https://router.project-osrm.org/route/v1/driving/" +

            start[1] +
            "," +
            start[0] +

            ";" +

            end[1] +
            "," +
            end[0] +

            "?overview=full&geometries=geojson";


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Routing server error"
            );

        }


        const data =
            await response.json();


        if (
            !data.routes ||
            data.routes.length === 0
        ) {

            return null;

        }


        const coordinates =
            data
                .routes[0]
                .geometry
                .coordinates;


        return coordinates.map(
            point => [

                point[1],
                point[0]

            ]
        );


    } catch (error) {

        console.warn(
            "⚠️ Road route unavailable:",
            error
        );

        return null;

    }

}


// ========================================
// DRAW ROUTE
// ========================================

export function drawRoute(points) {

    if (
        !points ||
        points.length === 0 ||
        !map
    ) {

        return;

    }


    // ====================================
    // RAW GPS ROUTE
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

                    color:
                        "#ffffff",

                    weight:
                        10,

                    opacity:
                        0.9,

                    lineCap:
                        "round",

                    lineJoin:
                        "round"

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

                    color:
                        "#2563eb",

                    weight:
                        6,

                    opacity:
                        0.95,

                    lineCap:
                        "round",

                    lineJoin:
                        "round"

                }

            ).addTo(map);

    }


    // ====================================
    // ROAD ROUTING
    // ====================================

    // Don't request routing for every
    // single GPS update.

    if (
        points.length < 2
    ) {

        return;

    }


    if (
        points.length -
        lastRoutePointCount <
        5
    ) {

        return;

    }


    lastRoutePointCount =
        points.length;


    // Cancel previous timer

    if (routeRequestTimer) {

        clearTimeout(
            routeRequestTimer
        );

    }


    routeRequestTimer =
        setTimeout(
            async () => {

                const roadPoints =
                    await getRoadRoute(
                        points
                    );


                if (
                    roadPoints &&
                    roadPoints.length > 1
                ) {

                    if (routeLine) {

                        routeLine.setLatLngs(
                            roadPoints
                        );

                    }


                    if (routeOutline) {

                        routeOutline.setLatLngs(
                            roadPoints
                        );

                    }

                }

            },

            1000

        );

}


// ========================================
// START & END MARKERS
// ========================================

export function showStartEndMarkers(
    points
) {

    if (
        !points ||
        points.length === 0 ||
        !map
    ) {

        return;

    }


    // ====================================
    // REMOVE OLD START
    // ====================================

    if (startMarker) {

        map.removeLayer(
            startMarker
        );

    }


    // ====================================
    // REMOVE OLD END
    // ====================================

    if (endMarker) {

        map.removeLayer(
            endMarker
        );

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
// RESET MAP FOLLOW MODE
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

}