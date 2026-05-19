import multer from "multer";

/**
 * Accepts:
 *   - excel  (required): .xlsx file
 *   - images (optional): .zip file of product images
 */
export const uploadExcelZip = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit

  fileFilter: (req, file, cb) => {
    // ✅ Excel field — must be .xlsx
    if (file.fieldname === "excel") {
      const isExcel =
        file.mimetype.includes("spreadsheet") ||
        file.originalname.toLowerCase().endsWith(".xlsx");

      if (isExcel) return cb(null, true);
      return cb(new Error("Only .xlsx Excel files are allowed"), false);
    }

    // ✅ Images field — must be .zip (OPTIONAL, skip if not provided)
    if (file.fieldname === "images") {
      const isZip =
        file.mimetype.includes("zip") ||
        file.originalname.toLowerCase().endsWith(".zip");

      if (isZip) return cb(null, true);
      return cb(new Error("Only .zip files are allowed for images"), false);
    }

    cb(new Error(`Unexpected file field: ${file.fieldname}`), false);
  },
});
