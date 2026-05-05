import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await User.findOne({ email: "ritikdudee01@gmail.com" });

    if (existing) {
      console.log("Admin already exists");
      process.exit();
    }

    const admin = await User.create({
      name: "Super Admin",
      email: "ritikdudee01@gmail.com",
      password: "R@123",
      role: "superadmin",
      isVerified: true,
      isActive: true,
    });

    console.log("✅ Super Admin Created Successfully");
    process.exit();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createAdmin();