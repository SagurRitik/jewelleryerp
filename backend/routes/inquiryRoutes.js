import express from "express";
import {
  createInquiry,
  getInquiries,
  updateStatus,
  getInquiryById,
  deleteInquiry,
  addFollowUp,
  bulkCreateInquiries,
} from "../controllers/inquiryController.js";

import { uploadExcel } from "../middlewares/excelUpload.js";

const router = express.Router();

router.post("/", createInquiry);
router.post("/bulk", uploadExcel.single("excel"), bulkCreateInquiries);
router.get("/", getInquiries);
router.put("/:id/status", updateStatus);
router.post("/:id/followup", addFollowUp);
router.get("/:id", getInquiryById);
router.delete("/:id", deleteInquiry);

export default router;