import express from "express";
import {
  createPurchase,
  getPurchases
} from "../controllers/purchase.controller.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.post("/", upload.any(), createPurchase);
router.get("/", getPurchases);

export default router;
