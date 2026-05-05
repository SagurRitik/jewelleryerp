
// import { useEffect, useState, useMemo } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import API from "../../api";
// import { 
//   Building2, TrendingUp, Download, CheckSquare, 
//   MoreVertical, Filter, Activity, Clock
// } from "lucide-react";
// import BackButton from "../../components/BackButton";

// const downloadCSV = (data, headers, filename) => {
//   const csvContent = [
//     headers.join(','),
//     ...data.map(row => headers.map(header => row[header]).join(','))
//   ].join('\n');

//   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//   const link = document.createElement('a');
//   if (link.href) {
//     URL.revokeObjectURL(link.href);
//   }
//   const url = URL.createObjectURL(blob);
//   link.setAttribute('href', url);
//   link.setAttribute('download', filename);
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// };

// const formatCurrency = (val) => {
//   return Number(val || 0).toLocaleString("en-IN", {
//     maximumFractionDigits: 0
//   });
// };

// export default function MetalReportPage() {
//   const { state } = useLocation();
//   const navigate = useNavigate();

//   // ✅ STATE
//   const [data, setData] = useState(state?.analytics || {});
//   const [filter, setFilter] = useState(state?.filterLabel || "monthly");
//   const [loading, setLoading] = useState(!state);

//   // ✅ FETCH DATA ON FILTER CHANGE
//   useEffect(() => {
//     const load = async () => {
//       try {
//         setLoading(true);
//         const res = await API.get(`/dashboard/stats?filter=${filter}`);
//         setData(res.data.analytics);
//       } catch (err) {
//         console.error("Metal Report Load Failed", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (filter) {
//       load();
//     }
//   }, [filter]);

//   const metalPuritySales = data?.metalPuritySales || [];

//   // ✅ GROUPING
//   const groupedPurity = useMemo(() => {
//     const groups = {};
//     metalPuritySales.forEach((item) => {
//       // Normalize metal names just in case
//       const m = item.metal?.toUpperCase() || "OTHER";
//       if (!groups[m]) groups[m] = [];
//       groups[m].push(item);
//     });
//     return groups;
//   }, [metalPuritySales]);

//   // Derive top-level summary metrics from grouped data
//   const summaryMetrics = useMemo(() => {
//     let totalRev = 0;
//     let totalGoldWeight = 0;
//     let totalSilverWeight = 0;
//     let totalPlatinumWeight = 0;
//     let goldRev = 0;
//     let silverRev = 0;
//     let platinumRev = 0;

//     Object.entries(groupedPurity).forEach(([metal, items]) => {
//       const w = items.reduce((sum, row) => sum + row.weight, 0);
//       const r = items.reduce((sum, row) => sum + row.revenue, 0);
//       totalRev += r;

//       if (metal.includes("GOLD")) {
//         totalGoldWeight += w;
//         goldRev += r;
//       } else if (metal.includes("SILVER")) {
//         totalSilverWeight += w;
//         silverRev += r;
//       } else if (metal.includes("PLATINUM") || metal.includes("PT")) {
//         totalPlatinumWeight += w;
//         platinumRev += r;
//       }
//     });

//     return {
//       totalRev,
//       totalGoldWeight, goldRev,
//       totalSilverWeight, silverRev,
//       totalPlatinumWeight, platinumRev
//     };
//   }, [groupedPurity]);


//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#FCFAFA]">
//         <div className="flex items-center gap-2 text-[#713054] animate-pulse">
//           <Activity size={20} />
//           <span className="font-medium tracking-widest uppercase text-xs">Compiling ledgers...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#FCFAFA] font-sans text-gray-800 pb-20">
//      <BackButton/>
//       <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-10">
        
//         {/* ================= HEADER & SUMMARY METRICS ================= */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
//           <div>
//             <span className="bg-[#F8EFF3] text-[#713054] px-3 py-1.5 rounded-full text-[9px] font-bold tracking-[0.15em] uppercase mb-4 inline-block">
//               PERFORMANCE HUB
//             </span>
//             <h2 className="text-[32px] md:text-[40px] font-bold text-[#5A374F] tracking-tight leading-none mb-2 uppercase">
//               Metal Sell Report
//             </h2>
//             <p className="text-[13px] text-gray-500 font-medium">
//               Real-time valuation of the metallic treasury reserves.
//             </p>
//           </div>
          
//           <div className="flex items-center gap-3">
//             <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
//               <button 
//                 onClick={() => setFilter('monthly')}
//                 className={`px-4 py-2.5 text-[10px] font-bold tracking-widest uppercase transition-colors ${filter === 'monthly' ? 'text-[#713054]' : 'text-gray-400 hover:bg-gray-50'}`}
//               >
//                 Monthly
//               </button>
//               <div className="w-px bg-gray-200"></div>
//               <button 
//                 onClick={() => setFilter('quarterly')}
//                 className={`px-4 py-2.5 text-[10px] font-bold tracking-widest uppercase transition-colors ${filter === 'quarterly' ? 'text-[#713054]' : 'text-gray-400 hover:bg-gray-50'}`}
//               >
//                 Quarterly
//               </button>
//             </div>
//             <button onClick={() => downloadCSV(
//               metalPuritySales,
//               ['metal', 'purity', 'weight', 'quantity', 'revenue'],
//               'full-metal-report.csv'
//             )} className="bg-[#713054] hover:bg-[#5C2644] text-white px-5 py-2.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-colors flex items-center gap-2 shadow-sm">
//               <Download size={14} /> Export Report
//             </button>
//           </div>
//         </div>

//         {/* METRIC CARDS */}
//         <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-10">
          
//           {/* Total Portfolio Value */}
//           <div className="md:col-span-4 bg-white rounded-xl p-6 border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-between relative overflow-hidden">
//             <div className="flex justify-between items-start mb-4">
//               <h3 className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase">
//                 TOTAL PORTFOLIO VALUE
//               </h3>
//               <div className="w-8 h-8 rounded-full bg-[#F8EFF3] text-[#713054] flex items-center justify-center">
//                 <TrendingUp size={14} strokeWidth={2.5} />
//               </div>
//             </div>
            
//             <div className="mb-4">
//               <p className="text-4xl md:text-[42px] font-bold text-gray-900 tracking-tight leading-none">
//                 <span className="text-2xl mr-1">₹</span>{formatCurrency(summaryMetrics.totalRev || 0)}
//               </p>
//             </div>
            
//             <div className="flex items-center gap-3 mt-auto">
//               <span className="bg-[#FCE8E8] text-[#C94A4A] text-[10px] font-bold px-2 py-1 rounded">
//                 +14.2%
//               </span>
//               <span className="text-[9px] font-bold tracking-[0.1em] text-gray-400 uppercase">
//                 COMPARED TO PREVIOUS MONTH
//               </span>
//             </div>
//           </div>

//           {/* Sub Metrics (Gold, Silver, Platinum) */}
//           <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
//             <MetricCard 
//               title="GOLD RESERVES" 
//               revenue={summaryMetrics.goldRev || 0} 
//               weight={summaryMetrics.totalGoldWeight || 0} 
//             />
//             <MetricCard 
//               title="SILVER RESERVES" 
//               revenue={summaryMetrics.silverRev || 0} 
//               weight={summaryMetrics.totalSilverWeight || 0} 
//             />
//             <MetricCard 
//               title="PLATINUM RESERVES" 
//               revenue={summaryMetrics.platinumRev || 0} 
//               weight={summaryMetrics.totalPlatinumWeight || 0} 
//             />
//           </div>
//         </div>

//         {/* ================= PURITY BREAKDOWN TABLES ================= */}
        
//         {Object.keys(groupedPurity).length === 0 ? (
//            <div className="bg-white rounded-xl p-16 text-center border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
//              <Activity className="w-12 h-12 mx-auto text-gray-200 mb-4" />
//              <p className="text-gray-500 font-medium">No purity data available for the selected period.</p>
//            </div>
//         ) : (
//           <div className="space-y-6">
            
//             {/* Render Gold First if exists */}
//             {groupedPurity["GOLD"] && (
//               <PurityTableGroup metalName="Gold" items={groupedPurity["GOLD"]} />
//             )}
            
//             {/* Render Silver Second if exists */}
//             {groupedPurity["SILVER"] && (
//               <PurityTableGroup metalName="Silver" items={groupedPurity["SILVER"]} />
//             )}

//             {/* Render Platinum Third if exists */}
//             {groupedPurity["PLATINUM"] && (
//               <PurityTableGroup metalName="Platinum" items={groupedPurity["PLATINUM"]} />
//             )}

//             {/* Render any others */}
//             {Object.entries(groupedPurity).map(([metal, items]) => {
//               if (["GOLD", "SILVER", "PLATINUM"].includes(metal)) return null;
//               return <PurityTableGroup key={metal} metalName={metal} items={items} />;
//             })}

//           </div>
//         )}

//         {/* ================= BOTTOM INFO PANELS ================= */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
//            <InfoPanel 
//              icon={<TrendingUp size={16} />} 
//              title="Yield Forecast" 
//              desc="Estimated +4.2% growth in 24K Gold valuation over the next fiscal quarter based on current trend analysis." 
//            />
//            <InfoPanel 
//              icon={<CheckSquare size={16} />} 
//              title="Compliance Status" 
//              desc="All active silver assets have cleared the Q3 audit verification. Next certification due in 45 days." 
//            />
//            <InfoPanel 
//              icon={<Building2 size={16} />} 
//              title="Liquidity Index" 
//              desc="Current portfolio maintains high liquidity with 88% of assets eligible for immediate market conversion." 
//            />
//         </div>

//       </div>
//     </div>
//   );
// }

// // ================= HELPER COMPONENTS =================

// function MetricCard({ title, revenue, weight }) {
//   return (
//     <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-center">
//       <h3 className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase mb-3">
//         {title}
//       </h3>
//       <p className="text-[22px] font-bold text-gray-900 tracking-tight leading-none mb-2">
//         <span className="text-sm mr-0.5">₹</span>{formatCurrency(revenue)}
//       </p>
//       <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
//         {Number(weight).toFixed(2)} g (Total)
//       </p>
//     </div>
//   );
// }

// function PurityTableGroup({ metalName, items }) {
//   const ITEMS_PER_PAGE = 5;
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
//   const [purityFilter, setPurityFilter] = useState("All");

//   // Sort items primarily by weight descending
//   const sortedItems = [...items].sort((a, b) => b.weight - a.weight);

//   const filteredItems =
//     purityFilter === "All"
//       ? sortedItems
//       : sortedItems.filter((item) => item.purity === purityFilter);

//   const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
//   const paginatedItems = filteredItems.slice(
//     (currentPage - 1) * ITEMS_PER_PAGE,
//     currentPage * ITEMS_PER_PAGE
//   );
  
//   const totalWeight = sortedItems.reduce((sum, row) => sum + row.weight, 0);
//   const totalQty = sortedItems.reduce((sum, row) => sum + (row.quantity || row.count || 0), 0);
//   const totalRev = sortedItems.reduce((sum, row) => sum + row.revenue, 0);

//   const uniquePurities = ["All", ...new Set(items.map((item) => item.purity))];

//   // Decorate purity names for UI matching if it's generic data
//   const formatPurityName = (p) => {
//     const raw = String(p).toUpperCase();
//     if(raw.includes("24K")) return "24K Fine Gold (99.9%)";
//     if(raw.includes("22K")) return "22K Standard Gold (91.6%)";
//     if(raw.includes("18K")) return "18K Jewelry Gold (75.0%)";
//     if(raw.includes("999") || raw.includes("FINE SILVER")) return "Fine Silver (99.9%)";
//     if(raw.includes("925") || raw.includes("STERLING")) return "Sterling Silver (92.5%)";
//     if(raw.includes("950")) return "950 Platinum (95.0%)";
//     if(raw.includes("900")) return "900 Platinum (90.0%)";
//     return p;
//   };

//   return (
//     <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
     
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <div className="flex items-center gap-3">
//           <div className="w-1.5 h-6 bg-[#713054] rounded-full"></div>
//           <h4 className="text-lg font-bold text-gray-900 tracking-wide capitalize">
//             {metalName} Purity Breakdown
//           </h4>
//         </div>
//         <div className="flex items-center gap-2 text-gray-400 relative">
//           <div className="relative">
//             <button onClick={() => setIsFilterMenuOpen(prev => !prev)} className="p-1.5 hover:bg-gray-50 rounded"><Filter size={16} /></button>
//             {isFilterMenuOpen && (
//               <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-10">
//                 {uniquePurities.map(purity => (
//                   <button
//                     key={purity}
//                     onClick={() => {
//                       setPurityFilter(purity);
//                       setIsFilterMenuOpen(false);
//                       setCurrentPage(1);
//                     }}
//                     className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                   >
//                     {purity}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
//           <div className="relative">
//             <button onClick={() => setIsMenuOpen(prev => !prev)} className="p-1.5 hover:bg-gray-50 rounded"><MoreVertical size={16} /></button>
//             {isMenuOpen && (
//               <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-10">
//                 <button
//                   onClick={() => downloadCSV(
//                     paginatedItems,
//                     ['purity', 'weight', 'quantity', 'revenue'],
//                     `${metalName}-purity-report-page-${currentPage}.csv`
//                   )}
//                   className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                 >
//                   Download as CSV
//                 </button>
//                 <button
//                   onClick={() => window.print()}
//                   className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                 >
//                   Print Section
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full text-left border-collapse">
//           <thead>
//             <tr className="border-b border-gray-100">
//               <th className="py-4 px-4 text-[9px] font-bold tracking-[0.15em] text-gray-400 uppercase w-1/3">Purity Grade</th>
//               <th className="py-4 px-4 text-[9px] font-bold tracking-[0.15em] text-gray-400 uppercase text-center">Weight (g)</th>
//               <th className="py-4 px-4 text-[9px] font-bold tracking-[0.15em] text-gray-400 uppercase text-center">Quantity</th>
//               <th className="py-4 px-4 text-[9px] font-bold tracking-[0.15em] text-gray-400 uppercase text-right">Total Revenue (INR)</th>
//             </tr>
//           </thead>
//           <tbody>
//             {paginatedItems.length > 0 ? (
//               paginatedItems.map((row, i) => (
//                 <tr key={i} className="border-b border-gray-50 hover:bg-[#FCFAFA] transition-colors group">
//                   <td className="py-5 px-4">
//                     <div className="flex items-center gap-3">
//                       {/* Tiny bullet indicator matching screenshot */}
//                       <div className={`w-1.5 h-1.5 rounded-full ${metalName.toUpperCase() === "GOLD" ? "bg-[#E3A335]" : metalName.toUpperCase() === "SILVER" ? "bg-[#D1D5DB]" : "bg-[#8B5CF6]"}`}></div>
//                       <span className="text-[13px] font-semibold text-gray-800">
//                         {formatPurityName(row.purity)}
//                       </span>
//                     </div>
//                   </td>
//                   <td className="py-5 px-4 text-center">
//                     <span className="text-[13px] font-medium text-gray-600">
//                       {Number(row.weight).toLocaleString("en-IN", {minimumFractionDigits: 2, maximumFractionDigits: 2})}
//                     </span>
//                   </td>
//                   <td className="py-5 px-4 text-center">
//                     <span className="text-[13px] font-medium text-gray-600">
//                       {row.quantity || row.count || 0} Units
//                     </span>
//                   </td>
//                   <td className="py-5 px-4 text-right">
//                     <span className="text-[13px] font-bold text-gray-800">
//                       ₹{formatCurrency(row.revenue)}
//                     </span>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="4" className="text-center py-10 text-gray-500">
//                   No data available for the selected filter.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//           {/* Footer Aggregate Row */}
//           <tfoot>
//             <tr className="bg-[#FCFAFA]">
//               <td className="py-5 px-4 text-[11px] font-bold tracking-[0.15em] text-gray-800 uppercase rounded-bl-lg">
//                 {metalName} Aggregate
//               </td>
//               <td className="py-5 px-4 text-[13px] font-bold text-gray-800 text-center">
//                 {totalWeight.toLocaleString("en-IN", {minimumFractionDigits: 2, maximumFractionDigits: 2})} g
//               </td>
//               <td className="py-5 px-4 text-[13px] font-bold text-gray-800 text-center">
//                 {totalQty}
//               </td>
//               <td className="py-5 px-4 text-[13px] font-bold text-[#713054] text-right rounded-br-lg">
//                 ₹{formatCurrency(totalRev)}
//               </td>
//             </tr>
//           </tfoot>
//         </table>
//       </div>

//       {/* Pagination Controls */}
//       {totalPages > 1 && (
//         <div className="flex justify-between items-center mt-6 text-sm">
//           <button
//             onClick={() => setCurrentPage(p => p - 1)}
//             disabled={currentPage === 1}
//             className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             Previous
//           </button>
//           <span className="font-medium">
//             Page {currentPage} of {totalPages}
//           </span>
//           <button
//             onClick={() => setCurrentPage(p => p + 1)}
//             disabled={currentPage === totalPages}
//             className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// function InfoPanel({ icon, title, desc }) {
//   return (
//     <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-start gap-4">
//       <div className="w-10 h-10 rounded-lg bg-[#F8EFF3] text-[#713054] flex items-center justify-center shrink-0">
//         {icon}
//       </div>
//       <div>
//         <h4 className="text-[11px] font-bold tracking-widest text-gray-900 uppercase mb-1.5">{title}</h4>
//         <p className="text-[11px] text-gray-500 leading-relaxed font-medium">{desc}</p>
//       </div>
//     </div>
//   );
// }





import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../api";
import { 
  Building2, TrendingUp, Download, CheckSquare, 
  MoreVertical, Filter, Activity, Clock
} from "lucide-react";
import BackButton from "../../components/BackButton";

const downloadCSV = (data, headers, filename) => {
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => row[header]).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.href) {
    URL.revokeObjectURL(link.href);
  }
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const formatCurrency = (val) => {
  return Number(val || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0
  });
};

export default function MetalReportPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [data, setData] = useState(state?.analytics || {});
  const [filter, setFilter] = useState(state?.filterLabel || "monthly");
  const [loading, setLoading] = useState(!state);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/dashboard/stats?filter=${filter}`);
        setData(res.data.analytics);
      } catch (err) {
        console.error("Metal Report Load Failed", err);
      } finally {
        setLoading(false);
      }
    };

    if (filter) {
      load();
    }
  }, [filter]);

  const metalPuritySales = data?.metalPuritySales || [];

  const groupedPurity = useMemo(() => {
    const groups = {};
    metalPuritySales.forEach((item) => {
      let m = item.metal?.toUpperCase() || "OTHER";
      if (m.includes("GOLD")) m = "GOLD";
      else if (m.includes("SILVER")) m = "SILVER";
      else if (m.includes("PLATINUM") || m.includes("PT")) m = "PLATINUM";

      if (!groups[m]) groups[m] = [];
      groups[m].push(item);
    });
    return groups;
  }, [metalPuritySales]);

  const summaryMetrics = useMemo(() => {
    let totalRev = 0;
    let totalGoldWeight = 0;
    let totalSilverWeight = 0;
    let totalPlatinumWeight = 0;
    let goldRev = 0;
    let silverRev = 0;
    let platinumRev = 0;

    Object.entries(groupedPurity).forEach(([metal, items]) => {
      const w = items.reduce((sum, row) => sum + row.weight, 0);
      const r = items.reduce((sum, row) => sum + row.metalValue, 0); // ✅ fixed
      totalRev += r;

      if (metal.includes("GOLD")) {
        totalGoldWeight += w;
        goldRev += r;
      } else if (metal.includes("SILVER")) {
        totalSilverWeight += w;
        silverRev += r;
      } else if (metal.includes("PLATINUM") || metal.includes("PT")) {
        totalPlatinumWeight += w;
        platinumRev += r;
      }
    });

    return {
      totalRev,
      totalGoldWeight, goldRev,
      totalSilverWeight, silverRev,
      totalPlatinumWeight, platinumRev
    };
  }, [groupedPurity]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFAFA]">
        <div className="flex items-center gap-2 text-[#713054] animate-pulse">
          <Activity size={20} />
          <span className="font-medium tracking-widest uppercase text-xs">Compiling ledgers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAFA] font-sans text-gray-800 pb-20">
      <BackButton/>
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-10">
        
        {/* HEADER & SUMMARY */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <span className="bg-[#F8EFF3] text-[#713054] px-3 py-1.5 rounded-full text-[9px] font-bold tracking-[0.15em] uppercase mb-4 inline-block">
              PERFORMANCE HUB
            </span>
            <h2 className="text-[32px] md:text-[40px] font-bold text-[#5A374F] tracking-tight leading-none mb-2 uppercase">
              Metal Sell Report
            </h2>
            <p className="text-[13px] text-gray-500 font-medium">
              Real-time valuation of the metallic treasury reserves.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <button 
                onClick={() => setFilter('monthly')}
                className={`px-4 py-2.5 text-[10px] font-bold tracking-widest uppercase transition-colors ${filter === 'monthly' ? 'text-[#713054]' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                Monthly
              </button>
              <div className="w-px bg-gray-200"></div>
              <button 
                onClick={() => setFilter('quarterly')}
                className={`px-4 py-2.5 text-[10px] font-bold tracking-widest uppercase transition-colors ${filter === 'quarterly' ? 'text-[#713054]' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                Quarterly
              </button>
            </div>
            <button onClick={() => downloadCSV(
              metalPuritySales,
              ['metal', 'purity', 'rate', 'weight', 'quantity', 'metalValue'],
              'full-metal-report.csv'
            )} className="bg-[#713054] hover:bg-[#5C2644] text-white px-5 py-2.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-colors flex items-center gap-2 shadow-sm">
              <Download size={14} /> Export Report
            </button>
          </div>
        </div>

        {/* METRIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-10">
          <div className="md:col-span-4 bg-white rounded-xl p-6 border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase">
                TOTAL PORTFOLIO VALUE
              </h3>
              <div className="w-8 h-8 rounded-full bg-[#F8EFF3] text-[#713054] flex items-center justify-center">
                <TrendingUp size={14} strokeWidth={2.5} />
              </div>
            </div>
            <div className="mb-4">
              <p className="text-4xl md:text-[42px] font-bold text-gray-900 tracking-tight leading-none">
                <span className="text-2xl mr-1">₹</span>{formatCurrency(summaryMetrics.totalRev || 0)}
              </p>
            </div>
            <div className="flex items-center gap-3 mt-auto">
              <span className="bg-[#FCE8E8] text-[#C94A4A] text-[10px] font-bold px-2 py-1 rounded">
                +14.2%
              </span>
              <span className="text-[9px] font-bold tracking-[0.1em] text-gray-400 uppercase">
                COMPARED TO PREVIOUS MONTH
              </span>
            </div>
          </div>

          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
            <MetricCard 
              title="GOLD Sell" 
              revenue={summaryMetrics.goldRev || 0} 
              weight={summaryMetrics.totalGoldWeight || 0} 
            />
            <MetricCard 
              title="SILVER Sell" 
              revenue={summaryMetrics.silverRev || 0} 
              weight={summaryMetrics.totalSilverWeight || 0} 
            />
            <MetricCard 
              title="PLATINUM Sell" 
              revenue={summaryMetrics.platinumRev || 0} 
              weight={summaryMetrics.totalPlatinumWeight || 0} 
            />
          </div>
        </div>

        {/* PURITY BREAKDOWN TABLES */}
        {Object.keys(groupedPurity).length === 0 ? (
           <div className="bg-white rounded-xl p-16 text-center border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
             <Activity className="w-12 h-12 mx-auto text-gray-200 mb-4" />
             <p className="text-gray-500 font-medium">No purity data available for the selected period.</p>
           </div>
        ) : (
          <div className="space-y-6">
            {groupedPurity["GOLD"] && <PurityTableGroup metalName="Gold" items={groupedPurity["GOLD"]} />}
            {groupedPurity["SILVER"] && <PurityTableGroup metalName="Silver" items={groupedPurity["SILVER"]} />}
            {groupedPurity["PLATINUM"] && <PurityTableGroup metalName="Platinum" items={groupedPurity["PLATINUM"]} />}
            {Object.entries(groupedPurity).map(([metal, items]) => {
              if (["GOLD", "SILVER", "PLATINUM"].includes(metal)) return null;
              return <PurityTableGroup key={metal} metalName={metal} items={items} />;
            })}
          </div>
        )}

        {/* BOTTOM INFO PANELS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
           <InfoPanel 
             icon={<TrendingUp size={16} />} 
             title="Yield Forecast" 
             desc="Estimated +4.2% growth in 24K Gold valuation over the next fiscal quarter based on current trend analysis." 
           />
           <InfoPanel 
             icon={<CheckSquare size={16} />} 
             title="Compliance Status" 
             desc="All active silver assets have cleared the Q3 audit verification. Next certification due in 45 days." 
           />
           <InfoPanel 
             icon={<Building2 size={16} />} 
             title="Liquidity Index" 
             desc="Current portfolio maintains high liquidity with 88% of assets eligible for immediate market conversion." 
           />
        </div>

      </div>
    </div>
  );
}

// ------------------- HELPER COMPONENTS -------------------
function MetricCard({ title, revenue, weight }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-center">
      <h3 className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase mb-3">
        {title}
      </h3>
      <p className="text-[22px] font-bold text-gray-900 tracking-tight leading-none mb-2">
        <span className="text-sm mr-0.5">₹</span>{formatCurrency(revenue)}
      </p>
      <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
        {Number(weight).toFixed(2)} g (Total)
      </p>
    </div>
  );
}

function PurityTableGroup({ metalName, items }) {
  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [purityFilter, setPurityFilter] = useState("All");

  const sortedItems = [...items].sort((a, b) => b.weight - a.weight);
  const filteredItems =
    purityFilter === "All"
      ? sortedItems
      : sortedItems.filter((item) => item.purity === purityFilter);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const totalWeight = sortedItems.reduce((sum, row) => sum + row.weight, 0);
  const totalQty = sortedItems.reduce((sum, row) => sum + (row.quantity || 0), 0);
  const totalRev = sortedItems.reduce((sum, row) => sum + row.metalValue, 0); // ✅ fixed

  const uniquePurities = ["All", ...new Set(items.map((item) => item.purity))];

  const formatPurityName = (p) => {
    const raw = String(p).toUpperCase();
    if(raw.includes("24K")) return "24K Fine Gold (99.9%)";
    if(raw.includes("22K")) return "22K Standard Gold (91.6%)";
    if(raw.includes("18K")) return "18K Jewelry Gold (75.0%)";
    if(raw.includes("999") || raw.includes("FINE SILVER")) return "Fine Silver (99.9%)";
    if(raw.includes("925") || raw.includes("STERLING")) return "Sterling Silver (92.5%)";
    if(raw.includes("950")) return "950 Platinum (95.0%)";
    if(raw.includes("900")) return "900 Platinum (90.0%)";
    return p;
  };

  return (
    <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#713054] rounded-full"></div>
          <h4 className="text-lg font-bold text-gray-900 tracking-wide capitalize">
            {metalName} Purity Breakdown
          </h4>
        </div>
        <div className="flex items-center gap-2 text-gray-400 relative">
          <div className="relative">
            <button onClick={() => setIsFilterMenuOpen(prev => !prev)} className="p-1.5 hover:bg-gray-50 rounded"><Filter size={16} /></button>
            {isFilterMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-10">
                {uniquePurities.map(purity => (
                  <button
                    key={purity}
                    onClick={() => {
                      setPurityFilter(purity);
                      setIsFilterMenuOpen(false);
                      setCurrentPage(1);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {purity}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <button onClick={() => setIsMenuOpen(prev => !prev)} className="p-1.5 hover:bg-gray-50 rounded"><MoreVertical size={16} /></button>
            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-10">
                <button
                  onClick={() => downloadCSV(
                    paginatedItems,
                    ['purity', 'rate', 'weight', 'quantity', 'metalValue'],
                    `${metalName}-purity-report-page-${currentPage}.csv`
                  )}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Download as CSV
                </button>
                <button
                  onClick={() => window.print()}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Print Section
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-4 px-4 text-[9px] font-bold tracking-[0.15em] text-gray-400 uppercase w-1/4">Purity Grade</th>
              <th className="py-4 px-4 text-[9px] font-bold tracking-[0.15em] text-gray-400 uppercase text-center">Rate (₹/g)</th>
              <th className="py-4 px-4 text-[9px] font-bold tracking-[0.15em] text-gray-400 uppercase text-center">Weight (g)</th>
              <th className="py-4 px-4 text-[9px] font-bold tracking-[0.15em] text-gray-400 uppercase text-center">Quantity</th>
              <th className="py-4 px-4 text-[9px] font-bold tracking-[0.15em] text-gray-400 uppercase text-right">Total Value (₹)</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length > 0 ? (
              paginatedItems.map((row, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-[#FCFAFA] transition-colors group">
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${metalName.toUpperCase() === "GOLD" ? "bg-[#E3A335]" : metalName.toUpperCase() === "SILVER" ? "bg-[#D1D5DB]" : "bg-[#8B5CF6]"}`}></div>
                      <span className="text-[13px] font-semibold text-gray-800">
                        {formatPurityName(row.purity)}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-4 text-center font-mono text-[13px] text-gray-700">
                    {Number(row.rate).toLocaleString("en-IN", {minimumFractionDigits: 2})}
                  </td>
                  <td className="py-5 px-4 text-center">
                    <span className="text-[13px] font-medium text-gray-600">
                      {Number(row.weight).toLocaleString("en-IN", {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </span>
                  </td>
                  <td className="py-5 px-4 text-center">
                    <span className="text-[13px] font-medium text-gray-600">
                      {row.quantity || 0} Units
                    </span>
                  </td>
                  <td className="py-5 px-4 text-right">
                    <span className="text-[13px] font-bold text-gray-800">
                      ₹{formatCurrency(row.metalValue)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-500">
                  No data available for the selected filter.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-[#FCFAFA]">
              <td className="py-5 px-4 text-[11px] font-bold tracking-[0.15em] text-gray-800 uppercase rounded-bl-lg">
                {metalName} Aggregate
              </td>
              <td className="py-5 px-4 text-center text-[13px] text-gray-500">—</td>
              <td className="py-5 px-4 text-[13px] font-bold text-gray-800 text-center">
                {totalWeight.toLocaleString("en-IN", {minimumFractionDigits: 2, maximumFractionDigits: 2})} g
              </td>
              <td className="py-5 px-4 text-[13px] font-bold text-gray-800 text-center">
                {totalQty}
              </td>
              <td className="py-5 px-4 text-[13px] font-bold text-[#713054] text-right rounded-br-lg">
                ₹{formatCurrency(totalRev)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 text-sm">
          <button
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function InfoPanel({ icon, title, desc }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-[#F8EFF3] text-[#713054] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="text-[11px] font-bold tracking-widest text-gray-900 uppercase mb-1.5">{title}</h4>
        <p className="text-[11px] text-gray-500 leading-relaxed font-medium">{desc}</p>
      </div>
    </div>
  );
}