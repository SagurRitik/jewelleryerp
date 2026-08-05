import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    gstin: {
      type: String,
      default: "",
    },

    // 🎂 Celebration Dates
    dob: {
      type: Date,
      default: null,
    },
    anniversaryDate: {
      type: Date,
      default: null,
    },

    // 💎 Customer Type & Financials
    customerType: {
      type: String,
      enum: ["Regular", "VIP", "Wholesale"],
      default: "Regular",
    },
    totalPurchases: {
      type: Number,
      default: 0,
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
    },
    feedback: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },

    // 📩 History of Offers Sent
    offersHistory: [
      {
        eventType: {
          type: String,
          enum: ["BIRTHDAY", "ANNIVERSARY", "CUSTOM"],
          required: true,
        },
        offerCode: { type: String, default: "" },
        message: { type: String, default: "" },
        sentAt: { type: Date, default: Date.now },
        channel: { type: String, enum: ["WHATSAPP", "SMS", "EMAIL"], default: "WHATSAPP" },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);
