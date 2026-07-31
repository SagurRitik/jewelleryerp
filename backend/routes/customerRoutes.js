import express from "express";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getUpcomingCelebrations,
  sendOfferMessage,
} from "../controllers/customerController.js";

const router = express.Router();

router.get("/celebrations", getUpcomingCelebrations);
router.post("/:id/send-offer", sendOfferMessage);

router.get("/", getCustomers);
router.post("/", createCustomer);
router.get("/:id", getCustomerById);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

export default router;
