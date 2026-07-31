import React, { useState, useEffect } from "react";
import { X, Gift, Percent, Tag, Cake, Heart, Sparkles, Check, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function CelebrationDiscountModal({
  isOpen,
  onClose,
  celebrationAlert,
  cart,
  rates,
  onApplyDiscount,
}) {
  const [target, setTarget] = useState("MAKING"); // MAKING, DIAMOND, STONE, FLAT
  const [discountMode, setDiscountMode] = useState("PERCENT"); // PERCENT, FLAT
  const [value, setValue] = useState(20);
  const [minWeight, setMinWeight] = useState(0);

  useEffect(() => {
    const activeRates = rates?.rawRates || rates?.raw || rates;
    if (celebrationAlert && activeRates) {
      if (celebrationAlert.type === "BIRTHDAY") {
        const rawTarget = activeRates.birthdayDiscountTarget || "MAKING";
        const rawType = activeRates.birthdayDiscountType || "percent";
        setTarget(String(rawTarget).toUpperCase());
        setDiscountMode(String(rawType).toUpperCase() === "FLAT" ? "FLAT" : "PERCENT");
        setValue(Number(activeRates.birthdayDiscountValue ?? 20));
        setMinWeight(Number(activeRates.birthdayMinWeight || 0));
      } else {
        const rawTarget = activeRates.anniversaryDiscountTarget || "MAKING";
        const rawType = activeRates.anniversaryDiscountType || "percent";
        setTarget(String(rawTarget).toUpperCase());
        setDiscountMode(String(rawType).toUpperCase() === "FLAT" ? "FLAT" : "PERCENT");
        setValue(Number(activeRates.anniversaryDiscountValue ?? 20));
        setMinWeight(Number(activeRates.anniversaryMinWeight || 0));
      }
    }
  }, [celebrationAlert, rates, isOpen]);

  if (!isOpen || !celebrationAlert) return null;

  // Calculate base category values from cart
  const calculateBaseValue = () => {
    if (!cart?.items?.length) return 0;

    if (target === "MAKING") {
      return cart.items.reduce((sum, item) => {
        const snap = item.breakup || item.customSnapshot?.pricingSnapshot || item.itemSnapshot?.pricingSnapshot || {};
        return sum + (Number(snap.makingCharge) || 0);
      }, 0);
    } else if (target === "DIAMOND") {
      return cart.items.reduce((sum, item) => {
        const snap = item.breakup || item.customSnapshot?.pricingSnapshot || item.itemSnapshot?.pricingSnapshot || {};
        return sum + (Number(snap.diamondValue || snap.totalDiamondValue) || 0);
      }, 0);
    } else if (target === "STONE") {
      return cart.items.reduce((sum, item) => {
        const snap = item.breakup || item.customSnapshot?.pricingSnapshot || item.itemSnapshot?.pricingSnapshot || {};
        return sum + (Number(snap.stoneValue || snap.totalStoneValue) || 0);
      }, 0);
    } else {
      // FLAT
      return cart.totals?.subtotal || cart.totals?.grandTotal || 0;
    }
  };

  // Calculate actual current weight in cart for target category
  const calculateCartWeight = () => {
    if (!cart?.items?.length) return 0;
    if (target === "DIAMOND") {
      return cart.items.reduce((sum, item) => {
        const snap = item.breakup || item.customSnapshot?.pricingSnapshot || item.itemSnapshot?.pricingSnapshot || {};
        const comps = snap.componentBreakup || item.customSnapshot?.productDetails?.components || [];
        let dWt = Number(snap.totalDiamondWeight || 0);
        if (dWt === 0 && comps.length > 0) {
          dWt = comps.filter(c => c.pricingRef === "DIAMOND" || c.type === "Diamond").reduce((s, c) => s + (Number(c.weight || 0) * Number(c.count || 1)), 0);
        }
        return sum + dWt;
      }, 0);
    } else if (target === "STONE") {
      return cart.items.reduce((sum, item) => {
        const snap = item.breakup || item.customSnapshot?.pricingSnapshot || {};
        return sum + (snap.stoneValue > 0 ? 1 : 0);
      }, 0);
    } else {
      // MAKING or FLAT (Net Weight)
      return cart.items.reduce((sum, item) => {
        const pd = item.customSnapshot?.productDetails || item.itemSnapshot?.productDetails || item;
        return sum + Number(pd.netWeight || item.netWeight || 0);
      }, 0);
    }
  };

  const baseCategoryValue = calculateBaseValue();
  const actualWeight = calculateCartWeight();
  const unit = target === "DIAMOND" || target === "STONE" ? "ct" : "g";
  const meetsWeightRequirement = minWeight <= 0 || actualWeight >= minWeight;

  // Calculate discount amount in Rupees
  const calculatedDiscount = meetsWeightRequirement
    ? Math.round(
        discountMode === "PERCENT"
          ? (baseCategoryValue * Number(value || 0)) / 100
          : Math.min(Number(value || 0), baseCategoryValue)
      )
    : 0;

  const handleApply = () => {
    if (!meetsWeightRequirement) {
      toast.error(`Minimum ${minWeight} ${unit} weight required for ${celebrationAlert.type === "BIRTHDAY" ? "Birthday" : "Anniversary"} discount. (Current: ${actualWeight.toFixed(2)} ${unit})`);
      return;
    }

    if (calculatedDiscount <= 0) {
      toast.error("Discount amount must be greater than 0");
      return;
    }

    const targetLabelMap = {
      MAKING: "Making Charges",
      DIAMOND: "Diamond Charges",
      STONE: "Stone Charges",
      FLAT: "Total Bill Amount",
    };

    const discountObj = {
      title: `${celebrationAlert.type === "BIRTHDAY" ? "Birthday" : "Anniversary"} Discount (${value}${discountMode === "PERCENT" ? "%" : "₹"} on ${targetLabelMap[target]})`,
      type: celebrationAlert.type,
      target,
      discountMode,
      value: Number(value),
      minWeight: Number(minWeight),
      amount: calculatedDiscount,
      customerName: celebrationAlert.customerName,
    };

    onApplyDiscount(discountObj);
    toast.success(`🎉 ₹${calculatedDiscount} Celebration Discount applied for ${celebrationAlert.customerName}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden bg-white border border-stone-200 text-stone-900 font-sans my-8">
        
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between text-white ${
          celebrationAlert.type === "BIRTHDAY"
            ? "bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700"
            : "bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800"
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md text-white">
              {celebrationAlert.type === "BIRTHDAY" ? <Cake size={22} /> : <Heart size={22} />}
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-1.5">
                {celebrationAlert.type === "BIRTHDAY" ? "Birthday Special Discount" : "Anniversary Special Discount"}
              </h3>
              <p className="text-xs text-white/80">
                Exclusive offer for <span className="font-bold text-amber-200">{celebrationAlert.customerName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">

          {/* Offer Summary Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border border-purple-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#5D3354] flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" /> Admin Pre-Configured Rule
              </span>
              <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 border border-purple-300 font-bold text-[9px] uppercase rounded-full">
                Preset Offer
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-purple-100/60 shadow-2xs space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-500 font-medium">Applied Category:</span>
                <span className="font-bold text-stone-800 uppercase tracking-wide">
                  {target === "MAKING" ? "🔨 Making Charges" : target === "DIAMOND" ? "💎 Diamond Value" : target === "STONE" ? "🔮 Stone Value" : "🏷️ Total Bill"}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-500 font-medium">Configured Offer:</span>
                <span className="font-extrabold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                  {value}{discountMode === "PERCENT" ? "% OFF" : "₹ OFF"}
                </span>
              </div>

              {minWeight > 0 && (
                <div className="flex justify-between items-center text-xs border-t border-stone-100 pt-2.5">
                  <span className="text-stone-500 font-medium">Min Weight Required:</span>
                  <span className={`font-bold font-mono text-xs px-2 py-0.5 rounded ${meetsWeightRequirement ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-100 text-amber-900 border border-amber-300"}`}>
                    {minWeight} {unit} (Cart: {actualWeight.toFixed(2)} {unit})
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-xs border-t border-stone-100 pt-2.5">
                <span className="text-stone-500 font-medium">Category Base Amount:</span>
                <span className="font-bold text-stone-900 font-mono text-sm">₹{baseCategoryValue.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Minimum Weight Requirement Warning Banner */}
            {!meetsWeightRequirement && (
              <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-400 text-amber-900 text-xs font-semibold flex items-start gap-2">
                <span className="text-base">⚠️</span>
                <div>
                  <p className="font-bold">Minimum Weight Threshold Not Met</p>
                  <p className="text-[11px] text-amber-800 font-normal mt-0.5">
                    This offer requires minimum <strong className="font-bold">{minWeight} {unit}</strong> {target === "DIAMOND" ? "diamond" : target === "STONE" ? "stone" : "item"} weight. Current cart weight is <strong className="font-bold">{actualWeight.toFixed(2)} {unit}</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Calculated Discount Card */}
            <div className={`p-4 rounded-xl text-white shadow-md flex items-center justify-between transition-all ${
              meetsWeightRequirement ? "bg-gradient-to-r from-emerald-500 to-teal-600" : "bg-stone-400"
            }`}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-100">Calculated Savings</p>
                <p className="text-xs text-white/90 font-medium mt-0.5">
                  {meetsWeightRequirement ? "Discount applied on bill" : "Not eligible due to weight threshold"}
                </p>
              </div>
              <span className="text-2xl font-black font-mono tracking-tight text-white">
                -₹{calculatedDiscount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-center text-stone-400 font-medium">
            *Discount parameters and weight thresholds are managed centrally in Admin Rate Configurations.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={!meetsWeightRequirement}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5 active:scale-[0.98] disabled:bg-stone-300 disabled:shadow-none disabled:cursor-not-allowed"
            >
              <Check size={16} /> Apply Discount to Bill
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
