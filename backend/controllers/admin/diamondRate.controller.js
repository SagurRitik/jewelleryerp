

import DiamondRateMaster from "../../models/DiamondRateMaster.js";

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