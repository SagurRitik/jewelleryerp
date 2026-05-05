import express from "express";
import {
  createSupplierPayment,
  getSupplierPayments
} from "../controllers/supplierPayment.controller.js";

const router = express.Router();

router.post("/", createSupplierPayment);
router.get("/", getSupplierPayments);

export default router;
