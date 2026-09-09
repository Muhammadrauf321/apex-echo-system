import { ADMIN_USER } from "./seedData.js";
import { auth, db } from "./firebaseConfig.js";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const CURRENT_USER_KEY = "apex_current_user";

// Load initial user from localStorage or default to the verified Admin account
export function getCurrentUser() {
  const saved = localStorage.getItem(CURRENT_USER_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.uid) return parsed;
    } catch (e) {
      console.error("Error parsing saved user:", e);
    }
  }
  // Default strictly to the verified Admin identity
  return ADMIN_USER;
}

// Set current user
export function setCurrentUser(user) {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
  } else {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
  // Notify all listeners
  window.dispatchEvent(new CustomEvent("apex_auth_changed", { detail: user }));
}

// Real Firebase Auth listener
export function subscribeToAuth(callback) {
  // 1. Initial callback with local state
  callback(getCurrentUser());

  // 2. Listen to custom event for auth changes
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
        let profile = null;
        if (userSnap.exists()) {
          profile = userSnap.data();
        } else {
          // If this is Muhammad Rauf's email, give Director/Admin role
          const isAdminEmail = fbUser.email === "muhammadraufbaloch6@gmail.com" || fbUser.email === ADMIN_USER.email;
          profile = {
            uid: fbUser.uid,
            name: fbUser.displayName || fbUser.email.split("@")[0],
            email: fbUser.email,
            role: isAdminEmail ? "director" : "student",
            avatar: fbUser.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
          };
          try {
            await setDoc(userDocRef, profile);
          } catch (e) {
            // Ignore if firestore rules prevent writing unauthenticated
          }
        }
        setCurrentUser(profile);
        callback(profile);
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
    const isAdminEmail = cred.user.email === "muhammadraufbaloch6@gmail.com" || cred.user.email === ADMIN_USER.email;
    let profile = {
      uid: cred.user.uid,
      email: cred.user.email,
      name: cred.user.displayName || email.split("@")[0],
      role: isAdminEmail ? "director" : "student"
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
    // Ignore
  }
  setCurrentUser(null);
  return { success: true };
}
