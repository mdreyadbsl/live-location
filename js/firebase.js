
// Firebase App
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

// Realtime Database
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Authentication
import {
  getAuth,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase Configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Database
export const database = getDatabase(app);

// Export Authentication
export const auth = getAuth(app);

// Anonymous Login Function
export async function loginAnonymous() {
  try {
    await signInAnonymously(auth);
    console.log("✅ Firebase Login Success");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
