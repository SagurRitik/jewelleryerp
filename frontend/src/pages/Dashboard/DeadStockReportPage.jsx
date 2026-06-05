import React, { useState, useEffect } from "react";
import axios from "axios";
import { Package, Clock, AlertTriangle, TrendingDown, PackageX, History, Flame, Tag, RefreshCw, ChevronsLeft, ChevronsRight, Landmark } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { toast } from "sonner";

export default function DeadStockReportPage() {
  const [data, setData] = useState({
    "0-6 Months": { items: [], totalValue: 0 },
    "6-9 Months": { items: [], totalValue: 0 },
    "9-12 Months": { items: [], totalValue: 0 },
    "12+ Months": { items: [], totalValue: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("12+ Months");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { isDark } = useTheme();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/reports/dead-stock", { withCredentials: true });
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch dead stock report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const currentItems = data[activeTab]?.items || [];
  const totalPages = Math.ceil(currentItems.length / itemsPerPage);

  const paginatedItems = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return currentItems.slice(start, start + itemsPerPage);
  }, [currentItems, currentPage, itemsPerPage]);

  const totalDeadStock = ["6-9 Months", "9-12 Months", "12+ Months"].reduce((acc, sum) => acc + data[sum].items.length, 0);

  const getActionColors = (tab) => {
    if (tab === "12+ Months") return "text-red-500 bg-red-500/10 border-red-500/30";
    if (tab === "9-12 Months") return "text-orange-500 bg-orange-500/10 border-orange-500/30";
    if (tab === "6-9 Months") return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30";
    return "text-green-500 bg-green-500/10 border-green-500/30";
  };

  const tabs = ["12+ Months", "9-12 Months", "6-9 Months", "0-6 Months"];

  const totalCatalogSize = data.totalCatalogSize || 0;
  const inStockSize = data.inStockSize || 0;
  const outOfStockSize = totalCatalogSize > inStockSize ? totalCatalogSize - inStockSize : 0;

  return (
    <div className={`min-h-screen p-4 md:p-8 transition-colors duration-500 flex flex-col font-sans ${isDark ? "bg-[#0b0b0b] text-[#eaeaea]" : "bg-[#FDFDFD] text-slate-800"}`}>
      <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className={`text-4xl md:text-[32px] font-bold tracking-tight flex items-center gap-4 ${isDark ? "text-white" : "text-[#4c2344]"}`}>
              <PackageX size={36} className={`${isDark ? "text-pink-500" : "text-[#7E4C69]"}`} />
              Dead Stock & Inventory Aging
            </h1>
            <p className={`text-base mt-2 font-medium tracking-wide ${isDark ? "text-gray-400" : "text-slate-500"}`}>
              Identify unsellable inventory, reallocate capital, and optimize stock health.
            </p>
            {totalCatalogSize > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-wider">
                <span className={`px-4 py-1.5 rounded-xl border ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-slate-200 text-slate-600"}`}>
                  <Package className="inline mr-2" size={14} /> 
                  Tracking {inStockSize} In-Stock items
                </span>
                {outOfStockSize > 0 && (
                  <span className={`px-4 py-1.5 rounded-xl border ${isDark ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-rose-50 border-rose-100 text-rose-500"}`}>
                    <AlertTriangle className="inline mr-2" size={14} />
                    {outOfStockSize} Out-of-Stock Products
                  </span>
                )}
              </div>
            )}
          </div>
          
          <button 
            onClick={fetchData}
            className="px-6 py-3 flex items-center gap-3 rounded-2xl bg-[#7E4C69] hover:bg-[#683e56] text-white font-bold transition-all duration-300 shadow-lg shadow-[#7E4C69]/20 active:scale-95 group"
          >
            <RefreshCw size={22} className={`transition-transform duration-700 ${loading ? "animate-spin" : "group-hover:rotate-180"}`} />
            Sync Metrics
          </button>
        </div>

        {/* Top Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-8 rounded-2xl border transition-all duration-300 relative overflow-hidden ${isDark ? "bg-[#181818] border-white/5" : "bg-white border-slate-100 shadow-[0_2px_15px_rgb(0,0,0,0.02)]"}`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-bl-[100px] -z-0" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <h3 className={`text-xs font-bold tracking-widest uppercase ${isDark ? "text-gray-500" : "text-slate-500"}`}>Critical Dead Stock</h3>
                <div className="bg-rose-50 text-rose-500 p-2 rounded-xl">
                  <AlertTriangle size={24} />
                </div>
              </div>
              <div className="text-4xl font-black text-rose-500 mb-2">{totalDeadStock}</div>
              <p className="text-xs font-medium text-slate-400">Aging 6+ months</p>
            </div>
          </div>
          
          <div className={`p-8 rounded-2xl border transition-all duration-300 relative overflow-hidden ${isDark ? "bg-[#181818] border-white/5" : "bg-white border-slate-100 shadow-[0_2px_15px_rgb(0,0,0,0.02)]"}`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-[100px] -z-0" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <h3 className={`text-xs font-bold tracking-widest uppercase ${isDark ? "text-gray-500" : "text-slate-500"}`}>Oldest Snapshot</h3>
                <div className="bg-orange-50 text-orange-500 p-2 rounded-xl">
                  <History size={24} />
                </div>
              </div>
              <div className={`text-4xl font-black mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>{data["12+ Months"].items?.length || 0}</div>
              <p className="text-xs font-medium text-slate-400">12+ months in inventory</p>
            </div>
          </div>

          <div className={`p-8 rounded-2xl transition-all duration-300 shadow-lg shadow-[#7E4C69]/20 flex flex-col justify-between relative overflow-hidden ${isDark ? "bg-[#7E4C69]/20 border border-[#7E4C69]/30" : "bg-[#7E4C69] text-white"}`}>
            <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
               <Package size={128} className="text-white" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <h3 className={`text-xs font-bold tracking-wider uppercase ${isDark ? "text-white/70" : "text-white/80"}`}>Healthy Stock Balance</h3>
                <div className="bg-white/10 p-2 rounded-xl">
                  <Package size={24} className="text-white" />
                </div>
              </div>
              <div>
                <div className="text-4xl font-black mb-2">{data["0-6 Months"].items?.length || 0}</div>
                <div className="text-xs text-white/70 font-medium"><span className="text-white font-bold">Good Rotation</span> • Last 6 Months</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-col space-y-6">
           <div className={`flex flex-wrap p-2 rounded-2xl shadow-sm ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
             {tabs.map((tab) => {
               const active = activeTab === tab;
               const count = data[tab]?.items?.length || 0;
               return (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`flex-1 min-w-[140px] py-4 px-6 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-3 ${
                     active 
                       ? "bg-white text-[#7E4C69] shadow-md shadow-black/5" 
                       : `text-slate-500 hover:bg-white/50 hover:text-slate-800`
                   }`}
                 >
                   <Clock size={18} className={active ? "text-[#7E4C69]" : "text-slate-400"} />
                   {tab} 
                   <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${active ? "bg-[#7E4C69] text-white" : "bg-slate-200 text-slate-500 uppercase"}`}>
                     {count}
                   </span>
                 </button>
               );
             })}
           </div>
        </div>

        {/* Data Table */}
        <div className={`rounded-2xl border overflow-hidden transition-all duration-500 ${isDark ? "bg-[#161616] border-white/5 shadow-2xl" : "bg-white border-slate-100 shadow-[0_2px_20px_rgb(0,0,0,0.03)]"}`}>
          {loading ? (
             <div className="py-32 flex flex-col items-center gap-6 text-[#7E4C69]">
               <RefreshCw size={48} className="animate-spin opacity-40" />
               <p className="font-bold tracking-widest uppercase text-xs">Synchronizing Aging Computation...</p>
             </div>
          ) : data[activeTab]?.items?.length === 0 ? (
            <div className="py-32 flex flex-col items-center gap-6 opacity-30">
               <PackageX size={72} className="text-slate-400" />
               <p className="text-xl font-black tracking-tight text-slate-500">No Inventory Found in this Bracket</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`${isDark ? "bg-[#222]/50 text-white/40 border-b border-white/5" : "bg-[#6A3D55] text-white"} uppercase text-[11px] font-black tracking-widest`}>
                    <th className="px-8 py-4">Design / SKU</th>
                    <th className="px-8 py-4">Inward Timeline</th>
                    <th className="px-8 py-4">Physical Attributes</th>
                    <th className="px-8 py-4 text-center">Stagnant Duration</th>
                    <th className="px-8 py-4 text-right">Strategic Advisory</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-slate-50"}`}>
                  {paginatedItems.map((item) => (
                    <tr key={item._id} className={`transition duration-200 ${isDark ? "hover:bg-white/[0.02] text-gray-200" : "hover:bg-slate-50/50 text-gray-800"}`}>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl border ${isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-100"}`}>
                            <Package size={20} className={isDark ? "text-pink-400" : "text-[#7E4C69]"} />
                          </div>
                          <div>
                            <p className="font-bold text-sm tracking-tight">{item.sku}</p>
                            <p className={`text-[10px] font-bold tracking-widest uppercase mt-0.5 ${isDark ? "text-gray-500" : "text-slate-400"}`}>{item.jewelleryCategory}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-bold text-sm">{new Date(item.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        <div className="text-[11px] font-medium text-slate-400 uppercase tracking-tight">{new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-bold text-sm flex items-center gap-2">
                           <span className={`w-2 h-2 rounded-full ${item.metalType === "Gold" ? "bg-yellow-400" : item.metalType === "Silver" ? "bg-slate-300" : "bg-indigo-300"}`} />
                           {item.metalType} <span className="opacity-30">•</span> {item.metalPurity}
                        </div>
                        <div className="text-xs mt-1.5 font-medium text-slate-400">
                          {item.netWeight}g Net <span className="mx-1 opacity-50">/</span> {item.grossWeight}g Gross
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                          activeTab.includes("12") 
                            ? "bg-rose-100 text-rose-700" 
                            : activeTab.includes("9")
                            ? "bg-orange-100 text-orange-700"
                            : activeTab.includes("6")
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}>
                          <Clock size={12} />
                          {item.monthsStagnant} Months
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {activeTab.includes("12") || activeTab.includes("9") ? (
                          <button className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all">
                             Melt Design
                          </button>
                        ) : activeTab.includes("6") ? (
                          <button className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all">
                             Liquidation Discount
                          </button>
                        ) : (
                          <span className="text-emerald-600/70 text-[11px] font-black uppercase tracking-widest">
                             Optimal Velocity
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className={`p-6 flex items-center justify-between border-t transition-colors ${isDark ? "bg-black/20 border-white/5" : "bg-slate-50 border-slate-100"}`}>
                  <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-gray-500" : "text-slate-400"}`}>
                    Showing {Math.min(itemsPerPage, currentItems.length - (currentPage - 1) * itemsPerPage)} of {currentItems.length} items
                  </span>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg border transition-all ${
                        currentPage === 1 
                        ? "opacity-30 cursor-not-allowed" 
                        : "hover:bg-white border-slate-200 text-slate-600"
                      }`}
                    >
                      <ChevronsLeft size={16} />
                    </button>
                    <span className="text-sm font-black text-[#7E4C69]">
                      Page {currentPage} / {totalPages}
                    </span>
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg border transition-all ${
                        currentPage === totalPages 
                        ? "opacity-30 cursor-not-allowed" 
                        : "hover:bg-white border-slate-200 text-slate-600"
                      }`}
                    >
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
