import { loginAnonymous, database } from "./firebase.js";
import { createMap, updateMarker, drawRoute } from "./map.js";
import { formatTime, formatAccuracy } from "./utils.js";

import {
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

console.log("👀 Viewer Started");

const loggedIn = await loginAnonymous();

if (!loggedIn) {

    alert("Firebase Connection Failed");

    throw new Error("Firebase Login Failed");

}

createMap();

const viewButton = document.getElementById("viewButton");
const status = document.getElementById("status");

viewButton.disabled = false;
viewButton.innerText = "👀 VIEW LIVE LOCATION";

window.startViewer = function () {

    const deviceId = document.getElementById("deviceId").value.trim();

    if (!deviceId) {

        alert("Tracking ID Required");

        return;

    }

    viewButton.disabled = true;
    viewButton.innerText = "🟢 WATCHING";

    status.innerText = "🔄 Connecting...";

    // Live Location

    onValue(

        ref(database, "locations/" + deviceId),

        (snapshot) => {

            const data = snapshot.val();

            if (!data) {

                status.innerText = "❌ No Live Location";

                return;

            }

            updateMarker(data.latitude, data.longitude);

            document.getElementById("lat").innerText =
                data.latitude.toFixed(6);

            document.getElementById("lng").innerText =
                data.longitude.toFixed(6);

            document.getElementById("accuracy").innerText =
                formatAccuracy(data.accuracy);

            document.getElementById("time").innerText =
                formatTime(data.timestamp);

            status.innerText = "🟢 Live";

        }

    );

    // Route History

    onValue(

        ref(database, "routes/" + deviceId),

        (snapshot) => {

            const data = snapshot.val();

            if (!data) return;

            const points = Object.values(data)
                .sort((a, b) => a.timestamp - b.timestamp)
                .map(item => [
                    item.latitude,
                    item.longitude
                ]);

            drawRoute(points);

        }

    );

};

window.addEventListener("online", () => {

    console.log("🌐 Internet Connected");

});

window.addEventListener("offline", () => {

    console.log("❌ Internet Disconnected");

});
