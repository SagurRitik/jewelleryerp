// // models/DiamondRateMaster.js
// import mongoose from "mongoose";

// const diamondRateSchema = new mongoose.Schema(
//   {
//     /* ================= STATUS ================= */
//     active: { type: Boolean, default: true },

//     /* ================= CLASSIFICATION ================= */
//     shape: { type: String, required: true },     // Round, Princess
//     colorFrom: { type: String, required: true }, // G
//     colorTo: { type: String, required: true },   // H

//     clarityFrom: { type: String, required: true }, // VS1
//     clarityTo: { type: String, required: true },   // VS2

//     cut: { type: String, default: "" }, // EX, VG, G (optional)

//     /* ================= WEIGHT SLAB ================= */
//     weightFrom: { type: Number, required: true }, // 0.18
//     weightTo: { type: Number, required: true },   // 0.22

//     /* ================= RATE ================= */
//     rateType: {
//       type: String,
//       enum: ["PER_CT", "PER_PC"],
//       required: true,
//     },

//     rate: { type: Number, required: true }, // price per ct / pc

//     /* ================= META ================= */
//     notes: String,
//   },
//   { timestamps: true }
// );

// /* ================= INDEXES ================= */
// diamondRateSchema.index({
//   active: 1,
//   shape: 1,
//   weightFrom: 1,
//   weightTo: 1,
//   colorFrom: 1,
//   colorTo: 1,
//   clarityFrom: 1,
//   clarityTo: 1,
// });

// export default mongoose.model("DiamondRateMaster", diamondRateSchema);


// models/DiamondRateMaster.js
import mongoose from "mongoose";

const diamondRateSchema = new mongoose.Schema(
  {
    active: { type: Boolean, default: true },

    shape: { type: String, required: true },

    // 🔑 RANKED VALUES (MANDATORY)
    colorFromIndex: { type: Number, required: true },   // G = 6
    colorToIndex: { type: Number, required: true },     // H = 7

    clarityFromIndex: { type: Number, required: true }, // VS1 = 3
    clarityToIndex: { type: Number, required: true },   // VS2 = 4

    cut: { type: String, default: "" },

    weightFrom: { type: Number, required: true },
    weightTo: { type: Number, required: true },

    rateType: {
      type: String,
      enum: ["PER_CT", "PER_PC"],
      required: true,
    },

    rate: { type: Number, required: true },

    priority: { type: Number, default: 1 }, // slab resolution
    notes: String,
  },
  { timestamps: true }
);

diamondRateSchema.index({
  active: 1,
  shape: 1,
  weightFrom: 1,
  weightTo: 1,
  colorFromIndex: 1,
  colorToIndex: 1,
  clarityFromIndex: 1,
  clarityToIndex: 1,
  priority: -1,
});

export default mongoose.model("DiamondRateMaster", diamondRateSchema);
