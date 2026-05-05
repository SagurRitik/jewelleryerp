// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// // 1. Check if Logged In
// export const protect = async (req, res, next) => {
//   let token;
//   token = req.cookies.jwt; // Read from HTTP-Only cookie

//   if (token) {
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = await User.findById(decoded.userId).select("-password");
//       next();
//     } catch (error) {
//       res.status(401).json({ message: "Not authorized, invalid token" });
//     }
//   } else {
//     res.status(401).json({ message: "Not authorized, no token" });
//   }
// };

// // 2. Check Role (RBAC)
// export const authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!req.user || !roles.includes(req.user.role)) {
//       return res.status(403).json({ 
//         message: `Role '${req.user.role}' is not authorized to access this route` 
//       });
//     }
//     next();
//   };
// };

// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// /* ================= 1. SIGNUP (Send OTP) ================= */
// export const registerUser = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     const userExists = await User.findOne({ email });
//     if (userExists) return res.status(400).json({ message: "User already exists" });

//     // Generate 6-digit OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const otpExpires = Date.now() + 10 * 60 * 1000; // 10 Minutes validity

//     // 🔥🔥🔥 DEVELOPMENT HACK: Console mein OTP dikhao 🔥🔥🔥
//     console.log(`\n=========================================`);
//     console.log(`🔒 OTP for ${email}: ${otp}`);
//     console.log(`=========================================\n`);

//     // Create User
//     const user = await User.create({
//       name,
//       email,
//       password,
//       role: role || "salesperson",
//       otp,
//       otpExpires,
//     });

//     // Send Email (Try-Catch block taaki email fail hone par server crash na ho)
//     try {
//       const message = `Your Nazara Inventory verification code is: ${otp}`;
//       await sendEmail(email, "Verify Your Account", message);
//     } catch (emailError) {
//       console.error("⚠️ Email sending failed (Check App Password). Using Console OTP.");
//     }

//     res.status(201).json({ 
//       success: true, 
//       message: "OTP generated! Check your Email (or Server Console for Dev)." 
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // 🛡️ 1. Check if User is Logged In (Protect Route)
// export const protect = async (req, res, next) => {
//   let token;

//   // Check token in Cookies (Best Practice)
//   token = req.cookies.jwt;

//   if (token) {
//     try {
//       // Verify Token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
//       // Get User from Token (exclude password)
//       req.user = await User.findById(decoded.userId).select("-password");
      
//       next();
//     } catch (error) {
//       console.error("Token verification failed:", error);
//       res.status(401).json({ message: "Not authorized, invalid token" });
//     }
//   } else {
//     res.status(401).json({ message: "Not authorized, no token" });
//   }
// };

// // 👮 2. Role Based Access Control (RBAC)
// export const authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({ message: "User not found" });
//     }

//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ 
//         message: `Role '${req.user.role}' is not authorized to access this route` 
//       });
//     }
//     next();
//   };
// };

// /* ================= 4. LOGOUT ================= */
// export const logoutUser = (req, res) => {
//   // Cookie ka naam wahi hona chahiye jo login karte waqt set kiya tha ('jwt')
//   res.cookie("jwt", "", {
//     httpOnly: true,
//     expires: new Date(0), // Set expiry to past date to delete it immediately
//   });

//   res.status(200).json({ message: "Logged out successfully" });
// };



// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// // 🛡️ 1. Protect Route
// export const protect = async (req, res, next) => {
//   let token = req.cookies.jwt;

//   if (token) {
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = await User.findById(decoded.userId).select("-password");
//       next();
//     } catch (error) {
//       res.status(401).json({ message: "Not authorized, invalid token" });
//     }
//   } else {
//     res.status(401).json({ message: "Not authorized, no token" });
//   }
// };

// // 👮 2. Role Based Access
// export const authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!req.user || !roles.includes(req.user.role)) {
//       return res.status(403).json({ 
//         message: `Role '${req.user?.role}' is not authorized.` 
//       });
//     }
//     next();
//   };
// };

// export const protect = async (req, res, next) => {
//   const token = req.cookies.jwt;
//   if (!token) {
//     return res.status(401).json({ message: "Not authorized, no token" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.userId).select("-password");
//     next();
//   } catch {
//     res.status(401).json({ message: "Not authorized, invalid token" });
//   }
// };


// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// export const protect = async (req, res, next) => {
//   let token;

//   // ✅ 1️⃣ Check Authorization header (Frontend token)
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     token = req.headers.authorization.split(" ")[1];
//   }

//   // ✅ 2️⃣ Fallback to cookie (optional)
//   if (!token && req.cookies?.jwt) {
//     token = req.cookies.jwt;
//   }

//   if (!token) {
//     return res.status(401).json({ message: "Not authorized, no token" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.userId).select("-password");
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Not authorized, invalid token" });
//   }
// };

// export const authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!req.user || !roles.includes(req.user.role)) {
//       return res.status(403).json({
//         message: `Role '${req.user?.role}' is not authorized.`,
//       });
//     }
//     next();
//   };
// };



import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* ================= PROTECT MIDDLEWARE ================= */
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

    /* 4️⃣ Get User */
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
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

/* ================= ROLE AUTHORIZATION ================= */
export const authorize = (...roles) => {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized`,
      });
    }

    next();
  };
};