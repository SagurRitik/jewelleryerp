
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

async function test() {
  try {
    console.log("Testing bcryptjs...");
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("password123", salt);
    const isMatch = await bcrypt.compare("password123", hash);
    console.log("Bcrypt Match:", isMatch);

    console.log("Testing jwt...");
    const token = jwt.sign({ id: "123" }, process.env.JWT_SECRET || "test_secret", { expiresIn: "1h" });
    console.log("JWT Token generated:", !!token);

    console.log("All essential auth libraries are working!");
  } catch (err) {
    console.error("Auth Library Error:", err);
  }
}

test();
