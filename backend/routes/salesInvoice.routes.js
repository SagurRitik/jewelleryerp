import express from "express";
import {
  getAllSalesInvoices,
  getInvoiceById,
  deleteSalesInvoiceById,
  deleteAllSalesInvoices,
  getInvoicePreviewHTML,
  exportSalesInvoices,
  importSalesInvoices,
} from "../controllers/cart/salesInvoice.controller.js";
import { uploadExcel } from "../middlewares/excelUpload.js";

const router = express.Router();

router.get("/", getAllSalesInvoices);
router.delete("/", deleteAllSalesInvoices);

router.get("/export", exportSalesInvoices);
router.post("/import", uploadExcel.single("excel"), importSalesInvoices);

router.get("/:id/html", getInvoicePreviewHTML);

router.get("/:id", getInvoiceById);
router.delete("/:id", deleteSalesInvoiceById);

export default router;
