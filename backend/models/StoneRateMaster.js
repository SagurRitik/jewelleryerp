// models/StoneRateMaster.js
import mongoose from "mongoose";

const stoneRateSchema = new mongoose.Schema(
  {
    active: { type: Boolean, default: true },

    /* ================= CLASSIFICATION ================= */
    stoneType: { type: String, required: true }, // Ruby, Emerald
    shape: { type: String, default: "" },        // Oval, Round

    /* ================= SIZE / WEIGHT ================= */
    weightFrom: { type: Number, default: 0 },
    weightTo: { type: Number, default: 999 },

    /* ================= RATE ================= */
    rateType: {
      type: String,
      enum: ["PER_CT", "PER_PC"],
      required: true,
    },

    rate: { type: Number, required: true },

    notes: String,
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */
stoneRateSchema.index({
  active: 1,
  stoneType: 1,
  shape: 1,
  weightFrom: 1,
  weightTo: 1,
});

export default mongoose.model("StoneRateMaster", stoneRateSchema);
