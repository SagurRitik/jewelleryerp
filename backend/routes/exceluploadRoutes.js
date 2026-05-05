

import express from "express";
import { bulkUploadProducts } from "../controllers/bulkUploadProducts.js";
import { uploadExcel } from "../middlewares/excelUpload.js";

const router = express.Router();

router.post(
  "/products/bulk-upload",
  uploadExcel.single("file"),
  bulkUploadProducts
);

export default router;
