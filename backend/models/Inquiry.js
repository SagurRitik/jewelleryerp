// import mongoose from "mongoose";

// const inquirySchema = new mongoose.Schema(
//   {
//     customerName: {
//       type: String,
//       required: true,
//     },
//     mobile: {
//       type: String,
//       required: true,
//     },
//     email: String,

//     productType: {
//       type: String,
//       required: true,
//     },

//     category: {
//       type: String,
//       enum: ["GOLD", "DIAMOND", "SILVER", "PLATINUM"],
//       default: "GOLD",
//     },

//     budget: {
//       type: String,
//       required: true,
//     },

//     notes: String,

//     status: {
//       type: String,
//       enum: ["NEW", "CONTACTED", "INTERESTED", "NOT_INTERESTED", "CONVERTED"],
//       default: "NEW",
//     },

//     followUpDate: Date,

//     salesperson: String,

//     source: {
//       type: String,
//       enum: ["WALK_IN", "INSTAGRAM", "WEBSITE", "REFERRAL"],
//       default: "WALK_IN",
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Inquiry", inquirySchema);







import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    // 👤 CUSTOMER
    customerName: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    email: String,
    address: String,

    budget: {
      type: Number,
    },

    // 💍 PRODUCT
    productType: {
      type: String,
    },
    customProduct: String,

    metal: String,

    diamondShape: String,
    diamondWeight: Number,

    stone: String,

    notes: String,

    // 🔄 CRM & Lead Management
    status: {
      type: String,
      enum: ["NEW", "CONTACTED", "FOLLOW_UP", "INTERESTED", "NEGOTIATION", "NOT_INTERESTED", "CONVERTED", "CLOSED"],
      default: "NEW",
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },

    followUpDate: Date,

    followUps: [
      {
        note: String,
        date: { type: Date, default: Date.now },
        status: String,
        nextFollowUpDate: Date,
        salesperson: String,
      }
    ],

    salesperson: String,

    source: {
      type: String,
      enum: ["WALK_IN", "INSTAGRAM", "WEBSITE", "REFERRAL", "FACEBOOK", "WHATSAPP", "GOOGLE"],
      default: "WALK_IN",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Inquiry", inquirySchema);