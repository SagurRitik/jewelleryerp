


import express from "express";
import { checkoutCart } from "../controllers/cart/checkoutController.js";

const router = express.Router();

router.post("/", checkoutCart);

export default router;
