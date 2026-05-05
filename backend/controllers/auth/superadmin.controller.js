
import User from "../../models/User.js";

export const createSuperAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Create directly (let Mongo handle duplicates)
    const superAdmin = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: "superadmin",
      isVerified: true,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Superadmin created successfully",
      user: {
        _id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email,
        role: superAdmin.role,
      },
    });

  } catch (error) {
    // Duplicate email protection
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    console.error("Create SuperAdmin Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ================= CHANGE PASSWORD ================= */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    // Get logged-in user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return res.json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Change Password Error:", error);
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};