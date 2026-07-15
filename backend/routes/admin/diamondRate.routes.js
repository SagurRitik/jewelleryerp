
import express from "express";
import {
  createDiamondRate,
  getDiamondRates,
  updateDiamondRate,
  deactivateDiamondRate,
  deleteDiamondRate,
  exportDiamondRates,
  importDiamondRates,
} from "../../controllers/admin/diamondRate.controller.js";
import { uploadExcel } from "../../middlewares/excelUpload.js";

import { protect, authorize } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// 🔐 Admin only
// router.use(protect, authorize("admin"));

router.get("/", getDiamondRates);
router.get("/export", exportDiamondRates);
router.post("/import", uploadExcel.single("excel"), importDiamondRates);

router.post("/", createDiamondRate);
router.put("/:id", updateDiamondRate);
router.patch("/:id", deactivateDiamondRate);
router.delete("/:id", deleteDiamondRate);
export default router;
