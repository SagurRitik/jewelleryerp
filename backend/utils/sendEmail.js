

import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, htmlContent) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Email credentials missing in .env file");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Jewellery ERP" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log("✅ Email sent:", info.messageId);
    return info;

  } catch (error) {
    console.error("❌ Email failed:", error.message);
    throw new Error("Email sending failed");
  }
};