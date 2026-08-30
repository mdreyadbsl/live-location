// ========================================
// LEAFLET MAP HELPER V6
// ROAD FOLLOWING ROUTE
// ========================================

export let map = null;
export let marker = null;

export let routeLine = null;
export let routeOutline = null;

export let startMarker = null;
export let endMarker = null;

let userInteracted = false;
let routeRequestTimer = null;
let lastMatchedPointCount = 0;


// ========================================
// CREATE MAP
// ========================================

export function createMap(divId = "map") {

    const normalLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution: "© OpenStreetMap contributors"
        }
    );

    const satelliteLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
            maxZoom: 19,
            attribution: "© Esri"
        }
    );

    map = L.map(divId, {

        center: [23.8103, 90.4125],

        zoom: 13,

        zoomControl: true,

        layers: [normalLayer],

        zoomAnimation: true,

        fadeAnimation: true,

        markerZoomAnimation: true,

        touchZoom: true,

        scrollWheelZoom: true,

        doubleClickZoom: true,

        dragging: true

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


    // ====================================
    // FOLLOW CONTROL
    // ====================================

    const FollowControl =
        L.Control.extend({

            options: {
                position: "bottomright"
            },

            onAdd: function () {

                const container =
                    L.DomUtil.create(
                        "div",
                        "follow-location-control"
                    );

                const button =
                    L.DomUtil.create(
                        "button",
                        "follow-location-button",
                        container
                    );

                button.type = "button";

                button.innerHTML = "🎯";

                button.title =
                    "Follow Live Location";

                L.DomEvent.disableClickPropagation(
                    container
                );

                L.DomEvent.on(
                    button,
                    "click",
                    function () {

                        userInteracted = false;

                        if (marker) {

                            const position =
                                marker.getLatLng();

                            map.setView(
                                [
                                    position.lat,
                                    position.lng
                                ],
                                17,
                                {
                                    animate: true
                                }
                            );

                        }

                    }
                );

                return container;
            }

        });

    map.addControl(
        new FollowControl()
    );

    return map;
}


// ========================================
// LIVE MARKER + SPEED
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
        "🚗 " +
        speed.toFixed(1) +
        " km/h";


    // ====================================
    // CREATE MARKER
    // ====================================

    if (!marker) {

        const liveIcon =
            L.divIcon({

                className:
                    "live-marker-wrapper",

                html:
                    `<div class="live-marker"></div>`,

                iconSize: [
                    42,
                    42
                ],

                iconAnchor: [
                    21,
                    21
                ]

            });

        marker =
            L.marker(
                [
                    lat,
                    lng
                ],
                {

                    icon:
                        liveIcon,

                    zIndexOffset:
                        1000

                }
            )
            .addTo(map);


        marker.bindTooltip(
            speedText,
            {

                permanent:
                    true,

                direction:
                    "top",

                offset: [
                    0,
                    -25
                ],

                className:
                    "speed-tooltip"

            }
        );


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
        speedText
    );


    // ====================================
    // AUTO FOLLOW
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
// ROAD MATCHING
// ========================================

async function getRoadRoute(points) {

    if (
        !points ||
        points.length < 2
    ) {

        return null;

    }


    try {

        // --------------------------------
        // Limit GPS points
        // --------------------------------

        let selectedPoints = points;

        if (points.length > 80) {

            const step =
                Math.floor(
                    points.length / 80
                );

            selectedPoints =
                points.filter(
                    (_, index) =>
                        index % step === 0
                );

            // Always keep final point

            if (
                selectedPoints[
                    selectedPoints.length - 1
                ] !==
                points[
                    points.length - 1
                ]
            ) {

                selectedPoints.push(
                    points[
                        points.length - 1
                    ]
                );

            }

        }


        // --------------------------------
        // OSRM coordinates
        // --------------------------------

        const coordinates =
            selectedPoints
                .map(point =>
                    Number(point[1]) +
                    "," +
                    Number(point[0])
                )
                .join(";");


        // --------------------------------
        // OSRM MATCH API
        // --------------------------------

        const url =
            "https://router.project-osrm.org/match/v1/driving/" +
            coordinates +
            "?overview=full&geometries=geojson&steps=false";


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "OSRM request failed"
            );

        }


        const data =
            await response.json();


        if (
            !data.matchings ||
            data.matchings.length === 0
        ) {

            console.warn(
                "⚠️ No road matching found"
            );

            return null;

        }


        // --------------------------------
        // Get matched route
        // --------------------------------

        let roadPoints = [];


        data.matchings.forEach(
            matching => {

                if (
                    matching.geometry &&
                    matching.geometry.coordinates
                ) {

                    const coords =
                        matching.geometry.coordinates;


                    coords.forEach(
                        point => {

                            roadPoints.push(
                                [
                                    point[1],
                                    point[0]
                                ]
                            );

                        }
                    );

                }

            }
        );


        if (
            roadPoints.length < 2
        ) {

            return null;

        }


        return roadPoints;


    } catch (error) {

        console.warn(
            "⚠️ Road matching unavailable:",
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
        !map ||
        !points ||
        points.length === 0
    ) {

        return;

    }


    // ====================================
    // DRAW RAW GPS ROUTE FIRST
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
                        "round",

                    interactive:
                        false

                }
            ).addTo(map);

    }


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
                        5,

                    opacity:
                        0.95,

                    lineCap:
                        "round",

                    lineJoin:
                        "round",

                    interactive:
                        false

                }
            ).addTo(map);

    }


    // ====================================
    // ROAD MATCHING
    // ====================================

    if (points.length < 2) {

        return;

    }


    // Don't request repeatedly

    if (
        points.length -
        lastMatchedPointCount <
        5
    ) {

        return;

    }


    lastMatchedPointCount =
        points.length;


    // Clear previous timer

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

                    // White outline

                    if (routeOutline) {

                        routeOutline.setLatLngs(
                            roadPoints
                        );

                    }


                    // Blue route

                    if (routeLine) {

                        routeLine.setLatLngs(
                            roadPoints
                        );

                    }


                    console.log(
                        "🛣 Road route updated:",
                        roadPoints.length,
                        "points"
                    );

                }

            },

            800

        );

}


// ========================================
// START + END MARKERS
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


    // Remove old start

    if (startMarker) {

        map.removeLayer(
            startMarker
        );

        startMarker = null;

    }


    // Remove old end

    if (endMarker) {

        map.removeLayer(
            endMarker
        );

        endMarker = null;

    }


    // ====================================
    // START
    // ====================================

    startMarker =
        L.marker(
            points[0],
            {

                zIndexOffset:
                    500

            }
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
            ],
            {

                zIndexOffset:
                    500

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

    if (
        marker &&
        map
    ) {

        const position =
            marker.getLatLng();

        map.setView(
            [
                position.lat,
                position.lng
            ],
            17,
            {
                animate: true
            }
        );

    }

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

            maxZoom:
                17

        }
    );

    userInteracted = true;

}