import XLSX from "xlsx";
import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import Product from "../models/Product.js";
import { clearProductCache } from "../utils/productCache.js";

const ZIP_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff"]);

/* ================= HELPERS ================= */

// Normalize excel headers (lowercase, no spaces, no underscores)
const normalizeKey = (key = "") =>
  key.toString().replace(/\s+/g, "").replace(/_/g, "").toLowerCase();

// Bulletproof boolean parser
const parseBool = (val) => {
  if (val === true) return true;
  if (val === false) return false;
  if (typeof val === "number") return val === 1;
  if (typeof val === "string") {
    const v = val.trim().toUpperCase();
    if (["TRUE", "YES", "Y", "1"].includes(v)) return true;
    if (["FALSE", "NO", "N", "0", ""].includes(v)) return false;
  }
  return false;
};

// Safe number parser
const parseNumber = (val) => {
  if (val === "" || val === null || val === undefined) return 0;
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

// Safe JSON parser
const parseJson = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try {
    return JSON.parse(val);
  } catch (err) {
    console.error("JSON Parse Error:", val);
    return [];
  }
};

/**
 * BULK UPLOAD PRODUCTS
 * - Mandatory: Excel file
 * - Optional: ZIP folder for images
 */
export const bulkUploadProducts = async (req, res) => {
  const report = { inserted: [], updated: [], skipped: [] };
  const uploadDir = path.join("uploads");

  try {
    console.log("🚀 BULK UPLOAD STARTED 🚀");

    // 1️⃣ Validate Excel Presence
    if (!req.files?.excel) {
      return res.status(400).json({
        success: false,
        message: "Excel file is required (.xlsx)",
      });
    }

    // 2️⃣ Handle Optional ZIP Images (with compression)
    const hasZip = req.files?.images && req.files.images.length > 0;
    if (hasZip) {
      console.log("📦 Extracting & compressing images from ZIP...");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      try {
        const zip = new AdmZip(req.files.images[0].buffer);
        const zipEntries = zip.getEntries().filter((e) => !e.isDirectory);

        // Flatten all images from ANY subfolder → compress to webp → save in uploads/
        await Promise.all(
          zipEntries.map(async (entry) => {
            const originalName = path.basename(entry.entryName);
            const ext = path.extname(originalName).toLowerCase();

            if (ZIP_IMAGE_EXTENSIONS.has(ext)) {
              // Compress → webp (keep base name so Excel mapping still works)
              const nameWithoutExt = path.basename(originalName, ext);
              const outputFilename = `${nameWithoutExt}.webp`;
              const destPath = path.join(uploadDir, outputFilename);
              console.log(`  📸 Compressing: ${originalName} → ${outputFilename}`);

              await sharp(entry.getData())
                .resize(800, 800, { fit: "inside", withoutEnlargement: true })
                .toFormat("webp")
                .webp({ quality: 80 })
                .toFile(destPath);
            } else {
              console.log(`  ⏭️ Skipped (not an image): ${originalName}`);
            }
          })
        );

        console.log(`✅ Compressed ${zipEntries.length} file(s) from ZIP`);
      } catch (zipErr) {
        console.error("ZIP Extraction Failed:", zipErr);
        // Continue even if ZIP fails
      }
    }

    // 3️⃣ Read Excel
    const workbook = XLSX.read(req.files.excel[0].buffer, {
      type: "buffer",
      cellDates: true,
    });

    let rows = [];
    let sheetUsed = null;

    // Find the first sheet that has data
    for (const sheetName of workbook.SheetNames) {
      const temp = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
      if (temp.length > 0) {
        rows = temp;
        sheetUsed = sheetName;
        break;
      }
    }

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "The Excel file is empty",
      });
    }

    // 4️⃣ Process Rows
    for (let i = 0; i < rows.length; i++) {
      const rawRow = rows[i];
      const rowNo = i + 2; // Offset for header and 0-index

      // Normalize keys
      const row = {};
      Object.keys(rawRow).forEach((k) => {
        row[normalizeKey(k)] = rawRow[k];
      });

      // Extract required fields (using normalized keys)
      const sku = String(row.sku || "").trim();
      const title = String(row.title || "").trim();
      const jewelleryCategory = String(row.jewellerycategory || row.category || "").trim();
      const metalType = String(row.metaltype || "").trim();
      const metalPurity = String(row.metalpurity || "").trim();
      const netWeight = parseNumber(row.netweight);
      const grossWeight = parseNumber(row.grossweight);

      // Validation
      if (!sku || !title || !jewelleryCategory || !metalType || !metalPurity || !netWeight || !grossWeight) {
        report.skipped.push({
          row: rowNo,
          sku: sku || "N/A",
          reason: "Missing required fields (SKU, Title, Category, Metal Type, Purity, Net Weight, or Gross Weight)",
        });
        continue;
      }

      // Handle Components (Optional)
      // Supports TWO formats:
      // 1. Flat columns: comp1_type, comp1_shape, comp1_count, comp2_type ...  (PREFERRED - easy Excel)
      // 2. Legacy JSON: components column with JSON array string
      let components = [];

      // --- Format 1: Flat comp columns (comp1_type, comp1_role, ...) ---
      const MAX_COMP = 6;
      for (let ci = 1; ci <= MAX_COMP; ci++) {
        const prefix = `comp${ci}`;
        const compType = String(row[`${prefix}_type`] || row[`${prefix}type`] || "").trim();
        if (!compType) continue; // no type = skip this slot

        // Parse color and clarity from combined "D-F / VVS-VK" or separate fields
        const colorClarity = String(row[`${prefix}_color_clarity`] || row[`${prefix}_colorclarit`] || row[`${prefix}colorclarit`] || "").trim();
        let compColor = String(row[`${prefix}_color`] || row[`${prefix}color`] || "").trim();
        let compClarity = String(row[`${prefix}_clarity`] || row[`${prefix}clarity`] || "").trim();
        // If combined field is used, split on "/" if separate ones are empty
        if (colorClarity && !compColor && !compClarity) {
          const parts = colorClarity.split("/").map(s => s.trim());
          compColor = parts[0] || "";
          compClarity = parts[1] || "";
        }

        const comp = {
          type:           compType,
          componentRole:  String(row[`${prefix}_role`] || row[`${prefix}role`] || "SIDE").trim().toUpperCase(),
          shape:          String(row[`${prefix}_shape`] || row[`${prefix}shape`] || "").trim(),
          color:          compColor,
          clarity:        compClarity,
          cut:            String(row[`${prefix}_cut`] || row[`${prefix}cut`] || "").trim(),
          count:          parseNumber(row[`${prefix}_count`] || row[`${prefix}count`] || row[`${prefix}_qty`] || 0),
          weight:         parseNumber(row[`${prefix}_weight`] || row[`${prefix}weight`] || 0),
          grossWeight:    parseNumber(row[`${prefix}_grossweight`] || row[`${prefix}grossweight`] || 0),
          size:           String(row[`${prefix}_size`] || row[`${prefix}size`] || "").trim(),
          description:    String(row[`${prefix}_description`] || row[`${prefix}description`] || "").trim(),
        };

        // Valid componentRole check
        const validRoles = ["CENTER", "SIDE", "MICRO", "ACCENT"];
        if (!validRoles.includes(comp.componentRole)) comp.componentRole = "SIDE";

        components.push(comp);
      }

      // --- Format 2: Legacy JSON fallback (only if no flat comp columns found) ---
      if (components.length === 0 && row.components) {
        components = parseJson(row.components);
      }

      // Handle Image Mapping
      // NOTE: Since ZIP images are compressed to .webp, we try the webp variant first.
      let images = [];
      if (row.image || row.images) {
        const imageString = row.images || row.image;
        const imageList = imageString.toString().split(",").map(img => img.trim());

        imageList.forEach(imgFile => {
          if (!imgFile) return;

          const ext = path.extname(imgFile).toLowerCase();
          const nameWithoutExt = ext ? path.basename(imgFile, ext) : imgFile;

          // Priority: webp (compressed) → original name → other extensions
          const candidates = [
            `${nameWithoutExt}.webp`,  // ← compressed version (first priority)
            imgFile,                   // ← original as in Excel
          ];
          if (!ext) {
            // No extension in Excel → also try common extensions
            [".jpg", ".jpeg", ".png", ".gif"].forEach(e => candidates.push(imgFile + e));
          }

          let matched = false;
          for (const candidate of candidates) {
            const fullPath = path.join(uploadDir, candidate);
            if (fs.existsSync(fullPath)) {
              images.push(`uploads/${candidate}`);
              console.log(`  ✅ Image matched: ${candidate}`);
              matched = true;
              break;
            }
          }

          if (!matched) {
            console.warn(`  ⚠️ Image NOT found in uploads: ${imgFile} (tried: ${candidates.join(", ")})`);
          }
        });
      }

      // Construct Payload
      const payload = {
        title,
        description: row.description || "",
        jewelleryCategory,
        productType: row.producttype || "",
        sku,
        stock: parseNumber(row.stock),
        hsnCode: String(row.hsncode || "7113"),
        huid: String(row.huid || ""),
        metalType,
        metalPurity,
        metalColor: row.metalcolor || "",
        netWeight,
        grossWeight,
        fineGold: parseNumber(row.finegold),
        targetAudience: (row.targetaudience || "UNISEX").toUpperCase(),
        components,
        images,
      };

      // Ensure targetAudience is valid enum
      const validAudiences = ["MEN", "WOMEN", "UNISEX", "KIDS"];
      if (!validAudiences.includes(payload.targetAudience)) {
        payload.targetAudience = "UNISEX";
      }

      // Upsert
      try {
        const existing = await Product.findOne({ sku });
        if (existing) {
          await Product.updateOne({ sku }, { $set: payload });
          report.updated.push({ row: rowNo, sku });
        } else {
          await Product.create(payload);
          report.inserted.push({ row: rowNo, sku });
        }
      } catch (dbErr) {
        console.error(`DB Error at row ${rowNo}:`, dbErr);
        report.skipped.push({
          row: rowNo,
          sku,
          reason: dbErr.message,
        });
      }
    }

    // 🧹 Clear backend server-side cache so product list immediately reflects changes
    clearProductCache();

    return res.status(201).json({
      success: true,
      message: "Bulk upload completed",
      summary: {
        sheetUsed,
        totalProcessed: rows.length,
        inserted: report.inserted.length,
        updated: report.updated.length,
        skipped: report.skipped.length,
      },
      report,
    });

  } catch (error) {
    console.error("Bulk upload critical error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during bulk upload",
      error: error.message,
    });
  }
};
