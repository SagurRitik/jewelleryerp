

import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { Gem, BadgeCheck, Scale, Tag, Calculator, Wallet, Store, AlignLeft } from "lucide-react";
import { useModal } from "../context/ModalContext";

export default function MetalDebitPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { showAlert } = useModal();

  const [form, setForm] = useState({
    metalType: "",
    purity: "",
    weight: "",
    ratePerGram: "",
    value: "",
    source: "",
    partyName: "",
    notes: ""
  });

  /* PURITY OPTIONS */
  const PURITY_OPTIONS = {
    Gold: ["24KT", "22KT", "18KT", "14KT", "10KT", "9KT"],
    Silver: ["999", "925", "835", "800"],
    Platinum: ["950", "900"]
  };

  /* HANDLE CHANGE */
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };

    /* Reset purity when metal changes */
    if (name === "metalType") {
      updated.purity = "";
    }

    /* Auto calculate value */
    if (name === "weight" || name === "ratePerGram") {
      const weight = name === "weight" ? value : form.weight;
      const rate = name === "ratePerGram" ? value : form.ratePerGram;
      updated.value = weight && rate ? Number(weight) * Number(rate) : "";
    }

    setForm(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.weight || !form.ratePerGram) {
      await showAlert("Weight and rate required");
      return;
    }

    try {
      setLoading(true);

      await API.post("/metal-ledger/debit", {
        metalType: form.metalType,
        purity: form.purity,
        weight: Number(form.weight),
        ratePerGram: Number(form.ratePerGram),
        value: Number(form.value),
        source: form.source || "VENDOR",
        partyName: form.partyName,
        notes: form.notes
      });

      await showAlert("Metal debit recorded");
      navigate("/metal-ledger");
    } catch (err) {
      console.error(err);
      await showAlert(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6 font-sans">
      
      {/* Main Card */}
      <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-[700px] p-8 md:p-10 border border-slate-100">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#7E4C69] mb-1.5">Metal Debit</h1>
          <p className="text-sm text-slate-500">
            Fill in the details below to record a new metal debit entry.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            
            {/* Metal Type */}
            <div className="space-y-1.5">
              <label className="flex items-center text-sm font-semibold text-slate-700">
                <Gem className="w-4 h-4 mr-2 text-slate-600" />
                Metal Type
              </label>
              <select
                name="metalType"
                value={form.metalType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#7E4C69]/20 focus:border-[#7E4C69] transition-all cursor-pointer"
              >
                <option value="">Select Metal</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Platinum">Platinum</option>
              </select>
            </div>

            {/* Purity */}
            <div className="space-y-1.5">
              <label className="flex items-center text-sm font-semibold text-slate-700">
                <BadgeCheck className="w-4 h-4 mr-2 text-slate-600" />
                Purity
              </label>
              <select
                name="purity"
                value={form.purity}
                onChange={handleChange}
                disabled={!form.metalType}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#7E4C69]/20 focus:border-[#7E4C69] transition-all cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                <option value="">Select Purity</option>
                {form.metalType &&
                  PURITY_OPTIONS[form.metalType]?.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
              </select>
            </div>

            {/* Weight */}
            <div className="space-y-1.5">
              <label className="flex items-center text-sm font-semibold text-slate-700">
                <Scale className="w-4 h-4 mr-2 text-slate-600" />
                Weight (g)
              </label>
              <input
                type="number"
                name="weight"
                placeholder="Weight in grams"
                value={form.weight}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7E4C69]/20 focus:border-[#7E4C69] transition-all"
              />
            </div>

            {/* Rate */}
            <div className="space-y-1.5">
              <label className="flex items-center text-sm font-semibold text-slate-700">
                <Tag className="w-4 h-4 mr-2 text-slate-600" />
                Rate per Gram
              </label>
              <input
                type="number"
                name="ratePerGram"
                placeholder="Rate per gram"
                value={form.ratePerGram}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7E4C69]/20 focus:border-[#7E4C69] transition-all"
              />
            </div>

            {/* Value (Auto) */}
            <div className="space-y-1.5">
              <label className="flex items-center text-sm font-semibold text-slate-700">
                <Calculator className="w-4 h-4 mr-2 text-slate-600" />
                Value (Auto)
              </label>
              <input
                type="number"
                name="value"
                placeholder="0.00"
                value={form.value}
                readOnly
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 bg-slate-50 cursor-not-allowed focus:outline-none"
              />
            </div>

            {/* Source */}
            <div className="space-y-1.5">
              <label className="flex items-center text-sm font-semibold text-slate-700">
                <Wallet className="w-4 h-4 mr-2 text-slate-600" />
                Source
              </label>
              <select
                name="source"
                value={form.source}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#7E4C69]/20 focus:border-[#7E4C69] transition-all cursor-pointer"
              >
                <option value="">Select Source</option>
                <option value="VENDOR">Vendor Payment</option>
                <option value="REFINERY">Refinery</option>
                <option value="CASH_CONVERSION">Cash Conversion</option>
              </select>
            </div>
          </div>

          {/* Full Width Fields */}
          <div className="space-y-6 pt-2">
            
            {/* Vendor Name (Conditional) */}
            {form.source === "VENDOR" && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="flex items-center text-sm font-semibold text-slate-700">
                  <Store className="w-4 h-4 mr-2 text-slate-600" />
                  Vendor Name
                </label>
                <input
                  name="partyName"
                  placeholder="Enter vendor name"
                  value={form.partyName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7E4C69]/20 focus:border-[#7E4C69] transition-all"
                />
              </div>
            )}

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="flex items-center text-sm font-semibold text-slate-700">
                <AlignLeft className="w-4 h-4 mr-2 text-slate-600" />
                Notes
              </label>
              <textarea
                name="notes"
                rows="3"
                placeholder="Optional notes"
                value={form.notes}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7E4C69]/20 focus:border-[#7E4C69] transition-all resize-none"
              ></textarea>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#7E4C69] hover:bg-[#683e56] text-white px-8 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Debit"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/metal-ledger")}
              className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 px-8 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}