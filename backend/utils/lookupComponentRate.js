


import DiamondRateMaster from "../models/DiamondRateMaster.js";
import StoneRateMaster from "../models/StoneRateMaster.js";

/* ================= PURE RANK MAPS ================= */
const COLOR_RANK = [
  "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
];

const CLARITY_RANK = [
  "FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2"
];

/* ================= FALLBACK ================= */
const FALLBACK_RATES = {
  DIAMOND: 35000,
  POLKI: 2000,
  RUBY: 2000,
  EMERALD: 2000,
  BELT: 1000,
  DEFAULT: 2000,
};

/* ================================================= */
/* ================= HELPERS ======================== */
/* ================================================= */

/* ---- Normalize clarity groups ---- */
const normalizeClarity = (val = "") => {
  val = val.toUpperCase().replace(/\s+/g, "");

  if (val === "VVS-VS") return "VVS1-VS2";
  if (val === "SI-I") return "SI1-I2";

  return val;
};

/* ---- Convert range string → index range ---- */
const parseRange = (value, rankList) => {
  if (!value) return [-1, -1];

  const parts = value.toUpperCase().split("-");

  if (parts.length === 1) {
    const idx = rankList.indexOf(parts[0]);
    return [idx, idx];
  }

  const from = rankList.indexOf(parts[0]);
  const to = rankList.indexOf(parts[1]);

  return [from, to];
};

/* ================================================= */
/* ================= MAIN ENTRY ===================== */
/* ================================================= */
export const lookupComponentRate = async (component) => {
  try {
    if (component.rateOverride > 0) {
      const pricingRefUpper = (component.pricingRef || "").toUpperCase();
      return {
        rateType: pricingRefUpper === "BELT" ? "PER_PCS" : (component.rateType || "PER_CT"),
        rate: Number(component.rateOverride),
        source: "OVERRIDE",
      };
    }


    const pricingRef = (component.pricingRef || "").toUpperCase();
    // const weight = Number(component.weight || 0);
    // const weight = Number(component.grossWeight || component.weight || 0);
let weight = 0;

const count = Number(component.count || 1);
const grossWeight = Number(component.grossWeight || 0);
const perPieceWeight =
  component.weight > 0
    ? Number(component.weight)
    : (count > 0 ? grossWeight / count : 0);

// 🔥 IMPORTANT: gemstone bhi per-piece weight use karega
if (pricingRef === "DIAMOND" || pricingRef === "POLKI") {
  weight = perPieceWeight;
} else {
  weight = perPieceWeight; // ✅ CHANGE HERE
}

    if (!pricingRef) {
      return getFallbackRate(component);
    }

    if (pricingRef !== "BELT" && weight <= 0) {
       return getFallbackRate(component);
    }

    if (pricingRef === "BELT") {
      return {
        rateType: "PER_PCS",
        rate: FALLBACK_RATES.BELT,
        source: "BELT_DEFAULT",
      };
    }

    if (pricingRef === "DIAMOND" || pricingRef === "POLKI") {
      return lookupDiamondRate(component, weight);
    }

    return lookupStoneRate(component, weight);

  } catch (err) {
    console.error("❌ lookupComponentRate failed:", err.message);
    return getFallbackRate(component);
  }
};

/* ================================================= */
/* ================= DIAMOND ======================== */
/* ================================================= */
const lookupDiamondRate = async (component, weight) => {
  try {
    const shapeRegex = component.shape
      ? new RegExp(`^${component.shape}$`, "i")
      : /.*/;

    /* ---- PARSE INPUT RANGES ---- */
    const [colorFrom, colorTo] = parseRange(
      component.color,
      COLOR_RANK
    );

    const clarityNormalized = normalizeClarity(component.clarity);
    const [clarityFrom, clarityTo] = parseRange(
      clarityNormalized,
      CLARITY_RANK
    );

    /* ---- BROAD FALLBACK ---- */
    if (colorFrom === -1 || clarityFrom === -1) {
      const broad = await DiamondRateMaster.findOne({
        active: true,
        shape: shapeRegex,
        weightFrom: { $lte: weight },
        weightTo: { $gte: weight },
      }).sort({ priority: -1 });

      if (broad) {
        return {
          rateType: broad.rateType,
          rate: broad.rate,
          source: "DIAMOND_BROAD",
        };
      }
    }

    /* ---- CORRECT RANGE OVERLAP QUERY ---- */
    const precise = await DiamondRateMaster.findOne({
      active: true,
      shape: shapeRegex,
      weightFrom: { $lte: weight },
      weightTo: { $gte: weight },

      colorFromIndex: { $lte: colorTo },
      colorToIndex: { $gte: colorFrom },

      clarityFromIndex: { $lte: clarityTo },
      clarityToIndex: { $gte: clarityFrom },

    }).sort({ priority: -1 });

    if (precise) {
      return {
        rateType: precise.rateType,
        rate: precise.rate,
        source: "DIAMOND_MASTER",
      };
    }

    return getFallbackRate(component);

  } catch (err) {
    console.error("❌ Diamond lookup error:", err.message);
    return getFallbackRate(component);
  }
};

/* ================================================= */
/* ================= STONE ========================== */
/* ================================================= */
const lookupStoneRate = async (component, weight) => {
  try {
   // const typeRegex = new RegExp(`^${component.type}$`, "i");


   const normalize = (val = "") =>
  val
    .toLowerCase()
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizedType = normalize(component.type);

// 🔥 flexible match (handles old + new data)
const typeRegex = new RegExp(
  normalizedType.split(" ").join(".*"),
  "i"
);


    const query = {
      active: true,
      stoneType: typeRegex,
      weightFrom: { $lte: weight },
      weightTo: { $gte: weight },
    };

    // if (component.shape) {
    //   query.shape = new RegExp(`^${component.shape}$`, "i");
    // }

    if (component.shape && component.shape !== "") {
  query.shape = new RegExp(component.shape, "i");
}

    const rate = await StoneRateMaster.findOne(query).sort({ weightFrom: -1 });

    if (rate) {
      return {
        rateType: rate.rateType,
        rate: rate.rate,
        source: "STONE_MASTER",
      };
    }

    return getFallbackRate(component);

  } catch (err) {
    console.error("❌ Stone lookup error:", err.message);
    return getFallbackRate(component);
  }
};

/* ================================================= */
/* ================= FALLBACK ======================= */
/* ================================================= */
const getFallbackRate = (component) => {
  const key =
    (component.type || component.pricingRef || "").toUpperCase();

  const rate = FALLBACK_RATES[key] || FALLBACK_RATES.DEFAULT;

  return {
    rateType: "PER_CT",
    rate,
    source: "FALLBACK",
  };
};