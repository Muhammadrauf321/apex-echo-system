import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const targetDir = path.join(rootDir, "dist-unified");

// Paths to app builds
const websiteDist = path.join(rootDir, "apps", "website", "dist");
const messagingDist = path.join(rootDir, "apps", "messaging-app", "dist");
const managementDist = path.join(rootDir, "apps", "management-system", "dist");

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`Source directory does not exist: ${src}`);
    process.exit(1);
  }
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log("🚀 Assembling Unified Web Deployment Bundle...");

// 1. Clean destination
if (fs.existsSync(targetDir)) {
  fs.rmSync(targetDir, { recursive: true, force: true });
}
fs.mkdirSync(targetDir, { recursive: true });

// 2. Copy Website to root (/)
console.log("📦 Packaging Website to / ...");
copyDirSync(websiteDist, targetDir);

// 3. Copy Apex Connect to /connect/
console.log("💬 Packaging Apex Connect to /connect/ ...");
copyDirSync(messagingDist, path.join(targetDir, "connect"));

// 4. Copy Management LMS to /lms/
console.log("📊 Packaging Management LMS to /lms/ ...");
copyDirSync(managementDist, path.join(targetDir, "lms"));

console.log("✅ Unified Bundle Ready in ./dist-unified!");
