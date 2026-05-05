import express from "express";
import { getDailySalesClosing } from "../../controllers/reports/salesClosing.controller.js";

const router = express.Router();

router.get("/daily-sales-closing", getDailySalesClosing);

export default router;
