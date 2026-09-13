
import mongoose from "mongoose";

const diamondStockSchema = new mongoose.Schema(
  {
    sku: { type: String, unique: true, required: true },
    shape: { type: String, default: "" },
    weight: { type: Number, required: true }, // in Carats
    color: { type: String, default: "" },
    clarity: { type: String, default: "" },
    cut: { type: String, default: "" },
    labNatural: { type: String, enum: ["Natural", "Lab Grown"], default: "Lab Grown" },
    lab: { type: String, default: "" },
    certificateNo: { type: String, default: "" },
    
    costPrice: { type: Number, default: 0 },
    costRate: { type: Number, default: 0 }, // Cost Rate per Carat
    sellingPrice: { type: Number, default: 0 },
    sellingRate: { type: Number, default: 0 }, // Selling Rate per Carat
    
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

diamondStockSchema.index({ certificateNo: 1 });
diamondStockSchema.index({ status: 1 });

export default mongoose.model("DiamondStock", diamondStockSchema);
