// import express from "express";
// import { getGSTSummary, getJewellerySummary} from "../../controllers/reports/gstSummary.js";

// const router = express.Router();

// router.get("/gst-summary", getGSTSummary);
// router.get("/jewellery-summary", getJewellerySummary);

// export default router;


import express from "express";
import { getGSTSummary, getJewellerySummary } from "../../controllers/reports/gstSummary.js";

const router = express.Router();

// GET /reports/gst-summary?from=2026-01-01&to=2026-12-31
router.get("/gst-summary", getGSTSummary);

// GET /reports/jewellery-summary?from=2026-01-01&to=2026-12-31
router.get("/jewellery-summary", getJewellerySummary);

export default router;