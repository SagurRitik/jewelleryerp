export const formatQuotation = (cart, customer = {}) => {
  const items = cart.items || [];

  return items.map((item) => {
    const p = item.customSnapshot?.productDetails || {};
    const b = item.breakup || {};

    return {
      title: p.title || "Jewellery Item",

      /* ================= PRODUCT SPEC ================= */
      specifications: {
        metalPurity: p.metalPurity,
        metalType: p.metalType,
        netWeight: b.netWeight,
        diamondCount: p.components?.length || 0,
      },

      /* ================= COST BREAKDOWN ================= */
      breakdown: {
        gold: {
          weight: b.netWeight,
          rate: b.metalRate,
          value: b.metalValue,
        },
        diamond: b.diamondValue,
        stone: b.stoneValue,
        making: b.makingCharge,
        discount: b.discount,
      },

      totals: {
        subtotal: b.subtotal,
        gst: b.gst,
        total: b.grandTotal,
      },
    };
  });
};