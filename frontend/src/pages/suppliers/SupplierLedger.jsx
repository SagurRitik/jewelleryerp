import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Calendar, FileText, CreditCard, 
  TrendingUp, TrendingDown, Receipt, User, ExternalLink,
  Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Inbox,
  Filter, ArrowDownAZ, ArrowUpAZ, RotateCcw, X, Download, Clock, DollarSign, Eye
} from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

export default function SupplierLedger() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Search, Year and Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedYear, setSelectedYear] = useState("all");

  // Slip Preview Lightbox Modal State
  const [activeSlips, setActiveSlips] = useState(null);
  const [activeSlipIndex, setActiveSlipIndex] = useState(0);

  const openSlipModal = (slips, index = 0) => {
    setActiveSlips(slips);
    setActiveSlipIndex(index);
  };

  const closeSlipModal = () => {
    setActiveSlips(null);
    setActiveSlipIndex(0);
  };

  // Advanced Filters State
  const [sortOrder, setSortOrder] = useState("new-to-old");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Helper for Local Datetime Input
  const getNowDateTimeLocal = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  };

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentMode: "BANK",
    paymentDate: getNowDateTimeLocal(),
    reference: "",
    note: "",
    metalType: "Gold",
    weight: "",
    rate: "",
    purity: ""
  });
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Auto-calculate amount if GOLD is selected and weight/rate change
  useEffect(() => {
    if (paymentData.paymentMode === "GOLD" && paymentData.weight && paymentData.rate) {
      const calculatedAmount = Number(paymentData.weight) * Number(paymentData.rate);
      setPaymentData(prev => ({ ...prev, amount: calculatedAmount.toString() }));
    }
  }, [paymentData.weight, paymentData.rate, paymentData.paymentMode]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentData.amount || Number(paymentData.amount) <= 0) {
      return toast.error("Please enter a valid amount");
    }

    setSubmittingPayment(true);
    try {
      await axios.post("/api/supplier-payments", {
        supplierId: id,
        amount: Number(paymentData.amount),
        paymentMode: paymentData.paymentMode,
        paymentDate: paymentData.paymentDate ? new Date(paymentData.paymentDate) : new Date(),
        reference: paymentData.reference,
        note: paymentData.note,
        metalType: paymentData.metalType,
        weight: paymentData.weight,
        rate: paymentData.rate,
        purity: paymentData.purity
      });
      toast.success("Payment recorded successfully");
      setIsPaymentModalOpen(false);
      fetchLedger(); // Refresh ledger immediately
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || "Failed to record payment";
      toast.error(errMsg);
    } finally {
      setSubmittingPayment(false);
    }
  };

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

  // Extract unique years from ledger records
  const availableYears = useMemo(() => {
    if (!data?.ledger) return [];
    const years = new Set();
    data.ledger.forEach(entry => {
      if (entry.date) {
        const yr = new Date(entry.date).getFullYear();
        if (!isNaN(yr)) years.add(yr);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [data?.ledger]);

  // Filtering Logic
  const filteredLedger = useMemo(() => {
    if (!data?.ledger) return [];

    let filtered = data.ledger.filter(entry => {
      // 0. Financial Year Filter
      if (selectedYear !== "all") {
        const entryYear = new Date(entry.date).getFullYear();
        if (entryYear !== Number(selectedYear)) return false;
      }

      // 0.1 Type Filter
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
  }, [data?.ledger, selectedYear, searchQuery, startDate, endDate, minAmount, maxAmount, sortOrder, filterType]);

  // Reset to first page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, startDate, endDate, minAmount, maxAmount, sortOrder, filterType, selectedYear, itemsPerPage]);

  // Pagination Logic
  const totalRecords = filteredLedger.length;
  const pageSize = itemsPerPage === "all" ? (totalRecords || 1) : Number(itemsPerPage);
  const totalPages = itemsPerPage === "all" ? 1 : Math.max(1, Math.ceil(totalRecords / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = itemsPerPage === "all" ? 0 : (safeCurrentPage - 1) * pageSize;
  const endIndex = itemsPerPage === "all" ? totalRecords : Math.min(startIndex + pageSize, totalRecords);

  const paginatedLedger = useMemo(() => {
    return filteredLedger.slice(startIndex, endIndex);
  }, [filteredLedger, startIndex, endIndex]);

  // Smart Page Numbers with Ellipsis (...)
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [];
    if (safeCurrentPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    } else if (safeCurrentPage >= totalPages - 3) {
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      pages.push(safeCurrentPage - 1);
      pages.push(safeCurrentPage);
      pages.push(safeCurrentPage + 1);
      pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

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
        "Time": new Date(entry.date).toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit', hour12: true
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
          <div className="flex flex-col sm:flex-row gap-4 flex-1 justify-end items-stretch sm:items-center">
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
            
            {/* Quick Year Selector */}
            {availableYears.length > 0 && (
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="h-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm cursor-pointer"
                  title="Filter ledger by year"
                >
                  <option value="all">📅 All Years</option>
                  {availableYears.map(yr => (
                    <option key={yr} value={yr}>📅 Year {yr}</option>
                  ))}
                </select>
              </div>
            )}

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
              {(startDate || endDate || minAmount || maxAmount || filterType !== "all" || selectedYear !== "all") && (
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

            <button 
              onClick={() => {
                setPaymentData({
                  amount: "",
                  paymentMode: "BANK",
                  paymentDate: getNowDateTimeLocal(),
                  reference: "",
                  note: "",
                  metalType: "Gold",
                  weight: "",
                  rate: "",
                  purity: ""
                });
                setIsPaymentModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-900/15 active:scale-95 whitespace-nowrap"
              title="Record a payment to this supplier"
            >
              <CreditCard size={18} />
              <span>Record Payment</span>
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
                  setStartDate(""); setEndDate(""); setMinAmount(""); setMaxAmount(""); setSortOrder("new-to-old"); setFilterType("all"); setSelectedYear("all");
                }}
                className="text-[10px] uppercase tracking-widest font-black text-rose-500 hover:text-rose-600 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw size={12} /> Reset All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
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

              {/* Financial Year */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Financial Year</label>
                <div className="relative group">
                  <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="all">All Years</option>
                    {availableYears.map(yr => (
                      <option key={yr} value={yr}>Year {yr}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <Calendar size={14} />
                  </div>
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
              Showing {totalRecords === 0 ? 0 : `${startIndex + 1}–${endIndex}`} of {totalRecords} Records
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
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 text-[13px]">
                            {new Date(entry.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                          <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                            <Clock size={11} className="text-gray-400" />
                            {new Date(entry.date).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </span>
                        </div>
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
                          {entry.paymentMode === "GOLD" && (
                            <div className="flex gap-2 mt-0.5">
                               <div className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-100 font-bold uppercase">
                                 {entry.metalType || 'Gold'}: {entry.weight}g @ ₹{entry.rate}/g
                               </div>
                               {entry.purity && (
                                 <div className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold uppercase">
                                   Purity: {entry.purity}
                                 </div>
                               )}
                            </div>
                          )}
                        </div>

                        {(() => {
                          const slips = Array.isArray(entry.purchaseSlips) && entry.purchaseSlips.length > 0
                            ? entry.purchaseSlips
                            : (entry.purchaseSlip ? [entry.purchaseSlip] : []);

                          if (slips.length === 0) return null;

                          return (
                            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                              {slips.map((slipUrl, sIdx) => (
                                <button
                                  key={sIdx}
                                  type="button"
                                  onClick={() => openSlipModal(slips, sIdx)}
                                  className="inline-flex items-center text-[10px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 px-2 py-1 rounded-lg transition-all shadow-xs"
                                  title={`View Slip #${sIdx + 1}`}
                                >
                                  <Eye size={10} className="mr-1 text-indigo-500" />
                                  {slips.length > 1 ? `Slip #${sIdx + 1}` : "View Slip"}
                                </button>
                              ))}
                              {slips.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => openSlipModal(slips, 0)}
                                  className="text-[10px] font-semibold text-gray-500 hover:text-indigo-600 hover:underline px-1 py-0.5"
                                >
                                  ({slips.length} bills)
                                </button>
                              )}
                            </div>
                          );
                        })()}
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
                            setSearchQuery(""); setStartDate(""); setEndDate(""); setMinAmount(""); setMaxAmount(""); setSortOrder("new-to-old"); setFilterType("all"); setSelectedYear("all");
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

          {/* ROBUST PAGINATION & RECORD CONTROLS */}
          {totalRecords > 0 && (
            <div className="p-4 border-t border-gray-100 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Record Range & Year Tag */}
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                <span>
                  Showing <strong className="text-gray-900">{startIndex + 1}</strong> to <strong className="text-gray-900">{endIndex}</strong> of <strong className="text-gray-900">{totalRecords}</strong> entries
                </span>
                {selectedYear !== "all" && (
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-100">
                    Year {selectedYear}
                  </span>
                )}
              </div>

              {/* Rows Per Page Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Rows per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    const val = e.target.value === "all" ? "all" : Number(e.target.value);
                    setItemsPerPage(val);
                    setCurrentPage(1);
                  }}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-700 hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer transition-all shadow-2xs"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value="all">All</option>
                </select>
              </div>

              {/* Smart Navigation Buttons */}
              {itemsPerPage !== "all" && totalPages > 1 ? (
                <div className="flex items-center gap-1">
                  {/* First Page */}
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={safeCurrentPage === 1}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-colors"
                    title="First Page"
                  >
                    <ChevronsLeft size={16} />
                  </button>

                  {/* Previous Page */}
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={safeCurrentPage === 1}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-colors"
                    title="Previous Page"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {/* Page Number Pills */}
                  <div className="flex items-center gap-1 mx-1">
                    {getPageNumbers().map((item, idx) => {
                      if (item === "...") {
                        return (
                          <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs font-bold text-gray-400">
                            ...
                          </span>
                        );
                      }
                      const isCurrent = safeCurrentPage === item;
                      return (
                        <button
                          key={`page-${item}`}
                          onClick={() => setCurrentPage(item)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                            isCurrent
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Page */}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={safeCurrentPage === totalPages}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-colors"
                    title="Next Page"
                  >
                    <ChevronRight size={16} />
                  </button>

                  {/* Last Page */}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={safeCurrentPage === totalPages}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-colors"
                    title="Last Page"
                  >
                    <ChevronsRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="text-xs font-semibold text-gray-400">
                  Page 1 of 1
                </div>
              )}
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

      {/* RECORD PAYMENT MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="p-6 pb-2 flex justify-between items-start">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider mb-1">
                   <DollarSign size={10} /> Settlement
                </div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Record Payment</h2>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">Paying: <span className="text-gray-900 font-bold">{supplier?.name}</span></p>
              </div>
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-gray-900"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="p-6 pt-3 space-y-4">
              {/* Payment Date & Time Input (Allows Past Dates) */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Calendar size={13} className="text-indigo-500" /> Payment Date & Time</span>
                  <span 
                    className="text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer lowercase"
                    onClick={() => setPaymentData(p => ({ ...p, paymentDate: getNowDateTimeLocal() }))}
                  >
                    Set to current
                  </span>
                </label>
                <input 
                  type="datetime-local" 
                  required
                  value={paymentData.paymentDate}
                  onChange={(e) => setPaymentData({...paymentData, paymentDate: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-800 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                />
                <p className="text-[9px] text-gray-400 mt-1 ml-1">Select any past date/time to record old payments</p>
              </div>

              {/* Payment Mode Selector */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Payment Mode</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "CASH", label: "Cash", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/></svg>, color: "indigo" },
                    { id: "BANK", label: "Bank", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11"/></svg>, color: "indigo" },
                    { id: "UPI", label: "UPI", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/></svg>, color: "indigo" },
                    { id: "GOLD", label: "Gold", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 3h12l4 6-10 12L2 9Z"/><path d="M2 9h20"/></svg>, color: "amber" }
                  ].map(mode => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPaymentData({...paymentData, paymentMode: mode.id})}
                      className={`flex flex-col items-center gap-1.5 py-2 px-1 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all border ${
                        paymentData.paymentMode === mode.id 
                          ? mode.color === 'amber'
                            ? 'bg-amber-600 border-amber-600 text-white shadow-md shadow-amber-600/20'
                            : 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20'
                          : 'bg-white border-gray-150 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {mode.icon}
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gold / Metal Input Details */}
              {paymentData.paymentMode === "GOLD" && (
                <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-3.5 space-y-3 animate-in fade-in duration-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-black text-amber-800/70 uppercase tracking-widest mb-1 ml-1">Metal</label>
                      <select 
                        value={paymentData.metalType}
                        onChange={(e) => setPaymentData({...paymentData, metalType: e.target.value})}
                        className="w-full bg-white border border-amber-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-950 outline-none"
                      >
                        <option value="Gold">Gold</option>
                        <option value="Silver">Silver</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-amber-800/70 uppercase tracking-widest mb-1 ml-1">Purity</label>
                      <input 
                        type="text" 
                        placeholder="22KT"
                        value={paymentData.purity}
                        onChange={(e) => setPaymentData({...paymentData, purity: e.target.value})}
                        className="w-full bg-white border border-amber-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-800 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-amber-800/70 uppercase tracking-widest mb-1 ml-1">Weight (g)</label>
                      <input 
                        type="number" 
                        placeholder="0.00"
                        value={paymentData.weight}
                        onChange={(e) => setPaymentData({...paymentData, weight: e.target.value})}
                        className="w-full bg-white border border-amber-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-800 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-amber-800/70 uppercase tracking-widest mb-1 ml-1">Rate (₹/g)</label>
                      <input 
                        type="number" 
                        placeholder="0.00"
                        value={paymentData.rate}
                        onChange={(e) => setPaymentData({...paymentData, rate: e.target.value})}
                        className="w-full bg-white border border-amber-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-800 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-1 ml-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount (₹)</label>
                  {supplier.currentBalance > 0 && (
                    <span 
                      onClick={() => setPaymentData(p => ({ ...p, amount: String(supplier.currentBalance) }))}
                      className="text-[10px] text-emerald-600 font-bold hover:underline cursor-pointer"
                    >
                      Fill Full Balance (₹{supplier.currentBalance.toLocaleString()})
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-base ${paymentData.paymentMode === "GOLD" ? 'text-amber-600' : 'text-emerald-600'}`}>₹</div>
                  <input 
                    type="number" 
                    required
                    placeholder="0.00"
                    value={paymentData.amount}
                    readOnly={paymentData.paymentMode === "GOLD"}
                    onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                    className={`w-full border rounded-xl pl-8 pr-3.5 py-3 text-lg font-black outline-none transition-all ${
                      paymentData.paymentMode === "GOLD" 
                        ? 'bg-amber-50/40 border-amber-200 text-amber-900' 
                        : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-emerald-500 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              {/* Ref ID & Memo */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Ref / UTR ID</label>
                  <input 
                    type="text" 
                    placeholder="e.g. UTR123456"
                    value={paymentData.reference}
                    onChange={(e) => setPaymentData({...paymentData, reference: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Memo / Note</label>
                  <input 
                    type="text" 
                    placeholder="Optional remarks"
                    value={paymentData.note}
                    onChange={(e) => setPaymentData({...paymentData, note: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-500 font-bold text-xs rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className={`flex-[1.5] py-3 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg ${
                    paymentData.paymentMode === "GOLD" 
                      ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20' 
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  }`}
                >
                  {submittingPayment ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "Confirm & Save Payment"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🖼️ Full-Screen Bill/Slip Lightbox Modal in Supplier Ledger */}
      {activeSlips && activeSlips.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col animate-in fade-in duration-150">
          <div className="flex items-center justify-between px-6 py-4 text-white border-b border-white/10">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-400" />
              <span className="text-sm font-bold">
                Purchase Bill / Slip {activeSlipIndex + 1} of {activeSlips.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={activeSlips[activeSlipIndex]}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full transition"
                title="Open original in new tab"
              >
                <ExternalLink size={13} /> Open Tab
              </a>
              <button
                type="button"
                onClick={closeSlipModal}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden">
            <img
              src={activeSlips[activeSlipIndex]}
              alt={`Slip ${activeSlipIndex + 1}`}
              className="max-h-[82vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />

            {activeSlips.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveSlipIndex(prev => (prev > 0 ? prev - 1 : activeSlips.length - 1))}
                  className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition hover:scale-110 shadow-lg"
                  title="Previous bill image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSlipIndex(prev => (prev < activeSlips.length - 1 ? prev + 1 : 0))}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition hover:scale-110 shadow-lg"
                  title="Next bill image"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails Strip if multiple slips */}
          {activeSlips.length > 1 && (
            <div className="py-3 px-6 bg-black/60 border-t border-white/10 flex items-center justify-center gap-2 overflow-x-auto">
              {activeSlips.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSlipIndex(idx)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeSlipIndex === idx ? "border-indigo-500 scale-105 shadow-md" : "border-white/20 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={url} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
