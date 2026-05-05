// import express from "express";
// import {
//   getActiveRates,
//   setRates,
//   getRateHistory,
// } from "../../controllers/admin/rates.controller.js";

// const router = express.Router();

// router.get("/active", getActiveRates);
// router.post("/set", setRates);
// router.get("/history", getRateHistory);

// export default router;
// routes/admin/rates.routes.js


import express from "express";
import {
  createRateConfig,
  getActiveRates,
  updateRateConfig,
  getAllRateConfigs,
} from "../../controllers/admin/rates.controller.js";

const router = express.Router();

router.get("/active", getActiveRates);
router.get("/", getAllRateConfigs);
router.post("/", createRateConfig);
router.put("/:id", updateRateConfig);

export default router;
