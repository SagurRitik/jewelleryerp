// import SalesOrder from "../../models/SalesOrder.js";
// import mongoose from "mongoose";

// /* ================= LIST / HISTORY ================= */
// export const getAllSalesInvoices = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       search = "",
//       fromDate,
//       toDate,
//       sort = "date-desc",
//     } = req.query;

//     const query = {};

//     if (search) {
//       query.$or = [
//         { invoiceNo: { $regex: search, $options: "i" } },
//         { "customer.name": { $regex: search, $options: "i" } },
//         { "customer.mobile": { $regex: search, $options: "i" } },
//       ];
//     }

//     if (fromDate || toDate) {
//       query.createdAt = {};
//       if (fromDate) query.createdAt.$gte = new Date(fromDate);
//       if (toDate) query.createdAt.$lte = new Date(toDate);
//     }

//     const sortMap = {
//       "date-desc": { createdAt: -1 },
//       "date-asc": { createdAt: 1 },
//       "amount-desc": { "totals.grandTotal": -1 },
//       "amount-asc": { "totals.grandTotal": 1 },
//     };

//     const invoices = await SalesOrder.find(query)
//       .sort(sortMap[sort] || sortMap["date-desc"])
//       .skip((page - 1) * limit)
//       .limit(Number(limit));

//     const total = await SalesOrder.countDocuments(query);

//     res.json({
//       success: true,
//       invoices,
//       pagination: {
//         page: Number(page),
//         limit: Number(limit),
//         total,
//         totalPages: Math.ceil(total / limit),
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ================= SINGLE INVOICE ================= */
// // export const getInvoiceById = async (req, res) => {
// //   try {
// //     const { id } = req.params;

// //     if (!id) {
// //       return res.status(400).json({
// //         success: false,
// //         error: "Invoice ID missing",
// //       });
// //     }

// //     const invoice = await SalesOrder.findById(id).lean();

// //     if (!invoice) {
// //       return res.status(404).json({
// //         success: false,
// //         error: "Invoice not found",
// //       });
// //     }

// //     // 🔒 Snapshot-based invoice (NO recalculation)
// //     res.json({
// //       success: true,
// //       invoice,
// //     });
// //   } catch (err) {
// //     console.error("GET SALES INVOICE ERROR:", err);
// //     res.status(500).json({
// //       success: false,
// //       error: err.message,
// //     });
// //   }
// // };
// export const getInvoiceById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // 🔐 HARD GUARD
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid invoice ID",
//       });
//     }

//     const invoice = await SalesOrder.findById(id).lean();

//     if (!invoice) {
//       return res.status(404).json({
//         success: false,
//         error: "Invoice not found",
//       });
//     }

//     return res.json({
//       success: true,
//       invoice,
//     });
//   } catch (err) {
//     console.error("GET SALES INVOICE ERROR:", err);
//     return res.status(500).json({
//       success: false,
//       error: err.message,
//     });
//   }
// };


// import SalesOrder from "../../models/SalesOrder.js";
// import mongoose from "mongoose";

// /* ================= LIST ================= */
// export const getAllSalesInvoices = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       search = "",
//       fromDate,
//       toDate,
//       sort = "date-desc",
//     } = req.query;

//     const query = {};

//     if (search) {
//       query.$or = [
//         { invoiceNo: { $regex: search, $options: "i" } },
//         { "customer.name": { $regex: search, $options: "i" } },
//         { "customer.mobile": { $regex: search, $options: "i" } },
//       ];
//     }

//     if (fromDate || toDate) {
//       query.createdAt = {};
//       if (fromDate) query.createdAt.$gte = new Date(fromDate);
//       if (toDate) query.createdAt.$lte = new Date(toDate);
//     }

//     const sortMap = {
//       "date-desc": { createdAt: -1 },
//       "date-asc": { createdAt: 1 },
//       "amount-desc": { "totals.grandTotal": -1 },
//       "amount-asc": { "totals.grandTotal": 1 },
//     };

//     const invoices = await SalesOrder.find(query)
//       .sort(sortMap[sort] || sortMap["date-desc"])
//       .skip((page - 1) * limit)
//       .limit(Number(limit))
//       .lean();

//     const total = await SalesOrder.countDocuments(query);

//     res.json({
//       success: true,
//       invoices,
//       pagination: {
//         page: Number(page),
//         limit: Number(limit),
//         total,
//         totalPages: Math.ceil(total / limit),
//       },
//     });
//   } catch (err) {
//     console.error("LIST SALES ERROR:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// };

// /* ================= SINGLE ================= */
// export const getInvoiceById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     console.log("➡️ Invoice ID:", id);

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid invoice ID",
//       });
//     }

//     const invoice = await SalesOrder.findById(id).lean();

//     if (!invoice) {
//       return res.status(404).json({
//         success: false,
//         error: "Invoice not found",
//       });
//     }

//     console.log("✅ Invoice found:", invoice.invoiceNo);

//     res.json({
//       success: true,
//       invoice,
//     });
//   } catch (err) {
//     console.error("GET SALES INVOICE ERROR:", err);
//     res.status(500).json({
//       success: false,
//       error: err.message,
//     });
//   }
// };

// import SalesOrder from "../../models/SalesOrder.js";
// import mongoose from "mongoose";
// // ✅ Import the template engine
// import { invoiceTemplate } from "../../templates/invoice.template.js";

// /* ================= LIST ================= */
// export const getAllSalesInvoices = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       search = "",
//       fromDate,
//       toDate,
//       sort = "date-desc",
//     } = req.query;

//     const query = {};

//     if (search) {
//       query.$or = [
//         { invoiceNo: { $regex: search, $options: "i" } },
//         { "customer.name": { $regex: search, $options: "i" } },
//         { "customer.mobile": { $regex: search, $options: "i" } },
//       ];
//     }

//     if (fromDate || toDate) {
//       query.createdAt = {};
//       if (fromDate) query.createdAt.$gte = new Date(fromDate);
//       if (toDate) query.createdAt.$lte = new Date(toDate);
//     }

//     const sortMap = {
//       "date-desc": { createdAt: -1 },
//       "date-asc": { createdAt: 1 },
//       "amount-desc": { "totals.grandTotal": -1 },
//       "amount-asc": { "totals.grandTotal": 1 },
//     };

//     const invoices = await SalesOrder.find(query)
//       .sort(sortMap[sort] || sortMap["date-desc"])
//       .skip((page - 1) * limit)
//       .limit(Number(limit))
//       .lean();

//     const total = await SalesOrder.countDocuments(query);

//     res.json({
//       success: true,
//       invoices,
//       pagination: {
//         page: Number(page),
//         limit: Number(limit),
//         total,
//         totalPages: Math.ceil(total / limit),
//       },
//     });
//   } catch (err) {
//     console.error("LIST SALES ERROR:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// };

// /* ================= SINGLE JSON (For Data) ================= */
// export const getInvoiceById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     console.log("➡️ Invoice ID:", id);

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid invoice ID",
//       });
//     }

//     const invoice = await SalesOrder.findById(id).lean();

//     if (!invoice) {
//       return res.status(404).json({
//         success: false,
//         error: "Invoice not found",
//       });
//     }

//     console.log("✅ Invoice found:", invoice.invoiceNo);

//     res.json({
//       success: true,
//       invoice,
//     });
//   } catch (err) {
//     console.error("GET SALES INVOICE ERROR:", err);
//     res.status(500).json({
//       success: false,
//       error: err.message,
//     });
//   }
// };

// /* ================= NEW: HTML PREVIEW (For Iframe) ================= */
// export const getInvoicePreviewHTML = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).send("Invalid Invoice ID");
//     }

//     // 1. Get Invoice Data
//     const invoice = await SalesOrder.findById(id).lean();

//     if (!invoice) {
//       return res.status(404).send("Invoice not found");
//     }

//     // 2. Generate HTML using your template
//     const htmlContent = invoiceTemplate(invoice);

//     // 3. Send as HTML (Not JSON)
//     res.set("Content-Type", "text/html");
//     res.send(htmlContent);

//   } catch (err) {
//     console.error("HTML PREVIEW ERROR:", err);
//     res.status(500).send("Error generating invoice preview");
//   }
// };

import SalesOrder from "../../models/SalesOrder.js";
import mongoose from "mongoose";
import ReturnOrder from "../../models/ReturnOrder.js";
import CreditNote from "../../models/creditnotes.js";
// ✅ Import the template engine
import { invoiceTemplate } from "../../templates/invoice.template.js";

const buildInvoiceQuery = ({ search = "", fromDate, toDate }) => {
  const query = {};

  if (search) {
    query.$or = [
      { invoiceNo: { $regex: search, $options: "i" } },
      { "customer.name": { $regex: search, $options: "i" } },
      { "customer.mobile": { $regex: search, $options: "i" } },
    ];
  }

  if (fromDate || toDate) {
    query.createdAt = {};
    if (fromDate) query.createdAt.$gte = new Date(fromDate);
    if (toDate) query.createdAt.$lte = new Date(toDate);
  }

  return query;
};

/* ================= LIST ALL INVOICES ================= */
export const getAllSalesInvoices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      fromDate,
      toDate,
      sort = "date-desc",
    } = req.query;

    const query = buildInvoiceQuery({ search, fromDate, toDate });

    const sortMap = {
      "date-desc": { createdAt: -1 },
      "date-asc": { createdAt: 1 },
      "amount-desc": { "totals.grandTotal": -1 },
      "amount-asc": { "totals.grandTotal": 1 },
    };

    const invoices = await SalesOrder.find(query)
      .sort(sortMap[sort] || sortMap["date-desc"])
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await SalesOrder.countDocuments(query);

    res.json({
      success: true,
      invoices,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("LIST SALES ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteSalesInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice ID",
      });
    }

    const invoice = await SalesOrder.findById(id).select("_id creditNoteIds").lean();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const [linkedReturn, linkedCreditNote] = await Promise.all([
      ReturnOrder.findOne({ invoiceId: id }).select("_id").lean(),
      CreditNote.findOne({ invoiceId: id }).select("_id").lean(),
    ]);

    if (linkedReturn || linkedCreditNote || (invoice.creditNoteIds || []).length > 0) {
      return res.status(409).json({
        success: false,
        message: "Invoice cannot be deleted because it has linked returns or credit notes",
      });
    }

    await SalesOrder.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (err) {
    console.error("DELETE SALES INVOICE ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const deleteAllSalesInvoices = async (req, res) => {
  try {
    const { search = "", fromDate, toDate } = req.query;
    const query = buildInvoiceQuery({ search, fromDate, toDate });

    const invoices = await SalesOrder.find(query).select("_id creditNoteIds").lean();

    if (invoices.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No invoices found to delete",
      });
    }

    const ids = invoices.map((invoice) => invoice._id);

    const [returnLinks, creditNoteLinks] = await Promise.all([
      ReturnOrder.find({ invoiceId: { $in: ids } }).select("invoiceId").lean(),
      CreditNote.find({ invoiceId: { $in: ids } }).select("invoiceId").lean(),
    ]);

    const blockedIds = new Set([
      ...returnLinks.map((item) => String(item.invoiceId)),
      ...creditNoteLinks.map((item) => String(item.invoiceId)),
      ...invoices
        .filter((invoice) => Array.isArray(invoice.creditNoteIds) && invoice.creditNoteIds.length > 0)
        .map((invoice) => String(invoice._id)),
    ]);

    const deletableIds = ids.filter((id) => !blockedIds.has(String(id)));

    if (deletableIds.length === 0) {
      return res.status(409).json({
        success: false,
        message: "Matched invoices are linked with returns or credit notes, so none were deleted",
      });
    }

    const result = await SalesOrder.deleteMany({
      _id: { $in: deletableIds },
    });

    res.json({
      success: true,
      message: "Bulk delete completed",
      totalMatched: invoices.length,
      deletedCount: result.deletedCount || 0,
      blockedCount: blockedIds.size,
    });
  } catch (err) {
    console.error("DELETE ALL SALES INVOICES ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/* ================= SINGLE INVOICE (JSON Data) ================= */
export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    // console.log("➡️ Invoice ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid invoice ID",
      });
    }

    const invoice = await SalesOrder.findById(id).lean();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: "Invoice not found",
      });
    }

    // console.log("✅ Invoice found:", invoice.invoiceNo);

    res.json({
      success: true,
      invoice,
    });
  } catch (err) {
    console.error("GET SALES INVOICE ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/* ================= NEW: HTML PREVIEW (For Iframe) ================= */
export const getInvoicePreviewHTML = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid Invoice ID");
    }

    // 1. Get Invoice Data
    const invoice = await SalesOrder.findById(id).lean();

    if (!invoice) {
      return res.status(404).send("Invoice not found");
    }

    // 2. Generate HTML using your template
    const htmlContent = invoiceTemplate(invoice);

    // 3. Send as HTML (Not JSON)
    res.set("Content-Type", "text/html");
    res.send(htmlContent);

  } catch (err) {
    console.error("HTML PREVIEW ERROR:", err);
    res.status(500).send("Error generating invoice preview");
  }
};
