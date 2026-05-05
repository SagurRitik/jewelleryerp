import express from "express";
import { confirmInvoice } from "../controllers/cart/confirmInvoice.controller.js";

const router = express.Router();

router.post("/confirm-invoice", confirmInvoice);

export default router;

