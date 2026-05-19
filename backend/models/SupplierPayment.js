import mongoose from "mongoose";

const supplierPaymentSchema = new mongoose.Schema(
  {
    supplierId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Supplier", 
      required: true 
    },
    amount: { 
      type: Number, 
      required: true,
      min: [1, "Amount must be greater than zero"]
    },
    paymentMode: { 
      type: String, 
      enum: ["CASH", "BANK", "UPI", "GOLD"], 
      required: true 
    },
    // Metal specific fields (only if paymentMode is GOLD)
    metalType: {
      type: String,
      enum: ["Gold", "Silver", "Platinum", "Other"],
      default: "Gold"
    },
    weight: {
      type: Number,
      default: 0
    },
    purity: {
      type: String,
      default: ""
    },
    fineWeight: {
      type: Number,
      default: 0
    },
    rate: {
      type: Number,
      default: 0
    },
    reference: { 
      type: String, 
      trim: true 
    },
    note: { 
      type: String, 
      trim: true 
    },
    paymentDate: { 
      type: Date, 
      default: Date.now 
    }
  },
  { timestamps: true }
);

const SupplierPayment = mongoose.model("SupplierPayment", supplierPaymentSchema);

export default SupplierPayment;
