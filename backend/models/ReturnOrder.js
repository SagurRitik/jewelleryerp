import mongoose from "mongoose";

/* ─────────────────────────────────────────────────────────────────
   Return Item Sub-schema
   ───────────────────────────────────────────────────────────────── */
const returnItemSchema = new mongoose.Schema({

  invoiceItemIndex: {
    type: Number,
    required: true
  },

  itemSnapshot: Object,

  quantityReturned: {
    type: Number,
    required: true,
    min: 1
  },

  condition: {
    type: String,
    enum: ["GOOD", "DAMAGED"]
  },

  stockAction: {
    type: String,
    enum: ["RESTOCK", "SCRAP"],
    default: "RESTOCK"
  },

  /* Legacy breakup kept for backwards compat with old returns */
  returnBreakup: {
    metalValue: Number,
    diamondValue: Number,
    stoneValue: Number,
    makingCharge: Number,
    gst: Number,
    totalRefund: Number
  }

});

/* ─────────────────────────────────────────────────────────────────
   Main Return Order Schema
   ───────────────────────────────────────────────────────────────── */
const returnOrderSchema = new mongoose.Schema({

  returnNo: {
    type: String,
    unique: true
  },

  /* ── REFERENCES ───────────────────────────────────────────── */
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SalesOrder"
  },

  invoiceNo: String,

  customer: Object,

  /* ── RETURN TYPE (order-level) ────────────────────────────── */
  returnType: {
    type: String,
    enum: ["refund", "exchange"],
    default: "refund"
  },

  reason: String,

  /* ── ITEMS ────────────────────────────────────────────────── */
  returnItems: [returnItemSchema],

  /* ── ORIGINAL BREAKDOWN (snapshot from invoice) ───────────── */
  breakdown: {
    metal: { type: Number, default: 0 },
    diamond: { type: Number, default: 0 },
    stone: { type: Number, default: 0 },
    making: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    // for metal recalc
    netWeight: { type: Number, default: 0 },
    metalType: { type: String, default: "" },
    metalPurity: { type: String, default: "" },

    // ✅ ADD THESE
    discountDiamond: { type: Number, default: 0 },
    discountStone: { type: Number, default: 0 },
    discountMaking: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
  },

  /* ── USER-CONFIGURED ADJUSTMENTS ─────────────────────────── */
  adjustments: {
    useLatestMetalRate: { type: Boolean, default: true },
    metalRateUsed: { type: Number, default: 0 },
    diamondPercent: { type: Number, default: 100 },
    stonePercent: { type: Number, default: 100 },
    makingOption: { type: String, enum: ["keep", "remove", "custom"], default: "keep" },
    makingCustomValue: { type: Number, default: 0 },
    includeGST: { type: Boolean, default: true },
    discountMode: { type: String, enum: ["keep", "remove"], default: "keep" }
  },

  adjustedValues: {
    metal: { type: Number, default: 0 },
    diamond: { type: Number, default: 0 },
    stone: { type: Number, default: 0 },
    making: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    gst: { type: Number, default: 0 }
  },

  /* ── FINAL COMPUTED AMOUNT ────────────────────────────────── */
  finalAmount: { type: Number, default: 0 },

  /* ── REFUND SPECIFIC ──────────────────────────────────────── */
  refund: {
    mode: {
      type: String,
      enum: ["CASH", "UPI", "BANK", "CARD", "ADJUSTMENT"]
    },
    amount: Number
  },

  metalReceived: [
    {
      metalType: String,
      purity: String,
      weight: Number,
      ratePerGram: Number,
      value: Number
    }
  ],

  /* ── EXCHANGE SPECIFIC ────────────────────────────────────── */
  creditNoteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CreditNote"
  },

  /* ── WORKFLOW STATUS ──────────────────────────────────────── */
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED", "COMPLETED"],
    default: "PENDING"
  },

  inspectionStatus: {
    type: String,
    enum: ["PENDING", "PASSED", "FAILED"],
    default: "PENDING"
  },

  tallySynced: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

export default mongoose.model("ReturnOrder", returnOrderSchema);