import { loginAnonymous, database } from "./firebase.js";
import { createMap, updateMarker } from "./map.js";
import { formatTime, formatAccuracy } from "./utils.js";
import { cleanupOldTrips } from "./cleanup.js";

import {
    ref,
    set,
    push,
    update
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

console.log("🚀 Tracker Started V3");

const loggedIn = await loginAnonymous();

if (!loggedIn) {
    alert("Firebase Connection Failed");
    throw new Error("Firebase Login Failed");
}

createMap();

const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const status = document.getElementById("status");

startButton.disabled = false;
startButton.innerText = "📍 START TRACKING";

let watchId = null;
let tracking = false;

let tripStartTime = null;
let tripId = null;

// ================================
// START TRACKING
// ================================

window.startTracking = async function () {

    if (tracking) {
        return;
    }

    const deviceId =
        document.getElementById("deviceId").value.trim();

    if (!deviceId) {
        alert("Tracking ID Required");
        return;
    }

    if (!navigator.geolocation) {
        alert("Geolocation Not Supported");
        return;
    }

    try {

        // Cleanup old trips
        await cleanupOldTrips(deviceId);

        tracking = true;
        tripStartTime = Date.now();

        tripId = "TRIP_" + Date.now();

        console.log("Trip ID:", tripId);

        // Create Trip
        await set(
            ref(
                database,
                "trips/" +
                deviceId +
                "/" +
                tripId +
                "/info"
            ),
            {
                startTime: tripStartTime,
                endTime: null,
                status: "RUNNING"
            }
        );

        // UI
        startButton.disabled = true;
        stopButton.disabled = false;

        startButton.innerText =
            "🟢 TRACKING ACTIVE";

        status.innerText =
            "🛰 Waiting GPS...";

        // Clear previous watcher
        if (watchId !== null) {

            navigator.geolocation.clearWatch(
                watchId
            );

        }

        // ================================
        // GPS WATCH
        // ================================

        watchId =
            navigator.geolocation.watchPosition(

                async (position) => {

                    const lat =
                        position.coords.latitude;

                    const lng =
                        position.coords.longitude;

                    const accuracy =
                        position.coords.accuracy;

                    const timestamp =
                        Date.now();

                    // GPS Speed
                    // ================================
// LIVE SPEED CALCULATION
// ================================

let speed = position.coords.speed;

// Previous GPS point
if (!window.previousGPSPoint) {

    window.previousGPSPoint = {
        lat: lat,
        lng: lng,
        time: timestamp
    };

}

// Browser GPS speed available
if (
    speed !== null &&
    speed !== undefined &&
    speed >= 0
) {

    // m/s → km/h
    speed = speed * 3.6;

} else {

    // Calculate speed manually
    const previous = window.previousGPSPoint;

    const R = 6371000;

    const lat1 =
        previous.lat * Math.PI / 180;

    const lat2 =
        lat * Math.PI / 180;

    const dLat =
        (lat - previous.lat) *
        Math.PI / 180;

    const dLng =
        (lng - previous.lng) *
        Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(dLng / 2) ** 2;

    const distance =
        2 * R *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    const timeDifference =
        (timestamp - previous.time) / 1000;

    if (timeDifference > 0) {

        // m/s → km/h
        speed =
            (distance / timeDifference) * 3.6;

    } else {

        speed = 0;

    }

}

// Update previous GPS point
window.previousGPSPoint = {
    lat: lat,
    lng: lng,
    time: timestamp
};

// Prevent invalid values
if (
    speed < 0 ||
    !isFinite(speed)
) {

    speed = 0;

}

// Keep one decimal
speed = Number(
    speed.toFixed(1)
);
                    // Update Map
                    updateMarker(
                    lat,
                    lng,
                   speed
                    );

                    // Update UI
                    document.getElementById("lat")
                        .innerText =
                        lat.toFixed(6);

                    document.getElementById("lng")
                        .innerText =
                        lng.toFixed(6);

                    document.getElementById("accuracy")
                        .innerText =
                        formatAccuracy(accuracy);

                    document.getElementById("time")
                        .innerText =
                        formatTime(timestamp);

                    // Live Speed Display
                    const speedElement =
                        document.getElementById("speed");

                    if (speedElement) {

                        speedElement.innerText =
                            speed.toFixed(1) +
                            " km/h";

                    }

                    status.innerText =
                        "🟢 Live Tracking";

                    try {

                        // =========================
                        // LIVE LOCATION
                        // =========================

                        await set(
                            ref(
                                database,
                                "locations/" +
                                deviceId
                            ),
                            {
                                latitude: lat,
                                longitude: lng,
                                accuracy: accuracy,
                                speed: speed,
                                timestamp: timestamp
                            }
                        );

                        // =========================
                        // TRIP POINT
                        // =========================

                        await set(
                            push(
                                ref(
                                    database,
                                    "trips/" +
                                    deviceId +
                                    "/" +
                                    tripId +
                                    "/points"
                                )
                            ),
                            {
                                latitude: lat,
                                longitude: lng,
                                accuracy: accuracy,
                                speed: speed,
                                timestamp: timestamp
                            }
                        );

                    } catch (error) {

                        console.error(
                            "Firebase Upload Error:",
                            error
                        );

                        status.innerText =
                            "❌ Firebase Upload Failed";

                    }

                },

                (error) => {

                    console.error(
                        "GPS Error:",
                        error
                    );

                    status.innerText =
                        "❌ GPS Error";

                },

                {
                    enableHighAccuracy: true,
                    maximumAge: 0,
                    timeout: 10000
                }

            );

    } catch (error) {

        console.error(
            "Start Tracking Error:",
            error
        );

        tracking = false;

        startButton.disabled = false;
        stopButton.disabled = true;

        status.innerText =
            "❌ Tracking Start Failed";

        alert(
            "Tracking could not be started."
        );

    }

};

// ================================
// STOP TRACKING
// ================================

window.stopTracking = function () {

    if (watchId !== null) {

        navigator.geolocation.clearWatch(
            watchId
        );

        watchId = null;

    }

    tracking = false;
    window.previousGPSPoint = null;

    startButton.disabled = false;

    startButton.innerText =
        "📍 START TRACKING";

    stopButton.disabled = true;

    const deviceId =
        document.getElementById("deviceId")
            .value.trim();

    if (tripId && deviceId) {

        update(
            ref(
                database,
                "trips/" +
                deviceId +
                "/" +
                tripId +
                "/info"
            ),
            {
                endTime: Date.now(),
                status: "FINISHED"
            }
        );

    }

    status.innerText =
        "⏹ Tracking Stopped";

    const speedElement =
        document.getElementById("speed");

    if (speedElement) {

        speedElement.innerText =
            "0.0 km/h";

    }

    tripId = null;

    console.log("Trip End");

};

// ================================
// INTERNET STATUS
// ================================

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