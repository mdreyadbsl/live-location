// ========================================
// CLEANUP OLD TRIPS
// Keep only last 2 days
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

        const tripsRef =
            ref(
                database,
                "trips/" + deviceId
            );

        const snapshot =
            await get(tripsRef);

        if (!snapshot.exists()) {

            console.log(
                "🧹 No old trips found"
            );

            return;
        }


        const trips =
            snapshot.val();


        // Keep only 2 days

        const twoDaysAgo =
            Date.now() -
            (2 * 24 * 60 * 60 * 1000);


        let deletedCount = 0;


        // ====================================
        // CHECK EVERY TRIP
        // ====================================

        for (
            const tripId of Object.keys(trips)
        ) {

            const trip =
                trips[tripId];


            const startTime =
                trip?.info?.startTime;


            if (
                startTime &&
                Number(startTime) < twoDaysAgo
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
                    "🗑 Deleted old trip:",
                    tripId
                );

            }

        }


        console.log(
            "🧹 Cleanup completed.",
            deletedCount,
            "old trip(s) deleted."
        );


    } catch (error) {

        console.error(
            "❌ Cleanup failed:",
            error
        );

    }

}