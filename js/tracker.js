import { loginAnonymous, database } from "./firebase.js";

import {
    speak,
    voiceTripStarted,
    voiceSpeed,
    voiceGpsError,
    voiceTripFinished,
    toggleVoice
} from "./voice.js";

import {
    createMap,
    updateMarker,
    drawRoute
} from "./map.js";

import {
    formatTime,
    formatAccuracy
} from "./utils.js";

import { cleanupOldTrips } from "./cleanup.js";

import {
     ref,
    set,
    push,
    remove
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


// ========================================
// TRACKER START
// ========================================

console.log("🚀 Tracker Started V3");


// ========================================
// FIREBASE LOGIN
// ========================================

const loggedIn = await loginAnonymous();

if (!loggedIn) {

    alert("Firebase Connection Failed");

    throw new Error("Firebase Login Failed");

}

console.log("🔥 Firebase Connected");


// ========================================
// CREATE MAP
// ========================================

createMap();


// ========================================
// UI ELEMENTS
// ========================================

const startButton =
    document.getElementById("startButton");

const stopButton =
    document.getElementById("stopButton");

const status =
    document.getElementById("status");


// ========================================
// INITIAL BUTTON STATE
// ========================================

startButton.disabled = false;

startButton.innerText =
    "📍 START TRACKING";

stopButton.disabled = true;


// ========================================
// GLOBAL VARIABLES
// ========================================

let watchId = null;

let tracking = false;

let tripStartTime = null;

let tripId = null;


// ========================================
// LIVE ROUTE POINTS
// ========================================

let liveRoutePoints = [];


// ========================================
// START TRACKING
// ========================================

window.startTracking = async function () {

    // Prevent duplicate tracking
    if (tracking) {

        return;

    }


    // ====================================
    // GET TRACKING ID
    // ====================================

    const deviceId =
        document
            .getElementById("deviceId")
            .value
            .trim();


    if (!deviceId) {

        alert("Tracking ID Required");

        return;

    }


    // ====================================
    // GPS CHECK
    // ====================================

    if (!navigator.geolocation) {

        alert("Geolocation Not Supported");

        return;

    }


    // ====================================
    // CLEAN OLD TRIPS
    // ====================================

    await cleanupOldTrips(deviceId);


    // ====================================
    // RESET LIVE ROUTE
    // ====================================

    liveRoutePoints = [];


    // ====================================
    // START TRIP
    // ====================================

    tracking = true;

    tripStartTime = Date.now();

    tripId =
        "TRIP_" + Date.now();


    console.log(
        "🚗 Trip ID:",
        tripId
    );


    // ====================================
    // SAVE TRIP INFO
    // ====================================

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

            startTime:
                tripStartTime,

            endTime:
                null,

            status:
                "RUNNING"

        }

    );


    // ====================================
    // BUTTON UPDATE
    // ====================================

    startButton.disabled = true;

    stopButton.disabled = false;

    startButton.innerText =
        "🟢 TRACKING ACTIVE";

    status.innerText =
        "🛰 Waiting GPS...";


    // ====================================
    // REMOVE OLD WATCH
    // ====================================

    if (watchId !== null) {

        navigator.geolocation.clearWatch(
            watchId
        );

    }


    // ====================================
    // START GPS WATCH
    // ====================================
let voiceStarted = false;

let lastVoiceSpeed = null;
let lastVoiceTime = 0;

const VOICE_SPEED_CHANGE = 5;
const VOICE_INTERVAL = 15000;

    watchId =
        navigator.geolocation.watchPosition(

            async (position) => {

                // =================================
                // GPS DATA
                // =================================

                const lat =
                    position.coords.latitude;

                const lng =
                    position.coords.longitude;

                const accuracy =
                    position.coords.accuracy;

                const timestamp =
                    Date.now();
if (!voiceStarted) {

    voiceTripStarted();

    voiceStarted = true;

    // Give Trip Started voice time to finish
    await new Promise(resolve => setTimeout(resolve, 1500));

}

                // =================================
                // LIVE SPEED
                // =================================

                let speed =
                    position.coords.speed;


                // m/s → km/h

                if (
                    speed !== null &&
                    speed !== undefined &&
                    speed >= 0
                ) {

                    speed =
                        speed * 3.6;

                } else {

                    speed = 0;

                }


                // Remove strange GPS values

                if (
                    speed < 0 ||
                    !isFinite(speed)
                ) {

                    speed = 0;

                }


                speed =
                    Number(
                        speed.toFixed(1)
                    );



// =================================
// SMART VOICE SPEED GUIDANCE
// =================================

const now = Date.now();

if (
    typeof voiceSpeed === "function" &&
    (
        lastVoiceSpeed === null ||
        Math.abs(speed - lastVoiceSpeed) >= VOICE_SPEED_CHANGE ||
        now - lastVoiceTime >= VOICE_INTERVAL
    )
) {

    voiceSpeed(speed);

    lastVoiceSpeed = speed;
    lastVoiceTime = now;
}
                // =================================
                // UPDATE MAP MARKER
                // =================================

                updateMarker(
                    lat,
                    lng,
                    speed
                );


                // =================================
                // ADD POINT TO LIVE ROUTE
                // =================================

                liveRoutePoints.push(
                    [
                        lat,
                        lng
                    ]
                );


                // =================================
                // DRAW LIVE ROUTE
                // =================================

                drawRoute(
                    liveRoutePoints
                );


                // =================================
                // UPDATE UI
                // =================================

                document
                    .getElementById("lat")
                    .innerText =
                    lat.toFixed(6);


                document
                    .getElementById("lng")
                    .innerText =
                    lng.toFixed(6);


                document
                    .getElementById("accuracy")
                    .innerText =
                    formatAccuracy(
                        accuracy
                    );


                document
                    .getElementById("time")
                    .innerText =
                    formatTime(
                        timestamp
                    );


                // =================================
                // SPEED UI
                // =================================

                const speedElement =
                    document.getElementById(
                        "speed"
                    );


                if (speedElement) {

                    speedElement.innerText =
                        speed.toFixed(1) +
                        " km/h";

                }


                status.innerText =
                    "🟢 Live Tracking";


                // =================================
                // FIREBASE LIVE LOCATION
                // =================================

                try {

                    await set(

                        ref(
                            database,
                            "locations/" +
                            deviceId
                        ),

                        {

                            latitude:
                                lat,

                            longitude:
                                lng,

                            accuracy:
                                accuracy,

                            speed:
                                speed,

                            timestamp:
                                timestamp

                        }

                    );


                    // =================================
                    // SAVE TRIP POINT
                    // =================================

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

                            latitude:
                                lat,

                            longitude:
                                lng,

                            accuracy:
                                accuracy,

                            speed:
                                speed,

                            timestamp:
                                timestamp

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


            // =====================================
            // GPS ERROR
            // =====================================

            (error) => {

    console.error("GPS Error:", error);

    if (typeof voiceGpsError === "function") {
    voiceGpsError();
}

    if (error.code === 1) {

        status.innerText =
            "❌ Location Permission Denied";

        alert(
            "Location permission is blocked. Please allow Location access for this site."
        );

    } else if (error.code === 2) {

        status.innerText =
            "❌ GPS Location Unavailable";

    } else if (error.code === 3) {

        status.innerText =
            "⏳ GPS Timeout - Trying Again...";

    } else {

        status.innerText =
            "❌ GPS Error";

    }

},


            // =====================================
            // GPS OPTIONS
            // =====================================

            {

                enableHighAccuracy:
                    true,

                maximumAge:
                    0,

                timeout:
                    10000

            }

        );

};


// ========================================
// STOP TRACKING
// ========================================

window.stopTracking = async function () {

    // =====================================
    // STOP GPS
    // =====================================

    if (watchId !== null) {

        navigator.geolocation.clearWatch(
            watchId
        );

        watchId = null;

    }


    // =====================================
    // TRACKING OFF
    // =====================================

    tracking = false;


    // =====================================
    // BUTTON UPDATE
    // =====================================

    startButton.disabled = false;

    stopButton.disabled = true;

    startButton.innerText =
        "📍 START TRACKING";


    // =====================================
    // FINISH TRIP
    // =====================================

    const deviceId =
        document
            .getElementById("deviceId")
            .value
            .trim();


    if (tripId) {

    try {

        await remove(
            ref(
                database,
                "trips/" +
                deviceId +
                "/" +
                tripId
            )
        );

        console.log(
            "🗑️ Trip deleted from Firebase:",
            tripId
        );

        if (typeof voiceTripFinished === "function") {

    voiceTripFinished();

}

    } catch (error) {

        console.error(
            "❌ Trip delete failed:",
            error
        );

    }

    tripId = null;

}

        

    }
if (typeof voiceTripFinished === "function") {
    voiceTripFinished();
}

    status.innerText =
        "⏹ Tracking Stopped";


    console.log(
        "⏹ Tracking Stopped"
    );




// ========================================
// INTERNET STATUS
// ========================================

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


// ========================================
// PAGE CLOSE
// ========================================

window.addEventListener(
    "beforeunload",
    () => {

        if (watchId !== null) {

            navigator.geolocation.clearWatch(
                watchId
            );

        }

    }
);


console.log(
    "✅ Tracker V3 Loaded Successfully"
);