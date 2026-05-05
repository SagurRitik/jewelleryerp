
import mongoose from "mongoose";

const SalesOrderSchema = new mongoose.Schema(
  {
    invoiceNo: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    creditNoteIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CreditNote",
      },
    ],

    customer: {
      name: String,
      mobile: String,
      email: String,
      address: String,
      gstin: String,
      stateCode: String,
        panNumber: {
    type: String,
    uppercase: true,
    trim: true,
    match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      required: function () {
    return this.ownerDocument().totals?.subtotal > 200000;
  },
  },
    },

    salesperson: {
  type: String,
  default: "",
},

    items: Array,

    /* ===== METAL PAYMENTS (ORDER + INVOICE) ===== */

    metalPayments: [
      {
        source: {
          type: String,
          enum: ["ORDER", "INVOICE"],
          required: true,
        },

        metalType: {
          type: String,
          default: null,
        },

        purity: {
          type: String,
          default: null,
        },

        weight: {
          type: Number,
          default: 0,
        },

        ratePerGram: {
          type: Number,
          default: 0,
        },

        totalValue: {
          type: Number,
          default: 0,
        },

        receivedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    /* ================= FINAL TOTALS ================= */

    totals: {
      subtotal: Number,

      /* ===== DISCOUNTS ===== */
      discountMaking: Number,
      discountDiamond: Number,
      discountStone: Number,
      discount: Number,

      /* ===== TAX ===== */
      gst: Number,
      grandTotal: Number,

      /* ===== PAYMENTS ===== */
      advancePayment: {
        type: Number,
        default: 0,
      },

      totalAdjustments: {
        type: Number,
        default: 0,
      },
      
      appliedCredit: {
        type: Number,
        default: 0,
      },

      netPayable: {
        type: Number,
        default: 0,
      },
    },

    /* ================= LOCKED RATE SNAPSHOT ================= */

    rateSnapshot: {
      gold24KT: Number,
      silver999: Number,
      platinum950: Number,

      diamondRate: Number,
      stoneRate: Number,
      makingCharge: Number,

      gstRate: Number,

      makingDiscountType: {
        type: String,
        enum: ["percent", "flat", "none"],
      },
      makingDiscountValue: Number,

      diamondDiscountType: {
        type: String,
        enum: ["percent", "flat", "none"],
      },
      diamondDiscountValue: Number,

      stoneDiscountType: {
        type: String,
        enum: ["percent", "flat", "none"],
      },
      stoneDiscountValue: Number,
    },

    payment: {
      mode: {
        type: String,
        enum: ["CASH", "UPI", "CARD", "BANK", "CHEQUE"],
      },
      referenceNo: String,
      status: String,
    },

    /* ================= TALLY SYNC ================= */

    tallySynced: {
      type: Boolean,
      default: false,
    },

    tallyResponse: {
      type: String,
    },

    tallyError: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("SalesOrder", SalesOrderSchema);