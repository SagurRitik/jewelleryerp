// import SalesOrder from "../../models/SalesOrder.js";

// export const getInvoiceById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const invoice = await SalesOrder.findById(id).lean();
//     if (!invoice) {
//       return res.status(404).json({
//         success: false,
//         error: "Invoice not found",
//       });
//     }

//     res.json({
//       success: true,
//       invoice,
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       error: err.message,
//     });
//   }
// };

import { generateTallySalesXML } from "../../utils/generateTallySalesXML.js";
import { sendToTally } from "../../utils/sendToTally.js";


import SalesOrder from "../../models/SalesOrder.js";

export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Invoice ID missing",
      });
    }

    const invoice = await SalesOrder.findById(id).lean();
    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: "Invoice not found",
      });
    }

    // ✅ No recalculation
    // ✅ No active rate dependency
    // ✅ Fully snapshot-based invoice

    res.json({
      success: true,
      invoice,
    });
  } catch (err) {
    console.error("GET INVOICE ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// export const resyncTally = async (req, res) => {
//   try {
//     const invoice = await SalesOrder.findById(req.params.id);

//     if (!invoice) {
//       return res.status(404).json({ success: false, error: "Invoice not found" });
//     }

//     const xml = generateTallySalesXML(invoice);
//     const tallyResponse = await sendToTally(xml);

//     invoice.tallySynced = true;
//     invoice.tallyResponse = tallyResponse;
//     invoice.tallyError = null;

//     await invoice.save();

//     res.json({
//       success: true,
//       message: "Tally sync successful",
//     });

//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       error: err.message,
//     });
//   }
// };

export const resyncTally = async (req, res) => {
  try {
    const invoice = await SalesOrder.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: "Invoice not found",
      });
    }

    const xml = generateTallySalesXML(invoice);
    const tallyResponse = await sendToTally(xml);

    invoice.tallySynced = true;
    invoice.tallyResponse = tallyResponse;
    invoice.tallyError = null;

    await invoice.save();

    return res.json({
      success: true,
      message: "Tally sync successful",
    });

  } catch (err) {

    // 🔥 store failure
    await SalesOrder.findByIdAndUpdate(req.params.id, {
      tallySynced: false,
      tallyError: err.message,
    });

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const getAllInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", date, startDate, endDate } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { invoiceNo: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { "customer.mobile": { $regex: search, $options: "i" } },
      ];
    }

    if (date) {
      const selectedDate = new Date(date);
      const nextDate = new Date(selectedDate);
      nextDate.setDate(nextDate.getDate() + 1);
      filter.createdAt = {
        $gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
        $lt: new Date(nextDate.setHours(0, 0, 0, 0))
      };
    } else if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(new Date(startDate).setHours(0, 0, 0, 0));
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        filter.createdAt.$lt = new Date(end.setHours(0, 0, 0, 0));
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [invoices, total] = await Promise.all([
      SalesOrder.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      SalesOrder.countDocuments(filter)
    ]);

    res.json({
      success: true,
      invoices,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error("GET ALL INVOICES ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
