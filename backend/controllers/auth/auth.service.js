

import crypto from "crypto";
import User from "../../models/User.js";
import { hashToken } from "../../utils/hashToken.js";
import { sendEmail } from "../../utils/sendEmail.js";

/* ================= INVITE USER SERVICE ================= */
export const inviteUserService = async (name, email, role, invitedBy) => {
  let user = null;

  try {
    /* ---------- 1️⃣ Sanitize & Validate ---------- */
    name = name?.trim();
    email = email?.trim().toLowerCase();
    role = role?.trim();

    if (!name || !email || !role) {
      throw new Error("All fields are required");
    }

    const allowedRoles = [
      "admin",
      "manager",
      "salesperson",
      "accountant",
      "inventory",
    ];

    if (!allowedRoles.includes(role)) {
      throw new Error("Invalid role selected");
    }

    /* ---------- 2️⃣ Validate Inviter ---------- */
    if (!invitedBy) {
      throw new Error("Unauthorized request");
    }

    if (role === "admin" && invitedBy.role !== "superadmin") {
      throw new Error("Only Superadmin can create Admin users");
    }

    /* ---------- 3️⃣ Prevent Duplicate ---------- */
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    /* ---------- 4️⃣ Generate Secure Token ---------- */
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = hashToken(rawToken);

    /* ---------- 5️⃣ Create User (Unverified) ---------- */
    user = await User.create({
      name,
      email,
      role,
      isVerified: false,
      isActive: true,
      emailVerifyToken: hashedToken,
      emailVerifyExpires: Date.now() + 24 * 60 * 60 * 1000,
    });

   /* ---------- 6️⃣ Activation Link ---------- */
// const frontendUrl =
//   process.env.FRONTEND_URL ||
//   (process.env.NODE_ENV === "development"
//     ? "http://localhost:5173"
//     : "http://122.176.216.225:5000");

// const frontendUrl = process.env.FRONTEND_URL||"http://122.176.216.225:5000";

// const activationLink = `${frontendUrl}/set-password/${rawToken}`;
// const activationLink = `http://122.176.216.225:5000/set-password/${rawToken}`;
const frontendUrl =
  process.env.FRONTEND_URL ;

const activationLink = `${frontendUrl}/set-password/${rawToken}`;
    /* ---------- 7️⃣ Email Template ---------- */
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color:#5A374F;">Jewellery ERP Account Invitation</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>You have been invited as <strong>${role}</strong>.</p>
        <p>Please click below to activate your account:</p>

<a 
 href="${activationLink}"
 style="display:inline-block; padding:12px 20px; background-color:#5A374F; color:white; text-decoration:none; border-radius:6px; font-weight:bold;">
 Activate Account
</a>

        <p style="margin-top:20px;">
          This link will expire in 24 hours.
        </p>

        <hr/>
        <p style="font-size:12px;color:#888;">
          If you did not expect this invitation, please ignore this email.
        </p>
      </div>
    `;

    /* ---------- 8️⃣ Send Email ---------- */
    await sendEmail(
      email,
      "Activate Your Jewellery ERP Account",
      htmlContent
    );

    return {
      success: true,
      message: "Invitation sent successfully",
      userId: user._id,
    };

  } catch (error) {

    /* ---------- 🔥 ROLLBACK IF EMAIL FAILED ---------- */
    if (user) {
      await User.deleteOne({ _id: user._id });
    }

    if (process.env.NODE_ENV !== "production") {
      console.error("Invite Service Error:", error);
    }

    throw new Error(error.message || "Failed to send invitation");
  }
};