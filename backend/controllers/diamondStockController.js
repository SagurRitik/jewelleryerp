
import DiamondStock from "../models/DiamondStock.js";
import DiamondRateMaster from "../models/DiamondRateMaster.js";

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
  if (norm === "VVS-VS" || norm === "VVS" || norm === "VS") norm = "VVS1-VS2";
  if (norm === "SI-I" || norm === "SI" || norm === "I") norm = "SI1-I2";

  const parts = norm.split("-");
  if (parts.length === 1) {
    const idx = CLARITIES_INDIVIDUAL.indexOf(parts[0]);
    return [idx, idx];
  }
  const idxs = parts.map((p) => CLARITIES_INDIVIDUAL.indexOf(p)).filter((i) => i !== -1);
  if (idxs.length === 0) return [-1, -1];
  return [Math.min(...idxs), Math.max(...idxs)];
};

const matchDiamondSlab = (d, rateMasters) => {
  const w = Number(d.weight || 0);
  if (w <= 0 || !rateMasters || rateMasters.length === 0) return null;

  const shapeStr = String(d.shape || "").trim().toLowerCase();
  const [colorFrom, colorTo] = parseColorRange(d.color);
  const [clarityFrom, clarityTo] = parseClarityRange(d.clarity);

  // 1. Exact match (shape + weight slab + overlapping color + overlapping clarity)
  if (colorFrom !== -1 && clarityFrom !== -1) {
    const exact = rateMasters.find((r) => {
      if (shapeStr && r.shape && r.shape.toLowerCase() !== shapeStr) return false;
      if (w < r.weightFrom || w > r.weightTo) return false;
      const colorOverlap = r.colorFromIndex <= colorTo && r.colorToIndex >= colorFrom;
      const clarityOverlap = r.clarityFromIndex <= clarityTo && r.clarityToIndex >= clarityFrom;
      return colorOverlap && clarityOverlap;
    });
    if (exact) return exact;
  }

  // 2. Partial match (shape + weight slab + color or clarity)
  if (colorFrom !== -1 || clarityFrom !== -1) {
    const partial = rateMasters.find((r) => {
      if (shapeStr && r.shape && r.shape.toLowerCase() !== shapeStr) return false;
      if (w < r.weightFrom || w > r.weightTo) return false;
      if (colorFrom !== -1) {
        if (!(r.colorFromIndex <= colorTo && r.colorToIndex >= colorFrom)) return false;
      }
      if (clarityFrom !== -1) {
        if (!(r.clarityFromIndex <= clarityTo && r.clarityToIndex >= clarityFrom)) return false;
      }
      return true;
    });
    if (partial) return partial;
  }

  // 3. Broad fallback (shape + weight slab only)
  const broad = rateMasters.find((r) => {
    if (shapeStr && r.shape && r.shape.toLowerCase() !== shapeStr) return false;
    return w >= r.weightFrom && w <= r.weightTo;
  });
  return broad || null;
};

const sanitizeDiamondData = (data = {}) => {
  const weight = Number(data.weight || 0);
  let costPrice = Number(data.costPrice || 0);
  let costRate = Number(data.costRate || 0);
  let sellingPrice = Number(data.sellingPrice || 0);
  let sellingRate = Number(data.sellingRate || 0);

  if (weight > 0) {
    if (sellingRate > 0 && (!sellingPrice || sellingPrice === 0)) {
      sellingPrice = Math.round(sellingRate * weight);
    } else if (sellingPrice > 0 && (!sellingRate || sellingRate === 0)) {
      sellingRate = Math.round((sellingPrice / weight) * 100) / 100;
    }

    if (costRate > 0 && (!costPrice || costPrice === 0)) {
      costPrice = Math.round(costRate * weight);
    } else if (costPrice > 0 && (!costRate || costRate === 0)) {
      costRate = Math.round((costPrice / weight) * 100) / 100;
    }
  }

  let stock = data.stock !== undefined ? Math.max(0, Number(data.stock)) : undefined;
  let status = data.status;

  if (stock !== undefined) {
    if (stock === 0) {
      status = "SOLD";
    } else if (stock > 0 && status === "SOLD") {
      status = "AVAILABLE";
    }
  }

  const isManualOverride = Boolean(data.isManualOverride);
  const priceSource = data.priceSource || (isManualOverride ? "MANUAL" : "AUTO");

  return {
    ...data,
    costPrice,
    costRate,
    sellingPrice,
    sellingRate,
    isManualOverride,
    priceSource,
    ...(stock !== undefined ? { stock } : {}),
    ...(status ? { status } : {}),
  };
};

export const createDiamondStock = async (req, res) => {
  try {
    const cleanData = sanitizeDiamondData(req.body);

    // If not manual override and selling price not provided, attempt slab match
    if (!cleanData.isManualOverride && cleanData.sellingPrice <= 0 && cleanData.weight > 0) {
      const rateMasters = await DiamondRateMaster.find({ active: true }).sort({ priority: -1, rate: 1 }).lean();
      const slab = matchDiamondSlab(cleanData, rateMasters);
      if (slab) {
        cleanData.sellingRate = slab.rate;
        cleanData.sellingPrice = Math.round(slab.rate * cleanData.weight);
        cleanData.priceSource = "AUTO";
      }
    }

    const diamond = new DiamondStock(cleanData);
    await diamond.save();
    res.status(201).json({ success: true, diamond });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDiamondStocks = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { sku: new RegExp(search, "i") },
        { certificateNo: new RegExp(search, "i") },
        { shape: new RegExp(search, "i") },
      ];
    }
    const diamonds = await DiamondStock.find(filter).sort({ createdAt: -1 }).lean();
    const rateMasters = await DiamondRateMaster.find({ active: true }).sort({ priority: -1, rate: 1 }).lean();

    const resolvedDiamonds = diamonds.map((d) => {
      const w = Number(d.weight || 0);
      const hasCustomPrice = Number(d.sellingPrice) > 0;

      // If explicitly marked as manual override OR historical diamond that had an existing custom price:
      const isManual = d.isManualOverride === true || (d.isManualOverride === undefined && hasCustomPrice);

      if (isManual && hasCustomPrice) {
        const sRate = Number(d.sellingRate) || (w > 0 ? Math.round(Number(d.sellingPrice) / w) : 0);
        return {
          ...d,
          sellingRate: sRate,
          sellingPrice: Number(d.sellingPrice),
          priceSource: "MANUAL",
          isManualOverride: true,
        };
      }

      // If no price or auto, look up DiamondRateMaster slab
      const slab = matchDiamondSlab(d, rateMasters);
      if (slab && slab.rate > 0) {
        const autoRate = slab.rate;
        const autoPrice = Math.round(autoRate * w);

        // Async sync to DB if DB sellingPrice was empty
        if (!d.sellingPrice || d.sellingPrice === 0) {
          DiamondStock.updateOne(
            { _id: d._id },
            { sellingRate: autoRate, sellingPrice: autoPrice, priceSource: "AUTO", isManualOverride: false }
          ).catch((e) => console.error("Auto sync diamond price error:", e.message));
        }

        return {
          ...d,
          sellingRate: autoRate,
          sellingPrice: autoPrice,
          priceSource: "AUTO",
          isManualOverride: false,
          appliedSlab: {
            id: slab._id,
            shape: slab.shape,
            weightFrom: slab.weightFrom,
            weightTo: slab.weightTo,
            rate: slab.rate,
          },
        };
      }

      // Fallback
      const curPrice = Number(d.sellingPrice) || 0;
      const curRate = Number(d.sellingRate) || (w > 0 ? Math.round(curPrice / w) : 0);
      return {
        ...d,
        sellingRate: curRate,
        sellingPrice: curPrice,
        priceSource: curPrice > 0 ? "MANUAL" : "UNPRICED",
        isManualOverride: isManual,
      };
    });

    res.json({ success: true, diamonds: resolvedDiamonds });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDiamondStockById = async (req, res) => {
  try {
    const rawDiamond = await DiamondStock.findById(req.params.id).lean();
    if (!rawDiamond) return res.status(404).json({ success: false, message: "Diamond not found" });

    const w = Number(rawDiamond.weight || 0);
    const hasCustomPrice = Number(rawDiamond.sellingPrice) > 0;
    const isManual = rawDiamond.isManualOverride === true || (rawDiamond.isManualOverride === undefined && hasCustomPrice);

    if (isManual && hasCustomPrice) {
      const sRate = Number(rawDiamond.sellingRate) || (w > 0 ? Math.round(Number(rawDiamond.sellingPrice) / w) : 0);
      return res.json({
        success: true,
        diamond: {
          ...rawDiamond,
          sellingRate: sRate,
          sellingPrice: Number(rawDiamond.sellingPrice),
          priceSource: "MANUAL",
          isManualOverride: true,
        },
      });
    }

    const rateMasters = await DiamondRateMaster.find({ active: true }).sort({ priority: -1, rate: 1 }).lean();
    const slab = matchDiamondSlab(rawDiamond, rateMasters);

    if (slab && slab.rate > 0) {
      const autoRate = slab.rate;
      const autoPrice = Math.round(autoRate * w);

      // Async sync to DB if empty
      if (!rawDiamond.sellingPrice || rawDiamond.sellingPrice === 0) {
        DiamondStock.updateOne(
          { _id: rawDiamond._id },
          { sellingRate: autoRate, sellingPrice: autoPrice, priceSource: "AUTO", isManualOverride: false }
        ).catch((e) => console.error("Auto sync diamond price error:", e.message));
      }

      return res.json({
        success: true,
        diamond: {
          ...rawDiamond,
          sellingRate: autoRate,
          sellingPrice: autoPrice,
          priceSource: "AUTO",
          isManualOverride: false,
          appliedSlab: {
            id: slab._id,
            shape: slab.shape,
            weightFrom: slab.weightFrom,
            weightTo: slab.weightTo,
            rate: slab.rate,
          },
        },
      });
    }

    const curPrice = Number(rawDiamond.sellingPrice) || 0;
    const curRate = Number(rawDiamond.sellingRate) || (w > 0 ? Math.round(curPrice / w) : 0);
    res.json({
      success: true,
      diamond: {
        ...rawDiamond,
        sellingRate: curRate,
        sellingPrice: curPrice,
        priceSource: curPrice > 0 ? "MANUAL" : "UNPRICED",
        isManualOverride: rawDiamond.isManualOverride || curPrice > 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateDiamondStock = async (req, res) => {
  try {
    const cleanData = sanitizeDiamondData(req.body);

    // If manual override is false, re-resolve slab price
    if (!cleanData.isManualOverride && cleanData.weight > 0) {
      const rateMasters = await DiamondRateMaster.find({ active: true }).sort({ priority: -1, rate: 1 }).lean();
      const slab = matchDiamondSlab(cleanData, rateMasters);
      if (slab) {
        cleanData.sellingRate = slab.rate;
        cleanData.sellingPrice = Math.round(slab.rate * cleanData.weight);
        cleanData.priceSource = "AUTO";
      }
    }

    const diamond = await DiamondStock.findByIdAndUpdate(req.params.id, cleanData, { new: true });
    if (!diamond) return res.status(404).json({ success: false, message: "Diamond not found" });
    res.json({ success: true, diamond });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteDiamondStock = async (req, res) => {
  try {
    const diamond = await DiamondStock.findByIdAndDelete(req.params.id);
    if (!diamond) return res.status(404).json({ success: false, message: "Diamond not found" });
    res.json({ success: true, message: "Diamond deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
