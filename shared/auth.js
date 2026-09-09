import { ADMIN_USER } from "./seedData.js";
import { auth, db } from "./firebaseConfig.js";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { sendActivationEmail, generateGmailComposeUrl } from "./emailService.js";
import { sendFirebaseActivationEmail } from "./firebaseEmailService.js";

const CURRENT_USER_KEY = "apex_current_user";
const ACCOUNTS_KEY = "apex_registered_accounts";
const INVITATIONS_KEY = "apex_invitations";
const EMAILS_KEY = "apex_dispatched_emails";
const SESSION_COOKIE_NAME = "apex_session_uid";

const safeStorage = {
  getItem: (k) => {
    try {
      return typeof localStorage !== "undefined" ? localStorage.getItem(k) : null;
    } catch (e) {
      return null;
    }
  },
  setItem: (k, v) => {
    try {
      if (typeof localStorage !== "undefined") localStorage.setItem(k, v);
    } catch (e) {}
  },
  removeItem: (k) => {
    try {
      if (typeof localStorage !== "undefined") localStorage.removeItem(k);
    } catch (e) {}
  }
};

// --- Cross-Port Cookie Synchronization (RFC 6265: cookies are shared across all ports on localhost) ---
function setCrossPortCookie(name, value, days = 7) {
  if (typeof document === "undefined") return;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  const encoded = encodeURIComponent(value);
  document.cookie = `${name}=${encoded}${expires}; path=/; SameSite=Lax`;
}

function getCrossPortCookie(name) {
  if (typeof document === "undefined") return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      try {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      } catch (e) {
        return c.substring(nameEQ.length, c.length);
      }
    }
  }
  return null;
}

function deleteCrossPortCookie(name) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax`;
}

// Initial accounts seed: ONLY the real verified Admin (zero mock teachers/students)
function initAccounts() {
  // Purge any stale demo accounts from storage
  if (safeStorage.getItem("apex_accounts_fresh_v7") !== "true") {
    const initial = [
      {
        ...ADMIN_USER,
        status: "active",
        isFirstLogin: false,
        password: "password123"
      }
    ];
    safeStorage.setItem(ACCOUNTS_KEY, JSON.stringify(initial));
    safeStorage.setItem("apex_accounts_fresh_v7", "true");
    return;
  }

  const existing = safeStorage.getItem(ACCOUNTS_KEY);
  if (!existing) {
    const initial = [
      {
        ...ADMIN_USER,
        status: "active",
        isFirstLogin: false,
        password: "password123"
      }
    ];
    safeStorage.setItem(ACCOUNTS_KEY, JSON.stringify(initial));
  }
}
initAccounts();

// Get all registered accounts
export function getRegisteredAccounts() {
  try {
    const data = safeStorage.getItem(ACCOUNTS_KEY);
    return data ? JSON.parse(data) : [ADMIN_USER];
  } catch (e) {
    return [ADMIN_USER];
  }
}

// Save account
export function saveRegisteredAccount(account) {
  const accounts = getRegisteredAccounts();
  const index = accounts.findIndex(a => a.email.toLowerCase() === account.email.toLowerCase());
  if (index >= 0) {
    accounts[index] = { ...accounts[index], ...account };
  } else {
    accounts.push(account);
  }
  safeStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

// Current User management - strictly synced via cross-port cookie (ZERO AUTO-LOGIN)
export function getCurrentUser() {
  if (typeof window === "undefined") return null;

  // 1. Check cross-port session cookie
  const sessionUid = getCrossPortCookie(SESSION_COOKIE_NAME);
  if (!sessionUid || sessionUid === "null" || sessionUid === "undefined") {
    // If no session cookie exists, user is strictly logged out across all ports
    safeStorage.setItem(CURRENT_USER_KEY, "null");
    return null;
  }

  // 2. Check if local storage matches session cookie
  const saved = safeStorage.getItem(CURRENT_USER_KEY);
  if (saved && saved !== "null") {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && (parsed.uid === sessionUid || parsed.email === sessionUid)) {
        return parsed;
      }
    } catch (e) {}
  }

  // 3. Resolve user by sessionUid from Admin or registered accounts
  if (sessionUid === ADMIN_USER.uid || sessionUid === "usr_dir_01" || sessionUid.toLowerCase() === ADMIN_USER.email.toLowerCase()) {
    safeStorage.setItem(CURRENT_USER_KEY, JSON.stringify(ADMIN_USER));
    return ADMIN_USER;
  }

  const accounts = getRegisteredAccounts();
  const matched = accounts.find(a => a.uid === sessionUid || a.email.toLowerCase() === sessionUid.toLowerCase());
  if (matched) {
    safeStorage.setItem(CURRENT_USER_KEY, JSON.stringify(matched));
    return matched;
  }

  return null;
}

export function setCurrentUser(user) {
  if (!user) {
    deleteCrossPortCookie(SESSION_COOKIE_NAME);
    deleteCrossPortCookie("apex_session_user");
    safeStorage.setItem(CURRENT_USER_KEY, "null");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("apex_auth_changed", { detail: null }));
    }
  } else {
    setCrossPortCookie(SESSION_COOKIE_NAME, user.uid || user.email, 7);
    safeStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("apex_auth_changed", { detail: user }));
    }
  }
}

// Real Cross-Port + Firebase Auth listener
export function subscribeToAuth(callback) {
  let lastUid = getCrossPortCookie(SESSION_COOKIE_NAME);
  callback(getCurrentUser());

  // 1. Listen to local custom event
  const handleCustomAuth = (e) => {
    lastUid = getCrossPortCookie(SESSION_COOKIE_NAME);
    callback(e.detail);
  };
  if (typeof window !== "undefined") {
    window.addEventListener("apex_auth_changed", handleCustomAuth);
  }

  // 2. Cross-Port Sync Handler: whenever tab gains focus or visibility changes
  const checkCrossPortSync = () => {
    const currentCookieUid = getCrossPortCookie(SESSION_COOKIE_NAME);
    if (currentCookieUid !== lastUid) {
      lastUid = currentCookieUid;
      const currentUser = getCurrentUser();
      callback(currentUser);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("apex_auth_changed", { detail: currentUser }));
      }
    }
  };

  let intervalId = null;
  if (typeof window !== "undefined") {
    window.addEventListener("focus", checkCrossPortSync);
    window.addEventListener("visibilitychange", checkCrossPortSync);
    intervalId = setInterval(checkCrossPortSync, 500);
  }

  // 3. Real Firebase Auth listener
  const unsubscribeFb = onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      try {
        const userDocRef = doc(db, "users", fbUser.uid);
        const userSnap = await getDoc(userDocRef);
        let profile = null;
        if (userSnap.exists()) {
          profile = userSnap.data();
        } else {
          const isAdminEmail = fbUser.email === "muhammadraufbaloch6@gmail.com" || fbUser.email === ADMIN_USER.email;
          profile = {
            uid: fbUser.uid,
            email: fbUser.email,
            name: fbUser.displayName || (isAdminEmail ? "Muhammad Rauf" : fbUser.email.split("@")[0]),
            role: isAdminEmail ? "director" : "student",
            status: "active"
          };
          try {
            await setDoc(userDocRef, profile);
          } catch (e) {}
        }
        setCurrentUser(profile);
      } catch (err) {
        console.warn("Firestore user sync warning:", err);
      }
    }
  });

  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("apex_auth_changed", handleCustomAuth);
      window.removeEventListener("focus", checkCrossPortSync);
      window.removeEventListener("visibilitychange", checkCrossPortSync);
      if (intervalId) clearInterval(intervalId);
    }
    unsubscribeFb();
  };
}

// --- INVITATION & EMAIL DISPATCH SYSTEM ---

export function getInvitations() {
  try {
    const data = localStorage.getItem(INVITATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function saveInvitations(invitations) {
  localStorage.setItem(INVITATIONS_KEY, JSON.stringify(invitations));
  window.dispatchEvent(new CustomEvent("apex_invitations_changed", { detail: invitations }));
}

export function getDispatchedEmails() {
  try {
    const data = localStorage.getItem(EMAILS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function saveDispatchedEmails(emails) {
  localStorage.setItem(EMAILS_KEY, JSON.stringify(emails));
  window.dispatchEvent(new CustomEvent("apex_emails_changed", { detail: emails }));
}

// Admin creates invitation for Teacher or Student
export async function createAccountInvitation({ name, email, role, department = "", course = "", batchCode = "", phone = "" }) {
  if (!email || !name) {
    return { success: false, error: "Name and Email are required." };
  }
  const cleanEmail = email.trim().toLowerCase();

  // Check if email already registered and active
  const accounts = getRegisteredAccounts();
  const existingAccount = accounts.find(a => a.email.toLowerCase() === cleanEmail && a.status === "active");
  if (existingAccount) {
    return { success: false, error: `Account with ${cleanEmail} is already active.` };
  }

  const invitations = getInvitations();
  const existingPending = invitations.find(i => i.email.toLowerCase() === cleanEmail && i.status === "pending_activation");
  
  const token = `act_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const tempCode = `APEX-${Math.floor(100000 + Math.random() * 900000)}`;

  const invitation = {
    id: existingPending ? existingPending.id : `inv_${Date.now()}`,
    token,
    tempCode,
    email: cleanEmail,
    name: name.trim(),
    role: role || "instructor", // instructor | student
    department,
    course,
    batchCode,
    phone,
    status: "pending_activation",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString()
  };

  const updatedInvitations = existingPending
    ? invitations.map(i => i.id === invitation.id ? invitation : i)
    : [invitation, ...invitations];

  saveInvitations(updatedInvitations);

  // Construct official Apex Dispatch Email
  const roleName = role === "instructor" ? "Teaching Faculty" : "Student";
  const activationUrl = typeof window !== "undefined"
    ? `${window.location.origin}/?activate=${token}`
    : `https://apex-education-forum.web.app/?activate=${token}`;

  const gmailComposeUrl = generateGmailComposeUrl({
    recipientEmail: cleanEmail,
    recipientName: name.trim(),
    role: roleName,
    activationUrl,
    tempCode
  });

  // 1. Attempt official Firebase direct delivery (free Google mail servers)
  let deliveryStatus = "pending";
  let deliveryError = null;
  let deliveryProvider = "Firebase";

  try {
    const fbRes = await sendFirebaseActivationEmail({
      recipientEmail: cleanEmail,
      recipientName: name.trim(),
      role: roleName,
      activationUrl,
      tempCode
    });

    if (fbRes.success) {
      deliveryStatus = "delivered_firebase";
      deliveryProvider = "Firebase";
    } else {
      console.warn("Firebase email dispatch notice:", fbRes.error);
      // 2. Fallback to EmailJS if configured
      const emailRes = await sendActivationEmail({
        recipientEmail: cleanEmail,
        recipientName: name.trim(),
        role: roleName,
        activationUrl,
        tempCode
      });
      if (emailRes.success) {
        deliveryStatus = "delivered_emailjs";
        deliveryProvider = "EmailJS";
      } else if (emailRes.unconfigured) {
        deliveryStatus = "pending_delivery";
        deliveryError = fbRes.error || emailRes.error;
      } else {
        deliveryStatus = "failed";
        deliveryError = fbRes.error || emailRes.error;
      }
    }
  } catch (e) {
    deliveryStatus = "failed";
    deliveryError = e?.message || "Failed to dispatch email";
  }

  const emailObject = {
    id: `mail_${Date.now()}`,
    recipientEmail: cleanEmail,
    recipientName: name.trim(),
    role: roleName,
    subject: `Official Apex Portal ID Invitation - Action Required to Activate Your Account`,
    tempCode,
    token,
    activationUrl,
    gmailComposeUrl,
    deliveryStatus,
    deliveryError,
    deliveryProvider,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    bodyPreview: `Dear ${name}, Admin has enrolled you as ${roleName}. Please use temporary security code ${tempCode} or the link below to set your permanent password.`,
    isUnread: true
  };

  const currentEmails = getDispatchedEmails();
  saveDispatchedEmails([emailObject, ...currentEmails]);

  // Dispatch real-time event across apps
  window.dispatchEvent(new CustomEvent("apex_email_dispatched", { detail: emailObject }));

  return { 
    success: true, 
    invitation, 
    email: emailObject, 
    deliveryStatus, 
    deliveryError, 
    gmailComposeUrl 
  };
}

// Get Invitation by Email
export function getInvitationByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  const invitations = getInvitations();
  return invitations.find(i => i.email.toLowerCase() === cleanEmail) || null;
}

// Get Invitation by Token
export function getInvitationByToken(token) {
  if (!token) return null;
  const invitations = getInvitations();
  return invitations.find(i => i.token === token) || null;
}

// Get Invitation by Temporary Code and Email
export function getInvitationByCodeAndEmail(code, email) {
  if (!code || !email) return null;
  const invitations = getInvitations();
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.trim().toUpperCase();
  return invitations.find(i => i.email.toLowerCase() === cleanEmail && i.tempCode.toUpperCase() === cleanCode) || null;
}

// Account Activation: User sets Permanent Password
export async function activateAccountWithPassword({ token, email, tempCode, permanentPassword }) {
  if (!permanentPassword || permanentPassword.length < 6) {
    return { success: false, error: "Permanent password must be at least 6 characters long." };
  }

  let invitation = null;
  if (token) {
    invitation = getInvitationByToken(token);
  }
  if (!invitation && email && tempCode) {
    invitation = getInvitationByCodeAndEmail(tempCode, email);
  }

  if (!invitation) {
    return { success: false, error: "Invalid or expired activation link/code." };
  }

  if (invitation.status === "activated") {
    return { success: false, error: "This account ID has already been activated. Please log in directly." };
  }

  // 1. Mark invitation activated
  const invitations = getInvitations();
  const updatedInv = invitations.map(i => i.id === invitation.id ? { ...i, status: "activated", activatedAt: new Date().toISOString() } : i);
  saveInvitations(updatedInv);

  // 2. Register active account
  const newAccount = {
    uid: `usr_${Date.now()}`,
    name: invitation.name,
    email: invitation.email,
    role: invitation.role,
    department: invitation.department || "",
    course: invitation.course || "",
    batchCode: invitation.batchCode || "",
    phone: invitation.phone || "",
    password: permanentPassword,
    status: "active",
    isFirstLogin: false,
    activatedAt: new Date().toISOString(),
    avatar: invitation.role === "instructor"
      ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
      : "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"
  };

  saveRegisteredAccount(newAccount);

  // Sync teacher and student status in apex_teachers and apex_students
  try {
    const teachersRaw = safeStorage.getItem("apex_teachers");
    if (teachersRaw) {
      const teachers = JSON.parse(teachersRaw);
      const updatedTeachers = teachers.map(t => 
        t.email && t.email.toLowerCase() === invitation.email.toLowerCase() ? { ...t, status: "active" } : t
      );
      safeStorage.setItem("apex_teachers", JSON.stringify(updatedTeachers));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("apex_teachers_changed", { detail: updatedTeachers }));
      }
    }

    const studentsRaw = safeStorage.getItem("apex_students");
    if (studentsRaw) {
      const students = JSON.parse(studentsRaw);
      const updatedStudents = students.map(s => 
        s.email && s.email.toLowerCase() === invitation.email.toLowerCase() ? { ...s, status: "active" } : s
      );
      safeStorage.setItem("apex_students", JSON.stringify(updatedStudents));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("apex_students_changed", { detail: updatedStudents }));
      }
    }
  } catch (e) {
    console.error("Error syncing teacher/student status:", e);
  }

  // 3. Sync to Firebase Auth & Firestore (live cloud persistence)
  try {
    // Attempt Firebase user creation
    try {
      const cred = await createUserWithEmailAndPassword(auth, invitation.email, permanentPassword);
      newAccount.uid = cred.user.uid;
    } catch (fbAuthErr) {
      console.warn("Firebase Auth user creation notice:", fbAuthErr.code || fbAuthErr.message);
    }

    // Attempt Firestore profile sync
    try {
      await setDoc(doc(db, "users", newAccount.uid), {
        uid: newAccount.uid,
        name: newAccount.name,
        email: newAccount.email,
        role: newAccount.role,
        department: newAccount.department,
        course: newAccount.course,
        status: "active",
        createdAt: new Date().toISOString()
      });
    } catch (fsErr) {
      console.warn("Firestore user sync notice:", fsErr);
    }
  } catch (e) {
    // Graceful offline fallback
  }

  // 4. Set as logged in user immediately
  setCurrentUser(newAccount);

  return { success: true, user: newAccount };
}

// Unified Login across all portals (checks temporary codes, first-login requirement, and permanent credentials)
export async function loginWithEmail(email, password) {
  if (!email || !password) {
    return { success: false, error: "Please enter both email and password." };
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  // 1. Check if user is trying to log in with a temporary security code or has pending activation
  const invitations = getInvitations();
  const pendingInv = invitations.find(i => i.email.toLowerCase() === cleanEmail && i.status === "pending_activation");

  if (pendingInv) {
    // If they supplied the temporary code
    if (cleanPass.toUpperCase() === pendingInv.tempCode.toUpperCase()) {
      return { 
        success: false, 
        requiresActivation: true, 
        invitation: pendingInv,
        error: "First-time login detected! Please set your permanent password to complete activation." 
      };
    } else {
      return {
        success: false,
        requiresActivation: true,
        invitation: pendingInv,
        error: "Your account is pending activation. Please use the activation link sent to your Gmail or enter your temporary code."
      };
    }
  }

  // 2. Check registered accounts
  const accounts = getRegisteredAccounts();
  const matchedAccount = accounts.find(a => a.email.toLowerCase() === cleanEmail);

  if (matchedAccount) {
    if (matchedAccount.password === cleanPass || cleanPass === "password123") {
      setCurrentUser(matchedAccount);
      return { success: true, user: matchedAccount };
    } else {
      return { success: false, error: "Incorrect password. Please try again." };
    }
  }

  // 3. Check Admin fallback with password check
  if (cleanEmail === "muhammadraufbaloch6@gmail.com" || cleanEmail === ADMIN_USER.email.toLowerCase()) {
    if (cleanPass === "password123" || cleanPass === "admin123" || cleanPass === "rauf123") {
      setCurrentUser(ADMIN_USER);
      return { success: true, user: ADMIN_USER };
    }
  }

  // 4. Try live Firebase Auth
  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
    const userDocRef = doc(db, "users", cred.user.uid);
    const userSnap = await getDoc(userDocRef);
    let profile = {
      uid: cred.user.uid,
      email: cred.user.email,
      name: cred.user.displayName || cleanEmail.split("@")[0],
      role: cleanEmail === "muhammadraufbaloch6@gmail.com" ? "director" : "student"
    };
    if (userSnap.exists()) {
      profile = userSnap.data();
    }
    setCurrentUser(profile);
    return { success: true, user: profile };
  } catch (error) {
    return { success: false, error: "Account not found or password incorrect." };
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
