import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import multer from "multer";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.resolve(__dirname, "../uploads");
const BACKUPS_DIR = path.resolve(__dirname, "../backups");
const TEMP_DIR = path.resolve(__dirname, "../temp/backups");

// Ensure directories exist
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

// Multer storage for backup zip upload (disk storage for large file safety)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
    }
    cb(null, TEMP_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `restore-${Date.now()}-${file.originalname}`);
  },
});

export const uploadBackupZip = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
  fileFilter: (req, file, cb) => {
    const isZip =
      file.mimetype === "application/zip" ||
      file.mimetype === "application/x-zip-compressed" ||
      file.originalname.toLowerCase().endsWith(".zip");

    if (isZip) {
      cb(null, true);
    } else {
      cb(new Error("Only .zip backup archives are allowed"), false);
    }
  },
});

// Helper: Recursively get all files in a directory
const getAllFiles = (dirPath, arrayOfFiles = []) => {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
};

/* ================= 1. GET SYSTEM BACKUP STATUS ================= */
export const getBackupStatus = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    // Filter out internal system collections
    const appCollections = collections.filter(
      (c) => !c.name.startsWith("system.")
    );

    let totalDocs = 0;
    const collectionDetails = [];

    for (const col of appCollections) {
      const count = await db.collection(col.name).countDocuments();
      totalDocs += count;
      collectionDetails.push({ name: col.name, count });
    }

    // Media files stats
    const mediaFiles = getAllFiles(UPLOADS_DIR);
    let mediaTotalBytes = 0;
    mediaFiles.forEach((file) => {
      try {
        const stat = fs.statSync(file);
        mediaTotalBytes += stat.size;
      } catch (e) {
        // ignore individual read errors
      }
    });

    const mediaTotalSizeMB = (mediaTotalBytes / (1024 * 1024)).toFixed(2);

    res.status(200).json({
      success: true,
      databaseName: db.databaseName,
      totalCollections: appCollections.length,
      totalDocuments: totalDocs,
      collections: collectionDetails,
      mediaCount: mediaFiles.length,
      mediaTotalSizeMB,
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching backup status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch backup status: " + error.message,
    });
  }
};

/* ================= 2. DOWNLOAD FULL BACKUP (.ZIP) ================= */
export const downloadBackup = async (req, res) => {
  // Disable request timeout for large zip compilation
  req.setTimeout(10 * 60 * 1000);

  try {
    const includeMedia = req.query.includeMedia !== "false";
    const db = mongoose.connection.db;
    const { EJSON } = mongoose.mongo.BSON;

    const zip = new AdmZip();
    const collections = await db.listCollections().toArray();
    const appCollections = collections.filter(
      (c) => !c.name.startsWith("system.")
    );

    const collectionStats = {};

    // 1. Export all MongoDB Collections
    for (const col of appCollections) {
      const docs = await db.collection(col.name).find({}).toArray();
      collectionStats[col.name] = docs.length;

      // EJSON preserves ObjectId, ISODate, Decimal128 exactly!
      const jsonContent = EJSON.stringify(docs, null, 2);
      zip.addFile(`database/${col.name}.json`, Buffer.from(jsonContent, "utf8"));
    }

    // 2. Export Media / Uploads if requested
    let mediaFileCount = 0;
    if (includeMedia && fs.existsSync(UPLOADS_DIR)) {
      const mediaFiles = getAllFiles(UPLOADS_DIR);
      for (const filePath of mediaFiles) {
        const relativePath = path.relative(UPLOADS_DIR, filePath);
        // Normalize slash for zip entries
        const zipEntryPath = `uploads/${relativePath.replace(/\\/g, "/")}`;
        const fileData = fs.readFileSync(filePath);
        zip.addFile(zipEntryPath, fileData);
        mediaFileCount++;
      }
    }

    // 3. Create Manifest Metadata
    const manifest = {
      appName: "Nazara Jewellery ERP",
      version: "1.0.0",
      createdAt: new Date().toISOString(),
      databaseName: db.databaseName,
      totalCollections: appCollections.length,
      collections: collectionStats,
      includeMedia,
      totalMediaFiles: mediaFileCount,
    };

    zip.addFile(
      "manifest.json",
      Buffer.from(JSON.stringify(manifest, null, 2), "utf8")
    );

    // 4. Generate Zip Buffer & Send to Client
    const zipBuffer = zip.toBuffer();
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const dateFormatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
    const filename = `Nazara_ERP_Backup_${dateFormatted}.zip`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", zipBuffer.length);

    return res.end(zipBuffer);
  } catch (error) {
    console.error("Error creating backup zip:", error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate backup: " + error.message,
      });
    }
  }
};

/* ================= 3. RESTORE BACKUP FROM (.ZIP) ================= */
export const restoreBackup = async (req, res) => {
  // Disable request timeout for large restore processing
  req.setTimeout(15 * 60 * 1000);

  const uploadedFilePath = req.file?.path;

  try {
    // 1. Check file existence
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a valid backup .zip file.",
      });
    }

    // 2. Read and Validate Backup ZIP Archive
    const zip = new AdmZip(uploadedFilePath);
    const manifestEntry = zip.getEntry("manifest.json");

    if (!manifestEntry) {
      if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
        fs.unlinkSync(uploadedFilePath);
      }
      return res.status(400).json({
        success: false,
        message:
          "Invalid backup archive: 'manifest.json' is missing. Make sure you upload a genuine Nazara ERP backup file.",
      });
    }

    let manifest;
    try {
      manifest = JSON.parse(manifestEntry.getData().toString("utf8"));
    } catch (e) {
      if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
        fs.unlinkSync(uploadedFilePath);
      }
      return res.status(400).json({
        success: false,
        message: "Corrupt manifest data in backup file.",
      });
    }

    const db = mongoose.connection.db;
    const { EJSON } = mongoose.mongo.BSON;

    // 4. Emergency Pre-Restore Safety Snapshot (Local Server Dump)
    try {
      const emergencyDir = path.join(
        BACKUPS_DIR,
        `emergency-pre-restore-${Date.now()}`
      );
      fs.mkdirSync(emergencyDir, { recursive: true });

      const currentCollections = await db.listCollections().toArray();
      for (const col of currentCollections) {
        if (!col.name.startsWith("system.")) {
          const currentDocs = await db.collection(col.name).find({}).toArray();
          fs.writeFileSync(
            path.join(emergencyDir, `${col.name}.json`),
            EJSON.stringify(currentDocs, null, 2),
            "utf8"
          );
        }
      }
    } catch (snapshotErr) {
      console.warn("Pre-restore snapshot warning (continuing):", snapshotErr.message);
    }

    // 5. Restore Database Collections
    const zipEntries = zip.getEntries();
    const restoredCollections = {};

    for (const entry of zipEntries) {
      if (
        !entry.isDirectory &&
        entry.entryName.startsWith("database/") &&
        entry.entryName.endsWith(".json")
      ) {
        const colName = path.basename(entry.entryName, ".json");
        const jsonContent = entry.getData().toString("utf8");

        try {
          const docs = EJSON.parse(jsonContent);

          const targetCol = db.collection(colName);
          // Clean existing collection data
          await targetCol.deleteMany({});

          if (Array.isArray(docs) && docs.length > 0) {
            await targetCol.insertMany(docs, { ordered: false });
          }

          restoredCollections[colName] = Array.isArray(docs) ? docs.length : 0;
        } catch (colErr) {
          console.error(`Error restoring collection ${colName}:`, colErr);
        }
      }
    }

    // 6. Restore Media / Uploads
    let restoredMediaCount = 0;
    for (const entry of zipEntries) {
      if (!entry.isDirectory && entry.entryName.startsWith("uploads/")) {
        const relativeSubPath = entry.entryName.replace(/^uploads\//, "");
        if (!relativeSubPath || !relativeSubPath.trim()) continue;

        const targetPath = path.join(UPLOADS_DIR, relativeSubPath);
        const targetFolder = path.dirname(targetPath);

        if (!fs.existsSync(targetFolder)) {
          fs.mkdirSync(targetFolder, { recursive: true });
        }

        try {
          fs.writeFileSync(targetPath, entry.getData());
          restoredMediaCount++;
        } catch (mediaWriteErr) {
          console.warn(
            `Warning: Could not write media file ${targetPath}:`,
            mediaWriteErr.message
          );
        }
      }
    }

    // 7. Cleanup uploaded temp zip file
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }

    return res.status(200).json({
      success: true,
      message: "System backup restored successfully!",
      backupCreatedOn: manifest.createdAt,
      restoredCollections,
      restoredMediaCount,
    });
  } catch (error) {
    console.error("Critical error during backup restore:", error);

    // Cleanup temp file on error
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      try {
        fs.unlinkSync(uploadedFilePath);
      } catch (e) {}
    }

    return res.status(500).json({
      success: false,
      message: "Failed to restore backup: " + error.message,
    });
  }
};
