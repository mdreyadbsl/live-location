import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getDatabase
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
    getAuth,
    signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {

    apiKey: "AIzaSyC_iYK2KfWtLqDy2rcGeyWR6M1RfGosGpw",
    authDomain: "my-mobile-live-location.firebaseapp.com",
    databaseURL: "https://my-mobile-live-location-default-rtdb.firebaseio.com",
    projectId: "my-mobile-live-location",
    storageBucket: "my-mobile-live-location.firebasestorage.app",
    messagingSenderId: "1001346063788",
    appId: "1:1001346063788:web:7c4f0d45b03bf2d6b86e09",
    measurementId: "G-E40PJX034X"

};

const app = initializeApp(firebaseConfig);

export const database = getDatabase(app);

const auth = getAuth(app);

export async function loginAnonymous() {

    try {

        await signInAnonymously(auth);

        console.log("✅ Firebase Connected");

        return true;

    } catch (error) {

        console.error("Firebase Login Failed", error);

        return false;

    }

}