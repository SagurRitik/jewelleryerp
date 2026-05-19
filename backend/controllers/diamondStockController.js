
import DiamondStock from "../models/DiamondStock.js";

export const createDiamondStock = async (req, res) => {
  try {
    const diamond = new DiamondStock(req.body);
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
    const diamond = await DiamondStock.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
