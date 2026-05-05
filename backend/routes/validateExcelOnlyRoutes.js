import express from "express";
import multer from "multer";
import { validateExcelOnly } from "../controllers/validateExcelOnly.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/validate-excel",
  upload.single("excel"),
  validateExcelOnly
);

export default router;
