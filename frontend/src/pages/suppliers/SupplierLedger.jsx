import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Calendar, FileText, CreditCard, 
  TrendingUp, TrendingDown, Receipt, User, ExternalLink,
  Search, ChevronLeft, ChevronRight, Inbox,
  Filter, ArrowDownAZ, ArrowUpAZ, RotateCcw, X, Download
} from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

export default function SupplierLedger() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Search and Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Advanced Filters State
  const [sortOrder, setSortOrder] = useState("new-to-old");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/suppliers/${id}/ledger`);
      setData(res.data);
    } catch (err) {
      toast.error("Failed to load ledger history");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [id]);

  // Filtering Logic
  const filteredLedger = useMemo(() => {
    if (!data?.ledger) return [];
    
    // Reset to page 1 when searching or filtering
    if (searchQuery || startDate || endDate || minAmount || maxAmount || filterType !== "all") setCurrentPage(1);

    let filtered = data.ledger.filter(entry => {
      // 0. Type Filter
      if (filterType !== "all" && entry.type !== filterType) return false;
      // 1. Text Search Filter
      const searchStr = `${entry.type} ${entry.description || ''} ${entry.note || ''} ${entry.reference || ''} ${entry.purchaseNo || ''}`.toLowerCase();
      if (searchQuery && !searchStr.includes(searchQuery.toLowerCase())) return false;

      // 2. Date Range Filter
      if (startDate) {
        const start = new Date(startDate);
        const entryDate = new Date(entry.date);
        if (entryDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        const entryDate = new Date(entry.date);
        if (entryDate > end) return false;
      }

      // 3. Amount Filter (Absolute value)
      const absAmount = Math.abs(entry.amount);
      if (minAmount && absAmount < parseFloat(minAmount)) return false;
      if (maxAmount && absAmount > parseFloat(maxAmount)) return false;

      return true;
    });

    // 4. Sorting Logic
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (sortOrder === "new-to-old") {
        return dateB - dateA;
      } else if (sortOrder === "old-to-new") {
        return dateA - dateB;
      }
      return 0;
    });
  }, [data?.ledger, searchQuery, startDate, endDate, minAmount, maxAmount, sortOrder, filterType]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredLedger.length / itemsPerPage);
  const paginatedLedger = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLedger.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLedger, currentPage]);

  const exportToExcel = () => {
    try {
      if (!filteredLedger.length) {
        toast.error("No data to export");
        return;
      }

      const reportData = filteredLedger.map(entry => ({
        "Date": new Date(entry.date).toLocaleDateString('en-US', { 
          month: 'short', day: 'numeric', year: 'numeric' 
        }),
        "Type": entry.type,
        "Description": entry.description || entry.note || "-",
        "Invoice/Ref": entry.purchaseNo || entry.reference || "-",
        "Payment Mode": entry.paymentMode || "-",
        "Amount": entry.amount,
        "Running Balance": entry.runningBalance
      }));

      const worksheet = XLSX.utils.json_to_sheet(reportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger");
      
      // Auto-size columns (Basic implementation)
      const columnWidths = Object.keys(reportData[0]).map(key => ({
        wch: Math.max(key.length, ...reportData.map(row => row[key]?.toString().length || 10)) + 2
      }));
      worksheet['!cols'] = columnWidths;

      const fileName = `${supplier.name}_Ledger_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export report");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF9F9]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return null;

  const { supplier } = data;

  return (
    <div className="min-h-screen bg-[#FDF9F9] p-6 md:p-10 font-sans text-gray-800">
      <div className="max-w-[1100px] mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/suppliers")}
              className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-[28px] font-bold text-[#1A1A1A] tracking-tight leading-tight">Supplier Ledger</h1>
              <p className="text-[#8B8286] text-sm font-medium">Transaction history for {supplier.name}</p>
            </div>
          </div>

          {/* SEARCH & FILTERS BAR */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1 justify-end">
            <div className="relative group flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text"
                placeholder="Search description, invoice..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm w-full focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
              />
            </div>
            
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-semibold shadow-sm
                ${isFilterOpen 
                  ? 'bg-indigo-600 border-indigo-600 text-white' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-200 hover:bg-indigo-50'
                }`}
            >
              <Filter size={18} />
              Filters
              {(startDate || endDate || minAmount || maxAmount || filterType !== "all") && (
                <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
              )}
            </button>

            <button 
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#4c2344] text-white rounded-xl text-sm font-semibold hover:bg-[#3b1b34] transition-all shadow-md shadow-purple-900/10 active:scale-95"
              title="Download as Excel"
            >
              <Download size={18} />
              <span className="hidden md:inline">Report</span>
            </button>
          </div>
        </div>

        {/* EXPANDABLE FILTER PANEL */}
        {isFilterOpen && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8 shadow-md animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Filter size={16} className="text-indigo-600" /> Advanced Filters
              </h3>
              <button 
                onClick={() => {
                  setStartDate(""); setEndDate(""); setMinAmount(""); setMaxAmount(""); setSortOrder("new-to-old"); setFilterType("all");
                }}
                className="text-[10px] uppercase tracking-widest font-black text-rose-500 hover:text-rose-600 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw size={12} /> Reset All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Transaction Type</label>
                <div className="flex bg-gray-50/50 p-1 rounded-lg border border-gray-200">
                  <button 
                    onClick={() => setFilterType("all")}
                    className={`flex-1 overflow-hidden whitespace-nowrap px-2 py-1.5 rounded-md text-[10px] font-black uppercase tracking-tight transition-all ${filterType === "all" ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setFilterType("PURCHASE")}
                    className={`flex-1 overflow-hidden whitespace-nowrap px-2 py-1.5 rounded-md text-[10px] font-black uppercase tracking-tight transition-all ${filterType === "PURCHASE" ? 'bg-white shadow-sm text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Purchase
                  </button>
                  <button 
                    onClick={() => setFilterType("PAYMENT")}
                    className={`flex-1 overflow-hidden whitespace-nowrap px-2 py-1.5 rounded-md text-[10px] font-black uppercase tracking-tight transition-all ${filterType === "PAYMENT" ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Payment
                  </button>
                </div>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Sort Order</label>
                <div className="relative group">
                  <select 
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="new-to-old">Newest First</option>
                    <option value="old-to-new">Oldest First</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    {sortOrder === "new-to-old" ? <ArrowDownAZ size={14} /> : <ArrowUpAZ size={14} />}
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Date Range</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 group">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500" size={14} />
                    <input 
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <span className="text-gray-300 text-xs font-bold">to</span>
                  <div className="relative flex-1 group">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500" size={14} />
                    <input 
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Amount Range */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Amount Range</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    placeholder="Min"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                  <input 
                    type="number"
                    placeholder="Max"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TOP SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Total Purchase */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Total Purchase Amount</h3>
            <p className="text-2xl font-black text-gray-800 mb-1">
              ₹{(supplier.totalPurchased || 0).toLocaleString()}
            </p>
            <div className="flex items-center text-xs font-semibold text-orange-500 mt-2">
              <TrendingUp size={14} className="mr-1" /> Total Credits
            </div>
            <Receipt className="absolute -right-4 -bottom-4 w-24 h-24 text-orange-50 opacity-20 pointer-events-none group-hover:scale-110 transition-transform" />
          </div>

          {/* Total Paid */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Total Amount Paid</h3>
            <p className="text-2xl font-black text-gray-800 mb-1">
              ₹{(supplier.totalPaid || 0).toLocaleString()}
            </p>
            <div className="flex items-center text-xs font-semibold text-emerald-500 mt-2">
              <TrendingDown size={14} className="mr-1" /> Total Debits
            </div>
            <CreditCard className="absolute -right-4 -bottom-4 w-24 h-24 text-emerald-50 opacity-20 pointer-events-none group-hover:scale-110 transition-transform" />
          </div>

          {/* Net Status */}
          <div className={`p-6 rounded-2xl shadow-sm border relative overflow-hidden group hover:shadow-md transition-shadow ${
            supplier.currentBalance >= 0 ? 'bg-rose-50/30 border-rose-100' : 'bg-emerald-50/30 border-emerald-100'
          }`}>
             <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Account Status</h3>
             <p className={`text-3xl font-black ${supplier.currentBalance >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
               ₹{Math.abs(supplier.currentBalance).toLocaleString()}
             </p>
             <div className="flex items-center text-xs font-bold mt-2 uppercase tracking-tight">
               {supplier.currentBalance >= 0 ? (
                 <span className="text-rose-600">⚠️ Amount Due (Payable)</span>
               ) : (
                 <span className="text-emerald-600">✅ Supplier k pass jama amount (Advance)</span>
               )}
             </div>
             <TrendingUp className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-10 pointer-events-none ${
               supplier.currentBalance >= 0 ? 'text-rose-600' : 'text-emerald-600 -rotate-90'
             }`} />
          </div>
        </div>

        {/* LEDGER TABLE */}
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden border border-gray-50">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Receipt size={18} className="text-indigo-500" /> Accounting Statement
            </h2>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Showing {paginatedLedger.length} of {filteredLedger.length} Records
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="py-4 px-8 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">Date</th>
                  <th className="py-4 px-8 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">Type</th>
                  <th className="py-4 px-8 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">Reference / Note</th>
                  <th className="py-4 px-8 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 text-right">Transaction</th>
                  <th className="py-4 px-8 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedLedger.length > 0 ? (
                  paginatedLedger.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-4 px-8 text-sm font-medium text-gray-600 whitespace-nowrap">
                        {new Date(entry.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="py-4 px-8">
                         <span className={`inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md ${
                           entry.type === 'PAYMENT' ? 'bg-indigo-50 text-indigo-600' : 
                           entry.type === 'PURCHASE' ? 'bg-orange-50 text-orange-600' : 
                           'bg-gray-100 text-gray-600'
                         }`}>
                           {entry.type}
                         </span>
                      </td>
                      <td className="py-4 px-8">
                        <div className="text-sm font-medium text-gray-700">
                          {entry.description || entry.note || "-"}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-1">
                          {entry.purchaseNo && (
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight bg-gray-50 px-1 rounded">
                              {entry.purchaseNo}
                            </div>
                          )}
                          {entry.reference && (
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                              Ref: {entry.reference}
                            </div>
                          )}
                          {entry.paymentMode && (
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                              Mode: {entry.paymentMode}
                            </div>
                          )}
                        </div>

                        {entry.purchaseSlip && (
                          <a 
                            href={`http://localhost:5000${entry.purchaseSlip}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-lg transition-all"
                          >
                            <ExternalLink size={10} className="mr-1" /> View Slip
                          </a>
                        )}
                      </td>
                      <td className="py-4 px-8 text-right font-bold text-sm">
                        <div className="flex items-center justify-end gap-1.5">
                          {entry.amount > 0 ? (
                            <div className="flex items-center text-orange-600">
                               + ₹{entry.amount.toLocaleString()}
                            </div>
                          ) : (
                            <div className="flex items-center text-emerald-600">
                               - ₹{Math.abs(entry.amount).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-8 text-right font-black text-sm text-gray-900">
                        ₹{entry.runningBalance.toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-20 px-8 text-center bg-gray-50/20">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                          <Inbox size={24} />
                        </div>
                        <p className="text-gray-500 font-medium">No transactions found matching your criteria</p>
                        <button 
                          onClick={() => {
                            setSearchQuery(""); setStartDate(""); setEndDate(""); setMinAmount(""); setMaxAmount(""); setSortOrder("new-to-old");
                          }}
                          className="text-xs font-bold text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                        >
                          <RotateCcw size={12} /> Reset All Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-50 bg-white flex items-center justify-between">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-indigo-600 disabled:opacity-50 disabled:hover:text-gray-500 transition-colors"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              
              <div className="flex items-center gap-1.5">
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === i + 1 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                        : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-indigo-600 disabled:opacity-50 disabled:hover:text-gray-500 transition-colors"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
          
          <div className="p-8 border-t border-gray-100 bg-gray-50/50 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-left md:text-right">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total Purchases</div>
              <div className="text-xl font-black text-gray-800">₹{(supplier.totalPurchased || 0).toLocaleString()}</div>
            </div>
            
            <div className="text-left md:text-right border-l-0 md:border-l border-gray-200 md:pl-8">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total Payments (Already Paid)</div>
              <div className="text-xl font-black text-emerald-600">₹{(supplier.totalPaid || 0).toLocaleString()}</div>
            </div>

            <div className="text-left md:text-right border-l-0 md:border-l border-gray-200 md:pl-8">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Final Outstanding</div>
              <div className={`text-2xl font-black ${supplier.currentBalance >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                ₹{Math.abs(supplier.currentBalance).toLocaleString()}
                <span className="text-[10px] block font-bold uppercase tracking-tighter mt-0.5">
                  {supplier.currentBalance >= 0 ? 'Balance Due to pay' : 'Advance with supplier'}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
