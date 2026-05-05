import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  FileText, Plus, Search, Filter, Eye, Edit3, Trash2,
  Phone, ChevronLeft, ChevronRight, ShoppingBag, Send,
  RefreshCw, TrendingUp, Clock, CheckCircle, XCircle, MessageCircle
} from "lucide-react";
import { listEstimates, deleteEstimate, markEstimateSent } from "../../api/quotationApi";
import BackButton from "../../components/BackButton";

/* ===== STATUS CONFIG ===== */
const STATUS_CONFIG = {
  DRAFT: { label: "Draft", color: "bg-slate-100 text-slate-600 border-slate-200" },
  SENT: { label: "Sent", color: "bg-blue-100 text-blue-700 border-blue-200" },
  ACCEPTED: { label: "Accepted", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  EXPIRED: { label: "Expired", color: "bg-orange-100 text-orange-700 border-orange-200" },
  CONVERTED: { label: "Converted", color: "bg-[#FCF4FC] text-[#632947] border-[#632947]/20" },
  CANCELLED: { label: "Cancelled", color: "bg-rose-100 text-rose-700 border-rose-200" },
};


const STAT_CARDS = [
  { key: "ALL", label: "All Estimates", icon: FileText, gradient: "from-[#667eea] to-[#764ba2]" },
  { key: "DRAFT", label: "Drafts", icon: Clock, gradient: "from-[#4facfe] to-[#00f2fe]" },
  { key: "SENT", label: "Sent", icon: Send, gradient: "from-[#43e97b] to-[#38f9d7]" },
  { key: "CONVERTED", label: "Converted", icon: CheckCircle, gradient: "from-[#fa709a] to-[#fee140]" },
];

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 0 });

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

export default function EstimateList() {
  const navigate = useNavigate();
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const [filters, setFilters] = useState({ status: "ALL", search: "", page: 1, limit: 15 });
  const [draftSearch, setDraftSearch] = useState("");
  const [stats, setStats] = useState({});

  /* ===== LOAD ===== */
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: filters.page,
        limit: filters.limit,
      };
      if (filters.status !== "ALL") params.status = filters.status;
      if (filters.search.trim()) params.search = filters.search.trim();

      const res = await listEstimates(params);
      setEstimates(res.data.quotations || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch {
      toast.error("Failed to load estimates");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  /* ===== LOAD STATS ===== */
  useEffect(() => {
    const loadStats = async () => {
      try {
        const statKeys = ["DRAFT", "SENT", "CONVERTED", "ACCEPTED"];
        const results = await Promise.all(
          statKeys.map((s) => listEstimates({ status: s, limit: 1 }))
        );
        const s = {};
        statKeys.forEach((key, i) => { s[key] = results[i].data.total || 0; });
        setStats(s);
      } catch (err) {
        console.error("Stats load failed", err);
      }
    };
    loadStats();
  }, [estimates]);


  /* ===== SEARCH DEBOUNCE ===== */
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => ({ ...f, search: draftSearch, page: 1 }));
    }, 400);
    return () => clearTimeout(t);
  }, [draftSearch]);

  /* ===== ACTIONS ===== */
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Cancel this estimate?")) return;
    try {
      await deleteEstimate(id);
      toast.success("Estimate cancelled");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to cancel");
    }
  };

  const handleMarkSent = async (e, id) => {
    e.stopPropagation();
    try {
      await markEstimateSent(id);
      toast.success("Marked as Sent");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed");
    }
  };

  const handleWhatsApp = (e, est) => {
    e.stopPropagation();
    try {
      const customerName = est.customerName || "Customer";
      const mobile = est.mobile?.replace(/\D/g, "");
      const quotationNo = est.quotationNo || "N/A";
      const grandTotal = est.grandTotal || 0;
      const validDays = est.validDays || 7;

      // Build Items Breakdown
      const itemsBreakdown = (est.items || []).map((item, idx) => {
        const name = item.title || `Item ${idx + 1}`;
        const price = item.breakup?.grandTotal || 0;
        return `${idx + 1}. *${name}* - ₹${price.toLocaleString('en-IN')}`;
      }).join('\n');

      const message = `✨ *ESTIMATE: ${quotationNo}* ✨\n\nनमस्ते *${customerName}*,\n\nआपके गहनों का एस्टीमेट (Estimate) तैयार है।\n\n*विवरण:*\n--------------------------------\n${itemsBreakdown}\n--------------------------------\n\n*कुल एस्टीमेट:* ₹${grandTotal.toLocaleString('en-IN')}\n*वैधता:* ${validDays} दिन\n\nधन्यवाद,\n💎 *Nazara Diamonds - Royal Atelier* 💎`;

      const encodedMessage = encodeURIComponent(message);

      if (mobile) {
        // Ensure 91 prefix if 10 digits
        const finalMobile = mobile.length === 10 ? `91${mobile}` : mobile;
        window.open(`https://wa.me/${finalMobile}?text=${encodedMessage}`, "_blank");
      } else {
        toast.error("No mobile number on this estimate");
      }
    } catch (err) {
      console.error("WhatsApp Error:", err);
      toast.error("Failed to generate WhatsApp message");
    }
  };

  const allCount = total;
  const CARDS = [
    { key: "ALL", label: "All Estimates", icon: FileText, gradient: "from-[#667eea] to-[#764ba2]", count: allCount },
    { key: "DRAFT", label: "Drafts", icon: Clock, gradient: "from-[#4facfe] to-[#00f2fe]", count: stats.DRAFT || 0 },
    { key: "SENT", label: "Sent", icon: Send, gradient: "from-[#43e97b] to-[#38f9d7]", count: stats.SENT || 0 },
    { key: "CONVERTED", label: "Converted Orders", icon: CheckCircle, gradient: "from-[#fa709a] to-[#fee140]", count: stats.CONVERTED || 0 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">


      {/* ===== HEADER ===== */}
      <div className="bg-white px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <BackButton />
          <div className="flex items-center justify-between flex-wrap gap-4 -mt-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-[#632947] rounded-xl">
                <FileText className="text-white" size={24} />
              </div>
              Estimates
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 font-medium ml-12">Manage all your jewellery quotations with ease</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={load}
              className="p-2.5 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition-all border border-slate-200"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? "animate-spin text-[#632947]" : ""} />
            </button>
            <button
              id="new-estimate-btn"
              onClick={() => navigate("/quotations/new")}
              className="flex items-center gap-2 bg-[#632947] hover:bg-[#5A374F] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#632947]/20 active:scale-[0.97]"
            >
              <Plus size={18} />
              New Estimate
            </button>
          </div>
        </div>
      </div>
    </div>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ===== STAT CARDS ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CARDS.map((card) => {
            const Icon = card.icon;
            const active = filters.status === card.key;
            return (
              <button
                key={card.key}
                onClick={() => setFilters((f) => ({ ...f, status: card.key, page: 1 }))}
                className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 text-left group ${active
                  ? "border-[#632947]/30 shadow-xl shadow-[#632947]/5 bg-white"
                  : "border-slate-200 bg-white hover:border-[#632947]/50 hover:shadow-md"
                  }`}
              >
                <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${card.gradient} mb-4 shadow-inner`}>
                  <Icon size={18} className="text-white" />
                </div>
                <div className="text-3xl font-black text-slate-900">{card.count}</div>
                <div className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-wider">{card.label}</div>
              </button>
            );
          })}
        </div>
        {/* ===== FILTERS ===== */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap gap-4 items-center shadow-sm">
          <div className="flex-1 min-w-[280px] relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="estimate-search"
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
              placeholder="Search by name, mobile, estimate no…"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#632947] focus:ring-4 focus:ring-[#632947]/10 transition-all"
            />
          </div>
          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Show:</span>
            <select
              value={filters.limit}
              onChange={(e) => setFilters((f) => ({ ...f, limit: Number(e.target.value), page: 1 }))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:border-[#632947] transition cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 font-medium focus:outline-none focus:border-[#632947] transition cursor-pointer"
            >
              <option value="ALL">All Status</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>



        {/* ===== TABLE ===== */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center h-64 gap-3 text-slate-400 bg-white">
              <RefreshCw size={24} className="animate-spin text-[#632947]" />
              <span className="text-sm font-medium tracking-wide">Loading estimates…</span>
            </div>
          ) : estimates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-400 bg-white">
              <div className="p-4 bg-slate-50 rounded-full">
                <FileText size={48} strokeWidth={1.5} className="text-slate-300" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-slate-600">No estimates found</p>
                <button
                  onClick={() => navigate("/quotations/new")}
                  className="text-sm text-[#632947] hover:text-[#5A374F] font-bold mt-2 hover:underline decoration-2 transition"
                >
                  Create your first estimate →
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left px-6 py-4 text-slate-500 font-bold text-[11px] uppercase tracking-widest">Est. No</th>
                    <th className="text-left px-6 py-4 text-slate-500 font-bold text-[11px] uppercase tracking-widest">Customer</th>
                    <th className="text-left px-6 py-4 text-slate-500 font-bold text-[11px] uppercase tracking-widest hidden md:table-cell">Items</th>
                    <th className="text-left px-6 py-4 text-slate-500 font-bold text-[11px] uppercase tracking-widest">Status</th>
                    <th className="text-right px-6 py-4 text-slate-500 font-bold text-[11px] uppercase tracking-widest">Amount</th>
                    <th className="text-left px-6 py-4 text-slate-500 font-bold text-[11px] uppercase tracking-widest hidden lg:table-cell">Date</th>
                    <th className="text-right px-6 py-4 text-slate-500 font-bold text-[11px] uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">

                  {estimates.map((est) => (
                    <tr
                      key={est._id}
                      onClick={() => navigate(`/quotations/${est._id}`)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4.5">
                        <span className="font-mono text-[#632947] font-bold text-xs bg-[#FCF4FC] px-2 py-1 rounded-md">{est.quotationNo}</span>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="font-bold text-slate-900 group-hover:text-[#632947] transition text-sm">{est.customerName}</div>
                        {est.mobile && (
                          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                            <Phone size={10} className="text-slate-400" /> {est.mobile}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4.5 hidden md:table-cell">
                        <span className="text-slate-500 text-xs font-medium bg-slate-100 px-2 py-0.5 rounded-full">{est.items?.length || 0} item{est.items?.length !== 1 ? "s" : ""}</span>
                      </td>
                      <td className="px-6 py-4.5">
                        <StatusBadge status={est.status} />
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <span className="font-extrabold text-slate-900 text-sm">₹{fmt(est.grandTotal)}</span>
                        {est.gstTotal > 0 && (
                          <div className="text-[10px] text-slate-400 mt-1 font-medium italic">Incl. ₹{fmt(est.gstTotal)} GST</div>
                        )}
                      </td>
                      <td className="px-6 py-4.5 hidden lg:table-cell">
                        <span className="text-slate-500 text-xs font-medium">{new Date(est.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>

                          <button
                            onClick={() => navigate(`/quotations/${est._id}`)}
                            title="View"
                            className="p-2 rounded-xl hover:bg-[#FCF4FC] text-slate-400 hover:text-[#632947] transition"
                          >
                            <Eye size={16} />
                          </button>
                          {est.status !== "CONVERTED" && est.status !== "CANCELLED" && (
                            <button
                              onClick={() => navigate(`/quotations/${est._id}/edit`)}
                              title="Edit"
                              className="p-2 rounded-xl hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition"
                            >
                              <Edit3 size={16} />
                            </button>
                          )}
                          {est.status === "DRAFT" && (
                            <button
                              onClick={(e) => handleMarkSent(e, est._id)}
                              title="Mark Sent"
                              className="p-2 rounded-xl hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition"
                            >
                              <Send size={16} />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleWhatsApp(e, est)}
                            title="Send WhatsApp Estimate"
                            className="p-2 rounded-xl hover:bg-emerald-50 text-emerald-500 hover:text-emerald-700 transition"
                          >
                            <MessageCircle size={16} />
                          </button>
                          {est.status !== "CONVERTED" && (
                            <button
                              onClick={(e) => handleDelete(e, est._id)}
                              title="Cancel"
                              className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ===== PAGINATION ===== */}
        {pages > 1 && (
          <div className="flex items-center justify-between flex-wrap gap-6 pt-8 pb-12">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-500 font-medium">
                Showing <span className="text-slate-900 font-bold">{estimates.length}</span> of <span className="text-[#632947] font-bold">{total}</span> total estimates
              </span>
              <div className="w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#632947] transition-all duration-500"
                  style={{ width: `${(filters.page / pages) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={filters.page <= 1}
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                className="flex items-center justify-center w-11 h-11 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:border-[#632947] hover:text-[#632947] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                title="Previous Page"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-100/50 rounded-2xl border border-slate-100">
                {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                  let pageNum;
                  if (pages <= 5) {
                    pageNum = i + 1;
                  } else if (filters.page <= 3) {
                    pageNum = i + 1;
                  } else if (filters.page >= pages - 2) {
                    pageNum = pages - 4 + i;
                  } else {
                    pageNum = filters.page - 2 + i;
                  }

                  const active = filters.page === pageNum;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setFilters((f) => ({ ...f, page: pageNum }))}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${active
                        ? "bg-[#632947] text-white shadow-lg shadow-[#632947]/30 scale-110 z-10"
                        : "text-slate-500 hover:bg-white hover:text-[#632947] hover:shadow-sm"
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={filters.page >= pages}
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                className="flex items-center justify-center w-11 h-11 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:border-[#632947] hover:text-[#632947] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                title="Next Page"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
