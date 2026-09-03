// ==========================================
// 🚗 Road Name Detection & Voice System V3
// ==========================================

let lastRoadName = "";
let lastCheckTime = 0;
let lastAnnouncedRoad = "";
let lastAnnouncementTime = 0;

// 🔊 Voice speaking status
let roadVoiceSpeaking = false;

// Check road every 20 seconds
const ROAD_CHECK_INTERVAL = 20000;

// Same road announcement cooldown
const ROAD_ANNOUNCEMENT_COOLDOWN = 5 * 60 * 1000;


// ==========================================
// Get Road Name
// ==========================================

export async function getRoadName(lat, lng) {

    try {

        const url =
            "https://nominatim.openstreetmap.org/reverse" +
            "?format=jsonv2" +
            "&lat=" + encodeURIComponent(lat) +
            "&lon=" + encodeURIComponent(lng) +
            "&zoom=18" +
            "&addressdetails=1";

        const response =
            await fetch(url);

        if (!response.ok) {

            throw new Error(
                "Road API request failed: " +
                response.status
            );

        }

        const data =
            await response.json();

        const address =
            data.address || {};

        const roadName =
            address.road ||
            address.pedestrian ||
            address.residential ||
            address.highway ||
            "";

        return roadName.trim();

    } catch (error) {

        console.log(
            "🚧 Road detection error:",
            error
        );

        return "";

    }

}


// ==========================================
// Normalize Road Name
// ==========================================

function normalizeRoadName(name) {

    return String(name || "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

}


// ==========================================
// Check Road Change
// ==========================================

export async function checkRoadChange(
    lat,
    lng,
    speakFunction
) {

    const now =
        Date.now();


    // ======================================
    // Prevent too many API requests
    // ======================================

    if (
        now - lastCheckTime <
        ROAD_CHECK_INTERVAL
    ) {

        return;

    }

    lastCheckTime =
        now;


    // ======================================
    // Get Current Road
    // ======================================

    const roadName =
        await getRoadName(lat, lng);


    if (!roadName) {

        console.log(
            "🚧 Road name not found"
        );

        return;

    }


    console.log(
        "🛣️ Current Road:",
        roadName
    );


    const normalizedRoad =
        normalizeRoadName(roadName);

    const normalizedLastRoad =
        normalizeRoadName(lastRoadName);


    // ======================================
    // First Road
    // ======================================

    if (!lastRoadName) {

        lastRoadName =
            roadName;

        console.log(
            "🛣️ Starting Road:",
            roadName
        );

        return;

    }


    // ======================================
    // Same Road
    // ======================================

    if (
        normalizedRoad ===
        normalizedLastRoad
    ) {

        return;

    }


    // ======================================
    // NEW ROAD DETECTED
    // ======================================

    console.log(
        "🚨 ROAD CHANGED:",
        lastRoadName,
        "→",
        roadName
    );


    // Update current road
    lastRoadName =
        roadName;


    // ======================================
    // Duplicate Announcement Protection
    // ======================================

    const normalizedLastAnnounced =
        normalizeRoadName(
            lastAnnouncedRoad
        );

    const sameAsLastAnnouncement =
        normalizedRoad ===
        normalizedLastAnnounced;

    const withinCooldown =
        now - lastAnnouncementTime <
        ROAD_ANNOUNCEMENT_COOLDOWN;


    if (
        sameAsLastAnnouncement &&
        withinCooldown
    ) {

        console.log(
            "🔇 Duplicate road voice blocked:",
            roadName
        );

        return;

    }


    // ======================================
    // Check Speak Function
    // ======================================

    if (
        typeof speakFunction !==
        "function"
    ) {

        console.log(
            "⚠️ Voice function not available"
        );

        return;

    }


    // ======================================
    // Prevent Road Voice Overlap
    // ======================================

    if (roadVoiceSpeaking) {

        console.log(
            "🔇 Road voice already speaking"
        );

        return;

    }


    roadVoiceSpeaking =
        true;


    // Save announcement
    lastAnnouncedRoad =
        roadName;

    lastAnnouncementTime =
        now;


    console.log(
        "🔊 Road Voice:",
        roadName
    );


    // ======================================
    // Speak
    // ======================================

    speakFunction(
        "You are now on " +
        roadName +
        "."
    );


    // ======================================
    // Detect Speech End
    // ======================================

    const speechCheck =
        setInterval(() => {

            if (
                !window.speechSynthesis ||
                !window.speechSynthesis.speaking
            ) {

                clearInterval(
                    speechCheck
                );

                roadVoiceSpeaking =
                    false;

                console.log(
                    "🔓 Road voice unlocked"
                );

            }

        }, 250);


    // ======================================
    // Safety Timeout
    // ======================================

    setTimeout(() => {

        clearInterval(
            speechCheck
        );

        roadVoiceSpeaking =
            false;

    }, 10000);

}


// ==========================================
// Road Voice Status
// ==========================================

export function isRoadVoiceSpeaking() {

    return roadVoiceSpeaking;

}


// ==========================================
// Reset Road Voice
// ==========================================

export function resetRoadVoice() {

    lastRoadName =
        "";

    lastCheckTime =
        0;

    lastAnnouncedRoad =
        "";

    lastAnnouncementTime =
        0;

    roadVoiceSpeaking =
        false;


    console.log(
        "🔄 Road Voice Reset"
    );

}


// ==========================================
// Debug
// ==========================================

console.log(
    "🛣️ Road Voice V3 Loaded Successfully"
);