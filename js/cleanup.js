// ========================================
// CLEANUP OLD FINISHED TRIPS
// Delete trips 24 hours after they finish
// ========================================

import {
    ref,
    get,
    remove
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import { database } from "./firebase.js";


// ========================================
// CLEANUP FUNCTION
// ========================================

export async function cleanupOldTrips(deviceId) {

    if (!deviceId) {
        return;
    }

    try {

        const tripsRef = ref(
            database,
            "trips/" + deviceId
        );

        const snapshot = await get(tripsRef);

        if (!snapshot.exists()) {

            console.log("🧹 No trips found");

            return;
        }

        const trips = snapshot.val();

        // 24 hours in milliseconds
        const ONE_DAY = 24 * 60 * 60 * 1000;

        const deleteBefore =
            Date.now() - ONE_DAY;

        let deletedCount = 0;


        // ====================================
        // CHECK ALL TRIPS
        // ====================================

        for (const tripId of Object.keys(trips)) {

            const trip = trips[tripId];

            const info = trip?.info || {};

            const endTime =
                Number(info.endTime || 0);

            const tripStatus =
                info.status;


            // ==================================
            // ONLY FINISHED TRIPS
            // ==================================

            if (
                tripStatus === "FINISHED" &&
                endTime > 0 &&
                endTime < deleteBefore
            ) {

                await remove(
                    ref(
                        database,
                        "trips/" +
                        deviceId +
                        "/" +
                        tripId
                    )
                );

                deletedCount++;

                console.log(
                    "🗑️ Deleted old trip:",
                    tripId
                );
            }
        }


        console.log(
            "🧹 Cleanup complete:",
            deletedCount,
            "trip(s) deleted"
        );


    } catch (error) {

        console.error(
            "❌ Trip cleanup failed:",
            error
        );

    }

}