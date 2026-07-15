import SalesOrder from "../models/SalesOrder.js";
import Product from "../models/Product.js";

export const getDashboardStats = async (req, res) => {
  try {
    const { filter = "monthly", startDate, endDate } = req.query;

    /* ================= DATE FILTER ================= */
    let dateMatch = {};
    let groupFormat = {};
    const now = new Date();

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      dateMatch = {
        date: {
          $gte: start,
          $lte: end,
        },
      };

      groupFormat = {
        $dateToString: { format: "%Y-%m-%d", date: "$date" },
      };
    } else {
      let fromDate = new Date();
      switch (filter) {
        case "daily":
          fromDate.setDate(fromDate.getDate() - 30);
          groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$date" } };
          break;
        case "weekly":
          fromDate.setDate(fromDate.getDate() - 84);
          groupFormat = { $dateToString: { format: "%Y-%U", date: "$date" } };
          break;
        case "yearly":
          fromDate.setFullYear(fromDate.getFullYear() - 5);
          groupFormat = { $dateToString: { format: "%Y", date: "$date" } };
          break;
        case "monthly":
        default:
          fromDate.setMonth(fromDate.getMonth() - 11);
          fromDate.setDate(1);
          groupFormat = { $dateToString: { format: "%Y-%m", date: "$date" } };
      }
      fromDate.setHours(0, 0, 0, 0);
      dateMatch = {
        date: {
          $gte: fromDate,
          $lte: now,
        },
      };
    }

    /* ================= TOP CARDS ================= */
    const totalOrders = await SalesOrder.countDocuments(dateMatch);
    const revenueAgg = await SalesOrder.aggregate([
      { $match: dateMatch },
      { $group: { _id: null, total: { $sum: "$totals.grandTotal" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;
    const inventoryItems = await Product.countDocuments();
    const avgOrderValue = totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0;

    /* ================= RECENT ORDERS ================= */
    const recentOrders = await SalesOrder.find(dateMatch)
      .sort({ date: -1 })
      .limit(5)
      .select("invoiceNo customer.name totals.grandTotal date payment.status")
      .lean();

    /* ================= SALES GRAPH ================= */
    const salesGraph = await SalesOrder.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: groupFormat,
          revenue: { $sum: "$totals.grandTotal" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    /* ================= METAL TREND (WEIGHT BASED) ================= */
    const metalTrend = await SalesOrder.aggregate([
      { $match: dateMatch },
      { $unwind: "$items" },
      {
        $group: {
          _id: {
            period: groupFormat,
            metal: {
              $toUpper: {
                $ifNull: [
                  "$items.itemSnapshot.productDetails.metalType",
                  "$items.itemSnapshot.metalType",
                  "OTHER",
                ],
              },
            },
            purity: {
              $toUpper: {
                $ifNull: [
                  "$items.itemSnapshot.productDetails.metalPurity",
                  "$items.itemSnapshot.metalPurity",
                  "NA",
                ],
              },
            },
          },
          totalWeight: {
            $sum: {
              $multiply: [
                { $toDouble: { $ifNull: ["$items.itemSnapshot.productDetails.netWeight", "$items.itemSnapshot.netWeight", 0] } },
                { $toDouble: { $ifNull: ["$items.quantity", 1] } },
              ],
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id.period",
          metals: {
            $push: {
              metal: "$_id.metal",
              purity: "$_id.purity",
              weight: "$totalWeight",
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    /* ================= METAL DISTRIBUTION (PURITY, RATE, COST) ================= */
    const metalPuritySales = await SalesOrder.aggregate([
      { $match: dateMatch },
      { $unwind: "$items" },
      {
        $group: {
          _id: {
            metal: {
              $toUpper: {
                $ifNull: [
                  "$items.itemSnapshot.productDetails.metalType",
                  "$items.itemSnapshot.metalType",
                  "OTHER",
                ],
              },
            },
            purity: {
              $toUpper: {
                $ifNull: [
                  "$items.itemSnapshot.productDetails.metalPurity",
                  "$items.itemSnapshot.metalPurity",
                  "NA",
                ],
              },
            },
            rate: { $toDouble: { $ifNull: ["$items.breakup.metalRate", 0] } },
          },
          totalWeight: {
            $sum: {
              $multiply: [
                { $toDouble: { $ifNull: ["$items.itemSnapshot.productDetails.netWeight", "$items.itemSnapshot.netWeight", 0] } },
                { $toDouble: { $ifNull: ["$items.quantity", 1] } },
              ],
            },
          },
          totalMetalValue: {
            $sum: { $toDouble: { $ifNull: ["$items.breakup.metalValue", 0] } },
          },
          totalQty: { $sum: { $toDouble: { $ifNull: ["$items.quantity", 1] } } },
        },
      },
      {
        $project: {
          _id: 0,
          metal: "$_id.metal",
          purity: "$_id.purity",
          rate: { $round: ["$_id.rate", 2] },
          weight: { $round: ["$totalWeight", 2] },
          metalValue: { $round: ["$totalMetalValue", 2] }, 
          revenue: { $round: ["$totalMetalValue", 2] },  
          quantity: "$totalQty",
        },
      },
      { $sort: { metal: 1, weight: -1 } },
    ]);

    /* ================= DIAMOND ANALYTICS ================= */
    const diamondTrend = await SalesOrder.aggregate([
      { $match: dateMatch },
      { $unwind: "$items" },
      { $unwind: "$items.breakup.componentBreakup" },
      { $match: { "items.breakup.componentBreakup.pricingRef": "DIAMOND" } },
      {
        $group: {
          _id: groupFormat,
          totalCarats: {
            $sum: {
              $multiply: [
                { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.weight", 0] } },
                { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.count", 1] } },
              ],
            },
          },
          totalAmount: { $sum: { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.value", 0] } } },
          totalQty: { $sum: { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.count", 1] } } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const diamondDetails = await SalesOrder.aggregate([
      { $match: dateMatch },
      { $unwind: "$items" },
      { $unwind: "$items.breakup.componentBreakup" },
      { $match: { "items.breakup.componentBreakup.pricingRef": "DIAMOND" } },
      {
        $group: {
          _id: { $toUpper: { $ifNull: ["$items.breakup.componentBreakup.type", "DIAMOND"] } },
          totalCarats: {
            $sum: {
              $multiply: [
                { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.weight", 0] } },
                { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.count", 1] } },
              ],
            },
          },
          totalAmount: { $sum: { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.value", 0] } } },
          totalQty: { $sum: { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.count", 1] } } },
          avgRate: { $avg: { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.rate", 0] } } },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          carats: { $round: ["$totalCarats", 2] },
          quantity: "$totalQty",
          amount: { $round: ["$totalAmount", 2] },
          avgRate: { $round: ["$avgRate", 2] },
        },
      },
      { $sort: { carats: -1 } },
    ]);

    const diamondSizeAnalysis = await SalesOrder.aggregate([
        { $match: dateMatch },
        { $unwind: "$items" },
        { $unwind: "$items.breakup.componentBreakup" },
        { $match: { "items.breakup.componentBreakup.pricingRef": "DIAMOND" } },
        {
          $project: {
            weight: { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.weight", 0] } },
            value: { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.value", 0] } },
            count: { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.count", 1] } },
          },
        },
        {
          $project: {
            range: {
              $switch: {
                branches: [
                  { case: { $lte: ["$weight", 0.10] }, then: "0.00 - 0.10 ct" },
                  { case: { $lte: ["$weight", 0.20] }, then: "0.10 - 0.20 ct" },
                  { case: { $lte: ["$weight", 0.50] }, then: "0.20 - 0.50 ct" },
                  { case: { $lte: ["$weight", 1.00] }, then: "0.50 - 1.00 ct" },
                  { case: { $lte: ["$weight", 2.00] }, then: "1.00 - 2.00 ct" },
                  { case: { $lte: ["$weight", 3.00] }, then: "2.00 - 3.00 ct" },
                  { case: { $lte: ["$weight", 5.00] }, then: "3.00 - 5.00 ct" },
                ],
                default: "5.00+ ct",
              },
            },
            weight: "$weight",
            value: "$value",
            count: "$count",
          },
        },
        {
          $group: {
            _id: "$range",
            totalWeight: { $sum: { $multiply: ["$weight", "$count"] } },
            totalAmount: { $sum: "$value" },
            totalQty: { $sum: "$count" },
            minWeight: { $min: "$weight" },
          },
        },
        {
          $project: {
            _id: 0,
            range: "$_id",
            weight: { $round: ["$totalWeight", 2] },
            quantity: "$totalQty",
            amount: { $round: ["$totalAmount", 2] },
            avgRate: {
              $cond: [
                { $gt: ["$totalWeight", 0] },
                { $round: [{ $divide: ["$totalAmount", "$totalWeight"] }, 2] },
                0,
              ],
            },
            minWeight: 1,
          },
        },
        { $sort: { minWeight: 1 } },
      ]);

    const diamondTotals = await SalesOrder.aggregate([
      { $match: dateMatch },
      { $unwind: "$items" },
      { $unwind: "$items.breakup.componentBreakup" },
      { $match: { "items.breakup.componentBreakup.pricingRef": "DIAMOND" } },
      {
        $group: {
          _id: null,
          totalCarats: {
            $sum: {
              $multiply: [
                { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.weight", 0] } },
                { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.count", 1] } },
              ],
            },
          },
          totalAmount: { $sum: { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.value", 0] } } },
          totalQty: { $sum: { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.count", 1] } } },
        },
      },
    ]);

    /* ================= STONE ANALYTICS ================= */
    const stoneSales = await SalesOrder.aggregate([
      { $match: dateMatch },
      { $unwind: "$items" },
      { $unwind: "$items.breakup.componentBreakup" },
      { $match: { "items.breakup.componentBreakup.pricingRef": "STONE" } },
      {
        $group: {
          _id: { $toUpper: { $ifNull: ["$items.breakup.componentBreakup.type", "STONE"] } },
          totalWeight: {
            $sum: {
              $multiply: [
                { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.weight", 0] } },
                { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.count", 1] } },
              ],
            },
          },
          totalAmount: { $sum: { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.value", 0] } } },
          totalQty: { $sum: { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.count", 1] } } },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          weight: { $round: ["$totalWeight", 2] },
          quantity: "$totalQty",
          amount: { $round: ["$totalAmount", 2] },
        },
      },
      { $sort: { amount: -1 } },
    ]);

    const stoneTotals = await SalesOrder.aggregate([
      { $match: dateMatch },
      { $unwind: "$items" },
      { $unwind: "$items.breakup.componentBreakup" },
      { $match: { "items.breakup.componentBreakup.pricingRef": "STONE" } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.value", 0] } } },
          totalQty: { $sum: { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.count", 1] } } },
          totalWeight: {
            $sum: {
              $multiply: [
                { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.weight", 0] } },
                { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.count", 1] } },
              ],
            },
          },
        },
      },
    ]);

    // ✅ FIXED: Added Stone Trend for graph
    const stoneTrend = await SalesOrder.aggregate([
        { $match: dateMatch },
        { $unwind: "$items" },
        { $unwind: "$items.breakup.componentBreakup" },
        { $match: { "items.breakup.componentBreakup.pricingRef": "STONE" } },
        {
          $group: {
            _id: groupFormat,
            totalWeight: {
              $sum: {
                $multiply: [
                  { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.weight", 0] } },
                  { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.count", 1] } },
                ],
              },
            },
            totalAmount: { $sum: { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.value", 0] } } },
            totalQty: { $sum: { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.count", 1] } } },
          },
        },
        { $sort: { _id: 1 } },
      ]);

    /* ================= MISC ANALYTICS ================= */
    const topProducts = await SalesOrder.aggregate([
      { $match: dateMatch },
      { $unwind: "$items" },
      {
        $group: {
          _id: { $ifNull: ["$items.itemSnapshot.productDetails.title", "Custom Item"] },
          sales: { $sum: { $toDouble: { $ifNull: ["$items.quantity", 1] } } },
          revenue: { $sum: { $toDouble: { $ifNull: ["$items.breakup.grandTotal", 0] } } },
        },
      },
      { $sort: { sales: -1 } },
      { $limit: 5 },
    ]);

    const categorySales = await SalesOrder.aggregate([
      { $match: dateMatch },
      { $unwind: "$items" },
      {
        $group: {
          _id: { $toUpper: { $ifNull: ["$items.itemSnapshot.productDetails.jewelleryCategory", "OTHER"] } },
          sales: { $sum: { $toDouble: { $ifNull: ["$items.quantity", 1] } } },
          revenue: { $sum: { $toDouble: { $ifNull: ["$items.breakup.subtotal", 0] } } },
        },
      },
      { $sort: { sales: -1 } },
      { $limit: 5 },
    ]);

    /* ================= METAL SALES SUMMARY (FOR DASHBOARD CARD) ================= */
    const metalSales = await SalesOrder.aggregate([
        { $match: dateMatch },
        { $unwind: "$items" },
        {
          $group: {
            _id: {
              $toUpper: {
                $ifNull: [
                  "$items.itemSnapshot.productDetails.metalType",
                  "$items.itemSnapshot.metalType",
                  "OTHER",
                ],
              },
            },
            totalWeight: {
              $sum: {
                $multiply: [
                  { $toDouble: { $ifNull: ["$items.itemSnapshot.productDetails.netWeight", "$items.itemSnapshot.netWeight", 0] } },
                  { $toDouble: { $ifNull: ["$items.quantity", 1] } },
                ],
              },
            },
            totalRevenue: { $sum: { $toDouble: { $ifNull: ["$items.breakup.metalValue", 0] } } },
          },
        },
        { $sort: { totalRevenue: -1 } },
      ]);

    /* ================= RESPONSE ================= */
    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        inventoryItems,
        avgOrderValue,
      },
      recentOrders,
      analytics: {
        topProducts,
        categorySales,
        metalTrend,
        metalPuritySales,
        metalSales, 
        diamondStats: {
          totalCarats: diamondTotals[0]?.totalCarats || 0,
          sales: diamondTotals[0]?.totalQty || 0, 
          totalAmount: diamondTotals[0]?.totalAmount || 0,
        },
        diamondDetails,
        diamondTrend,
        diamondSizeAnalysis, 
        topStones: stoneSales,
        stoneStats: {
          totalAmount: stoneTotals[0]?.totalAmount || 0,
          totalQty: stoneTotals[0]?.totalQty || 0,
          totalWeight: stoneTotals[0]?.totalWeight || 0,
          stoneTrend, // also included here for safety
        },
      },
      graphData: {
        salesGraph,
        categorySales,
        metalTrend,
        diamondTrend,
        metalPuritySales,
        metalSales, 
        stoneTrend, // ✅ Primary location for trend data
      },
    });

  } catch (err) {
    console.error("DASHBOARD ERROR 🔥", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};