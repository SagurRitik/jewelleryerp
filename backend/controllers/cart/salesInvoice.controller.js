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
import xlsx from "xlsx";
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


export const exportSalesInvoices = async (req, res) => {
  try {
    const { search = "", fromDate, toDate } = req.query;
    const query = buildInvoiceQuery({ search, fromDate, toDate });

    const invoices = await SalesOrder.find(query).sort({ createdAt: -1 }).lean();

    const formattedInvoices = invoices.map((inv) => ({
      "Invoice No": inv.invoiceNo,
      "Date": inv.date ? new Date(inv.date).toLocaleDateString("en-IN") : "",
      "Customer Name": inv.customer?.name || "",
      "Customer Mobile": inv.customer?.mobile || "",
      "Customer Email": inv.customer?.email || "",
      "Customer Address": inv.customer?.address || "",
      "Customer GSTIN": inv.customer?.gstin || "",
      "Customer State Code": inv.customer?.stateCode || "",
      "Customer PAN": inv.customer?.panNumber || "",
      "Salesperson": inv.salesperson || "",
      "Subtotal": inv.totals?.subtotal || 0,
      "Discount": inv.totals?.discount || 0,
      "GST": inv.totals?.gst || 0,
      "Grand Total": inv.totals?.grandTotal || 0,
      "Net Payable": inv.totals?.netPayable || 0,
      "Applied Credit": inv.totals?.appliedCredit || 0,
      "Payment Mode": inv.payment?.mode || "",
      "Payment Reference No": inv.payment?.referenceNo || "",
      "Payment Status": inv.payment?.status || "",
      "Tally Synced": inv.tallySynced ? "YES" : "NO",
      "Items JSON": JSON.stringify(inv.items || []),
      "Metal Payments JSON": JSON.stringify(inv.metalPayments || []),
      "Totals JSON": JSON.stringify(inv.totals || {}),
      "Rate Snapshot JSON": JSON.stringify(inv.rateSnapshot || {}),
      "Payment JSON": JSON.stringify(inv.payment || {}),
    }));

    const worksheet = xlsx.utils.json_to_sheet(formattedInvoices);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Sales Invoices");

    const buffer = xlsx.write(workbook, { bookType: "xlsx", type: "buffer" });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sales_invoices.xlsx"
    );
    res.type("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (err) {
    console.error("EXPORT SALES INVOICES ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};


export const importSalesInvoices = async (req, res) => {
  try {
    console.log("DEBUG: Bulk Sales Invoices Import Request Received");
    if (!req.file) {
      console.log("DEBUG: No file found in request");
      return res.status(400).json({ success: false, message: "Excel file is required" });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

    console.log(`DEBUG: Found ${rows.length} rows in Excel`);

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: "Excel sheet is empty" });
    }

    const parseInvoiceDate = (val) => {
      if (!val) return new Date();
      if (val instanceof Date) return val;
      
      if (typeof val === 'number') {
        return new Date((val - 25569) * 86400 * 1000);
      }
      
      const str = String(val).trim();
      if (!str) return new Date();

      const matchDMY = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
      if (matchDMY) {
        const day = parseInt(matchDMY[1], 10);
        const month = parseInt(matchDMY[2], 10) - 1;
        const year = parseInt(matchDMY[3], 10);
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) return d;
      }
      
      const d = new Date(str);
      if (!isNaN(d.getTime())) return d;
      return new Date();
    };

    let importedCount = 0;
    let skippedCount = 0;

    for (const row of rows) {
      const normalizedRow = {};
      Object.keys(row).forEach(key => {
        const normalizedKey = key.toString().replace(/\s+/g, "").replace(/_/g, "").toLowerCase();
        normalizedRow[normalizedKey] = row[key];
      });

      const invoiceNo = String(normalizedRow.invoiceno || "").trim();
      if (!invoiceNo) {
        skippedCount++;
        continue;
      }

      // 1. Customer Details
      const customer = {
        name: String(normalizedRow.customername || "").trim(),
        mobile: String(normalizedRow.customermobile || "").trim(),
        email: String(normalizedRow.customeremail || "").trim(),
        address: String(normalizedRow.customeraddress || "").trim(),
        gstin: String(normalizedRow.customergstin || "").trim(),
        stateCode: String(normalizedRow.customerstatecode || "").trim(),
        panNumber: String(normalizedRow.customerpan || "").trim()
      };

      // 2. Date
      const date = parseInvoiceDate(normalizedRow.date);

      // 3. Salesperson
      const salesperson = String(normalizedRow.salesperson || "").trim();

      // 4. Nested elements parsing from JSON columns
      let items = [];
      if (normalizedRow.itemsjson) {
        try {
          items = JSON.parse(normalizedRow.itemsjson);
        } catch (e) {
          console.error(`Failed to parse itemsjson for invoice ${invoiceNo}:`, e.message);
        }
      }

      let metalPayments = [];
      if (normalizedRow.metalpaymentsjson) {
        try {
          metalPayments = JSON.parse(normalizedRow.metalpaymentsjson);
        } catch (e) {
          console.error(`Failed to parse metalpaymentsjson for invoice ${invoiceNo}:`, e.message);
        }
      }

      let totals = {};
      if (normalizedRow.totalsjson) {
        try {
          totals = JSON.parse(normalizedRow.totalsjson);
        } catch (e) {
          console.error(`Failed to parse totalsjson for invoice ${invoiceNo}:`, e.message);
        }
      } else {
        totals = {
          subtotal: Number(normalizedRow.subtotal || 0),
          discount: Number(normalizedRow.discount || 0),
          gst: Number(normalizedRow.gst || 0),
          grandTotal: Number(normalizedRow.grandtotal || 0),
          netPayable: Number(normalizedRow.netpayable || 0),
          appliedCredit: Number(normalizedRow.appliedcredit || 0),
          advancePayment: Number(normalizedRow.advancepayment || 0),
          totalAdjustments: Number(normalizedRow.totaladjustments || 0),
          discountMaking: Number(normalizedRow.discountmaking || 0),
          discountDiamond: Number(normalizedRow.discountdiamond || 0),
          discountStone: Number(normalizedRow.discountstone || 0)
        };
      }

      let rateSnapshot = {};
      if (normalizedRow.ratesnapshotjson) {
        try {
          rateSnapshot = JSON.parse(normalizedRow.ratesnapshotjson);
        } catch (e) {
          console.error(`Failed to parse ratesnapshotjson for invoice ${invoiceNo}:`, e.message);
        }
      }

      let payment = {};
      if (normalizedRow.paymentjson) {
        try {
          payment = JSON.parse(normalizedRow.paymentjson);
        } catch (e) {
          console.error(`Failed to parse paymentjson for invoice ${invoiceNo}:`, e.message);
        }
      } else {
        payment = {
          mode: String(normalizedRow.paymentmode || "CASH").toUpperCase(),
          referenceNo: String(normalizedRow.paymentreferenceno || ""),
          status: String(normalizedRow.paymentstatus || "")
        };
      }

      const tallySynced = String(normalizedRow.tallysynced || "").toUpperCase() === "YES" || normalizedRow.tallysynced === true;

      const invoiceData = {
        invoiceNo,
        date,
        customer,
        salesperson,
        items,
        metalPayments,
        totals,
        rateSnapshot,
        payment,
        tallySynced
      };

      // Perform upsert to prevent duplicates
      await SalesOrder.findOneAndUpdate(
        { invoiceNo },
        invoiceData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      importedCount++;
    }

    console.log(`DEBUG: Imported ${importedCount} invoices, Skipped ${skippedCount}`);

    return res.status(200).json({
      success: true,
      count: importedCount,
      skipped: skippedCount
    });

  } catch (err) {
    console.error("DEBUG: importSalesInvoices error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
