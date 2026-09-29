import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function cleanLocalData() {
  console.log("\n=======================================================");
  console.log("🧹 CLEANING LOCAL JEWELLERY ERP DATA FOR BACKUP TEST");
  console.log("=======================================================\n");

  try {
    const uri = process.env.MONGO_URI || "";
    const isLocal = uri.includes("localhost") || uri.includes("127.0.0.1");

    if (!isLocal) {
      console.error("\n❌ SAFETY ERROR: MONGO_URI is pointing to a Remote/Production Database!");
      console.error("   This script is locked and CANNOT be run on Production.");
      console.error(`   Target URI: ${uri}`);
      process.exit(1);
    }

    console.log("🔒 SAFETY CHECK PASSED: Verified target database is strictly LOCALHOST (127.0.0.1).");

    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    console.log(`✅ Connected to DB: [${db.databaseName}]`);

    const collections = await db.listCollections().toArray();

    // Clean all collections EXCEPT users (so Superadmin stays logged in)
    let clearedCollectionsCount = 0;
    let totalDocsDeleted = 0;

    for (const col of collections) {
      if (col.name.startsWith("system.")) continue;

      if (col.name === "users") {
        console.log(`🔒 Skipping collection [users] (Preserving Superadmin account)`);
        continue;
      }

      const targetCol = db.collection(col.name);
      const count = await targetCol.countDocuments();
      if (count > 0) {
        await targetCol.deleteMany({});
        console.log(`   🗑️ Cleared [${col.name}] (${count} documents removed)`);
        totalDocsDeleted += count;
      } else {
        console.log(`   - [${col.name}] already empty`);
      }
      clearedCollectionsCount++;
    }

    console.log(`\n✅ Database cleaned! Removed ${totalDocsDeleted} documents across ${clearedCollectionsCount} collections.`);

    // Optional: Clean uploads folder
    const uploadsDir = path.resolve(__dirname, "uploads");
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      let removedFiles = 0;
      files.forEach((file) => {
        const fullPath = path.join(uploadsDir, file);
        // Clean product webp/jpg files (skip subfolders)
        if (fs.statSync(fullPath).isFile()) {
          fs.unlinkSync(fullPath);
          removedFiles++;
        }
      });
      console.log(`✅ Cleaned ${removedFiles} images from uploads/ directory.`);
    }

    console.log("\n=======================================================");
    console.log("🎉 SYSTEM IS NOW FRESH & EMPTY!");
    console.log("👉 Now go to ERP browser -> Dashboard / Products (verify it's 0)");
    console.log("👉 Then go to /admin/backup -> Upload your backup .zip -> Restore!");
    console.log("=======================================================\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to clean data:", err);
    process.exit(1);
  }
}

cleanLocalData();
