


import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { getActiveRates } from "../api/ratesApi";
import { PURITY_FACTORS } from "../utils/purity";


const RatesContext = createContext(null);

// ✅ PURITY FACTORS (Must match backend exactly)
// const PURITY_FACTORS = {
//   gold: {
//       "24KT": 1,
//   "22KT": 0.916,
//   "18KT": 0.76,
//   "14KT": 0.60,
//   "10KT": 0.43,
//   "9KT": 0.39,
//   },
//   silver: {
//     "999": 1,
//     "925": 1,
//     "835": 0.835,
//     "800": 0.8,
//   },
//   platinum: {
//     "950": 1,
//     "900": 0.947,
//   },
// };

export const RatesProvider = ({ children }) => {
  const [rawRates, setRawRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRates = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getActiveRates();
        
        // ✅ Validate response structure
        if (!res.data?.rates) {
          throw new Error("Invalid rates data structure");
        }
        
        setRawRates(res.data.rates);
        setLastUpdated(new Date().toISOString());
      } catch (err) {
        console.error("Failed to load rates:", err);
        setError(err.message || "Failed to load rates");
        // Keep existing rates if available, don't overwrite with null
      } finally {
        setLoading(false);
      }
    };

    loadRates();
    
    // Optional: Auto-refresh every 5 minutes
    const interval = setInterval(loadRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // ✅ DISPLAY-ONLY DERIVED RATES (Precision-safe)
  const rates = useMemo(() => {
    if (!rawRates) return null;

    // Helper for safe multiplication (avoid floating point errors)
    const multiply = (a, b) => {
      const val = (Number(a) || 0) * b;
      return Math.round(val * 100) / 100; // Round to 2 decimals
    };

    return {
      // Base rates from backend
      base: {
        gold24KT: Number(rawRates.gold24KT) || 0,
        silver999: Number(rawRates.silver999) || 0,
        platinum950: Number(rawRates.platinum950) || 0,
        diamondRate: Number(rawRates.diamondRate) || 0,
        stoneRate: Number(rawRates.stoneRate) || 0,
        makingCharge: Number(rawRates.makingCharge) || 0,
        goldMakingCharge: Number(rawRates.goldMakingCharge) || 0,
        silverMakingCharge: Number(rawRates.silverMakingCharge) || 0,
        platinumMakingCharge: Number(rawRates.platinumMakingCharge) || 0,
        gstRate: Number(rawRates.gstRate) || 3, // Default 3%
        settingChargePerPc: Number(rawRates.settingChargePerPc) || 0,
        minMakingWeight: Number(rawRates.minMakingWeight) || 0,
        minMakingFlatFee: Number(rawRates.minMakingFlatFee) || 0,

      },

      // Derived metal rates with purity factors
      metals: {
        gold: {
          "24KT": multiply(rawRates.gold24KT, PURITY_FACTORS.gold["24KT"]),
          "22KT": multiply(rawRates.gold24KT, PURITY_FACTORS.gold["22KT"]),
          "18KT": multiply(rawRates.gold24KT, PURITY_FACTORS.gold["18KT"]),
          "14KT": multiply(rawRates.gold24KT, PURITY_FACTORS.gold["14KT"]),
          "10KT": multiply(rawRates.gold24KT, PURITY_FACTORS.gold["10KT"]),
          "9KT": multiply(rawRates.gold24KT, PURITY_FACTORS.gold["9KT"]),
        },
        silver: {
          "999": multiply(rawRates.silver999, PURITY_FACTORS.silver["999"]),
          "925": multiply(rawRates.silver999, PURITY_FACTORS.silver["925"]),
          "835": multiply(rawRates.silver999, PURITY_FACTORS.silver["835"]),
          "800": multiply(rawRates.silver999, PURITY_FACTORS.silver["800"]),
        },
        platinum: {
          "950": multiply(rawRates.platinum950, PURITY_FACTORS.platinum["950"]),
          "900": multiply(rawRates.platinum950, PURITY_FACTORS.platinum["900"]),
        },
      },

      // Component rates
      components: {
        diamond: Number(rawRates.diamondRate) || 0,
        stone: Number(rawRates.stoneRate) || 0,
      },

      // Making charges configuration
      making: {
        perGram: Number(rawRates.makingCharge) || 0,
        gold: Number(rawRates.goldMakingCharge) || Number(rawRates.makingCharge) || 0,
        silver: Number(rawRates.silverMakingCharge) || Number(rawRates.makingCharge) || 0,
        platinum: Number(rawRates.platinumMakingCharge) || Number(rawRates.makingCharge) || 0,
        minWeight: Number(rawRates.minMakingWeight) || 0,
        flatFee: Number(rawRates.minMakingFlatFee) || 0,
      },


      // Setting charges
      setting: {
        perPiece: Number(rawRates.settingChargePerPc) || 0,
      },

      // Tax
      tax: {
        gst: Number(rawRates.gstRate) || 3,
      },

      // 🔒 DISPLAY ONLY (calculation happens in backend)
      discounts: {
        making: {
          type: rawRates.makingDiscountType || null,
          value: Number(rawRates.makingDiscountValue) || 0,
        },
        diamond: {
          type: rawRates.diamondDiscountType || null,
          value: Number(rawRates.diamondDiscountValue) || 0,
        },
        stone: {
          type: rawRates.stoneDiscountType || null,
          value: Number(rawRates.stoneDiscountValue) || 0,
        },
      },

      // Utility functions for components
      helpers: {
        getMetalRate: (type, purity) => {
          const normalizedType = (type || "").toLowerCase();
          const normalizedPurity = String(purity || "").toUpperCase().replace(/\s/g, "");
          
          if (normalizedType === "gold") {
            return rates?.metals?.gold?.[normalizedPurity] || rates?.base?.gold24KT || 0;
          }
          if (normalizedType === "silver") {
            return rates?.metals?.silver?.[normalizedPurity] || rates?.base?.silver999 || 0;
          }
          if (normalizedType === "platinum") {
            return rates?.metals?.platinum?.[normalizedPurity] || rates?.base?.platinum950 || 0;
          }
          return 0;
        },
        
        getPurityFactor: (type, purity) => {
          const normalizedType = (type || "").toLowerCase();
          const normalizedPurity = String(purity || "").toUpperCase().replace(/\s/g, "");
          return PURITY_FACTORS[normalizedType]?.[normalizedPurity] || 1;
        },
      },
    };
  }, [rawRates]);

  // Refresh function for manual reload
  const refreshRates = async () => {
    setLoading(true);
    try {
      const res = await getActiveRates();
      setRawRates(res.data.rates);
      setLastUpdated(new Date().toISOString());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RatesContext.Provider 
      value={{ 
        rawRates, 
        rates, 
        loading, 
        lastUpdated, 
        error,
        refreshRates,
        PURITY_FACTORS 
      }}
    >
      {children}
    </RatesContext.Provider>
  );
};

export const useRates = () => {
  const ctx = useContext(RatesContext);
  if (!ctx) throw new Error("useRates must be used inside RatesProvider");
  return ctx;
};