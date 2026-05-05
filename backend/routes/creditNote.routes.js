import express from "express";
import {
  getCreditNotes,
  getCustomerCredits,
  getCreditNoteStats,
} from "../controllers/creditNote.controller.js";

const router = express.Router();

router.get("/", getCreditNotes);
router.get("/stats", getCreditNoteStats);
router.get("/customer/:mobile", getCustomerCredits);

export default router;