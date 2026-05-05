


import mongoose from "mongoose";

const componentSchema = new mongoose.Schema(
  {
    /* ================= CLASSIFICATION ================= */
    type: {
      type: String,
      required: true,
      // Diamond | Ruby | Emerald | Polki | Moissanite
    },

    componentRole: {
      type: String,
      default: "SIDE",
      // CENTER | SIDE | MICRO | ACCENT
    },

    category: {
      type: String,
      default: "",
      // Solitaire | Pointer | Small
    },

    /* ================= SPECIFICATIONS ================= */
    shape: { type: String, default: "" },   // Round, Princess
    color: { type: String, default: "" },   // G-H
    clarity: { type: String, default: "" }, // VS1-SI1
    cut: { type: String, default: "" },     // EX, VG

    // certificateNo: { type: String, default: "" },

    /* ================= QUANTITY ================= */
    count: { type: Number, default: 0 },     // pcs
    weight: { type: Number, default: 0 },    // ct / gm

    grossWeight: { type: Number, default: 0 },

    /* ================= SIZE ================= */
    // size: { type: Number, default: 0,},

    size: { type: String, default: "" },

    /* ================= RATE LOOKUP HOOK ================= */
    pricingRef: { type: String },

    /* ================= MANUAL OVERRIDE (OPTIONAL) ================= */
    rateOverride: { type: Number, default: null, },

    /* ================= SETTING ================= */
    settingApplicable: { type: Boolean, default: false },

    settingRuleRef: {
      type: String,
      default: "",
      // SETTING_CENTER | SETTING_MICRO
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    jewelleryCategory: { type: String, required: true }, // Ring, Necklace
    productType: { type: String, default: "" },          // Engagement

    sku: { type: String, unique: true },
    stock: { type: Number, default: 0 },

    /* ================= COMPLIANCE ================= */
    hsnCode: { type: String, default: "7113" },
    huid: { type: String, default: "" },
    // certificateNo: { type: String, default: "" },
    certificates: [
      {
        certificateNo: { type: String, default: "" },
        lab: { type: String, default: "" }
      }
    ],


    /* ================= METAL (STRUCTURE ONLY) ================= */
    metalType: { type: String, required: true },
    metalPurity: { type: String, required: true },
    metalColor: { type: String, default: "" },

    netWeight: { type: Number, required: true },      // ⭐ ADDED: Metal weight only (without stones)
    grossWeight: { type: Number, required: true },    // Total weight (metal + stones)
    fineGold: {
      type: Number,
      default: 0,
    },
    /* ================= COMPONENTS ================= */
    components: [componentSchema],

    /* ================= MEDIA ================= */
    // image: { type: String },
    images: [{ type: String }],

    /* ================= TARGET AUDIENCE ================= */
    targetAudience: {
      type: String,
      enum: ["MEN", "WOMEN", "UNISEX", "KIDS"],
      default: "UNISEX"
    },
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */
// productSchema.index({ sku: 1 });
productSchema.index({ jewelleryCategory: 1 });
productSchema.index({ "components.type": 1 });
productSchema.index({ "components.componentRole": 1 });

export default mongoose.model("Product", productSchema);