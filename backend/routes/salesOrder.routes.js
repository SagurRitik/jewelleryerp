


import express from "express";
import { confirmInvoice } from "../controllers/cart/confirmInvoice.controller.js";
import { getInvoiceById ,resyncTally, getAllInvoices} from "../controllers/cart/salesOrder.controller.js";


import {downloadInvoicePDF} from "../controllers/cart/downloadInvoicePDF.js"
const router = express.Router();

/* CREATE INVOICE */
router.post("/confirm-invoice", confirmInvoice);

/* GET ALL INVOICES */
router.get("/", getAllInvoices);

//pdf 
router.get("/:id/pdf", downloadInvoicePDF);

/* GET INVOICE */
router.get("/:id", getInvoiceById);
//tally
router.post("/:id/resync-tally", resyncTally);



export default router;
