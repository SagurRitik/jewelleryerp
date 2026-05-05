import SupplierPayment from "../models/SupplierPayment.js";
import Supplier from "../models/Supplier.js";

import fs from 'fs';
import path from 'path';

// @desc    Record a new supplier payment
// @route   POST /api/supplier-payments
export const createSupplierPayment = async (req, res) => {
  try {
    const { supplierId, amount } = req.body;

    if (!supplierId || !amount) {
      return res.status(400).json({ message: "Supplier ID and amount are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    // Create the payment record
    const payment = await SupplierPayment.create(req.body);

    // Update the supplier's balance (currentBalance -= amount)
    if (typeof supplier.currentBalance !== 'number' || isNaN(supplier.currentBalance)) {
       supplier.currentBalance = (supplier.openingBalance || 0);
    }
    
    supplier.currentBalance -= Number(amount);
    await supplier.save();

    return res.status(201).json({
      message: "Payment recorded successfully",
      payment,
      updatedBalance: supplier.currentBalance
    });
  } catch (error) {
    console.error("Error creating supplier payment:", error);
    return res.status(500).json({ message: "Server error recording payment" });
  }
};

// @desc    Get all payments (optionally for a specific supplier)
// @route   GET /api/supplier-payments
export const getSupplierPayments = async (req, res) => {
  try {
    const { supplierId } = req.query;
    let query = {};
    if (supplierId) {
      query.supplierId = supplierId;
    }

    const payments = await SupplierPayment.find(query)
      .populate("supplierId", "name mobile")
      .sort({ createdAt: -1 });

    return res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching supplier payments:", error);
    return res.status(500).json({ message: "Server error fetching payments" });
  }
};
