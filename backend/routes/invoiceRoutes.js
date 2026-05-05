
import express from "express";
import {
  createInvoiceForOrder,
  getInvoiceById,
} from "../controllers/order/invoiceController.js";

const router = express.Router();

router.post("/:orderId", createInvoiceForOrder);
router.get("/:id", getInvoiceById);

export default router;
