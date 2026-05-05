import express from "express";
import {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deactivateSupplier,
  activateSupplier,
  getSupplierLedger,
  deleteSupplier
} from "../controllers/supplier.controller.js";

const router = express.Router();

router.post("/", createSupplier);
router.get("/", getSuppliers);
router.get("/:id", getSupplierById);
router.put("/:id", updateSupplier);
router.patch("/:id/deactivate", deactivateSupplier);
router.patch("/:id/activate", activateSupplier);
router.get("/:id/ledger", getSupplierLedger);
router.delete("/:id", deleteSupplier);

export default router;
