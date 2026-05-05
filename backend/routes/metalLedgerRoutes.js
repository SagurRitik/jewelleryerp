import express from "express"
import {
manualMetalCredit,
manualMetalDebit,
getMetalLedger
} from "../controllers/metalLedgerController.js"

const router = express.Router()

router.get("/",getMetalLedger)

router.post("/manual-credit",manualMetalCredit)

router.post("/debit",manualMetalDebit)

export default router