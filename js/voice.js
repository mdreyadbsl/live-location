// ========================================
// VOICE ASSISTANT V1
// ========================================

let voiceEnabled = true;
let lastSpokenSpeed = null;
let lastSpeedTime = 0;


// ========================================
// BASIC SPEAK FUNCTION
// ========================================

export function speak(message) {

    if (!voiceEnabled) {
        return;
    }

    if (!("speechSynthesis" in window)) {
        console.warn("⚠️ Speech Synthesis not supported");
        return;
    }

    // Stop previous voice
    window.speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(message);

    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    window.speechSynthesis.speak(speech);
}


// ========================================
// ENABLE VOICE
// ========================================

export function enableVoice() {

    voiceEnabled = true;

    speak("Voice assistant enabled.");

}


// ========================================
// DISABLE VOICE
// ========================================

export function disableVoice() {

    voiceEnabled = false;

    window.speechSynthesis.cancel();

}


// ========================================
// TOGGLE VOICE
// ========================================

export function toggleVoice() {

    voiceEnabled = !voiceEnabled;

    if (voiceEnabled) {

        speak(
            "Voice assistant enabled."
        );

    } else {

        window.speechSynthesis.cancel();

    }

    return voiceEnabled;

}


// ========================================
// TRIP START
// ========================================

export function voiceTripStarted() {

    speak(
        "Trip started. I will guide you during your journey."
    );

}


// ========================================
// SPEED ANNOUNCEMENT
// ========================================

export function voiceSpeed(speed) {

    speed = Number(speed) || 0;

    const now = Date.now();

    // Don't speak too frequently
    if (now - lastSpeedTime < 15000) {
        return;
    }

    // Don't repeat almost same speed
    if (
        lastSpokenSpeed !== null &&
        Math.abs(speed - lastSpokenSpeed) < 5
    ) {
        return;
    }

    lastSpokenSpeed = speed;
    lastSpeedTime = now;

    speak(
        `Your current speed is ${speed.toFixed(0)} kilometers per hour.`
    );

}


// ========================================
// GPS ERROR
// ========================================

export function voiceGpsError() {

    speak(
        "GPS signal is unavailable. Please check your location permission."
    );

}


// ========================================
// TRIP FINISHED
// ========================================

export function voiceTripFinished() {

    speak(
        "Trip completed. Your journey has finished."
    );

}


// ========================================
// VOICE STATUS
// ========================================

export function isVoiceEnabled() {

    return voiceEnabled;

}