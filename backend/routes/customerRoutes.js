import express from "express";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getUpcomingCelebrations,
  sendOfferMessage,
  lookupCustomer,
  syncAllPastCustomers,
} from "../controllers/customerController.js";

const router = express.Router();

router.get("/celebrations", getUpcomingCelebrations);
router.get("/lookup/:mobile", lookupCustomer);
router.post("/sync-past-orders", syncAllPastCustomers);
router.post("/:id/send-offer", sendOfferMessage);

router.get("/", getCustomers);
router.post("/", createCustomer);
router.get("/:id", getCustomerById);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

export default router;
