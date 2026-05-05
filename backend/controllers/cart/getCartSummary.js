
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

export const getCartSummary = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const cart = await Cart.findOne({ sessionId });
    if (!cart || !cart.items?.length) {
      return res.json({
        items: [],
        totals: {
          subtotal: 0,
          gst: 0,
          grandTotal: 0,
          discount: 0,
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

    let subtotal = 0;
    let gst = 0;
    let grandTotal = 0;

    // 🔥 CART LEVEL DISCOUNTS
    let discountDiamond = 0;
    let discountStone = 0;
    let discountMaking = 0;

    for (const item of cart.items) {
      const breakup = await calculateItem(item, rateConfig);

      item.breakup = breakup;

      subtotal += breakup.subtotal || 0;
      gst += breakup.gst || 0;
      grandTotal += breakup.grandTotal || 0;

      discountDiamond += breakup.discountDiamond || 0;
      discountStone += breakup.discountStone || 0;
      discountMaking += breakup.discountMaking || 0;
    }

    const discount =
      discountDiamond + discountStone + discountMaking;

    cart.totals = {
      subtotal: Number(subtotal.toFixed(2)),
      gst: Number(gst.toFixed(2)),
      grandTotal: Number(grandTotal.toFixed(2)),

      // ✅ THIS IS WHAT TotalsBar NEEDS
      discount: Number(discount.toFixed(2)),
      discountDiamond: Number(discountDiamond.toFixed(2)),
      discountStone: Number(discountStone.toFixed(2)),
      discountMaking: Number(discountMaking.toFixed(2)),
    };

    console.log("🧾 CART TOTALS SAVED:", cart.totals);

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error("getCartSummary error:", err);
    res.status(500).json({ message: err.message });
  }
};
