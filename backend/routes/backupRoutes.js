import express from "express";
import {
  getBackupStatus,
  downloadBackup,
  restoreBackup,
  uploadBackupZip,
} from "../controllers/backupController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All backup routes are strictly restricted to SUPERADMIN
router.use(protect);
router.use(authorize("superadmin"));

// Middleware wrapper for Multer with clean JSON error handling
const handleBackupUpload = (req, res, next) => {
  uploadBackupZip.single("backupFile")(req, res, (err) => {
    if (err) {
      console.error("Multer backup upload error:", err);
      return res.status(400).json({
        success: false,
        message: err.message || "Failed to upload backup archive",
      });
    }
    next();
  });
};

// 1. Get system & backup status
router.get("/status", getBackupStatus);

// 2. Download one-click full backup
router.get("/download", downloadBackup);

// 3. Restore backup from uploaded zip
router.post("/restore", handleBackupUpload, restoreBackup);

export default router;
