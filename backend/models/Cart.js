
import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String, // POS / guest user
      required: true,
      index: true,
      unique: true,
    },

    items: [
      {
        itemType: {
          type: String,
          enum: ["PRODUCT", "CUSTOM"],
          required: true,
        },

        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },

        /* ================= INVENTORY PRODUCT ================= */
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        sku: String,

        /* ================= CUSTOM / ORDER SNAPSHOT ================= */
        customSnapshot: {
          // 🔑 identity
          orderId: mongoose.Schema.Types.ObjectId,
          orderNo: String,

          // 🧑 customer snapshot (optional but useful)
          customer: {
            name: String,
            mobile: String,
            gstin: String,
            stateCode: String,
          },
          rateSource: {
  type: String,
  enum: ["ACTIVE", "ORDER_LOCKED"],
  required: true,
},


          // 💍 FULL product snapshot (AS-IS from Order)
          productDetails: mongoose.Schema.Types.Mixed,

          // 💰 pricing snapshot (locked or calculated)
          pricingSnapshot: mongoose.Schema.Types.Mixed,

          // 🖼 image snapshot
          productImage: String,

          // 📝 remarks / job card
          remarks: String,
        },

        /* ================= PRICE ================= */
        priceEstimate: {
          type: Number,
          default: 0,
        },
      },
    ],

    /* ================= TOTALS ================= */
    totals: {
      subtotal: { type: Number, default: 0 },
      gst: { type: Number, default: 0 },
      grandTotal: { type: Number, default: 0 },
       // 🔥 ADD THESE (CRITICAL)
  discount: { type: Number, default: 0 },
  discountDiamond: { type: Number, default: 0 },
  discountStone: { type: Number, default: 0 },
  discountMaking: { type: Number, default: 0 },
    },
    
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
