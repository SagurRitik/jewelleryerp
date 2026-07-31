
// import Cart from "../../models/Cart.js";
// import RateConfig from "../../models/RateConfig.js";
// import calculateItem from "../../utils/calculateItem.js";

// export const getCartSummary = async (req, res) => {
//   try {
//     const { sessionId } = req.params;

//     const cart = await Cart.findOne({ sessionId });
//     if (!cart || !cart.items?.length) {
//       return res.json({
//         items: [],
//         totals: {
//           subtotal: 0,
//           gst: 0,
//           grandTotal: 0,
//         },
//       });
//     }

//     const rateConfig = await RateConfig.findOne({ active: true });
//     if (!rateConfig) {
//       throw new Error("Active rate configuration not found");
//     }

//     let subtotal = 0;
//     let gst = 0;
//     let grandTotal = 0;

//     for (const item of cart.items) {
//       const breakup = await calculateItem(item, rateConfig);

//       item.breakup = breakup;

//       subtotal += breakup.subtotal;
//       gst += breakup.gst;
//       grandTotal += breakup.grandTotal;
//     }

//     cart.totals = {
//       subtotal: Number(subtotal.toFixed(2)),
//       gst: Number(gst.toFixed(2)),
//       grandTotal: Number(grandTotal.toFixed(2)),
//     };

//     await cart.save();

//     res.json(cart);
//   } catch (err) {
//     console.error("getCartSummary error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

import Cart from "../../models/Cart.js";
import RateConfig from "../../models/RateConfig.js";
import calculateItem, { calculateCartTotals } from "../../utils/calculateItem.js";

export const getCartSummary = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const cart = await Cart.findOne({ sessionId });
    if (!cart || !cart.items?.length) {
      return res.json({
        items: [],
        totals: {
          grossTotal: 0,
          subtotal: 0,
          gst: 0,
          grandTotal: 0,
          discount: 0,
          regularDiscount: 0,
          celebrationDiscount: 0,
          discountDiamond: 0,
          discountStone: 0,
          discountMaking: 0,
        },
      });
    }

    const rateConfig = await RateConfig.findOne({ active: true });
    if (!rateConfig) {
      throw new Error("Active rate configuration not found");
    }

    for (const item of cart.items) {
      const breakup = await calculateItem(item, rateConfig);
      item.breakup = breakup;
    }

    const calculatedTotals = calculateCartTotals(cart.items, null, { gstRate: rateConfig.gstRate });

    cart.totals = calculatedTotals;

    console.log("🧾 CART TOTALS SAVED:", cart.totals);

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error("getCartSummary error:", err);
    res.status(500).json({ message: err.message });
  }
};
