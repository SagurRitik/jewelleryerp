// // import { useEffect, useState } from "react";
// // import { useLocation } from "react-router-dom";
// // import API from "../../api";

// // export default function StonesReportPage() {
// //   const { state } = useLocation();

// //   // ✅ STATE
// //   const [data, setData] = useState(state?.analytics || {});
// //   const [filter, setFilter] = useState(state?.filterLabel || "monthly");
// //   const [loading, setLoading] = useState(!state);

// //   // ✅ FETCH IF REFRESH
// //   useEffect(() => {
// //     if (!state) {
// //       const load = async () => {
// //         try {
// //           setLoading(true);
// //           const res = await API.get(`/dashboard/stats?filter=${filter}`);
// //           setData(res.data.analytics);
// //         } catch (err) {
// //           console.error("Stone Report Load Failed", err);
// //         } finally {
// //           setLoading(false);
// //         }
// //       };
// //       load();
// //     }
// //   }, [state, filter]);

// //   const { topStones = [] } = data;

// //   const safeFilter = filter || "monthly";

// //   // ✅ PERIOD TEXT
// //   const periodText =
// //     safeFilter === "monthly"
// //       ? "in last 12 months"
// //       : safeFilter === "weekly"
// //       ? "in last 12 weeks"
// //       : safeFilter === "daily"
// //       ? "in last 30 days"
// //       : safeFilter === "yearly"
// //       ? "in last 5 years"
// //       : "in selected range";

// //   if (loading) {
// //     return (
// //       <div className="p-6 text-center text-gray-500">
// //         Loading stones report...
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="p-6 space-y-8">

// //       {/* HEADER */}
// //       <div className="flex justify-between items-center">
// //         <h2 className="text-2xl font-bold text-gray-800">
// //           Stones Report
// //         </h2>

// //         <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">
// //           {safeFilter}
// //         </span>
// //       </div>

// //       {/* MAIN CARD */}
// //       <div className="bg-white p-6 rounded-xl border shadow-sm">

// //         <h4 className="font-bold text-gray-800 mb-4">
// //           Stone Sales Breakdown
// //         </h4>

// //         {topStones.length === 0 ? (
// //           <p className="text-gray-400 text-sm text-center py-6">
// //             No stone sales {periodText}
// //           </p>
// //         ) : (
// //           <table className="w-full text-sm border rounded-lg overflow-hidden">
// //             <thead className="bg-gray-50 text-xs uppercase">
// //               <tr>
// //                 <th className="text-left p-3">Stone Type</th>
// //                 <th className="text-right p-3">Total Weight</th>
// //                 <th className="text-right p-3">Quantity</th>
// //               </tr>
// //             </thead>

// //             <tbody>
// //               {topStones.map((stone, i) => (
// //                 <tr
// //                   key={i}
// //                   className="border-t hover:bg-gray-50 transition"
// //                 >
// //                   <td className="p-3 capitalize">
// //                     {stone._id || "Unknown"}
// //                   </td>

// //                   <td className="p-3 text-right font-medium">
// //                     {stone.totalWeight?.toFixed(2)} cts
// //                   </td>

// //                   <td className="p-3 text-right">
// //                     {stone.sales || 0}
// //                   </td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         )}

// //       </div>
// //     </div>
// //   );
// // }


// import { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import API from "../../api";
// import { Database, ShieldCheck } from "lucide-react";
// import BackButton from "../../components/BackButton";

// export default function StonesReportPage() {
//   const { state } = useLocation();


//   // ✅ STATE (Save the whole state object instead of just state.analytics)
//   const [data, setData] = useState(state || {});
//   const [filter, setFilter] = useState(state?.filterLabel || "monthly");
//   const [loading, setLoading] = useState(!state);

//   // ✅ FETCH IF REFRESH
//   useEffect(() => {
//     if (!state) {
//       const load = async () => {
//         try {
//           setLoading(true);
//           const res = await API.get(`/dashboard/stats?filter=${filter}`);

//           // 🔴 BEFORE: setData(res.data.analytics);
//           // 🟢 AFTER: Save the whole response data
//           setData(res.data); 

//         } catch (err) {
//           console.error("Stone Report Load Failed", err);
//         } finally {
//           setLoading(false);
//         }
//       };
//       load();
//     }
//   }, [state, filter]);

//   // const { topStones = [] } = data;

//   // const { salesGraph = [] } = data.graphData || {};

//   // 🔴 BEFORE: const { topStones = [] } = data;
//   // 🟢 AFTER: Extract topStones from analytics
//   const { topStones = [] } = data.analytics || {};

//   // Graph data extraction remains the same, but now it will actually find it
//   const { salesGraph = [] } = data.graphData || {};

//   console.log("GRAPH:", salesGraph);

//   // 🟢 Add '1' inside Math.max so the maximum is never 0
//   const maxRevenue = salesGraph.length
//     ? Math.max(1, ...salesGraph.map(d => d.revenue || 0))
//     : 1;

//   const maxOrders = salesGraph.length
//     ? Math.max(1, ...salesGraph.map(d => d.orders || 0))
//     : 1;

//   // ✅ CALCULATIONS
//   // const totalWeight = topStones.reduce((sum, stone) => sum + (stone.totalWeight || 0), 0);
//   // const totalQuantity = topStones.reduce((sum, stone) => sum + (stone.sales || 0), 0);

//   const totalWeight = topStones.reduce(
//   (sum, stone) => sum + (stone.weight || 0),
//   0
// );

// const totalQuantity = topStones.reduce(
//   (sum, stone) => sum + (stone.quantity || 0),
//   0
// );

//   // Mock estimated value based on weight for UI completeness (replace with actual if available)
// const estimatedValue = topStones.reduce(
//   (sum, stone) => sum + (stone.amount || 0),
//   0
// );
//   const formattedValue = estimatedValue > 1000000 
//     ? (estimatedValue / 1000000).toFixed(2) + "M" 
//     : estimatedValue.toLocaleString("en-IN");

//     const totalStoneAmount = topStones.reduce(
//   (sum, stone) => sum + (stone.amount || 0),
//   0
// );

//   const safeFilter = filter || "monthly";

//   // ✅ PERIOD TEXT
//   const periodText =
//     safeFilter === "monthly"
//       ? "current fiscal period"
//       : safeFilter === "weekly"
//       ? "last 12 weeks"
//       : safeFilter === "daily"
//       ? "last 30 days"
//       : safeFilter === "yearly"
//       ? "last 5 years"
//       : "selected range";

//   // Formatted Current Date
//   const issueDate = new Date().toLocaleDateString("en-US", {
//     month: "long",
//     day: "numeric",
//     year: "numeric"
//   });



// const totalStoneSales = topStones.reduce(
//   (sum, stone) => sum + (stone.quantity || 0),
//   0
// );

// const distributionData = topStones.map((stone) => ({
//   label: stone.type || "Unknown",
//   percent:
//     totalStoneSales > 0
//       ? Math.round((stone.quantity / totalStoneSales) * 100)
//       : 0,
// }));

// const chartHeight = 200;
// const chartWidth = 1000;

// const getX = (index) =>
//   (index / (salesGraph.length - 1 || 1)) * chartWidth;

// const getY = (value, max) =>
//   chartHeight - (value / max) * chartHeight;

// const buildPath = (data, key, max) => {
//   return data
//     .map((d, i) => {
//       const x = getX(i);
//       const y = getY(d[key] || 0, max);
//       return `${i === 0 ? "M" : "L"} ${x} ${y}`;
//     })
//     .join(" ");
// };

// const revenuePath = buildPath(salesGraph, "revenue", maxRevenue);
// const ordersPath = buildPath(salesGraph, "orders", maxOrders);


//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#FCFAFB]">
//         <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#5A2B43] animate-pulse">
//           Compiling Analytical Overview...
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#FCFAFB] text-[#2D2A26] font-sans pb-20">
//        <BackButton/>
//       <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-1">

//         {/* ================= HEADER ================= */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 border-b border-[#F0EBEF] pb-8">
//           <div>
//             <h1 className="text-4xl md:text-[44px] font-semibold text-[#5A2B43] tracking-tight uppercase leading-none mb-3">
//               Stone Sales Report
//             </h1>
//             <p className="text-[10px] font-bold tracking-[0.15em] text-gray-500 uppercase">
//               Inventory Certification & Analytical Overview
//             </p>
//           </div>
//           <div className="text-left md:text-right">
//             <p className="text-[8px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-1.5">
//               Issue Date
//             </p>
//             <p className="text-xs font-bold text-[#5A2B43] uppercase tracking-widest">
//               {issueDate}
//             </p>
//           </div>
//         </div>

//         {/* ================= TOP METRICS CARDS ================= */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
//           {/* Total Weight */}
//           <div className="bg-[#F8F5F6] p-6 md:p-8 border-l-[3px] border-[#5A2B43]">
//             <p className="text-[9px] font-bold tracking-[0.15em] text-gray-500 uppercase mb-4">Total Weight</p>
//             <p className="text-[36px] text-[#5A2B43] font-light leading-none">
//               {totalWeight.toFixed(2)} <span className="text-[11px] font-bold tracking-widest ml-1">CTS</span>
//             </p>
//           </div>

//           {/* Total Quantity */}
//           <div className="bg-[#F8F5F6] p-6 md:p-8 border-l-[3px] border-[#5A2B43]">
//             <p className="text-[9px] font-bold tracking-[0.15em] text-gray-500 uppercase mb-4">Total Quantity</p>
//             <p className="text-[36px] text-[#5A2B43] font-light leading-none">
//               {totalQuantity.toLocaleString()} <span className="text-[11px] font-bold tracking-widest ml-1">UNITS</span>
//             </p>
//           </div>

//           {/* Estimated Value */}
//           <div className="bg-[#F8F5F6] p-6 md:p-8 border-l-[3px] border-[#5A2B43]">
//             <p className="text-[9px] font-bold tracking-[0.15em] text-gray-500 uppercase mb-4">Estimated Value</p>
//             <p className="text-[36px] text-[#5A2B43] font-light leading-none">
//               <span className="text-xl font-medium mr-1">₹</span> ₹{totalStoneAmount.toLocaleString("en-IN")}
//             </p>
//           </div>
//         </div>

//         {/* ================= MIDDLE SECTION ================= */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-14">

//           {/* LEFT: INVENTORY LEDGER */}
//           <div className="lg:col-span-8">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-[13px] font-bold text-[#5A2B43] tracking-[0.1em] uppercase">
//                 Inventory Ledger
//               </h2>
//               <Database size={16} className="text-gray-400" />
//             </div>

//             {topStones.length === 0 ? (
//               <div className="py-10 text-center border-t border-b border-[#F0EBEF]">
//                 <p className="text-[11px] font-bold tracking-[0.15em] text-gray-400 uppercase">
//                   No stone sales recorded
//                 </p>
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="w-full text-left border-collapse">
//                   <thead>
//                     <tr className="border-t border-b border-[#EAE3E7] bg-[#FCFAFB]">
//                       <th className="py-4 px-2 text-[9px] font-bold tracking-[0.15em] text-gray-500 uppercase w-1/2">Variety</th>
//                       <th className="py-4 px-2 text-[9px] font-bold tracking-[0.15em] text-gray-500 uppercase text-right">Weight (Cts)</th>
//                       <th className="py-4 px-2 text-[9px] font-bold tracking-[0.15em] text-gray-500 uppercase text-right">Quantity</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {topStones.map((stone, i) => (
//                       <tr key={i} className="border-b border-[#F0EBEF] hover:bg-[#F8F5F6] transition-colors">
//                         <td className="py-5 px-2 text-[13px] font-medium text-gray-800 capitalize">
//                           {stone.type || "Unknown Variety"}
//                         </td>
//                         <td className="py-5 px-2 text-[13px] text-gray-600 font-mono text-right">
//                         {stone.weight?.toFixed(2)}

//                         </td>
//                         <td className="py-5 px-2 text-[13px] text-gray-600 font-mono text-right">
//                          {stone.quantity || 0}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>

//           {/* RIGHT: DISTRIBUTION */}
//           <div className="lg:col-span-4 bg-[#F8F5F6] p-8">
//             <div className="flex items-center justify-between mb-8">
//               <h2 className="text-[13px] font-bold text-[#5A2B43] tracking-[0.1em] uppercase">
//                 Distribution
//               </h2>
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><path d="M21.21 15.89A10 10 0 118 2.83M22 12A10 10 0 0012 2v10z"/></svg>
//             </div>

//             <div className="space-y-6 mb-10">
//               {/* Progress Bar 1 */}
//               <div>
//                 {/* <div className="flex justify-between text-[9px] font-bold tracking-[0.15em] uppercase text-gray-600 mb-2">
//                   <span>Precious Gems</span>
//                   <span>64%</span>
//                 </div> */}

//                 <div className="space-y-6 mb-10">
//   {distributionData.map((item, index) => (
//     <div key={index}>
//       <div className="flex justify-between text-[9px] font-bold tracking-[0.15em] uppercase text-gray-600 mb-2">
//         <span>{item.label}</span>
//         <span>{item.percent}%</span>
//       </div>

//       <div className="w-full bg-[#EAE3E7] h-1.5">
//         <div
//           className="bg-[#5A2B43] h-1.5 transition-all duration-500"
//           style={{
//             width: `${item.percent}%`,
//             opacity: 1 - index * 0.3, // optional styling
//           }}
//         />
//       </div>
//     </div>
//   ))}
// </div>



//               </div>
//             </div>

//             {/* Status Box */}
//             <div className="bg-white p-5 flex items-center gap-4 border border-[#F0EBEF]">
//               <div className="w-10 h-10 bg-[#5A2B43] text-white flex items-center justify-center shrink-0">
//                 <ShieldCheck size={18} strokeWidth={2} />
//               </div>
//               <div>
//                 <p className="text-[8px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-1">Status</p>
//                 <p className="text-[11px] font-bold tracking-widest text-gray-800 uppercase">Secure Archive</p>
//               </div>
//             </div>

//           </div>
//         </div>

//         {/* ================= BOTTOM CHART SECTION ================= */}
//         <div className="border border-[#F0EBEF] bg-white p-8 md:p-10 mb-16">

//           <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
//             <div>
//               <h2 className="text-[13px] font-bold text-[#5A2B43] tracking-[0.1em] uppercase mb-2">
//                 Monthly Sales Volume
//               </h2>
//               <p className="text-[11px] text-gray-500">Historical transaction data for the {periodText}.</p>
//             </div>
//             <div className="flex items-center gap-4">
//               <div className="flex items-center gap-2">
//                 <div className="w-3 h-2 bg-[#5A2B43]"></div>
//                 <span className="text-[8px] font-bold tracking-[0.15em] text-gray-600 uppercase">Revenue</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-3 h-2 bg-[#CDBDC6]"></div>
//                 <span className="text-[8px] font-bold tracking-[0.15em] text-gray-600 uppercase">Units Sold</span>
//               </div>
//             </div>
//           </div>

//           {/* SVG Mock Chart matching the screenshot exactly */}
//           <div className="w-full relative h-[240px] border-b border-gray-200">
//             {/* Background Grid Lines */}
//             <div className="absolute inset-0 flex flex-col justify-between">
//               {[...Array(6)].map((_, i) => (
//                 <div key={i} className="w-full h-px bg-[#F8F5F6]"></div>
//               ))}
//             </div>

//             {/* Simulated Data Curves */}
//             {/* <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="w-full h-full absolute inset-0 overflow-visible">

//               <path 
//                 d="M 0 140 C 100 140, 150 160, 250 130 C 350 100, 400 130, 500 80 C 600 30, 650 20, 750 70 C 850 120, 900 110, 1000 80" 
//                 fill="none" 
//                 stroke="#CDBDC6" 
//                 strokeWidth="3" 
//                 strokeLinecap="round"
//               />

//               <path 
//                 d="M 0 170 C 100 170, 150 190, 250 160 C 350 130, 400 160, 500 100 C 600 40, 650 50, 750 100 C 850 150, 900 140, 1000 120" 
//                 fill="none" 
//                 stroke="#5A2B43" 
//                 strokeWidth="3" 
//                 strokeLinecap="round"
//               /> 
//               </svg>

//               */}

//               <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="w-full h-full absolute inset-0 overflow-visible">

//   {/* Units Sold */}
//   <path
//     d={ordersPath}
//     fill="none"
//     stroke="#CDBDC6"
//     strokeWidth="3"
//     strokeLinecap="round"
//   />

//   {/* Revenue */}
//   <path
//     d={revenuePath}
//     fill="none"
//     stroke="#5A2B43"
//     strokeWidth="3"
//     strokeLinecap="round"
//   />

// </svg>

//           </div>

//           {/* X-Axis Labels */}
//           <div className="flex justify-between mt-4 px-2">
//             {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct","Nov","Dec"].map(m => (
//               <span key={m} className="text-[9px] font-bold tracking-[0.1em] text-gray-400 uppercase">{m}</span>
//             ))}
//           </div>
//         </div>

//         {/* ================= FOOTER ================= */}
//         <div className="text-center pt-8">
//           <h3 className="text-lg font-semibold text-[#5A2B43] tracking-wide uppercase mb-3">
//             Digital Laboratory
//           </h3>
//           <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-6">
//             © 2026 The Digital Laboratory. All rights reserved.
//           </p>
//           <div className="flex items-center justify-center gap-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-10">
//             <span className="hover:text-[#5A2B43] cursor-pointer transition-colors">Terms of Service</span>
//             <span className="hover:text-[#5A2B43] cursor-pointer transition-colors">Privacy Policy</span>
//             <span className="hover:text-[#5A2B43] cursor-pointer transition-colors">Contact Support</span>
//           </div>
//           <div className="flex items-center justify-center gap-3 text-[8px] text-gray-400 tracking-[0.3em] uppercase">
//             <span>●</span> END OF REPORT <span>●</span>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../../api";
import { Database, ShieldCheck } from "lucide-react";
import BackButton from "../../components/BackButton";

// ─── Helpers ───────────────────────────────────────────────────────────────────

// All possible months/labels per filter mode
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Parse _id string → display label
function parseLabel(id, filter) {
  if (!id) return "";
  if (filter === "yearly") return id; // "2026"
  if (filter === "weekly") {
    const [year, week] = id.split("-");
    return `W${week}`;
  }
  if (filter === "daily") {
    // "2026-03-15" → "15 Mar"
    const d = new Date(id + "T00:00:00");
    return `${d.getDate()} ${MONTH_LABELS[d.getMonth()]}`;
  }
  // monthly: "2026-03" → "Mar"
  const month = parseInt(id.split("-")[1], 10) - 1;
  return MONTH_LABELS[month] ?? id;
}

// Build a full 12-slot monthly grid aligned to Jan–Dec, filling 0 for missing months
function buildMonthlyGrid(trendData) {
  const map = {};
  trendData.forEach(d => { map[d._id] = d; });

  // Find year from first entry
  const year = trendData[0]?._id?.split("-")[0] ?? new Date().getFullYear();

  return Array.from({ length: 12 }, (_, i) => {
    const key = `${year}-${String(i + 1).padStart(2, "0")}`;
    return {
      label: MONTH_LABELS[i],
      amount: map[key]?.totalAmount ?? 0,
      qty: map[key]?.totalQty ?? 0,
    };
  });
}

// Build a generic grid for non-monthly filters (use actual data points)
function buildGenericGrid(trendData, filter) {
  return trendData.map(d => ({
    label: parseLabel(d._id, filter),
    amount: d.totalAmount ?? 0,
    qty: d.totalQty ?? 0,
  }));
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function StonesReportPage() {
  const { state } = useLocation();

  const [data, setData] = useState(state || {});
  const [filter, setFilter] = useState(state?.filterLabel || "monthly");
  const [loading, setLoading] = useState(!state);

  console.log("STATE:", state);
  console.log("DATA:", data);
  console.log("FILTER:", filter);
  console.log("LOADING:", loading);


  useEffect(() => {
    if (!state) {
      const load = async () => {
        try {
          setLoading(true);
          const res = await API.get(`/dashboard/stats?filter=${filter}`);
          setData(res.data);
        } catch (err) {
          console.error("Stone Report Load Failed", err);
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [state, filter]);


  // ── Extract data ──────────────────────────────────────────────────────────
  const { topStones = [], stoneStats = {} } = data.analytics || {};
  // const { stoneTrend = [] }                 = data.graphData  || {};
  const stoneTrend =
    data.graphData?.stoneTrend ||
    data.analytics?.stoneStats?.stoneTrend ||
    [];

  // ── Build chart grid ──────────────────────────────────────────────────────
  const chartPoints = filter === "monthly"
    ? buildMonthlyGrid(stoneTrend)
    : buildGenericGrid(stoneTrend, filter);

  const maxAmount = Math.max(1, ...chartPoints.map(p => p.amount));
  const maxQty = Math.max(1, ...chartPoints.map(p => p.qty));
  const hasData = chartPoints.some(p => p.amount > 0 || p.qty > 0);

  // SVG path builder
  const CHART_W = 1000;
  const CHART_H = 200;
  const PAD = 20; // left/right padding so points don't clip

  function buildPath(points, key, max) {
    const usable = CHART_W - PAD * 2;
    return points
      .map((p, i) => {
        const x = PAD + (i / Math.max(points.length - 1, 1)) * usable;
        const y = CHART_H - ((p[key] || 0) / max) * (CHART_H - PAD);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  }

  const amountPath = buildPath(chartPoints, "amount", maxAmount);
  const qtyPath = buildPath(chartPoints, "qty", maxQty);

  // ── Derived totals ────────────────────────────────────────────────────────
  const totalWeight = topStones.reduce((s, st) => s + (st.weight || 0), 0);
  const totalQty = topStones.reduce((s, st) => s + (st.quantity || 0), 0);
  const totalAmount = stoneStats.totalAmount
    || topStones.reduce((s, st) => s + (st.amount || 0), 0);

  // ── Distribution ──────────────────────────────────────────────────────────
  const totalQtyForDist = topStones.reduce((s, st) => s + (st.quantity || 0), 0);
  const distributionData = topStones.map(st => ({
    label: st.type || "Unknown",
    percent: totalQtyForDist > 0
      ? Math.round((st.quantity / totalQtyForDist) * 100)
      : 0,
  }));

  // ── Misc ──────────────────────────────────────────────────────────────────
  const safeFilter = filter || "monthly";
  const periodText = {
    monthly: "current fiscal period",
    weekly: "last 12 weeks",
    daily: "last 30 days",
    yearly: "last 5 years",
  }[safeFilter] ?? "selected range";

  const issueDate = new Date().toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFAFB]">
        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#5A2B43] animate-pulse">
          Compiling Analytical Overview...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAFB] text-[#2D2A26] font-sans pb-20">
      <BackButton />
      <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-1">

        {/* ── HEADER ────────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 border-b border-[#F0EBEF] pb-8">
          <div>
            <h1 className="text-4xl md:text-[44px] font-semibold text-[#5A2B43] tracking-tight uppercase leading-none mb-3">
              Stone Sales Report
            </h1>
            <p className="text-[10px] font-bold tracking-[0.15em] text-gray-500 uppercase">
              Inventory Certification & Analytical Overview
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-[8px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-1.5">Issue Date</p>
            <p className="text-xs font-bold text-[#5A2B43] uppercase tracking-widest">{issueDate}</p>
          </div>
        </div>

        {/* ── TOP METRIC CARDS ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          <div className="bg-[#F8F5F6] p-6 md:p-8 border-l-[3px] border-[#5A2B43]">
            <p className="text-[9px] font-bold tracking-[0.15em] text-gray-500 uppercase mb-4">Total Weight</p>
            <p className="text-[36px] text-[#5A2B43] font-light leading-none">
              {totalWeight.toFixed(2)}{" "}
              <span className="text-[11px] font-bold tracking-widest ml-1">CTS</span>
            </p>
          </div>

          <div className="bg-[#F8F5F6] p-6 md:p-8 border-l-[3px] border-[#5A2B43]">
            <p className="text-[9px] font-bold tracking-[0.15em] text-gray-500 uppercase mb-4">Total Quantity</p>
            <p className="text-[36px] text-[#5A2B43] font-light leading-none">
              {totalQty.toLocaleString()}{" "}
              <span className="text-[11px] font-bold tracking-widest ml-1">UNITS</span>
            </p>
          </div>

          <div className="bg-[#F8F5F6] p-6 md:p-8 border-l-[3px] border-[#5A2B43]">
            <p className="text-[9px] font-bold tracking-[0.15em] text-gray-500 uppercase mb-4">Total Value</p>
            <p className="text-[36px] text-[#5A2B43] font-light leading-none">
              <span className="text-xl font-medium mr-1">₹</span>
              {totalAmount.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* ── LEDGER + DISTRIBUTION ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-14">

          {/* Inventory Ledger */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[13px] font-bold text-[#5A2B43] tracking-[0.1em] uppercase">Inventory Ledger</h2>
              <Database size={16} className="text-gray-400" />
            </div>

            {topStones.length === 0 ? (
              <div className="py-10 text-center border-t border-b border-[#F0EBEF]">
                <p className="text-[11px] font-bold tracking-[0.15em] text-gray-400 uppercase">
                  No stone sales recorded
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-t border-b border-[#EAE3E7] bg-[#FCFAFB]">
                      <th className="py-4 px-2 text-[9px] font-bold tracking-[0.15em] text-gray-500 uppercase w-2/5">Variety</th>
                      <th className="py-4 px-2 text-[9px] font-bold tracking-[0.15em] text-gray-500 uppercase text-right">Weight (Cts)</th>
                      <th className="py-4 px-2 text-[9px] font-bold tracking-[0.15em] text-gray-500 uppercase text-right">Qty</th>
                      <th className="py-4 px-2 text-[9px] font-bold tracking-[0.15em] text-gray-500 uppercase text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topStones.map((stone, i) => (
                      <tr key={i} className="border-b border-[#F0EBEF] hover:bg-[#F8F5F6] transition-colors">
                        <td className="py-5 px-2 text-[13px] font-medium text-gray-800 capitalize">
                          {stone.type || "Unknown Variety"}
                        </td>
                        <td className="py-5 px-2 text-[13px] text-gray-600 font-mono text-right">
                          {stone.weight?.toFixed(2) ?? "—"}
                        </td>
                        <td className="py-5 px-2 text-[13px] text-gray-600 font-mono text-right">
                          {stone.quantity ?? 0}
                        </td>
                        <td className="py-5 px-2 text-[13px] text-gray-600 font-mono text-right">
                          {(stone.amount || 0).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Distribution */}
          <div className="lg:col-span-4 bg-[#F8F5F6] p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[13px] font-bold text-[#5A2B43] tracking-[0.1em] uppercase">Distribution</h2>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <path d="M21.21 15.89A10 10 0 118 2.83M22 12A10 10 0 0012 2v10z" />
              </svg>
            </div>

            <div className="space-y-6 mb-10">
              {distributionData.length === 0 ? (
                <p className="text-[11px] text-gray-400 uppercase tracking-widest">No data</p>
              ) : (
                distributionData.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-[9px] font-bold tracking-[0.15em] uppercase text-gray-600 mb-2">
                      <span>{item.label}</span>
                      <span>{item.percent}%</span>
                    </div>
                    <div className="w-full bg-[#EAE3E7] h-1.5">
                      <div
                        className="bg-[#5A2B43] h-1.5 transition-all duration-500"
                        style={{ width: `${item.percent}%`, opacity: Math.max(0.4, 1 - index * 0.2) }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Status Box */}
            <div className="bg-white p-5 flex items-center gap-4 border border-[#F0EBEF]">
              <div className="w-10 h-10 bg-[#5A2B43] text-white flex items-center justify-center shrink-0">
                <ShieldCheck size={18} strokeWidth={2} />
              </div>
              <div>
                <p className="text-[8px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-1">Status</p>
                <p className="text-[11px] font-bold tracking-widest text-gray-800 uppercase">Secure Archive</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── CHART ─────────────────────────────────────────────────────────── */}
        <div className="border border-[#F0EBEF] bg-white p-8 md:p-10 mb-16">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <h2 className="text-[13px] font-bold text-[#5A2B43] tracking-[0.1em] uppercase mb-2">
                Stone Sales Trend
              </h2>
              <p className="text-[11px] text-gray-500">
                Stone transaction data for the {periodText}.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-2 bg-[#5A2B43]"></div>
                <span className="text-[8px] font-bold tracking-[0.15em] text-gray-600 uppercase">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-2 bg-[#CDBDC6]"></div>
                <span className="text-[8px] font-bold tracking-[0.15em] text-gray-600 uppercase">Units Sold</span>
              </div>
            </div>
          </div>

          <div className="w-full relative h-[240px] border-b border-gray-200">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-full h-px bg-[#F8F5F6]" />
              ))}
            </div>

            {!hasData ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-[11px] font-bold tracking-[0.15em] text-gray-400 uppercase">
                  No stone trend data for this period
                </p>
              </div>
            ) : (
              <svg
                viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                preserveAspectRatio="none"
                className="w-full h-full absolute inset-0"
              >
                {/* Units sold line */}
                <path
                  d={qtyPath}
                  fill="none"
                  stroke="#CDBDC6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Revenue line */}
                <path
                  d={amountPath}
                  fill="none"
                  stroke="#5A2B43"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Dots on revenue line */}
                {chartPoints.map((p, i) => {
                  const usable = CHART_W - PAD * 2;
                  const x = PAD + (i / Math.max(chartPoints.length - 1, 1)) * usable;
                  const y = CHART_H - ((p.amount || 0) / maxAmount) * (CHART_H - PAD);
                  return p.amount > 0 ? (
                    <circle key={i} cx={x} cy={y} r="5" fill="#5A2B43" />
                  ) : null;
                })}
              </svg>
            )}
          </div>

          {/* X-axis labels — driven by real data, not hardcoded */}
          <div className="flex justify-between mt-4 px-2 overflow-hidden">
            {chartPoints.map((p, i) => (
              <span
                key={i}
                className="text-[9px] font-bold tracking-[0.1em] text-gray-400 uppercase"
                style={{ flex: "1", textAlign: "center" }}
              >
                {p.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── FOOTER ────────────────────────────────────────────────────────── */}
        <div className="text-center pt-8">
          <h3 className="text-lg font-semibold text-[#5A2B43] tracking-wide uppercase mb-3">
            Digital Laboratory
          </h3>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-6">
            © 2026 The Digital Laboratory. All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-10">
            <span className="hover:text-[#5A2B43] cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-[#5A2B43] cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-[#5A2B43] cursor-pointer transition-colors">Contact Support</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-[8px] text-gray-400 tracking-[0.3em] uppercase">
            <span>●</span> END OF REPORT <span>●</span>
          </div>
        </div>

      </div>
    </div>
  );
}