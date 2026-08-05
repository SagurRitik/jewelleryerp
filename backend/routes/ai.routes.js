import express from "express";
import { parseBillImage } from "../controllers/ai.controller.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

// Parse bill image route
router.post("/parse-bill", upload.single("bill"), parseBillImage);

export default router;
