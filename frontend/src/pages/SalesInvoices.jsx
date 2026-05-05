

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteAllSalesInvoices,
  deleteSalesInvoiceById,
  getSalesInvoices,
} from "../api/salesInvoiceApi";
import BackButton from "../components/BackButton";
import { useModal } from "../context/ModalContext";

export default function SalesInvoices() {
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useModal();

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
    <div className="max-w-7xl mx-auto p-6">
      <BackButton/>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl tracking-widest uppercase">
          Sales Invoice History
        </h1>

        <button
          onClick={handleDeleteAll}
          disabled={loading || deleteBusy}
          className="rounded border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleteBusy ? "Deleting..." : "Delete All Invoices"}
        </button>
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search Invoice / Customer / Mobile"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="border p-2 rounded"
        />

        <input
          type="date"
          value={fromDate}
          onChange={(e) => {
            setPage(1);
            setFromDate(e.target.value);
          }}
          className="border p-2 rounded"
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => {
            setPage(1);
            setToDate(e.target.value);
          }}
          className="border p-2 rounded"
        />

        <select
          value={sort}
          onChange={(e) => {
            setPage(1);
            setSort(e.target.value);
          }}
          className="border p-2 rounded"
        >
          <option value="date-desc">Date ↓</option>
          <option value="date-asc">Date ↑</option>
          <option value="amount-desc">Amount ↓</option>
          <option value="amount-asc">Amount ↑</option>
        </select>
      </div>

      {/* TABLE */}
      {/* TABLE SECTION */}
      <div className="overflow-x-auto border rounded bg-white shadow-sm">
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
              <tr><td colSpan="5" className="p-6 text-center">Loading...</td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan="5" className="p-6 text-center">No invoices found</td></tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv._id} className="border-t hover:bg-pink-50 transition-colors">
                  <td className="p-3 font-mono font-medium text-[#531b4e]">
                    {inv.invoiceNo}
                  </td>
                    <td className="text-center">
                    {new Date(inv.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="text-center font-medium">
                    {inv.customer?.name || "Cash Customer"}
                  </td>
                  <td className="text-center font-bold text-green-700">
                    ₹ {inv.totals?.grandTotal?.toLocaleString("en-IN") || 0}
                  </td>
                  <td className="text-center">
                    {/* 🔥 MAIN CHANGE: Navigate to the Purple Invoice Preview */}
                    {/* <button
                      onClick={() => navigate(`/invoice/${inv._id}`)} 
                      className="bg-stone-100 hover:bg-[#531b4e] hover:text-white text-stone-600 px-3 py-1 rounded border transition-all text-xs font-bold uppercase tracking-wider"
                    >
                      View Bill
                    </button> */}
        {/* <td className="text-center">
  <div className="flex gap-2 justify-center">

    <button
      onClick={() => navigate(`/invoice/${inv._id}`)}
      className="bg-stone-100 hover:bg-[#531b4e] hover:text-white text-stone-600 px-3 py-1 rounded border text-xs font-bold"
    >
      View
    </button>

    <button
      onClick={() => navigate(`/returns/create/${inv._id}`)}
      className="bg-green-100 hover:bg-green-600 hover:text-white text-green-700 px-3 py-1 rounded border text-xs font-bold"
    >
      Return
    </button>

  </div>
</td> */}
 <div className="flex gap-2 justify-center">

      <button
        onClick={() => navigate(`/invoice/${inv._id}`)}
        className="bg-stone-100 hover:bg-[#531b4e] hover:text-white text-stone-600 px-3 py-1 rounded border text-xs font-bold"
      >
        View
      </button>

      <button
        onClick={() => navigate(`/returns/create/${inv._id}`)}
        className="bg-green-100 hover:bg-green-600 hover:text-white text-green-700 px-3 py-1 rounded border text-xs font-bold"
      >
        Return
      </button>

      <button
        onClick={() => handleDeleteOne(inv._id, inv.invoiceNo)}
        disabled={deleteBusy}
        className="bg-red-100 hover:bg-red-600 hover:text-white text-red-700 px-3 py-1 rounded border text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50"
      >
        Delete
      </button>

    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* <div className="overflow-x-auto border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Invoice No</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center">
                  No invoices found
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-mono">{inv.invoiceNo}</td>
                  <td>
                    {new Date(inv.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td>{inv.customer?.name || "-"}</td>
                  <td>₹ {inv.totals?.grandTotal || 0}</td>
                  <td>
                    <button
                      onClick={() =>
                        navigate(`/sales-invoices/${inv._id}`)
                      }
                      className="text-[#5A374F] font-semibold"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div> */}

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="bg-[#6A3D55] px-4 py-2 border rounded disabled:opacity-40"
        >
          Prev
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="bg-[#6A3D55] px-4 py-2 border rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
