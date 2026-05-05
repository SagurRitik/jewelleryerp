import { useEffect, useState, useCallback } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { useModal } from "../context/ModalContext";
import {
  TrendingUp, Bell, CheckCircle2, AlertCircle, Calendar,
  Filter, Download, ChevronLeft, ChevronRight, Plus, X, Search, Trash2,
  Clock, Flag, User, Phone, Mail, ArrowLeft
} from "lucide-react";
import * as XLSX from "xlsx";

const STATUS_COLORS = {
  NEW: "bg-blue-100 text-blue-700 border-blue-200",
  CONTACTED: "bg-purple-100 text-purple-700 border-purple-200",
  FOLLOW_UP: "bg-orange-100 text-orange-700 border-orange-200",
  INTERESTED: "bg-indigo-100 text-indigo-700 border-indigo-200",
  NEGOTIATION: "bg-amber-100 text-amber-700 border-amber-200",
  NOT_INTERESTED: "bg-gray-100 text-gray-700 border-gray-200",
  CONVERTED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  CLOSED: "bg-rose-100 text-rose-700 border-rose-200",
};

const PRIORITY_COLORS = {
  HIGH: "text-rose-600 bg-rose-50 border-rose-100",
  MEDIUM: "text-amber-600 bg-amber-50 border-amber-100",
  LOW: "text-emerald-600 bg-emerald-50 border-emerald-100",
};

export default function InquiryListPage() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
  });
  const [filters, setFilters] = useState({
    customerName: "",
    productType: "",
    status: "",
    sortBy: "latest",
  });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const { showConfirm } = useModal();

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...filters,
      });
      const res = await API.get(`/inquiries?${params.toString()}`);
      setData(res.data.data || []);
      setPagination(res.data.pagination || { currentPage: 1, totalPages: 1, totalRecords: 0 });
    } catch (error) {
      console.error("Failed to fetch inquiries", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData(pagination.currentPage);
  }, [pagination.currentPage, fetchData]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = () => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchData(1);
  };

  const handleResetFilters = () => {
    setFilters({ customerName: "", productType: "", status: "", sortBy: "latest" });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchData(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({ ...filters, export: 'true' });
      const res = await API.get(`/inquiries?${params.toString()}`);
      const exportData = res.data.data.map(item => ({
        'Customer Name': item.customerName,
        'Mobile': item.mobile,
        'Email': item.email,
        'Product Type': item.productType,
        'Budget': item.budget,
        'Status': item.status,
        'Priority': item.priority || "MEDIUM",
        'Source': item.source || "WALK_IN",
        'Follow-up Date': item.followUpDate ? new Date(item.followUpDate).toLocaleDateString() : '-',
        'Created At': new Date(item.createdAt).toLocaleString(),
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
      XLSX.writeFile(workbook, "LeadManagementReport.xlsx");
    } catch (error) {
      console.error("Failed to export inquiries", error);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    const ok = await showConfirm("Delete this lead?");
    if (ok) {
      try {
        await API.delete(`/inquiries/${id}`);
        fetchData(pagination.currentPage);
      } catch (error) {
        console.error("Failed to delete inquiry", error);
      }
    }
  };

  const getFollowUpStatus = (date) => {
    if (!date) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fDate = new Date(date);
    fDate.setHours(0, 0, 0, 0);

    if (fDate < today) return { label: "Overdue", color: "text-rose-600 bg-rose-50" };
    if (fDate.getTime() === today.getTime()) return { label: "Today", color: "text-amber-600 bg-amber-50" };
    return { label: "Upcoming", color: "text-blue-600 bg-blue-50" };
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-[1400px] mx-auto">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-slate-500 hover:text-[#462434] font-bold text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-black text-[#2D1B24] tracking-tight mb-2">
              Lead Center
            </h1>
            <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Managing your high-intent customer leads & follow-ups
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export Leads
            </button>
            <button
              onClick={() => navigate("/inquiries/bulk")}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Bulk Upload
            </button>
            <button
              onClick={() => navigate("/inquiries/new")}
              className="bg-[#462434] hover:bg-[#341a26] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center shadow-lg shadow-[#462434]/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-4 h-4 mr-2" /> New Lead
            </button>
          </div>
        </div>

        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Total Leads", value: pagination.totalRecords, icon: Flag, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Active Follow-ups", value: data.filter(i => i.status === 'FOLLOW_UP').length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Converted (Win)", value: data.filter(i => i.status === 'CONVERTED').length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Overdue Actions", value: data.filter(i => i.followUpDate && new Date(i.followUpDate) < new Date().setHours(0, 0, 0, 0)).length, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{stat.label}</h3>
                <p className="text-2xl font-black text-slate-800">{stat.value.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* DATA TABLE SECTION */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">

          <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-800">Lead Pipeline</h2>
              <p className="text-xs text-slate-400 font-medium">Sorted by most recent activity</p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Quick search leads..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-[#462434]/10 focus:border-[#462434] transition-all outline-none"
                  value={filters.customerName}
                  onChange={(e) => {
                    setFilters(f => ({ ...f, customerName: e.target.value }));
                    // debounce would be better, but keeping it simple
                  }}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all ${showFilters ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              >
                <Filter size={16} /> Filters
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="p-6 bg-slate-50 border-b border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Product Type</label>
                  <input type="text" name="productType" value={filters.productType} onChange={handleFilterChange} placeholder="e.g. Ring, Necklace" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Status</label>
                  <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-white">
                    <option value="">All Statuses</option>
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="FOLLOW_UP">Follow Up</option>
                    <option value="INTERESTED">Interested</option>
                    <option value="NEGOTIATION">Negotiation</option>
                    <option value="CONVERTED">Converted</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Sort By</label>
                  <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-white">
                    <option value="latest">Latest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
                <div className="flex items-end gap-2 pb-0.5">
                  <button onClick={handleFilterSubmit} className="flex-1 bg-[#462434] text-white h-[42px] rounded-xl text-sm font-bold hover:shadow-lg transition-all">Apply</button>
                  <button onClick={handleResetFilters} className="px-4 h-[42px] bg-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-300 transition-all">Reset</button>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/30">
                  <th className="py-4 px-6 text-[11px] font-black uppercase tracking-wider text-slate-400">Lead Info</th>
                  <th className="py-4 px-6 text-[11px] font-black uppercase tracking-wider text-slate-400">Contact</th>
                  <th className="py-4 px-6 text-[11px] font-black uppercase tracking-wider text-slate-400">Priority</th>
                  <th className="py-4 px-6 text-[11px] font-black uppercase tracking-wider text-slate-400">Pipeline Stage</th>
                  <th className="py-4 px-6 text-[11px] font-black uppercase tracking-wider text-slate-400">Next Follow-up</th>
                  <th className="py-4 px-6 text-[11px] font-black uppercase tracking-wider text-slate-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-[#462434] border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-bold text-slate-400">Refreshing your pipeline...</span>
                      </div>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-30">
                        <User size={48} />
                        <span className="text-sm font-bold">No leads found in this view</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((lead, idx) => {
                    const fuStatus = getFollowUpStatus(lead.followUpDate);
                    return (
                      <tr
                        key={lead._id}
                        onClick={() => navigate(`/inquiries/${lead._id}`)}
                        className="group hover:bg-slate-50/50 transition-all cursor-pointer"
                      >
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-[#F8F3F5] text-[#462434] flex items-center justify-center font-black text-sm border border-[#F1E9ED]">
                              {lead.customerName?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-slate-800 mb-0.5">{lead.customerName}</h4>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Source:</span>
                                <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                  {lead.source || "Walk-in"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                              <Phone size={12} className="text-slate-400" /> {lead.mobile}
                            </div>
                            {lead.email && (
                              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                                <Mail size={12} /> {lead.email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${PRIORITY_COLORS[lead.priority || 'MEDIUM']}`}>
                            <Flag size={10} fill="currentColor" /> {lead.priority || "MEDIUM"}
                          </span>
                        </td>
                        <td className="py-5 px-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase border shadow-sm ${STATUS_COLORS[lead.status] || STATUS_COLORS.NEW}`}>
                            {lead.status?.replace("_", " ") || "NEW"}
                          </span>
                        </td>
                        <td className="py-5 px-6">
                          {lead.followUpDate ? (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                                <Calendar size={14} className="text-slate-400" />
                                {new Date(lead.followUpDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}
                              </div>
                              {fuStatus && (
                                <span className={`w-max px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${fuStatus.color}`}>
                                  {fuStatus.label}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-slate-300 italic">No schedule set</span>
                          )}
                        </td>
                        <td className="py-5 px-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleDelete(e, lead._id)}
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs font-bold text-slate-400">
              Displaying <span className="text-slate-800">{data.length}</span> of <span className="text-slate-800">{pagination.totalRecords}</span> leads
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-xs transition-all ${pagination.currentPage === i + 1 ? 'bg-[#462434] text-white shadow-md shadow-[#462434]/20' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
