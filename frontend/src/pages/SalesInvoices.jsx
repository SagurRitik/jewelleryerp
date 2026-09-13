

import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteAllSalesInvoices,
  deleteSalesInvoiceById,
  getSalesInvoices,
  exportSalesInvoices,
  importSalesInvoices,
} from "../api/salesInvoiceApi";
import BackButton from "../components/BackButton";
import { useModal } from "../context/ModalContext";
import { useAuth } from "../context/AuthContext";
import {
  QrCode,
  Download,
  Upload,
  Trash2,
  Eye,
  RotateCcw,
  FileSpreadsheet,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  Receipt,
} from "lucide-react";

export default function SalesInvoices() {
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useModal();
  const { user } = useAuth();
  const isAdminOrSuperAdmin = user?.role === "admin" || user?.role === "superadmin";
  const isSuperAdmin = user?.role?.toLowerCase() === "superadmin";

  const fileInputRef = useRef(null);

  const handleExport = async () => {
    try {
      const res = await exportSalesInvoices({
        search,
        fromDate,
        toDate,
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "sales_invoices.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      showAlert("Failed to export invoices");
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
      const res = await importSalesInvoices(formData);
      if (res.data.success) {
        await showAlert(`Successfully imported ${res.data.count} invoices!`);
        fetchInvoices();
      } else {
        await showAlert(res.data.message || "Failed to import invoices");
      }
    } catch (err) {
      console.error(err);
      await showAlert(
        err.response?.data?.message || err.message || "Failed to import invoices"
      );
    }
  };

  const [invoices, setInvoices] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sort, setSort] = useState("date-desc");

  const [loading, setLoading] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getSalesInvoices({
        page,
        limit,
        search,
        fromDate,
        toDate,
        sort,
      });

      setInvoices(res.data?.invoices || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Failed to load sales invoices", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, fromDate, toDate, sort]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleDeleteOne = async (invoiceId, invoiceNo) => {
    const ok = await showConfirm(`Delete invoice ${invoiceNo}?`);
    if (!ok) return;

    try {
      setDeleteBusy(true);
      const res = await deleteSalesInvoiceById(invoiceId);
      await showAlert(res.data?.message || "Invoice deleted successfully");

      if (invoices.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        await fetchInvoices();
      }
    } catch (err) {
      await showAlert(
        err.response?.data?.message || "Failed to delete invoice"
      );
    } finally {
      setDeleteBusy(false);
    }
  };

  const handleDeleteAll = async () => {
    const hasFilters = Boolean(search || fromDate || toDate);
    const ok = await showConfirm(
      hasFilters
        ? "Delete all invoices matching current filters?"
        : "Delete all generated invoices?"
    );
    if (!ok) return;

    try {
      setDeleteBusy(true);
      const res = await deleteAllSalesInvoices({
        search,
        fromDate,
        toDate,
      });

      const { deletedCount = 0, blockedCount = 0, totalMatched = 0 } =
        res.data || {};

      await showAlert(
        `Deleted ${deletedCount} of ${totalMatched} invoices.${blockedCount ? ` ${blockedCount} linked invoices were kept.` : ""}`
      );

      if (page !== 1) {
        setPage(1);
      } else {
        await fetchInvoices();
      }
    } catch (err) {
      await showAlert(
        err.response?.data?.message || "Failed to delete invoices"
      );
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6">
      <BackButton />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold tracking-wider sm:tracking-widest uppercase text-[#531b4e]">
            Sales Invoice History
          </h1>
          <p className="text-xs text-gray-500 hidden sm:block">
            View, search, and manage all customer sales invoices
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {isSuperAdmin && (
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 shadow-sm active:scale-95"
            >
              <Download size={13} className="text-slate-500" />
              <span>Export</span>
            </button>
          )}
          
          <button
            onClick={handleImportClick}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 shadow-sm active:scale-95"
          >
            <Upload size={13} className="text-slate-500" />
            <span>Import</span>
          </button>
          
          <input
            type="file"
            accept=".xlsx, .xls"
            ref={fileInputRef}
            onChange={handleImport}
            className="hidden"
          />

          {isAdminOrSuperAdmin && (
            <button
              onClick={handleDeleteAll}
              disabled={loading || deleteBusy}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm active:scale-95"
            >
              <Trash2 size={13} />
              <span>{deleteBusy ? "Deleting..." : "Delete All"}</span>
            </button>
          )}
        </div>
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 mb-5">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search Invoice / Customer / Mobile"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#531b4e]/20 focus:border-[#531b4e] transition"
          />
        </div>

        <input
          type="date"
          value={fromDate}
          onChange={(e) => {
            setPage(1);
            setFromDate(e.target.value);
          }}
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#531b4e]/20 focus:border-[#531b4e] transition text-gray-600"
          title="From Date"
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => {
            setPage(1);
            setToDate(e.target.value);
          }}
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#531b4e]/20 focus:border-[#531b4e] transition text-gray-600"
          title="To Date"
        />

        <select
          value={sort}
          onChange={(e) => {
            setPage(1);
            setSort(e.target.value);
          }}
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#531b4e]/20 focus:border-[#531b4e] transition text-gray-700 font-medium"
        >
          <option value="date-desc">Date ↓</option>
          <option value="date-asc">Date ↑</option>
          <option value="amount-desc">Amount ↓</option>
          <option value="amount-asc">Amount ↑</option>
        </select>
      </div>

      {/* MOBILE CARD VIEW (< md) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl p-8 border border-gray-200 text-center text-gray-400 animate-pulse">
            Loading invoices...
          </div>
        ) : invoices.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-gray-200 text-center text-gray-400">
            No invoices found
          </div>
        ) : (
          invoices.map((inv) => {
            const customerName = inv.customer?.name || "Cash Customer";
            const customerPhone = inv.customer?.phone || inv.customer?.mobile || "";
            const formattedDate = new Date(inv.date || inv.createdAt).toLocaleDateString("en-IN");
            const grandTotal = inv.totals?.grandTotal || 0;

            return (
              <div
                key={inv._id}
                className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-sm space-y-2.5"
              >
                {/* Top: Invoice No & Date */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Receipt size={15} className="text-[#531b4e] shrink-0" />
                    <span className="font-mono font-bold text-sm text-[#531b4e] truncate">
                      {inv.invoiceNo}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
                    {formattedDate}
                  </span>
                </div>

                {/* Middle: Customer & Amount */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">
                      {customerName}
                    </p>
                    {customerPhone && (
                      <p className="text-[11px] text-gray-400 font-mono">
                        {customerPhone}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-gray-400 block font-medium">Total</span>
                    <span className="text-sm font-bold text-green-700">
                      ₹ {grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Bottom: Action Buttons */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => navigate(`/invoice/${inv._id}`)}
                    className="flex-1 flex items-center justify-center gap-1 bg-[#531b4e] text-white py-1.5 px-2 rounded-lg text-xs font-semibold hover:bg-[#3e143b] transition shadow-sm active:scale-95"
                  >
                    <Eye size={13} />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => navigate(`/returns/create/${inv._id}`)}
                    className="flex-1 flex items-center justify-center gap-1 bg-green-50 text-green-700 border border-green-200 py-1.5 px-2 rounded-lg text-xs font-semibold hover:bg-green-100 transition active:scale-95"
                  >
                    <RotateCcw size={13} />
                    <span>Return</span>
                  </button>

                  {isSuperAdmin && (
                    <button
                      onClick={async () => {
                        try {
                          const res = await exportSalesInvoices({ id: inv._id });
                          const url = window.URL.createObjectURL(new Blob([res.data]));
                          const link = document.createElement("a");
                          link.href = url;
                          link.setAttribute("download", `invoice_${inv.invoiceNo}.xlsx`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        } catch (err) {
                          console.error(err);
                          showAlert("Failed to export invoice");
                        }
                      }}
                      className="flex items-center justify-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 py-1.5 px-2.5 rounded-lg text-xs font-semibold hover:bg-blue-100 transition active:scale-95"
                      title="Export Excel"
                    >
                      <FileSpreadsheet size={13} />
                      <span>Excel</span>
                    </button>
                  )}

                  {isAdminOrSuperAdmin && (
                    <button
                      onClick={() => handleDeleteOne(inv._id, inv.invoiceNo)}
                      disabled={deleteBusy}
                      className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition disabled:opacity-50 active:scale-95"
                      title="Delete Invoice"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP TABLE SECTION (>= md) */}
      <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[#6A3D55] text-white"> 
            <tr>
              <th className="p-3 text-left">Invoice No</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="p-6 text-center text-gray-400">Loading invoices...</td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan="5" className="p-6 text-center text-gray-400">No invoices found</td></tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv._id} className="border-t hover:bg-pink-50 transition-colors">
                  <td className="p-3 font-mono font-medium text-[#531b4e]">
                    {inv.invoiceNo}
                  </td>
                  <td className="text-center text-gray-600">
                    {new Date(inv.date || inv.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="text-center font-medium text-gray-800">
                    {inv.customer?.name || "Cash Customer"}
                  </td>
                  <td className="text-center font-bold text-green-700">
                    ₹ {inv.totals?.grandTotal?.toLocaleString("en-IN") || 0}
                  </td>
                  <td className="text-center">
                    <div className="flex items-center gap-1.5 justify-center min-w-[200px] py-1">
                      <button
                        onClick={() => navigate(`/invoice/${inv._id}`)}
                        className="bg-stone-100 hover:bg-[#531b4e] hover:text-white text-stone-600 px-2.5 py-1 rounded border text-[11px] font-bold transition-colors"
                      >
                        View
                      </button>

                      {isSuperAdmin && (
                        <button
                          onClick={async () => {
                            try {
                              const res = await exportSalesInvoices({ id: inv._id });
                              const url = window.URL.createObjectURL(new Blob([res.data]));
                              const link = document.createElement("a");
                              link.href = url;
                              link.setAttribute("download", `invoice_${inv.invoiceNo}.xlsx`);
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            } catch (err) {
                              console.error(err);
                              showAlert("Failed to export invoice");
                            }
                          }}
                          className="bg-blue-100 hover:bg-blue-600 hover:text-white text-blue-700 px-2.5 py-1 rounded border text-[11px] font-bold transition-colors"
                        >
                          Excel
                        </button>
                      )}

                      <button
                        onClick={() => navigate(`/returns/create/${inv._id}`)}
                        className="bg-green-100 hover:bg-green-600 hover:text-white text-green-700 px-2.5 py-1 rounded border text-[11px] font-bold transition-colors"
                      >
                        Return
                      </button>

                      {isAdminOrSuperAdmin && (
                        <button
                          onClick={() => handleDeleteOne(inv._id, inv.invoiceNo)}
                          disabled={deleteBusy}
                          className="bg-red-100 hover:bg-red-600 hover:text-white text-red-700 px-2.5 py-1 rounded border text-[11px] font-bold disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-5 sm:mt-6 bg-white p-3 rounded-xl border border-gray-200 text-xs sm:text-sm">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <span className="text-gray-600 font-medium">
          Page <strong className="text-gray-900">{page}</strong> of <strong className="text-gray-900">{totalPages}</strong>
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
