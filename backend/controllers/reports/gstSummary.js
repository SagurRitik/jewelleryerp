

// import SalesOrder from "../../models/SalesOrder.js";

// /* ================= GST SUMMARY ================= */

// export const getGSTSummary = async (req, res) => {
//   try {
//     const { from, to } = req.query;

//     const match = {};

//     if (from && to) {
//       match.createdAt = {
//         $gte: new Date(from),
//         $lte: new Date(to),
//       };
//     }

//     const result = await SalesOrder.aggregate([
//       { $match: match },

//       {
//         $group: {
//           _id: null,

//           totalGST: {
//             $sum: { $ifNull: ["$totals.gst", 0] },
//           },

//           totalSales: {
//             $sum: { $ifNull: ["$totals.grandTotal", 0] },
//           },

//           totalSubtotal: {
//             $sum: { $ifNull: ["$totals.subtotal", 0] },
//           },

//           totalInvoices: {
//             $sum: 1,
//           },

//           totalDiscount: {
//             $sum: { $ifNull: ["$totals.discount", 0] },
//           },
//         },
//       },

//       // ✅ ROUNDING FIX
//       {
//         $project: {
//           _id: 0,
//           totalGST: { $round: ["$totalGST", 2] },
//           totalSales: { $round: ["$totalSales", 2] },
//           totalSubtotal: { $round: ["$totalSubtotal", 2] },
//           totalInvoices: 1,
//           totalDiscount: { $round: ["$totalDiscount", 2] },
//         },
//       },
//     ]);

//     return res.json({
//       success: true,
//       data: result[0] || {},
//     });

//   } catch (error) {
//     console.error("GST SUMMARY ERROR:", error);
//     return res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// };


// /* ================= JEWELLERY SUMMARY ================= */

// export const getJewellerySummary = async (req, res) => {
//   try {
//     const result = await SalesOrder.aggregate([
//       { $unwind: "$items" },

//       {
//         $group: {
//           _id: null,

//           /* ================= 💎 DIAMOND ================= */

//           // totalDiamondValue: {
//           //   $sum: { $ifNull: ["$items.breakup.diamondValue", 0] },
//           // },

//           // totalDiamondWeight: {
//           //   $sum: {
//           //     $multiply: [
//           //       {
//           //         $sum: {
//           //           $map: {
//           //             input: "$items.breakup.componentBreakup",
//           //             as: "c",
//           //             in: {
//           //               $cond: [
//           //                 { $eq: ["$$c.type", "Diamond"] },
//           //                 { $ifNull: ["$$c.weight", 0] },
//           //                 0,
//           //               ],
//           //             },
//           //           },
//           //         },
//           //       },
//           //       { $ifNull: ["$items.quantity", 1] },
//           //     ],
//           //   },
//           // },

//           // totalDiamondQty: {
//           //   $sum: {
//           //     $multiply: [
//           //       {
//           //         $sum: {
//           //           $map: {
//           //             input: "$items.breakup.componentBreakup",
//           //             as: "c",
//           //             in: {
//           //               $cond: [
//           //                 { $eq: ["$$c.type", "Diamond"] },
//           //                 { $ifNull: ["$$c.count", 0] },
//           //                 0,
//           //               ],
//           //             },
//           //           },
//           //         },
//           //       },
//           //       { $ifNull: ["$items.quantity", 1] },
//           //     ],
//           //   },
//           // },


// /* ================= 💎 DIAMOND ================= */
//           // Multiply item-level diamond value by quantity
//           totalDiamondValue: {
//             $sum: { 
//               $multiply: [
//                 { $convert: { input: { $ifNull: ["$items.breakup.diamondValue", 0] }, to: "double" } },
//                 { $ifNull: ["$items.quantity", 1] }
//               ]
//             },
//           },

//           totalDiamondWeight: {
//             $sum: {
//               $multiply: [
//                 {
//                   $sum: {
//                     $map: {
//                       input: { $ifNull: ["$items.breakup.componentBreakup", []] },
//                       as: "c",
//                       in: {
//                         $cond: [
//                           { $eq: ["$$c.type", "Diamond"] },
//                           { $convert: { input: { $ifNull: ["$$c.weight", 0] }, to: "double" } },
//                           0,
//                         ],
//                       },
//                     },
//                   },
//                 },
//                 { $ifNull: ["$items.quantity", 1] },
//               ],
//             },
//           },

//           totalDiamondQty: {
//             $sum: {
//               $multiply: [
//                 {
//                   $sum: {
//                     $map: {
//                       input: { $ifNull: ["$items.breakup.componentBreakup", []] },
//                       as: "c",
//                       in: {
//                         $cond: [
//                           { $eq: ["$$c.type", "Diamond"] },
//                           { $ifNull: ["$$c.count", 0] },
//                           0,
//                         ],
//                       },
//                     },
//                   },
//                 },
//                 { $ifNull: ["$items.quantity", 1] },
//               ],
//             },
//           },


//           /* ================= 💠 STONE ================= */

//           totalStoneValue: {
//             $sum: { $ifNull: ["$items.breakup.stoneValue", 0] },
//           },

//           totalStoneWeight: {
//             $sum: {
//               $multiply: [
//                 {
//                   $sum: {
//                     $map: {
//                       input: "$items.breakup.componentBreakup",
//                       as: "c",
//                       in: {
//                         $cond: [
//                           { $eq: ["$$c.pricingRef", "STONE"] },
//                           { $ifNull: ["$$c.weight", 0] },
//                           0,
//                         ],
//                       },
//                     },
//                   },
//                 },
//                 { $ifNull: ["$items.quantity", 1] },
//               ],
//             },
//           },

//           totalStoneQty: {
//             $sum: {
//               $multiply: [
//                 {
//                   $sum: {
//                     $map: {
//                       input: "$items.breakup.componentBreakup",
//                       as: "c",
//                       in: {
//                         $cond: [
//                           { $eq: ["$$c.pricingRef", "STONE"] },
//                           { $ifNull: ["$$c.count", 0] },
//                           0,
//                         ],
//                       },
//                     },
//                   },
//                 },
//                 { $ifNull: ["$items.quantity", 1] },
//               ],
//             },
//           },

//           /* ================= 🪙 METAL ================= */

//           totalMetalValue: {
//             $sum: { $ifNull: ["$items.breakup.metalValue", 0] },
//           },

//           totalMetalWeight: {
//             $sum: {
//               $multiply: [
//                 { $ifNull: ["$items.breakup.netWeight", 0] },
//                 { $ifNull: ["$items.quantity", 1] },
//               ],
//             },
//           },

//           /* ================= 🛠 MAKING ================= */
//           totalMakingCharge: {
//   $sum: {
//     $toDouble: {
//       $ifNull: ["$items.breakup.makingCharge", 0],
//     },
//   },
// },
//         },
//       },

//       // ✅ ROUNDING FIX (CRITICAL)
//       {
//         $project: {
//           _id: 0,

//           totalDiamondValue: { $round: ["$totalDiamondValue", 2] },
//           totalDiamondWeight: { $round: ["$totalDiamondWeight", 2] },
//           totalDiamondQty: 1,

//           totalStoneValue: { $round: ["$totalStoneValue", 2] },
//           totalStoneWeight: { $round: ["$totalStoneWeight", 2] },
//           totalStoneQty: 1,

//           totalMetalValue: { $round: ["$totalMetalValue", 2] },
//           totalMetalWeight: { $round: ["$totalMetalWeight", 2] },

//           totalMakingCharge: { $round: ["$totalMakingCharge", 2] },
//         },
//       },
//     ]);

//     res.json({
//       success: true,
//       data: result[0] || {},
//     });

//   } catch (err) {
//     console.error("JEWELLERY SUMMARY ERROR:", err);
//     res.status(500).json({
//       success: false,
//       error: err.message,
//     });
//   }
// };



import SalesOrder from "../../models/SalesOrder.js";

// ─────────────────────────────────────────────────────────────────────────────
// GET /reports/gst-summary
// Returns: totalSales, totalGST, totalSubtotal, totalInvoices, totalDiscount
// ─────────────────────────────────────────────────────────────────────────────
export const getGSTSummary = async (req, res) => {
  try {
    const { from, to } = req.query;

    const match = {};
    if (from && to) {
      match.date = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    const result = await SalesOrder.aggregate([
      { $match: match },

      {
        $group: {
          _id: null,

          // grandTotal (after GST) → "Total Sales" on dashboard
          totalSales: { $sum: { $ifNull: ["$totals.grandTotal", 0] } },

          // GST collected
          totalGST: { $sum: { $ifNull: ["$totals.gst", 0] } },

          // Subtotal before GST (after discount)
          totalSubtotal: { $sum: { $ifNull: ["$totals.subtotal", 0] } },

          // Invoice count
          totalInvoices: { $sum: 1 },

          // Total discount given
          totalDiscount: { $sum: { $ifNull: ["$totals.discount", 0] } },
        },
      },

      {
        $project: {
          _id: 0,
          totalSales: { $round: ["$totalSales", 2] },
          totalGST: { $round: ["$totalGST", 2] },
          totalSubtotal: { $round: ["$totalSubtotal", 2] },
          totalInvoices: 1,
          totalDiscount: { $round: ["$totalDiscount", 2] },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: result[0] || {
        totalSales: 0,
        totalGST: 0,
        totalSubtotal: 0,
        totalInvoices: 0,
        totalDiscount: 0,
      },
    });
  } catch (err) {
    console.error("GST SUMMARY ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /reports/jewellery-summary
// Returns: diamond totals, stone totals, metal totals, making charges
//
// Key design decisions from your JSON schema:
//  - Diamond/Stone values come from componentBreakup[].pricingRef
//  - componentBreakup uses "type": "Diamond" but pricingRef: "DIAMOND" / "STONE"
//  - metalValue & makingCharge are flat fields on breakup
//  - netWeight on breakup = chargeable metal weight in grams
// ─────────────────────────────────────────────────────────────────────────────
export const getJewellerySummary = async (req, res) => {
  try {
    const { from, to } = req.query;

    const match = {};
    if (from && to) {
      match.date = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    const result = await SalesOrder.aggregate([
      { $match: match },

      // Unwind items so each item is its own document
      { $unwind: "$items" },

      {
        $group: {
          _id: null,

          // ── 💎 DIAMOND ────────────────────────────────────────────
          // diamondValue is already the total for the item (pre-calculated)
          totalDiamondValue: {
            $sum: {
              $multiply: [
                {
                  $convert: {
                    input: { $ifNull: ["$items.breakup.diamondValue", 0] },
                    to: "double",
                  },
                },
                { $ifNull: ["$items.quantity", 1] },
              ],
            },
          },

          // Diamond weight: sum componentBreakup rows where pricingRef = DIAMOND
          totalDiamondWeight: {
            $sum: {
              $multiply: [
                {
                  $sum: {
                    $map: {
                      input: { $ifNull: ["$items.breakup.componentBreakup", []] },
                      as: "c",
                      in: {
                        $cond: [
                          { $eq: ["$$c.pricingRef", "DIAMOND"] },
                          {
                            $convert: {
                              input: { $ifNull: ["$$c.weight", 0] },
                              to: "double",
                            },
                          },
                          0,
                        ],
                      },
                    },
                  },
                },
                { $ifNull: ["$items.quantity", 1] },
              ],
            },
          },

          // Diamond piece count
          totalDiamondQty: {
            $sum: {
              $multiply: [
                {
                  $sum: {
                    $map: {
                      input: { $ifNull: ["$items.breakup.componentBreakup", []] },
                      as: "c",
                      in: {
                        $cond: [
                          { $eq: ["$$c.pricingRef", "DIAMOND"] },
                          { $ifNull: ["$$c.count", 0] },
                          0,
                        ],
                      },
                    },
                  },
                },
                { $ifNull: ["$items.quantity", 1] },
              ],
            },
          },

          // ── 💠 STONE ──────────────────────────────────────────────
          totalStoneValue: {
            $sum: {
              $multiply: [
                {
                  $convert: {
                    input: { $ifNull: ["$items.breakup.stoneValue", 0] },
                    to: "double",
                  },
                },
                { $ifNull: ["$items.quantity", 1] },
              ],
            },
          },

          // Stone weight: sum componentBreakup rows where pricingRef = STONE
          totalStoneWeight: {
            $sum: {
              $multiply: [
                {
                  $sum: {
                    $map: {
                      input: { $ifNull: ["$items.breakup.componentBreakup", []] },
                      as: "c",
                      in: {
                        $cond: [
                          { $eq: ["$$c.pricingRef", "STONE"] },
                          {
                            $convert: {
                              input: { $ifNull: ["$$c.weight", 0] },
                              to: "double",
                            },
                          },
                          0,
                        ],
                      },
                    },
                  },
                },
                { $ifNull: ["$items.quantity", 1] },
              ],
            },
          },

          // Stone piece count
          totalStoneQty: {
            $sum: {
              $multiply: [
                {
                  $sum: {
                    $map: {
                      input: { $ifNull: ["$items.breakup.componentBreakup", []] },
                      as: "c",
                      in: {
                        $cond: [
                          { $eq: ["$$c.pricingRef", "STONE"] },
                          { $ifNull: ["$$c.count", 0] },
                          0,
                        ],
                      },
                    },
                  },
                },
                { $ifNull: ["$items.quantity", 1] },
              ],
            },
          },

          // ── 🪙 METAL ──────────────────────────────────────────────
          totalMetalValue: {
            $sum: {
              $multiply: [
                {
                  $convert: {
                    input: { $ifNull: ["$items.breakup.metalValue", 0] },
                    to: "double",
                  },
                },
                { $ifNull: ["$items.quantity", 1] },
              ],
            },
          },

          // netWeight = chargeable metal weight in grams
          totalMetalWeight: {
            $sum: {
              $multiply: [
                { $ifNull: ["$items.breakup.netWeight", 0] },
                { $ifNull: ["$items.quantity", 1] },
              ],
            },
          },

          // ── 🛠 MAKING ─────────────────────────────────────────────
          totalMakingCharge: {
            $sum: {
              $multiply: [
                {
                  $toDouble: { $ifNull: ["$items.breakup.makingCharge", 0] },
                },
                { $ifNull: ["$items.quantity", 1] },
              ],
            },
          },
        },
      },

      {
        $project: {
          _id: 0,

          totalDiamondValue: { $round: ["$totalDiamondValue", 2] },
          totalDiamondWeight: { $round: ["$totalDiamondWeight", 4] },
          totalDiamondQty: 1,

          totalStoneValue: { $round: ["$totalStoneValue", 2] },
          totalStoneWeight: { $round: ["$totalStoneWeight", 4] },
          totalStoneQty: 1,

          totalMetalValue: { $round: ["$totalMetalValue", 2] },
          totalMetalWeight: { $round: ["$totalMetalWeight", 2] },

          totalMakingCharge: { $round: ["$totalMakingCharge", 2] },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: result[0] || {
        totalDiamondValue: 0,
        totalDiamondWeight: 0,
        totalDiamondQty: 0,
        totalStoneValue: 0,
        totalStoneWeight: 0,
        totalStoneQty: 0,
        totalMetalValue: 0,
        totalMetalWeight: 0,
        totalMakingCharge: 0,
      },
    });
  } catch (err) {
    console.error("JEWELLERY SUMMARY ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};