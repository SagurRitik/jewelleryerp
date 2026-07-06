

import mongoose from "mongoose";

/**
 * ======================================================
 * ORDER = COMMERCIAL + MANUFACTURING
 * ❌ Billing authority nahi
 * ======================================================
 */

/* ================= COMPONENT SNAPSHOT ================= */
const orderComponentSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // Diamond, Ruby
    componentRole: { type: String, default: "SIDE" },
    category: { type: String, default: "" },

    shape: String,
    color: String,
    clarity: String,
    cut: String,
    description: { type: String, default: "" },
    certificateNo: String,

    count: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },

       grossWeight: {
      type: Number,
      default: 0,
      // total weight of all stones
    },

        /* ================= SIZE ================= */
    size: {
      type: String,
      default: 0,
      // For rings: size in mm (inner circumference)
    },


    pricingRef: {
      type: String,
      required: true, // DIAMOND | STONE
    },

    rateOverride: {
      type: Number,
      default: null,
    },

    settingApplicable: { type: Boolean, default: false },
    settingRuleRef: { type: String, default: "" },
  },
  { _id: false }
);

/* ================= ORDER ================= */
const orderSchema = new mongoose.Schema(
  {
    /* ================= BASIC ================= */
    orderNo: { type: String, required: true, unique: true },
    groupOrderNo: { type: String, default: null },
    sku: { type: String, default: null },

    productRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    finalInvoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
    },

    /* ================= CUSTOMER ================= */
    customer: {
      name: { type: String, required: true },
      mobile: { type: String, required: true },
      email: String,
      address: String,
      city: String,
      gstin: String,
      stateCode: String,
    },

    /* ================= PRODUCT SNAPSHOT ================= */
    productSnapshot: {
      title: String,
      jewelleryCategory: String,
      productType: String,
       /* ✅ SIZE SUPPORT (ALL JEWELLERY TYPES) */
  size: String,          // generic
  ringSize: String,      // rings
  bangleSize: String,    // bangles
  length: String,        // necklace / bracelet / chain

  /* ✅ DESCRIPTION / NOTES */
  description: String,
  notes: String,
  remark: String,

      metalType: String,
      metalPurity: String,
      metalColor: String,

      /** ✅ METAL ONLY WEIGHT (used for calculation) */
      netWeight: {
        type: Number,
        required: true,
      },

      /** Total weight (metal + stones) */
      grossWeight: Number,

      components: [orderComponentSchema],

      hsnCode: { type: String },
      certificates: [
        {
          lab: String,
          certificateNo: String,
        },
      ],
      // productImage: String,
      productImages: {
  type: [String],
  default: [],
},
    },

    /* ================= 🔒 LOCKED METAL RATE ================= */
    metalSnapshot: {
      metalType: String,
      purity: String,
      baseRate: Number,       // gold24KT / silver999 / platinum950
      ratePerGram: Number,    // after purity factor

      wastagePercent: Number,
      makingRatePerGram: Number,

      lockedAt: {
        type: Date,
        default: Date.now,
        immutable: true,
      },
    },

    /* ================= 💰 CASH / UPI ADVANCE ================= */
    advancePayment: {
      amount: { type: Number, default: 0 },
      mode: {
        type: String,
        enum: ["CASH", "UPI", "CARD", "BANK", "CHEQUE"],
        default: "CASH",
      },
      transactionId: { type: String, default: null },
      paidAt: { type: Date, default: null },
    },

    /* ================= 🪙 METAL GIVEN BY CUSTOMER ================= */
    metalPayment: {
      metalType: {
        type: String, // Gold | Silver | Platinum
      },

      purity: {
        type: String, // 22KT | 18KT | 925 | 950
      },

      weight: {
        type: Number, // grams received
      },

      baseRate: {
        type: Number, // admin base rate
      },

      purityFactor: {
        type: Number, // 0.916 | 0.75 | 0.925
      },

      ratePerGram: {
        type: Number, // locked effective rate
      },

      totalValue: {
        type: Number, // FINAL ₹ value adjusted in invoice
      },

      receivedAt: {
        type: Date,
        default: Date.now,
      },
    },

    /* ================= STATUS ================= */
    status: {
      type: String,
      enum: [
        "Placed",
        "Received",
        "In-Process",
        "Ready",
        "Delivered",
        "Cancelled",
      ],
      default: "Placed",
    },

    expectedDeliveryDate: Date,

    cancelReason: String,
    cancelledAt: Date,

    orderStatusHistory: [
      {
        status: String,
        at: { type: Date, default: Date.now },
        reason: String,
      },
    ],
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */
// orderSchema.index({ orderNo: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ "customer.mobile": 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
