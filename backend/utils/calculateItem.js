
import { lookupComponentRate } from "./lookupComponentRate.js";
import { PURITY_FACTORS } from "./purityFactors.js";

/* ================= UTILS ================= */
const round2 = (n) => Number(Number(n || 0).toFixed(2));

const applyDiscount = (amount, type, value) => {
  if (!amount || amount <= 0) return 0;

  if (type === "percent") {
    return round2((amount * Number(value || 0)) / 100);
  }

  if (type === "flat") {
    return round2(Math.min(Number(value || 0), amount));
  }

  return 0;
};

/* ================= MAIN ================= */
export default async function calculateItem(
  item,
  rateConfig = {},
  options = {}
) {
  console.log("\n🧮 CALCULATE ITEM START");
  const p = item.customSnapshot?.productDetails || {};
  const qty = Number(item.quantity || 1);

  /* ================= METAL ================= */
  const purityKey = String(p.metalPurity || "")
    .toUpperCase()
    .replace(/\s/g, "");

  const purityFactor = PURITY_FACTORS[purityKey] || 0;
  const netWeight = Number(p.netWeight || 0);

  let metalRate = 0;
  let metalValue = 0;

  const lockedRate =
    Number(item.metalRateOverride) ||
    Number(options.lockedMetalRate) ||
    0;

  if (purityFactor > 0 && netWeight > 0) {
    if (lockedRate > 0) {
      metalRate = round2(lockedRate);
    } else {
      const baseRate =
        p.metalType?.toLowerCase().includes("silver")
          ? rateConfig.silver999
          : p.metalType?.toLowerCase().includes("platinum")
            ? rateConfig.platinum950
            : rateConfig.gold24KT;

      metalRate = round2(Number(baseRate || 0) * purityFactor);
    }

    metalValue = round2(netWeight * metalRate * qty);
  }

  /* ================= COMPONENTS ================= */
  let diamondValue = 0;
  let stoneValue = 0;
  let accessoryValue = 0;
  const componentBreakup = [];

  for (const comp of p.components || []) {
    const weight = Number(comp.weight || 0);
    const count = Number(comp.count || 0);
    const grossWeight = Number(comp.grossWeight || 0);
    const totalWeight = grossWeight > 0 ? grossWeight : weight * count;

    if (comp.pricingRef !== "BELT" && totalWeight <= 0 && count <= 0) continue;

    const rateRes = await lookupComponentRate(comp);
    if (!rateRes?.rate) continue;

    const { rate, rateType } = rateRes;
    let value = 0;

    if (rateType === "PER_CT") {
      value = totalWeight * rate;
    }

    if (rateType === "PER_PC" || rateType === "PER_PCS") {
      value = count * rate;
    }



    value = round2(value * qty);

    if (comp.pricingRef === "DIAMOND") {
      diamondValue += value;
    } else if (comp.pricingRef === "BELT") {
      accessoryValue += value;
    } else {
      stoneValue += value;
    }

    componentBreakup.push({
      type: comp.type,
      pricingRef: comp.pricingRef,
      rateType,
      rate,
      weight,
      count,
      value,
      grossWeight,
      color: comp.color || "",
      clarity: comp.clarity || "",
      shape: comp.shape || "",
      size: comp.size || "",
      category: comp.category || "",   // material for belt
    });
  }

  diamondValue = round2(diamondValue);
  stoneValue = round2(stoneValue);
  accessoryValue = round2(accessoryValue);

  /* ================= MAKING ================= */
  let makingPerGram = Number(rateConfig.makingCharge || 0);
  const metalType = (p.metalType || "").toLowerCase();

  if (metalType.includes("silver")) {
    makingPerGram = Number(rateConfig.silverMakingCharge ?? rateConfig.makingCharge ?? 0);
  } else if (metalType.includes("platinum")) {
    makingPerGram = Number(rateConfig.platinumMakingCharge ?? rateConfig.makingCharge ?? 0);
  } else {
    // Default to gold if not specified or explicitly gold
    makingPerGram = Number(rateConfig.goldMakingCharge ?? rateConfig.makingCharge ?? 0);
  }

  const minWeight = Number(rateConfig.minMakingWeight || 0);
  const minFlat = Number(rateConfig.minMakingFlatFee || 0);


  let makingCharge = 0;
  if (netWeight > 0) {
    makingCharge =
      netWeight >= minWeight
        ? round2(netWeight * makingPerGram * qty)
        : round2(minFlat * qty);
  }

  /* ================= DISCOUNTS ================= */
  const discountDiamond = applyDiscount(
    diamondValue,
    rateConfig.diamondDiscountType,
    rateConfig.diamondDiscountValue
  );

  const discountStone = applyDiscount(
    stoneValue,
    rateConfig.stoneDiscountType,
    rateConfig.stoneDiscountValue
  );

  const discountMaking = applyDiscount(
    makingCharge,
    rateConfig.makingDiscountType,
    rateConfig.makingDiscountValue
  );

  let totalDiscount = round2(
    discountDiamond + discountStone + discountMaking
  );

  // Per-item discount toggle (check either item.discountEnabled or item.customSnapshot.discountEnabled)
  // PLUS Global discount toggle from rateConfig
  const isDiscountEnabled =
    rateConfig.discountEnabled !== false &&
    item.discountEnabled !== false &&
    item.customSnapshot?.discountEnabled !== false;

  if (!isDiscountEnabled) {
    totalDiscount = 0;
  }

  const grossTotal = round2(
    metalValue +
    diamondValue +
    stoneValue +
    accessoryValue +
    makingCharge
  );

  /* ================= TOTAL ================= */
  const subtotal = round2(grossTotal - totalDiscount);

  const gstPercent = Number(rateConfig.gstRate || 3);
  const gst = round2((subtotal * gstPercent) / 100);
  const grandTotal = round2(subtotal + gst);

  const advanceUsed = round2(item.advancePayment?.amount || 0);
  const metalUsed = round2(item.metalPayment?.totalValue || 0);

  const payable = round2(
    Math.max(grandTotal - advanceUsed - metalUsed, 0)
  );

  /* ================= FINAL ================= */
  return {
    metalRate,
    metalValue,

    componentBreakup,
    diamondValue,
    stoneValue,
    accessoryValue,
    makingCharge,

    grossTotal,

    discountDiamond: isDiscountEnabled ? discountDiamond : 0,
    discountStone: isDiscountEnabled ? discountStone : 0,
    discountMaking: isDiscountEnabled ? discountMaking : 0,
    discount: totalDiscount,

    subtotal,
    gst,
    gstPercent,
    grandTotal,

    advanceUsed,
    metalUsed,
    payable,

    netWeight,
    chargeableWeight: netWeight,
    wastagePercent: Number(p.wastagePercent || 0),
  };
}
