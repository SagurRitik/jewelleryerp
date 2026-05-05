

import dotenv from "dotenv";
import express from "express";

import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";            // 🛡️ Security Headers
import cookieParser from "cookie-parser"; // 🍪 Cookie Parsing for JWT
import rateLimit from "express-rate-limit"; // 🚦 Rate Limiting

// Config & DB
import connectDB from "./config/db.js";
// import { startMetalRateCron } from "./controllers/cron/metalRateCron.js";
// import { fetchAndStoreMetalRates } from "./controllers/services/fetchMetalRates.js";

// --- ROUTES IMPORTS ---
import authRoutes from "./routes/authRoutes.js"; // 🔐 Auth Routes (New)
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
// import posInvoiceRoutes from "./routes/posInvoiceRoutes.js";
// import reportRoutes from "./routes/reportRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import rateRoutes from "./routes/admin/rates.routes.js";
import salesOrderRoutes from "./routes/salesOrder.routes.js";
import confirmInvoiceRoutes from "./routes/confirmInvoiceRoutes.js";
// import metalRateRoutes from "./routes/metalRateRoutes.js";
import salesInvoiceRoutes from "./routes/salesInvoice.routes.js";
import salesClosingRoutes from "./routes/reports/salesClosing.routes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import excelUploadRoutes from "./routes/exceluploadRoutes.js";
import imageUploadRoutes from "./routes/imageUploadRoutes.js";
import zipExcelRoutes from "./routes/zipexcelRoutes.js";
import validateExcelRoutes from "./routes/validateExcelOnlyRoutes.js";
import diamondRateRoutes from "./routes/admin/diamondRate.routes.js";
import stoneRateRoutes from "./routes/admin/stoneRate.routes.js";
// import authRoutes from "./controllers/auth/auth.routes.js";
import superAdminRoutes from "./routes/superadmin.routes.js";
import metalLedgerRoutes from "./routes/metalLedgerRoutes.js";
import returnRoutes from "./routes/returnRoutes.js";
import creditNoteRoutes from "./routes/creditNote.routes.js";
import manualInvoiceRoutes from "./routes/manualInvoice.routes.js";
import expenseRoutes from "./routes/Expense.Routes.js";
import inquiryRoutes from "./routes/inquiryRoutes.js";
import gstSummaryRoutes from "./routes/reports/gstSummaryRoutes.js";
import quotationRoutes from "./routes/quotationRoutes.js";
import supplierRoutes from "./routes/supplier.routes.js";
import supplierPaymentRoutes from "./routes/supplierPayment.routes.js";
import purchaseRoutes from "./routes/purchase.routes.js";

dotenv.config();
connectDB();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------------- 🛡️ SECURITY MIDDLEWARES ---------------- */

// 1. Helmet: Secure HTTP Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled to allow loading scripts/images from frontend if needed
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow frontend to load images
  })
);

// 2. Cookie Parser: Read HTTP-Only Cookies
app.use(cookieParser());

// 3. CORS: Allow Frontend Access with Credentials
const allowedOrigins = [
  "http://122.176.216.225:5000",
  "http://122.176.216.225",
  "http://localhost:5173"
];

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.options(/.*/, cors());

app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000, // Adjusted for POS usage
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);


app.set("etag", false);

app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});


/* ---------------- STANDARD MIDDLEWARES ---------------- */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));


app.use("/api/products", zipExcelRoutes);

app.use("/api/products", excelUploadRoutes);
app.use("/api", imageUploadRoutes);
// ================= PRODUCTS =================
app.use("/api/products", validateExcelRoutes);



/* ---------------- STATIC UPLOADS ---------------- */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ---------------- API ROUTES ---------------- */

// 🔐 AUTH & USERS (New)
app.use("/api/auth", authRoutes);

// PRODUCTS & ORDERS
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);

app.use("/api/manual-invoices", manualInvoiceRoutes);

// INVOICES & POS
app.use("/api/sales-orders", salesOrderRoutes);

app.use("/api/invoices", invoiceRoutes);
app.use("/api/invoices", confirmInvoiceRoutes); // Check for conflicts if base path is same
// app.use("/api/pos-invoices", posInvoiceRoutes);
app.use("/api/sales-invoices", salesInvoiceRoutes);

//dashboard
app.use("/api/dashboard", dashboardRoutes);
// REPORTS & CLOSING
// app.use("/api/reports", reportRoutes);
app.use("/api/reports", salesClosingRoutes);
app.use("/api/reports", gstSummaryRoutes);


// ADMIN & RATES
app.use("/api/admin/rates", rateRoutes);
// app.use("/api/metal-rates", metalRateRoutes);
app.use("/api/admin/diamond-rates", diamondRateRoutes);
app.use("/api/admin/stone-rates", stoneRateRoutes);
app.use("/api/auth", superAdminRoutes);
app.use("/api/metal-ledger", metalLedgerRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/creditnotes", creditNoteRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/quotation", quotationRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/supplier-payments", supplierPaymentRoutes);
app.use("/api/purchases", purchaseRoutes);

/* ---------------- HANDLE UNKNOWN API REQUESTS ---------------- */
app.all(/^\/api\/.*/, (req, res) => {
  res.status(404).json({ success: false, message: "API route not found" });
});

/* ---------------- SERVE FRONTEND (Build) ---------------- */
app.use(express.static(path.join(__dirname, "../frontend/dist")));

const uploadsPath = path.join(__dirname, "..", "uploads");

app.use("/uploads", express.static(uploadsPath));

/* ---------------- SPA FALLBACK ---------------- */


app.use((req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
    return next();
  }

  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

app.use((err, req, res, next) => {
  console.error("Global Error:", err.message);

  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));