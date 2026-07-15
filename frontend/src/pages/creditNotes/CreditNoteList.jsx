import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Search, Filter, SortAsc, SortDesc, ChevronLeft, ChevronRight, Download, CreditCard, Activity, CheckCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CreditNoteList() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [stats, setStats] = useState({
    totalAmount: 0,
    activeCount: 0,
    usedCount: 0,
    totalCount: 0
  });

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  // Fetch stats separately (could be once or when data changes)
  const fetchStats = async () => {
    try {
      const res = await axios.get("/api/creditnotes/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/creditnotes", {
        params: {
          page,
          search,
          status,
          sortBy,
          order,
          limit: 10
        }
      });
      setNotes(res.data.notes);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error("Error fetching credit notes:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, sortBy, order]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Debounced search (simple version)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const getInitials = (name) => {
    if (!name) return "NA";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setOrder("desc");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 text-gray-600 hover:text-[#6B3654] hover:border-[#6B3654]/20 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Credit Notes</h1>
              <p className="text-gray-500 mt-1 text-sm max-w-md leading-relaxed">
                Manage institutional credit adjustments, reversals, and customer account balances.
              </p>
            </div>
          </div>
          <button className="bg-[#6B3654] hover:bg-[#582A44] transition-colors text-white px-5 py-2.5 rounded-md text-sm font-medium shadow-sm flex items-center gap-2">
            <Download size={16} /> Export Records
          </button>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Issued */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-40 transition-transform hover:scale-[1.02]">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 bg-pink-50 text-[#6B3654] rounded-lg flex items-center justify-center">
                <CreditCard size={20} />
              </div>
              <span className="flex items-center text-xs font-bold text-green-600">
                <Activity size={12} className="mr-1" /> Live
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Total Credit Issued</p>
              <h2 className="text-2xl font-bold text-gray-900">
                ₹{stats.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
            </div>
          </div>

          {/* Active Credits */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-40 transition-transform hover:scale-[1.02]">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <Activity size={20} />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-2">Active Credits</p>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{stats.activeCount}</h2>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div 
                  className="bg-[#6B3654] h-1.5 rounded-full transition-all duration-500" 
                  style={{ width: `${stats.totalCount > 0 ? (stats.activeCount / stats.totalCount) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Used Credits */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-40 transition-transform hover:scale-[1.02]">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                <CheckCircle size={20} />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-2">Used Credits</p>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{stats.usedCount}</h2>
              <p className="text-xs text-gray-400 font-medium">Out of {stats.totalCount} total notes</p>
            </div>
          </div>
        </div>

        {/* DATA TABLE SECTION */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-50 bg-[#FBFBFB]">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, name or mobile..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-[#6B3654] focus:border-transparent outline-none transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2">
                <Filter size={16} className="text-gray-400" />
                <select 
                  className="bg-transparent outline-none text-sm cursor-pointer"
                  value={status}
                  onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                >
                  <option value="">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="USED">Used</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>

              <div className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2">
                {order === "asc" ? <SortAsc size={16} /> : <SortDesc size={16} />}
                <select 
                  className="bg-transparent outline-none text-sm cursor-pointer"
                  value={sortBy}
                  onChange={(e) => toggleSort(e.target.value)}
                >
                  <option value="createdAt">Date Created</option>
                  <option value="amount">Amount</option>
                  <option value="creditNoteNo">Note ID</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-bold text-gray-500 cursor-pointer hover:text-gray-900" onClick={() => toggleSort("creditNoteNo")}>
                    Credit Note ID {sortBy === "creditNoteNo" && (order === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-bold text-gray-500">Customer Name</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-bold text-gray-500 cursor-pointer hover:text-gray-900" onClick={() => toggleSort("createdAt")}>
                    Date Issued {sortBy === "createdAt" && (order === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-bold text-gray-500 cursor-pointer hover:text-gray-900" onClick={() => toggleSort("amount")}>
                    Amount {sortBy === "amount" && (order === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-bold text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="5" className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                    </tr>
                  ))
                ) : notes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 text-sm">
                      No credit notes found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  notes.map((n) => (
                    <tr key={n._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#6B3654]">
                        {n.creditNoteNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#F3E8EF] text-[#6B3654] flex items-center justify-center text-[10px] font-bold">
                          {getInitials(n.customer?.name)}
                        </div>
                        <div>
                          <p className="text-sm text-gray-700 font-medium">{n.customer?.name || "Unknown"}</p>
                          <p className="text-[10px] text-gray-400">{n.customer?.mobile}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 tracking-tight">
                        ₹{n.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-[10px] leading-5 font-bold rounded-full uppercase tracking-wide ${
                            n.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : n.status === "USED"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {n.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {!loading && notes.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between bg-[#FBFBFB]">
              <span className="text-xs text-gray-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2 rounded border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex items-center gap-1">
                   {/* SIMPLE PAGINATION NUMBERS */}
                   {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .map((p, i, arr) => (
                      <div key={p} className="flex items-center">
                        {i > 0 && p - arr[i-1] > 1 && <span className="px-1 text-gray-400">...</span>}
                        <button
                          onClick={() => setPage(p)}
                          className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-all ${
                            page === p ? "bg-[#6B3654] text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {p}
                        </button>
                      </div>
                    ))}
                </div>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-2 rounded border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}