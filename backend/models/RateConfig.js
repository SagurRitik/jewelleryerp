

import mongoose from "mongoose";

const RateConfigSchema = new mongoose.Schema(
  {
    gold24KT: Number,
    silver999: Number,
    platinum950: Number,

    diamondRate: Number,
    stoneRate: Number,
    makingCharge: Number,
    goldMakingCharge: Number,
    silverMakingCharge: Number,
    platinumMakingCharge: Number,

    
    /* ✅ NEW: MINIMUM MAKING CHARGE CONFIG */
    minMakingWeight: { type: Number, default: 0 },   // e.g., 1.5
    minMakingFlatFee: { type: Number, default: 0 },  // e.g., 3000

    gstRate: { type: Number, default: 3 },

    /* ===== DIAMOND ===== */
    diamondDiscountType: {
      type: String,
      enum: ["none", "percent", "flat"],
      default: "none",
    },
    diamondDiscountValue: {
      type: Number,
      default: 0,
    },

    /* ===== STONE ===== */
    stoneDiscountType: {
      type: String,
      enum: ["none", "percent", "flat"],
      default: "none",
    },
    stoneDiscountValue: {
      type: Number,
      default: 0,
    },

    /* ===== MAKING ===== */
    makingDiscountType: {
      type: String,
      enum: ["none", "percent", "flat"],
      default: "none",
    },
    makingDiscountValue: {
      type: Number,
      default: 0,
    },

    /* ===== CELEBRATION DISCOUNTS ===== */
    birthdayDiscountType: {
      type: String,
      enum: ["none", "percent", "flat"],
      default: "percent",
    },
    birthdayDiscountValue: {
      type: Number,
      default: 20,
    },
    birthdayDiscountTarget: {
      type: String,
      enum: ["making", "diamond", "stone", "flat"],
      default: "making",
    },
    birthdayMinWeight: {
      type: Number,
      default: 0,
    },
    anniversaryDiscountType: {
      type: String,
      enum: ["none", "percent", "flat"],
      default: "percent",
    },
    anniversaryDiscountValue: {
      type: Number,
      default: 20,
    },
    anniversaryDiscountTarget: {
      type: String,
      enum: ["none", "making", "diamond", "stone", "flat"],
      default: "making",
    },
    anniversaryMinWeight: {
      type: Number,
      default: 0,
    },

    active: Boolean,
    discountEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("RateConfig", RateConfigSchema);

