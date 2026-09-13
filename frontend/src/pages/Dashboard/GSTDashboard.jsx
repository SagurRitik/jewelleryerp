// import React, { useEffect, useState } from "react";
// import API from "../../api";
// import { Loader2 } from "lucide-react";
// import { motion } from "framer-motion";

// export default function GSTDashboard() {
//   const [data, setData] = useState({});
//   const [jewelData, setJewelData] = useState({});
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchAll();
//   }, []);

//   const fetchAll = async () => {
//     try {
//       const [gstRes, jewelRes] = await Promise.all([
//         API.get("/reports/gst-summary"),
//         API.get("/reports/jewellery-summary"),
//       ]);

//       setData(gstRes.data?.data || {});
//       setJewelData(jewelRes.data?.data || {});
//     } catch (err) {
//       console.error("DASHBOARD ERROR:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Currency formatter
//   const formatCurrency = (value) => {
//     return `₹ ${Number(value || 0).toLocaleString("en-IN", {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     })}`;
//   };

//   // ✅ Loading
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-[60vh]">
//         <Loader2 className="animate-spin w-6 h-6" />
//       </div>
//     );
//   }

//   // ================= SAFE DATA =================

//   const safe = {
//     totalGST: data?.totalGST || 0,
//     totalSales: data?.totalSales || 0,
//     totalSubtotal: data?.totalSubtotal || 0,
//     totalInvoices: data?.totalInvoices || 0,
//     totalDiscount: data?.totalDiscount || 0,
//   };

//   const jewel = {
//     totalDiamondValue: jewelData?.totalDiamondValue || 0,
//     totalDiamondWeight: jewelData?.totalDiamondWeight || 0,
//     totalDiamondQty: jewelData?.totalDiamondQty || 0,

//     totalStoneValue: jewelData?.totalStoneValue || 0,
//     totalStoneWeight: jewelData?.totalStoneWeight || 0,
//     totalStoneQty: jewelData?.totalStoneQty || 0,

//     totalMetalValue: jewelData?.totalMetalValue || 0,
//     totalMetalWeight: jewelData?.totalMetalWeight || 0,

//     totalMakingCharge: jewelData?.totalMakingCharge || 0,
//   };

//   // ================= CARDS =================

//   const gstCards = [
//     { title: "Total GST Collected", value: formatCurrency(safe.totalGST) },
//     { title: "Total Sales", value: formatCurrency(safe.totalSales) },
//     { title: "Subtotal (Before GST)", value: formatCurrency(safe.totalSubtotal) },
//     { title: "Total Invoices", value: safe.totalInvoices },
//     { title: "Total Discount", value: formatCurrency(safe.totalDiscount) },
//   ];

//   const jewelCards = [
//     {
//       title: "💎 Diamond",
//       value: formatCurrency(jewel.totalDiamondValue),
//       extra: `${jewel.totalDiamondWeight.toFixed(2)} ct • ${jewel.totalDiamondQty} pcs`,
//     },
//     {
//       title: "💠 Stone",
//       value: formatCurrency(jewel.totalStoneValue),
//       extra: `${jewel.totalStoneWeight.toFixed(2)} ct • ${jewel.totalStoneQty} pcs`,
//     },
//     {
//       title: "🪙 Metal",
//       value: formatCurrency(jewel.totalMetalValue),
//       extra: `${jewel.totalMetalWeight.toFixed(2)} g`,
//     },
//     {
//       title: "🛠 Making Charges",
//       value: formatCurrency(jewel.totalMakingCharge),
//     },
//   ];

//   return (
//     <div className="p-6 space-y-10">

//       {/* ================= GST SECTION ================= */}
//       <div>
//         <h2 className="text-lg font-semibold mb-4 text-gray-700">
//           GST & Sales Overview
//         </h2>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {gstCards.map((card, i) => (
//             <motion.div
//               key={i}
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: i * 0.1 }}
//               className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6"
//             >
//               <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-2">
//                 {card.title}
//               </h3>

//               <h1 className="text-2xl font-bold text-gray-900">
//                 {card.value}
//               </h1>
//             </motion.div>
//           ))}
//         </div>
//       </div>

//       {/* ================= JEWELLERY SECTION ================= */}
//       <div>
//         <h2 className="text-lg font-semibold mb-4 text-gray-700">
//           Jewellery Analytics
//         </h2>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {jewelCards.map((card, i) => (
//             <motion.div
//               key={i}
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: i * 0.1 }}
//               className="bg-gradient-to-r from-purple-50 to-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6"
//             >
//               <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-2">
//                 {card.title}
//               </h3>

//               <h1 className="text-2xl font-bold text-gray-900">
//                 {card.value}
//               </h1>

//               {card.extra && (
//                 <p className="text-sm text-gray-500 mt-1">
//                   {card.extra}
//                 </p>
//               )}
//             </motion.div>
//           ))}
//         </div>
//       </div>

//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import API from "../../api";
import { 
  Loader2, Calendar, Banknote, Landmark, CheckCircle2, 
  Activity, FileText, Tag, Gem, Shapes, Box, PenTool, ArrowRight, Info
} from "lucide-react";
import { motion } from "framer-motion";
import BackButton from "../../components/BackButton";
import { Link } from "react-router-dom";

export default function GSTDashboard() {
  const [data, setData] = useState({});
  const [jewelData, setJewelData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [gstRes, jewelRes] = await Promise.all([
        API.get("/reports/gst-summary"),
        API.get("/reports/jewellery-summary"),
      ]);

      setData(gstRes.data?.data || {});
      setJewelData(jewelRes.data?.data || {});
    } catch (err) {
      console.error("DASHBOARD ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Currency formatter
  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ✅ Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FCFAFB]">
        <Loader2 className="animate-spin w-8 h-8 text-[#4A243A]" />
      </div>
    );
  }

  // ================= SAFE DATA =================

  const safe = {
    totalGST: data?.totalGST || 0,
    totalSales: data?.totalSales || 0,
    totalSubtotal: data?.totalSubtotal || 0,
    totalInvoices: data?.totalInvoices || 0,
    totalDiscount: data?.totalDiscount || 0,
  };

  const jewel = {
    totalDiamondValue: jewelData?.totalDiamondValue || 0,
    totalDiamondWeight: jewelData?.totalDiamondWeight || 0,
    totalDiamondQty: jewelData?.totalDiamondQty || 0,

    totalStoneValue: jewelData?.totalStoneValue || 0,
    totalStoneWeight: jewelData?.totalStoneWeight || 0,
    totalStoneQty: jewelData?.totalStoneQty || 0,

    totalMetalValue: jewelData?.totalMetalValue || 0,
    totalMetalWeight: jewelData?.totalMetalWeight || 0,

    totalMakingCharge: jewelData?.totalMakingCharge || 0,
  };

  return (
    <div className="min-h-screen bg-[#FCFAFB] font-sans text-gray-900 pb-12 sm:pb-20">
      <div className="max-w-[1200px] mx-auto p-3 sm:p-6 md:p-10">
        <div className="mb-4">
          <BackButton />
        </div>

        {/* ================= HEADER ================= */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-10 gap-3">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-1.5">
              <div className="w-5 sm:w-6 h-[2px] bg-[#4A243A]"></div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">
                Executive Intelligence Summary
              </p>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-[40px] font-bold text-[#1A1A1A] tracking-tight">
              GST & Sales Overview
            </h1>
          </div>
        </div>

        {/* ================= TOP GRID (GROSS & GST) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          
          {/* GROSS REVENUE */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white rounded-2xl sm:rounded-[24px] p-5 sm:p-8 md:p-10 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-gray-100 flex justify-between items-start gap-3"
          >
            <div className="min-w-0">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3 sm:mb-6 flex items-center gap-2 sm:gap-4">
                Gross Revenue <div className="h-px w-8 sm:w-10 bg-gray-200"></div>
              </h3>
              <div className="flex items-baseline gap-1.5 mb-4 sm:mb-6 flex-wrap">
                <span className="text-2xl sm:text-3xl font-medium text-gray-400">₹</span>
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A1A1A] tracking-tight leading-none break-all sm:break-normal">
                  {formatCurrency(safe.totalSales)}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-[#FDF0F4] text-[#B04C70] px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider">
                <Activity size={12} /> Live Sales Total
              </div>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#FCFAFB] rounded-2xl flex items-center justify-center text-[#4A243A] shadow-sm border border-gray-100 shrink-0">
              <Banknote size={22} strokeWidth={2} />
            </div>
          </motion.div>

          {/* TOTAL GST COLLECTED */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="lg:col-span-1 bg-[#3B1B2D] rounded-2xl sm:rounded-[24px] p-5 sm:p-8 md:p-10 shadow-lg text-white flex flex-col justify-between relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-6 sm:mb-10">
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-sm shrink-0">
                <Landmark size={20} strokeWidth={2} />
              </div>
              <span className="border border-white/20 px-2.5 py-1 rounded-full text-[9px] font-bold tracking-[0.15em] uppercase text-white/80">
                Tax Liability
              </span>
            </div>
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/60 mb-2">
                Total GST Collected
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight break-all">
                  ₹ {formatCurrency(safe.totalGST)}
                </span>
                <CheckCircle2 size={16} className="text-white/60 shrink-0" fill="white" stroke="#3B1B2D" />
              </div>
            </div>
          </motion.div>

        </div>

        {/* ================= MIDDLE GRID ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-8 sm:mb-14">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl sm:rounded-[20px] p-4 sm:p-6 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between min-h-[120px]">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2">Subtotal (Before GST)</h3>
              <p className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">₹ {formatCurrency(safe.totalSubtotal)}</p>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-100 pt-2.5 mt-2">
              <span className="text-[11px]">Subtotal pre-GST</span>
              <Activity size={14} className="opacity-50" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl sm:rounded-[20px] p-4 sm:p-6 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between min-h-[120px]">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2">Total Invoices</h3>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">{safe.totalInvoices}</p>
                <p className="text-xs text-gray-500 font-medium">Validated Invoices</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#4A243A] border-t border-gray-100 pt-2.5 mt-2">
              <FileText size={12} /> Processed Transactions
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-xl sm:rounded-[20px] p-4 sm:p-6 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between min-h-[120px]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#C94A4A] mb-2">Total Discount</h3>
                <p className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">₹ {formatCurrency(safe.totalDiscount)}</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#C94A4A]"></div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wide text-gray-500 border-t border-gray-100 pt-2.5 mt-2">
              <Tag size={12} /> Total Promotional Discount
            </div>
          </motion.div>

        </div>

        {/* ================= ASSET ANALYTICS SECTION ================= */}
        <div className="flex justify-between items-center mb-5 sm:mb-6 border-b border-gray-200 pb-3">
          <h2 className="text-lg sm:text-2xl font-bold text-[#1A1A1A] tracking-tight">
            Jewellery Asset Analytics
          </h2>
          <Link to="/dashboard">
            <button className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-[#4A243A] transition-colors">
              <span>Ledger</span> <ArrowRight size={13} />
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* DIAMONDS */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden min-h-[220px]">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#4A243A] rounded-full flex items-center justify-center text-white shadow-sm z-10">
                <Gem size={18} strokeWidth={2} />
              </div>
              <div className="w-5 h-5 bg-[#FDF0F4] rounded-md z-10"></div>
            </div>
            <Gem className="absolute -bottom-10 -right-10 w-40 h-40 text-gray-50 opacity-60 pointer-events-none" />
            
            <div className="relative z-10">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-1">Diamonds Sold</h3>
              <p className="text-xl font-bold text-[#1A1A1A] mb-4">
                ₹ {formatCurrency(jewel.totalDiamondValue)}
              </p>
              
              <div className="grid grid-cols-2 border-t border-gray-100 pt-3 gap-2">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Carat</p>
                  <p className="text-xs sm:text-sm font-bold text-[#1A1A1A]">{jewel.totalDiamondWeight.toFixed(2)} <span className="text-[10px] text-gray-500 font-medium">ct</span></p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Qty</p>
                  <p className="text-xs sm:text-sm font-bold text-[#1A1A1A]">{jewel.totalDiamondQty} <span className="text-[10px] text-gray-500 font-medium">pcs</span></p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* STONES */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[220px]">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#EADCE3] rounded-full flex items-center justify-center text-[#4A243A] shadow-sm">
                <Shapes size={18} strokeWidth={2} />
              </div>
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                <div className="w-1 h-1 rounded-full bg-gray-300"></div>
              </div>
            </div>
            
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-1">Stones Sold</h3>
              <p className="text-xl font-bold text-[#1A1A1A] mb-4">
                ₹ {formatCurrency(jewel.totalStoneValue)}
              </p>
              
              <div className="grid grid-cols-2 border-t border-gray-100 pt-3 gap-2">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Weight</p>
                  <p className="text-xs sm:text-sm font-bold text-[#1A1A1A]">{jewel.totalStoneWeight.toFixed(2)} <span className="text-[10px] text-gray-500 font-medium">ct</span></p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Count</p>
                  <p className="text-xs sm:text-sm font-bold text-[#1A1A1A]">{jewel.totalStoneQty} <span className="text-[10px] text-gray-500 font-medium">pcs</span></p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* METAL */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[220px]">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F5EAF0] rounded-2xl flex items-center justify-center text-[#4A243A] shadow-sm mb-4">
              <Box size={18} strokeWidth={2} />
            </div>
            
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-1">Metal Sold</h3>
              <p className="text-xl font-bold text-[#1A1A1A] mb-4">
                ₹ {formatCurrency(jewel.totalMetalValue)}
              </p>
              
              <div className="flex justify-between items-end border-t border-gray-100 pt-3">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Total Mass</p>
                  <p className="text-xs sm:text-sm font-bold text-[#1A1A1A]">{jewel.totalMetalWeight.toFixed(2)} <span className="text-[10px] text-gray-500 font-medium">g</span></p>
                </div>
                <span className="bg-[#FDF0F4] text-[#B04C70] px-2 py-0.5 rounded text-[9px] font-bold tracking-wider">
                  Metal Net
                </span>
              </div>
            </div>
          </motion.div>

          {/* MAKINGS */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="bg-[#F4F1F3] rounded-2xl p-4 sm:p-6 border border-gray-200 flex flex-col justify-between min-h-[220px] shadow-sm">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center text-[#4A243A] shadow-sm mb-4">
              <PenTool size={18} strokeWidth={2} />
            </div>
            
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-1">Makings Total</h3>
              <p className="text-xl font-bold text-[#1A1A1A] mb-4">
                ₹ {formatCurrency(jewel.totalMakingCharge)}
              </p>
              
              <div className="flex justify-between items-center border-t border-gray-300 pt-3">
                <p className="text-[10px] font-serif italic text-gray-600">
                  Making Charges
                </p>
                <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center text-white">
                  <Info size={10} />
                </div>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </div>
  );
}