import express from "express";
import { getDeadStockReport } from "../../controllers/reports/deadStockController.js";
// import { protect, admin } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/dead-stock", getDeadStockReport);

export default router;
