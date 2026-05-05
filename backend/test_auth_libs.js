
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
    const secret = process.env.JWT_SECRET || "test_secret";
    console.log("JWT_SECRET:", secret);
    const token = jwt.sign({ id: "123" }, secret, { expiresIn: "1h" });
    console.log("JWT Token generated:", !!token);

    console.log("SUCCESS: Auth libraries are working correctly!");
  } catch (err) {
    console.error("FAILURE: Auth Library Error:", err);
    process.exit(1);
  }
}

test();
