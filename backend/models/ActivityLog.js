import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: String,
  module: String,
  ipAddress: String,
  userAgent: String
}, { timestamps: true });

export default mongoose.model("ActivityLog", activityLogSchema);