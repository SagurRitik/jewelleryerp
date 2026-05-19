
import mongoose from "mongoose";

const diamondStockSchema = new mongoose.Schema(
  {
    sku: { type: String, unique: true, required: true },
    shape: { type: String, default: "" },
    weight: { type: Number, required: true }, // in Carats
    color: { type: String, default: "" },
    clarity: { type: String, default: "" },
    cut: { type: String, default: "" },
    labNatural: { type: String, enum: ["Natural", "Lab Grown"], default: "Natural" },
    lab: { type: String, default: "" },
    certificateNo: { type: String, default: "" },
    
    costPrice: { type: Number, default: 0 },
    sellingPrice: { type: Number, default: 0 },
    
    stock: { type: Number, default: 1 },
    
    status: {
      type: String,
      enum: ["AVAILABLE", "SOLD", "RESERVED"],
      default: "AVAILABLE",
    },
    
    notes: { type: String, default: "" },
    images: [{ type: String }],
  },
  { timestamps: true }
);

diamondStockSchema.index({ sku: 1 });
diamondStockSchema.index({ certificateNo: 1 });
diamondStockSchema.index({ status: 1 });

export default mongoose.model("DiamondStock", diamondStockSchema);
