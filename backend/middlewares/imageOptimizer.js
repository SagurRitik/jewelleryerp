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
    req.body.images = []; // We will store optimized paths here

    await Promise.all(
      req.files.map(async (file) => {
        const uniqueSuffix = Date.now() + "-" + crypto.randomBytes(4).toString("hex");
        const filename = `product-${uniqueSuffix}.webp`;
        const outputPath = path.join(uploadDir, filename);

        // Optimize with Sharp
        await sharp(file.buffer)
          .resize(800, 800, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .toFormat("webp")
          .webp({ quality: 80 })
          .toFile(outputPath);

        // Add to req.files to stay compatible with controller logic
        file.filename = filename; // Controller uses this
        file.path = `/uploads/${filename}`;
      })
    );

    next();
  } catch (error) {
    console.error("🖼️ Image Optimization Error:", error);
    next(); // Continue even if optimization fails (fallback to original if we had it, but here we only have buffer)
  }
};
