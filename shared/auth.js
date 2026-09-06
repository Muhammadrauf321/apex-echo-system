import { DEMO_USERS } from "./seedData.js";
import { auth, db } from "./firebaseConfig.js";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const CURRENT_USER_KEY = "apex_current_user";

// Load initial user from localStorage or default to Director
export function getCurrentUser() {
  const saved = localStorage.getItem(CURRENT_USER_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Error parsing saved user:", e);
    }
  }
  // Default to Director so the user has full preview access immediately
  return DEMO_USERS[0];
}

// Set current user (for demo switching or after real login)
export function setCurrentUser(user) {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
  } else {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
  // Notify all listeners
  window.dispatchEvent(new CustomEvent("apex_auth_changed", { detail: user }));
}

// Switch between demo accounts instantly
export function switchDemoUser(uid) {
  const target = DEMO_USERS.find(u => u.uid === uid);
  if (target) {
    setCurrentUser(target);
    return target;
  }
  return null;
}

// Real Firebase Auth listener
export function subscribeToAuth(callback) {
  // 1. Initial callback with local state
  callback(getCurrentUser());

  // 2. Listen to custom event for demo user switches
  const handleCustomAuth = (e) => {
    callback(e.detail);
  };
  window.addEventListener("apex_auth_changed", handleCustomAuth);

  // 3. Listen to real Firebase Auth
  const unsubscribeFb = onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      try {
        const userDocRef = doc(db, "users", fbUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const profile = userSnap.data();
          setCurrentUser(profile);
          callback(profile);
        } else {
          const basicProfile = {
            uid: fbUser.uid,
            name: fbUser.displayName || fbUser.email.split("@")[0],
            email: fbUser.email,
            role: "student",
            avatar: fbUser.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
          };
          await setDoc(userDocRef, basicProfile);
          setCurrentUser(basicProfile);
          callback(basicProfile);
        }
      } catch (err) {
        console.warn("Firestore user sync warning:", err);
      }
    }
  });

  return () => {
    window.removeEventListener("apex_auth_changed", handleCustomAuth);
    unsubscribeFb();
  };
}

// Real Sign In with Firebase
export async function loginWithEmail(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const userDocRef = doc(db, "users", cred.user.uid);
    const userSnap = await getDoc(userDocRef);
    let profile = {
      uid: cred.user.uid,
      email: cred.user.email,
      name: cred.user.displayName || email.split("@")[0],
      role: "student"
    };
    if (userSnap.exists()) {
      profile = userSnap.data();
    }
    setCurrentUser(profile);
    return { success: true, user: profile };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Sign Out
export async function logout() {
  try {
    await fbSignOut(auth);
  } catch (e) {
    // Ignore if not signed in via FB
  }
  // Reset to guest / first demo
  setCurrentUser(null);
  return { success: true };
}
