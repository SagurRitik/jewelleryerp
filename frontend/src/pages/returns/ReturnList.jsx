import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, RefreshCw, CreditCard, Eye,
  Gem, Layers, Wrench, Percent, TrendingDown,
  ChevronDown, ChevronUp, Package, BadgeCheck,
  PlusCircle, BarChart3, Download, ChevronLeft, ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";
import "./ReturnList.css";


const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const fmt = (n) => r2(n).toLocaleString("en-IN");

/* ── Status pill config ── */
const STATUS_MAP = {
  PENDING: { label: "Pending", cls: "rl-status pending" },
  APPROVED: { label: "Approved", cls: "rl-status approved" },
  REJECTED: { label: "Rejected", cls: "rl-status rejected" },
  COMPLETED: { label: "Completed", cls: "rl-status completed" },
};

const TYPE_MAP = {
  refund: { label: "Refund", icon: <CreditCard size={12} />, cls: "rl-type-refund" },
  exchange: { label: "Exchange", icon: <RefreshCw size={12} />, cls: "rl-type-exchange" },
};

/* ── Summary card ── */
function SummaryCard({ icon, label, value, sub, accent }) {
  return (
    <div className="rl-summary-card" style={{ "--accent": accent }}>
      <div className="rl-summary-icon" style={{ background: accent + "22", color: accent }}>{icon}</div>
      <div>
        <div className="rl-summary-value">{value}</div>
        <div className="rl-summary-label">{label}</div>
        {sub && <div className="rl-summary-sub">{sub}</div>}
      </div>
    </div>
  );
}

export default function ReturnList() {
  const navigate = useNavigate();

  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [expandedId, setExpandedId] = useState(null);

  /* Pagination State */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/returns");
      setReturns(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to load returns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  /* ── Sort handler ── */
  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  /* ── Filtered + sorted data ── */
  const filtered = useMemo(() => {
    let data = [...returns];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(r =>
        r.returnNo?.toLowerCase().includes(q) ||
        r.invoiceNo?.toLowerCase().includes(q) ||
        r.customer?.name?.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== "ALL") data = data.filter(r => r.status === filterStatus);
    if (filterType !== "ALL") data = data.filter(r => r.returnType === filterType);

    data.sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (sortKey === "finalAmount") { va = Number(va || 0); vb = Number(vb || 0); }
      else if (sortKey === "createdAt") { va = new Date(va); vb = new Date(vb); }
      else { va = String(va || ""); vb = String(vb || ""); }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [returns, search, filterStatus, filterType, sortKey, sortDir]);

  /* Reset to page 1 when filters change */
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, filterType]);

  /* Pagination logic */
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

  /* CSV Export */
  const exportToCSV = () => {
    if (filtered.length === 0) {
      toast.error("No data to export");
      return;
    }
    const headers = [
      "Return #", "Invoice", "Customer Name", "Customer Mobile", "Return Type", 
      "Status", "Metal", "Diamond", "Stone", "Making", "Discount", "GST", "Final Amount", "Date"
    ];
    
    const csvRows = [headers.map(h => `"${h}"`).join(",")];
    
    filtered.forEach(r => {
      const av = r.adjustedValues || {};
      const bd = r.breakdown || {};
      const row = [
        r.returnNo || "—",
        r.invoiceNo || "—",
        r.customer?.name || "—",
        r.customer?.mobile || "—",
        r.returnType || "—",
        r.status || "—",
        av.metal ?? bd.metal ?? 0,
        av.diamond ?? bd.diamond ?? 0,
        av.stone ?? bd.stone ?? 0,
        av.making ?? bd.making ?? 0,
        av.discount ?? bd.discount ?? 0,
        av.gst ?? bd.gst ?? 0,
        r.finalAmount || 0,
        r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN") : "—"
      ];
      // escape quotes in fields
      csvRows.push(row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","));
    });
    
    const blob = new Blob([csvRows.join("\\n")], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Returns_Export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  /* ── Summary stats ── */
  const stats = useMemo(() => {
    const total = returns.length;
    const pending = returns.filter(r => r.status === "PENDING").length;
    const completed = returns.filter(r => r.status === "COMPLETED").length;
    const totalRefunded = returns
      .filter(r => r.status === "COMPLETED" && r.returnType === "refund")
      .reduce((s, r) => s + (r.finalAmount || 0), 0);
    const totalCredited = returns
      .filter(r => r.status === "COMPLETED" && r.returnType === "exchange")
      .reduce((s, r) => s + (r.finalAmount || 0), 0);
    return { total, pending, completed, totalRefunded, totalCredited };
  }, [returns]);

  /* ── Sort icon ── */
  const SortIcon = ({ k }) => sortKey === k
    ? (sortDir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />)
    : <ChevronDown size={13} style={{ opacity: 0.3 }} />;

  /* ── Row expand toggle ── */
  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

  if (loading) return (
    <div className="rl-page">
      <div style={{ textAlign: "center", paddingTop: 80 }}>
        <div className="spinner" />
        <p style={{ marginTop: 16, color: "#8B8286", fontFamily: "Inter,sans-serif" }}>Loading returns…</p>
      </div>
    </div>
  );

  return (
    <div className="rl-page">
      <div className="rl-inner">

        {/* ── Header ── */}
        <div className="rl-header">
          <div>
            <h1 className="rl-title">Return Orders</h1>
            <p className="rl-subtitle">{returns.length} total returns · Refunds & Exchanges</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="rl-btn-outline" onClick={exportToCSV}>
              <Download size={15} /> Export
            </button>
            <button className="rl-btn-outline" onClick={load}>
              <RefreshCw size={15} /> Refresh
            </button>
            <button className="rl-btn-primary" onClick={() => navigate("/sales-invoices")}>
              <PlusCircle size={15} /> New Return
            </button>
          </div>
        </div>

        {/* ── Summary Cards ── */}
        <div className="rl-summary-row">
          <SummaryCard icon={<Package size={20} />} label="Total Returns" value={stats.total} accent="#5E2743" />
          <SummaryCard icon={<BarChart3 size={20} />} label="Pending" value={stats.pending} accent="#D4597A" sub="Awaiting action" />
          <SummaryCard icon={<BadgeCheck size={20} />} label="Completed" value={stats.completed} accent="#2A4531" />
          <SummaryCard icon={<CreditCard size={20} />} label="Total Refunded" value={`₹${fmt(stats.totalRefunded)}`} accent="#c0392b" />
          <SummaryCard icon={<RefreshCw size={20} />} label="Credit Issued" value={`₹${fmt(stats.totalCredited)}`} accent="#1a7740" />
        </div>

        {/* ── Filters ── */}
        <div className="rl-filters">
          <div className="rl-search-box">
            <Search size={15} />
            <input
              type="text"
              placeholder="Search by return #, invoice, customer…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="rl-filter-group">
            <Filter size={14} />
            {["ALL", "PENDING", "APPROVED", "REJECTED", "COMPLETED"].map(s => (
              <button key={s}
                className={`rl-filter-pill ${filterStatus === s ? "active" : ""}`}
                onClick={() => setFilterStatus(s)}
              >{s === "ALL" ? "All Status" : STATUS_MAP[s]?.label}</button>
            ))}
          </div>

          <div className="rl-filter-group">
            {["ALL", "refund", "exchange"].map(t => (
              <button key={t}
                className={`rl-filter-pill ${filterType === t ? "active type" : ""}`}
                onClick={() => setFilterType(t)}
              >
                {t === "ALL" ? "All Types" : t === "refund" ? "Refund" : "Exchange"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="rl-table-card">
          {filtered.length === 0 ? (
            <div className="rl-empty">
              <Package size={40} color="#d4c5cc" />
              <p>No returns match your filters.</p>
            </div>
          ) : (
            <table className="rl-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("returnNo")} className="rl-th-sort">
                    Return # <SortIcon k="returnNo" />
                  </th>
                  <th onClick={() => handleSort("invoiceNo")} className="rl-th-sort">
                    Invoice <SortIcon k="invoiceNo" />
                  </th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th className="rl-th-num">Metal</th>
                  <th className="rl-th-num">Diamond</th>
                  <th className="rl-th-num">Stone</th>
                  <th className="rl-th-num">Making</th>
                  <th className="rl-th-num">Discount</th>
                  <th className="rl-th-num">GST</th>
                  <th onClick={() => handleSort("finalAmount")} className="rl-th-sort rl-th-num">
                    Final Amt <SortIcon k="finalAmount" />
                  </th>
                  <th>Status</th>
                  <th className="rl-th-num">Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {paginatedData.map((r, i) => {
                    const av = r.adjustedValues || {};
                    const bd = r.breakdown || {};
                    const tm = TYPE_MAP[r.returnType] || TYPE_MAP.refund;
                    const sm = STATUS_MAP[r.status] || STATUS_MAP.PENDING;
                    const isExpanded = expandedId === r._id;
                    const date = r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

                    return (
                      <>
                        <motion.tr
                          key={r._id}
                          className={`rl-row ${isExpanded ? "expanded" : ""}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.02, duration: 0.2 }}
                          onClick={() => toggleExpand(r._id)}
                        >
                          <td className="rl-mono">{r.returnNo || "—"}</td>
                          <td className="rl-mono rl-muted">{r.invoiceNo || "—"}</td>
                          <td>
                            <div className="rl-customer">{r.customer?.name || "—"}</div>
                            <div className="rl-customer-phone">{r.customer?.mobile || ""}</div>
                          </td>
                          <td>
                            <span className={tm.cls}>
                              {tm.icon} {tm.label}
                            </span>
                          </td>

                          {/* Component breakdown columns — show adjustedValues if available, else breakdown */}
                          <td className="rl-num">{fmt(av.metal ?? bd.metal ?? 0)}</td>
                          <td className="rl-num">{fmt(av.diamond ?? bd.diamond ?? 0)}</td>
                          <td className="rl-num">{fmt(av.stone ?? bd.stone ?? 0)}</td>
                          <td className="rl-num">{fmt(av.making ?? bd.making ?? 0)}</td>
                          <td className="rl-num">
                            {(av.discount ?? bd.discount ?? 0) > 0 ? "-" : ""}₹{fmt(av.discount ?? bd.discount ?? 0)}
                          </td>
                          <td className="rl-num">{fmt(av.gst ?? bd.gst ?? 0)}</td>

                          <td className="rl-amount">₹{fmt(r.finalAmount || 0)}</td>
                          <td><span className={sm.cls}>{sm.label}</span></td>
                          <td className="rl-date">{date}</td>
                          <td>
                            <button
                              className="rl-view-btn"
                              onClick={e => { e.stopPropagation(); navigate(`/returns/${r._id}`); }}
                            >
                              <Eye size={14} /> View
                            </button>
                          </td>
                        </motion.tr>

                        {/* ── Expanded row — adjustment rules ── */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.tr
                              key={`${r._id}-expand`}
                              className="rl-expand-row"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <td colSpan={13}>
                                <div className="rl-expand-content">
                                  <div className="rl-expand-section">
                                    <span className="rl-expand-title">
                                      <TrendingDown size={13} /> Adjustment Rules
                                    </span>
                                    <div className="rl-expand-chips">
                                      {r.adjustments ? <>
                                        <span>Metal: {r.adjustments.useLatestMetalRate ? "Latest Rate" : "Original"}</span>
                                        <span>Diamond: {r.adjustments.diamondPercent}%</span>
                                        <span>Stone: {r.adjustments.stonePercent}%</span>
                                        <span>Making: {r.adjustments.makingOption === "custom"
                                          ? `₹${fmt(r.adjustments.makingCustomValue)}`
                                          : r.adjustments.makingOption}</span>
                                        <span>GST: {r.adjustments.includeGST ? "Included" : "Excluded"}</span>
                                        {r.adjustments.metalRateUsed > 0 &&
                                          <span>Rate Used: ₹{fmt(r.adjustments.metalRateUsed)}/g</span>}
                                      </> : <span style={{ color: "#aaa" }}>No adjustment data</span>}
                                    </div>
                                  </div>

                                  {r.reason && (
                                    <div className="rl-expand-section">
                                      <span className="rl-expand-title">Reason</span>
                                      <p className="rl-expand-reason">"{r.reason}"</p>
                                    </div>
                                  )}

                                  {/* Original vs Adjusted mini table */}
                                  {r.breakdown && r.adjustedValues && (
                                    <div className="rl-expand-section">
                                      <span className="rl-expand-title"><BarChart3 size={13} /> Component Comparison</span>
                                      <div className="rl-mini-table">
                                        {["metal", "diamond", "stone", "making", "discount", "gst"].map(k => {
                                          const orig = r.breakdown[k] || 0;
                                          const adj = r.adjustedValues[k] || 0;
                                          const diff = r2(adj - orig);
                                          return (
                                            <div key={k} className="rl-mini-row">
                                              <span className="rl-mini-label">{k.charAt(0).toUpperCase() + k.slice(1)}</span>
                                              <span className="rl-mini-orig">₹{fmt(orig)}</span>
                                              <span className="rl-mini-arrow">→</span>
                                              <span className="rl-mini-adj">₹{fmt(adj)}</span>
                                              {Math.abs(diff) > 0.01 && (
                                                <span className={`rl-mini-diff ${diff > 0 ? "pos" : "neg"}`}>
                                                  {diff > 0 ? "+" : ""}₹{fmt(Math.abs(diff))}
                                                </span>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {r.creditNoteId && (
                                    <div className="rl-expand-section">
                                      <span className="rl-expand-chip-green">
                                        <BadgeCheck size={12} /> Credit Note Issued
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="rl-footer-flex">
          <p className="rl-footer-note">
            Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} returns
          </p>
          
          {totalPages > 1 && (
            <div className="rl-pagination">
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} />
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}