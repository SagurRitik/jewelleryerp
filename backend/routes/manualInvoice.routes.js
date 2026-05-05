// import express from "express";
// import { createManualInvoice } from "../controllers/createManualInvoice.js";

// const router = express.Router();

// /* MANUAL BILLING */
// router.post("/", createManualInvoice);

// export default router;

import express from "express";
import { createManualInvoice } from "../controllers/createManualInvoice.js";
import { downloadInvoicePDF } from "../controllers/cart/downloadInvoicePDF.js";

const router = express.Router();

/* CREATE MANUAL INVOICE */
router.post("/", createManualInvoice);

/* DOWNLOAD PDF */
router.get("/:id/pdf", downloadInvoicePDF);

export default router;