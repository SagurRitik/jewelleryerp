// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// export const protect = async (req, res, next) => {
//   try {
//     const token = req.cookies.jwt;

//     if (!token) return res.status(401).json({ message: "Not authorized" });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await User.findById(decoded.userId);

//     if (!user || !user.isActive)
//       return res.status(401).json({ message: "Unauthorized" });

//     req.user = user;
//     next();
//   } catch (error) {
//     res.status(401).json({ message: "Not authorized" });
//   }
// };


import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  try {
    /* 1️⃣ Check Authorization header */
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    /* 2️⃣ Fallback to cookie */
    if (!token && req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }

    /* 3️⃣ Verify Token */
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /* 4️⃣ Get User (without password) */
    const user = await User.findById(decoded.userId).select("-password");

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    req.user = user;

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        error.name === "TokenExpiredError"
          ? "Session expired, please login again"
          : "Not authorized, invalid token",
    });
  }
};