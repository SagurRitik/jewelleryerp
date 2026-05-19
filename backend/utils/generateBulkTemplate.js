/**
 * Run this script to generate the Excel bulk upload template:
 *   node utils/generateBulkTemplate.js
 */

import XLSX from "xlsx";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── COLUMN DEFINITIONS ───────────────────────────────────────────────────────
// Main product columns
const MAIN_HEADERS = [
  "sku",
  "title",
  "description",
  "jewelleryCategory",
  "productType",
  "metalType",
  "metalPurity",
  "metalColor",
  "netWeight",
  "grossWeight",
  "fineGold",
  "stock",
  "hsnCode",
  "huid",
  "targetAudience",
  "image",
];

// Up to 6 stone/diamond components per product
// Each component has: type, role, shape, color_clarity, cut, count, weight, size
const MAX_COMPONENTS = 6;
const COMP_FIELDS = [
  { key: "type",          label: "Type",            example: "Diamond" },
  { key: "role",          label: "Role",            example: "CENTER" },
  { key: "shape",         label: "Shape",           example: "Round" },
  { key: "color_clarity", label: "Color/Clarity",   example: "D-F / VVS-VK" },
  { key: "cut",           label: "Cut",             example: "EX" },
  { key: "count",         label: "Qty (pcs)",       example: "6" },
  { key: "weight",        label: "Weight (ct/gm)",  example: "0.50" },
  { key: "size",          label: "Size",            example: "0.5pt per pcs" },
];

// Build all component column headers: comp1_type, comp1_shape ... comp6_size
const compHeaders = [];
for (let i = 1; i <= MAX_COMPONENTS; i++) {
  COMP_FIELDS.forEach(f => compHeaders.push(`comp${i}_${f.key}`));
}

const ALL_HEADERS = [...MAIN_HEADERS, ...compHeaders];

// ─── SAMPLE DATA ─────────────────────────────────────────────────────────────
const SAMPLE_ROWS = [
  // Row 1: Simple ring with 1 center diamond + 6 side diamonds
  {
    sku: "RNG-001",
    title: "Twisted Solitaire Ring",
    description: "Beautiful twisted solitaire diamond ring",
    jewelleryCategory: "Ring",
    productType: "Engagement",
    metalType: "Gold",
    metalPurity: "18KT",
    metalColor: "Yellow",
    netWeight: 3.5,
    grossWeight: 4.2,
    fineGold: 3.15,
    stock: 1,
    hsnCode: "7113",
    huid: "HUD001",
    targetAudience: "WOMEN",
    image: "ring001.jpg",
    // Component 1 – Center Diamond
    comp1_type: "Diamond",
    comp1_role: "CENTER",
    comp1_shape: "Round",
    comp1_color_clarity: "D-F / VVS-VK",
    comp1_cut: "EX",
    comp1_count: 1,
    comp1_weight: 0.50,
    comp1_size: "0.5ct solitaire",
    // Component 2 – Side Diamonds
    comp2_type: "Diamond",
    comp2_role: "SIDE",
    comp2_shape: "Round",
    comp2_color_clarity: "G-H / VS-SI",
    comp2_cut: "VG",
    comp2_count: 6,
    comp2_weight: 0.18,
    comp2_size: "0.5pt per pcs",
    // Component 3 – Micro accent diamonds
    comp3_type: "Diamond",
    comp3_role: "MICRO",
    comp3_shape: "Round",
    comp3_color_clarity: "G-H / SI",
    comp3_cut: "VG",
    comp3_count: 10,
    comp3_weight: 0.10,
    comp3_size: "1pt per pcs",
  },
  // Row 2: Pendant with Diamond + Ruby
  {
    sku: "PEN-002",
    title: "Ruby Diamond Pendant",
    description: "Elegant pendant with ruby center and diamond halo",
    jewelleryCategory: "Pendant",
    productType: "Luxury",
    metalType: "Gold",
    metalPurity: "18KT",
    metalColor: "White",
    netWeight: 2.8,
    grossWeight: 3.4,
    fineGold: 2.52,
    stock: 2,
    hsnCode: "7113",
    huid: "",
    targetAudience: "WOMEN",
    image: "pendant002.jpg",
    // Component 1 – Center Ruby
    comp1_type: "Ruby",
    comp1_role: "CENTER",
    comp1_shape: "Oval",
    comp1_color_clarity: "Red / Eye Clean",
    comp1_cut: "EX",
    comp1_count: 1,
    comp1_weight: 1.20,
    comp1_size: "7x5mm",
    // Component 2 – Halo Diamonds
    comp2_type: "Diamond",
    comp2_role: "SIDE",
    comp2_shape: "Round",
    comp2_color_clarity: "D-F / VVS-VK",
    comp2_cut: "EX",
    comp2_count: 18,
    comp2_weight: 0.36,
    comp2_size: "1.5pt per pcs",
  },
  // Row 3: Simple Gold Bangle (no stones)
  {
    sku: "BNG-003",
    title: "Plain Gold Bangle",
    description: "Classic plain gold bangle",
    jewelleryCategory: "Bangle",
    productType: "Casual",
    metalType: "Gold",
    metalPurity: "22KT",
    metalColor: "Yellow",
    netWeight: 15.0,
    grossWeight: 15.5,
    fineGold: 13.75,
    stock: 5,
    hsnCode: "7113",
    huid: "HUD003",
    targetAudience: "WOMEN",
    image: "bangle003.jpg",
    // No components
  },
];

// Convert sample rows to flat Excel rows
function buildFlatRow(obj) {
  const row = {};
  ALL_HEADERS.forEach(h => {
    row[h] = obj[h] ?? "";
  });
  return row;
}

// ─── BUILD WORKBOOK ───────────────────────────────────────────────────────────
const wb = XLSX.utils.book_new();

// --- Sheet 1: Template (products data) ---
const dataRows = SAMPLE_ROWS.map(buildFlatRow);
const ws = XLSX.utils.json_to_sheet(dataRows, { header: ALL_HEADERS });

// Column widths
const colWidths = ALL_HEADERS.map(h => ({
  wch: h.startsWith("comp") ? 16 : Math.max(h.length + 2, 14),
}));
ws["!cols"] = colWidths;

XLSX.utils.book_append_sheet(wb, ws, "Products");

// --- Sheet 2: Field Guide ---
const guideData = [
  { Column: "sku",              Required: "YES", Example: "RNG-001",         Notes: "Unique product code" },
  { Column: "title",            Required: "YES", Example: "Solitaire Ring",  Notes: "Product name" },
  { Column: "jewelleryCategory",Required: "YES", Example: "Ring",            Notes: "Ring / Necklace / Earring / Bracelet / Pendant / Bangle" },
  { Column: "metalType",        Required: "YES", Example: "Gold",            Notes: "Gold / Silver / Platinum" },
  { Column: "metalPurity",      Required: "YES", Example: "18KT",            Notes: "18KT / 22KT / 925 / 950" },
  { Column: "netWeight",        Required: "YES", Example: "3.5",             Notes: "Metal weight in grams" },
  { Column: "grossWeight",      Required: "YES", Example: "4.2",             Notes: "Total product weight in grams" },
  { Column: "description",      Required: "NO",  Example: "Beautiful ring",  Notes: "Optional description" },
  { Column: "productType",      Required: "NO",  Example: "Engagement",      Notes: "Engagement / Wedding / Casual / Luxury" },
  { Column: "metalColor",       Required: "NO",  Example: "Yellow",          Notes: "Yellow / White / Rose" },
  { Column: "fineGold",         Required: "NO",  Example: "3.15",            Notes: "Fine gold content (grams)" },
  { Column: "stock",            Required: "NO",  Example: "2",               Notes: "Stock quantity (default 0)" },
  { Column: "hsnCode",          Required: "NO",  Example: "7113",            Notes: "Default: 7113" },
  { Column: "huid",             Required: "NO",  Example: "HUD001",          Notes: "Hallmark Unique ID" },
  { Column: "targetAudience",   Required: "NO",  Example: "WOMEN",           Notes: "MEN / WOMEN / UNISEX / KIDS" },
  { Column: "image",            Required: "NO",  Example: "ring001.jpg",     Notes: "Filename in ZIP (e.g. ring001.jpg)" },
  { Column: "---",              Required: "---", Example: "---",             Notes: "--- STONE/DIAMOND COMPONENTS (up to 6) ---" },
  { Column: "comp1_type",       Required: "NO",  Example: "Diamond",         Notes: "Diamond / Ruby / Emerald / Polki / Moissanite" },
  { Column: "comp1_role",       Required: "NO",  Example: "CENTER",          Notes: "CENTER / SIDE / MICRO / ACCENT" },
  { Column: "comp1_shape",      Required: "NO",  Example: "Round",           Notes: "Round / Princess / Oval / Cushion / Pear" },
  { Column: "comp1_color_clarity",Required:"NO", Example: "D-F / VVS-VK",   Notes: "Combined color/clarity string" },
  { Column: "comp1_cut",        Required: "NO",  Example: "EX",              Notes: "EX / VG / GD" },
  { Column: "comp1_count",      Required: "NO",  Example: "6",               Notes: "Number of pieces" },
  { Column: "comp1_weight",     Required: "NO",  Example: "0.50",            Notes: "Total weight in ct or gm" },
  { Column: "comp1_size",       Required: "NO",  Example: "0.5pt per pcs",   Notes: "Size description" },
  { Column: "comp2_...",        Required: "NO",  Example: "(same pattern)",   Notes: "Repeat comp2_ through comp6_ for more stones" },
];
const wsGuide = XLSX.utils.json_to_sheet(guideData);
wsGuide["!cols"] = [{ wch: 22 }, { wch: 10 }, { wch: 20 }, { wch: 50 }];
XLSX.utils.book_append_sheet(wb, wsGuide, "Field Guide");

// --- Sheet 3: Stone Types Reference ---
const stoneRef = [
  { StoneType: "Diamond",      Roles: "CENTER, SIDE, MICRO, ACCENT",  ShapeExamples: "Round, Princess, Oval, Cushion, Pear, Emerald cut" },
  { StoneType: "Ruby",         Roles: "CENTER, ACCENT",               ShapeExamples: "Oval, Round, Cushion" },
  { StoneType: "Emerald",      Roles: "CENTER, ACCENT",               ShapeExamples: "Oval, Round, Emerald cut" },
  { StoneType: "Polki",        Roles: "CENTER, SIDE",                 ShapeExamples: "Irregular, Round" },
  { StoneType: "Moissanite",   Roles: "CENTER, SIDE",                 ShapeExamples: "Round, Cushion, Oval" },
  { StoneType: "Sapphire",     Roles: "CENTER, ACCENT",               ShapeExamples: "Oval, Round, Cushion" },
  { StoneType: "Pearl",        Roles: "CENTER",                       ShapeExamples: "Round, Baroque" },
];
const wsRef = XLSX.utils.json_to_sheet(stoneRef);
wsRef["!cols"] = [{ wch: 16 }, { wch: 30 }, { wch: 45 }];
XLSX.utils.book_append_sheet(wb, wsRef, "Stone Reference");

// ─── SAVE ────────────────────────────────────────────────────────────────────
const outputPath = path.join(__dirname, "..", "assets", "bulk_upload_template.xlsx");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
XLSX.writeFile(wb, outputPath);
console.log("✅ Template generated:", outputPath);
