
// export default router;
import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrderByOrderNo,
  updateOrderById,
  updateOrderStatusById,
  cancelOrderById,
  assignSkuToOrder,
  deleteOrderById,
  // lockOrderPricing,
  // unlockOrderPricing,
} from "../controllers/order/orderController.js";

import { getOrderClosingSummary } from "../controllers/order/orderClosingController.js";
import { upload } from "../middlewares/upload.js";
import { optimizeProductImages } from "../middlewares/imageOptimizer.js";

const router = express.Router();

/* ================= CREATE & LIST ================= */
// router.post(
//   "/",
//   upload.single("productImage"),
//   createOrder
// );

router.post(
  "/",
  upload.array("productImages", 5),
  optimizeProductImages,
  createOrder
);



router.get("/", getAllOrders);

/* ================= REPORT (VERY IMPORTANT) ================= */
// 👇 THIS MUST EXIST AND MUST BE ABOVE `/:id`
router.get("/closing", getOrderClosingSummary);

/* ================= READ ================= */
router.get("/order-no/:orderNo", getOrderByOrderNo);
router.get("/:id", getOrderById);

/* ================= UPDATE ================= */
router.patch("/:id", upload.array("productImages", 5), optimizeProductImages, updateOrderById);
router.patch("/:id/status", updateOrderStatusById);
router.patch("/:id/cancel", cancelOrderById);

/* ================= POST-MANUFACTURING ================= */
router.patch("/:id/assign-sku", assignSkuToOrder);
// router.patch("/:id/lock-pricing", lockOrderPricing);
// router.patch("/:id/unlock-pricing", unlockOrderPricing);

/* ================= DELETE ================= */
router.delete("/:id", deleteOrderById);

export default router;
