
import express from "express";
import {
  createDiamondStock,
  getDiamondStocks,
  getDiamondStockById,
  updateDiamondStock,
  deleteDiamondStock
} from "../controllers/diamondStockController.js";

const router = express.Router();

router.post("/", createDiamondStock);
router.get("/", getDiamondStocks);
router.get("/:id", getDiamondStockById);
router.patch("/:id", updateDiamondStock);
router.delete("/:id", deleteDiamondStock);

export default router;
