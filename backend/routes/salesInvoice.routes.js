import express from "express";
import {
  getAllSalesInvoices,
  getInvoiceById,
  deleteSalesInvoiceById,
  deleteAllSalesInvoices,
  getInvoicePreviewHTML,
} from "../controllers/cart/salesInvoice.controller.js";

const router = express.Router();

router.get("/", getAllSalesInvoices);
router.delete("/", deleteAllSalesInvoices);

router.get("/:id/html", getInvoicePreviewHTML);

router.get("/:id", getInvoiceById);
router.delete("/:id", deleteSalesInvoiceById);

export default router;
