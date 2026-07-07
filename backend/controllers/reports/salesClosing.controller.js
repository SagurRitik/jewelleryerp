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

    // Helper to get current date in IST format (YYYY-MM-DD)
    const getISTDateString = (d = new Date()) => {
      const offset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
      const istDate = new Date(d.getTime() + offset);
      return istDate.toISOString().split("T")[0];
    };

    const targetDateStr = date || getISTDateString();

    // Construct the absolute UTC range matching the full 24 hours of targetDateStr in IST (+05:30)
    const start = new Date(`${targetDateStr}T00:00:00.000+05:30`);
    const end = new Date(`${targetDateStr}T23:59:59.999+05:30`);

    console.log(`[DAILY CLOSING] Query range (UTC): ${start.toISOString()} to ${end.toISOString()}`);

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
