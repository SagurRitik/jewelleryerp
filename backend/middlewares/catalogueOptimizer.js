import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const catalogueDir = path.join(__dirname, "..", "uploads", "catalogues");

// Ensure upload folder exists
if (!fs.existsSync(catalogueDir)) {
  fs.mkdirSync(catalogueDir, { recursive: true });
}

const uniqueSuffix = () => Date.now() + "-" + crypto.randomBytes(4).toString("hex");
const isImage = (mimetype) => mimetype && mimetype.startsWith("image/");

/**
 * Compresses catalogue images (thumbnail + image-based catalogue files).
 * PDF files are saved as-is to disk.
 * Sets file.filename and file.path so the controller stays unchanged.
 */
export const optimizeCatalogueImages = async (req, res, next) => {
  if (!req.files) return next();

  try {
    // ─── Thumbnail (always an image) ─────────────────────────────
    if (req.files.thumbnail?.[0]) {
      const file = req.files.thumbnail[0];
      if (isImage(file.mimetype)) {
        const filename = `thumbnail-${uniqueSuffix()}.webp`;
        const outputPath = path.join(catalogueDir, filename);

        await sharp(file.buffer)
          .resize(400, 400, { fit: "inside", withoutEnlargement: true })
          .toFormat("webp")
          .webp({ quality: 75 })
          .toFile(outputPath);

        file.filename = filename;
        file.path = `/uploads/catalogues/${filename}`;
        console.log(`✅ Catalogue thumbnail compressed → ${filename}`);
      }
    }

    // ─── Main Catalogue File (image or PDF) ──────────────────────
    if (req.files.file?.[0]) {
      const file = req.files.file[0];

      if (isImage(file.mimetype)) {
        // Image catalogue → compress to webp
        const filename = `catalogue-${uniqueSuffix()}.webp`;
        const outputPath = path.join(catalogueDir, filename);

        await sharp(file.buffer)
          .resize(1200, 1600, { fit: "inside", withoutEnlargement: true })
          .toFormat("webp")
          .webp({ quality: 80 })
          .toFile(outputPath);

        file.filename = filename;
        file.path = `/uploads/catalogues/${filename}`;
        console.log(`✅ Catalogue image compressed → ${filename}`);
      } else {
        // PDF → save as-is (no compression)
        const ext = path.extname(file.originalname).toLowerCase() || ".pdf";
        const filename = `catalogue-${uniqueSuffix()}${ext}`;
        const outputPath = path.join(catalogueDir, filename);

        fs.writeFileSync(outputPath, file.buffer);
        file.filename = filename;
        file.path = `/uploads/catalogues/${filename}`;
        console.log(`📄 Catalogue PDF saved → ${filename}`);
      }
    }

    next();
  } catch (error) {
    console.error("📑 Catalogue Optimizer Error:", error);
    next(); // Don't block upload on optimizer failure
  }
};
