// firebase-config.mjs
// ES module version. Put this in assets/mjs/
// Exports: app, auth, db, storage

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-storage.js";

// --- REPLACE with your config if needed (you already provided yours) ---
const firebaseConfig = {
  apiKey: "AIzaSyBHMJJwYDwuvBWhmUxaKZs__Nm2NncozVY",
  authDomain: "my-kingdom-43fcf.appspot.com",
  projectId: "my-kingdom-43fcf",
  storageBucket: "my-kingdom-43fcf.appspot.com",
  messagingSenderId: "676513198066",
  appId: "1:676513198066:web:57cb76c9bbad9016c3456b",
  measurementId: "G-72LGJB5M3J"
};

// Initialize the app once (safe to import from multiple modules)
const app = initializeApp(firebaseConfig);

// Analytics is optional — ignore errors on hosts that block it
let analytics;
try {
  analytics = getAnalytics(app);
} catch (e) {
  // ignore
}

// Expose commonly used SDKs
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export named items
export { app, auth, db, storage };