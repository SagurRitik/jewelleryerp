


import { useState, useEffect } from "react";
import { useRates } from "../../context/RatesContext";

export default function RatesPanel() {
  const { rawRates, setRawRates } = useRates();
  const [locks, setLocks] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rateLocks');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  // Save locks to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rateLocks', JSON.stringify(locks));
    }
  }, [locks]);

  const toggleLock = (field) => {
    setLocks(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const lockAll = () => {
    const allLocks = {
      gold24KT: true, silver999: true, platinum950: true,
      diamondRate: true, stoneRate: true, makingCharge: true,
      gstRate: true, gstMakingRate: true,
      discountType: true, discountValue: true
    };
    setLocks(allLocks);
  };

  const unlockAll = () => {
    const allLocks = {
      gold24KT: false, silver999: false, platinum950: false,
      diamondRate: false, stoneRate: false, makingCharge: false,
      gstRate: false, gstMakingRate: false,
      discountType: false, discountValue: false
    };
    setLocks(allLocks);
  };

  const resetToDefaults = () => {
    if (window.confirm("Are you sure you want to reset all rates to defaults?")) {
      const defaults = {
        gold24KT: 6000,
        silver999: 80,
        platinum950: 3200,
        diamondRate: 50000,
        stoneRate: 2000,
        makingCharge: 500,
        gstRate: 3,
        gstMakingRate: 5,
        discountType: null,
        discountValue: 0,
      };
      setRawRates(defaults);
      unlockAll();
    }
  };

  // Format number with Indian numbering system
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const lockedCount = Object.values(locks).filter(lock => lock).length;

  return (
    <div className="bg-white rounded-none border border-stone-200 shadow-sm overflow-hidden">
      
      {/* 1. Header Section - Minimalist & Technical */}
      <div className="px-8 py-6 border-b border-stone-200 bg-stone-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border border-stone-200 bg-white flex items-center justify-center text-emerald-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div>
              <h2 className="font-serif text-2xl text-stone-900">Rate Configuration</h2>
              <p className="text-xs uppercase tracking-widest text-stone-500 mt-1">Live Market Control</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             {/* Status Pill */}
             <div className={`px-3 py-1 border text-[10px] uppercase tracking-wider font-semibold rounded-full flex items-center gap-2 ${lockedCount > 0 ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-stone-200 text-stone-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${lockedCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'}`}></span>
                {lockedCount} Parameters Locked
             </div>
          </div>
        </div>
      </div>

      {/* 2. Toolbar - Sleek Actions */}
      <div className="px-8 py-3 bg-white border-b border-stone-100 flex gap-4">
          <ActionButton onClick={lockAll} icon="lock" label="Lock All" />
          <ActionButton onClick={unlockAll} icon="unlock" label="Unlock All" />
          <div className="h-6 w-px bg-stone-200 mx-2 self-center"></div>
          <ActionButton onClick={resetToDefaults} icon="refresh" label="Reset Defaults" isDanger />
      </div>

      <div className="p-0">
        
        {/* 3. The Grid - Divided by lines instead of gaps for a 'Sheet' look */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone-100">
          
          {/* Column 1: Metals */}
          <div className="p-8 space-y-8 bg-white">
            <SectionHeader title="Precious Metals" icon="gold" />
            
            <RateInput
              label="Gold 24KT"
              value={rawRates.gold24KT}
              onChange={(v) => setRawRates(p => ({ ...p, gold24KT: +v || 0 }))}
              locked={locks.gold24KT}
              onToggle={() => toggleLock("gold24KT")}
              prefix="₹"
              formattedValue={formatNumber(rawRates.gold24KT)}
            />
            
            <RateInput
              label="Silver 999"
              value={rawRates.silver999}
              onChange={(v) => setRawRates(p => ({ ...p, silver999: +v || 0 }))}
              locked={locks.silver999}
              onToggle={() => toggleLock("silver999")}
              prefix="₹"
              formattedValue={formatNumber(rawRates.silver999)}
            />
            
            <RateInput
              label="Platinum 950"
              value={rawRates.platinum950}
              onChange={(v) => setRawRates(p => ({ ...p, platinum950: +v || 0 }))}
              locked={locks.platinum950}
              onToggle={() => toggleLock("platinum950")}
              prefix="₹"
              formattedValue={formatNumber(rawRates.platinum950)}
            />
          </div>

          {/* Column 2: Stones & Making */}
          <div className="p-8 space-y-8 bg-stone-50/30">
            <SectionHeader title="Valuation Metrics" icon="diamond" />
            
            <RateInput
              label="Diamond Base Rate"
              subLabel="Per Carat"
              value={rawRates.diamondRate}
              onChange={(v) => setRawRates(p => ({ ...p, diamondRate: +v || 0 }))}
              locked={locks.diamondRate}
              onToggle={() => toggleLock("diamondRate")}
              prefix="₹"
              formattedValue={formatNumber(rawRates.diamondRate)}
            />
            
            <RateInput
              label="Gemstone Base Rate"
              subLabel="Per Carat"
              value={rawRates.stoneRate}
              onChange={(v) => setRawRates(p => ({ ...p, stoneRate: +v || 0 }))}
              locked={locks.stoneRate}
              onToggle={() => toggleLock("stoneRate")}
              prefix="₹"
              formattedValue={formatNumber(rawRates.stoneRate)}
            />
            
            <div className="pt-4 border-t border-stone-100">
               <RateInput
                label="Making Charges"
                subLabel="Per Gram"
                value={rawRates.makingCharge}
                onChange={(v) => setRawRates(p => ({ ...p, makingCharge: +v || 0 }))}
                locked={locks.makingCharge}
                onToggle={() => toggleLock("makingCharge")}
                prefix="₹"
                formattedValue={formatNumber(rawRates.makingCharge)}
               />
            </div>
          </div>

          {/* Column 3: GST & Discount */}
          <div className="p-8 space-y-8 bg-white">
            <SectionHeader title="Adjustments" icon="tax" />
            
            <div className="grid grid-cols-2 gap-4">
                <RateInput
                label="GST (Goods)"
                value={rawRates.gstRate}
                onChange={(v) => setRawRates(p => ({ ...p, gstRate: +v || 0 }))}
                locked={locks.gstRate}
                onToggle={() => toggleLock("gstRate")}
                suffix="%"
                formattedValue={rawRates.gstRate}
                />
                
                <RateInput
                label="GST (Service)"
                value={rawRates.gstMakingRate}
                onChange={(v) => setRawRates(p => ({ ...p, gstMakingRate: +v || 0 }))}
                locked={locks.gstMakingRate}
                onToggle={() => toggleLock("gstMakingRate")}
                suffix="%"
                formattedValue={rawRates.gstMakingRate}
                />
            </div>
            
            <div className="space-y-4 pt-6 border-t border-stone-100">
              <label className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Global Discount</label>
              <div className="relative">
                <select
                  value={rawRates.discountType || "none"}
                  onChange={(e) =>
                    setRawRates(p => ({ ...p, discountType: e.target.value === "none" ? null : e.target.value }))
                  }
                  disabled={locks.discountType}
                  className={`w-full px-4 py-3 border ${locks.discountType ? 'bg-stone-50 text-stone-400' : 'bg-white text-stone-900'} border-stone-200 text-sm focus:outline-none focus:border-emerald-600 transition duration-200 appearance-none font-serif`}
                >
                  <option value="none">No Discount</option>
                  <option value="flat">Flat Amount (₹)</option>
                  <option value="percent">Percentage (%)</option>
                </select>
                <div className="absolute right-2 top-2">
                    <LockButton locked={locks.discountType} onToggle={() => toggleLock("discountType")} />
                </div>
              </div>
              
              <RateInput
                label="Discount Value"
                value={rawRates.discountValue}
                onChange={(v) => setRawRates(p => ({ ...p, discountValue: +v || 0 }))}
                locked={locks.discountValue}
                onToggle={() => toggleLock("discountValue")}
                prefix={rawRates.discountType === "percent" ? "" : "₹"}
                suffix={rawRates.discountType === "percent" ? "%" : ""}
                formattedValue={formatNumber(rawRates.discountValue)}
              />
            </div>
          </div>
        </div>

        {/* 4. Footer - The "Ticker Tape" Look */}
        <div className="bg-emerald-950 text-emerald-50 px-8 py-4 flex flex-col md:flex-row justify-between items-center text-xs tracking-wider">
           <div className="font-mono opacity-60">System Ready • Last Updated: Just now</div>
           <div className="flex gap-6 mt-2 md:mt-0 font-mono">
               <span>GOLD: ₹{formatNumber(rawRates.gold24KT)}</span>
               <span className="text-emerald-700">|</span>
               <span>SILVER: ₹{formatNumber(rawRates.silver999)}</span>
               <span className="text-emerald-700">|</span>
               <span>USD/INR: 83.40 (Est)</span>
           </div>
        </div>

      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

function SectionHeader({ title, icon }) {
    return (
        <div className="flex items-center gap-3 pb-2 border-b border-stone-100">
             <span className="text-emerald-800">
                 {icon === 'gold' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                 {icon === 'diamond' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
                 {icon === 'tax' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
             </span>
             <h3 className="font-serif text-lg text-stone-900">{title}</h3>
        </div>
    )
}

function ActionButton({ onClick, icon, label, isDanger }) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-2 text-xs font-medium uppercase tracking-wider transition-colors 
            ${isDanger 
                ? 'text-red-800 hover:text-red-600' 
                : 'text-stone-500 hover:text-emerald-800'}`}
        >
            {/* Simple Icons */}
            {icon === 'lock' && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
            {icon === 'unlock' && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>}
            {icon === 'refresh' && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
            {label}
        </button>
    )
}

function RateInput({ label, subLabel, value, onChange, locked, onToggle, prefix = "", suffix = "", formattedValue }) {
  return (
    <div className="space-y-2 group">
      <div className="flex items-end justify-between">
        <div>
            <label className="block text-[10px] uppercase font-bold tracking-widest text-stone-500">{label}</label>
            {subLabel && <span className="text-[10px] text-stone-400 italic">{subLabel}</span>}
        </div>
        <LockButton locked={locked} onToggle={onToggle} />
      </div>
      
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 pointer-events-none">
            <span className="text-stone-400 font-mono text-sm">{prefix}</span>
        </div>
        
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={locked}
          className={`
            w-full pl-8 pr-8 py-2 border-b-2 bg-transparent font-mono text-lg transition-all duration-300
            ${locked 
                ? 'border-stone-100 text-stone-400 cursor-not-allowed bg-stone-50/50' 
                : 'border-stone-200 text-stone-900 focus:border-emerald-800 focus:outline-none'
            }
          `}
        />
        
        <div className="absolute right-0 top-0 bottom-0 flex items-center pr-3 pointer-events-none">
            <span className="text-stone-400 font-mono text-sm">{suffix}</span>
        </div>
      </div>
      
      {/* Helper text that fades in on hover */}
      <div className="h-4">
        <p className="text-[10px] text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
           Current: {prefix}{formattedValue}{suffix}
        </p>
      </div>
    </div>
  );
}

function LockButton({ locked, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 border
        ${locked 
            ? 'bg-stone-100 border-stone-200 text-stone-400 hover:bg-stone-200' 
            : 'bg-white border-emerald-200 text-emerald-600 hover:border-emerald-500 hover:text-emerald-700 shadow-sm'
        }
      `}
      title={locked ? "Unlock field" : "Lock field"}
    >
      {locked ? (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
      ) : (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
      )}
    </button>
  );
}