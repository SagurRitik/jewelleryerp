
import DiamondStock from "../models/DiamondStock.js";

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

  return {
    ...data,
    costPrice,
    costRate,
    sellingPrice,
    sellingRate,
    ...(stock !== undefined ? { stock } : {}),
    ...(status ? { status } : {}),
  };
};

export const createDiamondStock = async (req, res) => {
  try {
    const cleanData = sanitizeDiamondData(req.body);
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
    const diamonds = await DiamondStock.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, diamonds });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDiamondStockById = async (req, res) => {
  try {
    const diamond = await DiamondStock.findById(req.params.id);
    if (!diamond) return res.status(404).json({ success: false, message: "Diamond not found" });
    res.json({ success: true, diamond });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateDiamondStock = async (req, res) => {
  try {
    const cleanData = sanitizeDiamondData(req.body);
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
