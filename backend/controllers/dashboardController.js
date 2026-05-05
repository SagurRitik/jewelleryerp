

import SalesOrder from "../models/SalesOrder.js";
import Product from "../models/Product.js";

export const getDashboardStats = async (req, res) => {
  try {
    const { filter = "monthly", startDate, endDate } = req.query;


/* ================= DATE FILTER (FIXED) ================= */
let dateMatch = {};
let groupFormat = {};
const now = new Date();

if (startDate && endDate) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  dateMatch = {
    createdAt: {
      $gte: start,
      $lte: end,
    },
  };

  groupFormat = {
    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
  };

} else {

  let fromDate = new Date();

  switch (filter) {

    case "daily":
      fromDate.setDate(fromDate.getDate() - 30);
      groupFormat = {
        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
      };
      break;

    case "weekly":
      fromDate.setDate(fromDate.getDate() - 84);
      groupFormat = {
        $dateToString: { format: "%Y-%U", date: "$createdAt" },
      };
      break;

    case "yearly":
      fromDate.setFullYear(fromDate.getFullYear() - 5);
      groupFormat = {
        $dateToString: { format: "%Y", date: "$createdAt" },
      };
      break;

    case "monthly":
    default:
      fromDate.setMonth(fromDate.getMonth() - 11);
      fromDate.setDate(1);
      groupFormat = {
        $dateToString: { format: "%Y-%m", date: "$createdAt" },
      };
  }

  // ✅ IMPORTANT FIXES
  fromDate.setHours(0, 0, 0, 0);

  dateMatch = {
    createdAt: {
      $gte: fromDate,
      $lte: now, // ✅ MUST
    },
  };
}



    /* ================= TOP CARDS (NOW FILTERED) ================= */

    const totalOrders = await SalesOrder.countDocuments(dateMatch);

    const revenueAgg = await SalesOrder.aggregate([
      { $match: dateMatch },
      { $group: { _id: null, total: { $sum: "$totals.grandTotal" } } },
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    const inventoryItems = await Product.countDocuments();

    const avgOrderValue =
      totalOrders > 0
        ? Number((totalRevenue / totalOrders).toFixed(2))
        : 0;

    /* ================= RECENT ORDERS (FILTERED) ================= */

    const recentOrders = await SalesOrder.find(dateMatch)
      .sort({ createdAt: -1 })
      .limit(5)
      .select(
        "invoiceNo customer.name totals.grandTotal createdAt payment.status"
      )
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
     /* ================= METAL WEIGHT TREND ================= */
// const metalTrend = await SalesOrder.aggregate([
//   { $match: dateMatch },
//   { $unwind: "$items" },

//   {
//     $group: {
//       _id: {
//         period: groupFormat,

//         metal: {
//           $toUpper: {
//             $ifNull: [
//               "$items.itemSnapshot.productDetails.metalType",
//               "$items.itemSnapshot.metalType",
//               "OTHER",
//             ],
//           },
//         },

//         purity: {
//           $toUpper: {
//             $ifNull: [
//               "$items.itemSnapshot.productDetails.metalPurity",
//               "$items.itemSnapshot.metalPurity",
//               "NA",
//             ],
//           },
//         },
//       },

//       totalWeight: {
//         $sum: {
//           $multiply: [
//             {
//               $toDouble: {
//                 $ifNull: [
//                   "$items.itemSnapshot.productDetails.netWeight",
//                   "$items.itemSnapshot.netWeight",
//                   0,
//                 ],
//               },
//             },
//             "$items.quantity",
//           ],
//         },
//       },
//     },
//   },

//   {
//     $group: {
//       _id: "$_id.period",
//       metals: {
//         $push: {
//           metal: "$_id.metal",
//           purity: "$_id.purity",
//           weight: "$totalWeight",
//         },
//       },
//     },
//   },

//   { $sort: { _id: 1 } },
// ]);

// const metalSales = await SalesOrder.aggregate([
//   { $match: dateMatch },
//   { $unwind: "$items" },

//   {
//     $group: {
//       _id: {
//         $toUpper: {
//           $ifNull: [
//             "$items.itemSnapshot.productDetails.metalType",
//             "$items.itemSnapshot.metalType",
//             "OTHER",
//           ],
//         },
//       },

//       totalWeight: {
//         $sum: {
//           $multiply: [
//             {
//               $toDouble: {
//                 $ifNull: [
//                   "$items.itemSnapshot.productDetails.netWeight",
//                   "$items.itemSnapshot.netWeight",
//                   0,
//                 ],
//               },
//             },
//             "$items.quantity",
//           ],
//         },
//       },

//       totalRevenue: {
//         $sum: "$items.breakup.grandTotal",
//       },
//     },
//   },

//   { $sort: { totalWeight: -1 } },
// ]);






// const metalTrend = await SalesOrder.aggregate([
//   { $match: dateMatch },
//   { $unwind: "$items" },
//   {
//     $group: {
//       _id: {
//         period: groupFormat,
//         metal: {
//           $toUpper: {
//             $ifNull: [
//               "$items.itemSnapshot.productDetails.metalType",
//               "$items.itemSnapshot.metalType",
//               "OTHER",
//             ],
//           },
//         },
//         purity: {
//           $toUpper: {
//             $ifNull: [
//               "$items.itemSnapshot.productDetails.metalPurity",
//               "$items.itemSnapshot.metalPurity",
//               "NA",
//             ],
//           },
//         },
//       },
//       totalMetalValue: {
//         $sum: {
//           $toDouble: { $ifNull: ["$items.breakup.metalValue", 0] },
//         },
//       },
//       totalWeight: {
//         $sum: {
//           $multiply: [
//             {
//               $toDouble: {
//                 $ifNull: [
//                   "$items.itemSnapshot.productDetails.netWeight",
//                   "$items.itemSnapshot.netWeight",
//                   0,
//                 ],
//               },
//             },
//             "$items.quantity",
//           ],
//         },
//       },
//     },
//   },
//   {
//     $group: {
//       _id: "$_id.period",
//       metals: {
//         $push: {
//           metal: "$_id.metal",
//           purity: "$_id.purity",
//           value: "$totalMetalValue",
//           weight: "$totalWeight",
//         },
//       },
//     },
//   },
//   { $sort: { _id: 1 } },
// ]);

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
      totalMetalValue: {
        $sum: {
          $toDouble: { $ifNull: ["$items.breakup.metalValue", 0] },
        },
      },
      totalWeight: {
        $sum: {
          $multiply: [
            {
              $toDouble: {
                $ifNull: [
                  "$items.itemSnapshot.productDetails.netWeight",
                  "$items.itemSnapshot.netWeight",
                  0,
                ],
              },
            },
            "$items.quantity",
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
          value: "$totalMetalValue",
          weight: "$totalWeight",
        },
      },
    },
  },
  { $sort: { _id: 1 } },
]);


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
            {
              $toDouble: {
                $ifNull: [
                  "$items.itemSnapshot.productDetails.netWeight",
                  "$items.itemSnapshot.netWeight",
                  0,
                ],
              },
            },
            "$items.quantity",
          ],
        },
      },
      totalMetalValue: {
        $sum: {
          $toDouble: { $ifNull: ["$items.breakup.metalValue", 0] },
        },
      },
    },
  },
  { $sort: { totalMetalValue: -1 } },
]);


    /* ================= TOP PRODUCTS ================= */

    const topProducts = await SalesOrder.aggregate([
      { $match: dateMatch },
      { $unwind: "$items" },
      {
        $group: {
          _id: {
            $ifNull: [
              "$items.itemSnapshot.productDetails.title",
              "Custom Item",
            ],
          },
          sales: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.breakup.grandTotal" },
        },
      },
      { $sort: { sales: -1 } },
      { $limit: 5 },
    ]);

    /* ================= CATEGORY SALES ================= */

    const categorySales = await SalesOrder.aggregate([
      { $match: dateMatch },
      { $unwind: "$items" },
      {
        $group: {
          _id: {
            $toUpper: {
              $ifNull: [
                "$items.itemSnapshot.productDetails.jewelleryCategory",
                "OTHER",
              ],
            },
          },
          sales: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.breakup.subtotal" },
        },
      },
      { $sort: { sales: -1 } },
      { $limit: 5 },
    ]);

    /* ================= METAL SALES (WEIGHT BASED) ================= */
// const metalPuritySales = await SalesOrder.aggregate([
//   { $match: dateMatch },
//   { $unwind: "$items" },

//   {
//     $group: {
//       _id: {
//         metal: {
//           $toUpper: {
//             $ifNull: [
//               "$items.itemSnapshot.productDetails.metalType",
//               "$items.itemSnapshot.metalType",
//               "OTHER",
//             ],
//           },
//         },

//         purity: {
//           $toUpper: {
//             $ifNull: [
//               "$items.itemSnapshot.productDetails.metalPurity",
//               "$items.itemSnapshot.metalPurity",
//               "NA",
//             ],
//           },
//         },
//       },

//       totalWeight: {
//         $sum: {
//           $multiply: [
//             {
//               $toDouble: {
//                 $ifNull: [
//                   "$items.itemSnapshot.productDetails.netWeight",
//                   "$items.itemSnapshot.netWeight",
//                   0,
//                 ],
//               },
//             },
//             "$items.quantity",
//           ],
//         },
//       },

//       totalRevenue: {
//         $sum: "$items.breakup.grandTotal",
//       },

//       totalQty: {
//         $sum: "$items.quantity",
//       },
//     },
//   },

//   {
//     $project: {
//       _id: 0,
//       metal: "$_id.metal",
//       purity: "$_id.purity",
//       weight: { $round: ["$totalWeight", 2] },
//       revenue: { $round: ["$totalRevenue", 2] },
//       quantity: "$totalQty",
//     },
//   },

//   { $sort: { weight: -1 } },
// ]);

const metalBreakdown = await SalesOrder.aggregate([
  { $match: dateMatch },
  { $unwind: "$items" },
  {
    $group: {
      _id: {
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
      totalMetalValue: {
        $sum: {
          $toDouble: { $ifNull: ["$items.breakup.metalValue", 0] },
        },
      },
    },
  },
  {
    $project: {
      _id: 0,
      purity: "$_id.purity",
      metalRate: { $round: ["$_id.rate", 2] },
      totalValue: { $round: ["$totalMetalValue", 2] },
    },
  },
  { $sort: { purity: 1, metalRate: 1 } },
]);


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
        rate: {
          $toDouble: { $ifNull: ["$items.breakup.metalRate", 0] },
        },
      },
      totalWeight: {
        $sum: {
          $multiply: [
            {
              $toDouble: {
                $ifNull: [
                  "$items.itemSnapshot.productDetails.netWeight",
                  "$items.itemSnapshot.netWeight",
                  0,
                ],
              },
            },
            "$items.quantity",
          ],
        },
      },
      totalMetalValue: {
        $sum: {
          $toDouble: { $ifNull: ["$items.breakup.metalValue", 0] },
        },
      },
      totalQty: { $sum: "$items.quantity" },
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
      quantity: "$totalQty",
    },
  },
  { $sort: { metalValue: -1 } },
]);


    /* ================= DIAMOND ================= */

const diamondTrend = await SalesOrder.aggregate([
  { $match: dateMatch },
  { $unwind: "$items" },
  { $unwind: "$items.breakup.componentBreakup" },

  {
    $match: {
      "items.breakup.componentBreakup.pricingRef": "DIAMOND",
    },
  },

  {
    $group: {
      _id: groupFormat, // ✅ SAME AS GRAPH

totalCarats: {
  $sum: {
    $multiply: [
      { $toDouble: "$items.breakup.componentBreakup.weight" },
      { $toDouble: "$items.breakup.componentBreakup.count" }
    ]
  }
},

totalQty: {
  $sum: {
    $toDouble: "$items.breakup.componentBreakup.count"
  }
},

totalAmount: {
  $sum: {
    $toDouble: "$items.breakup.componentBreakup.value"
  }
},
    },
  },

  { $sort: { _id: 1 } },
]);


    const diamondRaw = await SalesOrder.aggregate([
      { $match: dateMatch },
      { $unwind: "$items" },
      { $unwind: "$items.breakup.componentBreakup" },
      {
        $match: {
          "items.breakup.componentBreakup.pricingRef": "DIAMOND",
        },
      },
      {
        $group: {
          _id: "Diamond",
totalCarats: {
  $sum: {
    $multiply: [
      { $toDouble: "$items.breakup.componentBreakup.weight" },
      { $toDouble: "$items.breakup.componentBreakup.count" }
    ]
  }
},

sales: {
  $sum: {
    $toDouble: "$items.breakup.componentBreakup.count"
  }
},

totalAmount: {
  $sum: {
    $toDouble: "$items.breakup.componentBreakup.value"
  }
},
        },
      },
    ]);

    const diamondDetails = await SalesOrder.aggregate([
  { $match: dateMatch },
  { $unwind: "$items" },
  { $unwind: "$items.breakup.componentBreakup" },

  {
    $match: {
      "items.breakup.componentBreakup.pricingRef": "DIAMOND",
    },
  },
{
  $group: {
    _id: {
      type: {
        $toUpper: {
          $ifNull: [
            "$items.breakup.componentBreakup.type",
            "$items.itemSnapshot.productDetails.diamondType",
            "DIAMOND",
          ],
        },
      },
    },

totalCarats: {
  $sum: {
    $multiply: [
      { $toDouble: "$items.breakup.componentBreakup.weight" },
      { $toDouble: "$items.breakup.componentBreakup.count" }
    ]
  }
},

totalAmount: {
  $sum: {
    $toDouble: "$items.breakup.componentBreakup.value"
  }
},

totalQty: {
  $sum: {
    $toDouble: "$items.breakup.componentBreakup.count"
  }
},

avgRate: {
  $avg: {
    $toDouble: "$items.breakup.componentBreakup.rate"
  }
},
  },
},

  {
  $project: {
    _id: 0,
    type: "$_id.type",

    carats: { $round: ["$totalCarats", 2] },
    quantity: "$totalQty",
    amount: { $round: ["$totalAmount", 2] },

    // ✅ Weighted Rate (Revenue based)
    weightedRate: {
      $cond: [
        { $gt: ["$totalCarats", 0] },
        { $round: [{ $divide: ["$totalAmount", "$totalCarats"] }, 2] },
        0,
      ],
    },

    // ✅ Actual Avg Rate (IMPORTANT)
    avgRate: { $round: ["$avgRate", 2] },
  },
},

  { $sort: { carats: -1 } },
]);

    const diamondStats =
      diamondRaw[0] || { totalCarats: 0, sales: 0 , totalAmount: 0 };

const diamondSizeAnalysis = await SalesOrder.aggregate([
  { $match: dateMatch },
  { $unwind: "$items" },
  { $unwind: "$items.breakup.componentBreakup" },

  {
    $match: {
      "items.breakup.componentBreakup.pricingRef": "DIAMOND",
    },
  },

  {
    $addFields: {
      // 👉 per piece weight (range ke liye)
      unitWeight: {
        $toDouble: {
          $ifNull: ["$items.breakup.componentBreakup.weight", 0],
        },
      },

      // 👉 total weight (calculation ke liye)
      weight: {
        $multiply: [
          {
            $toDouble: {
              $ifNull: ["$items.breakup.componentBreakup.weight", 0],
            },
          },
          {
            $toDouble: {
              $ifNull: ["$items.breakup.componentBreakup.count", 0],
            },
          },
        ],
      },

      value: {
  $toDouble: {
    $ifNull: ["$items.breakup.componentBreakup.value", 0],
  },
},

      rate: {
        $toDouble: {
          $ifNull: ["$items.breakup.componentBreakup.rate", 0],
        },
      },

      qty: {
        $toDouble: {
          $ifNull: ["$items.breakup.componentBreakup.count", 0],
        },
      },
    },
  },

  //  GROUP BY SIZE RANGE (BASED ON UNIT WEIGHT)
  {
  $group: {
    _id: {
      $switch: {
        branches: [
          { case: { $lt: ["$unitWeight", 0.5] }, then: "0 - 0.50 ct" },
          { case: { $lt: ["$unitWeight", 1] }, then: "0.50 - 1.00 ct" },
          { case: { $lt: ["$unitWeight", 1.5] }, then: "1.00 - 1.50 ct" },
          { case: { $lt: ["$unitWeight", 2] }, then: "1.50 - 2.00 ct" },
        ],
        default: "2.00+ ct",
      },
    },

    totalCarats: { $sum: "$weight" },
    totalAmount: { $sum: "$value" },
    totalQty: { $sum: "$qty" },
    avgRate: { $avg: "$rate" },
  },
},

  // ✅ CLEAN OUTPUT
  {
    $project: {
      _id: 0,
      range: "$_id",
      carats: { $round: ["$totalCarats", 2] },
      quantity: "$totalQty",
      amount: { $round: ["$totalAmount", 2] },
      avgRate: { $round: ["$avgRate", 2] },
    },
  },

  // ✅ SORT ORDER FIX (IMPORTANT)
  {
  $addFields: {
    sortOrder: {
      $switch: {
        branches: [
          { case: { $eq: ["$range", "0 - 0.50 ct"] }, then: 1 },
          { case: { $eq: ["$range", "0.50 - 1.00 ct"] }, then: 2 },
          { case: { $eq: ["$range", "1.00 - 1.50 ct"] }, then: 3 },
          { case: { $eq: ["$range", "1.50 - 2.00 ct"] }, then: 4 },
        ],
        default: 5,
      },
    },
  },
},
{ $sort: { sortOrder: 1 } },
{ $project: { sortOrder: 0 } },

  // { $sort: { sortOrder: 1 } },

  // { $project: { sortOrder: 0 } },
]);



    /* ================= STONES ================= */

    // const stoneSales = await SalesOrder.aggregate([
    //   { $match: dateMatch },
    //   { $unwind: "$items" },
    //   { $unwind: "$items.breakup.componentBreakup" },
    //   {
    //     $match: {
    //       "items.breakup.componentBreakup.pricingRef": "STONE",
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$items.breakup.componentBreakup.type",
    //       totalWeight: {
    //         $sum: "$items.breakup.componentBreakup.weight",
    //       },
    //       sales: {
    //         $sum: "$items.breakup.componentBreakup.count",
    //       },
    //     },
    //   },
    //   { $sort: { sales: -1 } },
    //   { $limit: 5 },
    // ]);


//     const stoneSales = await SalesOrder.aggregate([
//   { $match: dateMatch },
//   { $unwind: "$items" },
//   { $unwind: "$items.breakup.componentBreakup" },

//   {
//     $match: {
//       "items.breakup.componentBreakup.pricingRef": "STONE",
//     },
//   },

//   {
//     $addFields: {
//       weight: {
//         $multiply: [
//           {
//             $toDouble: {
//               $ifNull: ["$items.breakup.componentBreakup.weight", 0],
//             },
//           },
//           {
//             $toDouble: {
//               $ifNull: ["$items.breakup.componentBreakup.count", 0],
//             },
//           },
//         ],
//       },

//       value: {
//         $toDouble: {
//           $ifNull: ["$items.breakup.componentBreakup.value", 0],
//         },
//       },

//       qty: {
//         $toDouble: {
//           $ifNull: ["$items.breakup.componentBreakup.count", 0],
//         },
//       },

//       type: {
//         $toUpper: {
//           $ifNull: [
//             "$items.breakup.componentBreakup.type",
//             "UNKNOWN",
//           ],
//         },
//       },
//     },
//   },

//   {
//     $group: {
//       _id: "$type",

//       totalWeight: { $sum: "$weight" },
//       totalQty: { $sum: "$qty" },
//       totalAmount: { $sum: "$value" },
//     },
//   },

//   {
//     $project: {
//       _id: 0,
//       type: "$_id",
//       weight: { $round: ["$totalWeight", 2] },
//       quantity: "$totalQty",
//       amount: { $round: ["$totalAmount", 2] },
//     },
//   },

//   { $sort: { weight: -1 } },
// ]);

const stoneSales = await SalesOrder.aggregate([
  { $match: dateMatch },

  { $unwind: "$items" },
  {
    $unwind: {
      path: "$items.breakup.componentBreakup",
      preserveNullAndEmptyArrays: false,
    },
  },

  {
    $match: {
      "items.breakup.componentBreakup.pricingRef": "STONE",
    },
  },

  {
    $addFields: {
      weight: {
        $multiply: [
          {
            $toDouble: {
              $ifNull: ["$items.breakup.componentBreakup.weight", 0],
            },
          },
          {
            $toDouble: {
              $ifNull: ["$items.breakup.componentBreakup.count", 0],
            },
          },
        ],
      },

      value: {
        $toDouble: {
          $ifNull: ["$items.breakup.componentBreakup.value", 0],
        },
      },

      qty: {
        $toDouble: {
          $ifNull: ["$items.breakup.componentBreakup.count", 0],
        },
      },

      type: {
        $toUpper: {
          $trim: {
            input: {
              $ifNull: [
                "$items.breakup.componentBreakup.type",
                "UNKNOWN",
              ],
            },
          },
        },
      },
    },
  },

  {
    $group: {
      _id: "$type",
      totalWeight: { $sum: "$weight" },
      totalQty: { $sum: "$qty" },
      totalAmount: { $sum: "$value" },
    },
  },

  // ✅ REMOVE ZERO / INVALID TYPES
  {
    $match: {
      totalQty: { $gt: 0 },
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

  { $sort: { amount: -1 } }, // ✅ better than weight
]);


const stoneTotals = await SalesOrder.aggregate([
  { $match: dateMatch },

  { $unwind: "$items" },
  { $unwind: "$items.breakup.componentBreakup" },

  {
    $match: {
      "items.breakup.componentBreakup.pricingRef": "STONE",
    },
  },

  // ✅ UNIQUE IDENTIFIER (VERY IMPORTANT)
  {
    $group: {
      _id: {
        order: "$_id",
        itemId: "$items._id",
        type: "$items.breakup.componentBreakup.type",
        value: "$items.breakup.componentBreakup.value",
      },

      value: { $first: "$items.breakup.componentBreakup.value" },
      qty: { $first: "$items.breakup.componentBreakup.count" },
      weight: { $first: "$items.breakup.componentBreakup.weight" },
    },
  },

  // ✅ NOW SUM CORRECTLY (NO DUPLICATES)
  {
    $group: {
      _id: null,
      totalAmount: {
        $sum: { $toDouble: "$value" },
      },
      totalQty: {
        $sum: { $toDouble: "$qty" },
      },
      totalWeight: {
        $sum: {
          $multiply: [
            { $toDouble: "$weight" },
            { $toDouble: "$qty" },
          ],
        },
      },
    },
  },
]);

// ─── ADD THIS AGGREGATION to getDashboardStats, just before the RESPONSE section ───
// Place it after the existing stoneTotals aggregation

const stoneTrend = await SalesOrder.aggregate([
  { $match: dateMatch },
  { $unwind: "$items" },
  {
    $unwind: {
      path: "$items.breakup.componentBreakup",
      preserveNullAndEmptyArrays: false,
    },
  },
  {
    $match: {
      "items.breakup.componentBreakup.pricingRef": "STONE",
    },
  },
  {
    $group: {
      _id: groupFormat, // same period grouping as salesGraph
      totalAmount: {
        $sum: { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.value", 0] } },
      },
      totalQty: {
        $sum: { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.count", 0] } },
      },
      totalWeight: {
        $sum: {
          $multiply: [
            { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.weight", 0] } },
            { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.count", 0] } },
          ],
        },
      },
    },
  },
  { $sort: { _id: 1 } },
]);

// ─── Then in your res.json(), add stoneTrend to graphData: ───
// graphData: {
//   salesGraph,
//   categorySales,
//   metalTrend,
//   diamondTrend,
//   metalPuritySales,
//   stoneTrend,       // ← ADD THIS
// },


    /* ================= RESPONSE ================= */

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        inventoryItems,
        avgOrderValue,
         stoneTrend,
      },
      recentOrders,
      analytics: {
        topProducts,
        categorySales,
        metalSales,
        diamondStats,
        diamondDetails,
        diamondTrend,
        diamondSizeAnalysis,
        metalTrend,
        topStones: stoneSales,
        metalPuritySales,
           stoneStats: {
      totalAmount: stoneTotals[0]?.totalAmount || 0,
      totalQty: stoneTotals[0]?.totalQty || 0,
      totalWeight: stoneTotals[0]?.totalWeight || 0,
       stoneTrend,
    },
      },
      graphData: {
        salesGraph,
        categorySales,
        metalTrend,
        diamondTrend,
        metalPuritySales,
        stoneTrend,
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
 
//=======================================================================================================




// import SalesOrder from "../models/SalesOrder.js";
// import Product from "../models/Product.js";

// export const getDashboardStats = async (req, res) => {
//   try {
//     const { filter = "monthly", startDate, endDate } = req.query;

//     /* ================= DATE FILTER ================= */
//     let dateMatch = {};
//     let groupFormat = {};
//     const now = new Date();

//     if (startDate && endDate) {
//       const start = new Date(startDate);
//       start.setHours(0, 0, 0, 0);

//       const end = new Date(endDate);
//       end.setHours(23, 59, 59, 999);

//       dateMatch = {
//         createdAt: {
//           $gte: start,
//           $lte: end,
//         },
//       };

//       groupFormat = {
//         $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
//       };
//     } else {
//       let fromDate = new Date();

//       switch (filter) {
//         case "daily":
//           fromDate.setDate(fromDate.getDate() - 30);
//           groupFormat = {
//             $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
//           };
//           break;

//         case "weekly":
//           fromDate.setDate(fromDate.getDate() - 84);
//           groupFormat = {
//             $dateToString: { format: "%Y-%U", date: "$createdAt" },
//           };
//           break;

//         case "yearly":
//           fromDate.setFullYear(fromDate.getFullYear() - 5);
//           groupFormat = {
//             $dateToString: { format: "%Y", date: "$createdAt" },
//           };
//           break;

//         case "monthly":
//         default:
//           fromDate.setMonth(fromDate.getMonth() - 11);
//           fromDate.setDate(1);
//           groupFormat = {
//             $dateToString: { format: "%Y-%m", date: "$createdAt" },
//           };
//       }

//       fromDate.setHours(0, 0, 0, 0);

//       dateMatch = {
//         createdAt: {
//           $gte: fromDate,
//           $lte: now,
//         },
//       };
//     }

//     /* ================= TOP CARDS ================= */
//     const totalOrders = await SalesOrder.countDocuments(dateMatch);

//     const revenueAgg = await SalesOrder.aggregate([
//       { $match: dateMatch },
//       { $group: { _id: null, total: { $sum: "$totals.grandTotal" } } },
//     ]);

//     const totalRevenue = revenueAgg[0]?.total || 0;
//     const inventoryItems = await Product.countDocuments();
//     const avgOrderValue = totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0;

//     /* ================= RECENT ORDERS ================= */
//     const recentOrders = await SalesOrder.find(dateMatch)
//       .sort({ createdAt: -1 })
//       .limit(5)
//       .select("invoiceNo customer.name totals.grandTotal createdAt payment.status")
//       .lean();

//     /* ================= SALES GRAPH ================= */
//     const salesGraph = await SalesOrder.aggregate([
//       { $match: dateMatch },
//       {
//         $group: {
//           _id: groupFormat,
//           revenue: { $sum: "$totals.grandTotal" },
//           orders: { $sum: 1 },
//         },
//       },
//       { $sort: { _id: 1 } },
//     ]);

//     /* ================= METAL WEIGHT TREND ================= */
//     const metalTrend = await SalesOrder.aggregate([
//       { $match: dateMatch },
//       { $unwind: { path: "$items", preserveNullAndEmptyArrays: false } },
//       {
//         $group: {
//           _id: {
//             period: groupFormat,
//             metal: {
//               $toUpper: {
//                 $ifNull: [
//                   "$items.itemSnapshot.productDetails.metalType",
//                   "$items.itemSnapshot.metalType",
//                   "OTHER",
//                 ],
//               },
//             },
//             purity: {
//               $toUpper: {
//                 $ifNull: [
//                   "$items.itemSnapshot.productDetails.metalPurity",
//                   "$items.itemSnapshot.metalPurity",
//                   "NA",
//                 ],
//               },
//             },
//           },
//           totalWeight: {
//             $sum: {
//               $multiply: [
//                 {
//                   $toDouble: {
//                     $ifNull: [
//                       "$items.itemSnapshot.productDetails.netWeight",
//                       "$items.itemSnapshot.netWeight",
//                       0,
//                     ],
//                   },
//                 },
//                 { $toDouble: { $ifNull: ["$items.quantity", 1] } },
//               ],
//             },
//           },
//         },
//       },
//       {
//         $group: {
//           _id: "$_id.period",
//           metals: {
//             $push: {
//               metal: "$_id.metal",
//               purity: "$_id.purity",
//               weight: "$totalWeight",
//             },
//           },
//         },
//       },
//       { $sort: { _id: 1 } },
//     ]);

//     const metalSales = await SalesOrder.aggregate([
//       { $match: dateMatch },
//       { $unwind: { path: "$items", preserveNullAndEmptyArrays: false } },
//       {
//         $group: {
//           _id: {
//             $toUpper: {
//               $ifNull: [
//                 "$items.itemSnapshot.productDetails.metalType",
//                 "$items.itemSnapshot.metalType",
//                 "OTHER",
//               ],
//             },
//           },
//           totalWeight: {
//             $sum: {
//               $multiply: [
//                 {
//                   $toDouble: {
//                     $ifNull: [
//                       "$items.itemSnapshot.productDetails.netWeight",
//                       "$items.itemSnapshot.netWeight",
//                       0,
//                     ],
//                   },
//                 },
//                 { $toDouble: { $ifNull: ["$items.quantity", 1] } },
//               ],
//             },
//           },
//           totalRevenue: { $sum: { $toDouble: "$items.breakup.grandTotal" } },
//         },
//       },
//       { $sort: { totalWeight: -1 } },
//     ]);

//     /* ================= TOP PRODUCTS ================= */
//     const topProducts = await SalesOrder.aggregate([
//       { $match: dateMatch },
//       { $unwind: { path: "$items", preserveNullAndEmptyArrays: false } },
//       {
//         $group: {
//           _id: {
//             $ifNull: ["$items.itemSnapshot.productDetails.title", "Custom Item"],
//           },
//           sales: { $sum: { $toDouble: { $ifNull: ["$items.quantity", 1] } } },
//           revenue: { $sum: { $toDouble: "$items.breakup.grandTotal" } },
//         },
//       },
//       { $sort: { sales: -1 } },
//       { $limit: 5 },
//     ]);

//     /* ================= CATEGORY SALES ================= */
//     const categorySales = await SalesOrder.aggregate([
//       { $match: dateMatch },
//       { $unwind: { path: "$items", preserveNullAndEmptyArrays: false } },
//       {
//         $group: {
//           _id: {
//             $toUpper: {
//               $ifNull: [
//                 "$items.itemSnapshot.productDetails.jewelleryCategory",
//                 "OTHER",
//               ],
//             },
//           },
//           sales: { $sum: { $toDouble: { $ifNull: ["$items.quantity", 1] } } },
//           revenue: { $sum: { $toDouble: "$items.breakup.subtotal" } },
//         },
//       },
//       { $sort: { sales: -1 } },
//       { $limit: 5 },
//     ]);

//     /* ================= METAL SALES (WEIGHT BASED) ================= */
//     const metalPuritySales = await SalesOrder.aggregate([
//       { $match: dateMatch },
//       { $unwind: { path: "$items", preserveNullAndEmptyArrays: false } },
//       {
//         $group: {
//           _id: {
//             metal: {
//               $toUpper: {
//                 $ifNull: [
//                   "$items.itemSnapshot.productDetails.metalType",
//                   "$items.itemSnapshot.metalType",
//                   "OTHER",
//                 ],
//               },
//             },
//             purity: {
//               $toUpper: {
//                 $ifNull: [
//                   "$items.itemSnapshot.productDetails.metalPurity",
//                   "$items.itemSnapshot.metalPurity",
//                   "NA",
//                 ],
//               },
//             },
//           },
//           totalWeight: {
//             $sum: {
//               $multiply: [
//                 {
//                   $toDouble: {
//                     $ifNull: [
//                       "$items.itemSnapshot.productDetails.netWeight",
//                       "$items.itemSnapshot.netWeight",
//                       0,
//                     ],
//                   },
//                 },
//                 { $toDouble: { $ifNull: ["$items.quantity", 1] } },
//               ],
//             },
//           },
//           totalRevenue: { $sum: { $toDouble: "$items.breakup.grandTotal" } },
//           totalQty: { $sum: { $toDouble: { $ifNull: ["$items.quantity", 1] } } },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           metal: "$_id.metal",
//           purity: "$_id.purity",
//           weight: { $round: ["$totalWeight", 2] },
//           revenue: { $round: ["$totalRevenue", 2] },
//           quantity: "$totalQty",
//         },
//       },
//       { $sort: { weight: -1 } },
//     ]);

//     /* ================= DIAMOND ================= */
//     const diamondTrend = await SalesOrder.aggregate([
//       { $match: dateMatch },
//       { $unwind: { path: "$items", preserveNullAndEmptyArrays: false } },
//       { $unwind: { path: "$items.breakup.componentBreakup", preserveNullAndEmptyArrays: false } },
//       { $match: { "items.breakup.componentBreakup.pricingRef": "DIAMOND" } },
//       {
//         $group: {
//           _id: groupFormat,
//           // FIX: weight is already total weight, DO NOT multiply by count
//           totalCarats: { $sum: { $toDouble: "$items.breakup.componentBreakup.weight" } },
//           totalQty: { $sum: { $toDouble: "$items.breakup.componentBreakup.count" } },
//           totalAmount: { $sum: { $toDouble: "$items.breakup.componentBreakup.value" } },
//         },
//       },
//       { $sort: { _id: 1 } },
//     ]);

//     const diamondRaw = await SalesOrder.aggregate([
//       { $match: dateMatch },
//       { $unwind: { path: "$items", preserveNullAndEmptyArrays: false } },
//       { $unwind: { path: "$items.breakup.componentBreakup", preserveNullAndEmptyArrays: false } },
//       { $match: { "items.breakup.componentBreakup.pricingRef": "DIAMOND" } },
//       {
//         $group: {
//           _id: "Diamond",
//           // FIX: weight is already total weight
//           totalCarats: { $sum: { $toDouble: "$items.breakup.componentBreakup.weight" } },
//           sales: { $sum: { $toDouble: "$items.breakup.componentBreakup.count" } },
//           totalAmount: { $sum: { $toDouble: "$items.breakup.componentBreakup.value" } },
//         },
//       },
//     ]);

//     const diamondDetails = await SalesOrder.aggregate([
//       { $match: dateMatch },
//       { $unwind: { path: "$items", preserveNullAndEmptyArrays: false } },
//       { $unwind: { path: "$items.breakup.componentBreakup", preserveNullAndEmptyArrays: false } },
//       { $match: { "items.breakup.componentBreakup.pricingRef": "DIAMOND" } },
//       {
//         $group: {
//           _id: {
//             type: {
//               $toUpper: {
//                 $ifNull: [
//                   "$items.breakup.componentBreakup.type",
//                   "$items.itemSnapshot.productDetails.diamondType",
//                   "DIAMOND",
//                 ],
//               },
//             },
//           },
//           // FIX: weight is already total weight
//           totalCarats: { $sum: { $toDouble: "$items.breakup.componentBreakup.weight" } },
//           totalAmount: { $sum: { $toDouble: "$items.breakup.componentBreakup.value" } },
//           totalQty: { $sum: { $toDouble: "$items.breakup.componentBreakup.count" } },
//           avgRate: { $avg: { $toDouble: "$items.breakup.componentBreakup.rate" } },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           type: "$_id.type",
//           carats: { $round: ["$totalCarats", 2] },
//           quantity: "$totalQty",
//           amount: { $round: ["$totalAmount", 2] },
//           weightedRate: {
//             $cond: [
//               { $gt: ["$totalCarats", 0] },
//               { $round: [{ $divide: ["$totalAmount", "$totalCarats"] }, 2] },
//               0,
//             ],
//           },
//           avgRate: { $round: ["$avgRate", 2] },
//         },
//       },
//       { $sort: { carats: -1 } },
//     ]);

//     const diamondStats = diamondRaw[0] || { totalCarats: 0, sales: 0, totalAmount: 0 };

//     const diamondSizeAnalysis = await SalesOrder.aggregate([
//       { $match: dateMatch },
//       { $unwind: { path: "$items", preserveNullAndEmptyArrays: false } },
//       { $unwind: { path: "$items.breakup.componentBreakup", preserveNullAndEmptyArrays: false } },
//       { $match: { "items.breakup.componentBreakup.pricingRef": "DIAMOND" } },
//       {
//         $addFields: {
//           // FIX: Unit weight is total weight / pieces
//           unitWeight: {
//             $cond: [
//               { $gt: [{ $toDouble: { $ifNull: ["$items.breakup.componentBreakup.count", 0] } }, 0] },
//               { $divide: [
//                   { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.weight", 0] } },
//                   { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.count", 0] } }
//               ]},
//               { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.weight", 0] } }
//             ]
//           },
//           weight: { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.weight", 0] } },
//           value: { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.value", 0] } },
//           rate: { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.rate", 0] } },
//           qty: { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.count", 0] } },
//         },
//       },
//       {
//         $group: {
//           _id: {
//             $switch: {
//               branches: [
//                 { case: { $lt: ["$unitWeight", 0.5] }, then: "0 - 0.50 ct" },
//                 { case: { $lt: ["$unitWeight", 1] }, then: "0.50 - 1.00 ct" },
//                 { case: { $lt: ["$unitWeight", 1.5] }, then: "1.00 - 1.50 ct" },
//                 { case: { $lt: ["$unitWeight", 2] }, then: "1.50 - 2.00 ct" },
//               ],
//               default: "2.00+ ct",
//             },
//           },
//           totalCarats: { $sum: "$weight" },
//           totalAmount: { $sum: "$value" },
//           totalQty: { $sum: "$qty" },
//           avgRate: { $avg: "$rate" },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           range: "$_id",
//           carats: { $round: ["$totalCarats", 2] },
//           quantity: "$totalQty",
//           amount: { $round: ["$totalAmount", 2] },
//           avgRate: { $round: ["$avgRate", 2] },
//         },
//       },
//       {
//         $addFields: {
//           sortOrder: {
//             $switch: {
//               branches: [
//                 { case: { $eq: ["$range", "0 - 0.50 ct"] }, then: 1 },
//                 { case: { $eq: ["$range", "0.50 - 1.00 ct"] }, then: 2 },
//                 { case: { $eq: ["$range", "1.00 - 1.50 ct"] }, then: 3 },
//                 { case: { $eq: ["$range", "1.50 - 2.00 ct"] }, then: 4 },
//               ],
//               default: 5,
//             },
//           },
//         },
//       },
//       { $sort: { sortOrder: 1 } },
//       { $project: { sortOrder: 0 } },
//     ]);

//     /* ================= STONES ================= */
//     const stoneSales = await SalesOrder.aggregate([
//       { $match: dateMatch },
//       { $unwind: { path: "$items", preserveNullAndEmptyArrays: false } },
//       { $unwind: { path: "$items.breakup.componentBreakup", preserveNullAndEmptyArrays: false } },
//       { $match: { "items.breakup.componentBreakup.pricingRef": "STONE" } },
//       {
//         $addFields: {
//           // FIX: Weight is already total weight
//           weight: { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.weight", 0] } },
//           value: { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.value", 0] } },
//           qty: { $toDouble: { $ifNull: ["$items.breakup.componentBreakup.count", 0] } },
//           type: {
//             $toUpper: {
//               $trim: {
//                 input: { $ifNull: ["$items.breakup.componentBreakup.type", "UNKNOWN"] },
//               },
//             },
//           },
//         },
//       },
//       {
//         $group: {
//           _id: "$type",
//           totalWeight: { $sum: "$weight" },
//           totalQty: { $sum: "$qty" },
//           totalAmount: { $sum: "$value" },
//         },
//       },
//       { $match: { totalQty: { $gt: 0 } } },
//       {
//         $project: {
//           _id: 0,
//           type: "$_id",
//           weight: { $round: ["$totalWeight", 2] },
//           quantity: "$totalQty",
//           amount: { $round: ["$totalAmount", 2] },
//         },
//       },
//       { $sort: { amount: -1 } },
//     ]);

//     const stoneTotals = await SalesOrder.aggregate([
//       { $match: dateMatch },
//       { $unwind: { path: "$items", preserveNullAndEmptyArrays: false } },
//       { $unwind: { path: "$items.breakup.componentBreakup", preserveNullAndEmptyArrays: false } },
//       { $match: { "items.breakup.componentBreakup.pricingRef": "STONE" } },
//       // FIX: Removed the unsafe UNIQUE IDENTIFIER group which dropped duplicate stone lines on same invoice
//       {
//         $group: {
//           _id: null,
//           totalAmount: { $sum: { $toDouble: "$items.breakup.componentBreakup.value" } },
//           totalQty: { $sum: { $toDouble: "$items.breakup.componentBreakup.count" } },
//           totalWeight: { $sum: { $toDouble: "$items.breakup.componentBreakup.weight" } },
//         },
//       },
//     ]);

//     /* ================= RESPONSE ================= */
//     res.json({
//       success: true,
//       stats: {
//         totalRevenue,
//         totalOrders,
//         inventoryItems,
//         avgOrderValue,
//       },
//       recentOrders,
//       analytics: {
//         topProducts,
//         categorySales,
//         metalSales,
//         diamondStats,
//         diamondDetails,
//         diamondTrend,
//         diamondSizeAnalysis,
//         metalTrend,
//         topStones: stoneSales,
//         metalPuritySales,
//         stoneStats: {
//           totalAmount: stoneTotals[0]?.totalAmount || 0,
//           totalQty: stoneTotals[0]?.totalQty || 0,
//           totalWeight: stoneTotals[0]?.totalWeight || 0,
//         },
//       },
//       graphData: {
//         salesGraph,
//         categorySales,
//         metalTrend,
//         diamondTrend,
//         metalPuritySales,
//       },
//     });
//   } catch (err) {
//     console.error("DASHBOARD ERROR 🔥", err);
//     res.status(500).json({
//       success: false,
//       error: err.message,
//     });
//   }
// };