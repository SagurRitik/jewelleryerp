import XLSX from "xlsx";

/* ===== HELPERS ===== */
const normalizeKey = (key = "") =>
  key.replace(/\s+/g, "").replace(/_/g, "").toLowerCase();

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

const allowedMetalColors = ["yellow-gold", "white-gold", "rose-gold"];

export const validateExcelOnly = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Excel file required",
      });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });

    let rows = [];
    let sheetUsed = null;

    for (const name of workbook.SheetNames) {
      const temp = XLSX.utils.sheet_to_json(workbook.Sheets[name], {
        defval: "",
      });
      if (temp.length) {
        rows = temp;
        sheetUsed = name;
        break;
      }
    }

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: "Excel is empty",
      });
    }

    const report = {
      valid: [],
      warnings: [],
      errors: [],
    };

    rows.forEach((raw, index) => {
      const rowNo = index + 2;
      const row = {};

      Object.keys(raw).forEach((k) => {
        row[normalizeKey(k)] = raw[k];
      });

      const sku = String(row.sku || "").trim();
      const title = String(row.title || "").trim();
      const category = String(row.category || "").trim();
      const metalType = String(row.metaltype || "").trim();
      const metalPurity = String(row.metalpurity || "").trim();
      const metalColor = String(row.metalcolor || "").trim();

      /* ❌ HARD ERRORS */
      if (!sku || !title || !category || !metalType || !metalPurity) {
        report.errors.push({
          row: rowNo,
          sku: sku || null,
          reason: "Missing required fields",
        });
        return;
      }

      if (metalColor && !allowedMetalColors.includes(metalColor)) {
        report.errors.push({
          row: rowNo,
          sku,
          reason: `Invalid metalColor (${metalColor})`,
        });
        return;
      }

      /* ⚠️ WARNINGS */
      const diamondSelected = parseBool(row.diamondselected);
      if (diamondSelected) {
        if (!row.diamondcolor || !row.diamondquality) {
          report.warnings.push({
            row: rowNo,
            sku,
            reason:
              "Diamond selected but color/quality missing (will auto-fix)",
          });
        }
      }

      /* 🖼️ IMAGE CHECK (NAME ONLY) */
      if (!row.image) {
        report.warnings.push({
          row: rowNo,
          sku,
          reason: "Image name missing",
        });
      }

      report.valid.push({
        row: rowNo,
        sku,
      });
    });

    return res.json({
      success: true,
      sheetUsed,
      summary: {
        totalRows: rows.length,
        valid: report.valid.length,
        warnings: report.warnings.length,
        errors: report.errors.length,
      },
      report,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Validation failed",
      error: err.message,
    });
  }
};
