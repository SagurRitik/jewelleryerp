import React, { useEffect, useState, useMemo } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { 
  Search, Bell, Settings, TrendingUp, TrendingDown, 
  Landmark, Filter, Download, ChevronDown, X, ChevronsLeft, ChevronsRight
} from "lucide-react";
import * as XLSX from 'xlsx';
import BackButton from "../components/BackButton";


export default function MetalLedgerPage() {
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [metalBalances, setMetalBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalCredit: 0,
    totalDebit: 0,
    balance: 0
  });

  const [filters, setFilters] = useState({
    source: "",
    type: "",
    metalType: "",
    purity: ""
  });
  
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const res = await API.get("/metal-ledger");
      const fetchedEntries = res.data.entries || [];
      setEntries(fetchedEntries);
      setSummary(res.data.summary || { totalCredit: 0, totalDebit: 0, balance: 0 });
      setMetalBalances(res.data.metalBalances || {});
    } catch (err) {
      console.error("Ledger fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ source: "", type: "", metalType: "", purity: "" });
    setIsFilterVisible(false);
    setCurrentPage(1);
  };
  
  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      return (
        (filters.source ? e.source === filters.source : true) &&
        (filters.type ? e.type === filters.type : true) &&
        (filters.metalType ? e.metalType === filters.metalType : true) &&
        (filters.purity ? e.purity === filters.purity : true)
      );
    });
  }, [entries, filters]);

  const paginatedEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEntries.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEntries, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);

  const uniqueFilterOptions = useMemo(() => {
    const sources = [...new Set(entries.map(e => e.source).filter(Boolean))];
    const types = [...new Set(entries.map(e => e.type).filter(Boolean))];
    const metalTypes = [...new Set(entries.map(e => e.metalType).filter(Boolean))];
    const purities = [...new Set(entries.map(e => e.purity).filter(Boolean))];
    return { sources, types, metalTypes, purities };
  }, [entries]);

  const getSourceLabel = (source) => {
    switch (source) {
      case "ORDER": return "Order";
      case "INVOICE": return "Invoice";
      case "MANUAL": return "Manual";
      case "VENDOR": return "Vendor";
      case "REFINERY": return "Refinery";
      case "CASH_CONVERSION": return "Cash Conv.";
      default: return source || "-";
    }
  };

  const formatMetal = (metal) => {
    if (!metal) return "-";
    return metal.charAt(0).toUpperCase() + metal.slice(1).toLowerCase();
  };

  const getMetalSymbol = (metal) => {
    const m = metal?.toLowerCase() || "";
    if (m.includes("gold")) return "G";
    if (m.includes("silver")) return "S";
    if (m.includes("platinum")) return "Pt";
    return m.charAt(0).toUpperCase();
  };

  const getMetalIconColors = (metal) => {
    const m = metal?.toLowerCase() || "";
    if (m.includes("gold")) return "bg-[#FDF6E3] text-[#D4AF37]";
    if (m.includes("silver")) return "bg-[#F1F5F9] text-[#94A3B8]";
    if (m.includes("platinum")) return "bg-[#F5F3FF] text-[#8B5CF6]";
    return "bg-slate-100 text-slate-600";
  };
  
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredEntries.map(e => ({
        Date: new Date(e.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        Source: getSourceLabel(e.source),
        Name: e.partyName || e.customerName || "-",
        Metal: formatMetal(e.metalType),
        Purity: e.purity || "-",
        Weight: e.weight ? `${e.weight}g` : "-",
        Type: e.type,
        Amount: fmt(e.value)
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Metal Ledger");
    XLSX.writeFile(workbook, "MetalLedgerReport.xlsx");
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-800 pb-12 ">
      <BackButton/>
      <main className="max-w-7xl mx-auto px-6 mt-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-[32px] font-bold text-[#4c2344] tracking-tight mb-1">
              Metal Ledger
            </h1>
            <p className="text-slate-500 text-sm">
              Overview of your precious metal assets performance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/metal-debit")}
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all flex items-center"
            >
              <span className="mr-2 text-slate-400">—</span> Manual Debit
            </button>
            <button
              onClick={() => navigate("/metal-credit")}
              className="px-5 py-2.5 rounded-xl bg-[#7E4C69] hover:bg-[#683e56] text-white text-sm font-semibold transition-all flex items-center shadow-sm"
            >
              <span className="mr-2">+</span> Manual Credit
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">Total Credit</h3>
              <div className="bg-emerald-50 text-emerald-500 p-1.5 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-[32px] font-bold text-slate-900 mb-2">₹{fmt(summary.totalCredit)}</div>
            <div className="text-xs text-slate-400 font-medium"><span className="text-emerald-500">+12.5%</span> from last month</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">Total Debit</h3>
              <div className="bg-rose-50 text-rose-500 p-1.5 rounded-lg">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="text-[32px] font-bold text-slate-900 mb-2">₹{fmt(summary.totalDebit)}</div>
            <div className="text-xs text-slate-400 font-medium"><span className="text-rose-500">-5.2%</span> from last month</div>
          </div>

          <div className="bg-[#7E4C69] rounded-2xl p-6 shadow-lg shadow-[#7E4C69]/20 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
               <Landmark className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xs font-bold tracking-wider text-white/80 uppercase">Current Balance</h3>
                <div className="bg-white/10 p-1.5 rounded-lg">
                  <Landmark className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-[32px] font-bold mb-2">₹{fmt(summary.balance)}</div>
              <div className="text-xs text-white/70 font-medium"><span className="text-white font-bold">+8.1%</span> overall growth</div>
            </div>
          </div>
        </div>

        {Object.keys(metalBalances).length > 0 && (
          <div className="mb-12">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-xl font-bold text-slate-900">Metal Stock Inventory</h2>
              <button 
                onClick={() => navigate("/metal-stock")}
                className="text-sm font-semibold text-[#7E4C69] hover:text-[#683e56] transition-colors"
              >
                View metal stock
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(metalBalances).map(([metal, data]) => {
                const totalWeight = data?.balanceWeight || 0;
                const capacity = Math.min((totalWeight / 5000) * 100, 100).toFixed(0) || 50; 
                
                return (
                  <div key={metal} className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100 flex flex-col">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${getMetalIconColors(metal)}`}>
                        {getMetalSymbol(metal)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">
                          {formatMetal(metal)} ({getMetalSymbol(metal)})
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {data?.creditWeight || 0}g In • {data?.debitWeight || 0}g Out
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm text-slate-600">Current Stock: <span className="font-bold text-slate-900">{totalWeight} g</span></span>
                        <span className="text-xs font-bold text-[#7E4C69]">{capacity}% Cap</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
                        <div className="bg-[#7E4C69] h-2 rounded-full" style={{ width: `${capacity}%` }}></div>
                      </div>
                      <p className="text-[11px] text-slate-400">Last updated: Just now</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden">
          
          <div className="p-6 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Recent Transactions</h2>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" /> 
                {isFilterVisible ? 'Hide' : 'Filter'}
              </button>
              <button onClick={exportToExcel} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center">
                <Download className="w-4 h-4 mr-2" /> Export
              </button>
            </div>
          </div>
          
          {isFilterVisible && (
            <div className="p-6 bg-slate-50 border-t border-b border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select name="source" value={filters.source} onChange={handleFilterChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm">
                        <option value="">All Sources</option>
                        {uniqueFilterOptions.sources.map(s => <option key={s} value={s}>{getSourceLabel(s)}</option>)}
                    </select>
                    <select name="type" value={filters.type} onChange={handleFilterChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm">
                        <option value="">All Types</option>
                        {uniqueFilterOptions.types.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select name="metalType" value={filters.metalType} onChange={handleFilterChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm">
                        <option value="">All Metals</option>
                        {uniqueFilterOptions.metalTypes.map(m => <option key={m} value={m}>{formatMetal(m)}</option>)}
                    </select>
                    <select name="purity" value={filters.purity} onChange={handleFilterChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm">
                        <option value="">All Purities</option>
                        {uniqueFilterOptions.purities.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div className="flex justify-end mt-4">
                  <button onClick={clearFilters} className="text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center">
                    <X className="w-4 h-4 mr-1" /> Clear Filters
                  </button>
                </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#6A3D55] text-white">
                  <th className="py-3 px-6 text-[11px] font-bold uppercase tracking-wider">Date</th>
                  <th className="py-3 px-6 text-[11px] font-bold uppercase tracking-wider">Source</th>
                  <th className="py-3 px-6 text-[11px] font-bold uppercase tracking-wider">Name</th>
                  <th className="py-3 px-6 text-[11px] font-bold uppercase tracking-wider">Metal</th>
                  <th className="py-3 px-6 text-[11px] font-bold uppercase tracking-wider">Purity</th>
                  <th className="py-3 px-6 text-[11px] font-bold uppercase tracking-wider">Weight</th>
                  <th className="py-3 px-6 text-[11px] font-bold uppercase tracking-wider">Type</th>
                  <th className="py-3 px-6 text-[11px] font-bold uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="8" className="text-center py-10 text-slate-500">Loading ledger...</td>
                  </tr>
                )}
                {!loading && paginatedEntries.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-10 text-slate-500">No ledger entries found for the selected filters.</td>
                  </tr>
                )}
                {paginatedEntries.map((e) => {
                  const isCredit = e.type === "CREDIT";
                  const dateStr = new Date(e.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                  
                  return (
                    <tr key={e._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">{dateStr}</td>
                      <td className="py-4 px-6 text-sm text-slate-500">{getSourceLabel(e.source)}</td>
                      <td className="py-4 px-6 text-sm font-semibold text-slate-800">{e.partyName || e.customerName || "-"}</td>
{/*                    <td className="py-4 px-6 text-sm font-semibold text-slate-800">{e.partyName || e.customerName || "-"}</td> */}
                      <td className="py-4 px-6 text-sm text-slate-600">{formatMetal(e.metalType)}</td>
                      <td className="py-4 px-6 text-sm text-slate-500">{e.purity || "-"}</td>
                      <td className="py-4 px-6 text-sm text-slate-600">{e.weight ? `${e.weight}g` : "-"}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${isCredit ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                          {isCredit ? "Credit" : "Debit"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm font-bold text-slate-900 text-right whitespace-nowrap">₹{fmt(e.value)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!loading && filteredEntries.length > 0 && (
            <div className="p-4 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
              <span className="text-sm text-slate-600">
                Showing {paginatedEntries.length} of {filteredEntries.length} results
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border rounded-lg disabled:opacity-50"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-semibold">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border rounded-lg disabled:opacity-50"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
