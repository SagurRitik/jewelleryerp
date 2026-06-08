import express from "express";
import { protect } from "../middlewares/protect.js";
import { upload } from "../middlewares/upload.js";
import {
  calculateQuotation,
  createQuotation,
  listQuotations,
  getQuotation,
  updateQuotation,
  deleteQuotation,
  markSent,
  convertToOrder,
  manualQuotation,
  generateEstimatePdf,
  sendEstimateWhatsApp,
} from "../controllers/quotationController.js";

const router = express.Router();

/* ===== BACKWARD COMPAT ===== */
router.post("/manual", protect, manualQuotation);

/* ===== STATELESS CALCULATE ===== */
router.post("/calculate", protect, calculateQuotation);

/* ===== CRUD ===== */
router.get("/list", protect, listQuotations);
router.post("/create", protect, upload.any(), createQuotation);
router.get("/:id/pdf", protect, generateEstimatePdf);
router.get("/:id", protect, getQuotation);
router.put("/:id", protect, upload.any(), updateQuotation);
router.delete("/:id", protect, deleteQuotation);


/* ===== ACTIONS ===== */
router.patch("/:id/sent", protect, markSent);
router.post("/:id/convert", protect, convertToOrder);
router.post("/:id/whatsapp", protect, sendEstimateWhatsApp);

export default router;