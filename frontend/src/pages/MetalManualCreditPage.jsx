


import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { useRates } from "../context/RatesContext";
import { User, Cuboid, BadgeCheck, Scale, IndianRupee, PenLine, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useModal } from "../context/ModalContext";

export default function MetalManualCreditPage() {
  const navigate = useNavigate();
  const { rates, loading } = useRates();
  const { showAlert } = useModal();

  const [form, setForm] = useState({
    partyName: "",
    metalType: "gold",
    purity: "",
    weight: "",
    ratePerGram: 0,
    notes: ""
  });

  /* ---------------- PURITY OPTIONS ---------------- */
  const purityOptions = {
    gold: ["24KT", "22KT", "18KT", "14KT", "10KT", "9KT"],
    silver: ["999", "925", "835", "800"],
    platinum: ["950", "900"]
  };

  /* ---------------- METAL CHANGE ---------------- */
  const handleMetalChange = (metal) => {
    setForm(prev => ({
      ...prev,
      metalType: metal,
      purity: "",
      ratePerGram: 0
    }));
  };

  /* ---------------- PURITY CHANGE ---------------- */
  const handlePurityChange = (purity) => {
    const rate = rates?.helpers?.getMetalRate(form.metalType, purity) || 0;
    setForm(prev => ({
      ...prev,
      purity,
      ratePerGram: rate
    }));
  };

  /* ---------------- VALUE ---------------- */
  const value = (Number(form.weight || 0) * Number(form.ratePerGram || 0));
  const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/metal-ledger/manual-credit", {
        partyName: form.partyName,
        metalType: form.metalType,
        purity: form.purity,
        weight: Number(form.weight),
        ratePerGram: Number(form.ratePerGram),
        notes: form.notes
      });
      await showAlert("Metal credit added");
      navigate("/metal-ledger");
    } catch (err) {
      await showAlert(err.response?.data?.error || "Error");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 font-sans">
      
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl text-slate-800 font-serif mb-2">Manual Metal Credit</h1>
        <p className="text-xs text-slate-400 font-semibold tracking-[0.15em] uppercase">
          Record New Precious Metal Deposit
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-[520px] p-8 border border-slate-100">
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Party / Customer Name */}
          <div className="space-y-1.5">
            <label className="flex items-center text-sm font-semibold text-slate-600">
              <User className="w-4 h-4 mr-2 text-slate-400" />
              Party / Customer Name
            </label>
            <input 
              type="text" 
              placeholder="Enter Full Name" 
              required
              value={form.partyName}
              onChange={(e) => setForm({ ...form, partyName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7E4C69] focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Metal Type */}
            <div className="space-y-1.5">
              <label className="flex items-center text-sm font-semibold text-slate-600">
                <Cuboid className="w-4 h-4 mr-2 text-slate-400" />
                Metal Type
              </label>
              <select 
                value={form.metalType}
                onChange={(e) => handleMetalChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#7E4C69] focus:border-transparent transition-all cursor-pointer"
              >
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
                <option value="platinum">Platinum</option>
              </select>
            </div>

            {/* Purity */}
            <div className="space-y-1.5">
              <label className="flex items-center text-sm font-semibold text-slate-600">
                <BadgeCheck className="w-4 h-4 mr-2 text-slate-400" />
                Purity
              </label>
              <select 
                value={form.purity}
                onChange={(e) => handlePurityChange(e.target.value)}
                disabled={loading}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#7E4C69] focus:border-transparent transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select Purity</option>
                {purityOptions[form.metalType]?.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Weight */}
            <div className="space-y-1.5">
              <label className="flex items-center text-sm font-semibold text-slate-600">
                <Scale className="w-4 h-4 mr-2 text-slate-400" />
                Weight (grams)
              </label>
              <input 
                type="number" 
                step="0.001"
                min="0"
                required
                placeholder="0.000" 
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7E4C69] focus:border-transparent transition-all"
              />
            </div>

            {/* Rate (Auto-filled & ReadOnly) */}
            <div className="space-y-1.5">
              <label className="flex items-center text-sm font-semibold text-slate-600">
                <IndianRupee className="w-4 h-4 mr-2 text-slate-400" />
                Rate (per gram)
              </label>
              <input 
                type="number" 
                placeholder="0.00" 
                value={form.ratePerGram}
                readOnly
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-500 bg-slate-50 cursor-not-allowed focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Estimated Value Box */}
          <div className="mt-6 bg-[#FAF7F8] border border-[#F2E8EC] rounded-xl p-5 flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold tracking-widest text-[#7E4C69] uppercase mb-1">
              Estimated Metal Value
            </span>
            <div className="flex items-center space-x-1">
              <span className="text-xl text-slate-500 font-serif">₹</span>
              <span className="text-3xl font-serif text-slate-800 font-medium">
                {fmt(value)}
              </span>
            </div>
          </div>

          {/* Notes / Remarks */}
          <div className="space-y-1.5 pt-2">
            <label className="flex items-center text-sm font-semibold text-slate-600">
              <PenLine className="w-4 h-4 mr-2 text-slate-400" />
              Notes / Remarks
            </label>
            <textarea 
              rows="3" 
              placeholder="Additional details or specific purity notes..." 
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7E4C69] focus:border-transparent transition-all resize-none"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="w-full mt-4 bg-[#7E4C69] hover:bg-[#683e56] text-white font-medium py-3.5 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-sm"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="tracking-wide text-sm font-semibold">SAVE CREDIT RECORD</span>
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center flex flex-col items-center space-y-2">
        <div className="flex items-center text-slate-400 text-xs font-medium space-x-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span>Secure Transaction System</span>
        </div>
        <p className="text-[10px] text-slate-400 tracking-wider">
          © 2026 Metal Ledger Pro • Precision & Integrity
        </p>
      </div>

    </div>
  );
}