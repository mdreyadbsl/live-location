import { database } from "./firebase.js";

import {
    ref,
    get,
    remove
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

console.log("🧹 Cleanup Module Loaded");

export async function cleanupOldTrips(deviceId) {

    try {

        console.log("🧹 Checking old trips...");

        const tripsRef = ref(database, "trips/" + deviceId);

        const snapshot = await get(tripsRef);

        if (!snapshot.exists()) {

            console.log("✅ No Trips Found");

            return;

        }

        const trips = snapshot.val();

        const totalTrips = Object.keys(trips).length;

        console.log("📦 Total Trips:", totalTrips);

        // ===== AUTO DELETE AFTER 3 DAYS =====
        const AUTO_DELETE_AFTER_DAYS = 3;

        const deleteBefore =
            Date.now() - (AUTO_DELETE_AFTER_DAYS * 24 * 60 * 60 * 1000);

        let deleted = 0;

        for (const tripId of Object.keys(trips)) {

            const trip = trips[tripId];

            if (!trip.info) continue;
            if (!trip.info.startTime) continue;

            // Never delete active trip
            if (trip.info.status === "RUNNING") {

                console.log("🟢 Active:", tripId);

                continue;

            }

            // Delete trips older than 3 days
            if (trip.info.startTime < deleteBefore) {

                await remove(
                    ref(database, `trips/${deviceId}/${tripId}`)
                );

                deleted++;

                console.log("🗑 Deleted:", tripId);

            } else {

                console.log("✅ Keep:", tripId);

            }

        }

        console.log("================================");
        console.log("📦 Total Trips :", totalTrips);
        console.log("🗑 Deleted     :", deleted);
        console.log("✅ Remaining   :", totalTrips - deleted);
        console.log("================================");

    } catch (error) {

        console.error("❌ Cleanup Error:", error);

    }

}