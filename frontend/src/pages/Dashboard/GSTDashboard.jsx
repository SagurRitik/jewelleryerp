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
    <div className="min-h-screen bg-[#FCFAFB] font-sans text-gray-900 pb-20">
   <BackButton/>
      
      
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        
        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-[2px] bg-[#4A243A]"></div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">
                Executive Intelligence Summary
              </p>
            </div>
            <h1 className="text-4xl md:text-[44px] font-bold text-[#1A1A1A] tracking-tight">
              GST & Sales Overview
            </h1>
          </div>
          
          <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-lg text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
            <Calendar size={14} className="text-[#4A243A]" />
            Aug 2023 - Oct 2023
            <span className="ml-2 text-gray-400">v</span>
          </button>
        </div>

        {/* ================= TOP GRID (GROSS & GST) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* GROSS REVENUE */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white rounded-[24px] p-8 md:p-10 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-gray-50 flex justify-between items-start"
          >
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-6 flex items-center gap-4">
                Gross Revenue <div className="h-px w-10 bg-gray-200"></div>
              </h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-medium text-gray-400">₹</span>
                <span className="text-5xl md:text-[56px] font-bold text-[#1A1A1A] tracking-tight leading-none">
                  {formatCurrency(safe.totalSales)}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-[#FDF0F4] text-[#B04C70] px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider">
                <Activity size={12} /> +12.5%
              </div>
            </div>
            <div className="w-14 h-14 bg-[#FCFAFB] rounded-2xl flex items-center justify-center text-[#4A243A] shadow-sm border border-gray-100">
              <Banknote size={24} strokeWidth={2} />
            </div>
          </motion.div>

          {/* TOTAL GST COLLECTED */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="lg:col-span-1 bg-[#3B1B2D] rounded-[24px] p-8 md:p-10 shadow-lg text-white flex flex-col justify-between relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-10">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-sm">
                <Landmark size={20} strokeWidth={2} />
              </div>
              <span className="border border-white/20 px-3 py-1 rounded-full text-[9px] font-bold tracking-[0.15em] uppercase text-white/80">
                Tax Liability
              </span>
            </div>
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/60 mb-2">
                Total GST Collected
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-3xl md:text-4xl font-bold tracking-tight">
                  ₹ {formatCurrency(safe.totalGST)}
                </span>
                <CheckCircle2 size={16} className="text-white/60" fill="white" stroke="#3B1B2D" />
              </div>
            </div>
          </motion.div>

        </div>

        {/* ================= MIDDLE GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-[20px] p-6 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-gray-50 flex flex-col justify-between h-40">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3">Subtotal (Before GST)</h3>
              <p className="text-2xl font-bold text-[#1A1A1A]">₹ {formatCurrency(safe.totalSubtotal)}</p>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-100 pt-3">
              <span>Subtotal pre-GST</span>
              <Activity size={14} className="opacity-50" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-[20px] p-6 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-gray-50 flex flex-col justify-between h-40">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3">Total Invoice</h3>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-[#1A1A1A]">{safe.totalInvoices}</p>
                <p className="text-xs text-gray-600 font-medium">Validated Invoices</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#4A243A] border-t border-gray-100 pt-3">
              <FileText size={12} /> Processed Transactions
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-[20px] p-6 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-gray-50 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#C94A4A] mb-3">Total Discount</h3>
                <p className="text-2xl font-bold text-[#1A1A1A]">₹ {formatCurrency(safe.totalDiscount)}</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#C94A4A]"></div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-wide text-gray-500 border-t border-gray-100 pt-3">
              <Tag size={12} /> Total Promotional Discount
            </div>
          </motion.div>

        </div>

        {/* ================= ASSET ANALYTICS SECTION ================= */}
        <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">
            Jewellery Asset Analytics
          </h2>
          <Link to="/dashboard">
          <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#4A243A] transition-colors">
            View Full Ledger <ArrowRight size={14} />
          </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pr-2"> {/* pr-2 to accommodate the making card shadow */}
          
          {/* DIAMONDS */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden h-[260px]">
            <div className="flex justify-between items-start mb-8">
              <div className="w-12 h-12 bg-[#4A243A] rounded-full flex items-center justify-center text-white shadow-sm z-10">
                <Gem size={20} strokeWidth={2} />
              </div>
              <div className="w-6 h-6 bg-[#FDF0F4] rounded-md z-10"></div>
            </div>
            {/* Background watermark */}
            <Gem className="absolute -bottom-10 -right-10 w-48 h-48 text-gray-50 opacity-60 pointer-events-none" />
            
            <div className="relative z-10">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-1">Diamonds Sell</h3>
              <p className="text-[22px] font-bold text-[#1A1A1A] mb-6">
                ₹ {formatCurrency(jewel.totalDiamondValue)}
              </p>
              
              <div className="grid grid-cols-2 border-t border-gray-100 pt-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Total Carat</p>
                  <p className="text-sm font-bold text-[#1A1A1A]">{jewel.totalDiamondWeight.toFixed(2)} <span className="text-[10px] text-gray-500 font-medium">ct</span></p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Inventory</p>
                  <p className="text-sm font-bold text-[#1A1A1A]">{jewel.totalDiamondQty} <span className="text-[10px] text-gray-500 font-medium">pcs</span></p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* STONES */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-[260px]">
            <div className="flex justify-between items-start mb-8">
              <div className="w-12 h-12 bg-[#EADCE3] rounded-full flex items-center justify-center text-[#4A243A] shadow-sm">
                <Shapes size={20} strokeWidth={2} />
              </div>
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                <div className="w-1 h-1 rounded-full bg-gray-300"></div>
              </div>
            </div>
            
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-1">Stones Sell</h3>
              <p className="text-[22px] font-bold text-[#1A1A1A] mb-6">
                ₹ {formatCurrency(jewel.totalStoneValue)}
              </p>
              
              <div className="grid grid-cols-2 border-t border-gray-100 pt-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Weight</p>
                  <p className="text-sm font-bold text-[#1A1A1A]">{jewel.totalStoneWeight.toFixed(2)} <span className="text-[10px] text-gray-500 font-medium">ct</span></p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Count</p>
                  <p className="text-sm font-bold text-[#1A1A1A]">{jewel.totalStoneQty} <span className="text-[10px] text-gray-500 font-medium">pcs</span></p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* METAL */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-[260px]">
            <div className="w-12 h-12 bg-[#F5EAF0] rounded-2xl flex items-center justify-center text-[#4A243A] shadow-sm mb-8">
              <Box size={20} strokeWidth={2} />
            </div>
            
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-1">Metal Sell</h3>
              <p className="text-[22px] font-bold text-[#1A1A1A] mb-6">
                ₹ {formatCurrency(jewel.totalMetalValue)}
              </p>
              
              <div className="flex justify-between items-end border-t border-gray-100 pt-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Total Mass</p>
                  <p className="text-sm font-bold text-[#1A1A1A]">{jewel.totalMetalWeight.toFixed(2)} <span className="text-[10px] text-gray-500 font-medium">g</span></p>
                </div>
                <span className="bg-[#FDF0F4] text-[#B04C70] px-2 py-1 rounded text-[9px] font-bold tracking-wider">
                  Spot +2%
                </span>
              </div>
            </div>
          </motion.div>

          {/* MAKINGS (Layered Style) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="relative h-[260px]">
            {/* The actual card */}
            <div className="absolute inset-0 bg-[#F4F1F3] rounded-[24px] p-6 border border-gray-200 flex flex-col justify-between shadow-[8px_8px_0px_#4A243A] z-10 transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_#4A243A]">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#4A243A] shadow-sm mb-8">
                <PenTool size={20} strokeWidth={2} />
              </div>
              
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-1">Makings</h3>
                <p className="text-[22px] font-bold text-[#1A1A1A] mb-6">
                  ₹ {formatCurrency(jewel.totalMakingCharge)}
                </p>
                
                <div className="flex justify-between items-center border-t border-gray-300 pt-4">
                  <p className="text-[10px] font-serif italic text-gray-600">
                    Master Craftsmanship Rates
                  </p>
                  <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-white">
                    <Info size={12} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </div>
  );
}