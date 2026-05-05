import express from "express";
import { bulkUploadImages } from "../controllers/bulkImageUpload.js";
import { uploadImageZip } from "../middlewares/imageZipUpload.js";

const router = express.Router();

router.post(
  "/images/bulk-upload",
  uploadImageZip.single("file"),
  bulkUploadImages
);

export default router;
