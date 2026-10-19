


import calculateItem from "../utils/calculateItem.js";
import RateConfig from "../models/RateConfig.js";

import Product from "../models/Product.js";
import Purchase from "../models/Purchase.js";
import Supplier from "../models/Supplier.js";
import MetalLedger from "../models/MetalLedger.js";
import { normalizeImage } from "../utils/normalizeImage.js";

/* ======================================================
   SANITIZE PRODUCT DATA (STRUCTURE ONLY)
   ====================================================== */


const sanitizeProductData = (data) => {
  const sanitized = { ...data };

  if (typeof sanitized.components === "string") {
    try {
      sanitized.components = JSON.parse(sanitized.components);
    } catch (err) {
      console.error("❌ JSON PARSE FAILED:", sanitized.components);

      // 🔥 STOP REQUEST — VERY IMPORTANT
      throw new Error("Invalid components JSON");
    }
  }

  // 🔥 PRODUCT LEVEL CERTIFICATES PARSE
  if (typeof sanitized.certificates === "string") {
    try {
      sanitized.certificates = JSON.parse(sanitized.certificates);
    } catch {
      sanitized.certificates = [];
    }
  }

  // ensure array
  if (!Array.isArray(sanitized.certificates)) {
    sanitized.certificates = [];
  }

  // 🔥 EXISTING IMAGES PARSE
  if (typeof sanitized.existingImages === "string") {
    try {
      sanitized.existingImages = JSON.parse(sanitized.existingImages);
    } catch {
      sanitized.existingImages = [];
    }
  }

  if (!Array.isArray(sanitized.existingImages)) {
    sanitized.existingImages = [];
  }

  // 🔥 PURCHASE BILLS PARSE & MERGE
  let existingBills = [];
  if (typeof sanitized.existingPurchaseBills === "string") {
    try {
      existingBills = JSON.parse(sanitized.existingPurchaseBills);
    } catch {
      existingBills = sanitized.existingPurchaseBills ? [sanitized.existingPurchaseBills] : [];
    }
  } else if (Array.isArray(sanitized.existingPurchaseBills)) {
    existingBills = sanitized.existingPurchaseBills;
  }

  let newBills = [];
  if (Array.isArray(sanitized.purchaseBills)) {
    newBills = sanitized.purchaseBills;
  } else if (typeof sanitized.purchaseBills === "string") {
    try {
      const parsed = JSON.parse(sanitized.purchaseBills);
      newBills = Array.isArray(parsed) ? parsed : [sanitized.purchaseBills];
    } catch {
      if (sanitized.purchaseBills) newBills = [sanitized.purchaseBills];
    }
  }

  const combinedBills = [...new Set([...existingBills, ...newBills])].filter(Boolean);
  sanitized.purchaseBills = combinedBills;
  if (!sanitized.purchaseBill && combinedBills.length > 0) {
    sanitized.purchaseBill = combinedBills[0];
  } else if (combinedBills.length === 0) {
    sanitized.purchaseBill = "";
  }

  // fallback safety
  if (!Array.isArray(sanitized.components)) {
    throw new Error("Components must be an array");
  }


  /* ---------- 2. NUMERIC CONVERSIONS ---------- */
  const numericFields = ["stock", "grossWeight", "netWeight", "fineGold", "purchaseCost"];

  numericFields.forEach((field) => {
    if (sanitized[field] !== undefined) {
      sanitized[field] = sanitized[field] === "" ? 0 : Number(sanitized[field]);
    }
  });

  if (
    sanitized.supplierId === "" ||
    sanitized.supplierId === "null" ||
    sanitized.supplierId === "undefined" ||
    sanitized.supplierId === null
  ) {
    sanitized.supplierId = null;
  }

  /* ---------- 3. COMPONENT SANITIZATION ---------- */
  if (Array.isArray(sanitized.components)) {
    sanitized.components = sanitized.components.map((c) => ({
      type: String(c.type || "").trim(),
      componentRole: c.componentRole || "SIDE",
      category: c.category || "",

      shape: c.shape || "",
      clarity: c.clarity || "",
      color: c.color || "",
      cut: c.cut || "",
      // certificateNo: c.certificateNo || "",


      count: Number(c.count || 0),
      weight: Number(c.weight || 0),
      // grossWeight: Number(c.grossWeight || 0),
      // size: Number(c.size || 0),
      grossWeight:
        c.grossWeight !== undefined ? Number(c.grossWeight) : 0,

      // size:
      //   c.size !== undefined ? Number(c.size) : 0,

      // size:
      //   c.size !== undefined ? String(c.size) : "",

      size:
        c.size !== undefined && c.size !== null
          ? String(c.size)
          : "",

      pricingRef: c.pricingRef || "",
      rateOverride:
        c.rateOverride !== undefined && c.rateOverride !== null
          ? Number(c.rateOverride)
          : null,

      description: c.description || "",
      settingApplicable: Boolean(c.settingApplicable),
      settingRuleRef: c.settingRuleRef || "",
    }));
  }

  /* ---------- 4. METAL NORMALIZATION ---------- */
  if (sanitized.metalType) {
    sanitized.metalType =
      sanitized.metalType.charAt(0).toUpperCase() +
      sanitized.metalType.slice(1);
  }


  if (sanitized.metalPurity) {
    let purityStr = String(sanitized.metalPurity)
      .toUpperCase()
      .replace(/\s/g, "");

    // only convert if already not KT
    if (!purityStr.endsWith("KT")) {
      purityStr = purityStr.replace(/K$/, "KT");
    }

    sanitized.metalPurity = purityStr;
  }


  /* ---------- 6. CATEGORY BACKWARD COMPAT & LOOSE DIAMOND DEFAULTS ---------- */
  if (sanitized.category && !sanitized.jewelleryCategory) {
    sanitized.jewelleryCategory = sanitized.category;
  }
  delete sanitized.category;

  if (sanitized.jewelleryCategory === "Loose Diamond") {
    sanitized.metalType = sanitized.metalType || "LooseDiamond";
    sanitized.metalPurity = sanitized.metalPurity || "NA";
    sanitized.netWeight = Number(sanitized.netWeight || 0);
    sanitized.grossWeight = Number(sanitized.grossWeight || 0);
    sanitized.hsnCode = sanitized.hsnCode || "7102";
  }

  /* ---------- 7. TARGET AUDIENCE ---------- */
  if (sanitized.targetAudience) {
    sanitized.targetAudience = sanitized.targetAudience.toUpperCase();
  }

  /* ---------- 8. HARD CLEANUP ---------- */
  delete sanitized.rate;
  delete sanitized.rateType;
  delete sanitized.settingRate;
  delete sanitized.makingChargePerGram;
  delete sanitized.wastagePercent;

  return sanitized;
};

/* ======================================================
   GENERATE PURCHASE NUMBER
   ====================================================== */
const generatePurchaseNo = async (date) => {
  const d = date ? new Date(date) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const datePrefix = `PUR-${year}/${month}/${day}`;

  const lastPurchase = await Purchase.findOne({
    purchaseNo: { $regex: new RegExp(`^${datePrefix}`) }
  }).sort({ purchaseNo: -1 });

  let sequence = "001";
  if (lastPurchase && lastPurchase.purchaseNo) {
    const parts = lastPurchase.purchaseNo.split("-");
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) {
      sequence = String(lastSeq + 1).padStart(3, "0");
    }
  }
  return `${datePrefix}-${sequence}`;
};

/* ======================================================
   SYNC PRODUCT PURCHASE (LEDGER & STATEMENT)
   ====================================================== */
export const syncProductPurchase = async (product, previousState = {}) => {
  try {
    const { prevSupplierId, prevPurchaseCost, prevPurchaseId } = previousState;
    const currentSupplierId = product.supplierId ? product.supplierId.toString() : null;
    const currentCost = Number(product.purchaseCost) || 0;
    const slips = Array.isArray(product.purchaseBills) && product.purchaseBills.length > 0
      ? product.purchaseBills
      : (product.purchaseBill ? [product.purchaseBill] : []);

    // 1. If product has a supplier linked:
    if (currentSupplierId && (currentCost > 0 || slips.length > 0 || product.purchaseId)) {
      const supplier = await Supplier.findById(currentSupplierId);
      if (!supplier) {
        console.warn(`Supplier ${currentSupplierId} not found during purchase sync for product ${product.sku}`);
        return;
      }

      // Check if a Purchase is already linked to this product
      let purchase = null;
      if (product.purchaseId) {
        purchase = await Purchase.findById(product.purchaseId);
      }
      if (!purchase) {
        purchase = await Purchase.findOne({ products: product._id });
      }

      if (purchase) {
        // --- EXISTING PURCHASE UPDATE ---
        const oldSupplierId = purchase.supplierId ? purchase.supplierId.toString() : null;

        // If supplier changed
        if (oldSupplierId && oldSupplierId !== currentSupplierId) {
          // Decrement old supplier balance
          await Supplier.findByIdAndUpdate(oldSupplierId, {
            $inc: { currentBalance: -(purchase.totalAmount || purchase.amount || 0) }
          });
          // Increment new supplier balance
          await Supplier.findByIdAndUpdate(currentSupplierId, {
            $inc: { currentBalance: currentCost }
          });
        } else {
          // Same supplier - calculate cost diff
          const oldAmount = Number(purchase.totalAmount || purchase.amount) || 0;
          const diff = currentCost - oldAmount;
          if (diff !== 0) {
            await Supplier.findByIdAndUpdate(currentSupplierId, {
              $inc: { currentBalance: diff }
            });
          }
        }

        // Update purchase details
        purchase.supplierId = currentSupplierId;
        purchase.amount = currentCost;
        purchase.totalAmount = currentCost;
        purchase.purchaseSlip = slips[0] || "";
        purchase.purchaseSlips = slips;
        purchase.description = product.title || product.sku || purchase.description || "Product Purchase";
        if (!purchase.products.map(p => p.toString()).includes(product._id.toString())) {
          purchase.products.push(product._id);
        }
        await purchase.save();

        // Update MetalLedger
        await MetalLedger.findOneAndUpdate(
          { referenceId: purchase._id, referenceModel: "Purchase" },
          {
            partyName: supplier.name,
            metalType: product.metalType || "Other",
            purity: product.metalPurity,
            weight: Number(product.netWeight) || 0,
            value: currentCost,
            notes: `Product Purchase: ${product.title || product.sku} (SKU: ${product.sku})`
          },
          { upsert: true }
        );

        if (!product.purchaseId || product.purchaseId.toString() !== purchase._id.toString()) {
          await Product.findByIdAndUpdate(product._id, { purchaseId: purchase._id });
          product.purchaseId = purchase._id;
        }
        console.log(`✅ Updated Purchase ${purchase.purchaseNo} for product ${product.sku}`);
      } else {
        // --- CREATE NEW PURCHASE ---
        const purchaseNo = await generatePurchaseNo(new Date());

        const newPurchase = await Purchase.create({
          supplierId: currentSupplierId,
          purchaseNo,
          purchaseDate: new Date(),
          description: product.title || product.sku || "Product Purchase",
          amount: currentCost,
          totalAmount: currentCost,
          products: [product._id],
          purchaseSlip: slips[0] || "",
          purchaseSlips: slips,
          notes: product.description ? `${product.description} (SKU: ${product.sku})` : `Purchased SKU: ${product.sku}`,
          status: "COMPLETED"
        });

        // Link back to product
        await Product.findByIdAndUpdate(product._id, { purchaseId: newPurchase._id });
        product.purchaseId = newPurchase._id;

        // Update supplier balance
        supplier.currentBalance = (supplier.currentBalance || 0) + currentCost;
        await supplier.save();

        // Create MetalLedger entry
        await MetalLedger.create({
          type: "CREDIT",
          source: "VENDOR",
          referenceId: newPurchase._id,
          referenceModel: "Purchase",
          partyName: supplier.name,
          metalType: product.metalType || "Other",
          purity: product.metalPurity,
          weight: Number(product.netWeight) || 0,
          value: currentCost,
          notes: `Auto-created from product ${product.sku}`
        });

        console.log(`✅ Purchase ${purchaseNo} created for product ${product.sku} and supplier ${supplier.name}`);
      }
    } else if (!currentSupplierId) {
      // 2. If supplier was UNLINKED / REMOVED from product:
      const targetPurchaseId = product.purchaseId || prevPurchaseId;
      if (targetPurchaseId) {
        const purchase = await Purchase.findById(targetPurchaseId);
        if (purchase) {
          if (purchase.products.length <= 1) {
            // Revert supplier balance & delete purchase
            await Supplier.findByIdAndUpdate(purchase.supplierId, {
              $inc: { currentBalance: -(purchase.totalAmount || purchase.amount || 0) }
            });
            await Purchase.findByIdAndDelete(purchase._id);
            await MetalLedger.deleteMany({ referenceId: purchase._id, referenceModel: "Purchase" });
          } else {
            // Remove this product from multi-item purchase
            purchase.products = purchase.products.filter(p => p.toString() !== product._id.toString());
            const deduct = Number(prevPurchaseCost) || 0;
            purchase.amount = Math.max(0, (purchase.amount || 0) - deduct);
            purchase.totalAmount = purchase.amount;
            await purchase.save();
            await Supplier.findByIdAndUpdate(purchase.supplierId, {
              $inc: { currentBalance: -deduct }
            });
          }
        }
        await Product.findByIdAndUpdate(product._id, { purchaseId: null });
        product.purchaseId = null;
      }
    }
  } catch (err) {
    console.error("🔥 Error syncing product purchase:", err);
  }
};

/* ======================================================
   CREATE PRODUCT
   ====================================================== */
export const createProduct = async (req, res) => {
  try {
    const data = sanitizeProductData(req.body);

    const product = new Product({
      ...data,

      images: req.files && req.files.length > 0
        ? req.files.map(file => `/uploads/${file.filename}`)
        : [],
    });

    await product.save();
    clearProductCache();

    // 🔗 Sync Purchase & Supplier Ledger
    await syncProductPurchase(product);

    const freshProduct = await Product.findById(product._id);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: freshProduct || product,
    });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

import { setCache, getCache, clearProductCache } from "../utils/productCache.js";

/* ---------- FETCH PRODUCTS (WITH CACHING) ---------- */
export const getProducts = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 12, 50);
    const skip = (page - 1) * limit;

    // 🔑 Create unique cache key based on all query params
    const cacheKey = `products_${JSON.stringify(req.query)}`;
    const cachedData = getCache(cacheKey);

    if (cachedData) {
      console.log("🚀 Serving products from Cache...");
      return res.json(cachedData);
    }

    const filter = {};
    const search = req.query.search?.trim();

    /* ---------- SEARCH ---------- */
    if (search) {
      filter.$or = [
        { title: new RegExp(search, "i") },
        { sku: new RegExp(search, "i") },
        { huid: new RegExp(search, "i") },
        { "certificates.certificateNo": new RegExp(search, "i") },
        { jewelleryCategory: new RegExp(search, "i") },
      ];
    }

    /* ---------- FILTERS ---------- */
    if (req.query.jewelleryCategory)
      filter.jewelleryCategory = req.query.jewelleryCategory;

    if (req.query.productType)
      filter.productType = req.query.productType;

    if (req.query.metalType)
      filter.metalType = new RegExp(req.query.metalType, "i");

    if (req.query.metalPurity)
      filter.metalPurity = req.query.metalPurity.toUpperCase();

    if (req.query.targetAudience)
      filter.targetAudience = req.query.targetAudience.toUpperCase();

    if (req.query.componentType)
      filter["components.type"] = new RegExp(req.query.componentType, "i");

    if (req.query.inStock === "true")
      filter.stock = { $gt: 0 };

    const sortOption = req.query.sort || "latest";
    let sort = { createdAt: -1 }; // Default

    if (sortOption === "latest") sort = { createdAt: -1 };
    else if (sortOption === "oldest") sort = { createdAt: 1 };
    else if (sortOption === "sku-asc") sort = { sku: 1 };
    else if (sortOption === "sku-desc") sort = { sku: -1 };
    else if (sortOption === "title-asc") sort = { title: 1 };
    else if (sortOption === "title-desc") sort = { title: -1 };
    else if (sortOption === "stock-desc") sort = { stock: -1 };

    /* ---------- FETCH PRODUCTS ---------- */
    const hasPriceFilter = req.query.minPrice !== undefined || req.query.maxPrice !== undefined;
    const hasPriceSort = sortOption === "price-asc" || sortOption === "price-desc";
    const hasSkuSort = sortOption === "sku-asc" || sortOption === "sku-desc";

    if (hasPriceFilter || hasPriceSort || hasSkuSort) {
      // 1. Fetch ALL matching products (without skip/limit)
      // If we are overriding sort in memory, just sort by default createdAt first
      const dbSort = (hasPriceSort || hasSkuSort) ? { createdAt: -1 } : sort;

      const productsRaw = await Product.find(filter)
        .sort(dbSort)
        .collation({ locale: "en", numericOrdering: true })
        .lean();

      // 2. Load active rate config
      const rateConfig = await RateConfig.findOne({ active: true });
      if (!rateConfig) {
        return res.status(500).json({
          success: false,
          message: "No active rate configuration found",
        });
      }

      // 3. Calculate pricing for ALL matching products
      let productsPriced = await Promise.all(
        productsRaw.map(async (product) => {
          try {
            const wrappedItem = {
              quantity: 1,
              customSnapshot: {
                productDetails: JSON.parse(JSON.stringify(product)),
              },
            };
            const breakup = await calculateItem(wrappedItem, rateConfig);
            return {
              ...product,
              images: (product.images || []).map(normalizeImage),
              pricing: breakup,
            };
          } catch (err) {
            console.error("Price calculation failed for:", product.sku, err);
            return {
              ...product,
              pricing: null,
            };
          }
        })
      );

      // 4. Apply price range filtering
      if (req.query.minPrice !== undefined) {
        const minVal = Number(req.query.minPrice);
        if (!isNaN(minVal)) {
          productsPriced = productsPriced.filter(
            p => (p.pricing?.payable ?? p.pricing?.grandTotal ?? 0) >= minVal
          );
        }
      }
      if (req.query.maxPrice !== undefined) {
        const maxVal = Number(req.query.maxPrice);
        if (!isNaN(maxVal)) {
          productsPriced = productsPriced.filter(
            p => (p.pricing?.payable ?? p.pricing?.grandTotal ?? 0) <= maxVal
          );
        }
      }

      // 5. Apply sorting in memory if requested
      if (sortOption === "price-asc") {
        productsPriced.sort((a, b) => {
          const priceA = a.pricing?.payable ?? a.pricing?.grandTotal ?? 0;
          const priceB = b.pricing?.payable ?? b.pricing?.grandTotal ?? 0;
          return priceA - priceB;
        });
      } else if (sortOption === "price-desc") {
        productsPriced.sort((a, b) => {
          const priceA = a.pricing?.payable ?? a.pricing?.grandTotal ?? 0;
          const priceB = b.pricing?.payable ?? b.pricing?.grandTotal ?? 0;
          return priceB - priceA;
        });
      } else if (sortOption === "sku-asc") {
        productsPriced.sort((a, b) => {
          const numA = parseInt(String(a.sku || "").replace(/\D/g, "")) || 0;
          const numB = parseInt(String(b.sku || "").replace(/\D/g, "")) || 0;
          return numA - numB;
        });
      } else if (sortOption === "sku-desc") {
        productsPriced.sort((a, b) => {
          const numA = parseInt(String(a.sku || "").replace(/\D/g, "")) || 0;
          const numB = parseInt(String(b.sku || "").replace(/\D/g, "")) || 0;
          return numB - numA;
        });
      }

      // 6. Paginate
      const total = productsPriced.length;
      const paginatedProducts = productsPriced.slice(skip, skip + limit);

      const responseData = {
        success: true,
        products: paginatedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };

      setCache(cacheKey, responseData);
      return res.json(responseData);
    } else {
      // original optimized path when no price filter or price sort is applied
      const [productsRaw, total] = await Promise.all([
        Product.find(filter)
          .sort(sort)
          .collation({ locale: "en", numericOrdering: true })
          .skip(skip)
          .limit(limit)
          .lean(),
        Product.countDocuments(filter),
      ]);

      const rateConfig = await RateConfig.findOne({ active: true });
      if (!rateConfig) {
        return res.status(500).json({
          success: false,
          message: "No active rate configuration found",
        });
      }

      const products = await Promise.all(
        productsRaw.map(async (product) => {
          try {
            const wrappedItem = {
              quantity: 1,
              customSnapshot: {
                productDetails: JSON.parse(JSON.stringify(product)),
              },
            };
            const breakup = await calculateItem(wrappedItem, rateConfig);
            return {
              ...product,
              images: (product.images || []).map(normalizeImage),
              pricing: breakup,
            };
          } catch (err) {
            console.error("Price calculation failed for:", product.sku, err);
            return {
              ...product,
              pricing: null,
            };
          }
        })
      );

      const responseData = {
        success: true,
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };

      setCache(cacheKey, responseData);
      return res.json(responseData);
    }

  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Fetch failed",
    });
  }
};

export const getInventorySummary = async (req, res) => {
  try {
    const search = req.query.search?.trim();
    const inStockOnly = req.query.inStock === "true";

    const filter = {};

    if (search) {
      filter.$or = [
        { title: new RegExp(search, "i") },
        { sku: new RegExp(search, "i") },
        { jewelleryCategory: new RegExp(search, "i") },
        { metalType: new RegExp(search, "i") },
      ];
    }

    if (inStockOnly) {
      filter.stock = { $gt: 0 };
    }

    if (req.query.targetAudience) {
      filter.targetAudience = req.query.targetAudience.toUpperCase();
    }

    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();

    const summary = {
      totalProducts: products.length,
      totalUnits: 0,
      totalMetalWeight: 0,
      totalGrossWeight: 0,
      totalFineGold: 0,
      totalDiamondWeight: 0,
      totalDiamondPieces: 0,
      totalStoneWeight: 0,
      totalStonePieces: 0,
      metals: {},
      metalGroups: {},
      categories: {},
      diamonds: {},
      stones: {},
    };

    const rows = products.map((product) => {
      const stock = Number(product.stock || 0);
      const netWeight = Number(product.netWeight || 0);
      const grossWeight = Number(product.grossWeight || 0);
      const fineGold = Number(product.fineGold || 0);
      const components = Array.isArray(product.components) ? product.components : [];

      const row = {
        _id: product._id,
        title: product.title,
        sku: product.sku || "-",
        jewelleryCategory: product.jewelleryCategory || "-",
        productType: product.productType || "-",
        metalType: product.metalType || "-",
        metalPurity: product.metalPurity || "-",
        targetAudience: product.targetAudience || "UNISEX",
        stock,
        netWeight,
        grossWeight,
        fineGold,
        totalMetalWeight: netWeight * stock,
        totalGrossWeight: grossWeight * stock,
        totalFineGold: fineGold * stock,
        diamondWeight: 0,
        diamondPieces: 0,
        stoneWeight: 0,
        stonePieces: 0,

        diamondGrossWeight: 0,
        stoneGrossWeight: 0,

        componentDetails: [],
      };

      summary.totalUnits += stock;
      summary.totalMetalWeight += row.totalMetalWeight;
      summary.totalGrossWeight += row.totalGrossWeight;
      summary.totalFineGold += row.totalFineGold;

      const metalKey = `${row.metalType} ${row.metalPurity}`.trim();
      const metalGroupKey = (row.metalType || "Other").trim() || "Other";

      if (!summary.metals[metalKey]) {
        summary.metals[metalKey] = {
          metalType: row.metalType,
          metalPurity: row.metalPurity,
          units: 0,
          metalWeight: 0,
          grossWeight: 0,
          fineGold: 0,
        };
      }

      summary.metals[metalKey].units += stock;
      summary.metals[metalKey].metalWeight += row.totalMetalWeight;
      summary.metals[metalKey].grossWeight += row.totalGrossWeight;
      summary.metals[metalKey].fineGold += row.totalFineGold;

      if (!summary.metalGroups[metalGroupKey]) {
        summary.metalGroups[metalGroupKey] = {
          metalType: metalGroupKey,
          units: 0,
          metalWeight: 0,
          grossWeight: 0,
          fineGold: 0,
          purities: {},
        };
      }

      summary.metalGroups[metalGroupKey].units += stock;
      summary.metalGroups[metalGroupKey].metalWeight += row.totalMetalWeight;
      summary.metalGroups[metalGroupKey].grossWeight += row.totalGrossWeight;
      summary.metalGroups[metalGroupKey].fineGold += row.totalFineGold;

      if (!summary.metalGroups[metalGroupKey].purities[metalKey]) {
        summary.metalGroups[metalGroupKey].purities[metalKey] = {
          metalType: row.metalType,
          metalPurity: row.metalPurity,
          units: 0,
          metalWeight: 0,
          grossWeight: 0,
          fineGold: 0,
        };
      }

      summary.metalGroups[metalGroupKey].purities[metalKey].units += stock;
      summary.metalGroups[metalGroupKey].purities[metalKey].metalWeight += row.totalMetalWeight;
      summary.metalGroups[metalGroupKey].purities[metalKey].grossWeight += row.totalGrossWeight;
      summary.metalGroups[metalGroupKey].purities[metalKey].fineGold += row.totalFineGold;

      const categoryKey = (row.jewelleryCategory || "Uncategorized").trim() || "Uncategorized";
      if (!summary.categories[categoryKey]) {
        summary.categories[categoryKey] = {
          category: categoryKey,
          productCount: 0,
          unitCount: 0,
          metalWeight: 0,
          grossWeight: 0,
          fineGold: 0,
          products: [],
        };
      }

      summary.categories[categoryKey].productCount += 1;
      summary.categories[categoryKey].unitCount += stock;
      summary.categories[categoryKey].metalWeight += row.totalMetalWeight;
      summary.categories[categoryKey].grossWeight += row.totalGrossWeight;
      summary.categories[categoryKey].fineGold += row.totalFineGold;
      summary.categories[categoryKey].products.push({
        _id: row._id,
        title: row.title,
        sku: row.sku,
        stock: row.stock,
        metalType: row.metalType,
        metalPurity: row.metalPurity,
        totalMetalWeight: row.totalMetalWeight,
        totalGrossWeight: row.totalGrossWeight,
        totalFineGold: row.totalFineGold,
      });

      components.forEach((component) => {
        const type = String(component.type || "Unknown").trim() || "Unknown";
        const count = Number(component.count || 0);
        const weight = Number(component.weight || 0);
        const grossWeight = Number(component.grossWeight || 0);
        const totalGrossWeight = grossWeight * stock;
        const totalCount = count * stock;
        const effectiveWeight =
          grossWeight > 0 ? grossWeight : weight * count;

        const totalWeight = effectiveWeight * stock;
        // const totalWeight = grossWeight * stock;
        const normalizedType = type.toLowerCase();
        const isDiamond = normalizedType.includes("diamond");

        const detail = {
          type,
          role: component.componentRole || "",
          category: component.category || "",
          perProductPieces: count,
          totalPieces: totalCount,
          perProductWeight: weight,
          totalWeight,
          perProductGrossWeight: grossWeight,
          totalGrossWeight,
        };

        row.componentDetails.push(detail);

        if (isDiamond) {
          row.diamondPieces += totalCount;
          row.diamondWeight += totalWeight;
          row.diamondGrossWeight += totalGrossWeight;

          summary.totalDiamondPieces += totalCount;
          summary.totalDiamondWeight += totalWeight;

          if (!summary.diamonds[type]) {
            summary.diamonds[type] = { type, pieces: 0, weight: 0 };
          }

          summary.diamonds[type].pieces += totalCount;
          summary.diamonds[type].weight += totalWeight;
        } else {
          row.stonePieces += totalCount;
          row.stoneWeight += totalWeight;
          row.stoneGrossWeight += totalGrossWeight;
          summary.totalStonePieces += totalCount;
          summary.totalStoneWeight += totalWeight;

          if (!summary.stones[type]) {
            summary.stones[type] = { type, pieces: 0, weight: 0 };
          }

          summary.stones[type].pieces += totalCount;
          summary.stones[type].weight += totalWeight;
        }
      });

      return row;
    });

    const sortedRows = rows.sort((a, b) => {
      const categoryCompare = String(a.jewelleryCategory || "").localeCompare(
        String(b.jewelleryCategory || ""),
        undefined,
        { sensitivity: "base" }
      );

      if (categoryCompare !== 0) return categoryCompare;

      return String(a.sku || "").localeCompare(String(b.sku || ""), undefined, {
        sensitivity: "base",
        numeric: true,
      });
    });

    res.json({
      success: true,
      summary: {
        ...summary,
        metals: Object.values(summary.metals).sort((a, b) => b.metalWeight - a.metalWeight),
        metalGroups: Object.values(summary.metalGroups)
          .map((group) => ({
            ...group,
            purities: Object.values(group.purities).sort((a, b) => b.metalWeight - a.metalWeight),
          }))
          .sort((a, b) => b.metalWeight - a.metalWeight),
        categories: Object.values(summary.categories)
          .map((category) => ({
            ...category,
            products: category.products.sort((a, b) => b.stock - a.stock),
          }))
          .sort((a, b) => b.unitCount - a.unitCount),
        diamonds: Object.values(summary.diamonds).sort((a, b) => b.weight - a.weight),
        stones: Object.values(summary.stones).sort((a, b) => b.weight - a.weight),
      },
      products: sortedRows,
    });
  } catch (error) {
    console.error("GET INVENTORY SUMMARY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Inventory summary fetch failed",
    });
  }
};
/* ======================================================
   GET PRODUCT (SKU / ID)
   ====================================================== */

export const getProductBySku = async (req, res) => {
  try {
    /* ---------- FIND PRODUCT ---------- */
    const product = await Product.findOne({
      sku: new RegExp(`^${req.params.sku}$`, "i"),
    }).populate("supplierId", "name mobile gstNumber");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    /* ---------- LOAD ACTIVE RATE CONFIG ---------- */
    const rateConfig = await RateConfig.findOne({ active: true });

    if (!rateConfig) {
      return res.status(500).json({
        success: false,
        message: "No active rate configuration found",
      });
    }

    /* ---------- WRAP FOR ENGINE (NO ENGINE CHANGE) ---------- */
    const wrappedItem = {
      quantity: 1,
      customSnapshot: {
        // productDetails: product,
        productDetails: JSON.parse(JSON.stringify(product))
      },
    };

    /* ---------- CALCULATE PRICING ---------- */
    const breakup = await calculateItem(wrappedItem, rateConfig);

    /* ---------- RESPONSE ---------- */
    res.json({
      success: true,
      product: {
        //  ...product,
        ...product._doc,
        images: (product.images || []).map(normalizeImage),
        pricing: breakup,
      },
    });

  } catch (error) {
    console.error("GET PRODUCT BY SKU ERROR:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("supplierId", "name mobile gstNumber");
    if (!product)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ======================================================
   UPDATE PRODUCT (SKU / ID)
   ====================================================== */
// export const updateProductBySku = async (req, res) => {
//   try {
//     const data = sanitizeProductData(req.body);
//     // if (req.file) data.image = req.file.path.replace(/\\/g, "/");
// if (req.files && req.files.length > 0) {
//   // data.images = req.files.map(file =>
//   //   file.path.replace(/\\/g, "/")
//   // );
//   data.images = req.files.map(file =>
//   `/uploads/${file.filename}`
// );
// }
//     const product = await Product.findOneAndUpdate(
//       { sku: req.params.sku },
//       data,
//       { new: true, runValidators: false }
//     );

//     if (!product)
//       return res.status(404).json({ success: false, message: "Not found" });

//     res.json({ success: true, product });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// export const updateProduct = async (req, res) => {
//   try {
//     const data = sanitizeProductData(req.body);

//     // Find existing product first
//     const existingProduct = await Product.findById(req.params.id);
//     if (!existingProduct)
//       return res.status(404).json({ success: false, message: "Not found" });

//     // If new images uploaded → append them
//     if (req.files && req.files.length > 0) {
//       // const newImages = req.files.map(file =>
//       //   file.path.replace(/\\/g, "/")
//       // );
//       const newImages = req.files.map(file =>
//   `/uploads/${file.filename}`
// );

//       data.images = [
//         ...(existingProduct.images || []),
//         ...newImages
//       ];
//     }

//     const updatedProduct = await Product.findByIdAndUpdate(
//       req.params.id,
//       data,
//       { new: true, runValidators: false }
//     );

//     res.json({ success: true, product: updatedProduct });

//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };



export const updateProductBySku = async (req, res) => {
  try {
    const data = sanitizeProductData(req.body);

    const existing = await Product.findOne({ sku: req.params.sku });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const prevState = {
      prevSupplierId: existing.supplierId ? existing.supplierId.toString() : null,
      prevPurchaseCost: Number(existing.purchaseCost) || 0,
      prevPurchaseId: existing.purchaseId,
    };

    /* ---------- HANDLE IMAGES ---------- */
    let finalImages = data.existingImages || [];

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(
        (file) => `/uploads/${file.filename}`
      );
      finalImages = [...finalImages, ...newImages];
    }
    data.images = finalImages;

    /* ---------- 🔥 FORCE SAFE UPDATE ---------- */
    Object.keys(data).forEach((key) => {
      if (key !== "components") {
        existing[key] = data[key];
      }
    });

    if (Array.isArray(data.components)) {
      // existing.components = data.components;
      // existing.markModified("components"); // 🔥 VERY IMPORTANT
      existing.set("components", data.components);
    }

    const savedProduct = await existing.save();
    clearProductCache();

    // 🔗 Sync Purchase & Supplier Ledger
    await syncProductPurchase(savedProduct, prevState);

    const freshProduct = await Product.findById(savedProduct._id);

    // 🔥 DEBUG AFTER SAVE
    console.log(
      "✅ SAVED COMPONENTS:",
      JSON.stringify(savedProduct.components, null, 2)
    );

    res.json({
      success: true,
      product: freshProduct || savedProduct,
    });

  } catch (error) {
    console.error("UPDATE BY SKU ERROR:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const data = sanitizeProductData(req.body);

    const existingProduct = await Product.findById(req.params.id);

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const prevState = {
      prevSupplierId: existingProduct.supplierId ? existingProduct.supplierId.toString() : null,
      prevPurchaseCost: Number(existingProduct.purchaseCost) || 0,
      prevPurchaseId: existingProduct.purchaseId,
    };

    /* ---------- HANDLE IMAGES ---------- */
    let finalImages = data.existingImages || [];

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(
        (file) => `/uploads/${file.filename}`
      );
      finalImages = [...finalImages, ...newImages];
    }
    data.images = finalImages;

    /* ---------- 🔥 SAFE FIELD UPDATE ---------- */
    Object.keys(data).forEach((key) => {
      if (key !== "components") {
        existingProduct[key] = data[key];
      }
    });

    // ⭐ CRITICAL FIX

    if (Array.isArray(data.components)) {
      // existingProduct.components = data.components;
      // existingProduct.markModified("components"); // 🔥 IMPORTANT'
      // existing.set("components", data.components);
      existingProduct.set("components", data.components);
    }

    const savedProduct = await existingProduct.save();
    clearProductCache();

    // 🔗 Sync Purchase & Supplier Ledger
    await syncProductPurchase(savedProduct, prevState);

    const freshProduct = await Product.findById(savedProduct._id);

    res.json({
      success: true,
      product: freshProduct || savedProduct,
    });

  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


/* ======================================================
   DELETE PRODUCT
   ====================================================== */
export const deleteProductBySku = async (req, res) => {
  try {
    const product = await Product.findOne({ sku: req.params.sku });
    if (!product)
      return res.status(404).json({ success: false, message: "Not found" });

    // Revert purchase & supplier balance if linked
    if (product.purchaseId) {
      const purchase = await Purchase.findById(product.purchaseId);
      if (purchase) {
        if (purchase.products.length <= 1) {
          await Supplier.findByIdAndUpdate(purchase.supplierId, {
            $inc: { currentBalance: -(purchase.totalAmount || purchase.amount || 0) }
          });
          await Purchase.findByIdAndDelete(purchase._id);
          await MetalLedger.deleteMany({ referenceId: purchase._id, referenceModel: "Purchase" });
        } else {
          purchase.products = purchase.products.filter(p => p.toString() !== product._id.toString());
          const deduct = Number(product.purchaseCost) || 0;
          purchase.amount = Math.max(0, (purchase.amount || 0) - deduct);
          purchase.totalAmount = purchase.amount;
          await purchase.save();
          await Supplier.findByIdAndUpdate(purchase.supplierId, {
            $inc: { currentBalance: -deduct }
          });
        }
      }
    }

    await Product.findOneAndDelete({ sku: req.params.sku });
    clearProductCache();
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: "Not found" });

    // Revert purchase & supplier balance if linked
    if (product.purchaseId) {
      const purchase = await Purchase.findById(product.purchaseId);
      if (purchase) {
        if (purchase.products.length <= 1) {
          await Supplier.findByIdAndUpdate(purchase.supplierId, {
            $inc: { currentBalance: -(purchase.totalAmount || purchase.amount || 0) }
          });
          await Purchase.findByIdAndDelete(purchase._id);
          await MetalLedger.deleteMany({ referenceId: purchase._id, referenceModel: "Purchase" });
        } else {
          purchase.products = purchase.products.filter(p => p.toString() !== product._id.toString());
          const deduct = Number(product.purchaseCost) || 0;
          purchase.amount = Math.max(0, (purchase.amount || 0) - deduct);
          purchase.totalAmount = purchase.amount;
          await purchase.save();
          await Supplier.findByIdAndUpdate(purchase.supplierId, {
            $inc: { currentBalance: -deduct }
          });
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    clearProductCache();
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
