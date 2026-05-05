// import { useEffect, useState } from "react";
// import { getDailyClosing } from "../api/posInvoiceApi";

// export default function DailyPosClosing() {
//   const [selectedDate, setSelectedDate] = useState(
//     new Date().toISOString().slice(0, 10)
//   );
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   /* ================= FETCH DAILY CLOSING ================= */
//   useEffect(() => {
//     setLoading(true);

//     getDailyClosing(selectedDate)
//       .then((res) => {
//         setData({
//           date: res.data.date,
//           ...res.data.summary,
//         });
//       })
//       .catch((err) => {
//         console.error("Failed to load daily closing", err);
//       })
//       .finally(() => setLoading(false));
//   }, [selectedDate]);

//   if (loading) return <p className="p-6">Loading closing report...</p>;
//   if (!data) return <p className="p-6">No data found</p>;

//   return (
//     <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-6 border border-gray-200 print:shadow-none print:border-none">
      
//       {/* ===== HEADER ===== */}
//       <div className="text-center mb-6">
//         <h2 className="text-2xl font-serif tracking-wide">
//           Daily POS Closing Report
//         </h2>

//         {/* DATE SELECTOR */}
//         <div className="mt-4 flex justify-center items-center gap-3 print:hidden">
//           <label className="text-sm font-medium">Select Date:</label>
//           <input
//             type="date"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             className="border px-3 py-2 rounded-lg"
//           />
//         </div>

//         <p className="text-sm text-gray-600 mt-2">
//           Date: {data.date}
//         </p>
//       </div>

//       {/* ===== SUMMARY ===== */}
//       <div className="grid grid-cols-2 gap-4 mb-6">
//         <SummaryCard label="Total Invoices" value={data.totalInvoices} />
//         <SummaryCard
//           label="Total Sale"
//           value={`₹${data.totalSale.toLocaleString("en-IN")}`}
//         />
//       </div>

//       {/* ===== PAYMENT SUMMARY ===== */}
//       <div className="mb-6">
//         <h3 className="text-lg font-serif mb-3 border-b pb-1">
//           Payment Summary
//         </h3>

//         <div className="grid grid-cols-2 gap-4">
//           <PaymentRow label="Cash" value={data.cash} />
//           <PaymentRow label="UPI" value={data.upi} />
//           <PaymentRow label="Card" value={data.card} />
//           <PaymentRow label="Bank" value={data.bank} />
//         </div>
//       </div>

//       {/* ===== GST SUMMARY ===== */}
//       <div>
//         <h3 className="text-lg font-serif mb-3 border-b pb-1">
//           GST Summary
//         </h3>

//         <div className="grid grid-cols-2 gap-4">
//           <PaymentRow label="SGST" value={data.sgst} />
//           <PaymentRow label="CGST" value={data.cgst} />
//         </div>
//       </div>

//       {/* ===== PRINT ===== */}
//       <div className="mt-8 text-center print:hidden">
//         <button
//           onClick={() => window.print()}
//           className="px-8 py-3 rounded-xl bg-gray-900 text-white font-medium tracking-wide hover:bg-black"
//         >
//           Print Daily Closing
//         </button>
//       </div>
//     </div>
//   );
// }

// /* ================= SUB COMPONENTS ================= */

// function PaymentRow({ label, value }) {
//   return (
//     <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border">
//       <span className="text-gray-700">{label}</span>
//       <span className="font-semibold">
//         ₹{value.toLocaleString("en-IN")}
//       </span>
//     </div>
//   );
// }

// function SummaryCard({ label, value }) {
//   return (
//     <div className="p-4 bg-gray-50 rounded-xl border">
//       <p className="text-sm text-gray-600">{label}</p>
//       <p className="text-xl font-semibold">{value}</p>
//     </div>
//   );
// }


// import { useEffect, useState } from "react";
// import { getDailyClosing } from "../api/posInvoiceApi";
// import { 
//   Calendar, CreditCard, Landmark, Banknote, 
//   QrCode, PieChart, TrendingUp, Printer 
// } from "lucide-react";

// export default function DailyPosClosing() {
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     setLoading(true);
//     getDailyClosing(selectedDate)
//       .then((res) => {
//         setData({
//           date: res.data.date,
//           ...res.data.summary,
//         });
//       })
//       .catch((err) => console.error("Failed to load daily closing", err))
//       .finally(() => setLoading(false));
//   }, [selectedDate]);

//   if (loading) return <div className="min-h-screen flex items-center justify-center text-zinc-500 font-medium">Polishing report...</div>;
//   if (!data) return <div className="min-h-screen flex items-center justify-center text-rose-500">No data found for this date.</div>;

//   return (
//     <div className="min-h-screen bg-[#F4F7FF] py-12 px-4 selection:bg-indigo-100">
//       <div className="max-w-5xl mx-auto">
        
//         {/* ===== HEADER & DATE SELECTOR ===== */}
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold text-[#1A2233] tracking-tight mb-6">
//             Sales Order Daily Closing
//           </h1>
          
//           <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-indigo-50 print:hidden transition-all hover:shadow-md">
//             <Calendar size={18} className="text-indigo-500" />
//             <input
//               type="date"
//               value={selectedDate}
//               onChange={(e) => setSelectedDate(e.target.value)}
//               className="bg-transparent font-bold text-zinc-800 outline-none cursor-pointer"
//             />
//           </div>
//         </div>

//         {/* ===== TOP METRICS ===== */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
//           <SummaryCard 
//             label="TOTAL INVOICES" 
//             value={data.totalInvoices} 
//             footer="12% from yesterday" 
//             footerIcon={<TrendingUp size={14}/>}
//             isPositive={true}
//           />
//           <SummaryCard 
//             label="TOTAL SALE" 
//             value={`₹${data.totalSale.toLocaleString("en-IN")}`} 
//             footer="No change" 
//           />
//           <SummaryCard 
//             label="TOTAL GST COLLECTED" 
//             value={`₹${(data.sgst + data.cgst).toLocaleString("en-IN")}`} 
//             footer="Calculated at standard rates" 
//             isInfo={true}
//           />
//         </div>

//         {/* ===== PAYMENT SUMMARY ===== */}
//         <div className="mb-10">
//           <SectionHeader icon={<CreditCard size={18}/>} title="PAYMENT SUMMARY" />
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//             <PaymentCard icon={<Banknote />} color="bg-emerald-50 text-emerald-600" label="CASH" value={data.cash} />
//             <PaymentCard icon={<QrCode />} color="bg-blue-50 text-blue-600" label="UPI" value={data.upi} />
//             <PaymentCard icon={<CreditCard />} color="bg-indigo-50 text-indigo-600" label="CARD" value={data.card} />
//             <PaymentCard icon={<Landmark />} color="bg-amber-50 text-amber-600" label="BANK" value={data.bank} />
//           </div>
//         </div>

//         {/* ===== GST SUMMARY ===== */}
//         <div className="mb-12">
//           <SectionHeader icon={<PieChart size={18}/>} title="GST SUMMARY" />
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <GstCard label="SGST (STATE GST)" type="INTRASTATE" value={data.sgst} color="border-l-blue-400" />
//             <GstCard label="CGST (CENTRAL GST)" type="CENTRAL" value={data.cgst} color="border-l-purple-400" />
//           </div>
//         </div>

//         {/* ===== FOOTER ACTIONS ===== */}
//         <div className="flex flex-col items-center gap-4">
//           <button
//             onClick={() => window.print()}
//             className="flex items-center gap-3 bg-[#2D6AFF] hover:bg-[#1E50D4] text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 print:hidden"
//           >
//             <Printer size={20} />
//             Print Daily Closing
//           </button>
//           <p className="text-sm text-zinc-400 font-medium">
//             Generated on {new Date().toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' })} • 05:30 PM
//           </p>
//         </div>

//       </div>
//     </div>
//   );
// }

// /* ================= REFINED SUB-COMPONENTS ================= */

// function SectionHeader({ icon, title }) {
//   return (
//     <div className="flex items-center gap-2 mb-6 text-zinc-400 font-bold text-[11px] tracking-[0.1em]">
//       <span className="text-indigo-500">{icon}</span>
//       {title}
//     </div>
//   );
// }

// function SummaryCard({ label, value, footer, footerIcon, isPositive, isInfo }) {
//   return (
//     <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-50 hover:shadow-xl transition-all duration-300">
//       <p className="text-[11px] font-bold text-zinc-400 tracking-widest mb-4">{label}</p>
//       <p className="text-4xl font-bold text-zinc-900 mb-6">{value}</p>
//       <div className={`flex items-center gap-1.5 text-xs font-semibold ${
//         isPositive ? "text-emerald-500" : isInfo ? "text-indigo-400" : "text-zinc-400"
//       }`}>
//         {isInfo && <span className="bg-indigo-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px]">i</span>}
//         {footerIcon}
//         {footer}
//       </div>
//     </div>
//   );
// }

// function PaymentCard({ icon, color, label, value }) {
//   return (
//     <div className="bg-white p-5 rounded-3xl border border-zinc-50 flex items-center gap-4 hover:border-indigo-100 transition-colors shadow-sm">
//       <div className={`${color} p-3 rounded-2xl`}>{icon}</div>
//       <div>
//         <p className="text-[10px] font-black text-zinc-400 tracking-wider mb-0.5">{label}</p>
//         <p className="text-xl font-bold text-zinc-800">₹{value.toLocaleString("en-IN")}</p>
//       </div>
//     </div>
//   );
// }

// function GstCard({ label, type, value, color }) {
//   return (
//     <div className={`bg-white p-8 rounded-[2rem] border border-zinc-50 border-l-4 ${color} relative overflow-hidden shadow-sm`}>
//       <div className="absolute top-4 right-6 text-[9px] font-black bg-zinc-50 text-zinc-400 px-2.5 py-1 rounded-full border border-zinc-100 uppercase tracking-widest">
//         {type}
//       </div>
//       <p className="text-[11px] font-bold text-zinc-400 tracking-widest mb-3">{label}</p>
//       <p className="text-4xl font-bold text-zinc-900">₹{value.toLocaleString("en-IN")}</p>
//     </div>
//   );
// }

import React from "react";
import { 
  Calendar, CreditCard, Landmark, Banknote, 
  QrCode, PieChart, TrendingUp, Printer, Info 
} from "lucide-react";

export default function DailyPosClosingUI({ data, selectedDate, setSelectedDate }) {
  // Safe formatting for values
  const formatCurrency = (val) => `₹${(val || 0).toLocaleString("en-IN")}`;

  return (
    <div className="min-h-screen bg-[#F0F5FF] py-12 px-4 md:px-8 selection:bg-indigo-100 font-sans     print:bg-white
    print:p-4
    print:min-h-0
    print:max-w-full
    print:w-[210mm]
    print:h-[297mm]
    print:overflow-hidden
    print:text-black ">
      <div className="max-w-6xl mx-auto">
        
        {/* ===== MAIN TITLE ===== */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-[#1E293B] tracking-tight mb-8">
            Sales Order Daily Closing
          </h1>
          
          {/* DATE SELECTOR BOX */}
          <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-white/50 print:hidden transition-all hover:shadow-lg group">
            <Calendar size={18} className="text-indigo-500 group-hover:scale-110 transition-transform" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-bold text-[#334155] outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* ===== TOP METRICS GRID ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <MetricCard 
            label="TOTAL INVOICES" 
            value={data.totalInvoices || 0} 
            footer="12% from yesterday" 
            footerIcon={<TrendingUp size={14}/>}
            type="growth"
          />
          <MetricCard 
            label="TOTAL SALE" 
            value={formatCurrency(data.totalSale)} 
            footer="No change" 
            type="neutral"
          />
          <MetricCard 
            label="TOTAL GST COLLECTED" 
            value={formatCurrency((data.sgst || 0) + (data.cgst || 0))} 
            footer="Calculated at standard rates" 
            footerIcon={<Info size={14}/>}
            type="info"
          />
        </div>

        {/* ===== PAYMENT SUMMARY ===== */}
        <div className="mb-12">
          <SectionHeader icon={<CreditCard size={18}/>} title="PAYMENT SUMMARY" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <PaymentTile icon={<Banknote />} color="bg-emerald-50 text-emerald-500" label="CASH" value={data.cash} />
            <PaymentTile icon={<QrCode />} color="bg-blue-50 text-blue-500" label="UPI" value={data.upi} />
            <PaymentTile icon={<CreditCard />} color="bg-indigo-50 text-indigo-500" label="CARD" value={data.card} />
            <PaymentTile icon={<Landmark />} color="bg-amber-50 text-amber-500" label="BANK" value={data.bank} />
          </div>
        </div>

        {/* ===== GST SUMMARY ===== */}
        <div className="mb-14">
          <SectionHeader icon={<PieChart size={18}/>} title="GST SUMMARY" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GstHighlightCard 
              label="SGST (STATE GST)" 
              tag="INTRASTATE" 
              value={data.sgst} 
              accentColor="bg-blue-400" 
            />
            <GstHighlightCard 
              label="CGST (CENTRAL GST)" 
              tag="CENTRAL" 
              value={data.cgst} 
              accentColor="bg-purple-400" 
            />
          </div>
        </div>

        {/* ===== PRINT ACTION ===== */}
        <div className="flex flex-col items-center gap-5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-3 bg-gradient-to-r from-[#2D6AFF] to-[#1E50D4] text-white px-12 py-4 rounded-[1.2rem] font-bold shadow-[0_10px_25px_-5px_rgba(45,106,255,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(45,106,255,0.5)] transition-all hover:-translate-y-1 active:scale-95 print:hidden"
          >
            <Printer size={20} />
            Print Daily Closing
          </button>
          
          <p className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest">
            Generated on {new Date().toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' })} • 05:30 PM
          </p>
        </div>

      </div>
    </div>
  );
}

/* ================= STYLED SUB-COMPONENTS ================= */

function SectionHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-3 mb-8 text-zinc-400 font-black text-[11px] tracking-[0.15em]">
      <span className="p-2 bg-white rounded-lg shadow-sm text-indigo-500">{icon}</span>
      {title}
    </div>
  );
}

function MetricCard({ label, value, footer, footerIcon, type }) {
  const footerColors = {
    growth: "text-emerald-500",
    info: "text-indigo-400",
    neutral: "text-zinc-400"
  };

  return (
    <div className="bg-white/70 backdrop-blur-md p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-2xl transition-all duration-500 group">
      <p className="text-[11px] font-black text-zinc-400 tracking-[0.1em] mb-4 group-hover:text-indigo-500 transition-colors">{label}</p>
      <p className="text-5xl font-bold text-[#1E293B] mb-8">{value}</p>
      <div className={`flex items-center gap-2 text-xs font-bold ${footerColors[type]}`}>
        {footerIcon}
        {footer}
      </div>
    </div>
  );
}

function PaymentTile({ icon, color, label, value }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-white shadow-sm flex items-center gap-5 hover:scale-[1.03] transition-transform duration-300">
      <div className={`${color} p-4 rounded-2xl shadow-inner`}>
        {React.cloneElement(icon, { size: 22 })}
      </div>
      <div>
        <p className="text-[10px] font-black text-zinc-400 tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-bold text-[#334155]">₹{(value || 0).toLocaleString("en-IN")}</p>
      </div>
    </div>
  );
}

function GstHighlightCard({ label, tag, value, accentColor }) {
  return (
    <div className="bg-white p-10 rounded-[2.8rem] shadow-sm border border-white relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-2 h-full ${accentColor} opacity-20`} />
      <div className="absolute top-6 right-8 text-[9px] font-black bg-zinc-50 text-zinc-400 px-3 py-1.5 rounded-full border border-zinc-100 uppercase tracking-widest">
        {tag}
      </div>
      <p className="text-[11px] font-black text-zinc-400 tracking-widest mb-4">{label}</p>
      <p className="text-5xl font-bold text-[#1E293B]">₹{(value || 0).toLocaleString("en-IN")}</p>
    </div>
  );
}