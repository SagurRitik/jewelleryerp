import express from "express";
import {getDashboardStats} from "../controllers/dashboardController.js";
import { protect } from "../middlewares/authMiddleware.js"; // Security

const router = express.Router();

router.get("/stats", protect, getDashboardStats); // ✅ /api/dashboard/stats

export default router;