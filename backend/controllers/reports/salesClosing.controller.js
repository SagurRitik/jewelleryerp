// import SalesOrder from "../../models/SalesOrder.js";

// export const getDailySalesClosing = async (req, res) => {
//   try {
//     // 🔹 Today start & end
//     const start = new Date();
//     start.setHours(0, 0, 0, 0);

//     const end = new Date();
//     end.setHours(23, 59, 59, 999);

//     const invoices = await SalesOrder.find({
//       createdAt: { $gte: start, $lte: end },
//     }).lean();

//     let summary = {
//       totalInvoices: invoices.length,
//       totalSale: 0,
//       gst: 0,
//       cash: 0,
//       upi: 0,
//       card: 0,
//       bank: 0,
//     };

//     invoices.forEach((inv) => {
//       summary.totalSale += inv.totals?.grandTotal || 0;
//       summary.gst += inv.totals?.gst || 0;

//       switch (inv.payment?.mode) {
//         case "CASH":
//           summary.cash += inv.totals?.grandTotal || 0;
//           break;
//         case "UPI":
//           summary.upi += inv.totals?.grandTotal || 0;
//           break;
//         case "CARD":
//           summary.card += inv.totals?.grandTotal || 0;
//           break;
//         case "BANK":
//           summary.bank += inv.totals?.grandTotal || 0;
//           break;
//       }
//     });

//     return res.json({
//       success: true,
//       summary,
//     });
//   } catch (err) {
//     console.error("SALES CLOSING ERROR:", err);
//     return res.status(500).json({
//       success: false,
//       error: err.message,
//     });
//   }
// };


// import SalesOrder from "../../models/SalesOrder.js";

// export const getDailySalesClosing = async (req, res) => {
//   try {
//     const { date } = req.query;

//     // fallback = today
//     const selectedDate = date ? new Date(date) : new Date();

//     const start = new Date(selectedDate);
//     start.setHours(0, 0, 0, 0);

//     const end = new Date(selectedDate);
//     end.setHours(23, 59, 59, 999);

//     const invoices = await SalesOrder.find({
//       createdAt: { $gte: start, $lte: end },
//     }).lean();

//     let summary = {
//       totalInvoices: invoices.length,
//       totalSale: 0,
//       gst: 0,
//       cash: 0,
//       upi: 0,
//       card: 0,
//       bank: 0,
//     };

//     invoices.forEach((inv) => {
//       const grandTotal = inv.totals?.grandTotal || 0;
//       const gst = inv.totals?.gst || 0;

//       summary.totalSale += grandTotal;
//       summary.gst += gst;

//       const mode = inv.payment?.mode?.toUpperCase();

//       switch (mode) {
//         case "CASH":
//           summary.cash += grandTotal;
//           break;
//         case "UPI":
//           summary.upi += grandTotal;
//           break;
//         case "CARD":
//           summary.card += grandTotal;
//           break;
//         case "BANK":
//           summary.bank += grandTotal;
//           break;
//       }
//     });

//     res.json({
//       success: true,
//       date: start,
//       summary,
//     });
//   } catch (err) {
//     console.error("SALES CLOSING ERROR:", err);
//     res.status(500).json({
//       success: false,
//       error: err.message,
//     });
//   }
// };
import SalesOrder from "../../models/SalesOrder.js";

export const getDailySalesClosing = async (req, res) => {
  try {
    const { date } = req.query;

    // IST-safe day range
    const baseDate = date
      ? new Date(`${date}T00:00:00.000+05:30`)
      : new Date();

    const start = new Date(baseDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(baseDate);
    end.setHours(23, 59, 59, 999);

    const invoices = await SalesOrder.find({
      createdAt: { $gte: start, $lte: end },
    }).lean();

    const summary = {
      totalInvoices: invoices.length,
      totalSale: 0,
      gst: 0,
      payments: {
        cash: 0,
        upi: 0,
        card: 0,
        bank: 0,
      },
      gstSummary: {
        sgst: 0,
        cgst: 0,
      },
    };

    invoices.forEach((inv) => {
      const total = inv.totals?.grandTotal || 0;
      const gst = inv.totals?.gst || 0;

      summary.totalSale += total;
      summary.gst += gst;

      const mode = inv.payment?.mode?.toUpperCase();

      if (summary.payments[mode?.toLowerCase()] !== undefined) {
        summary.payments[mode.toLowerCase()] += total;
      }
    });

    summary.gstSummary.sgst = summary.gst / 2;
    summary.gstSummary.cgst = summary.gst / 2;

    res.json({
      success: true,
      date: start,
      summary,
    });
  } catch (err) {
    console.error("DAILY SALES CLOSING ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
