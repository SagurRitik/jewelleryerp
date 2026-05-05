
// import PosInvoice from "../../models/PosInvoice.js";
// import Order from "../../models/Order.js";

// export const getCombinedClosingSummary = async (req, res) => {
//   try {
//     const { date, startDate, endDate } = req.query;
//     let start, end;

//     /* ================= DATE RANGE ================= */
//     if (startDate && endDate) {
//       start = new Date(startDate);
//       end = new Date(endDate);
//     } else if (date) {
//       start = new Date(date);
//       end = new Date(date);
//     } else {
//       start = new Date();
//       end = new Date();
//     }

//     start.setHours(0, 0, 0, 0);
//     end.setHours(23, 59, 59, 999);

//     /* ================= FETCH DATA ================= */
//     const posInvoices = await PosInvoice.find({
//       createdAt: { $gte: start, $lte: end },
//     });

//     const orders = await Order.find({
//       createdAt: { $gte: start, $lte: end },
//     });

//     /* ================= INIT ================= */
//     let summary = {
//       posSale: 0,
//       orderSale: 0,
//       totalSale: 0,
//       gst: 0,
//     };

//     let dailyMap = {};

//     let paymentModes = {
//       pos: { Cash: 0, UPI: 0, Card: 0, Bank: 0 },
//       orders: { Online: 0, COD: 0 },
//     };

//     /* ================= POS AGGREGATION ================= */
//     posInvoices.forEach((inv) => {
//       const dateKey = new Date(inv.createdAt).toLocaleDateString("en-IN");
//       const amount = inv.pricing?.grandTotal || 0;
//       const gst = inv.pricing?.gst || 0;

//       summary.posSale += amount;
//       summary.totalSale += amount;
//       summary.gst += gst;

//       if (paymentModes.pos[inv.paymentMode] !== undefined) {
//         paymentModes.pos[inv.paymentMode] += amount;
//       }

//       if (!dailyMap[dateKey]) {
//         dailyMap[dateKey] = { date: dateKey, pos: 0, orders: 0 };
//       }
//       dailyMap[dateKey].pos += amount;
//     });

//     /* ================= ORDER AGGREGATION ================= */
//     orders.forEach((order) => {
//       const dateKey = new Date(order.createdAt).toLocaleDateString("en-IN");

//       const amount = order.pricingSnapshot?.grandTotal || 0;
//       const gst =
//         (order.pricingSnapshot?.gst || 0) +
//         (order.pricingSnapshot?.gstOnMaking || 0);

//       summary.orderSale += amount;
//       summary.totalSale += amount;
//       summary.gst += gst;

//       const mode = order.paymentMode === "COD" ? "COD" : "Online";
//       paymentModes.orders[mode] += amount;

//       if (!dailyMap[dateKey]) {
//         dailyMap[dateKey] = { date: dateKey, pos: 0, orders: 0 };
//       }
//       dailyMap[dateKey].orders += amount;
//     });

//     /* ================= ROUNDING ================= */
//     summary.posSale = Number(summary.posSale.toFixed(2));
//     summary.orderSale = Number(summary.orderSale.toFixed(2));
//     summary.totalSale = Number(summary.totalSale.toFixed(2));
//     summary.gst = Number(summary.gst.toFixed(2));

//     /* ================= RESPONSE ================= */
//     res.json({
//       success: true,
//       dateRange: {
//         start: start.toLocaleDateString("en-IN"),
//         end: end.toLocaleDateString("en-IN"),
//       },
//       summary: {
//         ...summary,
//         netSale: Number((summary.totalSale - summary.gst).toFixed(2)),
//       },
//       daily: Object.values(dailyMap),
//       paymentModes,
//     });
//   } catch (err) {
//     console.error("Combined Closing Error:", err);
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };


// import PosInvoice from "../../models/PosInvoice.js";
// import Order from "../../models/Order.js";

// export const getCombinedClosingSummary = async (req, res) => {
//   try {
//     const { date, startDate, endDate, period } = req.query;
//     let start, end;
//     const now = new Date();

//     /* ================= DATE RANGE HANDLING ================= */
//     if (startDate && endDate) {
//       // Custom range
//       start = new Date(startDate);
//       end = new Date(endDate);
//     } else if (date) {
//       // Single day
//       start = new Date(date);
//       end = new Date(date);
//     } else if (period) {
//       switch (period.toLowerCase()) {
//         case "today":
//           start = new Date();
//           end = new Date();
//           break;

//         case "week":
//           start = new Date();
//           start.setDate(start.getDate() - 6);
//           end = new Date();
//           break;

//         case "lastweek":
//           start = new Date();
//           start.setDate(start.getDate() - 13);
//           end = new Date();
//           end.setDate(end.getDate() - 7);
//           break;

//         case "month":
//           start = new Date(now.getFullYear(), now.getMonth(), 1);
//           end = new Date();
//           break;

//         case "lastmonth":
//           start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//           end = new Date(now.getFullYear(), now.getMonth(), 0);
//           break;

//         case "year":
//           start = new Date(now.getFullYear(), 0, 1);
//           end = new Date();
//           break;

//         default:
//           start = new Date();
//           end = new Date();
//       }
//     } else {
//       // Default = today
//       start = new Date();
//       end = new Date();
//     }

//     start.setHours(0, 0, 0, 0);
//     end.setHours(23, 59, 59, 999);

//     /* ================= FETCH DATA ================= */
//     const posInvoices = await PosInvoice.find({
//       createdAt: { $gte: start, $lte: end },
//     });

//     const orders = await Order.find({
//       createdAt: { $gte: start, $lte: end },
//     });

//     /* ================= INIT ================= */
//     let summary = {
//       posSale: 0,
//       orderSale: 0,
//       totalSale: 0,
//       gst: 0,
//     };

//     let dailyMap = {};

//     let paymentModes = {
//       pos: { Cash: 0, UPI: 0, Card: 0, Bank: 0 },
//       orders: { Online: 0, COD: 0 },
//     };

//     /* ================= POS ================= */
//     posInvoices.forEach((inv) => {
//       const dateKey = new Date(inv.createdAt).toLocaleDateString("en-IN");
//       const amount = inv.pricing?.grandTotal || 0;
//       const gst = inv.pricing?.gst || 0;

//       summary.posSale += amount;
//       summary.totalSale += amount;
//       summary.gst += gst;

//       if (paymentModes.pos[inv.paymentMode] !== undefined) {
//         paymentModes.pos[inv.paymentMode] += amount;
//       }

//       if (!dailyMap[dateKey]) {
//         dailyMap[dateKey] = { date: dateKey, pos: 0, orders: 0 };
//       }
//       dailyMap[dateKey].pos += amount;
//     });

//     /* ================= ORDERS ================= */
//     orders.forEach((order) => {
//       const dateKey = new Date(order.createdAt).toLocaleDateString("en-IN");

//       const amount = order.pricingSnapshot?.grandTotal || 0;
//       const gst =
//         (order.pricingSnapshot?.gst || 0) +
//         (order.pricingSnapshot?.gstOnMaking || 0);

//       summary.orderSale += amount;
//       summary.totalSale += amount;
//       summary.gst += gst;

//       const mode = order.paymentMode === "COD" ? "COD" : "Online";
//       paymentModes.orders[mode] += amount;

//       if (!dailyMap[dateKey]) {
//         dailyMap[dateKey] = { date: dateKey, pos: 0, orders: 0 };
//       }
//       dailyMap[dateKey].orders += amount;
//     });

//     /* ================= ROUNDING ================= */
//     summary.posSale = Number(summary.posSale.toFixed(2));
//     summary.orderSale = Number(summary.orderSale.toFixed(2));
//     summary.totalSale = Number(summary.totalSale.toFixed(2));
//     summary.gst = Number(summary.gst.toFixed(2));

//     /* ================= RESPONSE ================= */
//     res.json({
//       success: true,
//       period: period || "custom",
//       dateRange: {
//         start: start.toLocaleDateString("en-IN"),
//         end: end.toLocaleDateString("en-IN"),
//       },
//       summary: {
//         ...summary,
//         netSale: Number((summary.totalSale - summary.gst).toFixed(2)),
//       },
//       daily: Object.values(dailyMap),
//       paymentModes,
//     });
//   } catch (err) {
//     console.error("Combined Closing Error:", err);
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };
