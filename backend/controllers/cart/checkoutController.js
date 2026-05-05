

import Cart from "../../models/Cart.js";
import RateConfig from "../../models/RateConfig.js";
import calculateItem from "../../utils/calculateItem.js";
import { normalizeImage } from "../../utils/normalizeImage.js";

export const checkoutCart = async (req, res) => {
  try {
    const { sessionId, customer } = req.body;

    if (!sessionId || !customer?.name || !customer?.mobile) {
      return res.status(400).json({
        success: false,
        error: "Invalid checkout data",
      });
    }

    /* ================= 1️⃣ FETCH ACTIVE RATES ================= */
    const rates = await RateConfig.findOne({ active: true }).lean();
    if (!rates) {
      return res.status(500).json({
        success: false,
        error: "Rates not configured",
      });
    }

    console.log("\n--- ⚡ CHECKOUT PREVIEW ⚡ ---");

    /* ================= 2️⃣ LOAD CART ================= */
    const cart = await Cart.findOne({ sessionId }).lean();
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Cart empty",
      });
    }

    /* ================= 3️⃣ CALCULATE ITEMS ================= */
    let subtotal = 0;
    let gst = 0;
    let grandTotal = 0;

    const calculatedItems = await Promise.all(
      cart.items.map(async (item, idx) => {
        if (!item.customSnapshot?.productDetails) {
          throw new Error(`Item ${idx + 1}: Missing product details`);
        }

        const breakup = await calculateItem(item, rates);

        subtotal += breakup.subtotal || 0;
        gst += breakup.gst || 0;
        grandTotal += breakup.itemTotal || 0;

        return {
          itemSnapshot: {
            ...item.customSnapshot,
            productImage: normalizeImage(item.customSnapshot.productImage),
          },
          quantity: item.quantity,
          breakup,
          itemType: item.itemType,
          productId: item.product || null,
          sku: item.sku,
        };
      })
    );

    console.log(`💰 TOTALS: ${grandTotal}`);

    /* ================= 4️⃣ RETURN PREVIEW ONLY ================= */
    return res.json({
      success: true,
      items: calculatedItems,
      totals: {
        subtotal: Number(subtotal.toFixed(2)),
        gst: Number(gst.toFixed(2)),
        grandTotal: Number(grandTotal.toFixed(2)),
      },
    });

  } catch (err) {
    console.error("❌ CHECKOUT PREVIEW ERROR:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
