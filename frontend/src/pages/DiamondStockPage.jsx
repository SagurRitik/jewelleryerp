
import { useState, useEffect } from "react";
import API from "../api";
import {
  Gem,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Edit,
  ShoppingBag,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function DiamondStockPage() {
  const [diamonds, setDiamonds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const fetchDiamonds = async () => {
    try {
      setLoading(true);
      const res = await API.get("/diamonds", {
        params: {
          search: search || undefined,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
        },
      });
      setDiamonds(res.data.diamonds);
    } catch (error) {
      console.error("Failed to fetch diamonds", error);
      toast.error("Failed to load diamond stock");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchDiamonds, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this diamond?")) return;
    try {
      await API.delete(`/diamonds/${id}`);
      toast.success("Diamond removed from stock");
      fetchDiamonds();
    } catch (error) {
      toast.error("Failed to delete diamond");
    }
  };

  const handleSell = (diamond) => {
    // Redirect to manual billing with diamond info
    // We'll pass state to ManualBillingForm to pre-fill it
    navigate("/manual-billing", {
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
    });
  };

  return (
    <div className={`min-h-screen p-6 ${isDark ? "bg-[#121212] text-white" : "bg-[#fcfaf8] text-[#2f2430]"}`}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* BACK BUTTON */}
        <div className="flex items-center gap-4 mb-2 print:hidden">
          <button
            onClick={() => navigate(-1)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl shadow-sm border transition-colors ${
              isDark 
                ? "bg-[#1a1a1a] border-white/10 text-gray-300 hover:text-white hover:border-white/20" 
                : "bg-white border-gray-100 text-gray-600 hover:text-[#5a374f] hover:border-[#5a374f]/20"
            }`}
          >
            <ArrowLeft size={20} />
          </button>
          <span className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Back</span>
        </div>

        {/* Header Section */}
        <div className={`overflow-hidden rounded-[28px] border p-6 shadow-lg ${isDark
          ? "border-white/10 bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]"
          : "border-[#eadfdf] bg-gradient-to-br from-[#5a374f] via-[#714760] to-[#8c5f5f] text-white"
          }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-[0.35em] ${isDark ? "text-gray-400" : "text-white/70"}`}>
                Inventory
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">Loose Diamonds</h1>
              <p className={`mt-2 text-sm ${isDark ? "text-gray-400" : "text-white/80"}`}>
                Manage and sell standalone diamonds from your collection.
              </p>
            </div>
            <button
              onClick={() => navigate("/diamonds/new")}
              className="flex items-center gap-2 bg-white text-[#5a374f] px-5 py-3 rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-md active:scale-95"
            >
              <Plus size={18} />
              Add Diamond
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl border ${isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-[#ebdbe2]"
            }`}>
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by SKU, Certificate or Shape..."
              className="bg-transparent border-none outline-none w-full text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-[#ebdbe2]"
            }`}>
            <Filter size={18} className="text-gray-400" />
            <select
              className="bg-transparent border-none outline-none text-sm cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="SOLD">Sold</option>
              <option value="RESERVED">Reserved</option>
            </select>
          </div>
        </div>

        {/* Diamond Table/Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin text-[#714760]" />
            <p className="mt-4 text-sm font-medium text-gray-500">Loading diamonds...</p>
          </div>
        ) : diamonds.length === 0 ? (
          <div className={`rounded-3xl border-2 border-dashed p-12 text-center ${isDark ? "border-white/10" : "border-[#ebdbe2]"
            }`}>
            <Gem size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold">No diamonds found</h3>
            <p className="text-sm text-gray-500 mt-1">Start by adding your first loose diamond.</p>
          </div>
        ) : (
          <div className={`overflow-hidden rounded-3xl border ${isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-[#ebdbe2]"
            }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? "bg-white/5 text-gray-400" : "bg-[#fcfaf8] text-gray-500"
                    }`}>
                    <th className="px-6 py-4">Diamond Info</th>
                    <th className="px-6 py-4">Quality</th>
                    <th className="px-6 py-4">Certificate</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {diamonds.map((diamond) => (
                    <tr key={diamond._id} className={`group transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-[#faf9f6]"
                      }`}>
                      <td
                        className="px-6 py-5 cursor-pointer group/cell transition-colors"
                        onClick={() => navigate(`/diamonds/${diamond._id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl transition-colors ${isDark ? "bg-white/5 group-hover/cell:bg-white/10" : "bg-[#f7f0f3] group-hover/cell:bg-[#ebdbe2]"
                            }`}>
                            <Gem size={20} className={isDark ? "text-gray-300" : "text-[#714760]"} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold group-hover/cell:text-[#714760] dark:group-hover/cell:text-pink-400 transition-colors">{diamond.shape || "Loose Diamond"}</p>
                              {diamond.labNatural && (
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${diamond.labNatural === "Lab Grown"
                                  ? "bg-amber-100 text-amber-700 border border-amber-200"
                                  : "bg-teal-100 text-teal-700 border border-teal-200"
                                  }`}>
                                  {diamond.labNatural}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{diamond.weight} Carat • SKU: {diamond.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1">
                          {diamond.color && <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold">{diamond.color}</span>}
                          {diamond.clarity && <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 text-[10px] font-bold">{diamond.clarity}</span>}
                          {diamond.cut && <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-[10px] font-bold">{diamond.cut}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium">{diamond.lab || "-"}</p>
                        <p className="text-[10px] text-gray-500">{diamond.certificateNo || "No Certificate"}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-bold text-[#714760]">₹{(diamond.sellingPrice || 0).toLocaleString('en-IN')}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${diamond.status === "AVAILABLE" ? "bg-green-100 text-green-700" :
                          diamond.status === "SOLD" ? "bg-red-100 text-red-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                          {diamond.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {diamond.status === "AVAILABLE" && (
                            <button
                              onClick={() => handleSell(diamond)}
                              className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                              title="Sell Now"
                            >
                              <ShoppingBag size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/diamonds/edit/${diamond._id}`)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(diamond._id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
