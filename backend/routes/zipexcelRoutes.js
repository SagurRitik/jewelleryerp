import express from "express";
import { bulkUploadProducts } from "../controllers/bulkUploadProducts.js";
import { uploadExcelZip } from "../middlewares/excelZipUpload.js";

const router = express.Router();

/**
 * EXCEL + ZIP BULK UPLOAD
 * Endpoint: POST /api/products/bulk-upload
 */
router.post(
  "/bulk-upload",
  uploadExcelZip.fields([
    { name: "excel", maxCount: 1 },
    { name: "images", maxCount: 1 }
  ]),
  bulkUploadProducts
);

export default router;
