import CreditNote from "../models/creditnotes.js";

// @desc    Get all credit notes with pagination, filter, search, sort
// @route   GET /api/creditnotes
export const getCreditNotes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const query = {};

    // Search logic (ID or Customer Name)
    if (search) {
      query.$or = [
        { creditNoteNo: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { "customer.mobile": { $regex: search, $options: "i" } },
      ];
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    const sortOrder = order === "asc" ? 1 : -1;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notes = await CreditNote.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CreditNote.countDocuments(query);

    res.json({
      notes,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get credit note statistics
// @route   GET /api/creditnotes/stats
export const getCreditNoteStats = async (req, res) => {
  try {
    const stats = await CreditNote.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          activeCount: {
            $sum: { $cond: [{ $eq: ["$status", "ACTIVE"] }, 1, 0] },
          },
          usedCount: {
            $sum: { $cond: [{ $eq: ["$status", "USED"] }, 1, 0] },
          },
          totalCount: { $sum: 1 },
        },
      },
    ]);

    const result = stats[0] || {
      totalAmount: 0,
      activeCount: 0,
      usedCount: 0,
      totalCount: 0,
    };

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCustomerCredits = async (req, res) => {
  try {
    const mobile = req.params.mobile;
    const cleanMobile = mobile.replace(/\D/g, "").slice(-10);
    const credits = await CreditNote.find({
      "customer.mobile": { $regex: cleanMobile + "$" },
      status: "ACTIVE",
      remainingAmount: { $gt: 0 },
    }).sort({ createdAt: -1 });

    res.json(credits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};