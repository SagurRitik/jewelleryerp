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
      // Supports THREE formats:
      // 1. Flat comp columns:  comp1_type, comp1_shape, comp1_count, ...  (standard template)
      // 2. Diamond shorthand: dia1_shape, dia1_color, dia1_clarity, dia1_total_ct, dia1_qty_pcs, ...
      // 3. Legacy JSON:       components column with JSON array string
      let components = [];

      // --- Format 1: Standard flat comp columns (comp1_type, comp1_role, ...) ---
      const MAX_COMP = 6;
      for (let ci = 1; ci <= MAX_COMP; ci++) {
        const prefix = `comp${ci}`;
        const compType = String(row[`${prefix}type`] || "").trim();
        if (!compType) continue; // no type = skip this slot

        // Parse color and clarity: normalize to UPPERCASE so they match dropdown options
        const colorClarity = String(row[`${prefix}colorclarity`] || "").trim().toUpperCase();
        let compColor = String(row[`${prefix}color`] || "").trim().toUpperCase();
        let compClarity = String(row[`${prefix}clarity`] || "").trim().toUpperCase();
        // If combined field is used, split on "/" if separate ones are empty
        if (colorClarity && !compColor && !compClarity) {
          const parts = colorClarity.split("/").map(s => s.trim());
          compColor = parts[0] || "";
          compClarity = parts[1] || "";
        }

        // Auto-detect pricingRef based on component type
        let pricingRef = "";
        const typeLower = compType.toLowerCase();
        if (typeLower.includes("diamond")) {
          pricingRef = "DIAMOND";
        } else if (typeLower.includes("polki")) {
          pricingRef = "POLKI";
        } else if (typeLower.includes("belt")) {
          pricingRef = "BELT";
        } else {
          pricingRef = "STONE";
        }

        const comp = {
          type:          compType,
          componentRole: String(row[`${prefix}role`] || "SIDE").trim().toUpperCase(),
          shape:         String(row[`${prefix}shape`] || "").trim(),
          color:         compColor,
          clarity:       compClarity,
          cut:           String(row[`${prefix}cut`] || "").trim(),
          count:         parseNumber(row[`${prefix}count`] || row[`${prefix}qty`] || 0),
          weight:        parseNumber(row[`${prefix}weight`] || 0),
          grossWeight:   parseNumber(row[`${prefix}grossweight`] || 0),
          size:          String(row[`${prefix}size`] || ""),
          description:   String(row[`${prefix}description`] || ""),
          pricingRef,
        };

        // Valid componentRole check
        const validRoles = ["CENTER", "SIDE", "MICRO", "ACCENT"];
        if (!validRoles.includes(comp.componentRole)) comp.componentRole = "SIDE";

        components.push(comp);
      }

      // --- Format 2: dia1_* / dia2_* shorthand columns (user's existing Excel format) ---
      // Supports: dia1_shape, dia1_color, dia1_clarity, dia1_size, dia1_total_ct, dia1_qty_pcs,
      //           dia1_weight_ct (per-piece weight), dia2_*, dia3_* up to dia4_*
      if (components.length === 0) {
        const MAX_DIA = 4;
        for (let di = 1; di <= MAX_DIA; di++) {
          const dp = `dia${di}`;

          // Try all normalized variants for shape field to detect if this slot is populated
          const diaShape = String(
            row[`${dp}shape`] || row[`${dp}shape`] || ""
          ).trim();
          // Normalize color and clarity to uppercase so they match dropdown options on the Edit form
          const diaColor = String(row[`${dp}color`] || "").trim().toUpperCase();
          const diaClarity = String(row[`${dp}clarity`] || "").trim().toUpperCase();
          const diaTotalCt = parseNumber(
            row[`${dp}totalct`] || row[`${dp}weighttotalct`] || row[`${dp}totalweight`] || 0
          );
          const diaQtyPcs = parseNumber(
            row[`${dp}qtypcs`] || row[`${dp}qty`] || row[`${dp}count`] || row[`${dp}pcs`] || 0
          );
          // per-piece weight (in ct)
          const diaWeightPPc = parseNumber(
            row[`${dp}weightct`] || row[`${dp}weightperpcs`] || row[`${dp}perpcweight`] || 0
          );
          const diaSize = String(row[`${dp}size`] || "").trim();
          const diaCut = String(row[`${dp}cut`] || "").trim();

          // Skip this slot if no identifying info
          if (!diaShape && !diaColor && !diaClarity && diaTotalCt === 0 && diaQtyPcs === 0) continue;

          // Compute weight: prefer per-piece weight × qty, else use total ct
          const computedWeight = diaWeightPPc > 0 && diaQtyPcs > 0
            ? diaWeightPPc * diaQtyPcs
            : diaTotalCt;

          components.push({
            type:          "Diamond",
            componentRole: di === 1 ? "CENTER" : "SIDE",
            shape:         diaShape,
            color:         diaColor,
            clarity:       diaClarity,
            cut:           diaCut,
            count:         diaQtyPcs,
            weight:        diaWeightPPc || (diaQtyPcs > 0 ? diaTotalCt / diaQtyPcs : diaTotalCt),
            grossWeight:   computedWeight,
            size:          diaSize,
            description:   "",
            pricingRef:    "DIAMOND",
          });
        }

        // Color Stone / Accessory columns — look for colorstonetype, colorstone, accessories etc.
        // Supports: Color Stone (col header), colorstone_type, colorstone_shape, colorstone_weight etc.
        // Also handles user Excel pattern where "Color Stone" is a column header and shape like "Princess" is another col
        const csType = String(
          row["colorstonetype"] || row["colorstone"] || row["stonetype"] ||
          row["accessorytype"] || row["accessory"] || ""
        ).trim();
        const csShape = String(
          row["colorstoneshape"] || row["stoneshape"] || row["accessoryshape"] ||
          row["princess"] || row["oval"] || row["round"] || ""    // some Excel files use stone shape as col name
        ).trim();
        const csColor = String(
          row["colorstonecolor"] || row["stonecolor"] || ""
        ).trim();
        const csClarity = String(
          row["colorstoneclarity"] || row["stoneclarity"] || ""
        ).trim();
        const csCount = parseNumber(
          row["colorstonecount"] || row["colorstoneqty"] || row["stonecount"] ||
          row["accessorycount"] || row["accessoryqty"] || 0
        );
        const csWeight = parseNumber(
          row["colorstoneweight"] || row["stoneweight"] || row["accessoryweight"] || 0
        );
        const csSize = String(
          row["colorstonesize"] || row["stonesize"] || row["accessorysize"] || ""
        ).trim();

        // Only add color stone if there's actually meaningful data (weight or count must be > 0)
        // Prevents adding empty stones when only the column header value is present
        if ((csType || csShape) && (csWeight > 0 || csCount > 0)) {
          components.push({
            type:          csType || "Color Stone",
            componentRole: "ACCENT",
            shape:         csShape,
            color:         csColor,
            clarity:       csClarity,
            cut:           "",
            count:         csCount,
            weight:        csWeight,
            grossWeight:   csWeight,
            size:          csSize,
            description:   "",
            pricingRef:    "STONE",
          });
        }
      }

      // --- Format 3: Legacy JSON fallback (only if no flat comp columns found) ---
      if (components.length === 0 && row.components) {
        components = parseJson(row.components);
      }

      // --- Parse certificates (certificate1_no, certificate1_lab, certificate2_no, ...) ---
      const certificates = [];
      for (let ci = 1; ci <= 4; ci++) {
        const certNo = String(row[`certificate${ci}no`] || row[`cert${ci}no`] || "").trim();
        const certLab = String(row[`certificate${ci}lab`] || row[`cert${ci}lab`] || "").trim();
        if (certNo || certLab) {
          certificates.push({ certificateNo: certNo, lab: certLab });
        }
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

      // --- Normalize targetAudience: support "Female", "Male", "female", etc. ---
      const rawAudience = String(row.targetaudience || "").trim().toUpperCase();
      const audienceMap = {
        "FEMALE": "WOMEN",
        "WOMAN":  "WOMEN",
        "MALE":   "MEN",
        "MAN":    "MEN",
        "BOY":    "MEN",
        "GIRL":   "WOMEN",
        "CHILD":  "KIDS",
        "KID":    "KIDS",
      };
      const validAudiences = ["MEN", "WOMEN", "UNISEX", "KIDS"];
      let resolvedAudience = audienceMap[rawAudience] || rawAudience;
      if (!validAudiences.includes(resolvedAudience)) {
        resolvedAudience = "UNISEX";
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
        certificates,
        metalType,
        metalPurity,
        metalColor: row.metalcolor || "",
        netWeight,
        grossWeight,
        fineGold: parseNumber(row.finegold),
        targetAudience: resolvedAudience,
        components,
        images,
      };

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
