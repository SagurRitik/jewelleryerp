import RateConfig from "../models/RateConfig.js";
import Quotation from "../models/Quotation.js";
import Order from "../models/Order.js";
import calculateItem from "../utils/calculateItem.js";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/* Save an in-memory multer file buffer to disk and return the filename */
const saveUploadedFile = async (file) => {
  const uniqueSuffix = Date.now() + "-" + crypto.randomBytes(4).toString("hex");
  const filename = `quotation-${uniqueSuffix}.webp`;
  const outputPath = path.join(UPLOADS_DIR, filename);
  await sharp(file.buffer)
    .resize(800, 800, { fit: "inside", withoutEnlargement: true })
    .toFormat("webp")
    .webp({ quality: 80 })
    .toFile(outputPath);
  return filename;
};

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

/* ================= BUILD ITEM ==================== */
function buildCalcItem(item) {
  return {
    quantity: Number(item.quantity || 1),
    discountEnabled: item.discountEnabled !== false,
    customSnapshot: {
      discountEnabled: item.discountEnabled !== false,
      productDetails: {
        metalType: item.metalType || "gold",
        metalPurity: item.metalPurity || "18KT",
        netWeight: Number(item.netWeight || 0),
        components: (item.components || []).map((c) => ({
          type: c.type || "",
          pricingRef: c.pricingRef || "DIAMOND",
          shape: c.shape || "",
          color: c.color || "",
          clarity: c.clarity || "",
          weight: Number(c.weight || 0),
          count: Number(c.count || 1),
          grossWeight: Number(c.grossWeight || 0),
          rateOverride: Number(c.rateOverride || 0),
          rateType: c.rateType || "PER_CT",
          size: c.size || "",
          category: c.category || "",
          description: c.description || "",
        })),

      },
    },
  };
}

/* ================================================= */
/* ================= CALCULATE (stateless) ========= */
/* ================================================= */
export const calculateQuotation = async (req, res) => {
  try {
    let { items = [] } = req.body;

    if (typeof items === "string") {
      try { items = JSON.parse(items); } catch (e) { items = []; }
    }

    const rates = await RateConfig.findOne({ active: true }).lean();
    if (!rates) {
      return res.status(400).json({ success: false, error: "Rate config not found. Please configure rates first." });
    }

    const calculatedItems = await Promise.all(
      (items || []).map(async (item, idx) => {
        if (!item) return null;
        try {
          const calcItem = buildCalcItem(item);
          const breakup = await calculateItem(calcItem, rates);
          
          const sanitizedBreakup = {
            metalRate: round2(breakup.metalRate || 0),
            metalValue: round2(breakup.metalValue || 0),
            diamondValue: round2(breakup.diamondValue || 0),
            stoneValue: round2(breakup.stoneValue || 0),
            makingCharge: round2(breakup.makingCharge || 0),
            grossTotal: round2(breakup.grossTotal || 0),
            discountDiamond: round2(breakup.discountDiamond || 0),
            discountStone: round2(breakup.discountStone || 0),
            discountMaking: round2(breakup.discountMaking || 0),
            discount: round2(breakup.discount || 0),
            subtotal: round2(breakup.subtotal || 0),
            gst: round2(breakup.gst || 0),
            gstPercent: round2(breakup.gstPercent || 3),
            grandTotal: round2(breakup.grandTotal || 0),
            netWeight: round2(breakup.netWeight || 0),
            componentBreakup: breakup.componentBreakup || [],
          };

          return { ...item, breakup: sanitizedBreakup };
        } catch (itemErr) {
          console.error(`❌ Item calc error ${idx}:`, itemErr.message);
          return { ...item, breakup: null, error: itemErr.message };
        }
      })
    ).then(results => results.filter(Boolean));

    // Aggregate totals
    const subtotal = round2(calculatedItems.reduce((s, i) => s + (i.breakup?.subtotal || 0), 0));
    const gstTotal = round2(calculatedItems.reduce((s, i) => s + (i.breakup?.gst || 0), 0));
    const grandTotal = round2(calculatedItems.reduce((s, i) => s + (i.breakup?.grandTotal || 0), 0));

    return res.json({
      success: true,
      items: calculatedItems,
      totals: { subtotal, gstTotal, grandTotal },
      rates: {
        gold24KT: rates.gold24KT,
        silver999: rates.silver999,
        platinum950: rates.platinum950,
        makingCharge: rates.makingCharge,
        goldMakingCharge: rates.goldMakingCharge,
        silverMakingCharge: rates.silverMakingCharge,
        platinumMakingCharge: rates.platinumMakingCharge,
        gstRate: rates.gstRate,
      },
    });
  } catch (err) {
    console.error("❌ calculateQuotation error:", err);
    res.status(500).json({ success: false, error: err.message, stack: err.stack });
  }
};

/* ================================================= */
/* ================= CREATE ======================== */
/* ================================================= */
export const createQuotation = async (req, res) => {
  try {
    console.log("📝 START: createQuotation");
    let { 
      customerName, mobile, email, address, 
      items = [], validDays = 7, notes = "", status = "DRAFT" 
    } = req.body;
    
    console.log("📂 Files received:", req.files?.length || 0);
    if (req.files?.length > 0) {
      console.log("📄 Fieldnames:", req.files.map(f => f.fieldname));
    }


    if (typeof items === "string") {
      try { 
        items = JSON.parse(items); 
      } catch (e) { 
        console.error("❌ JSON Parse Error (items):", e.message);
        items = []; 
      }
    }


    // 1. Basic Validation
    if (!customerName?.trim()) {
      return res.status(400).json({ success: false, error: "Customer name is required" });
    }

    // 2. Get Rates
    const rates = await RateConfig.findOne({ active: true }).lean();
    if (!rates) {
      return res.status(400).json({ success: false, error: "Rate config not found." });
    }

    // 3. Re-calculate server-side
    const calculatedItems = [];
    const s = (val) => {
      const n = Number(val);
      return isNaN(n) || !isFinite(n) ? 0 : round2(n);
    };

    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      if (!item) continue;

      try {
        const calcItem = buildCalcItem(item);
        const breakup = await calculateItem(calcItem, rates);
        
        const sanitizedBreakup = {
          metalRate: s(breakup.metalRate),
          metalValue: s(breakup.metalValue),
          diamondValue: s(breakup.diamondValue),
          stoneValue: s(breakup.stoneValue),
          makingCharge: s(breakup.makingCharge),
          grossTotal: s(breakup.grossTotal),
          discountDiamond: s(breakup.discountDiamond),
          discountStone: s(breakup.discountStone),
          discountMaking: s(breakup.discountMaking),
          discount: s(breakup.discount),
          subtotal: s(breakup.subtotal),
          gst: s(breakup.gst),
          gstPercent: s(breakup.gstPercent || 3),
          grandTotal: s(breakup.grandTotal),
          netWeight: s(breakup.netWeight),
          componentBreakup: (breakup.componentBreakup || []).map(cb => ({
            ...cb, value: s(cb.value), rate: s(cb.rate), weight: s(cb.weight), count: Number(cb.count || 0),
          })),
        };

        // Handle Images — save buffers to disk (memoryStorage has no filename)
        const fieldName = `images_${idx}`;
        const itemFiles = (req.files || []).filter(f => f.fieldname === fieldName);
        const uploadedImages = await Promise.all(
          itemFiles.map(async (f) => {
            const filename = await saveUploadedFile(f);
            return `/uploads/${filename}`;
          })
        );
        // Combine existing strings (already saved) + newly uploaded
        const existingStrings = (item.images || []).filter(img => typeof img === "string" && img !== "/uploads/undefined");
        const finalImages = [...existingStrings, ...uploadedImages];

        calculatedItems.push({
          title: item.title || `Jewellery Item ${idx + 1}`,
          metalType: item.metalType || "gold",
          metalPurity: item.metalPurity || "18KT",
          netWeight: s(item.netWeight),
          grossWeight: s(item.grossWeight),
          fineGold: s(item.fineGold),
          description: item.description || "",
          huid: item.huid || "",
          hsnCode: item.hsnCode || "",
          quantity: Number(item.quantity || 1),
          discountEnabled: item.discountEnabled !== false,
          images: finalImages,
          components: (item.components || []).map(c => ({
            ...c, 
            weight: s(c.weight), 
            count: Number(c.count || 1), 
            grossWeight: s(c.grossWeight),
            rateOverride: s(c.rateOverride),
            rateType: c.rateType || "PER_CT",
          })),
          breakup: sanitizedBreakup,

        });
      } catch (itemErr) {
        throw new Error(`Item ${idx + 1} calculation failed: ${itemErr.message}`);
      }
    }

    const sum = (arr, key) => arr.reduce((acc, curr) => acc + (curr.breakup?.[key] || 0), 0);
    const subtotal = round2(sum(calculatedItems, "subtotal"));
    const gstTotal = round2(sum(calculatedItems, "gst"));
    const grandTotal = round2(sum(calculatedItems, "grandTotal"));

    const quotation = await Quotation.create({
      customerName: customerName.trim(),
      mobile: mobile?.trim() || "",
      email: email?.trim() || "",
      address: address?.trim() || "",
      items: calculatedItems,
      subtotal,
      gstTotal,
      grandTotal,
      validDays: Number(validDays) || 7,
      notes: notes?.trim() || "",
      status,
      createdBy: req.user?._id
    });

    return res.status(201).json({ success: true, quotation });
  } catch (err) {
    console.error("❌ createQuotation error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================================================= */
/* ================= LIST ========================= */
/* ================================================= */
export const listQuotations = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20, from, to } = req.query;
    const filter = {};
    if (status && status !== "ALL") filter.status = status;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }
    if (search?.trim()) {
      filter.$or = [
        { customerName: new RegExp(search.trim(), "i") },
        { mobile: new RegExp(search.trim(), "i") },
        { quotationNo: new RegExp(search.trim(), "i") },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [quotations, total] = await Promise.all([
      Quotation.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Quotation.countDocuments(filter),
    ]);
    return res.json({ success: true, quotations, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id).lean();
    if (!quotation) return res.status(404).json({ success: false, error: "Quotation not found" });
    return res.json({ success: true, quotation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================================================= */
/* ================= UPDATE ======================= */
/* ================================================= */
export const updateQuotation = async (req, res) => {
  try {
    console.log("📝 START: updateQuotation", req.params.id);
    const existing = await Quotation.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: "Quotation not found" });

    let { customerName, mobile, email, address, items = [], validDays, notes, status } = req.body;
    
    console.log("📂 Update Files received:", req.files?.length || 0);

    if (typeof items === "string") {
      try { items = JSON.parse(items); } catch (e) { items = []; }
    }

    const calculatedItems = [];
    
    if (req.body.items !== undefined) {
      const rates = await RateConfig.findOne({ active: true }).lean();
      if (!rates) return res.status(400).json({ success: false, error: "Rate config not found" });

      const s = (val) => {
        const n = Number(val);
        return isNaN(n) || !isFinite(n) ? 0 : round2(n);
      };

      for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx];
        if (!item) continue;
        
        const calcItem = buildCalcItem(item);
        const breakup = await calculateItem(calcItem, rates);
        
        const sanitizedBreakup = {
          metalRate: s(breakup.metalRate),
          metalValue: s(breakup.metalValue),
          diamondValue: s(breakup.diamondValue),
          stoneValue: s(breakup.stoneValue),
          makingCharge: s(breakup.makingCharge),
          grossTotal: s(breakup.grossTotal),
          discountDiamond: s(breakup.discountDiamond),
          discountStone: s(breakup.discountStone),
          discountMaking: s(breakup.discountMaking),
          discount: s(breakup.discount),
          subtotal: s(breakup.subtotal),
          gst: s(breakup.gst),
          gstPercent: s(breakup.gstPercent || 3),
          grandTotal: s(breakup.grandTotal),
          netWeight: s(breakup.netWeight),
          componentBreakup: (breakup.componentBreakup || []).map(cb => ({
            ...cb, value: s(cb.value), rate: s(cb.rate), weight: s(cb.weight), count: Number(cb.count || 0),
          })),
        };

        // Handle Images
        const fieldName = `images_${idx}`;
        const itemFiles = (req.files || []).filter(f => f.fieldname === fieldName);
        const uploadedImages = await Promise.all(
          itemFiles.map(async (f) => {
            const filename = await saveUploadedFile(f);
            return `/uploads/${filename}`;
          })
        );
        const existingStrings = (item.images || []).filter(img => typeof img === "string" && img !== "/uploads/undefined");
        const finalImages = [...existingStrings, ...uploadedImages];

        calculatedItems.push({
          title: item.title || `Jewellery Item ${idx + 1}`,
          metalType: item.metalType || "gold",
          metalPurity: item.metalPurity || "18KT",
          netWeight: s(item.netWeight),
          grossWeight: s(item.grossWeight),
          fineGold: s(item.fineGold),
          description: item.description || "",
          huid: item.huid || "",
          hsnCode: item.hsnCode || "",
          quantity: Number(item.quantity || 1),
          discountEnabled: item.discountEnabled !== false,
          images: finalImages,
          components: (item.components || []).map(c => ({
            ...c, 
            weight: s(c.weight), 
            count: Number(c.count || 1), 
            grossWeight: s(c.grossWeight),
            rateOverride: s(c.rateOverride),
            rateType: c.rateType || "PER_CT",
          })),
          breakup: sanitizedBreakup,
        });
      }
    }

    const sum = (arr, key) => arr.reduce((acc, curr) => acc + (curr.breakup?.[key] || 0), 0);
    existing.customerName = customerName?.trim() || existing.customerName;
    existing.mobile = mobile?.trim() ?? existing.mobile;
    existing.email = email?.trim() ?? existing.email;
    existing.address = address?.trim() ?? existing.address;
    
    // Only update items if they were provided in the request
    if (req.body.items !== undefined) {
      // Use .set() and .markModified() to ensure Mongoose detects deep array changes
      existing.set("items", calculatedItems);
      existing.markModified("items");
      
      existing.subtotal = round2(sum(calculatedItems, "subtotal"));
      existing.gstTotal = round2(sum(calculatedItems, "gst"));
      existing.grandTotal = round2(sum(calculatedItems, "grandTotal"));
    }

    if (validDays !== undefined) existing.validDays = Number(validDays) || existing.validDays;
    if (notes !== undefined) existing.notes = notes;
    if (status) existing.status = status;

    await existing.save();
    return res.json({ success: true, quotation: existing });
  } catch (err) {
    console.error("❌ updateQuotation error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteQuotation = async (req, res) => {
  try {
    const q = await Quotation.findById(req.params.id);
    if (!q) return res.status(404).json({ success: false, error: "Quotation not found" });
    q.status = "CANCELLED";
    await q.save();
    return res.json({ success: true, message: "Quotation cancelled" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const markSent = async (req, res) => {
  try {
    const q = await Quotation.findByIdAndUpdate(req.params.id, { status: "SENT" }, { new: true });
    return res.json({ success: true, quotation: q });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const convertToOrder = async (req, res) => {
  try {
    const q = await Quotation.findById(req.params.id);
    if (!q || q.status === "CONVERTED") return res.status(400).json({ success: false, error: "Invalid status" });
    const rates = await RateConfig.findOne({ active: true }).lean();
    
    // ... Simplified convert logic or keep existing
    const firstItem = q.items?.[0] || {};
    const orderNo = `NZD-ORD-${Date.now()}`; // Simplified for brevity here

    const order = await Order.create({
      orderNo,
      customer: { name: q.customerName, mobile: q.mobile, email: q.email, address: q.address },
      productSnapshot: { 
        title: firstItem.title, 
        jewelleryCategory: firstItem.jewelleryCategory,
        metalType: firstItem.metalType, 
        metalPurity: firstItem.metalPurity, 
        netWeight: firstItem.netWeight,
        components: firstItem.components,
        productImages: firstItem.images,
        description: firstItem.description,
      },
      status: "Placed"
    });


    q.status = "CONVERTED";
    q.convertedOrderId = order._id;
    await q.save();
    return res.json({ success: true, order, quotation: q });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const manualQuotation = calculateQuotation;