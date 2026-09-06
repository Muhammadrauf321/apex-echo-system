import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export const firebaseConfig = {
  apiKey: "AIzaSyA6zw52EVPzuS4TbsqmYfhvEv3LI-S6pJM",
  authDomain: "apex-echo-system.firebaseapp.com",
  projectId: "apex-echo-system",
  storageBucket: "apex-echo-system.firebasestorage.app",
  messagingSenderId: "435515195879",
  appId: "1:435515195879:web:ca2a63f06ebb82da90bd42"
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default { app, auth, db, storage, firebaseConfig };
