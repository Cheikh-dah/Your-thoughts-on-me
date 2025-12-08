import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBSAJG3swtXVfvbJN7EbfZYkyDvSoBTnFs",
    authDomain: "youthinksonchd.firebaseapp.com",
    projectId: "youthinksonchd",
    storageBucket: "youthinksonchd.firebasestorage.app",
    messagingSenderId: "414715021378",
    appId: "1:414715021378:web:dda60221727150f9aa45db",
    measurementId: "G-43B06864G0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (may fail in some environments, so wrap in try-catch)
let analytics = null;
try {
    analytics = getAnalytics(app);
} catch (error) {
    console.warn("Analytics initialization failed:", error);
}

export const db = getFirestore(app);
