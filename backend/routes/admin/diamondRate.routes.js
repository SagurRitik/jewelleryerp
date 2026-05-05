
import express from "express";
import {
  createDiamondRate,
  getDiamondRates,
  updateDiamondRate,
  deactivateDiamondRate,
  deleteDiamondRate,
} from "../../controllers/admin/diamondRate.controller.js";

import { protect, authorize } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// 🔐 Admin only
// router.use(protect, authorize("admin"));

router.get("/", getDiamondRates);
router.post("/", createDiamondRate);
router.put("/:id", updateDiamondRate);
// router.patch("/:id/deactivate", deactivateDiamondRate);
// router.delete("/diamond-rates/:id", deleteDiamondRate);
router.patch("/:id", deactivateDiamondRate);
router.delete("/:id", deleteDiamondRate);
export default router;
