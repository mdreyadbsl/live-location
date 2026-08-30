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


    // ====================================
    // FOLLOW BUTTON
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


                // Prevent map click
                L.DomEvent.disableClickPropagation(
                    container
                );


                // =================================
                // FOLLOW CLICK
                // =================================

                L.DomEvent.on(
                    button,
                    "click",
                    function () {

                        userInteracted = false;


                        if (
                            marker
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


    // ====================================
    // SPEED TEXT
    // ====================================

    const speedText =
        "🚗 " +
        speed.toFixed(1) +
        " km/h";


    // ====================================
    // CREATE CUSTOM LIVE ICON
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


        // =================================
        // SPEED TOOLTIP
        // =================================

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


        // =================================
        // FIRST LOCATION
        // =================================

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

                animate:
                    true,

                duration:
                    0.5

            }
        );

    }

}


// ========================================
// DRAW BEAUTIFUL ROUTE
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

                    color:
                        "#ffffff",

                    weight:
                        9,

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


    // ====================================
    // MAIN BLUE ROUTE
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
    // REMOVE OLD START MARKER
    // ====================================

    if (startMarker) {

        map.removeLayer(
            startMarker
        );

        startMarker = null;

    }


    // ====================================
    // REMOVE OLD END MARKER
    // ====================================

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