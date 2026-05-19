import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Edit, Eye, EyeOff, Gem, Loader2, BadgeDollarSign, ShieldCheck } from "lucide-react";
import API from "../api";
import { toast } from "sonner";
import { useTheme } from "../context/ThemeContext";

export default function DiamondDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [diamond, setDiamond] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hideCost, setHideCost] = useState(true); // Hidden by default!

  useEffect(() => {
    fetchDiamond();
  }, [id]);

  const fetchDiamond = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/diamonds/${id}`);
      setDiamond(res.data.diamond);
    } catch (error) {
      toast.error("Failed to fetch diamond details");
      navigate("/diamonds");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#714760]" size={40} />
      </div>
    );
  }

  if (!diamond) return null;

  const weight = Number(diamond.weight || 0);
  const costPrice = Number(diamond.costPrice || 0);
  const sellingPrice = Number(diamond.sellingPrice || 0);

  const sellingRatePerCarat = weight > 0 ? (sellingPrice / weight).toFixed(2) : "0.00";
  const costRatePerCarat = weight > 0 ? (costPrice / weight).toFixed(2) : "0.00";

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      isDark ? "bg-[#121212] text-white" : "bg-[#fcfaf8] text-[#2f2430]"
    }`}>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/diamonds")}
            className={`flex items-center gap-2 transition-colors ${
              isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-[#714760]"
            }`}
          >
            <ChevronLeft size={20} />
            Back to Inventory
          </button>
          
          <div className="flex items-center gap-3">
            {diamond.status === "AVAILABLE" && (
              <button
                onClick={() => navigate("/manual-billing", { 
                  state: { 
                    prefillDiamond: {
                      title: `Loose Diamond - ${diamond.shape} ${diamond.weight}ct`,
                      qty: 1,
                      weight: diamond.weight,
                      rate: diamond.weight > 0 ? (diamond.sellingPrice / diamond.weight) : 0,
                      certificateNo: diamond.certificateNo,
                      sku: diamond.sku,
                      shape: diamond.shape,
                      color: diamond.color,
                      clarity: diamond.clarity,
                      lab: diamond.lab,
                      labNatural: diamond.labNatural,
                      diamondId: diamond._id
                    } 
                  } 
                })}
                className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-all shadow-md active:scale-95 text-sm"
              >
                Sell Diamond
              </button>
            )}
            
            <button
              onClick={() => navigate(`/diamonds/edit/${diamond._id}`)}
              className="flex items-center gap-2 bg-[#5a374f] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#4a2b3d] transition-all shadow-md active:scale-95 text-sm"
            >
              <Edit size={16} />
              Edit Diamond
            </button>
          </div>
        </div>

        {/* Collapsible Cost Price Details Section */}
        <div className={`rounded-3xl border overflow-hidden shadow-md transition-all duration-300 ${
          isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-[#eadfdf]"
        }`}>
          <button
            type="button"
            onClick={() => setHideCost(!hideCost)}
            className="w-full flex items-center justify-between p-6 focus:outline-none transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className={hideCost ? "text-amber-500" : "text-green-500"} size={24} />
              <div className="text-left">
                <p className="font-bold text-sm tracking-wide">Cost Price & Carat Rate Details</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {hideCost ? "🔒 Locked • Click here to reveal Cost Details" : "🔓 Unlocked • Cost details visible"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase ${
                hideCost 
                  ? "bg-amber-500/10 text-amber-500 dark:text-amber-300 border border-amber-500/20"
                  : "bg-green-500/10 text-green-600 dark:text-green-300 border border-green-500/20"
              }`}>
                {hideCost ? "Hidden" : "Revealed"}
              </span>
              {hideCost ? <Eye size={18} className="text-gray-400" /> : <EyeOff size={18} className="text-[#714760]" />}
            </div>
          </button>

          {/* Collapsible Panel Content */}
          <div className={`transition-all duration-300 overflow-hidden ${
            hideCost ? "max-h-0 opacity-0" : "max-h-[300px] opacity-100 border-t border-dashed border-gray-300/30 p-6"
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-4 rounded-xl ${isDark ? "bg-white/5 border border-white/5" : "bg-[#fcfaf8] border border-[#f0e6e9]"}`}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Cost Price</p>
                <p className="text-xl font-bold font-mono mt-1 text-red-500">₹{costPrice.toLocaleString("en-IN")}</p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? "bg-white/5 border border-white/5" : "bg-[#fcfaf8] border border-[#f0e6e9]"}`}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cost Price per Carat (Rate)</p>
                <p className="text-xl font-bold font-mono mt-1 text-red-500">₹{Number(costRatePerCarat).toLocaleString("en-IN")} <span className="text-xs font-normal text-gray-500">/ ct</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Specifications Card */}
        <div className={`rounded-[32px] border shadow-xl overflow-hidden ${
          isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-[#eadfdf]"
        }`}>
          {/* Top Banner / Identity */}
          <div className="bg-gradient-to-r from-[#5a374f] to-[#8c5f5f] p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                  <Gem size={36} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold">{diamond.shape || "Loose Diamond"}</h1>
                    {diamond.labNatural && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        diamond.labNatural === "Lab Grown"
                          ? "bg-amber-400/30 text-amber-200 border border-amber-400/40"
                          : "bg-teal-400/30 text-teal-200 border border-teal-400/40"
                      }`}>
                        {diamond.labNatural}
                      </span>
                    )}
                  </div>
                  <p className="text-white/70 text-sm mt-1">SKU / Stock ID: <span className="font-mono text-white font-bold">{diamond.sku}</span></p>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="flex flex-col items-start md:items-end">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider ${
                  diamond.status === "AVAILABLE" ? "bg-green-500/20 text-green-300 border border-green-500/30" :
                  diamond.status === "SOLD" ? "bg-red-500/20 text-red-300 border border-red-500/30" :
                  "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}>
                  {diamond.status}
                </span>
                <p className="text-xs text-white/50 mt-1">
                  Added on {new Date(diamond.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            
            {/* Core Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className={`p-5 rounded-2xl border ${isDark ? "bg-[#252525] border-white/5" : "bg-[#fcfaf8] border-[#f0e6e9]"}`}>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Weight</p>
                <p className="text-2xl font-bold mt-1 text-[#714760]">{diamond.weight} <span className="text-sm font-normal">Carats</span></p>
              </div>
              <div className={`p-5 rounded-2xl border ${isDark ? "bg-[#252525] border-white/5" : "bg-[#fcfaf8] border-[#f0e6e9]"}`}>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Color Grade</p>
                <p className="text-2xl font-bold mt-1">{diamond.color || "—"}</p>
              </div>
              <div className={`p-5 rounded-2xl border ${isDark ? "bg-[#252525] border-white/5" : "bg-[#fcfaf8] border-[#f0e6e9]"}`}>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Clarity Grade</p>
                <p className="text-2xl font-bold mt-1">{diamond.clarity || "—"}</p>
              </div>
              <div className={`p-5 rounded-2xl border ${isDark ? "bg-[#252525] border-white/5" : "bg-[#fcfaf8] border-[#f0e6e9]"}`}>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Cut Grade</p>
                <p className="text-2xl font-bold mt-1">{diamond.cut || "—"}</p>
              </div>
            </div>

            {/* Certificate and Lab Info */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <ShieldCheck size={14} />
                Certification & Lab Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-4 rounded-xl border ${isDark ? "bg-white/5 border-white/5" : "bg-white border-[#ebdbe2]"}`}>
                  <p className="text-xs text-gray-400">Grading Laboratory</p>
                  <p className="font-semibold text-lg mt-1">{diamond.lab || "None / Uncertified"}</p>
                </div>
                <div className={`p-4 rounded-xl border ${isDark ? "bg-white/5 border-white/5" : "bg-white border-[#ebdbe2]"}`}>
                  <p className="text-xs text-gray-400">Certificate Number</p>
                  <p className="font-semibold font-mono text-lg mt-1">{diamond.certificateNo || "—"}</p>
                </div>
                <div className={`p-4 rounded-xl border ${isDark ? "bg-white/5 border-white/5" : "bg-white border-[#ebdbe2]"}`}>
                  <p className="text-xs text-gray-400">Lab / Natural Type</p>
                  <p className="font-semibold text-lg mt-1">{diamond.labNatural || "Natural"}</p>
                </div>
              </div>
            </section>

            {/* Selling Details */}
            <section className="space-y-4 pt-4 border-t border-dashed border-gray-300/30">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <BadgeDollarSign size={14} />
                Selling Pricing & Rate
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-5 rounded-2xl border ${isDark ? "bg-[#252525] border-white/5" : "bg-[#fcfaf8] border-[#f0e6e9]"}`}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Selling Price</p>
                  <p className="text-2xl font-bold font-mono mt-1 text-[#714760]">₹{sellingPrice.toLocaleString("en-IN")}</p>
                </div>
                <div className={`p-5 rounded-2xl border ${isDark ? "bg-[#252525] border-white/5" : "bg-[#fcfaf8] border-[#f0e6e9]"}`}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Selling Rate per Carat</p>
                  <p className="text-2xl font-bold font-mono mt-1 text-[#714760]">₹{Number(sellingRatePerCarat).toLocaleString("en-IN")} <span className="text-xs font-normal text-gray-500">/ ct</span></p>
                </div>
              </div>
            </section>

            {/* Notes Section */}
            {diamond.notes && (
              <section className="space-y-2 pt-4 border-t border-dashed border-gray-300/30">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Internal Notes</h4>
                <p className={`p-4 rounded-xl text-sm italic ${
                  isDark ? "bg-[#252525] text-gray-300" : "bg-[#fcfaf8] text-gray-700"
                }`}>
                  "{diamond.notes}"
                </p>
              </section>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
