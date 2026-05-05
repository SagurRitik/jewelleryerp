// import express from "express";
// import {
//   createProduct,
//   getProducts,
//   getProductById,
//   updateProduct,
//   deleteProduct,
//   getProductBySku,
//   updateProductBySku,
//   deleteProductBySku
// } from "../controllers/productController.js";
// import { upload } from "../middlewares/upload.js";

// const router = express.Router();

// /* ---------------- SKU ROUTES (ALWAYS FIRST) ---------------- */
// router.get("/sku/:sku", getProductBySku);
// router.patch(
//   "/sku/:sku",
//   upload.single("image"),
//   updateProductBySku
// );

// router.delete("/sku/:sku", deleteProductBySku);

// /* ---------------- ID ROUTES ---------------- */
// router.post("/", upload.single("image"), createProduct);
// router.get("/", getProducts);
// // router.get("/:id", getProductById);
// // router.put("/:id", upload.single("image"), updateProduct);
// // router.delete("/:id", deleteProduct);


// export default router;
import express from "express";
import {
  createProduct,
  getProducts,
  getInventorySummary,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductBySku,
  updateProductBySku,
  deleteProductBySku
} from "../controllers/productController.js";
import { upload } from "../middlewares/upload.js";
import { optimizeProductImages } from "../middlewares/imageOptimizer.js";

const router = express.Router();

/* ---------------- SKU ROUTES (ALWAYS FIRST) ---------------- */
router.get("/inventory/summary", getInventorySummary);


router.get("/sku/:sku", getProductBySku);

router.patch(
  "/sku/:sku",
  upload.array("images", 5),
  optimizeProductImages,      // ✨ ADDED
  updateProductBySku
);


router.delete("/sku/:sku", deleteProductBySku);

/* ---------------- ID ROUTES ---------------- */
router.post(
  "/",
  upload.array("images", 5),
  optimizeProductImages,      // ✨ ADDED
  createProduct
);

router.get("/", getProducts);
router.get("/:id", getProductById);

router.patch("/:id", upload.array("images", 5), optimizeProductImages, updateProduct); // ✅ ADD THIS
router.delete("/:id", deleteProduct); // (optional but recommended)

export default router;
