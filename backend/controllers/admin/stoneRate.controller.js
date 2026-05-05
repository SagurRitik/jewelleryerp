
import StoneRateMaster from "../../models/StoneRateMaster.js";

/* ================= CREATE ================= */
export const createStoneRate = async (req, res) => {
  try {
    const rate = await StoneRateMaster.create(req.body);
    res.json({ success: true, rate });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

/* ================= GET ALL ================= */
export const getStoneRates = async (req, res) => {
  try {
    const rates = await StoneRateMaster.find()
      .sort({ stoneType: 1, weightFrom: 1 })
      .lean();

    res.json({ success: true, rates });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= UPDATE ================= */
export const updateStoneRate = async (req, res) => {
  try {
    const rate = await StoneRateMaster.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!rate) {
      return res.status(404).json({
        success: false,
        message: "Stone rate not found",
      });
    }

    res.json({ success: true, rate });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

/* ================= DEACTIVATE (SOFT DELETE) ================= */
export const deactivateStoneRate = async (req, res) => {
  try {
    const rate = await StoneRateMaster.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!rate) {
      return res.status(404).json({
        success: false,
        message: "Stone rate not found",
      });
    }

    res.json({ success: true, rate });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

/* ================= DELETE (HARD DELETE) ================= */
export const deleteStoneRate = async (req, res) => {
  try {
    const rate = await StoneRateMaster.findByIdAndDelete(req.params.id);

    if (!rate) {
      return res.status(404).json({
        success: false,
        message: "Stone rate not found",
      });
    }

    res.json({
      success: true,
      message: "Stone rate deleted successfully",
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};