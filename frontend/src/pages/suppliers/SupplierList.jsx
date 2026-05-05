import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Search, Plus, Edit, Eye, Power, PowerOff, Filter, DollarSign, FileText, X, Trash2 } from "lucide-react";

export default function SupplierList() {
  const [suppliers, setSuppliers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Payment Modal States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentMode: "BANK",
    reference: "",
    note: ""
  });
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const navigate = useNavigate();

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const url = `/api/suppliers?search=${searchQuery}${showActiveOnly ? '&activeOnly=true' : ''}`;
      const res = await axios.get(url);
      setSuppliers(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch suppliers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSuppliers();
    }, 400); // 400ms debounce on search
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, showActiveOnly]);

  const toggleStatus = async (id, currentStatus) => {
    try {
      if (currentStatus) {
        if (!window.confirm("Are you sure you want to deactivate this supplier?")) return;
        await axios.patch(`/api/suppliers/${id}/deactivate`);
        toast.success("Supplier deactivated");
      } else {
        if (!window.confirm("Are you sure you want to reactivate this supplier?")) return;
        await axios.patch(`/api/suppliers/${id}/activate`);
        toast.success("Supplier activated successfully");
      }
      fetchSuppliers();
    } catch (err) {
      toast.error(`Failed to ${currentStatus ? 'deactivate' : 'activate'} supplier`);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to PERMANENTLY DELETE supplier: ${name}? This action cannot be undone.`)) return;
    
    try {
      await axios.delete(`/api/suppliers/${id}`);
      toast.success("Supplier deleted successfully");
      fetchSuppliers();
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to delete supplier";
      toast.error(errMsg);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentData.amount || Number(paymentData.amount) <= 0) {
      return toast.error("Please enter a valid amount");
    }

    setSubmittingPayment(true);
    try {
      await axios.post("/api/supplier-payments", {
        supplierId: selectedSupplier._id,
        amount: Number(paymentData.amount),
        paymentMode: paymentData.paymentMode,
        reference: paymentData.reference,
        note: paymentData.note
      });
      toast.success("Payment recorded successfully");
      setIsPaymentModalOpen(false);
      fetchSuppliers(); // Refresh list to see updated balance
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || "Failed to record payment";
      toast.error(errMsg);
    } finally {
      setSubmittingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF9F9] p-6 md:p-10 font-sans text-gray-800">
      <div className="max-w-[1200px] mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-[32px] font-bold text-[#1A1A1A] tracking-tight mb-1">Supplier Master</h1>
            <p className="text-[#8B8286] text-sm font-medium">Manage and monitor all material and service providers.</p>
          </div>
          <button 
            onClick={() => navigate("/suppliers/new")}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md shadow-indigo-600/20"
          >
            <Plus size={18} /> Add Supplier
          </button>
        </div>

        {/* CONTROLS */}
        <div className="bg-white p-4 rounded-t-2xl shadow-sm border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Name or Mobile..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
            <button 
              onClick={() => setShowActiveOnly(false)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${!showActiveOnly ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
            >
              All
            </button>
            <button 
              onClick={() => setShowActiveOnly(true)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${showActiveOnly ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Active Only
            </button>
          </div>
        </div>

        {/* TABLE LOGIC */}
        <div className="bg-white rounded-b-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden border border-gray-50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">Supplier Name</th>
                  <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">Contact</th>
                  <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">GST Number</th>
                  <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 text-right">Balance</th>
                  <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 text-center">Status</th>
                  <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    </td>
                  </tr>
                ) : suppliers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-gray-400 font-medium text-sm">
                      No suppliers found. Try adjusting your search query.
                    </td>
                  </tr>
                ) : (
                  suppliers.map((s) => (
                    <tr key={s._id} className="hover:bg-indigo-50/30 transition-colors group">
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                            {s.name ? s.name.substring(0, 2).toUpperCase() : "??"}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800 text-sm">{s.name}</div>
                            {s.state && <div className="text-xs text-gray-500 mt-0.5">{s.state} {s.city && `, ${s.city}`}</div>}
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="text-sm font-medium text-gray-700">{s.mobile}</div>
                        {s.email && <div className="text-xs text-gray-500">{s.email}</div>}
                      </td>

                      <td className="py-4 px-6">
                        <div className="text-sm font-medium text-gray-600">{s.gstNumber || <span className="text-gray-400 italic">Not Provided</span>}</div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className={`text-sm font-bold ${s.balanceType === 'RECEIVABLE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          ₹{(s.currentBalance ?? s.openingBalance ?? 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">
                          {s.balanceType}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <button 
                          onClick={() => toggleStatus(s._id, s.isActive)}
                          className={`inline-flex px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all hover:scale-105 active:scale-95 ${
                            s.isActive 
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                              : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                          }`}
                          title={`Click to ${s.isActive ? 'Deactivate' : 'Activate'}`}
                        >
                          {s.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          
                          <button 
                            onClick={() => {
                              setSelectedSupplier(s);
                              setPaymentData({ amount: "", paymentMode: "BANK", reference: "", note: "" });
                              setIsPaymentModalOpen(true);
                            }}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Make Payment"
                          >
                            <DollarSign size={16} />
                          </button>

                          <button 
                            onClick={() => navigate(`/suppliers/${s._id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Ledger"
                          >
                            <FileText size={16} />
                          </button>

                          <button 
                            onClick={() => navigate(`/suppliers/edit/${s._id}`)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Supplier"
                          >
                            <Edit size={16} />
                          </button>

                            {s.isActive ? (
                              <button 
                                onClick={() => toggleStatus(s._id, s.isActive)}
                                className="px-3 py-1.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-lg text-[10px] font-bold uppercase tracking-tight hover:bg-orange-600 hover:text-white transition-all flex items-center gap-1.5"
                                title="Click to Deactivate"
                              >
                                <PowerOff size={12} /> Deactivate
                              </button>
                            ) : (
                              <button 
                                onClick={() => toggleStatus(s._id, s.isActive)}
                                className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[10px] font-bold uppercase tracking-tight hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-1.5"
                                title="Click to Activate"
                              >
                                <Power size={12} /> Activate
                              </button>
                            )}

                            <button 
                              onClick={() => handleDelete(s._id, s.name)}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                              title="Delete Supplier"
                            >
                              <Trash2 size={16} />
                            </button>
                          
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30">
            <span className="text-xs font-semibold text-gray-500">Total Suppliers: {suppliers.length}</span>
          </div>
        </div>

      </div>

      {/* PAYMENT MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Record Payment</h2>
                <p className="text-xs text-gray-500 mt-1">Paying to: <span className="font-bold text-indigo-600">{selectedSupplier?.name}</span></p>
              </div>
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Amount (₹)</label>
                <input 
                  type="number" 
                  autoFocus
                  required
                  placeholder="0.00"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold text-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Payment Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {["CASH", "BANK", "UPI"].map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentData({...paymentData, paymentMode: mode})}
                      className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                        paymentData.paymentMode === mode 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-200'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Reference / TXN ID</label>
                <input 
                  type="text" 
                  placeholder="Optional reference"
                  value={paymentData.reference}
                  onChange={(e) => setPaymentData({...paymentData, reference: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 outline-none transition-all focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Note</label>
                <textarea 
                  placeholder="Optional internal note"
                  rows={2}
                  value={paymentData.note}
                  onChange={(e) => setPaymentData({...paymentData, note: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 outline-none transition-all focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="flex-2 py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {submittingPayment ? "Recording..." : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
