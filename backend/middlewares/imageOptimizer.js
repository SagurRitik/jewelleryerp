import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "..", "uploads");

// Ensure upload folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const optimizeProductImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  try {
    const productFiles = [];
    const slipPaths = [];

    // Filter out duplicate files (e.g. if client sent same file under both purchaseBills and purchaseBill)
    const seenSlipKeys = new Set();
    const filesToProcess = [];

    for (const file of req.files) {
      const isPurchaseSlip = 
        file.fieldname === "purchaseBill" ||
        file.fieldname === "purchaseBills" ||
        file.fieldname === "purchaseSlip" ||
        file.fieldname === "purchaseSlips" ||
        file.fieldname.startsWith("purchaseBill") ||
        file.fieldname.startsWith("purchaseSlip");

      if (isPurchaseSlip) {
        const fileKey = `${file.originalname || file.name || "slip"}_${file.size}`;
        if (seenSlipKeys.has(fileKey)) {
          continue; // Skip duplicate upload of the exact same slip
        }
        seenSlipKeys.add(fileKey);
      }
      filesToProcess.push(file);
    }

    await Promise.all(
      filesToProcess.map(async (file) => {
        const uniqueSuffix = Date.now() + "-" + crypto.randomBytes(4).toString("hex");
        const isPurchaseSlip = 
          file.fieldname === "purchaseBill" ||
          file.fieldname === "purchaseBills" ||
          file.fieldname === "purchaseSlip" ||
          file.fieldname === "purchaseSlips" ||
          file.fieldname.startsWith("purchaseBill") ||
          file.fieldname.startsWith("purchaseSlip");

        const prefix = isPurchaseSlip ? "purchase-bill" : "product";
        const filename = `${prefix}-${uniqueSuffix}.webp`;
        const outputPath = path.join(uploadDir, filename);

        // Optimize with Sharp (Auto-rotate EXIF orientation + Compressed WebP)
        await sharp(file.buffer)
          .rotate()
          .resize(1200, 1200, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .toFormat("webp")
          .webp({ quality: 80, effort: 6 })
          .toFile(outputPath);

        file.filename = filename;
        file.path = `/uploads/${filename}`;

        if (isPurchaseSlip) {
          slipPaths.push(`/uploads/${filename}`);
        } else {
          productFiles.push(file);
        }
      })
    );

    if (slipPaths.length > 0) {
      if (!Array.isArray(req.body.purchaseBills)) {
        req.body.purchaseBills = req.body.purchaseBills ? [req.body.purchaseBills] : [];
      }
      if (!Array.isArray(req.body.purchaseSlips)) {
        req.body.purchaseSlips = req.body.purchaseSlips ? [req.body.purchaseSlips] : [];
      }
      req.body.purchaseBills.push(...slipPaths);
      req.body.purchaseSlips.push(...slipPaths);
      if (!req.body.purchaseBill) req.body.purchaseBill = slipPaths[0];
      if (!req.body.purchaseSlip) req.body.purchaseSlip = slipPaths[0];
    }

    // Keep only product gallery files in req.files for controller image mapping
    req.files = productFiles;

    next();
  } catch (error) {
    console.error("🖼️ Image Optimization Error:", error);
    next();
  }
};
