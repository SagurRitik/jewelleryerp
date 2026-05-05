import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Building2, Contact, MapPin, Receipt, Save, X } from "lucide-react";

export default function SupplierForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    gstNumber: "",
    state: "",
    city: "",
    address: "",
    pincode: "",
    openingBalance: 0,
    balanceType: "PAYABLE"
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode) {
      axios.get(`/api/suppliers/${id}`)
        .then(res => {
          // Normalize the data (ensure no nulls crash inputs)
          const d = res.data;
          setFormData({
            name: d.name || "",
            mobile: d.mobile || "",
            email: d.email || "",
            gstNumber: d.gstNumber || "",
            state: d.state || "",
            city: d.city || "",
            address: d.address || "",
            pincode: d.pincode || "",
            openingBalance: d.openingBalance || 0,
            balanceType: d.balanceType || "PAYABLE"
          });
          setLoading(false);
        })
        .catch(err => {
          toast.error("Failed to load supplier details");
          navigate("/suppliers");
        });
    }
  }, [id, navigate, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Basic Form Validation
    if (!formData.name.trim()) return toast.error("Supplier Name is required");
    if (!formData.mobile.trim() || formData.mobile.length < 10) {
      return toast.error("Valid 10-digit Mobile Number is required");
    }

    setSaving(true);
    try {
      if (isEditMode) {
        await axios.put(`/api/suppliers/${id}`, formData);
        toast.success("Supplier updated successfully");
      } else {
        await axios.post("/api/suppliers", formData);
        toast.success("Supplier created successfully");
      }
      navigate("/suppliers");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save supplier");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF9F9]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF9F9] p-6 md:p-10 font-sans text-gray-800">
      <div className="max-w-[800px] mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate("/suppliers")}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 text-gray-600 hover:text-indigo-600 hover:border-indigo-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-[28px] font-bold text-[#1A1A1A] tracking-tight leading-tight">
              {isEditMode ? "Edit Supplier" : "New Supplier"}
            </h1>
            <p className="text-[#8B8286] text-sm font-medium">
              {isEditMode ? "Update supplier profile and ledgers." : "Register a new materials or service vendor."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* SECTION 1: Basic Info */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-6">
              <Contact className="text-indigo-500" size={20} /> Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier Name *</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Acme Gems Private Limited"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number *</label>
                <input 
                  type="text" 
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="10-digit numeric"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@acme.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Business & Location Info */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-6">
              <Building2 className="text-indigo-500" size={20} /> Business & Address
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">GST Number</label>
                <input 
                  type="text" 
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  placeholder="GSTIN Format"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all uppercase"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <textarea 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Full street address..."
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                <input 
                  type="text" 
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                <select 
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none"
                >
                  <option value="">Select State</option>
                  {["Maharashtra", "Gujarat", "Delhi", "Karnataka", "Tamil Nadu", "Rajasthan", "West Bengal"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode</label>
                <input 
                  type="text" 
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="6-digit code"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Financial Details */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-6">
              <Receipt className="text-indigo-500" size={20} /> Ledger Opening Balance
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹)</label>
                <input 
                  type="number" 
                  name="openingBalance"
                  value={formData.openingBalance}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Balance Type</label>
                <select 
                  name="balanceType"
                  value={formData.balanceType}
                  onChange={handleChange}
                  className={`w-full border rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 outline-none transition-all appearance-none ${formData.balanceType === 'PAYABLE' ? 'bg-rose-50 text-rose-700 border-rose-200 focus:ring-rose-500/20 focus:border-rose-500' : 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-500/20 focus:border-emerald-500'}`}
                >
                  <option value="PAYABLE">Payable (We owe them)</option>
                  <option value="RECEIVABLE">Receivable (They owe us)</option>
                </select>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => navigate("/suppliers")}
              className="w-full sm:w-auto px-6 py-3 bg-white text-gray-700 font-bold text-sm rounded-xl border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
            >
              <X size={18} /> Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Save size={18} /> {saving ? "Saving..." : "Save Supplier"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
