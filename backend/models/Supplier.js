import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    mobile: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    gstNumber: {
      type: String,
      trim: true,
      uppercase: true
    },
    address: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    pincode: {
      type: String,
      trim: true
    },
    openingBalance: { 
      type: Number, 
      default: 0 
    },
    balanceType: { 
      type: String, 
      enum: ["PAYABLE", "RECEIVABLE"], 
      default: "PAYABLE" 
    },
    currentBalance: {
      type: Number,
      default: 0
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
  },
  { timestamps: true }
);

// Pre-save hook to initialize currentBalance if not provided
supplierSchema.pre("save", function() {
  if (this.isNew && (!this.currentBalance || this.currentBalance === 0)) {
    // If PAYABLE, it's a liability (positive balance we owe)
    // If RECEIVABLE, it's an asset (negative balance they owe us)
    this.currentBalance = this.openingBalance || 0;
  }
});

const Supplier = mongoose.model("Supplier", supplierSchema);

export default Supplier;
