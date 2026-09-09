import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export const firebaseConfig = {
  projectId: "apex-education-forum",
  appId: "1:565567118952:web:a9177956f3b5a1072225dd",
  storageBucket: "apex-education-forum.firebasestorage.app",
  apiKey: "AIzaSyDeEuWXvLcc_QG0kfX7d3y9AQEDdm8g2yk",
  authDomain: "apex-education-forum.firebaseapp.com",
  messagingSenderId: "565567118952",
  measurementId: "G-K905LZVESC",
  googleClientId: "565567118952-fab5ktqn3n9ruk53930pkgbu3cdrccsh.apps.googleusercontent.com"
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default { app, auth, db, storage, firebaseConfig };
