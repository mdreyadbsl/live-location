// ========================================
// LEAFLET MAP HELPER V7
// PREMIUM LIVE MAP UI
// ========================================

export let map = null;
export let marker = null;

export let routeLine = null;
export let routeOutline = null;

export let startMarker = null;
export let endMarker = null;

let userInteracted = false;


// ========================================
// CREATE MAP
// ========================================

export function createMap(divId = "map") {

    // Normal Map
    const normalLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution:
                "© OpenStreetMap contributors"
        }
    );


    // Pure Satellite
    const satelliteLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
            maxZoom: 19,
            attribution:
                "© Esri"
        }
    );


    // ====================================
    // MAP
    // ====================================

    map = L.map(divId, {

        center: [
            23.8103,
            90.4125
        ],

        zoom: 13,

        minZoom: 3,

        maxZoom: 19,

        zoomControl: false,

        layers: [
            normalLayer
        ],

        zoomAnimation: true,

        fadeAnimation: true,

        markerZoomAnimation: true,

        preferCanvas: true

    });


    // ====================================
    // PREMIUM ZOOM CONTROL
    // ====================================

    L.control.zoom({

        position: "bottomright"

    }).addTo(map);


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

            position: "topright",

            collapsed: true

        }

    ).addTo(map);


    // ====================================
    // USER INTERACTION
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
                        "premium-follow-control"
                    );


                const button =
                    L.DomUtil.create(
                        "button",
                        "premium-follow-button",
                        container
                    );


                button.type =
                    "button";


                button.innerHTML =
                    "🎯";


                button.title =
                    "Follow Live Location";


                L.DomEvent.disableClickPropagation(
                    container
                );


                L.DomEvent.on(
                    button,
                    "click",
                    function () {

                        userInteracted =
                            false;


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
                                    animate:
                                        true
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
// LIVE MARKER
// ========================================

export function updateMarker(
    lat,
    lng,
    speed = 0
) {

    if (!map) {

        return;

    }


    lat =
        Number(lat);


    lng =
        Number(lng);


    speed =
        Number(speed) || 0;


    const speedText =
        "🚗 " +
        speed.toFixed(1) +
        " km/h";


    // ====================================
    // CREATE PREMIUM MARKER
    // ====================================

    if (!marker) {

        const liveIcon =
            L.divIcon({

                className:
                    "premium-live-marker-wrapper",

                html:

                    `
                    <div class="premium-live-marker">
                        <div class="premium-live-dot"></div>
                    </div>
                    `,

                iconSize: [
                    46,
                    46
                ],

                iconAnchor: [
                    23,
                    23
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
                        2000

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
                    "premium-speed-tooltip"

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
// DRAW PREMIUM ROUTE
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

                    color:
                        "#ffffff",

                    weight:
                        10,

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
                        1,

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
// START / END MARKERS
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


    // Remove old markers

    if (startMarker) {

        map.removeLayer(
            startMarker
        );

        startMarker =
            null;

    }


    if (endMarker) {

        map.removeLayer(
            endMarker
        );

        endMarker =
            null;

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
// AUTO FOLLOW
// ========================================

export function enableAutoFollow() {

    userInteracted =
        false;


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
                animate:
                    true
            }

        );

    }

}


// ========================================
// FIT ROUTE
// ========================================

export function fitRoute(
    points
) {

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
                50,
                50
            ],

            maxZoom:
                17

        }

    );


    userInteracted =
        true;

}