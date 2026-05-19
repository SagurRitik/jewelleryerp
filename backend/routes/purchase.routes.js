import express from "express";
import {
  createPurchase,
  getPurchases
} from "../controllers/purchase.controller.js";
import { upload } from "../middlewares/upload.js";
import { optimizeProductImages } from "../middlewares/imageOptimizer.js";

const router = express.Router();

router.post("/", upload.any(), optimizeProductImages, createPurchase);
router.get("/", getPurchases);

export default router;
