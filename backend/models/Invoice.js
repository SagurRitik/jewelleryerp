

import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    /* ================= IDENTIFIERS ================= */
    invoiceNo: {
      type: String,
      required: true,
      unique: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    /* ================= CUSTOMER SNAPSHOT ================= */
    customer: {
      name: { type: String, default: "" },
      mobile: { type: String, default: "" },
      email: { type: String, default: "" },
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      // ✅ REMOVED: gst (old field)
      // ✅ ADDED: gstin (new single GST field)
      gstin: { type: String, default: "" },
      stateCode: { type: String, default: "" },
    },

    /* ================= PRODUCT SNAPSHOT ================= */
    product: {
      category: { type: String, default: "" },
      size: { type: String, default: "" },
      title: { type: String, default: "" },

      metalType: { type: String, default: "" },
      metalPurity: { type: String, default: "" },
      metalColor: { type: String, default: "" },
      metalWeight: { type: Number, default: 0 },
      grossWeight: { type: Number, default: 0 },

      diamondWeight: { type: Number, default: 0 },
      diamondColor: { type: String, default: "" },
      diamondQuality: { type: String, default: "" },

      stones: [
        {
          stoneType: { type: String, default: "" },
          stoneWeight: { type: Number, default: 0 },
          stoneColor: { type: String, default: "" },
          stoneQuality: { type: String, default: "" },
        },
      ],

      // ✅ NEW JEWELLERY FIELDS (OPTIONAL)
      fineGoldWeight: { type: Number, default: 0 },
      certificates: [
        {
          lab: String,
          certificateNo: String,
        },
      ],
      hsnCode: { type: String, default: "7113" }, // ✅ ADDED HSN CODE
    },

    /* ================= PAYMENT & TRANSACTION ================= */
    paymentMode: {
      type: String,
      enum: ["UPI", "Cash", "Card", "Bank Transfer", "Cheque", "Online"],
      default: "UPI",
    },

    transactionId: { type: String, default: "" },
    advancePaid: { type: Number, default: 0 },

    /* ================= PRICING SNAPSHOT ================= */
    pricing: {
      metalRate: { type: Number, default: 0 },
      diamondRate: { type: Number, default: 0 },
      stoneRate: { type: Number, default: 0 },
      makingCharge: { type: Number, default: 0 },

      metalAmount: { type: Number, default: 0 },
      diamondAmount: { type: Number, default: 0 },
      stoneAmount: { type: Number, default: 0 },
      makingAmount: { type: Number, default: 0 },

      discountType: { type: String, default: "flat" },
      discountValue: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 },

      subtotal: { type: Number, default: 0 },

      gstRate: { type: Number, default: 3 },
      gstMakingRate: { type: Number, default: 5 },

      gst: { type: Number, default: 0 },
      gstOnMaking: { type: Number, default: 0 },

      grandTotal: { type: Number, default: 0 },
      stoneWeight: { type: Number, default: 0 },
      taxable3: { type: Number, default: 0 },
      taxable5: { type: Number, default: 0 },
      
      // ✅ JEWELLERY FIELDS IN PRICING TOO
      fineGoldWeight: { type: Number, default: 0 },
      certificates: [
        {
          lab: String,
          certificateNo: String,
        },
      ],
      hsnCode: { type: String, default: "7113" }, // ✅ ADDED HSN CODE IN PRICING
    },

    /* ================= ROOT LEVEL JEWELLERY FIELDS ================= */
    // ✅ ALSO ADD AT ROOT LEVEL FOR EASY ACCESS
    fineGoldWeight: { type: Number, default: 0 },
    certificates: [
      {
        lab: String,
        certificateNo: String,
      },
    ],
    hsnCode: { type: String, default: "7113" }, // ✅ ADDED AT ROOT LEVEL
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);