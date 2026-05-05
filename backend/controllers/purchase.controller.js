import Purchase from "../models/Purchase.js";
import Supplier from "../models/Supplier.js";
import Product from "../models/Product.js";
import MetalLedger from "../models/MetalLedger.js";
import { clearProductCache } from "../utils/productCache.js";

// @desc    Record a new purchase from a supplier (Simplified)
// @route   POST /api/purchases
export const createPurchase = async (req, res) => {
  try {
    const {
      supplierId,
      purchaseDate,
      description,
      amount,
      notes,
      products: productsJson
    } = req.body;

    if (!supplierId || !description || !amount) {
      return res.status(400).json({ message: "Supplier, description, and amount are required" });
    }

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    let productsData = [];
    if (productsJson) {
      try {
        productsData = JSON.parse(productsJson);
      } catch (e) {
        console.error("Error parsing products JSON:", e);
      }
    }

    console.log("🚀 Starting Purchase Creation for Supplier:", supplierId);
    console.log("📦 Products count:", productsData.length);

    /* ---------------- 📝 GENERATE PURCHASE NUMBER ---------------- */
    const date = new Date(purchaseDate || Date.now());
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const datePrefix = `PUR-${year}/${month}/${day}`;

    const lastPurchase = await Purchase.findOne({
      purchaseNo: { $regex: new RegExp(`^${datePrefix}`) }
    }).sort({ purchaseNo: -1 });

    let sequence = "001";
    if (lastPurchase) {
      const lastSeq = parseInt(lastPurchase.purchaseNo.split("-").pop());
      sequence = String(lastSeq + 1).padStart(3, "0");
    }
    const purchaseNo = `${datePrefix}-${sequence}`;
    console.log("🆔 Generated Purchase No:", purchaseNo);

    /* ---------------- 🛒 PROCESS PRODUCTS ---------------- */
    const createdProductIds = [];
    const productCount = productsData.length;

    if (productCount === 0) {
      return res.status(400).json({ message: "At least one product is required for this purchase" });
    }

    for (let i = 0; i < productCount; i++) {
      const p = productsData[i];
      console.log(`🔹 Processing product ${i + 1}/${productCount}:`, p.title);

      if (!p.title || !p.sku || !p.metalType) {
        console.error("❌ Missing required fields for product:", p);
        throw new Error(`Product "${p.title || i}" is missing title, sku, or metalType`);
      }

      const productImages = [];
      if (req.files && Array.isArray(req.files)) {
        req.files.forEach(file => {
          if (file.fieldname === `product_${i}_image`) {
            productImages.push(`/uploads/${file.filename}`);
          }
        });
      }

      const newProduct = await Product.create({
        ...p,
        images: productImages,
        stock: p.stock || 1
      });
      console.log("✅ Created Product:", newProduct._id);

      createdProductIds.push(newProduct._id);

      await MetalLedger.create({
        type: "CREDIT",
        source: "VENDOR",
        referenceId: newProduct._id,
        referenceModel: "Purchase",
        partyName: supplier.name,
        metalType: newProduct.metalType || "Other",
        purity: newProduct.metalPurity,
        weight: Number(newProduct.netWeight) || 0,
        value: (Number(amount) || 0) / productCount,
        notes: `Auto-created from Purchase ${purchaseNo}`
      });
      console.log("✅ Created MetalLedger for product");
    }

    /* ---------------- 🛒 CREATE PURCHASE ---------------- */
    console.log("📝 Saving Purchase document...");
    const purchaseData = {
      supplierId,
      purchaseNo,
      purchaseDate: date,
      description,
      amount: Number(amount) || 0,
      totalAmount: Number(amount) || 0,
      products: createdProductIds,
      notes
    };

    if (req.files && Array.isArray(req.files)) {
      const slipFile = req.files.find(f => f.fieldname === "purchaseSlip");
      if (slipFile) {
        purchaseData.purchaseSlip = `/uploads/${slipFile.filename}`;
      }
    }

    const purchase = await Purchase.create(purchaseData);
    console.log("✅ Purchase created successfully:", purchase._id);

    if (createdProductIds.length > 0) {
      await MetalLedger.updateMany(
        { referenceId: { $in: createdProductIds }, referenceModel: "Purchase" },
        { referenceId: purchase._id }
      );
    }

    // ✅ Invalidate product cache so inventory reflects instantly
    clearProductCache();
    console.log("🗑️ Product cache cleared after purchase — inventory will reflect immediately.");

    /* ---------------- 💰 UPDATE SUPPLIER BALANCE ---------------- */
    console.log("💰 Updating supplier balance...");
    supplier.currentBalance = (supplier.currentBalance || 0) + (Number(amount) || 0);
    await supplier.save();
    console.log("✅ Supplier balance updated.");

    return res.status(201).json({
      message: "Purchase and products recorded successfully",
      purchase,
      productCount: createdProductIds.length,
      updatedBalance: supplier.currentBalance
    });

  } catch (error) {
    console.error("🔥 Error creating purchase:", error);

    let errorMessage = error.message;
    if (error.name === 'ValidationError') {
      errorMessage = Object.values(error.errors).map(err => err.message).join(', ');
    } else if (error.code === 11000) {
      errorMessage = `Duplicate key error: A record already exists with that ${Object.keys(error.keyValue).join(' & ')}`;
    }

    return res.status(500).json({
      message: "Server error recording purchase",
      error: errorMessage
    });
  }
};

// @desc    Get all purchases
// @route   GET /api/purchases
export const getPurchases = async (req, res) => {
  try {
    const { supplierId, search } = req.query;
    let query = {};

    if (supplierId) {
      query.supplierId = supplierId;
    }

    if (search) {
      query.purchaseNo = { $regex: search, $options: "i" };
    }

    const purchases = await Purchase.find(query)
      .populate("supplierId", "name mobile gstNumber")
      .sort({ purchaseDate: -1 });

    return res.status(200).json(purchases);
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return res.status(500).json({ message: "Server error fetching purchases" });
  }
};
