// import mongoose from "mongoose";

// const metalRateSchema = new mongoose.Schema(
//   {
//     metal: {
//       type: String,
//       enum: ["GOLD", "SILVER"],
//       required: true,
//     },
//     purity: {
//       type: String, // 24K, 22K
//     },
//     ratePerGram: {
//       type: Number,
//       required: true,
//     },
//     currency: {
//       type: String,
//       default: "INR",
//     },
//     source: {
//       type: String,
//       default: "metals-api",
//     },
//     updatedAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("MetalRate", metalRateSchema);


// import mongoose from "mongoose";

// const metalRateSchema = new mongoose.Schema({
//   metal: {
//     type: String,
//     required: true,
//     enum: ["GOLD", "SILVER"],
//     index: true
//   },
//   purity: {
//     type: String, // "24K" only for GOLD
//   },
//   ratePerGram: {
//     type: Number,
//     required: true
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// export default mongoose.model("MetalRate", metalRateSchema);
