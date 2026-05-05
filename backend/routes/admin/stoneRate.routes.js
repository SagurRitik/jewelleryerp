// import express from "express";
// import {
//   getStoneRates,
//   createStoneRate,
//   updateStoneRate,
//   toggleStoneRate,
// } from "../../controllers/admin/stoneRate.controller.js";
// // import { protect, adminOnly } from "../../middlewares/authMiddleware.js";

// const router = express.Router();

// // router.use(protect, adminOnly);

// router.get("/", getStoneRates);
// router.post("/", createStoneRate);
// router.put("/:id", updateStoneRate);
// router.patch("/:id", toggleStoneRate);

// export default router;

import express from "express";
import {
  createStoneRate,
  getStoneRates,
  updateStoneRate,
  deactivateStoneRate,
  deleteStoneRate,
} from "../../controllers/admin/stoneRate.controller.js";

import { protect, authorize } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// 🔐 Admin only
// router.use(protect, authorize("admin"));

router.get("/", getStoneRates);
router.post("/", createStoneRate);
router.put("/:id", updateStoneRate);
// router.patch("/:id/deactivate", deactivateStoneRate);
router.patch("/:id", deactivateStoneRate);
router.delete("/:id", deleteStoneRate); 

export default router;
