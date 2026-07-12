const firebaseConfig = {
    apiKey: "AIzaSyDmV8kDK7YZk-lxPwwDG2drrjybylwenWE",
    authDomain: "fci-lms.firebaseapp.com",
    projectId: "fci-lms",
    storageBucket: "fci-lms.firebasestorage.app",
    messagingSenderId: "180801083177",
    appId: "1:180801083177:web:2a56c4a8b096f993420938",
    measurementId: "G-9R91N0CDCG"
};

// Initialize Firebase using Compat SDK
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Make globally available
window.FirebaseAuth = auth;
window.FirebaseDB = db;

console.log("🔥 Firebase Initialized (Compat)");
