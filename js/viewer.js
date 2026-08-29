import { loginAnonymous, database } from "./firebase.js";

import {
    createMap,
    updateMarker,
    drawRoute,
    showStartEndMarkers,
    map
} from "./map.js";

import {
    formatTime,
    formatAccuracy,
    calculateDistance
} from "./utils.js";

import {
    ref,
    onValue,
    get
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// ==========================
// Global Variables
// ==========================

let replayPoints = [];
let replayIndex = 0;
let replayTimer = null;

let locationListener = null;
let routeListener = null;

// ==========================
// Firebase Login
// ==========================

console.log("👀 Viewer Started");

const ok = await loginAnonymous();

if (!ok) {

    alert("Firebase Login Failed");

    throw new Error("Firebase Login Failed");

}

// ==========================
// Map Initialize
// ==========================

createMap();

// ==========================
// UI Elements
// ==========================

const viewButton =
    document.getElementById("viewButton");

const status =
    document.getElementById("status");

viewButton.disabled = false;

viewButton.innerText =
    "👀 VIEW LIVE LOCATION";

// ==========================
// Start Viewer
// ==========================

window.startViewer = function () {

    const deviceId =
        document
            .getElementById("deviceId")
            .value
            .trim();

    if (!deviceId) {

        alert("Please Enter Tracking ID");

        return;

    }

    loadTrips(deviceId);

    viewButton.disabled = true;

    viewButton.innerText =
        "🟢 WATCHING";

    status.innerText =
        "🔄 Connecting...";

    if (locationListener) {

        locationListener();

    }

    if (routeListener) {

        routeListener();

    }

    // ==========================
    // LIVE LOCATION
    // ==========================

    locationListener = onValue(

        ref(
            database,
            "locations/" + deviceId
        ),

        (snapshot) => {

            if (!snapshot.exists()) {

                status.innerText =
                    "❌ No Live Location";

                return;

            }

            const data =
                snapshot.val();

            const lat =
                Number(data.latitude);

            const lng =
                Number(data.longitude);

            const accuracy =
                Number(data.accuracy);

            const speed =
                Number(data.speed || 0);

            // ==========================
            // UPDATE MAP + SPEED
            // ==========================

            updateMarker(
                lat,
                lng,
                speed
            );

            // ==========================
            // UPDATE UI
            // ==========================

            document.getElementById("lat")
                .innerText =
                lat.toFixed(6);

            document.getElementById("lng")
                .innerText =
                lng.toFixed(6);

            document.getElementById("accuracy")
                .innerText =
                formatAccuracy(accuracy);

            document.getElementById("speed")
                .innerText =
                speed.toFixed(1) +
                " km/h";

            document.getElementById("time")
                .innerText =
                formatTime(data.timestamp);

            status.innerText =
                "🟢 LIVE";

        }

    );

};

// ==========================
// Load Trip History
// ==========================

async function loadTrips(deviceId) {

    const tripRef =
        ref(
            database,
            "trips/" + deviceId
        );

    const snapshot =
        await get(tripRef);

    const tripList =
        document.getElementById("tripList");

    tripList.innerHTML = "";

    if (!snapshot.exists()) {

        tripList.innerHTML =
            "<p>No Trips Found</p>";

        return;

    }

    const trips =
        snapshot.val();

    const tripKeys =
        Object.keys(trips).reverse();

    tripKeys.forEach((tripId) => {

        const info =
            trips[tripId].info || {};

        const startTime =
            info.startTime
                ? new Date(
                    info.startTime
                ).toLocaleString()
                : "Unknown";

        const endTime =
            info.endTime
                ? new Date(
                    info.endTime
                ).toLocaleString()
                : "Running";

        const card =
            document.createElement("div");

        card.className =
            "trip-card";

        card.style.padding =
            "12px";

        card.style.marginBottom =
            "10px";

        card.style.border =
            "1px solid #ddd";

        card.style.borderRadius =
            "10px";

        card.style.cursor =
            "pointer";

        card.style.background =
            "#ffffff";

        card.innerHTML = `
            <b>${tripId}</b><br>
            🟢 ${startTime}<br>
            🔴 ${endTime}
        `;

        card.onclick = () => {

            showTrip(
                deviceId,
                tripId
            );

        };

        tripList.appendChild(card);

    });

}

// ==========================
// Show Selected Trip
// ==========================

async function showTrip(
    deviceId,
    tripId
) {

    const tripRef =
        ref(
            database,
            "trips/" +
            deviceId +
            "/" +
            tripId +
            "/points"
        );

    const snapshot =
        await get(tripRef);

    if (!snapshot.exists()) {

        alert("No Route Found");

        return;

    }

    const rawPoints =
        Object.values(
            snapshot.val()
        )
        .sort(
            (a, b) =>
                a.timestamp -
                b.timestamp
        );

    const points =
        rawPoints.map(item => [

            Number(item.latitude),

            Number(item.longitude)

        ]);

    replayPoints =
        points;

    replayIndex = 0;

    updateTripStatistics(
        rawPoints
    );

    drawRoute(points);

    showStartEndMarkers(points);

    if (points.length > 0) {

        const lastPoint =
            rawPoints[
                rawPoints.length - 1
            ];

        const lastSpeed =
            Number(
                lastPoint.speed || 0
            );

        updateMarker(

            points[
                points.length - 1
            ][0],

            points[
                points.length - 1
            ][1],

            lastSpeed

        );

        document.getElementById("speed")
            .innerText =
            lastSpeed.toFixed(1) +
            " km/h";

        map.fitBounds(
            points,
            {
                padding: [40, 40]
            }
        );

    }

}

// ==========================
// Trip Statistics
// ==========================

function updateTripStatistics(
    rawPoints
) {

    if (
        !rawPoints ||
        rawPoints.length < 2
    ) {

        document.getElementById(
            "tripDistance"
        ).innerText =
            "0 km";

        document.getElementById(
            "tripDuration"
        ).innerText =
            "0 min";

        document.getElementById(
            "tripPoints"
        ).innerText =
            "0";

        return;

    }

    let distance = 0;

    for (
        let i = 1;
        i < rawPoints.length;
        i++
    ) {

        distance +=
            calculateDistance(

                rawPoints[i - 1].latitude,

                rawPoints[i - 1].longitude,

                rawPoints[i].latitude,

                rawPoints[i].longitude

            );

    }

    const duration =
        (
            rawPoints[
                rawPoints.length - 1
            ].timestamp -

            rawPoints[0].timestamp

        ) / 1000 / 60;

    document.getElementById(
        "tripDistance"
    ).innerText =
        (distance / 1000)
            .toFixed(2) +
        " km";

    document.getElementById(
        "tripDuration"
    ).innerText =
        duration.toFixed(1) +
        " min";

    document.getElementById(
        "tripPoints"
    ).innerText =
        rawPoints.length;

}

// ==========================
// Replay Route
// ==========================

window.playRoute = function () {

    if (
        replayPoints.length === 0
    ) {

        alert("No Route Loaded");

        return;

    }

    if (replayTimer) {

        clearInterval(
            replayTimer
        );

    }

    replayIndex = 0;

    replayTimer =
        setInterval(() => {

            if (
                replayIndex >=
                replayPoints.length
            ) {

                clearInterval(
                    replayTimer
                );

                replayTimer = null;

                return;

            }

            const point =
                replayPoints[
                    replayIndex
                ];

            updateMarker(
                point[0],
                point[1]
            );

            map.panTo(point);

            replayIndex++;

        }, 300);

};

// ==========================
// Stop Replay
// ==========================

window.stopReplay = function () {

    if (replayTimer) {

        clearInterval(
            replayTimer
        );

        replayTimer = null;

    }

};

// ==========================
// Restart Replay
// ==========================

window.restartReplay = function () {

    replayIndex = 0;

    window.playRoute();

};

// ==========================
// Network Status
// ==========================

window.addEventListener(
    "online",
    () => {

        status.innerText =
            "🟢 Internet Connected";

    }
);

window.addEventListener(
    "offline",
    () => {

        status.innerText =
            "🔴 Internet Disconnected";

    }
);

// ==========================
// Cleanup
// ==========================

window.addEventListener(
    "beforeunload",
    () => {

        if (locationListener) {

            locationListener();

        }

        if (routeListener) {

            routeListener();

        }

        if (replayTimer) {

            clearInterval(
                replayTimer
            );

        }

    }
);

console.log(
    "✅ Viewer V4 Loaded Successfully"
);