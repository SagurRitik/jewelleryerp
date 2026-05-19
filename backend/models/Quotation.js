import mongoose from "mongoose";

/* ===== AUTO-INCREMENT ESTIMATE NUMBER ===== */
const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 },
});
const Counter = mongoose.models.QuotationCounter || mongoose.model("QuotationCounter", counterSchema);

const componentSchema = new mongoose.Schema({
  type: { type: String, default: "" },          // diamond / ruby / emerald
  pricingRef: { type: String, default: "DIAMOND" }, // DIAMOND / POLKI / RUBY …
  shape: { type: String, default: "" },
  color: { type: String, default: "" },
  clarity: { type: String, default: "" },
  weight: { type: Number, default: 0 },          // per-piece weight (ct)
  count: { type: Number, default: 1 },
  grossWeight: { type: Number, default: 0 },     // total weight
  rateOverride: { type: Number, default: 0 },
  rateType: { type: String, enum: ["PER_CT", "PER_PCS"], default: "PER_CT" },
  size: { type: String, default: "" },
  category: { type: String, default: "" },
  description: { type: String, default: "" },
}, { _id: false });

const breakupSchema = new mongoose.Schema({
  metalRate: { type: Number, default: 0 },
  metalValue: { type: Number, default: 0 },
  diamondValue: { type: Number, default: 0 },
  stoneValue: { type: Number, default: 0 },
  makingCharge: { type: Number, default: 0 },
  grossTotal: { type: Number, default: 0 },
  discountDiamond: { type: Number, default: 0 },
  discountStone: { type: Number, default: 0 },
  discountMaking: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  subtotal: { type: Number, default: 0 },
  gst: { type: Number, default: 0 },
  gstPercent: { type: Number, default: 3 },
  grandTotal: { type: Number, default: 0 },
  netWeight: { type: Number, default: 0 },
  componentBreakup: { type: Array, default: [] },
}, { _id: false });

const itemSchema = new mongoose.Schema({
  title: { type: String, default: "Jewellery Item" },
  metalType: { type: String, default: "gold" },
  metalPurity: { type: String, default: "18KT" },
  netWeight: { type: Number, default: 0 },
  quantity: { type: Number, default: 1 },
  description: { type: String, default: "" },
  grossWeight: { type: Number, default: 0 },
  fineGold: { type: Number, default: 0 },
  huid: { type: String, default: "" },
  hsnCode: { type: String, default: "" },
  discountEnabled: { type: Boolean, default: true },
  images: { type: [String], default: [] },
  components: [componentSchema],
  breakup: breakupSchema,

}, { _id: false });

const quotationSchema = new mongoose.Schema(
  {
    quotationNo: { type: String, unique: true },

    /* ===== CUSTOMER ===== */
    customerName: { type: String, required: true },
    mobile: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },

    /* ===== ITEMS ===== */
    items: [itemSchema],

    /* ===== TOTALS ===== */
    subtotal: { type: Number, default: 0 },
    gstTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },

    /* ===== META ===== */
    validDays: { type: Number, default: 7 },
    notes: { type: String, default: "" },

    /* ===== STATUS ===== */
    status: {
      type: String,
      enum: ["DRAFT", "SENT", "ACCEPTED", "EXPIRED", "CONVERTED", "CANCELLED"],
      default: "DRAFT",
    },

    convertedOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

/* ===== AUTO-GENERATE QUOTATION NUMBER ===== */
quotationSchema.pre("save", async function () {
  if (this.quotationNo) return;
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const prefix = `EST-${year}/${month}/${day}-`;

    // 🔍 Find the last estimate with this specific daily prefix
    const lastEstimate = await this.constructor.findOne(
      { quotationNo: new RegExp(`^${prefix}`) },
      { quotationNo: 1 },
      { sort: { quotationNo: -1 } }
    ).lean();

    let seq = 1;
    if (lastEstimate && lastEstimate.quotationNo) {
      const parts = lastEstimate.quotationNo.split("-");
      const lastSeqStr = parts[parts.length - 1];
      const lastSeq = parseInt(lastSeqStr, 10);
      if (!isNaN(lastSeq)) seq = lastSeq + 1;
    }

    this.quotationNo = `${prefix}${String(seq).padStart(4, "0")}`;

    console.log("🔢 Generated Quotation No:", this.quotationNo);
  } catch (err) {
    console.error("❌ auto-generate quotationNo failed:", err);
    throw err;
  }
});

/* ===== INDEXES ===== */
quotationSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Quotation || mongoose.model("Quotation", quotationSchema);
