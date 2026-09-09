import { firebaseConfig } from "./firebaseConfig.js";

/**
 * Dispatches an official activation email automatically and directly from Google Firebase servers.
 * Pure background delivery — no user popups, no manual Gmail compose windows required.
 */
export async function sendFirebaseActivationEmail({ recipientEmail, recipientName, role, activationUrl, tempCode }) {
  if (!recipientEmail) {
    return { success: false, error: "Recipient email is required." };
  }

  const cleanEmail = recipientEmail.trim().toLowerCase();
  const apiKey = firebaseConfig.apiKey;

  if (!apiKey) {
    return { success: false, error: "Firebase API Key is missing." };
  }

  const redirectUrl = activationUrl || `https://apex-education-forum.web.app/?activate=${tempCode}&email=${encodeURIComponent(cleanEmail)}`;

  try {
    // 1. Call Google Firebase Identity Toolkit sendOobCode endpoint directly
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        requestType: "PASSWORD_RESET",
        email: cleanEmail,
        continueUrl: redirectUrl
      })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      const errorMsg = data?.error?.message || "Firebase dispatch failed";
      
      if (errorMsg === "OPERATION_NOT_ALLOWED" || errorMsg === "PASSWORD_LOGIN_DISABLED") {
        return {
          success: false,
          code: "PROVIDER_DISABLED",
          error: "Firebase Email provider is disabled. Enable 'Email/Password' in Firebase Console > Authentication > Sign-in method."
        };
      }

      // Try without continueUrl if continueUrl domain check was triggered
      const retryResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: "PASSWORD_RESET",
          email: cleanEmail
        })
      });
      const retryData = await retryResponse.json();

      if (retryResponse.ok && retryData.email) {
        return {
          success: true,
          method: "firebase_automated_oob",
          sender: "Google Firebase (noreply@apex-education-forum.firebaseapp.com)",
          message: `Official activation email sent automatically to ${cleanEmail} via Google Firebase.`
        };
      }

      return {
        success: false,
        error: retryData?.error?.message || errorMsg
      };
    }

    return {
      success: true,
      method: "firebase_automated_oob",
      sender: "Google Firebase (noreply@apex-education-forum.firebaseapp.com)",
      message: `Official activation email sent automatically to ${cleanEmail} via Google Firebase.`
    };
  } catch (err) {
    console.error("Automated Firebase email error:", err);
    return {
      success: false,
      error: err.message || "Network error communicating with Google Firebase."
    };
  }
}
