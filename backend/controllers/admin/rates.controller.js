


import RateConfig from "../../models/RateConfig.js";
import { clearProductCache } from "../../utils/productCache.js";

/* ================= CREATE RATE (AUTO ACTIVATE) ================= */
export const createRateConfig = async (req, res) => {
  try {
    const {
      /* ===== METAL BASE ===== */
      gold24KT,
      silver999,
      platinum950,

      /* ===== MAKING ===== */
      makingCharge = 0,
      minMakingWeight = 0,
      minMakingFlatFee = 0,

      diamondRate,   // ✅ ADD
      stoneRate,      // ✅ ADD


      /* ===== TAX ===== */
      gstRate = 3,

      /* ===== DISCOUNTS ===== */
      makingDiscountType = "none",
      makingDiscountValue = 0,

      diamondDiscountType = "none",
      diamondDiscountValue = 0,

      stoneDiscountType = "none",
      stoneDiscountValue = 0,
      discountEnabled = true,
    } = req.body;

    /* ===== VALIDATION ===== */
    if (
      gold24KT == null ||
      silver999 == null ||
      platinum950 == null
    ) {
      return res.status(400).json({
        success: false,
        error: "Gold, Silver, Platinum rates are required",
      });
    }

    const validTypes = ["none", "percent", "flat"];
    if (
      !validTypes.includes(makingDiscountType) ||
      !validTypes.includes(diamondDiscountType) ||
      !validTypes.includes(stoneDiscountType)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid discount type",
      });
    }

    /* ===== DEACTIVATE OLD ===== */
    await RateConfig.updateMany(
      { active: true },
      { $set: { active: false } }
    );

    /* ===== CREATE NEW ===== */
    const rate = await RateConfig.create({
      gold24KT,
      silver999,
      platinum950,

      diamondRate,
      stoneRate,

      makingCharge,
      minMakingWeight,
      minMakingFlatFee,

      gstRate,

      makingDiscountType,
      makingDiscountValue,

      diamondDiscountType,
      diamondDiscountValue,

      stoneDiscountType,
      stoneDiscountValue,
      discountEnabled,
      active: true,
    });

    clearProductCache();
    res.json({ success: true, rate });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/* ================= GET ACTIVE RATE ================= */
export const getActiveRates = async (req, res) => {
  try {
    const rates = await RateConfig.findOne({ active: true }).lean();

    if (!rates) {
      return res.json({
        success: true,
        rates: null
      });
    }

    res.json({ success: true, rates });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/* ================= UPDATE RATE ================= */
export const updateRateConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const rate = await RateConfig.findById(id);

    if (!rate) {
      return res.status(404).json({
        success: false,
        error: "Rate config not found",
      });
    }

    if (req.body.active === true) {
      await RateConfig.updateMany(
        { _id: { $ne: id } },
        { $set: { active: false } }
      );
    }

    Object.assign(rate, req.body);
    await rate.save();

    clearProductCache();
    res.json({ success: true, rate });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/* ================= RATE HISTORY ================= */
export const getAllRateConfigs = async (req, res) => {
  try {
    const rates = await RateConfig.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, rates });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
