import mongoose from "mongoose";

const purchaseItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  metalType: { type: String, enum: ["Gold", "Silver", "Platinum", "Stones", "Other"], default: "Gold" },
  weight: { type: Number, default: 0 },
  purity: { type: String, default: "" },
  rate: { type: Number, required: true },
  amount: { type: Number, required: true }
});

const purchaseSchema = new mongoose.Schema(
  {
    supplierId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Supplier", 
      required: true 
    },
    purchaseNo: { 
      type: String, 
      required: true, 
      unique: true 
    },
    purchaseDate: { 
      type: Date, 
      default: Date.now 
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    items: [purchaseItemSchema],
    
    amount: {
      type: Number,
      required: true,
      default: 0
    },
    taxableAmount: { 
      type: Number, 
      default: 0
    },
    gstRate: { 
      type: Number, 
      default: 3 // Default 3% for jewellery metal
    },
    gstAmount: { 
      type: Number, 
      default: 0 
    },
    totalAmount: { 
      type: Number, 
      default: 0
    },
    purchaseSlip: {
      type: String,
      trim: true
    },
    products: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Product" 
    }],
    notes: { 
      type: String, 
      trim: true 
    },
    status: {
      type: String,
      enum: ["DRAFT", "COMPLETED", "CANCELLED"],
      default: "COMPLETED"
    }
  },
  { timestamps: true }
);

const Purchase = mongoose.model("Purchase", purchaseSchema);

export default Purchase;
