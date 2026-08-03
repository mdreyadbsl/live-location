import { loginAnonymous, database } from "./firebase.js";
import { createMap, updateMarker, drawRoute } from "./map.js";
import { formatTime, formatAccuracy } from "./utils.js";

import {
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

console.log("👀 Viewer Started");

const ok = await loginAnonymous();

if (!ok) {
    alert("Firebase Login Failed");
    throw new Error("Firebase Login Failed");
}

createMap();

const viewButton = document.getElementById("viewButton");
const status = document.getElementById("status");

viewButton.disabled = false;
viewButton.innerText = "👀 VIEW LIVE LOCATION";

let locationListener = null;
let routeListener = null;

window.startViewer = function () {

    const deviceId = document.getElementById("deviceId").value.trim();

    if (!deviceId) {
        alert("Please Enter Tracking ID");
        return;
    }

    viewButton.disabled = true;
    viewButton.innerText = "🟢 WATCHING";
    status.innerText = "🔄 Connecting...";

    if (locationListener) locationListener();
    if (routeListener) routeListener();

    // Live Location
    locationListener = onValue(
        ref(database, "locations/" + deviceId),
        (snapshot) => {

            if (!snapshot.exists()) {
                status.innerText = "❌ No Location Found";
                return;
            }

            const data = snapshot.val();

            updateMarker(
                Number(data.latitude),
                Number(data.longitude)
            );

            document.getElementById("lat").innerText =
                Number(data.latitude).toFixed(6);

            document.getElementById("lng").innerText =
                Number(data.longitude).toFixed(6);

            document.getElementById("accuracy").innerText =
                formatAccuracy(data.accuracy);

            document.getElementById("time").innerText =
                formatTime(data.timestamp);

            status.innerText = "🟢 LIVE";
        }
    );

    // Route History
    routeListener = onValue(
        ref(database, "routes/" + deviceId),
        (snapshot) => {

            if (!snapshot.exists()) return;

            const points = [];

            Object.values(snapshot.val())
                .sort((a, b) => a.timestamp - b.timestamp)
                .forEach(item => {

                    points.push([
                        Number(item.latitude),
                        Number(item.longitude)
                    ]);

                });

            drawRoute(points);

        }
    );

};

window.addEventListener("online", () => {
    status.innerText = "🟢 Internet Connected";
});

window.addEventListener("offline", () => {
    status.innerText = "🔴 Internet Disconnected";
});