
import User from "../../models/User.js";
import { generateToken } from "../../utils/generateToken.js";
import { hashToken } from "../../utils/hashToken.js";
import { inviteUserService } from "./auth.service.js";
import bcrypt from "bcryptjs";

/* ================= INVITE USER ================= */
export const inviteUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const result = await inviteUserService(
      name,
      email,
      role,
      req.user
    );

    return res.status(200).json(result);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Invite Controller Error:", error.message);
    }

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to send invitation",
    });
  }
};

/* ================= SET PASSWORD ================= */
export const setPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const hashedToken = hashToken(req.params.token);

    const user = await User.findOne({
      emailVerifyToken: hashedToken,
      emailVerifyExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    user.password = password;
    user.isVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Account activated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for email:", email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    console.log("User found:", user ? "YES" : "NO");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.log("Checking password matching...");
    const isMatch = await user.matchPassword(password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account disabled",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your account first",
      });
    }

    // 🔐 Generate secure cookie token
    console.log("Generating token for user ID:", user._id);
    generateToken(res, user._id, user.role);

    console.log("Updating last login...");
    user.lastLogin = new Date();
    await user.save();

    console.log("Login successful!");
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("CRITICAL LOGIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      errorDetails: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
};

/* ================= GET PROFILE ================= */
export const getProfile = async (req, res) => {
  return res.json({
    success: true,
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};


export const logout = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    secure: false,     // 🔥 MUST match generateToken
    sameSite: "lax",   // 🔥 MUST match generateToken
    expires: new Date(0),
  });

  return res.json({
    success: true,
    message: "Logged out successfully",
  });
};

/* ================= ADMIN USER MANAGEMENT ================= */

export const getAllUsers = async (req, res) => {
  try {
    let users;

    if (req.user.role === "superadmin") {
      // superadmin → sab users dekhega
      users = await User.find().select("-password");
    } else {
      // admin / others → superadmin hide
      users = await User.find({
        role: { $ne: "superadmin" }
      }).select("-password");
    }

    return res.json({
      success: true,
      users,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const toggleUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  user.isActive = !user.isActive;
  await user.save();

  return res.json({
    success: true,
    message: "Status updated",
  });
};

export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  await user.deleteOne();

  return res.json({
    success: true,
    message: "User deleted",
  });
};


export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    // check current password
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // validation
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    // set new password
    user.password = newPassword;
    await user.save();

    return res.json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};