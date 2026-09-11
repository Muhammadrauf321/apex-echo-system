import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  setDoc 
} from "firebase/firestore";

const firebaseConfig = {
  projectId: "apex-education-forum",
  appId: "1:565567118952:web:a9177956f3b5a1072225dd",
  storageBucket: "apex-education-forum.firebasestorage.app",
  apiKey: "AIzaSyDeEuWXvLcc_QG0kfX7d3y9AQEDdm8g2yk",
  authDomain: "apex-education-forum.firebaseapp.com",
  messagingSenderId: "565567118952"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ADMIN_EMAIL = "muhammadraufbaloch6@gmail.com";
const ADMIN_UID = "lPIJ3zyZoRVVfdLkOck6tYCNICO2";

const ADMIN_USER_DATA = {
  uid: ADMIN_UID,
  name: "Muhammad Rauf",
  email: ADMIN_EMAIL,
  role: "director",
  title: "Executive Director & Founder",
  status: "active",
  isFirstLogin: false,
  avatar: "https://lh3.googleusercontent.com/a/ACg8ocIuFIKbRXt0gvqQsSJB1wp8JMljzM9pM2Pww9XJQTdHEYjiosSygw=s96-c",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

async function clearCollection(colName) {
  try {
    const colRef = collection(db, colName);
    const snapshot = await getDocs(colRef);
    console.log(`[Firestore] Found ${snapshot.size} documents in '${colName}'`);
    const deletePromises = [];
    snapshot.forEach(docSnap => {
      deletePromises.push(deleteDoc(doc(db, colName, docSnap.id)));
    });
    await Promise.all(deletePromises);
    console.log(`[Firestore] Successfully cleared '${colName}' (Deleted: ${snapshot.size})`);
  } catch (err) {
    console.error(`[Firestore] Error clearing collection '${colName}':`, err.message);
  }
}

async function cleanUsersAndSeedAdmin() {
  try {
    const colRef = collection(db, "users");
    const snapshot = await getDocs(colRef);
    console.log(`[Firestore] Found ${snapshot.size} documents in 'users'`);
    
    // Delete any users that are not the single admin
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const email = data.email?.trim().toLowerCase();
      if (email !== ADMIN_EMAIL.toLowerCase()) {
        await deleteDoc(doc(db, "users", docSnap.id));
        console.log(`[Firestore] Deleted non-admin user doc: ${docSnap.id} (${email || "no-email"})`);
      }
    }

    // Set / upsert the single verified Admin document for primary UID
    await setDoc(doc(db, "users", ADMIN_UID), ADMIN_USER_DATA, { merge: true });
    // Also ensure Google Auth UID is updated if present
    const GOOGLE_UID = "y2xVFSxLf6blrdzfcYSm3RQU43j2";
    await setDoc(doc(db, "users", GOOGLE_UID), {
      ...ADMIN_USER_DATA,
      uid: GOOGLE_UID
    }, { merge: true });

    console.log(`[Firestore] Successfully seeded Admin user docs for ${ADMIN_EMAIL}`);
  } catch (err) {
    console.error(`[Firestore] Error processing 'users' collection:`, err.message);
  }
}

async function main() {
  console.log("=== APEX EDUCATION FORUM: CLEAN-SLATE DATABASE WIPE & ADMIN SEED ===");
  console.log(`Target Firebase Project: ${firebaseConfig.projectId}`);
  console.log(`Admin Email: ${ADMIN_EMAIL}`);

  const collectionsToWipe = [
    "courses",
    "teachers",
    "students",
    "batches",
    "certificates",
    "inquiries",
    "invitations",
    "password_resets",
    "channels"
  ];

  for (const col of collectionsToWipe) {
    await clearCollection(col);
  }

  await cleanUsersAndSeedAdmin();

  console.log("\n=== VERIFYING FINAL FIRESTORE STATE ===");
  for (const col of collectionsToWipe) {
    const snap = await getDocs(collection(db, col));
    console.log(`- Collection '${col}': ${snap.size} documents`);
  }
  const usersSnap = await getDocs(collection(db, "users"));
  console.log(`- Collection 'users': ${usersSnap.size} document(s)`);
  usersSnap.forEach(d => {
    const u = d.data();
    console.log(`  -> User: ${u.name} <${u.email}> (${u.role}) - UID: ${d.id}`);
  });

  console.log("\n=== DATABASE WIPE & ADMIN SEED COMPLETED SUCCESSFULLY ===");
  process.exit(0);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
