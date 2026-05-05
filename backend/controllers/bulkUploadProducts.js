

// import XLSX from "xlsx";
// import fs from "fs";
// import path from "path";
// import Product from "../models/Product.js";

// /**
//  * BULK UPLOAD PRODUCTS FROM EXCEL
//  * - Reads Excel file
//  * - Maps images from /uploads/products
//  * - Inserts products in bulk
//  */
// export const bulkUploadProducts = async (req, res) => {
//   try {
//     // 1️⃣ File check
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "Excel file is required"
//       });
//     }

//     // 2️⃣ Read Excel buffer
//     const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];

//     const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

//     if (!rows.length) {
//       return res.status(400).json({
//         success: false,
//         message: "Excel sheet is empty"
//       });
//     }

//     const products = [];
//     const skipped = [];

//     // 3️⃣ Process rows
//     for (let i = 0; i < rows.length; i++) {
//       const row = rows[i];
//       const rowNumber = i + 2; // header offset

//       // 🔴 Required field validation
//       if (!row.title || !row.sku || !row.category || !row.metalType || !row.metalPurity) {
//         skipped.push({
//           row: rowNumber,
//           sku: row.sku || null,
//           reason: "Missing required fields"
//         });
//         continue;
//       }

//       // 🖼️ Image mapping
//       if (row.image) {
//         const imagePath = path.join("uploads", "products", row.image);

//         if (fs.existsSync(imagePath)) {
//           row.image = `/${imagePath.replace(/\\/g, "/")}`;
//         } else {
//           skipped.push({
//             row: rowNumber,
//             sku: row.sku,
//             reason: `Image not found (${row.image})`
//           });
//           row.image = null; // allow product without image
//         }
//       }

//       products.push(row);
//     }

//     if (!products.length) {
//       return res.status(400).json({
//         success: false,
//         message: "No valid products found",
//         skipped
//       });
//     }

//     // 4️⃣ Bulk insert
//     const inserted = await Product.insertMany(products, {
//       ordered: false // skip duplicate SKU errors
//     });

//     // 5️⃣ Final response
//     return res.status(201).json({
//       success: true,
//       insertedCount: inserted.length,
//       skippedCount: skipped.length,
//       skipped
//     });

//   } catch (error) {
//     console.error("Bulk upload error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Bulk upload failed",
//       error: error.message
//     });
//   }
// };



// //excel+zip

// import XLSX from "xlsx";
// import AdmZip from "adm-zip";
// import fs from "fs";
// import path from "path";
// import Product from "../models/Product.js";

// export const bulkUploadProducts = async (req, res) => {
//   try {
//     // 🔴 Files validation
//     if (!req.files?.excel || !req.files?.images) {
//       return res.status(400).json({
//         success: false,
//         message: "Excel and ZIP files are required"
//       });
//     }

//     /* ================= EXTRACT IMAGES ================= */
//     const uploadDir = path.join("uploads", "products");
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }

//     const zip = new AdmZip(req.files.images[0].buffer);
//     zip.extractAllTo(uploadDir, true);

//     /* ================= READ EXCEL ================= */
//     const workbook = XLSX.read(req.files.excel[0].buffer, { type: "buffer" });
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

//     if (!rows.length) {
//       return res.status(400).json({
//         success: false,
//         message: "Excel sheet is empty"
//       });
//     }

//     const products = [];
//     const skipped = [];

//     /* ================= PROCESS ROWS ================= */
//     rows.forEach((row, index) => {
//       const rowNo = index + 2;

//       if (!row.sku || !row.title || !row.category || !row.metalType || !row.metalPurity) {
//         skipped.push({
//           row: rowNo,
//           sku: row.sku || null,
//           reason: "Missing required fields"
//         });
//         return;
//       }

//       // 🖼️ Image mapping
//       if (row.image) {
//         const imagePath = path.join(uploadDir, row.image);

//         if (fs.existsSync(imagePath)) {
//           row.image = `/uploads/products/${row.image}`;
//         } else {
//           skipped.push({
//             row: rowNo,
//             sku: row.sku,
//             reason: `Image not found (${row.image})`
//           });
//           row.image = null;
//         }
//       }

//       products.push(row);
//     });

//     if (!products.length) {
//       return res.status(400).json({
//         success: false,
//         message: "No valid products found",
//         skipped
//       });
//     }

//     /* ================= DB INSERT ================= */
//     const inserted = await Product.insertMany(products, {
//       ordered: false
//     });

//     return res.status(201).json({
//       success: true,
//       insertedCount: inserted.length,
//       skippedCount: skipped.length,
//       skipped
//     });

//   } catch (error) {
//     console.error("Bulk upload failed:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Bulk upload failed",
//       error: error.message
//     });
//   }
// };


// excel + zip (PRODUCTION READY)

// import XLSX from "xlsx";
// import AdmZip from "adm-zip";
// import fs from "fs";
// import path from "path";
// import Product from "../models/Product.js";

// export const bulkUploadProducts = async (req, res) => {
//   try {
//     /* ================= FILE VALIDATION ================= */
//     if (!req.files?.excel || !req.files?.images) {
//       return res.status(400).json({
//         success: false,
//         message: "Excel and ZIP files are required",
//       });
//     }

//     /* ================= EXTRACT IMAGES ================= */
//     const uploadDir = path.join("uploads", "products");
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }

//     const zip = new AdmZip(req.files.images[0].buffer);
//     zip.extractAllTo(uploadDir, true);

//     /* ================= READ EXCEL (ROBUST LOGIC) ================= */
//     const workbook = XLSX.read(req.files.excel[0].buffer, {
//       type: "buffer",
//       cellDates: true,
//     });

//     let rows = [];
//     let usedSheetName = null;

//     // 🔥 Find FIRST sheet which actually has data
//     for (const sheetName of workbook.SheetNames) {
//       const tempRows = XLSX.utils.sheet_to_json(
//         workbook.Sheets[sheetName],
//         { defval: "", range: 0 }
//       );

//       if (tempRows.length > 0) {
//         rows = tempRows;
//         usedSheetName = sheetName;
//         break;
//       }
//     }

//     if (!rows.length) {
//       return res.status(400).json({
//         success: false,
//         message: "Excel sheet is empty or unreadable",
//       });
//     }

//     /* ================= NORMALIZE HEADERS ================= */
//     // Handles accidental spaces / casing issues safely
//     const normalizeRow = (row) => {
//       const normalized = {};
//       Object.keys(row).forEach((key) => {
//         const cleanKey = key
//           .replace(/\s+/g, "")
//           .replace(/_/g, "")
//           .toLowerCase();

//         normalized[cleanKey] = row[key];
//       });
//       return normalized;
//     };

//     const products = [];
//     const skipped = [];

//     /* ================= PROCESS ROWS ================= */
//     rows.forEach((rawRow, index) => {
//       const rowNo = index + 2; // header offset
//       const row = normalizeRow(rawRow);

//       const title = row.title;
//       const sku = row.sku;
//       const category = row.category;
//       const metalType = row.metaltype;
//       const metalPurity = row.metalpurity;

//       if (!title || !sku || !category || !metalType || !metalPurity) {
//         skipped.push({
//           row: rowNo,
//           sku: sku || null,
//           reason: "Missing required fields",
//         });
//         return;
//       }

//       /* ================= IMAGE MAPPING ================= */
//       let imagePathFinal = null;

//       if (row.image) {
//         const imagePath = path.join(uploadDir, row.image);

//         if (fs.existsSync(imagePath)) {
//           imagePathFinal = `/uploads/products/${row.image}`;
//         } else {
//           skipped.push({
//             row: rowNo,
//             sku,
//             reason: `Image not found (${row.image})`,
//           });
//         }
//       }

//       /* ================= BUILD PRODUCT OBJECT ================= */
//       products.push({
//         title,
//         description: row.description || "",
//         category,
//         categoryOther: row.categoryother || "",
//         sku,
//         stock: Number(row.stock || 0),

//         metalType,
//         metalPurity,
//         metalColor: row.metalcolor || "",

//         grossWeight: Number(row.grossweight || 0),
//         metalWeight: Number(row.metalweight || 0),

//         diamondSelected:
//           String(row.diamondselected).toUpperCase() === "TRUE",
//         diamondWeight: Number(row.diamondweight || 0),
//         diamondColor: row.diamondcolor || "",
//         diamondQuality: row.diamondquality || "",

//         otherStoneSelected:
//           String(row.otherstoneselected).toUpperCase() === "TRUE",

//         image: imagePathFinal,
//         hsnCode: row.hsncode || "7113",
//       });
//     });

//     if (!products.length) {
//       return res.status(400).json({
//         success: false,
//         message: "No valid products found",
//         skipped,
//       });
//     }

//     /* ================= DB INSERT ================= */
//     const inserted = await Product.insertMany(products, {
//       ordered: false, // skip duplicate SKU errors
//     });

//     /* ================= SUCCESS RESPONSE ================= */
//     return res.status(201).json({
//       success: true,
//       sheetUsed: usedSheetName,
//       insertedCount: inserted.length,
//       skippedCount: skipped.length,
//       skipped,
//     });

//   } catch (error) {
//     console.error("Bulk upload failed:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Bulk upload failed",
//       error: error.message,
//     });
//   }
// };


// import XLSX from "xlsx";
// import AdmZip from "adm-zip";
// import fs from "fs";
// import path from "path";
// import Product from "../models/Product.js";

// export const bulkUploadProducts = async (req, res) => {
//   try {
//     /* ================= FILE VALIDATION ================= */
//     if (!req.files?.excel || !req.files?.images) {
//       return res.status(400).json({
//         success: false,
//         message: "Excel and ZIP files are required",
//       });
//     }

//     /* ================= EXTRACT IMAGES ================= */
//     const uploadDir = path.join("uploads", "products");
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }

//     const zip = new AdmZip(req.files.images[0].buffer);
//     zip.extractAllTo(uploadDir, true);

//     /* ================= READ EXCEL (ROBUST) ================= */
//     const workbook = XLSX.read(req.files.excel[0].buffer, {
//       type: "buffer",
//       cellDates: true,
//     });

//     let rows = [];
//     let usedSheetName = null;

//     for (const sheetName of workbook.SheetNames) {
//       const temp = XLSX.utils.sheet_to_json(
//         workbook.Sheets[sheetName],
//         { defval: "", range: 0 }
//       );

//       if (temp.length > 0) {
//         rows = temp;
//         usedSheetName = sheetName;
//         break;
//       }
//     }

//     if (!rows.length) {
//       return res.status(400).json({
//         success: false,
//         message: "Excel sheet is empty or unreadable",
//       });
//     }

//     /* ================= NORMALIZE HEADERS ================= */
//     const normalizeRow = (row) => {
//       const out = {};
//       Object.keys(row).forEach((key) => {
//         const clean = key
//           .replace(/\s+/g, "")
//           .replace(/_/g, "")
//           .toLowerCase();
//         out[clean] = row[key];
//       });
//       return out;
//     };

//     const products = [];
//     const skipped = [];

//     /* ================= PROCESS ROWS ================= */
//     rows.forEach((rawRow, index) => {
//       const rowNo = index + 2;
//       const row = normalizeRow(rawRow);

//       const title = row.title;
//       const sku = row.sku;
//       const category = row.category;
//       const metalType = row.metaltype;
//       const metalPurity = row.metalpurity;

//       if (!title || !sku || !category || !metalType || !metalPurity) {
//         skipped.push({
//           row: rowNo,
//           sku: sku || null,
//           reason: "Missing required fields",
//         });
//         return;
//       }

//       /* ================= IMAGE MAPPING ================= */
//       let imagePathFinal = null;
//       if (row.image) {
//         const imagePath = path.join(uploadDir, row.image);
//         if (fs.existsSync(imagePath)) {
//           imagePathFinal = `/uploads/products/${row.image}`;
//         } else {
//           skipped.push({
//             row: rowNo,
//             sku,
//             reason: `Image not found (${row.image})`,
//           });
//         }
//       }

//       products.push({
//         title,
//         description: row.description || "",
//         category,
//         categoryOther: row.categoryother || "",
//         sku,
//         stock: Number(row.stock || 0),

//         metalType,
//         metalPurity,
//         metalColor: row.metalcolor || "",

//         grossWeight: Number(row.grossweight || 0),
//         metalWeight: Number(row.metalweight || 0),

//         diamondSelected:
//           String(row.diamondselected).toUpperCase() === "TRUE",
//         diamondWeight: Number(row.diamondweight || 0),
//         diamondColor: row.diamondcolor || "",
//         diamondQuality: row.diamondquality || "",

//         otherStoneSelected:
//           String(row.otherstoneselected).toUpperCase() === "TRUE",

//         image: imagePathFinal,
//         hsnCode: row.hsncode || "7113",
//       });
//     });

//     if (!products.length) {
//       return res.status(400).json({
//         success: false,
//         message: "No valid products found",
//         skipped,
//       });
//     }

//     /* ================= DB INSERT (DUPLICATE SAFE) ================= */
//     let inserted = [];
//     let duplicateSkus = [];

//     try {
//       inserted = await Product.insertMany(products, { ordered: false });
//     } catch (err) {
//       if (err.writeErrors) {
//         err.writeErrors.forEach((e) => {
//           if (e.err?.op?.sku) {
//             duplicateSkus.push(e.err.op.sku);
//           }
//         });
//         inserted = err.insertedDocs || [];
//       } else {
//         throw err;
//       }
//     }

//     /* ================= FINAL RESPONSE ================= */
//     return res.status(201).json({
//       success: true,
//       sheetUsed: usedSheetName,
//       insertedCount: inserted.length,
//       skippedCount: skipped.length + duplicateSkus.length,
//       skipped: [
//         ...skipped,
//         ...duplicateSkus.map((sku) => ({
//           sku,
//           reason: "Duplicate SKU",
//         })),
//       ],
//     });

//   } catch (error) {
//     console.error("Bulk upload failed:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Bulk upload failed",
//       error: error.message,
//     });
//   }
// };


// import XLSX from "xlsx";
// import AdmZip from "adm-zip";
// import fs from "fs";
// import path from "path";
// import Product from "../models/Product.js";

// /* ================= HELPERS ================= */

// // normalize excel headers safely
// const normalizeKey = (key = "") =>
//   key.replace(/\s+/g, "").replace(/_/g, "").toLowerCase();

// // ✅ BULLETPROOF BOOLEAN PARSER
// const parseBool = (val) => {
//   if (val === true) return true;
//   if (val === false) return false;

//   if (typeof val === "number") return val === 1;

//   if (typeof val === "string") {
//     const v = val.trim().toUpperCase();
//     if (["TRUE", "YES", "Y", "1"].includes(v)) return true;
//     if (["FALSE", "NO", "N", "0", ""].includes(v)) return false;
//   }

//   return false; // 🔒 DEFAULT FALSE
// };

// // parse number safely
// const parseNumber = (val) => {
//   const num = Number(val);
//   return isNaN(num) ? 0 : num;
// };

// export const bulkUploadProducts = async (req, res) => {
//   const report = { inserted: [], updated: [], skipped: [] };

//   try {
//     console.log("🔥 NEW CONTROLLER RUNNING 🔥");

//     /* ================= FILE VALIDATION ================= */
//     if (!req.files?.excel || !req.files?.images) {
//       return res.status(400).json({
//         success: false,
//         message: "Excel and Images ZIP are required",
//       });
//     }

//     /* ================= IMAGE EXTRACTION ================= */
//     const uploadDir = path.join("uploads", "products");
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }

//     const zip = new AdmZip(req.files.images[0].buffer);
//     zip.extractAllTo(uploadDir, true);

//     /* ================= READ EXCEL ================= */
//     const workbook = XLSX.read(req.files.excel[0].buffer, {
//       type: "buffer",
//       cellDates: true,
//     });

//     let rows = [];
//     let sheetUsed = null;

//     for (const sheetName of workbook.SheetNames) {
//       const temp = XLSX.utils.sheet_to_json(
//         workbook.Sheets[sheetName],
//         { defval: "" }
//       );
//       if (temp.length) {
//         rows = temp;
//         sheetUsed = sheetName;
//         break;
//       }
//     }

//     if (!rows.length) {
//       return res.status(400).json({
//         success: false,
//         message: "Excel sheet is empty",
//       });
//     }

//     /* ================= PROCESS ROWS ================= */
//     for (let i = 0; i < rows.length; i++) {
//       const rawRow = rows[i];
//       const rowNo = i + 2;

//       // normalize row keys
//       const row = {};
//       Object.keys(rawRow).forEach((k) => {
//         row[normalizeKey(k)] = rawRow[k];
//       });

//       const sku = String(row.sku || "").trim();
//       const title = String(row.title || "").trim();
//       const category = String(row.category || "").trim();
//       const metalType = String(row.metaltype || "").trim();
//       const metalPurity = String(row.metalpurity || "").trim();

//       if (!sku || !title || !category || !metalType || !metalPurity) {
//         report.skipped.push({
//           row: rowNo,
//           sku: sku || null,
//           reason: "Missing required fields",
//         });
//         continue;
//       }

//       /* ================= DIAMOND LOGIC (FINAL FIX) ================= */
//       let diamondSelected = parseBool(row.diamondselected);
//       let diamondWeight = 0;
//       let diamondColor = null;
//       let diamondQuality = null;

//       if (diamondSelected) {
//         diamondWeight = parseNumber(row.diamondweight);
//         diamondColor = row.diamondcolor?.trim() || null;
//         diamondQuality = row.diamondquality?.trim() || null;

//         // 🔥 AUTO-FIX: incomplete diamond → make it FALSE
//         if (!diamondColor || !diamondQuality) {
//           diamondSelected = false;
//           diamondWeight = 0;
//           diamondColor = null;
//           diamondQuality = null;
//         }
//       }

//       /* ================= IMAGE HANDLING ================= */
//       let imagePath = null;
//       if (row.image) {
//         const imgFile = String(row.image).trim();
//         const fullPath = path.join(uploadDir, imgFile);
//         if (fs.existsSync(fullPath)) {
//           imagePath = `/uploads/products/${imgFile}`;
//         }
//       }

//       /* ================= PAYLOAD ================= */
//       const payload = {
//         title,
//         description: row.description || "",
//         category,
//         categoryOther: row.categoryother || "",
//         sku,
//         stock: parseNumber(row.stock),

//         metalType,
//         metalPurity,
//         metalColor: row.metalcolor || "",

//         grossWeight: parseNumber(row.grossweight),
//         metalWeight: parseNumber(row.metalweight),

//         diamondSelected,
//         diamondWeight,
//         diamondColor,
//         diamondQuality,

//         otherStoneSelected: parseBool(row.otherstoneselected),

//         image: imagePath,
//         hsnCode: row.hsncode || "7113",
//       };

//       /* ================= UPSERT ================= */
//       const existing = await Product.findOne({ sku });

//       if (existing) {
//         await Product.updateOne({ sku }, { $set: payload });
//         report.updated.push({ row: rowNo, sku });
//       } else {
//         await Product.create(payload);
//         report.inserted.push({ row: rowNo, sku });
//       }
//     }

//     return res.status(201).json({
//       success: true,
//       sheetUsed,
//       insertedCount: report.inserted.length,
//       updatedCount: report.updated.length,
//       skippedCount: report.skipped.length,
//       report,
//     });

//   } catch (error) {
//     console.error("Bulk upload error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Bulk upload failed",
//       error: error.message,
//     });
//   }
// };


import XLSX from "xlsx";
import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import Product from "../models/Product.js";

/* ================= HELPERS ================= */

// normalize excel headers
const normalizeKey = (key = "") =>
  key.replace(/\s+/g, "").replace(/_/g, "").toLowerCase();

// bulletproof boolean parser
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

// safe number parser
const parseNumber = (val) => {
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

export const bulkUploadProducts = async (req, res) => {
  const report = { inserted: [], updated: [], skipped: [] };

  try {
    console.log("🔥 BULK UPLOAD CONTROLLER ACTIVE 🔥");

    /* ================= FILE VALIDATION ================= */
    if (!req.files?.excel || !req.files?.images) {
      return res.status(400).json({
        success: false,
        message: "Excel and Images ZIP are required",
      });
    }

    /* ================= IMAGE EXTRACTION ================= */
    // 🔥 SAME folder as single upload
    const uploadDir = path.join("uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const zip = new AdmZip(req.files.images[0].buffer);
    zip.extractAllTo(uploadDir, true); // overwrite allowed

    /* ================= READ EXCEL ================= */
    const workbook = XLSX.read(req.files.excel[0].buffer, {
      type: "buffer",
      cellDates: true,
    });

    let rows = [];
    let sheetUsed = null;

    for (const sheetName of workbook.SheetNames) {
      const temp = XLSX.utils.sheet_to_json(
        workbook.Sheets[sheetName],
        { defval: "" }
      );
      if (temp.length) {
        rows = temp;
        sheetUsed = sheetName;
        break;
      }
    }

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: "Excel sheet is empty",
      });
    }

    /* ================= PROCESS ROWS ================= */
    for (let i = 0; i < rows.length; i++) {
      const rawRow = rows[i];
      const rowNo = i + 2;

      // normalize keys
      const row = {};
      Object.keys(rawRow).forEach((k) => {
        row[normalizeKey(k)] = rawRow[k];
      });

      const sku = String(row.sku || "").trim();
      const title = String(row.title || "").trim();
      const category = String(row.category || "").trim();
      const metalType = String(row.metaltype || "").trim();
      const metalPurity = String(row.metalpurity || "").trim();

      if (!sku || !title || !category || !metalType || !metalPurity) {
        report.skipped.push({
          row: rowNo,
          sku: sku || null,
          reason: "Missing required fields",
        });
        continue;
      }

      /* ================= DIAMOND LOGIC ================= */
      let diamondSelected = parseBool(row.diamondselected);
      let diamondWeight = 0;
      let diamondColor = null;
      let diamondQuality = null;

      if (diamondSelected) {
        diamondWeight = parseNumber(row.diamondweight);
        diamondColor = row.diamondcolor?.toString().trim() || null;
        diamondQuality = row.diamondquality?.toString().trim() || null;

        // 🔥 AUTO FIX — incomplete diamond becomes FALSE
        if (!diamondColor || !diamondQuality) {
          diamondSelected = false;
          diamondWeight = 0;
          diamondColor = null;
          diamondQuality = null;
        }
      }

      /* ================= IMAGE HANDLING ================= */
      let imagePath = null;
      if (row.image) {
        const imgFile = String(row.image).trim();
        const fullPath = path.join(uploadDir, imgFile);

        if (fs.existsSync(fullPath)) {
          // 🔥 SAME format as single upload
          imagePath = `uploads/${imgFile}`;
        }
      }

      /* ================= PAYLOAD ================= */
      const payload = {
        title,
        description: row.description || "",
        category,
        categoryOther: row.categoryother || "",
        sku,
        stock: parseNumber(row.stock),

        metalType,
        metalPurity,
        metalColor: row.metalcolor || "",

        grossWeight: parseNumber(row.grossweight),
        metalWeight: parseNumber(row.metalweight),

        diamondSelected,
        diamondWeight,
        diamondColor,
        diamondQuality,

        otherStoneSelected: parseBool(row.otherstoneselected),

        image: imagePath,
        hsnCode: row.hsncode || "7113",
      };

      /* ================= UPSERT ================= */
      const existing = await Product.findOne({ sku });

      if (existing) {
        await Product.updateOne({ sku }, { $set: payload });
        report.updated.push({ row: rowNo, sku });
      } else {
        await Product.create(payload);
        report.inserted.push({ row: rowNo, sku });
      }
    }

    return res.status(201).json({
      success: true,
      sheetUsed,
      insertedCount: report.inserted.length,
      updatedCount: report.updated.length,
      skippedCount: report.skipped.length,
      report,
    });

  } catch (error) {
    console.error("Bulk upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Bulk upload failed",
      error: error.message,
    });
  }
};
