
import { useState, useEffect, useCallback } from "react";
import { Lock, Unlock, Sparkles, Sigma, Plus, X, ChevronDown, Settings } from "lucide-react";
import BackButton from "./BackButton";

/* ================= CONSTANTS ================= */
const STORAGE_KEY = "jewellery_calc_enhanced_v3";

const DEFAULT_GOLD_PURITY_FACTOR = {
  "24KT": 1,
  "22KT": 0.916,
  "18KT": 0.76,
  "14KT": 0.60,
  "10KT": 0.43,
  "9KT": 0.39,
};

const DEFAULT_SILVER_PURITY_FACTOR = {
  "999": 1,
  "950": 0.95,
  "925": 0.925,
  "900": 0.90,
  "800": 0.80,
};

const DIAMOND_SHAPES = [
  "Round",
  "Asscher",
  "Emerald",
  "Princess",
  "Heart", 
  "Marquise",
  "Oval",
  "Pear",
  "Radiant",
  "Fancy",
];

const STONE_TYPES = [
     "Gemstone",
      "Amethyst",
       "Emerald",
       "Garnet",
       "Opal",
       "Pearl",
       "Ruby",
       "Sapphire",
       "Topaz",
       "Turquoise",
];

/* ================= HELPERS ================= */
const toNumber = (v) => (isNaN(parseFloat(v)) ? 0 : parseFloat(v));

const formatCurrency = (v) =>
  toNumber(v).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const generateId = () => Math.random().toString(36).substr(2, 9);

/* ================= MAIN ================= */
export default function JewelleryCalculator() {
  const [state, setState] = useState(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    return saved
      ? JSON.parse(saved)
      : {
          gold24kRate: "",
          silverRate: "",
          gst: "3",
          goldWeight: "",
          silverWeight: "",
          goldPurity: "22KT",
          silverPurity: "925",
          goldMakingRate: "",
          silverMakingRate: "",
          discountType: "making",
          discountMode: "percent",
          discountValue: "",
          ratesLocked: false,
          showPuritySettings: false,
          goldPurityFactors: DEFAULT_GOLD_PURITY_FACTOR,
          silverPurityFactors: DEFAULT_SILVER_PURITY_FACTOR,
          diamonds: [{ id: generateId(), shape: "Round", rate: "", weight: "",  grossWeight: "", quantity: "" }],
          stones: [{ id: generateId(), type: "Ruby", rate: "", weight: "", quantity: "" }],
          breakdown: null,
          total: 0,
        };
  });

  const update = (u) => setState((p) => ({ ...p, ...u }));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  /* ================= DIAMOND HANDLERS ================= */
  const addDiamond = () => {
    const newDiamond = {
      id: generateId(),
      shape: "Round",
      rate: "",
      weight: "",
      grossWeight: "", 
      quantity: "",
    };
    update({ diamonds: [...state.diamonds, newDiamond] });
  };

  const removeDiamond = (id) => {
    update({ diamonds: state.diamonds.filter((d) => d.id !== id) });
  };

  // const updateDiamond = (id, field, value) => {
  //   update({
  //     diamonds: state.diamonds.map((d) =>
  //       d.id === id ? { ...d, [field]: value } : d
  //     ),
  //   });
  // };

  const updateDiamond = (id, field, value) => {
  update({
    diamonds: state.diamonds.map((d) => {
      if (d.id !== id) return d;

      const updated = { ...d, [field]: value };

      const gross = parseFloat(updated.grossWeight) || 0;
      const qty = parseFloat(updated.quantity) || 0;

      // ✅ MAIN FORMULA
      if (qty > 0) {
        updated.weight = (gross / qty).toFixed(3);
      } else {
        updated.weight = "";
      }

      return updated;
    }),
  });
};

  /* ================= STONE HANDLERS ================= */
  const addStone = () => {
    const newStone = {
      id: generateId(),
      type: "Ruby",
      rate: "",
      weight: "",
      quantity: "",
    };
    update({ stones: [...state.stones, newStone] });
  };

  const removeStone = (id) => {
    update({ stones: state.stones.filter((s) => s.id !== id) });
  };

  const updateStone = (id, field, value) => {
    update({
      stones: state.stones.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      ),
    });
  };

  /* ================= PURITY HANDLERS ================= */
  const updateGoldPurityFactor = (purity, value) => {
    update({
      goldPurityFactors: {
        ...state.goldPurityFactors,
        [purity]: toNumber(value),
      },
    });
  };

  const updateSilverPurityFactor = (purity, value) => {
    update({
      silverPurityFactors: {
        ...state.silverPurityFactors,
        [purity]: toNumber(value),
      },
    });
  };

  /* ================= CALCULATION ================= */
  const calculate = useCallback(() => {
    const s = state;

    // Gold calculation with purity
    const goldRate = toNumber(s.gold24kRate) * s.goldPurityFactors[s.goldPurity];
    const goldAmount = goldRate * toNumber(s.goldWeight);
    
    // Silver calculation with purity
    const silverRate = toNumber(s.silverRate) * s.silverPurityFactors[s.silverPurity];
    const silverAmount = silverRate * toNumber(s.silverWeight);
    
    const makingGoldAmount = toNumber(s.goldMakingRate) * toNumber(s.goldWeight);
    const makingSilverAmount = toNumber(s.silverMakingRate) * toNumber(s.silverWeight);

    // Calculate diamond amounts - rate * weight * quantity
    const diamondAmounts = s.diamonds.map((d) => {
      return {
        ...d,
        amount: toNumber(d.rate) * toNumber(d.weight) * toNumber(d.quantity),
      };
    });
    const totalDiamondAmount = diamondAmounts.reduce((sum, d) => sum + d.amount, 0);

    // Calculate stone amounts - rate * weight * quantity
    const stoneAmounts = s.stones.map((st) => {
      return {
        ...st,
        amount: toNumber(st.rate) * toNumber(st.weight) * toNumber(st.quantity),
      };
    });
    const totalStoneAmount = stoneAmounts.reduce((sum, st) => sum + st.amount, 0);

    const totalMaking = makingGoldAmount + makingSilverAmount;
    const subtotal = goldAmount + silverAmount + totalDiamondAmount + totalStoneAmount + totalMaking;

    // DISCOUNT LOGIC
    let discountBase = 0;
    if (s.discountType === "making") {
      discountBase = totalMaking;
    } else {
      discountBase = totalMaking + totalDiamondAmount + totalStoneAmount;
    }

    let discountAmount = 0;
    if (s.discountMode === "percent") {
      discountAmount = discountBase * (toNumber(s.discountValue) / 100);
    } else {
      discountAmount = Math.min(toNumber(s.discountValue), discountBase);
    }

    const discountedSubtotal = subtotal - discountAmount;
    const gstAmount = discountedSubtotal * (toNumber(s.gst) / 100);
    const total = discountedSubtotal + gstAmount;

    update({
      breakdown: {
        goldAmount,
        silverAmount,
        diamondAmounts,
        totalDiamondAmount,
        stoneAmounts,
        totalStoneAmount,
        makingGoldAmount,
        makingSilverAmount,
        totalMaking,
        subtotal,
        discountAmount,
        gstAmount,
      },
      total,
    });
  }, [state]);

  useEffect(() => {
    const t = setTimeout(calculate, 200);
    return () => clearTimeout(t);
  }, [calculate]);

  /* ================= UI TOKENS ================= */
  const card = "bg-white border border-[#E5E1DA] rounded-xl p-6 shadow-sm transition-all duration-300";
  const labelClass = "text-[10px] tracking-[0.2em] uppercase text-[#A8A294] font-bold mb-2 block";
  const inputStyle = "w-full px-4 py-3 rounded-lg border border-[#E5E1DA] bg-white text-[#4A453A] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] transition-all placeholder:text-[#D1CDC2] disabled:bg-[#FDFCFB]";
  const selectStyle = "w-full px-4 py-3 rounded-lg border border-[#E5E1DA] bg-white text-[#4A453A] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] transition-all disabled:bg-[#FDFCFB] appearance-none cursor-pointer";

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#4A453A] font-sans">
     
      <div className="max-w-7xl mx-auto px-6 py-4 bg-[#f3e6ed]">
 <BackButton/>
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12 ">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-[#C5A059] flex items-center justify-center shadow-lg shadow-[#C5A059]/20">
                <Sparkles className="text-white" size={20} />
              </div>
              <h1 className="text-4xl font-light tracking-tight text-[#2D2A24]">
                The <span className="font-semibold text-[#C5A059]">Jewel </span> Calc
              </h1>
            </div>
            <p className="text-[#A8A294] text-sm ml-14 uppercase tracking-widest font-medium">Values you can Trust</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => update({ showPuritySettings: !state.showPuritySettings })}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm tracking-wide transition-all ${
                state.showPuritySettings
                  ? "bg-[#C5A059] text-white"
                  : "bg-white text-[#C5A059] border-2 border-[#C5A059] hover:bg-[#C5A059] hover:text-white"
              }`}
            >
              <Settings size={16} />
              Purity Settings
            </button>
            <button
              onClick={() => update({ ratesLocked: !state.ratesLocked })}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm tracking-wide transition-all ${
                state.ratesLocked
                  ? "bg-[#2D2A24] text-white"
                  : "bg-white text-[#C5A059] border-2 border-[#C5A059] hover:bg-[#C5A059] hover:text-white"
              }`}
            >
              {state.ratesLocked ? <Lock size={16} /> : <Unlock size={16} />}
              {state.ratesLocked ? "Rates Secured" : "Secure Rates"}
            </button>
          </div>
        </div>

        {/* PURITY SETTINGS SECTION */}
        {state.showPuritySettings && (
          <div className={`${card} mb-8 border-2 border-[#C5A059]/30 bg-[#FFFCF9]`}>
            <span className={labelClass}>Purity Factor Settings</span>
            
            <div className="grid md:grid-cols-2 gap-8 mt-6">
              {/* Gold Purity Factors */}
              <div>
                <h3 className="text-sm font-bold text-[#2D2A24] mb-4">Gold Purity Factors</h3>
                <div className="space-y-3">
                  {Object.entries(state.goldPurityFactors).map(([purity, factor]) => (
                    <div key={purity} className="flex gap-3 items-center">
                      <label className="text-xs font-bold text-[#8B8579] w-16">{purity}</label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        max="1"
                        className={inputStyle}
                        value={factor}
                        onChange={(e) => updateGoldPurityFactor(purity, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Silver Purity Factors */}
              <div>
                <h3 className="text-sm font-bold text-[#2D2A24] mb-4">Silver Purity Factors</h3>
                <div className="space-y-3">
                  {Object.entries(state.silverPurityFactors).map(([purity, factor]) => (
                    <div key={purity} className="flex gap-3 items-center">
                      <label className="text-xs font-bold text-[#8B8579] w-16">{purity}</label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        max="1"
                        className={inputStyle}
                        value={factor}
                        onChange={(e) => updateSilverPurityFactor(purity, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* GOLD SECTION */}
            <div className={card}>
              <span className={labelClass}>Gold Configuration</span>
              <div className="grid md:grid-cols-2 gap-4 mt-2">
                <div className="space-y-4">
                  <label className="text-xs font-semibold text-[#8B8579]">24K Gold Rate (₹/gm)</label>
                  <input
                    disabled={state.ratesLocked}
                    className={inputStyle}
                    value={state.gold24kRate}
                    onChange={(e) => update({ gold24kRate: e.target.value })}
                  />
                  <label className="text-xs font-semibold text-[#8B8579]">Select Purity</label>
                  <select
                    className={selectStyle}
                    value={state.goldPurity}
                    onChange={(e) => update({ goldPurity: e.target.value })}
                  >
                    {Object.keys(state.goldPurityFactors).map((k) => (
                      <option key={k} value={k}>{k} Purity</option>
                    ))}
                  </select>
                </div>
                <div className="bg-[#FDFCFB] border border-[#E5E1DA] rounded-lg p-5 flex flex-col justify-center items-center text-center">
                  <p className="text-[10px] text-[#A8A294] uppercase tracking-tighter mb-1 font-bold">Purity Adjusted Rate</p>
                  <p className="text-2xl font-bold text-[#C5A059]">
                    ₹ {formatCurrency(toNumber(state.gold24kRate) * state.goldPurityFactors[state.goldPurity])}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-xs font-semibold text-[#8B8579]">Total Gold Weight (grams)</label>
                <input
                  className={inputStyle}
                  placeholder="0.00"
                  value={state.goldWeight}
                  onChange={(e) => update({ goldWeight: e.target.value })}
                />
              </div>
            </div>

            {/* SILVER SECTION */}
            <div className={card}>
              <span className={labelClass}>Silver Configuration</span>
              <div className="grid md:grid-cols-2 gap-4 mt-2">
                <div className="space-y-4">
                  <label className="text-xs font-semibold text-[#8B8579]">999 Silver Rate (₹/gm)</label>
                  <input
                    disabled={state.ratesLocked}
                    className={inputStyle}
                    value={state.silverRate}
                    onChange={(e) => update({ silverRate: e.target.value })}
                  />
                  <label className="text-xs font-semibold text-[#8B8579]">Select Purity</label>
                  <select
                    className={selectStyle}
                    value={state.silverPurity}
                    onChange={(e) => update({ silverPurity: e.target.value })}
                  >
                    {Object.keys(state.silverPurityFactors).map((k) => (
                      <option key={k} value={k}>{k} Purity</option>
                    ))}
                  </select>
                </div>
                <div className="bg-[#FDFCFB] border border-[#E5E1DA] rounded-lg p-5 flex flex-col justify-center items-center text-center">
                  <p className="text-[10px] text-[#A8A294] uppercase tracking-tighter mb-1 font-bold">Purity Adjusted Rate</p>
                  <p className="text-2xl font-bold text-[#C5A059]">
                    ₹ {formatCurrency(toNumber(state.silverRate) * state.silverPurityFactors[state.silverPurity])}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-xs font-semibold text-[#8B8579]">Total Silver Weight (grams)</label>
                <input
                  className={inputStyle}
                  placeholder="0.00"
                  value={state.silverWeight}
                  onChange={(e) => update({ silverWeight: e.target.value })}
                />
              </div>
            </div>

            {/* DIAMONDS SECTION */}
            <div className={card}>
              <div
              // className="flex justify-between items-center mb-4 border-b border-[#E5E1DA] pb-4"
              className="relative mb-4 border-b border-[#E5E1DA] pb-4"
              >
                <span 
               // className={labelClass}
                className={`${labelClass} block text-center`}
                >Diamonds Configuration</span>
                <button
                  onClick={addDiamond}
                 className="absolute right-0 top-0 flex items-center gap-1 px-3 py-2 bg-[#C5A059] text-white rounded-lg hover:bg-[#B39049] transition-all text-xs font-semibold"
                 // className="flex items-center gap-1 px-3 py-2 bg-[#C5A059] text-white rounded-lg hover:bg-[#B39049] transition-all text-xs font-semibold"
                >
                  <Plus size={14} /> Add Diamond
                </button>
              </div>

              <div className="space-y-4">
                {state.diamonds.map((diamond, idx) => (
                  <div key={diamond.id} className="bg-[#FDFCFB] border border-[#E5E1DA] rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-xs font-bold text-[#8B8579] uppercase">
                        Diamond {idx + 1}
                      </label>
                      {state.diamonds.length > 1 && (
                        <button
                          onClick={() => removeDiamond(diamond.id)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                      <div>
                        <label className="text-[10px] text-[#A8A294] font-bold mb-1 block uppercase">Shape</label>
                        <select
                          className={selectStyle}
                          value={diamond.shape}
                          onChange={(e) => updateDiamond(diamond.id, "shape", e.target.value)}
                        >
                          {DIAMOND_SHAPES.map((shape) => (
                            <option key={shape} value={shape}>{shape}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-[#A8A294] font-bold mb-1 block uppercase">Rate (₹)</label>
                        <input
                          disabled={state.ratesLocked}
                          className={inputStyle}
                          placeholder="0.00"
                          value={diamond.rate}
                          onChange={(e) => updateDiamond(diamond.id, "rate", e.target.value)}
                        />
                      </div>
                      {/* <div>
                        <label className="text-[10px] text-[#A8A294] font-bold mb-1 block uppercase">Weight (gm)</label>
                        <input
                          className={inputStyle}
                          placeholder="0.00"
                          value={diamond.weight}
                          onChange={(e) => updateDiamond(diamond.id, "weight", e.target.value)}
                        />
                      </div> */}
                      {/* Total Weight */}
<div>
  <label  className="text-[10px] text-[#A8A294] font-bold mb-1 block uppercase">Total Weight (ct)</label>
  <input
    value={diamond.grossWeight}
     className={inputStyle}
    placeholder="0.00"
    onChange={(e) =>
      updateDiamond(diamond.id, "grossWeight", e.target.value)
    }
  />
</div>

{/* Net Weight (auto) */}
<div>
  <label  className="text-[10px] text-[#A8A294] font-bold mb-1 block uppercase">Net Weight (ct)</label>
  <input
    value={diamond.weight}
     className={inputStyle}
      placeholder="0.00"
    readOnly
  />
</div>
                      <div>
                        <label className="text-[10px] text-[#A8A294] font-bold mb-1 block uppercase">Qty (cts)</label>
                        <input
                          className={inputStyle}
                          placeholder="0.00"
                          value={diamond.quantity}
                          onChange={(e) => updateDiamond(diamond.id, "quantity", e.target.value)}
                        />
                      </div>
                    </div>
                    
                  </div>
                ))}
              </div>
              {/* DIAMOND BREAKDOWN */}
{state.breakdown && (
  <div className="mt-4 border-t border-[#E5E1DA] pt-4 space-y-2">
    {state.breakdown.diamondAmounts.map(
      (d) =>
        d.amount > 0 && (
          <div key={d.id} className="flex justify-between text-xs">
            <span className="text-[#8B8579]">
              {d.shape} ({d.weight} × {d.quantity})
            </span>
            <span className="font-semibold">
              ₹ {formatCurrency(d.amount)}
            </span>
          </div>
        )
    )}

    <div className="flex justify-between font-bold text-sm pt-2 border-t">
      <span>Total Diamonds</span>
      <span className="text-[#C5A059]">
        ₹ {formatCurrency(state.breakdown.totalDiamondAmount)}
      </span>
    </div>
  </div>
)}

            </div>

            {/* STONES SECTION */}
            <div className={card}>
              <div className="relative mb-4 border-b border-[#E5E1DA] pb-4">
                <span className={`${labelClass} block text-center`} >Precious Stones</span>
                <button
                  onClick={addStone}
                 className="absolute right-0 top-0 flex items-center gap-1 px-3 py-2 bg-[#C5A059] text-white rounded-lg hover:bg-[#B39049] transition-all text-xs font-semibold"
                //  className="flex items-center gap-1 px-3 py-2 bg-[#C5A059] text-white rounded-lg hover:bg-[#B39049] transition-all text-xs font-semibold"
                >
                  <Plus size={14} /> Add Stone
                </button>
              </div>

              <div className="space-y-4">
                {state.stones.map((stone, idx) => (
                  <div key={stone.id} className="bg-[#FDFCFB] border border-[#E5E1DA] rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-xs font-bold text-[#8B8579] uppercase">
                        Stone {idx + 1}
                      </label>
                      {state.stones.length > 1 && (
                        <button
                          onClick={() => removeStone(stone.id)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] text-[#A8A294] font-bold mb-1 block uppercase">Stone Type</label>
                        <select
                          className={selectStyle}
                          value={stone.type}
                          onChange={(e) => updateStone(stone.id, "type", e.target.value)}
                        >
                          {STONE_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-[#A8A294] font-bold mb-1 block uppercase">Rate (₹)</label>
                        <input
                          disabled={state.ratesLocked}
                          className={inputStyle}
                          placeholder="0.00"
                          value={stone.rate}
                          onChange={(e) => updateStone(stone.id, "rate", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#A8A294] font-bold mb-1 block uppercase">Weight (gm)</label>
                        <input
                          className={inputStyle}
                          placeholder="0.00"
                          value={stone.weight}
                          onChange={(e) => updateStone(stone.id, "weight", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#A8A294] font-bold mb-1 block uppercase">Quantity</label>
                        <input
                          className={inputStyle}
                          placeholder="0.00"
                          value={stone.quantity}
                          onChange={(e) => updateStone(stone.id, "quantity", e.target.value)}
                        />
                      </div>
                      
                    </div>
                    {/* {state.breakdown && (
  <div className="mt-4 border-t border-[#E5E1DA] pt-4 space-y-2">
    {state.breakdown.stoneAmounts.map(
      (s) =>
        s.amount > 0 && (
          <div key={s.id} className="flex justify-between text-xs">
            <span className="text-[#8B8579]">
              {s.type} ({s.weight} × {s.quantity})
            </span>
            <span className="font-semibold">
              ₹ {formatCurrency(s.amount)}
            </span>
          </div>
        )
    )}

    <div className="flex justify-between font-bold text-sm pt-2 border-t">
      <span>Total Stones</span>
      <span className="text-[#C5A059]">
        ₹ {formatCurrency(state.breakdown.totalStoneAmount)}
      </span>
    </div>
  </div>
)} */}
                    
                  </div>
                ))}
              </div>
              {/* STONE BREAKDOWN */}
{state.breakdown && (
  <div className="mt-4 border-t border-[#E5E1DA] pt-4 space-y-2">
    {state.breakdown.stoneAmounts.map(
      (s) =>
        s.amount > 0 && (
          <div key={s.id} className="flex justify-between text-xs">
            <span className="text-[#8B8579]">
              {s.type} ({s.weight} × {s.quantity})
            </span>
            <span className="font-semibold">
              ₹ {formatCurrency(s.amount)}
            </span>
          </div>
        )
    )}

    <div className="flex justify-between font-bold text-sm pt-2 border-t">
      <span>Total Stones</span>
      <span className="text-[#C5A059]">
        ₹ {formatCurrency(state.breakdown.totalStoneAmount)}
      </span>
    </div>
  </div>
)}

            </div>

            {/* MAKING & TAXES */}
            <div className={card}>
              <span className={labelClass}>Crafting & Discounts</span>
              <div className="grid md:grid-cols-2 gap-8 mt-4">
                <div className="space-y-4">
                   <div>
                    <label className="text-xs font-semibold text-[#8B8579]">Gold Making (₹/gm)</label>
                    <input disabled={state.ratesLocked} className={inputStyle} value={state.goldMakingRate} onChange={(e) => update({ goldMakingRate: e.target.value })} />
                   </div>
                   <div>
                    <label className="text-xs font-semibold text-[#8B8579]">Silver Making (₹/gm)</label>
                    <input disabled={state.ratesLocked} className={inputStyle} value={state.silverMakingRate} onChange={(e) => update({ silverMakingRate: e.target.value })} />
                   </div>
                   <div>
                    <label className="text-xs font-semibold text-[#8B8579]">GST (%)</label>
                    <input className={inputStyle} value={state.gst} onChange={(e) => update({ gst: e.target.value })} />
                   </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-[#8B8579]">Discount Applies On</label>
                    <select className={selectStyle} value={state.discountType} onChange={(e) => update({ discountType: e.target.value })}>
                      <option value="making">Discount Only Making Charges</option>
                      <option value="value">Discount(D&M)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#8B8579]">Discount Method</label>
                    <div className="flex bg-[#FDFCFB] border border-[#E5E1DA] rounded-lg p-1">
                      {["percent", "flat"].map((m) => (
                        <button key={m} onClick={() => update({ discountMode: m })} className={`flex-1 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${state.discountMode === m ? "bg-[#C5A059] text-white shadow-md" : "text-[#A8A294]"}`}>
                          {m === "percent" ? "Percentage" : "Flat Cash"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#8B8579]">Discount Value</label>
                    <input className={inputStyle} placeholder={state.discountMode === "percent" ? "%" : "₹"} value={state.discountValue} onChange={(e) => update({ discountValue: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SUMMARY SIDEBAR */}
          <div className="lg:col-span-1">
            {state.breakdown && (
              <div className={`${card} sticky top-6 border-2 border-[#C5A059]/10`}>
                <div className="flex items-center gap-2 mb-6 border-b border-[#FAF9F6] pb-4">
                  <Sigma className="text-[#C5A059]" size={18} />
                  <span className="text-sm font-bold uppercase tracking-widest text-[#2D2A24]">Pricing Summary</span>
                </div>

                <div className="space-y-3 text-sm max-h-96 overflow-y-auto">
                  {state.breakdown.goldAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#A8A294] font-medium">Gold Value</span>
                      <span className="font-semibold text-[#4A453A]">₹ {formatCurrency(state.breakdown.goldAmount)}</span>
                    </div>
                  )}
                  {state.breakdown.silverAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#A8A294] font-medium">Silver Value</span>
                      <span className="font-semibold text-[#4A453A]">₹ {formatCurrency(state.breakdown.silverAmount)}</span>
                    </div>
                  )}
{/* 
                  {state.breakdown.diamondAmounts.map((d) => d.amount > 0 && (
                    <div key={d.id} className="flex justify-between items-center text-xs">
                      <span className="text-[#A8A294] font-medium">{d.shape} Diamond</span>
                      <span className="font-semibold text-[#4A453A]">₹ {formatCurrency(d.amount)}</span>
                    </div>
                  ))}

                  {state.breakdown.stoneAmounts.map((s) => s.amount > 0 && (
                    <div key={s.id} className="flex justify-between items-center text-xs">
                      <span className="text-[#A8A294] font-medium">{s.type}</span>
                      <span className="font-semibold text-[#4A453A]">₹ {formatCurrency(s.amount)}</span>
                    </div>
                  ))} */}
                  {state.breakdown.totalDiamondAmount > 0 && (
  <div className="flex justify-between items-center">
    <span className="text-[#A8A294] font-medium">Diamonds Value</span>
    <span className="font-semibold text-[#4A453A]">
      ₹ {formatCurrency(state.breakdown.totalDiamondAmount)}
    </span>
  </div>
)}

{state.breakdown.totalStoneAmount > 0 && (
  <div className="flex justify-between items-center">
    <span className="text-[#A8A294] font-medium">Stones Value</span>
    <span className="font-semibold text-[#4A453A]">
      ₹ {formatCurrency(state.breakdown.totalStoneAmount)}
    </span>
  </div>
)}


                  {state.breakdown.totalMaking > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#A8A294] font-medium">Making Charges</span>
                      <span className="font-semibold text-[#4A453A]">₹ {formatCurrency(state.breakdown.totalMaking)}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-[#FAF9F6] space-y-3">
                  <div className="flex justify-between text-[#4A453A] font-medium">
                    <span>Gross Total</span>
                    <span>₹ {formatCurrency(state.breakdown.subtotal)}</span>
                  </div>
                  {state.breakdown.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium italic">
                      <span>Applied Discount</span>
                      <span>- ₹ {formatCurrency(state.breakdown.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#A8A294] text-xs">
                    <span>GST (Tax)</span>
                    <span>₹ {formatCurrency(state.breakdown.gstAmount)}</span>
                  </div>
                </div>

                <div className="mt-8 bg-[#2D2A24] rounded-xl p-6 shadow-xl shadow-[#2D2A24]/10 relative overflow-hidden bg-[#663253]">
                  <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full"></div>
                  <p className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.2em] mb-1 ">Final Price</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[#C5A059] text-lg font-bold">₹</span>
                    <span className="text-3xl font-bold text-white tracking-tight">
                      {formatCurrency(state.total)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}