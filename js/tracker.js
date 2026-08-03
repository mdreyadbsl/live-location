import { loginAnonymous, database } from "./firebase.js";
import { createMap, updateMarker } from "./map.js";
import { formatTime, formatAccuracy } from "./utils.js";

import {
    ref,
    set,
    push
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

console.log("🚀 Tracker Started");

const loggedIn = await loginAnonymous();

if (!loggedIn) {
    alert("Firebase Connection Failed");
    throw new Error("Firebase Login Failed");
}

createMap();

const startButton = document.getElementById("startButton");
const status = document.getElementById("status");

startButton.disabled = false;
startButton.innerText = "📍 START TRACKING";

let watchId = null;

window.startTracking = function () {

    const deviceId = document.getElementById("deviceId").value.trim();

    if (!deviceId) {
        alert("Tracking ID Required");
        return;
    }

    if (!navigator.geolocation) {
        alert("Geolocation Not Supported");
        return;
    }

    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
    }

    startButton.disabled = true;
    startButton.innerText = "🟢 TRACKING ACTIVE";
    status.innerText = "🛰 Waiting GPS...";

    watchId = navigator.geolocation.watchPosition(

        async (position) => {

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = position.coords.accuracy;
            const timestamp = Date.now();

            updateMarker(lat, lng);

            document.getElementById("lat").innerText = lat.toFixed(6);
            document.getElementById("lng").innerText = lng.toFixed(6);
            document.getElementById("accuracy").innerText = formatAccuracy(accuracy);
            document.getElementById("time").innerText = formatTime(timestamp);

            status.innerText = "🟢 Live Tracking";

            try {

                await set(
                    ref(database, "locations/" + deviceId),
                    {
                        latitude: lat,
                        longitude: lng,
                        accuracy: accuracy,
                        timestamp: timestamp
                    }
                );

                await set(
                    push(ref(database, "routes/" + deviceId)),
                    {
                        latitude: lat,
                        longitude: lng,
                        accuracy: accuracy,
                        timestamp: timestamp
                    }
                );

            } catch (error) {

                console.error(error);
                status.innerText = "❌ Firebase Upload Failed";

            }

        },

        (error) => {

            console.error(error);

            status.innerText = "❌ GPS Error";

        },

        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000
        }

    );

};

window.addEventListener("online", () => {
    status.innerText = "🟢 Internet Connected";
});

window.addEventListener("offline", () => {
    status.innerText = "🔴 Internet Disconnected";
});