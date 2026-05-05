import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
// adjust path if needed

const router = express.Router();

router.get("/stats", getDashboardStats);

export default router;
