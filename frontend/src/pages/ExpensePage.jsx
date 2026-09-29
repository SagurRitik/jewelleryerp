import React, { useEffect, useState, useRef } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Plus,
  Filter,
  Download,
  Upload,
  Landmark,
  Banknote,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
  Trash2,
  ArrowLeft,
} from "lucide-react";

export default function ExpensePage() {
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ totalExpense: 0 });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0, limit: 10 });
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    category: "",
  });
  const [categories, setCategories] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, [page, filters]);

  const fetchExpenses = async () => {
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...filters,
      });

      const res = await API.get(`/expenses?${params.toString()}`);
      setExpenses(res.data.expenses || []);
      setSummary(res.data.summary || {});
      setPagination(
        res.data.pagination || {
          pages: 1,
          total: res.data.expenses?.length || 0,
          limit: 10,
        }
      );
    } catch (err) {
      console.error(err);
      alert("Failed to fetch expenses");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/expenses/categories");
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch categories");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setPage(1);
    fetchExpenses();
  };

  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      category: "",
    });
    setPage(1);
  };

  /* Helper for Payment Icons */
  const getPaymentIcon = (mode) => {
    const m = mode?.toUpperCase() || "";
    if (m.includes("UPI")) return <Landmark className="w-3.5 h-3.5 mr-1.5 text-slate-500" />;
    if (m.includes("CASH")) return <Banknote className="w-3.5 h-3.5 mr-1.5 text-slate-500" />;
    if (m.includes("CARD")) return <CreditCard className="w-3.5 h-3.5 mr-1.5 text-slate-500" />;
    return <Landmark className="w-3.5 h-3.5 mr-1.5 text-slate-500" />;
  };

  /* Helper for Date Formatting */
  const fmtDate = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this expense?");
    if (!confirmDelete) return;

    try {
      await API.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams(filters);
      const res = await API.get(`/expenses/export?${params.toString()}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "expenses.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("Failed to export expenses");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    e.target.value = "";

    const formData = new FormData();
    formData.append("excel", file);

    try {
      const res = await API.post("/expenses/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        alert(`Successfully imported ${res.data.count} expenses!`);
        fetchExpenses();
      } else {
        alert(res.data.message || "Failed to import expenses");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Failed to import expenses");
    }
  };

  const handleEdit = (id) => {
    navigate(`/expenses/edit/${id}`);
  };

  /* Pagination text calculation */
  const startItem = (page - 1) * (pagination.limit || 10) + 1;
  const endItem = Math.min(page * (pagination.limit || 10), pagination.total || expenses.length);

  return (
    <div className="min-h-screen bg-[#FCFBFA] p-3 sm:p-6 md:p-8 flex flex-col font-sans text-slate-800 pb-12">
      <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col">
        {/* BACK BUTTON */}
        <div className="mb-3 sm:mb-5">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-[#6A3D55] font-semibold text-xs sm:text-sm py-1.5 px-2.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        {/* TOP SECTION: Title & Summary Card */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h3 className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase mb-1">
              Overview
            </h3>
            <h1 className="text-xl sm:text-2xl md:text-[30px] font-bold text-[#6A3D55] tracking-tight">
              Expense Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg">
              Track and manage store expenditures, repairs, and daily overheads.
            </p>
          </div>

          {/* Summary Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-5 w-full md:w-[280px] shrink-0">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase">
                Total Expense
              </span>
              <div className="bg-[#F4EAEE] text-[#6A3D55] p-1.5 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#6A3D55] break-words">
              ₹ {summary.totalExpense?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
            </div>
            <div className="flex justify-end text-[10px] font-bold uppercase tracking-wider text-[#6A3D55] mt-2">
              {new Date().toLocaleString("en-US", { month: "short", year: "numeric" }).toUpperCase()}
            </div>
          </div>
        </div>

        {/* ACTION BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
          <h2 className="text-base sm:text-lg font-bold text-[#6A3D55]">Recent Transactions</h2>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <button
              onClick={() => navigate("/expenses/new")}
              className="flex-1 sm:flex-initial bg-[#6A3D55] hover:bg-[#5C3149] text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" /> <span>Add Expense</span>
            </button>

            <button
              onClick={() => setIsFilterVisible(!isFilterVisible)}
              className={`flex-1 sm:flex-initial px-3 py-2 border rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 active:scale-95 ${
                isFilterVisible
                  ? "bg-[#6A3D55] text-white border-[#6A3D55]"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Filter className="w-3.5 h-3.5" /> <span>Filter</span>
            </button>

            <button
              onClick={handleExport}
              className="flex-1 sm:flex-initial px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" /> <span>Export</span>
            </button>

            <button
              onClick={handleImportClick}
              className="flex-1 sm:flex-initial px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" /> <span>Import</span>
            </button>

            <input
              type="file"
              accept=".xlsx, .xls"
              ref={fileInputRef}
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>

        {/* FILTER SECTION */}
        {isFilterVisible && (
          <div className="bg-white rounded-xl shadow-sm p-3.5 sm:p-4 mb-5 border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="p-2 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#6A3D55]/20 focus:border-[#6A3D55]"
                title="Start Date"
              />

              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="p-2 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#6A3D55]/20 focus:border-[#6A3D55]"
                title="End Date"
              />

              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="p-2 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-700 font-medium outline-none focus:ring-2 focus:ring-[#6A3D55]/20 focus:border-[#6A3D55]"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <button
                  onClick={applyFilters}
                  className="flex-1 bg-[#6A3D55] text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-[#5C3149] transition shadow-sm"
                >
                  Apply
                </button>
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MOBILE CARD VIEW (< md) */}
        <div className="md:hidden space-y-3 mb-6">
          {expenses.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-400 text-sm">
              No expenses found
            </div>
          ) : (
            expenses.map((e) => (
              <div
                key={e._id}
                className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm space-y-2.5"
              >
                {/* Top: Date & Category */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-500">
                    {fmtDate(e.expenseDate)}
                  </span>
                  <span className="bg-[#F4EAEE] text-[#6A3D55] px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">
                    {e.category}
                  </span>
                </div>

                {/* Middle: Amount & Payment Mode */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Amount</span>
                    <span className="text-base font-bold text-[#6A3D55]">
                      ₹ {e.amount?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    {getPaymentIcon(e.paymentMode)}
                    <span className="uppercase">{e.paymentMode}</span>
                  </div>
                </div>

                {/* Details: Party & Reference & Notes */}
                {(e.partyName || e.reference || e.notes) && (
                  <div className="text-xs text-slate-500 pt-1 border-t border-slate-100 space-y-0.5">
                    {e.partyName && (
                      <p className="text-slate-700 font-medium">
                        Party: <span className="text-slate-800">{e.partyName}</span>
                      </p>
                    )}
                    {e.reference && (
                      <p className="text-[11px] text-slate-400 font-mono">
                        Ref: {e.reference}
                      </p>
                    )}
                    {e.notes && (
                      <p className="text-[11px] text-slate-500 italic">
                        {e.notes}
                      </p>
                    )}
                  </div>
                )}

                {/* Bottom Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleEdit(e._id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition active:scale-95"
                  >
                    <ListOrdered size={13} />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(e._id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition active:scale-95"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* DESKTOP TABLE VIEW (>= md) */}
        <div className="hidden md:block bg-white rounded-xl shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-200/80 overflow-hidden mb-6 flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-[#FAFAFA] border-b border-slate-100">
                  <th className="py-3.5 px-5 text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase">Date</th>
                  <th className="py-3.5 px-5 text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase">Category</th>
                  <th className="py-3.5 px-5 text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase">Amount</th>
                  <th className="py-3.5 px-5 text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase">Payment</th>
                  <th className="py-3.5 px-5 text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase">Reference</th>
                  <th className="py-3.5 px-5 text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase">Party</th>
                  <th className="py-3.5 px-5 text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase">Notes</th>
                  <th className="py-3.5 px-5 text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-slate-500 text-sm">
                      No expenses found
                    </td>
                  </tr>
                ) : (
                  expenses.map((e) => (
                    <tr key={e._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-5 text-sm font-medium text-slate-800 whitespace-nowrap">
                        {fmtDate(e.expenseDate)}
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-block bg-[#F4EAEE] text-[#6A3D55] px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">
                          {e.category}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-sm font-bold text-[#6A3D55] whitespace-nowrap">
                        ₹ {e.amount?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-5 text-sm font-medium text-slate-700 uppercase">
                        <div className="flex items-center">
                          {getPaymentIcon(e.paymentMode)}
                          <span>{e.paymentMode}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-sm text-slate-500">
                        {e.reference || "-"}
                      </td>
                      <td className="py-4 px-5 text-sm text-slate-600 font-medium">
                        {e.partyName || "-"}
                      </td>
                      <td className="py-4 px-5 text-sm text-slate-500 italic max-w-[150px] truncate">
                        {e.notes || "-"}
                      </td>
                      <td className="py-4 px-5 text-center">
                        <div className="flex justify-center items-center gap-1.5">
                          <button
                            onClick={() => handleEdit(e._id)}
                            className="p-1.5 text-slate-400 hover:text-[#6A3D55] hover:bg-slate-100 rounded transition-colors"
                            title="Edit"
                          >
                            <ListOrdered className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(e._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm bg-white p-3 rounded-xl border border-slate-200/80 gap-3">
          <div className="text-slate-500 font-medium">
            Showing {expenses.length > 0 ? startItem : 0}-{endItem} of {pagination.total || expenses.length} transactions
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="flex items-center px-2.5 py-1 text-[#6A3D55] font-semibold hover:bg-slate-100 rounded-md transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-4 h-4 mr-0.5" /> Prev
            </button>

            {Array.from({ length: pagination.pages || 1 }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md font-bold text-xs sm:text-sm transition-colors ${
                  p === page ? "bg-[#6A3D55] text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              disabled={page === pagination.pages}
              onClick={() => setPage(page + 1)}
              className="flex items-center px-2.5 py-1 text-[#6A3D55] font-semibold hover:bg-slate-100 rounded-md transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Next <ChevronRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
