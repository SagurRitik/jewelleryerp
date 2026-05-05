import Supplier from "../models/Supplier.js";
import SupplierPayment from "../models/SupplierPayment.js";
import Purchase from "../models/Purchase.js";

// @desc    Create a new supplier
// @route   POST /api/suppliers
export const createSupplier = async (req, res) => {
  try {
    const { name, mobile } = req.body;

    if (!name || !mobile) {
      return res.status(400).json({ message: "Name and Mobile are required" });
    }

    const existingSupplier = await Supplier.findOne({ mobile });
    if (existingSupplier) {
      return res.status(400).json({ message: "Supplier with this mobile number already exists" });
    }

    const supplier = await Supplier.create(req.body);
    return res.status(201).json(supplier);
  } catch (error) {
    console.error("Error creating supplier:", error);
    return res.status(500).json({ message: "Server error creating supplier" });
  }
};

// @desc    Get all suppliers with optional search and filter
// @route   GET /api/suppliers
export const getSuppliers = async (req, res) => {
  try {
    const { search, activeOnly } = req.query;
    let query = {};

    if (activeOnly === 'true') {
      query.isActive = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } }
      ];
    }

    const suppliers = await Supplier.find(query).sort({ createdAt: -1 });
    return res.status(200).json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return res.status(500).json({ message: "Server error fetching suppliers" });
  }
};

// @desc    Get single supplier by ID
// @route   GET /api/suppliers/:id
export const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    return res.status(200).json(supplier);
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return res.status(500).json({ message: "Server error fetching supplier" });
  }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
export const updateSupplier = async (req, res) => {
  try {
    const { mobile } = req.body;
    const supplierId = req.params.id;

    // Check if mobile is being updated and trying to duplicate someone else's mobile
    if (mobile) {
      const existingWithMobile = await Supplier.findOne({ mobile, _id: { $ne: supplierId } });
      if (existingWithMobile) {
        return res.status(400).json({ message: "Another supplier with this mobile number already exists" });
      }
    }

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      supplierId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedSupplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    return res.status(200).json(updatedSupplier);
  } catch (error) {
    console.error("Error updating supplier:", error);
    return res.status(500).json({ message: "Server error updating supplier" });
  }
};

// @desc    Deactivate a supplier
// @route   PATCH /api/suppliers/:id/deactivate
export const deactivateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    return res.status(200).json({ message: "Supplier deactivated successfully", supplier });
  } catch (error) {
    console.error("Error deactivating supplier:", error);
    return res.status(500).json({ message: "Server error deactivating supplier" });
  }
};

// @desc    Activate a supplier
// @route   PATCH /api/suppliers/:id/activate
export const activateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    return res.status(200).json({ message: "Supplier activated successfully", supplier });
  } catch (error) {
    console.error("Error activating supplier:", error);
    return res.status(500).json({ message: "Server error activating supplier" });
  }
};

// @desc    Delete a supplier (only if no transactions exist)
// @route   DELETE /api/suppliers/:id
export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    // Check for existing transactions to prevent data orphaned records
    const hasPayments = await SupplierPayment.exists({ supplierId: id });
    const hasPurchases = await Purchase.exists({ supplierId: id });

    if (hasPayments || hasPurchases) {
      return res.status(400).json({ 
        message: "Cannot delete supplier with transaction history. Please deactivate them instead to preserve records." 
      });
    }

    const supplier = await Supplier.findByIdAndDelete(id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    return res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return res.status(500).json({ message: "Server error deleting supplier" });
  }
};

// @desc    Get complete transaction history (ledger) for a supplier
// @route   GET /api/suppliers/:id/ledger
export const getSupplierLedger = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    // Step 1: Initialize Ledger with Opening Balance
    let ledger = [
      {
        type: "OPENING BALANCE",
        date: supplier.createdAt,
        amount: supplier.openingBalance,
        note: `Opening Balance (${supplier.balanceType})`,
        isPayable: supplier.balanceType === "PAYABLE"
      }
    ];

    // Step 2: Fetch all Payments
    const payments = await SupplierPayment.find({ supplierId: id }).sort({ paymentDate: 1 });
    
    // Add payments to ledger (negative amount represents paying off depth)
    payments.forEach(p => {
      ledger.push({
        _id: p._id,
        type: "PAYMENT",
        date: p.paymentDate,
        amount: -p.amount, // Payment reduces the liability (PAYABLE balance)
        paymentMode: p.paymentMode,
        reference: p.reference,
        note: p.note
      });
    });

    // Step 3: Fetch all Purchases
    const purchases = await Purchase.find({ supplierId: id }).sort({ purchaseDate: 1 });
    
    // Add purchases to ledger (positive amount represents increasing liability/payable)
    purchases.forEach(pur => {
      ledger.push({
        _id: pur._id,
        type: "PURCHASE",
        date: pur.purchaseDate,
        amount: pur.totalAmount || pur.amount, // Purchase increases the liability
        purchaseNo: pur.purchaseNo,
        description: pur.description,
        purchaseSlip: pur.purchaseSlip,
        note: pur.description || pur.notes || `Purchase Invoice: ${pur.purchaseNo}`
      });
    });

    // Step 4: Sort chronologically
    ledger.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Step 5: Calculate Running Balance & Summary
    let totalPaid = 0;
    let totalPurchased = 0;
    let runningBalance = 0;

    const finalLedger = ledger.map(entry => {
      runningBalance += entry.amount;
      if (entry.type === "PAYMENT") totalPaid += Math.abs(entry.amount);
      if (entry.type === "PURCHASE") totalPurchased += entry.amount;

      return {
        ...entry,
        runningBalance
      };
    });

    return res.status(200).json({
      supplier: {
        name: supplier.name,
        mobile: supplier.mobile,
        gstNumber: supplier.gstNumber,
        currentBalance: supplier.currentBalance,
        openingBalance: supplier.openingBalance,
        totalPaid,
        totalPurchased
      },
      ledger: finalLedger
    });
  } catch (error) {
    console.error("Error generating ledger:", error);
    return res.status(500).json({ message: "Server error generating ledger" });
  }
};
