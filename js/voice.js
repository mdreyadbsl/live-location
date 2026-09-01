// ========================================
// VOICE GUIDE SYSTEM V1
// ========================================


// ========================================
// VOICE STATE
// ========================================

let voiceEnabled = true;

let lastSpeedVoiceTime = 0;


// ========================================
// BASIC SPEAK FUNCTION
// ========================================

export function speak(message) {

    if (!voiceEnabled) {
        return;
    }

    if (
        !("speechSynthesis" in window)
    ) {
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

    // Reset speed timer
    lastSpeedVoiceTime =
        Date.now();


    speak(
        "Trip started. I will guide you during your journey."
    );

}


// ========================================
// SMART SPEED VOICE
// ========================================
// Speaks current speed every 10 minutes
// ========================================

export function voiceSpeed(
    speed
) {

    speed = Number(speed);


    // Invalid speed
    if (
        !isFinite(speed)
    ) {

        return;

    }


    const now =
        Date.now();


    // 10 minutes
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


    // Speak speed
    speak(
        `Your current speed is ${Math.round(speed)} kilometers per hour.`
    );


    // Reset timer
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


    // Reset speed timer
    lastSpeedVoiceTime = 0;

}


// ========================================
// VOICE ON / OFF
// ========================================

export function toggleVoice() {

    voiceEnabled =
        !voiceEnabled;


    // Stop current speech
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
// RESET SPEED TIMER
// ========================================

export function resetVoiceTimer() {

    lastSpeedVoiceTime =
        Date.now();

}


// ========================================
// VOICE SYSTEM READY
// ========================================

console.log(
    "🔊 Voice Guide V1 Loaded Successfully"
);