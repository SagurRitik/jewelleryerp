
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
{
  name: { 
    type: String, 
    required: true 
  },

  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },

  password: { 
    type: String 
  },

  role: {
    type: String,
    enum: [
      "superadmin",
      "admin",
      "manager",
      "salesperson",
      "accountant",
      "inventory"
    ],
    default: "salesperson"
  },

  isVerified: { 
    type: Boolean, 
    default: false 
  },

  isActive: { 
    type: Boolean, 
    default: true 
  },

  emailVerifyToken: String,
  emailVerifyExpires: Date,

  resetPasswordToken: String,
  resetPasswordExpires: Date,

  lastLogin: Date
},
{ timestamps: true }
);

/* 🔐 HASH PASSWORD (Modern Mongoose Style - No next()) */
userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* 🔑 MATCH PASSWORD */
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);