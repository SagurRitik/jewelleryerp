

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveRates, getActiveRates } from "../../api/ratesApi";
import { useRates } from "../../context/RatesContext";
import { useProductList } from "../../context/ProductListContext";
import { useCart } from "../../context/CartContext";
import { toast } from "sonner";
import { fetchLiveRates } from "../../api/liveMarketApi";
import { RefreshCw } from "lucide-react";

export default function RatesPage() {
  const navigate = useNavigate();
  const { refreshRates } = useRates();
  const { refresh, invalidateCache } = useProductList();
  const { fetchCartSummary } = useCart();


  const [rates, setRates] = useState({
    gold24KT: "",
    silver999: "",
    platinum950: "",
    diamondRate: "",
    stoneRate: "",
    makingCharge: "",
    goldMakingCharge: "",
    silverMakingCharge: "",
    platinumMakingCharge: "",
    minMakingWeight: "",

    minMakingFlatFee: "",
    gstRate: 3,
    makingDiscountType: "none",
    makingDiscountValue: 0,
    diamondDiscountType: "none",
    diamondDiscountValue: 0,
    stoneDiscountType: "none",
    stoneDiscountValue: 0,
    discountEnabled: true,
  });

  const [loading, setLoading] = useState(false);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveRates, setLiveRates] = useState(null);

  const getLiveMarketData = async () => {
    try {
      setLiveLoading(true);
      const data = await fetchLiveRates();
      setLiveRates(data);
    } catch (err) {
      console.error("Live Rates Error:", err);
    } finally {
      setLiveLoading(false);
    }
  };

  useEffect(() => {
    getLiveMarketData();
  }, []);

  useEffect(() => {
    const loadRates = async () => {
      try {
        const res = await getActiveRates();
        if (res?.data?.rates) {
          setRates((prev) => ({ ...prev, ...res.data.rates }));
        }
      } catch (err) {
        console.error("Failed to load rates", err);
      }
    };
    loadRates();
  }, []);

  const save = async () => {
    const toastId = toast.loading("Saving rates...");
    try {
      setLoading(true);
      await saveRates(rates);
      await refreshRates();
      invalidateCache();
      refresh();
      await fetchCartSummary();
      toast.success("Rates updated successfully", { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save rates");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <header className="mb-10">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">
            Configurations / Global Rates
          </p>
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h1 className="text-4xl font-bold text-[#5D3354]">Rate Configuration</h1>

            {/* LIVE RATES PILLS */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Gold Pill */}
              <div className="flex items-center gap-2 bg-[#1E293B] text-white px-4 py-2 rounded-full shadow-md">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Gold 24K</span>
                <span className="text-sm font-bold text-yellow-400">
                  {liveLoading ? "..." : liveRates ? `₹${liveRates.gold.toLocaleString('en-IN')}/gm` : "---"}
                </span>
              </div>

              {/* Silver Pill */}
              <div className="flex items-center gap-2 bg-[#1E293B] text-white px-4 py-2 rounded-full shadow-md">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Silver 999</span>
                <span className="text-sm font-bold text-slate-300">
                  {liveLoading ? "..." : liveRates?.silver ? `₹${liveRates.silver.toLocaleString('en-IN')}/gm` : "---"}
                </span>
              </div>

              {/* Refresh Button */}
              <button
                onClick={getLiveMarketData}
                disabled={liveLoading}
                className="flex items-center gap-1.5 bg-[#1E293B] text-slate-400 hover:text-white px-3 py-2 rounded-full shadow-md transition-colors disabled:opacity-40"
                title="Refresh Live Rates"
              >
                <RefreshCw size={12} className={liveLoading ? 'animate-spin' : ''} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Refresh</span>
              </button>
            </div>
          </div>
          <p className="text-gray-500 max-w-2xl text-sm leading-relaxed">
            Centrally manage live market-indexed precious metal rates and global
            discount rules to ensure pricing consistency across all sales channels.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">



            {/* METAL RATES */}
            <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-[#5D3354] mb-1">Precious Metal Rates</h2>
              <p className="text-xs text-gray-400 mb-6">Live market adjustments per gram</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <RateInput
                  label="GOLD (24KT)"
                  value={rates.gold24KT}
                  onChange={(v) => setRates({ ...rates, gold24KT: v })}
                />
                <RateInput
                  label="SILVER (999)"
                  value={rates.silver999}
                  onChange={(v) => setRates({ ...rates, silver999: v })}
                />
                <RateInput
                  label="PLATINUM (950)"
                  value={rates.platinum950}
                  onChange={(v) => setRates({ ...rates, platinum950: v })}
                />
              </div>
            </section>

            {/* DIAMOND CARD - THEMED */}
            <section className="relative overflow-hidden bg-[#5D3354] rounded-xl p-8 shadow-lg text-white">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-4">Diamond & Stone Pricing</h2>
                <p className="text-sm text-gray-200 mb-6 max-w-md leading-relaxed">
                  System-wide prices are calculated dynamically using our proprietary
                  multi-tier Rate Master. Formulas integrate Shape, Weight Slab, Color, and Clarity in real-time. If no specific slab matches natively, these fallback rates apply.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div>
                    <label className="text-[10px] font-bold text-gray-300 mb-2 block uppercase">Fallback Diamond Rate</label>
                    <input
                      type="number"
                      value={rates.diamondRate || ""}
                      onChange={(e) => setRates({ ...rates, diamondRate: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-lg font-semibold text-white outline-none focus:border-white/50 transition-colors"
                      placeholder="e.g. 15000"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-300 mb-2 block uppercase">Fallback Stone Rate</label>
                    <input
                      type="number"
                      value={rates.stoneRate || ""}
                      onChange={(e) => setRates({ ...rates, stoneRate: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-lg font-semibold text-white outline-none focus:border-white/50 transition-colors"
                      placeholder="e.g. 2000"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => navigate("/admin/diamond-rates")}
                    className="bg-white text-[#5D3354] px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-100 transition"
                  >
                    Manage Diamond Rates
                  </button>
                  <button
                    onClick={() => navigate("/admin/stone-rates")}
                    className="bg-white/20 backdrop-blur-sm border border-white/30 px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-white/30 transition"
                  >
                    Manage Stone Rates
                  </button>
                </div>
              </div>
              {/* Decorative Diamond Icon Background */}
              <div className="absolute right-[-20px] bottom-[-20px] opacity-10 rotate-12">
                <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 9l10 13 10-13L12 2zm0 2.5l7.5 5.5-7.5 9.5L4.5 10 12 4.5z" />
                </svg>
              </div>
            </section>

            {/* SERVICE CHARGES */}
            <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-[#5D3354] mb-1">Service & Making Charges</h2>
              <p className="text-xs text-gray-400 mb-8">Global labor and taxation overheads</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <Input
                  label="GOLD MAKING RATE (PER GM)"
                  value={rates.goldMakingCharge}
                  onChange={(v) => setRates({ ...rates, goldMakingCharge: v })}
                />
                <Input
                  label="SILVER MAKING RATE (PER GM)"
                  value={rates.silverMakingCharge}
                  onChange={(v) => setRates({ ...rates, silverMakingCharge: v })}
                />
                <Input
                  label="PLATINUM MAKING RATE (PER GM)"
                  value={rates.platinumMakingCharge}
                  onChange={(v) => setRates({ ...rates, platinumMakingCharge: v })}
                />
                <Input
                  label="APPLICABLE GST (%)"
                  value={rates.gstRate}
                  onChange={(v) => setRates({ ...rates, gstRate: v })}
                />

                <Input
                  label="MIN WEIGHT THRESHOLD (GM)"
                  value={rates.minMakingWeight}
                  onChange={(v) => setRates({ ...rates, minMakingWeight: v })}
                />
                <Input
                  label="FLAT FEE (IF <= MIN WT)"
                  value={rates.minMakingFlatFee}
                  onChange={(v) => setRates({ ...rates, minMakingFlatFee: v })}
                  isCurrency
                />
              </div>
            </section>
          </div>

          {/* RIGHT SIDEBAR - DISCOUNTS */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-fit">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-bold text-[#5D3354]">Discount Rules</h2>
                <button
                  onClick={() => setRates(prev => ({ ...prev, discountEnabled: !prev.discountEnabled }))}
                  className={`
                    flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all
                    ${rates.discountEnabled
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-600 border border-red-100"
                    }
                  `}
                >
                  {rates.discountEnabled ? "Active" : "Disabled"}
                  <div className={`w-2 h-2 rounded-full ${rates.discountEnabled ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mb-6 uppercase tracking-wider">Automatic markdowns applied at checkout</p>

              <div className="space-y-4">
                <DiscountRow
                  label="DIAMOND DISCOUNT"
                  type={rates.diamondDiscountType}
                  value={rates.diamondDiscountValue}
                  onTypeChange={(v) => setRates({ ...rates, diamondDiscountType: v })}
                  onValueChange={(v) => setRates({ ...rates, diamondDiscountValue: v })}
                />
                <DiscountRow
                  label="STONE DISCOUNT"
                  type={rates.stoneDiscountType}
                  value={rates.stoneDiscountValue}
                  onTypeChange={(v) => setRates({ ...rates, stoneDiscountType: v })}
                  onValueChange={(v) => setRates({ ...rates, stoneDiscountValue: v })}
                />
                <DiscountRow
                  label="MAKING DISCOUNT"
                  type={rates.makingDiscountType}
                  value={rates.makingDiscountValue}
                  onTypeChange={(v) => setRates({ ...rates, makingDiscountType: v })}
                  onValueChange={(v) => setRates({ ...rates, makingDiscountValue: v })}
                />
              </div>
            </div>

            <button
              onClick={save}
              disabled={loading}
              className="w-full bg-[#7D4A74] hover:bg-[#5D3354] text-white py-4 rounded-xl font-bold transition-all shadow-md active:scale-[0.98] disabled:bg-gray-300"
            >
              {loading ? "Saving..." : "Save Rates"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= HELPER COMPONENTS ================= */

const RateInput = ({ label, value, onChange }) => (
  <div className="flex flex-col">
    <label className="text-[10px] font-bold text-gray-400 mb-2">{label}</label>
    <div className="flex items-center bg-gray-50 border border-gray-100 rounded-lg overflow-hidden focus-within:border-gray-300 transition">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent p-3 text-lg font-semibold text-gray-700 outline-none"
      />
      <span className="px-3 text-gray-400 text-xs font-medium border-l border-gray-200">₹/gm</span>
    </div>
  </div>
);

const Input = ({ label, value, onChange, isCurrency }) => (
  <div>
    <label className="text-[10px] font-bold text-gray-400 mb-2 block">{label}</label>
    <div className="relative">
      {isCurrency && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-medium">₹</span>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-[#F4F7F9] border-none rounded-lg p-3 text-gray-800 font-semibold focus:ring-2 focus:ring-[#5D3354]/20 outline-none ${isCurrency ? 'pl-8' : ''}`}
      />
    </div>
  </div>
);

const DiscountRow = ({ label, type, value, onTypeChange, onValueChange }) => (
  <div className="p-4 bg-[#F8FAFC] rounded-lg border border-gray-50">
    <label className="text-[10px] font-bold text-gray-400 mb-3 block uppercase tracking-wider">{label}</label>
    <div className="flex gap-2">
      <select
        value={type}
        onChange={(e) => onTypeChange(e.target.value)}
        className="w-3/5 bg-white border border-gray-200 rounded-md p-2 text-sm text-gray-700 outline-none focus:border-gray-400"
      >
        <option value="none">None</option>
        <option value="percent">Percent</option>
        <option value="flat">Flat</option>
      </select>
      <input
        type="number"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={type === "none"}
        className="w-2/5 bg-white border border-gray-200 rounded-md p-2 text-sm font-bold text-gray-700 outline-none text-center focus:border-gray-400 disabled:opacity-50"
      />
    </div>
  </div>
);