import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  sendSignInLinkToEmail, 
  sendPasswordResetEmail, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { firebaseConfig } from "./firebaseConfig.js";

// Dedicated secondary Firebase app so inviting users never overwrites or interferes with the logged-in Admin session
let secondaryAuthApp = null;

function getSecondaryAuth() {
  if (typeof window === "undefined") return null;
  try {
    if (!secondaryAuthApp) {
      const existing = getApps().find(a => a.name === "ApexSecondaryAuth");
      secondaryAuthApp = existing || initializeApp(firebaseConfig, "ApexSecondaryAuth");
    }
    return getAuth(secondaryAuthApp);
  } catch (e) {
    console.warn("Could not initialize secondary Firebase auth app:", e);
    return null;
  }
}

/**
 * Dispatches an official activation email directly from Google Firebase Authentication servers.
 * Free Spark plan supported, zero third-party API keys required.
 */
export async function sendFirebaseActivationEmail({ recipientEmail, recipientName, role, activationUrl, tempCode }) {
  if (!recipientEmail) {
    return { success: false, error: "Recipient email is required." };
  }

  const cleanEmail = recipientEmail.trim().toLowerCase();
  const authInstance = getSecondaryAuth();

  if (!authInstance) {
    return { success: false, error: "Firebase Authentication instance is not available." };
  }

  const redirectUrl = activationUrl || `https://apex-education-forum.web.app/?email=${encodeURIComponent(cleanEmail)}`;

  const actionCodeSettings = {
    url: redirectUrl,
    handleCodeInApp: true
  };

  // 1. Ensure user exists in Firebase Auth so Google can dispatch the password reset / account activation email
  const tempInitialKey = `Apex#${Math.floor(100000 + Math.random() * 900000)}!Init`;
  try {
    await createUserWithEmailAndPassword(authInstance, cleanEmail, tempInitialKey);
  } catch (createErr) {
    // If auth/email-already-in-use, that's fine - account exists and we can proceed to send
    if (createErr.code !== "auth/email-already-in-use") {
      console.warn("Firebase user provision note:", createErr.code, createErr.message);
    }
  }

  // 2. Primary Firebase Method: sendPasswordResetEmail
  // Google sends an official email from noreply@apex-education-forum.firebaseapp.com
  try {
    await sendPasswordResetEmail(authInstance, cleanEmail, actionCodeSettings);
    return {
      success: true,
      method: "firebase_password_reset",
      sender: "Google Firebase (noreply@apex-education-forum.firebaseapp.com)",
      message: `Official activation email sent directly to ${cleanEmail} via Google Firebase.`
    };
  } catch (resetErr) {
    console.warn("sendPasswordResetEmail failed, attempting sendSignInLinkToEmail:", resetErr.code, resetErr.message);

    // 3. Fallback Firebase Method: sendSignInLinkToEmail (Passwordless magic link)
    try {
      await sendSignInLinkToEmail(authInstance, cleanEmail, actionCodeSettings);
      return {
        success: true,
        method: "firebase_signin_link",
        sender: "Google Firebase (noreply@apex-education-forum.firebaseapp.com)",
        message: `Sign-in activation link sent directly to ${cleanEmail} via Google Firebase.`
      };
    } catch (linkErr) {
      console.error("Firebase direct email dispatch error:", linkErr.code, linkErr.message);
      return {
        success: false,
        error: linkErr.message || resetErr.message || "Firebase failed to dispatch email."
      };
    }
  }
}
