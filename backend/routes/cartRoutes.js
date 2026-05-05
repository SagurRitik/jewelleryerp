import express from "express";
import {
  addProductToCart,
  addCustomToCart,
  getCartBySession,
  clearCart,
  updateCartItemQuantity,
  removeCartItem,
} from "../controllers/cart/cartController.js";
import { getCartSummary } from "../controllers/cart/getCartSummary.js";

const router = express.Router();

/* ===== ADD ===== */
router.post("/product", addProductToCart);
router.post("/custom", addCustomToCart);

/* ✅ SUMMARY (VERY IMPORTANT) */
router.get("/summary/:sessionId", getCartSummary);

/* ===== READ ===== */
router.get("/:sessionId", getCartBySession);



/* ===== UPDATE ===== */
router.patch("/update-qty", updateCartItemQuantity);

/* ===== DELETE ===== */
router.delete("/:sessionId/item/:itemId", removeCartItem);
router.delete("/:sessionId", clearCart);

export default router;
