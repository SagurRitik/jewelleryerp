import express from "express";
import {
  getAllSalesInvoices,
  getInvoiceById,
  deleteSalesInvoiceById,
  deleteAllSalesInvoices,
  getInvoicePreviewHTML,
  exportSalesInvoices,
  importSalesInvoices,
  generateSalesInvoicePdf,
  sendSalesInvoiceWhatsApp,
} from "../controllers/cart/salesInvoice.controller.js";
import { uploadExcel } from "../middlewares/excelUpload.js";
import { protect } from "../middlewares/protect.js";
import { authorize } from "../middlewares/authorize.js";

const router = express.Router();

router.get("/", protect, getAllSalesInvoices);
router.delete("/", protect, authorize("superadmin", "admin"), deleteAllSalesInvoices);

router.get("/export", protect, authorize("superadmin", "admin"), exportSalesInvoices);
router.post("/import", protect, uploadExcel.single("excel"), importSalesInvoices);

router.get("/:id/html", protect, getInvoicePreviewHTML);
router.get("/:id/pdf", protect, generateSalesInvoicePdf);
router.post("/:id/whatsapp", protect, sendSalesInvoiceWhatsApp);

router.get("/:id", protect, getInvoiceById);
router.delete("/:id", protect, authorize("superadmin", "admin"), deleteSalesInvoiceById);

export default router;
