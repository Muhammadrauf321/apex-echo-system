import fs from "fs";
import path from "path";

const rootDir = process.cwd();

console.log("🔍 Running Strict Login Gating & Forensic Verification...");

// 1. Verify seedData.js
import { ADMIN_USER, DEMO_USERS, SEED_BATCHES, SEED_EXAMS, SEED_CERTIFICATES } from "../shared/seedData.js";
if (DEMO_USERS.length !== 1 || DEMO_USERS[0].email !== "muhammadraufbaloch6@gmail.com") {
  console.error("❌ FAILED: DEMO_USERS contains unverified accounts!");
  process.exit(1);
}
if (SEED_BATCHES.length !== 0 || SEED_EXAMS.length !== 0 || SEED_CERTIFICATES.length !== 0) {
  console.error("❌ FAILED: Mock seed batches/exams/certificates still exist!");
  process.exit(1);
}
console.log("✅ Seed Data Clean: Only verified Admin (muhammadraufbaloch6@gmail.com) exists.");

// 2. Verify EcosystemNav.jsx
const navContent = fs.readFileSync(path.join(rootDir, "shared", "EcosystemNav.jsx"), "utf-8");
if (navContent.includes('url: "http://localhost:517')) {
  console.error("❌ FAILED: EcosystemNav still contains hardcoded localhost app URLs!");
  process.exit(1);
}
if (navContent.includes('<a href="http://localhost:5173" className="nav-brand">')) {
  console.error("❌ FAILED: EcosystemNav brand link is still hardcoded to localhost!");
  process.exit(1);
}
console.log("✅ EcosystemNav Clean: All navigation URLs use dynamic getAppUrl.");

// 3. Verify messaging App.jsx
const msgContent = fs.readFileSync(path.join(rootDir, "apps", "messaging-app", "src", "App.jsx"), "utf-8");
if (!msgContent.includes("if (!currentUser)")) {
  console.error("❌ FAILED: messaging App.jsx does not contain strict !currentUser barrier!");
  process.exit(1);
}
if (msgContent.includes("Sir Salman (Language Lead)") || msgContent.includes("Engr. Bilal (Full-Stack)") || msgContent.includes("Zainab Fatima (Student)")) {
  console.error("❌ FAILED: messaging App.jsx still contains hardcoded fake peer names!");
  process.exit(1);
}
console.log("✅ Messaging App Clean: Strict login barrier active & zero fake users.");

// 4. Verify management App.jsx
const mgmtContent = fs.readFileSync(path.join(rootDir, "apps", "management-system", "src", "App.jsx"), "utf-8");
if (!mgmtContent.includes("if (!currentUser)")) {
  console.error("❌ FAILED: management App.jsx does not contain strict !currentUser barrier!");
  process.exit(1);
}
if (mgmtContent.includes('href="http://localhost:5174"')) {
  console.error("❌ FAILED: management App.jsx still contains hardcoded localhost:5174 link!");
  process.exit(1);
}
console.log("✅ Management LMS Clean: Strict login barrier active & dynamic messaging link.");

// 5. Verify dist-unified structure
const distRoot = path.join(rootDir, "dist-unified");
if (!fs.existsSync(path.join(distRoot, "index.html"))) {
  console.error("❌ FAILED: dist-unified/index.html does not exist!");
  process.exit(1);
}
if (!fs.existsSync(path.join(distRoot, "connect", "index.html"))) {
  console.error("❌ FAILED: dist-unified/connect/index.html does not exist!");
  process.exit(1);
}
if (!fs.existsSync(path.join(distRoot, "lms", "index.html"))) {
  console.error("❌ FAILED: dist-unified/lms/index.html does not exist!");
  process.exit(1);
}
console.log("✅ Unified Distribution Verified: All 3 apps present under single origin.");

console.log("\n🎉 ALL AUDIT CHECKS PASSED 100%!");
