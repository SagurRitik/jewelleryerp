

import DiamondRateMaster from "../../models/DiamondRateMaster.js";
import xlsx from "xlsx";

/* ================= CREATE ================= */
export const createDiamondRate = async (req, res) => {
  try {
    const rate = await DiamondRateMaster.create(req.body);
    res.json({ success: true, rate });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

/* ================= GET ALL ================= */
export const getDiamondRates = async (req, res) => {
  try {
    const rates = await DiamondRateMaster.find()
      .sort({ shape: 1, weightFrom: 1 })
      .lean();

    res.json({ success: true, rates });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= UPDATE ================= */
export const updateDiamondRate = async (req, res) => {
  try {
    const rate = await DiamondRateMaster.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!rate) {
      return res.status(404).json({ success: false, message: "Rate not found" });
    }

    res.json({ success: true, rate });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

/* ================= DEACTIVATE (SOFT DELETE) ================= */
export const deactivateDiamondRate = async (req, res) => {
  try {
    const rate = await DiamondRateMaster.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!rate) {
      return res.status(404).json({ success: false, message: "Rate not found" });
    }

    res.json({ success: true, rate });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
/* ================= DELETE ================= */
export const deleteDiamondRate = async (req, res) => {
  try {
    const rate = await DiamondRateMaster.findByIdAndDelete(req.params.id);

    if (!rate) {
      return res.status(404).json({
        success: false,
        message: "Rate not found",
      });
    }

    res.json({ success: true, message: "Rate deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

/* ================= EXPORT ================= */
export const exportDiamondRates = async (req, res) => {
  try {
    const rates = await DiamondRateMaster.find().sort({ shape: 1, weightFrom: 1 }).lean();

    const COLORS_INDIVIDUAL = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    const CLARITIES_INDIVIDUAL = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3"];

    const formattedRates = rates.map(r => {
      // Reconstruct Color string
      let colorStr = "";
      if (r.colorFromIndex !== undefined && r.colorToIndex !== undefined) {
        const fromColor = COLORS_INDIVIDUAL[r.colorFromIndex] || "?";
        const toColor = COLORS_INDIVIDUAL[r.colorToIndex] || "?";
        colorStr = fromColor === toColor ? fromColor : `${fromColor}-${toColor}`;
      }

      // Reconstruct Clarity string
      let clarityStr = "";
      if (r.clarityFromIndex !== undefined && r.clarityToIndex !== undefined) {
        const fromClarity = CLARITIES_INDIVIDUAL[r.clarityFromIndex] || "?";
        const toClarity = CLARITIES_INDIVIDUAL[r.clarityToIndex] || "?";
        clarityStr = fromClarity === toClarity ? fromClarity : `${fromClarity}-${toClarity}`;
      }

      return {
        "Shape": r.shape,
        "Color": colorStr,
        "Clarity": clarityStr,
        "Weight From": r.weightFrom,
        "Weight To": r.weightTo,
        "Rate": r.rate,
        "Rate Type": r.rateType,
        "Priority": r.priority || 1,
        "Active": r.active ? "Yes" : "No",
        "Notes": r.notes || "",
      };
    });

    const worksheet = xlsx.utils.json_to_sheet(formattedRates);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Diamond Rates");

    const buffer = xlsx.write(workbook, { bookType: "xlsx", type: "buffer" });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=diamond_rates.xlsx"
    );
    res.type("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= IMPORT ================= */
export const importDiamondRates = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Excel file is required" });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: "Excel sheet is empty" });
    }

    const COLORS_INDIVIDUAL = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    const CLARITIES_INDIVIDUAL = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3"];

    const parseColorRange = (val) => {
      if (!val) return [-1, -1];
      const parts = String(val).toUpperCase().trim().split("-");
      if (parts.length === 1) {
        const idx = COLORS_INDIVIDUAL.indexOf(parts[0]);
        return [idx, idx];
      }
      const idxs = parts.map((p) => COLORS_INDIVIDUAL.indexOf(p));
      return [Math.min(...idxs), Math.max(...idxs)];
    };

    const parseClarityRange = (val) => {
      if (!val) return [-1, -1];
      let norm = String(val).toUpperCase().trim();
      if (norm === "VVS-VS") norm = "VVS1-VS2";
      if (norm === "SI-I") norm = "SI1-I2";
      
      const parts = norm.split("-");
      if (parts.length === 1) {
        const idx = CLARITIES_INDIVIDUAL.indexOf(parts[0]);
        return [idx, idx];
      }
      const idxs = parts.map((p) => CLARITIES_INDIVIDUAL.indexOf(p));
      return [Math.min(...idxs), Math.max(...idxs)];
    };

    const ratesToCreate = [];
    let skippedCount = 0;

    for (const row of rows) {
      const normalizedRow = {};
      Object.keys(row).forEach(key => {
        const normalizedKey = key.toString().replace(/\s+/g, "").replace(/_/g, "").toLowerCase();
        normalizedRow[normalizedKey] = row[key];
      });

      const shape = String(normalizedRow.shape || "").trim();
      const colorRaw = String(normalizedRow.color || "").trim();
      const clarityRaw = String(normalizedRow.clarity || "").trim();
      
      const weightFrom = Number(normalizedRow.weightfrom);
      const weightTo = Number(normalizedRow.weightto);
      const rate = Number(normalizedRow.rate);
      
      let rateType = String(normalizedRow.ratetype || "").trim().toUpperCase();
      if (!["PER_CT", "PER_PC"].includes(rateType)) {
        rateType = "PER_CT";
      }

      if (!shape || !colorRaw || !clarityRaw || isNaN(weightFrom) || isNaN(weightTo) || isNaN(rate) || rate <= 0) {
        skippedCount++;
        continue;
      }

      const [colorFromIndex, colorToIndex] = parseColorRange(colorRaw);
      const [clarityFromIndex, clarityToIndex] = parseClarityRange(clarityRaw);

      if (colorFromIndex === -1 || colorToIndex === -1 || clarityFromIndex === -1 || clarityToIndex === -1) {
        skippedCount++;
        continue;
      }

      let active = true;
      if (normalizedRow.active !== undefined) {
        const actStr = String(normalizedRow.active).trim().toLowerCase();
        if (actStr === "no" || actStr === "false" || actStr === "inactive") {
          active = false;
        }
      }

      const priority = isNaN(Number(normalizedRow.priority)) ? 1 : Number(normalizedRow.priority);
      const notes = String(normalizedRow.notes || "").trim();

      ratesToCreate.push({
        shape,
        colorFromIndex,
        colorToIndex,
        clarityFromIndex,
        clarityToIndex,
        weightFrom,
        weightTo,
        rate,
        rateType,
        active,
        priority,
        notes,
      });
    }

    if (ratesToCreate.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid rate records found in Excel. Check column headers and values."
      });
    }

    await DiamondRateMaster.insertMany(ratesToCreate);

    return res.status(200).json({
      success: true,
      message: `Successfully imported ${ratesToCreate.length} diamond rates!`,
      importedCount: ratesToCreate.length,
      skippedCount
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= SLAB RATE LOOKUP ================= */
export const lookupDiamondRateSlab = async (req, res) => {
  try {
    const { shape, weight, color, clarity } = req.query;

    const w = Number(weight || 0);
    if (!w || w <= 0) {
      return res.json({ success: true, found: false, message: "Valid weight required" });
    }

    const COLORS_INDIVIDUAL = [
      "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
      "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
    ];
    const CLARITIES_INDIVIDUAL = [
      "FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3"
    ];

    const parseColorRange = (val) => {
      if (!val) return [-1, -1];
      const cleanVal = String(val).toUpperCase().replace(/\s+/g, "");
      const parts = cleanVal.split("-");
      if (parts.length === 1) {
        const idx = COLORS_INDIVIDUAL.indexOf(parts[0]);
        return [idx, idx];
      }
      const idxs = parts.map((p) => COLORS_INDIVIDUAL.indexOf(p)).filter((i) => i !== -1);
      if (idxs.length === 0) return [-1, -1];
      return [Math.min(...idxs), Math.max(...idxs)];
    };

    const parseClarityRange = (val) => {
      if (!val) return [-1, -1];
      let norm = String(val).toUpperCase().replace(/\s+/g, "");
      if (norm === "VVS-VS") norm = "VVS1-VS2";
      if (norm === "SI-I") norm = "SI1-I2";

      const parts = norm.split("-");
      if (parts.length === 1) {
        const idx = CLARITIES_INDIVIDUAL.indexOf(parts[0]);
        return [idx, idx];
      }
      const idxs = parts.map((p) => CLARITIES_INDIVIDUAL.indexOf(p)).filter((i) => i !== -1);
      if (idxs.length === 0) return [-1, -1];
      return [Math.min(...idxs), Math.max(...idxs)];
    };

    const cleanShape = String(shape || "").trim();
    const shapeRegex = cleanShape ? new RegExp(`^${cleanShape}$`, "i") : /.*/;

    const [colorFrom, colorTo] = parseColorRange(color);
    const [clarityFrom, clarityTo] = parseClarityRange(clarity);

    // 1. Precise Match: Shape + Weight Slab + Overlapping Color + Overlapping Clarity
    if (colorFrom !== -1 && clarityFrom !== -1) {
      const match = await DiamondRateMaster.findOne({
        active: true,
        shape: shapeRegex,
        weightFrom: { $lte: w },
        weightTo: { $gte: w },
        colorFromIndex: { $lte: colorTo },
        colorToIndex: { $gte: colorFrom },
        clarityFromIndex: { $lte: clarityTo },
        clarityToIndex: { $gte: clarityFrom },
      })
        .sort({ priority: -1, rate: 1 })
        .lean();

      if (match) {
        return res.json({
          success: true,
          found: true,
          rate: match.rate,
          rateType: match.rateType,
          matchLevel: "EXACT",
          slab: {
            id: match._id,
            shape: match.shape,
            weightFrom: match.weightFrom,
            weightTo: match.weightTo,
            rate: match.rate,
            rateType: match.rateType,
            colorStr: `${COLORS_INDIVIDUAL[match.colorFromIndex] || ""}-${COLORS_INDIVIDUAL[match.colorToIndex] || ""}`,
            clarityStr: `${CLARITIES_INDIVIDUAL[match.clarityFromIndex] || ""}-${CLARITIES_INDIVIDUAL[match.clarityToIndex] || ""}`,
          },
        });
      }
    }

    // 2. Partial Match: Color or Clarity matched
    if (colorFrom !== -1 || clarityFrom !== -1) {
      const partialQuery = {
        active: true,
        shape: shapeRegex,
        weightFrom: { $lte: w },
        weightTo: { $gte: w },
      };
      if (colorFrom !== -1) {
        partialQuery.colorFromIndex = { $lte: colorTo };
        partialQuery.colorToIndex = { $gte: colorFrom };
      }
      if (clarityFrom !== -1) {
        partialQuery.clarityFromIndex = { $lte: clarityTo };
        partialQuery.clarityToIndex = { $gte: clarityFrom };
      }

      const partialMatch = await DiamondRateMaster.findOne(partialQuery)
        .sort({ priority: -1, rate: 1 })
        .lean();

      if (partialMatch) {
        return res.json({
          success: true,
          found: true,
          rate: partialMatch.rate,
          rateType: partialMatch.rateType,
          matchLevel: "PARTIAL",
          slab: {
            id: partialMatch._id,
            shape: partialMatch.shape,
            weightFrom: partialMatch.weightFrom,
            weightTo: partialMatch.weightTo,
            rate: partialMatch.rate,
            rateType: partialMatch.rateType,
            colorStr: `${COLORS_INDIVIDUAL[partialMatch.colorFromIndex] || ""}-${COLORS_INDIVIDUAL[partialMatch.colorToIndex] || ""}`,
            clarityStr: `${CLARITIES_INDIVIDUAL[partialMatch.clarityFromIndex] || ""}-${CLARITIES_INDIVIDUAL[partialMatch.clarityToIndex] || ""}`,
          },
        });
      }
    }

    // 3. Broad Fallback: Shape + Weight Slab only
    const broad = await DiamondRateMaster.findOne({
      active: true,
      shape: shapeRegex,
      weightFrom: { $lte: w },
      weightTo: { $gte: w },
    })
      .sort({ priority: -1, rate: 1 })
      .lean();

    if (broad) {
      return res.json({
        success: true,
        found: true,
        rate: broad.rate,
        rateType: broad.rateType,
        matchLevel: "BROAD",
        slab: {
          id: broad._id,
          shape: broad.shape,
          weightFrom: broad.weightFrom,
          weightTo: broad.weightTo,
          rate: broad.rate,
          rateType: broad.rateType,
          colorStr: `${COLORS_INDIVIDUAL[broad.colorFromIndex] || ""}-${COLORS_INDIVIDUAL[broad.colorToIndex] || ""}`,
          clarityStr: `${CLARITIES_INDIVIDUAL[broad.clarityFromIndex] || ""}-${CLARITIES_INDIVIDUAL[broad.clarityToIndex] || ""}`,
        },
      });
    }

    return res.json({
      success: true,
      found: false,
      message: "No diamond rate slab matched specifications",
    });
  } catch (error) {
    console.error("lookupDiamondRateSlab error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};