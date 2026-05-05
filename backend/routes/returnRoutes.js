import express from "express"

import {
  createReturn,
  getReturns,
  getReturnById,
  approveReturn,
  rejectReturn,
  completeReturn,
  previewAdjustment
} from "../controllers/return.controller.js"

const router = express.Router()

// Adjustment preview (no save)
router.post("/preview-adjustment", previewAdjustment)

// CRUD
router.post("/", createReturn)
router.get("/", getReturns)
router.get("/:id", getReturnById)

// Workflow
router.patch("/:id/approve", approveReturn)
router.patch("/:id/reject", rejectReturn)
router.patch("/:id/complete", completeReturn)

export default router