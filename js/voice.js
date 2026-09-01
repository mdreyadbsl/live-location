// ========================================
// VOICE GUIDE SYSTEM V2
// ========================================

// ========================================
// VOICE STATE
// ========================================

let voiceEnabled = true;

// Last time speed/status was spoken
let lastSpeedVoiceTime = 0;


// ========================================
// BASIC SPEAK FUNCTION
// ========================================

export function speak(message) {

    if (!voiceEnabled) {
        return;
    }

    if (!("speechSynthesis" in window)) {

        console.warn(
            "Speech Synthesis is not supported."
        );

        return;
    }


    // Stop previous speech
    window.speechSynthesis.cancel();


    const speech =
        new SpeechSynthesisUtterance(
            message
        );


    speech.lang = "en-US";

    speech.rate = 0.95;

    speech.pitch = 1.0;

    speech.volume = 1.0;


    window.speechSynthesis.speak(
        speech
    );

}


// ========================================
// TRIP START
// ========================================

export function voiceTripStarted() {

    // Start the 10-minute timer
    lastSpeedVoiceTime =
        Date.now();


    speak(
        "Trip started. I will guide you during your journey."
    );

}


// ========================================
// SMART SPEED / STOPPED VOICE
// ========================================
//
// Speaks only once every 10 minutes.
//
// Moving:
// "Your current speed is 35 kilometers per hour."
//
// Stopped:
// "You are currently stopped."
//
// ========================================

export function voiceSpeed(speed) {

    speed = Number(speed);


    // Invalid speed
    if (!isFinite(speed)) {
        return;
    }


    const now =
        Date.now();


    // ====================================
    // 10 MINUTES
    // ====================================

    const TEN_MINUTES =
        10 * 60 * 1000;


    // Don't speak before 10 minutes
    if (
        now -
        lastSpeedVoiceTime
        <
        TEN_MINUTES
    ) {

        return;

    }


    // ====================================
    // VEHICLE STOPPED
    // ====================================

    if (speed <= 2) {

        speak(
            "You are currently stopped."
        );

    }


    // ====================================
    // VEHICLE MOVING
    // ====================================

    else {

        speak(
            `Your current speed is ${Math.round(speed)} kilometers per hour.`
        );

    }


    // ====================================
    // RESET TIMER
    // ====================================

    lastSpeedVoiceTime =
        now;

}


// ========================================
// GPS ERROR VOICE
// ========================================

export function voiceGpsError() {

    speak(
        "GPS signal is unavailable. Please check your location settings."
    );

}


// ========================================
// TRIP FINISHED
// ========================================

export function voiceTripFinished() {

    speak(
        "Trip finished. Have a safe journey."
    );


    // Reset timer
    lastSpeedVoiceTime = 0;

}


// ========================================
// VOICE ON / OFF
// ========================================

export function toggleVoice() {

    voiceEnabled =
        !voiceEnabled;


    // Stop speech when disabled
    if (!voiceEnabled) {

        if (
            "speechSynthesis"
            in window
        ) {

            window.speechSynthesis.cancel();

        }

    }


    return voiceEnabled;

}


// ========================================
// CHECK VOICE STATUS
// ========================================

export function isVoiceEnabled() {

    return voiceEnabled;

}


// ========================================
// ENABLE VOICE
// ========================================

export function enableVoice() {

    voiceEnabled = true;

}


// ========================================
// DISABLE VOICE
// ========================================

export function disableVoice() {

    voiceEnabled = false;


    if (
        "speechSynthesis"
        in window
    ) {

        window.speechSynthesis.cancel();

    }

}


// ========================================
// RESET VOICE TIMER
// ========================================

export function resetVoiceTimer() {

    lastSpeedVoiceTime =
        Date.now();

}


// ========================================
// VOICE SYSTEM READY
// ========================================

console.log(
    "🔊 Voice Guide V2 Loaded Successfully"
);