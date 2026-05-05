// /**
//  * return.adjustment.js
//  * Pure utility — no DB calls.
//  * Computes adjusted return value from original invoice breakdown + user-configured adjustments.
//  */

// const round2 = (n) => Number(Number(n || 0).toFixed(2));

// /**
//  * PURITY_FACTORS — fraction of pure metal in an alloy.
//  * Mirrors purityFactors.js but kept local so this util has zero imports.
//  */
// const PURITY_FACTORS = {
//   "24KT": 1,
//   "22KT": 0.916,
//   "18KT": 0.75,
//   "14KT": 0.585,
//   "10KT": 0.417,
//   "9KT": 0.375,
//   "999": 1,
//   "925": 0.925,
//   "835": 0.835,
//   "800": 0.8,
//   "950": 1,
//   "900": 0.947,
// };

// /**
//  * computeReturnAdjustment
//  *
//  * @param {Object} breakdown     - Original invoice component values
//  *   { metal, diamond, stone, making, gst, total, netWeight, metalType, metalPurity, gstRate }
//  *
//  * @param {Object} adjustments   - User-configured rules
//  *   {
//  *     useLatestMetalRate: boolean,   // if false → use original metalValue
//  *     diamondPercent: number,        // 0–100
//  *     stonePercent: number,          // 0–100
//  *     makingOption: "keep"|"remove"|"custom",
//  *     makingCustomValue: number,     // only used when makingOption === "custom"
//  *     includeGST: boolean,
//  *     discountMode: "keep"|"remove"
//  *   }
//  *
//  * @param {Object} latestRates   - Current market rates from RateConfig
//  *   { gold24KT, silver999, platinum950, gstRate }
//  *
//  * @returns {Object}
//  *   { adjustedValues: { metal, diamond, stone, making, gst }, finalAmount, diff }
//  */
// export function computeReturnAdjustment(breakdown, adjustments, latestRates = {}) {
//   const {
//     useLatestMetalRate = true,
//     diamondPercent = 100,
//     stonePercent = 100,
//     makingOption = "keep",
//     makingCustomValue = 0,
//     includeGST = true,
//     discountMode = "keep",
//   } = adjustments;

//   /* ── METAL ─────────────────────────────────────────────────── */
//   let metalAdj;

//   if (useLatestMetalRate) {
//     const netWeight = Number(breakdown.netWeight || 0);
//     const purityKey = String(breakdown.metalPurity || "").toUpperCase().replace(/\s/g, "");
//     const purityFactor = PURITY_FACTORS[purityKey] || 0;

//     let baseRate = 0;
//     const metalType = (breakdown.metalType || "").toLowerCase();
//     if (metalType.includes("silver")) {
//       baseRate = Number(latestRates.silver999 || 0);
//     } else if (metalType.includes("platinum")) {
//       baseRate = Number(latestRates.platinum950 || 0);
//     } else {
//       baseRate = Number(latestRates.gold24KT || 0);
//     }

//     const metalRate = round2(baseRate * purityFactor);
//     metalAdj = round2(netWeight * metalRate);
//   } else {
//     metalAdj = round2(breakdown.metal || 0);
//   }





//   /* ── DIAMOND ────────────────────────────────────────────────── */
//   const diamondAdj = round2((breakdown.diamond || 0) * (Number(diamondPercent) / 100));

//   /* ── STONE ──────────────────────────────────────────────────── */
//   const stoneAdj = round2((breakdown.stone || 0) * (Number(stonePercent) / 100));

//   /* ── MAKING ─────────────────────────────────────────────────── */
//   let makingAdj;
//   if (makingOption === "remove") {
//     makingAdj = 0;
//   } else if (makingOption === "custom") {
//     makingAdj = round2(Number(makingCustomValue) || 0);
//   } else {
//     makingAdj = round2(breakdown.making || 0); // "keep"
//   }


//   /* ── DISCOUNT ── */
//   const totalDiscount = round2(
//     (breakdown.discountDiamond || 0) +
//     (breakdown.discountStone || 0) +
//     (breakdown.discountMaking || 0) || (breakdown.discount || 0)
//   );

//   const discountAdj = adjustments.discountMode === "remove" ? 0 : totalDiscount;

//   /* ── FINAL AMOUNT ── */

//   /* ── GST ────────────────────────────────────────────────────── */
//   const grossSubtotal = round2(metalAdj + diamondAdj + stoneAdj + makingAdj);
//   const netSubtotal = round2(grossSubtotal - discountAdj);

//   const gstRate = Number(latestRates.gstRate || breakdown.gstRate || 3);
//   const gstAdj = includeGST ? round2((netSubtotal * gstRate) / 100) : 0;

//   /* ── FINAL AMOUNT ───────────────────────────────────────────── */
//   const finalAmount = round2(netSubtotal + gstAdj);

//   /* ── DIFF vs ORIGINAL ───────────────────────────────────────── */
//   const originalTotal = round2(breakdown.total || 0);
//   const diff = round2(finalAmount - originalTotal);

//   return {
//     adjustedValues: {
//       metal: metalAdj,
//       diamond: diamondAdj,
//       stone: stoneAdj,
//       making: makingAdj,
//       discount: discountAdj,
//       gst: gstAdj,
//     },
//     finalAmount,
//     diff,
//     subtotal: netSubtotal,
//   };
// }

// /**
//  * extractBreakdownFromInvoiceItem
//  * Converts a raw SalesOrder item into a normalised breakdown object
//  * that computeReturnAdjustment can consume.
//  */
// export function extractBreakdownFromInvoiceItem(item) {
//   // const b = item?.breakup || {};
//   const b =
//     item?.breakup ||
//     item?.itemSnapshot?.breakup ||
//     item?.customSnapshot?.pricingSnapshot ||
//     {};
//   const pd = item?.itemSnapshot?.productDetails || item?.customSnapshot?.productDetails || {};

//   // return {
//   //   metal: round2(b.metalValue || 0),
//   //   diamond: round2(b.diamondValue || 0),
//   //   stone: round2(b.stoneValue || 0),
//   //   making: round2(b.makingCharge || 0),
//   //   gst: round2(b.gst || 0),
//   //   total: round2(b.grandTotal || 0),
//   //   netWeight: Number(pd.netWeight || 0),
//   //   metalType: pd.metalType || "",
//   //   metalPurity: pd.metalPurity || "",
//   //   gstRate: 3,
//   // };


//   return {
//     metal: round2(b.metalValue || 0),
//     diamond: round2(b.diamondValue || 0),
//     stone: round2(b.stoneValue || 0),
//     making: round2(b.makingCharge || 0),
//     gst: round2(b.gst || 0),
//     total: round2(b.grandTotal || 0),

//     // ✅🔥 ADD THESE (MAIN FIX)
//     discountDiamond: round2(b.discountDiamond || 0),
//     discountStone: round2(b.discountStone || 0),
//     discountMaking: round2(b.discountMaking || 0),
//     discount: round2(b.discount || 0),

//     netWeight: Number(pd.netWeight || 0),
//     metalType: pd.metalType || "",
//     metalPurity: pd.metalPurity || "",
//     gstRate: 3,
//   };
// }





/**
 * return.adjustment.js
 * Pure utility — no DB calls, no JSX, no imports.
 * Computes adjusted return value from original invoice breakdown + user-configured adjustments.
 */

const round2 = (n) => Number(Number(n || 0).toFixed(2));

/**
 * PURITY_FACTORS — fraction of pure metal in an alloy.
 */
const PURITY_FACTORS = {
  "24KT": 1,
  "22KT": 0.916,
  "18KT": 0.75,
  "14KT": 0.585,
  "10KT": 0.417,
  "9KT": 0.375,
  "999": 1,
  "925": 0.925,
  "835": 0.835,
  "800": 0.8,
  "950": 1,
  "900": 0.947,
};

/**
 * computeReturnAdjustment
 */
export function computeReturnAdjustment(breakdown, adjustments, latestRates = {}) {
  const {
    useLatestMetalRate = true,
    diamondPercent = 100,
    stonePercent = 100,
    makingOption = "keep",
    makingCustomValue = 0,
    includeGST = true,
    discountMode = "keep",
  } = adjustments;

  /* ── METAL ── */
  let metalAdj;
  if (useLatestMetalRate) {
    const netWeight = Number(breakdown.netWeight || 0);
    const purityKey = String(breakdown.metalPurity || "").toUpperCase().replace(/\s/g, "");
    const purityFactor = PURITY_FACTORS[purityKey] || 0;

    let baseRate = 0;
    const metalType = (breakdown.metalType || "").toLowerCase();
    if (metalType.includes("silver")) baseRate = Number(latestRates.silver999 || 0);
    else if (metalType.includes("platinum")) baseRate = Number(latestRates.platinum950 || 0);
    else baseRate = Number(latestRates.gold24KT || 0);

    metalAdj = round2(netWeight * round2(baseRate * purityFactor));
  } else {
    metalAdj = round2(breakdown.metal || 0);
  }

  /* ── DIAMOND ── */
  const diamondAdj = round2((breakdown.diamond || 0) * (Number(diamondPercent) / 100));

  /* ── STONE ── */
  const stoneAdj = round2((breakdown.stone || 0) * (Number(stonePercent) / 100));

  /* ── MAKING ── */
  let makingAdj;
  if (makingOption === "remove") makingAdj = 0;
  else if (makingOption === "custom") makingAdj = round2(Number(makingCustomValue) || 0);
  else makingAdj = round2(breakdown.making || 0);

  /* ── GROSS SUBTOTAL (before discount) ── */
  const grossSubtotal = round2(metalAdj + diamondAdj + stoneAdj + makingAdj);

  /* ── DISCOUNT ──────────────────────────────────────────────────
     "keep"   → subtract discount → price goes DOWN  ✅
     "remove" → don't subtract    → price stays at gross ✅
  ────────────────────────────────────────────────────────────── */
  const totalDiscount = round2(
    (breakdown.discountDiamond || 0) +
    (breakdown.discountStone || 0) +
    (breakdown.discountMaking || 0) || (breakdown.discount || 0)
  );
  const discountAdj = discountMode === "keep" ? totalDiscount : 0;

  /* ── NET SUBTOTAL (after discount) ── */
  const netSubtotal = round2(grossSubtotal - discountAdj);

  /* ── GST ── */
  const gstRate = Number(latestRates.gstRate || breakdown.gstRate || 3);
  const gstAdj = includeGST ? round2((netSubtotal * gstRate) / 100) : 0;

  /* ── FINAL AMOUNT ── */
  const finalAmount = round2(netSubtotal + gstAdj);

  /* ── DIFF vs ORIGINAL ── */
  const originalTotal = round2(breakdown.total || 0);
  const diff = round2(finalAmount - originalTotal);

  return {
    adjustedValues: {
      metal: metalAdj,
      diamond: diamondAdj,
      stone: stoneAdj,
      making: makingAdj,
      discount: discountAdj,
      gst: gstAdj,
    },
    finalAmount,
    diff,
    subtotal: netSubtotal,
  };
}

/**
 * extractBreakdownFromInvoiceItem
 */
export function extractBreakdownFromInvoiceItem(item) {
  const b =
    item?.breakup ||
    item?.itemSnapshot?.breakup ||
    item?.customSnapshot?.pricingSnapshot ||
    {};
  const pd =
    item?.itemSnapshot?.productDetails ||
    item?.customSnapshot?.productDetails ||
    {};

  return {
    metal: round2(b.metalValue || 0),
    diamond: round2(b.diamondValue || 0),
    stone: round2(b.stoneValue || 0),
    making: round2(b.makingCharge || 0),
    gst: round2(b.gst || 0),
    total: round2(b.grandTotal || 0),

    discountDiamond: round2(b.discountDiamond || 0),
    discountStone: round2(b.discountStone || 0),
    discountMaking: round2(b.discountMaking || 0),
    discount: round2(b.discount || 0),

    netWeight: Number(pd.netWeight || 0),
    metalType: pd.metalType || "",
    metalPurity: pd.metalPurity || "",
    gstRate: 3,
  };
}