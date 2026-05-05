



// import { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import API from "../../api";
// import { 
//   Bell, User, Gem, Download, Hexagon, TrendingUp, TrendingDown, Activity
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

// export default function DiamondReportPage() {
//   const { state } = useLocation();

//   // ✅ STATE - Save the whole response object to access graphData
//   const [data, setData] = useState(state || {});
//   const [filter, setFilter] = useState(state?.filterLabel || "monthly");
//   const [customRange, setCustomRange] = useState({ start: "", end: "" });
//   const [loading, setLoading] = useState(!state);

//   // ✅ FETCH DATA
//   useEffect(() => {
//     const load = async () => {
//       try {
//         setLoading(true);
//         let url = `/dashboard/stats?filter=${filter}`;

//         if (filter === "custom" && customRange.start && customRange.end) {
//           url += `&startDate=${customRange.start}&endDate=${customRange.end}`;
//         }

//         console.log("📡 Diamond API:", url);
//         const res = await API.get(url);
//         setData(res.data || {});
//       } catch (err) {
//         console.error("Diamond Report Load Failed", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (filter !== "custom" || (customRange.start && customRange.end)) {
//       load();
//     }
//   }, [filter, customRange]);

//   // ✅ SAFE DATA EXTRACTION
//   const diamondStats = data.analytics?.diamondStats || {};
//   const diamondDetails = data.analytics?.diamondDetails || [];

//   // Extract trend from graphData (where the backend sends it)
//   const diamondTrend = data.graphData?.diamondTrend || [];

//   console.log("💎 diamondStats:", diamondStats);
//   console.log("💎 diamondDetails:", diamondDetails);
//   console.log("💎 diamondTrend:", diamondTrend);


//   // Find max value for dynamic bar chart scaling
//   const maxTrendValue = diamondTrend.length > 0 
//     ? Math.max(...diamondTrend.map(d => d.totalCarats || 0)) 
//     : 100;

//   // Dynamic Eyebrow text based on filter
//   const eyebrowText = filter === "custom" 
//     ? "CUSTOM ANALYSIS" 
//     : filter === "daily" ? "DAILY ANALYSIS"
//     : filter === "weekly" ? "WEEKLY ANALYSIS"
//     : filter === "monthly" ? "MONTHLY ANALYSIS"
//     : "QUARTERLY ANALYSIS"; // Fallback/Yearly

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">

//         <div className="flex items-center gap-3 text-[#6A304D] animate-pulse">
//           <Activity size={24} />
//           <span className="font-medium tracking-widest uppercase text-sm">Compiling Data...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#FAFAFA] font-sans text-gray-900 pb-24">
//       <BackButton/>
//       {/* ================= MAIN CONTENT ================= */}
//       <div className="max-w-[1300px] mx-auto px-6 md:px-12 ">

//         {/* Page Header */}
//         <div className="mb-10">
//           <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2">
//             {eyebrowText}
//           </p>
//           <h2 className="text-[44px] font-bold text-[#6A304D] tracking-tight leading-none">
//             Diamond Report
//           </h2>
//         </div>

//         {/* ================= TOP CARDS GRID ================= */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">

//           {/* Left Card: Total Volume */}
//           <div className="lg:col-span-4 bg-[#F8F3F5] rounded-xl p-8 md:p-10 flex flex-col justify-center border border-[#F0EAEF] shadow-sm">
//             <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-700 mb-8">
//               <Gem size={14} className="text-[#6A304D]" /> TOTAL CARAT VOLUME
//             </div>

//             <div className="flex items-baseline gap-2 mb-10">
//               <span className="text-[64px] md:text-[80px] font-bold text-[#6A304D] leading-none tracking-tighter">
//                 {diamondStats.totalCarats?.toFixed(2) || "0.00"}
//               </span>
//               <span className="text-2xl font-bold text-[#6A304D]">ct</span>
//             </div>

//             <div className="flex items-center gap-3 text-gray-500">
//               <span className="text-sm font-medium">Items Tracked:</span>
//               <span className="text-3xl font-bold text-[#6A304D]">{diamondStats.sales || 0}</span>
//             </div>

//             <div className="mt-6">
//   <span className="text-sm text-gray-500">Total Value</span>
//   <div className="text-2xl font-bold text-[#6A304D]">
//     ₹{diamondStats.totalAmount?.toLocaleString("en-IN") || "0"}
//   </div>
// </div>


//           </div>

//           {/* Right Card: Trend Chart */}
//           <div className="lg:col-span-8 bg-white rounded-xl p-8 md:p-10 border border-gray-100 shadow-[0_2px_20px_rgb(0,0,0,0.02)] flex flex-col">

//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
//               <h3 className="text-[22px] font-bold text-[#6A304D]">Diamond Trend</h3>

//               {/* Filters */}
//               <div className="flex items-center gap-1">
//                 {["daily", "weekly", "monthly", "yearly", "custom"].map((ft) => (
//                   <button
//                     key={ft}
//                     onClick={() => setFilter(ft)}
//                     className={`px-4 py-1.5 text-[11px] font-medium rounded-full capitalize transition-all ${
//                       filter === ft ? "bg-[#6A304D] text-white" : "text-gray-400 hover:text-gray-700"
//                     }`}
//                   >
//                     {ft}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Custom Range Inputs (Hidden unless active) */}
//             {filter === "custom" && (
//               <div className="flex items-center gap-3 mb-8 bg-gray-50 p-3 rounded-lg w-fit">
//                 <input type="date" value={customRange.start} onChange={(e) => setCustomRange(p => ({ ...p, start: e.target.value }))} className="bg-transparent text-sm outline-none text-gray-600" />
//                 <span className="text-gray-400">to</span>
//                 <input type="date" value={customRange.end} onChange={(e) => setCustomRange(p => ({ ...p, end: e.target.value }))} className="bg-transparent text-sm outline-none text-gray-600" />
//               </div>
//             )}

//             {/* Dynamic CSS Bar Chart */}
//             <div className="flex-1 flex items-end justify-between gap-2 h-[240px] pt-4 border-b border-gray-100 pb-2">
//               {diamondTrend.length === 0 ? (
//                 <div className="w-full text-center text-gray-400 font-medium italic pb-10">No trend data available for this period.</div>
//               ) : (
//                 diamondTrend.map((row, i) => {
//                   const heightPercent = maxTrendValue > 0 ? (row.totalCarats / maxTrendValue) * 100 : 0;
//                   // Determine if this is the max bar to highlight it like the screenshot
//                   const isMax = row.totalCarats === maxTrendValue && maxTrendValue > 0;

//                   return (
//                     <div key={i} className="flex flex-col items-center gap-4 flex-1 group">
//                       <div className="w-full relative flex justify-center h-full items-end">
//                         {/* Tooltip on hover */}
//                         <div className="absolute -top-8 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
//                           {row.totalCarats?.toFixed(2)} ct
//                         </div>
//                         {/* Bar */}
//                         <div 
//                           className={`w-full max-w-[60px] rounded-t-sm transition-all duration-500 ${isMax ? "bg-[#6A304D]" : "bg-[#BCA9B2] group-hover:bg-[#9E828F]"}`}
//                           style={{ height: `${Math.max(heightPercent, 2)}%` }} // min 2% height so 0 isn't invisible
//                         ></div>
//                       </div>
//                       <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{row._id || `P${i+1}`}</span>
//                     </div>
//                   );
//                 })
//               )}
//             </div>

//           </div>
//         </div>

//         {/* ================= INVENTORY FOCUS TABLE ================= */}
//         <div>
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
//             <div>
//               <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2">INVENTORY FOCUS</p>
//               <h2 className="text-[32px] font-bold text-[#6A304D] tracking-tight leading-none">Diamond Breakdown (Type-wise)</h2>
//             </div>
//             <button onClick={() => downloadCSV(
//               diamondDetails,
//               ['type', 'quantity', 'carats', 'amount', 'avgRate'],
//               'diamond-report.csv'
//             )} className="bg-[#6A304D] hover:bg-[#54253C] text-white px-5 py-2.5 rounded-md text-[11px] font-bold tracking-widest uppercase transition-colors flex items-center gap-2 shadow-md">
//               <Download size={14} /> Export Report
//             </button>
//           </div>

//           <div className="bg-white rounded-xl shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden">
//             {/* <div className="overflow-x-auto">
//               <table className="w-full text-left border-collapse min-w-[800px]">
//                 <thead>
//                   <tr className="bg-[#FAFAFA] border-b border-gray-100">
//                     <th className="py-5 px-8 text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase w-[30%]">Cut Type</th>
//                     <th className="py-5 px-8 text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase text-center">Quantity</th>
//                     <th className="py-5 px-8 text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase text-center">Avg Carat</th>
//                     <th className="py-5 px-8 text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase text-center">Market Value</th>
//                     <th className="py-5 px-8 text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase text-center">
//   Rate / ct
// </th>
//                     <th className="py-5 px-8 text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase text-right">Trend</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-50">

//                   {diamondDetails.length === 0 ? (
//                     <tr>
//                       <td colSpan="5" className="py-16 text-center text-gray-400 font-medium italic">No breakdown data available for this period.</td>
//                     </tr>
//                   ) : (
//                     diamondDetails.map((row, i) => {
//                       // Calculate a mock avg carat per piece and mock trend for UI parity (replace with real data if available)
//                       const avgCarat = row.quantity > 0 ? (row.carats / row.quantity).toFixed(2) : row.carats;
//                       const isUpTrend = i % 2 === 0; // Fake toggle for visual parity

//                       // Match grade names based on type (visual fluff to match screenshot)
//                       const subGrade = row.type.toLowerCase().includes("round") ? "Premium Grade" : row.type.toLowerCase().includes("princess") ? "Commercial Grade" : "High Clarity";

//                       return (
//                         <tr key={i} className="hover:bg-[#FCFAFA] transition-colors">
//                           <td className="py-5 px-8">
//                             <div className="flex items-center gap-4">
//                               <div className="w-10 h-10 rounded bg-[#F8F3F5] flex items-center justify-center shrink-0">
//                                 <Hexagon fill="#6A304D" className="text-[#6A304D] w-5 h-5" />
//                               </div>
//                               <div>
//                                 <h4 className="text-sm font-bold text-[#6A304D] capitalize">{row.type}</h4>
//                                 <p className="text-[11px] text-gray-400">{subGrade}</p>
//                               </div>
//                             </div>
//                           </td>
//                           <td className="py-5 px-8 text-center">
//                             <span className="text-[15px] font-bold text-[#6A304D]">{row.quantity}</span>
//                           </td>
//                           <td className="py-5 px-8 text-center">
//                             <span className="text-[15px] text-gray-600 font-medium">{avgCarat} ct</span>
//                           </td>
//                           <td className="py-5 px-8 text-center">
//                             <span className="text-[15px] font-bold text-[#6A304D]">
//                               ${row.amount?.toLocaleString("en-US", { minimumFractionDigits: 0 })}
//                             </span>
//                           </td>
//                           <td className="py-5 px-8 text-center">
//   <span className="text-[15px] font-bold text-[#6A304D]">
//     ₹{row.rate?.toLocaleString("en-IN")}
//   </span>
// </td>
//                           <td className="py-5 px-8 text-right">
//                             {isUpTrend ? (
//                               <div className="flex items-center justify-end gap-1.5 text-[#328D4D] text-sm font-bold">
//                                 <TrendingUp size={14} /> +{(Math.random() * 5).toFixed(1)}%
//                               </div>
//                             ) : (
//                               <div className="flex items-center justify-end gap-1.5 text-[#D12E2E] text-sm font-bold">
//                                 <TrendingDown size={14} /> -{(Math.random() * 2).toFixed(1)}%
//                               </div>
//                             )}
//                           </td>
//                         </tr>
//                       );
//                     })
//                   )}

//                 </tbody>
//               </table>
//             </div> */}


// <div className="bg-white rounded-2xl shadow-sm p-6">
//   <h2 className="text-lg font-semibold text-gray-700 mb-6">
//     Diamond Breakdown
//   </h2>

//   <div className="overflow-x-auto">
//     <table className="w-full">
//       <thead>
//         <tr className="text-left border-b">
//           <th className="py-3 px-4 text-xs text-gray-500 uppercase">Type</th>
//           <th className="py-3 px-4 text-xs text-gray-500 uppercase text-center">Qty</th>
//           <th className="py-3 px-4 text-xs text-gray-500 uppercase text-center">Carats</th>
//           <th className="py-3 px-4 text-xs text-gray-500 uppercase text-center">Value</th>
//           <th className="py-3 px-4 text-xs text-gray-500 uppercase text-center">Rate / ct</th>
//         </tr>
//       </thead>

//       <tbody>
//         {diamondDetails.map((row, index) => (
//           <tr key={index} className="border-b hover:bg-gray-50">

//             {/* TYPE */}
//             <td className="py-4 px-4 font-medium text-gray-700">
//               {row.type}
//             </td>

//             {/* QUANTITY */}
//             <td className="py-4 px-4 text-center">
//               {row.quantity}
//             </td>

//             {/* CARATS */}
//             <td className="py-4 px-4 text-center">
//               {row.carats} ct
//             </td>

//             {/* VALUE */}
//             <td className="py-4 px-4 text-center font-semibold text-green-600">
//               ₹{row.amount?.toLocaleString("en-IN")}
//             </td>

//             {/* ✅ CORRECT RATE */}
//             <td className="py-4 px-4 text-center font-bold text-[#6A304D]">
//               ₹{row.avgRate?.toLocaleString("en-IN")}
//             </td>

//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>
// </div>


//           </div>
//         </div>


//         <div className="bg-white rounded-xl p-6 mt-10">
//   <h2 className="text-lg font-semibold mb-4">
//     Diamond Size Analysis
//   </h2>

//   <table className="w-full text-center">
//     <thead>
//       <tr className="border-b text-sm text-gray-500">
//         <th>Range</th>
//         <th>Qty</th>
//         <th>Carats</th>
//         <th>Value</th>
//         <th>Avg Rate</th>
//       </tr>
//     </thead>

//     <tbody>
//       {data.analytics?.diamondSizeAnalysis?.map((row, i) => (
//         <tr key={i} className="border-b">
//           <td>{row.range}</td>
//           <td>{row.quantity}</td>
//           <td>{row.carats} ct</td>
//           <td>₹{row.amount.toLocaleString("en-IN")}</td>
//           <td>₹{row.avgRate.toLocaleString("en-IN")}</td>
//         </tr>
//       ))}
//     </tbody>
//   </table>
// </div>

//       </div>




//       {/* ================= FOOTER ================= */}
//       <footer className="mt-10 border-t border-gray-200 bg-[#FAFAFA] py-10 px-8 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
//         <div>
//           <h4 className="text-[#6A304D] font-bold text-sm">Crystalline Analyst</h4>
//           <p className="text-gray-400 text-xs mt-1">© 2026 Precision Data Curated.</p>
//         </div>
//         <div className="flex items-center gap-6 text-xs text-gray-400 font-medium">
//           <span className="hover:text-[#6A304D] cursor-pointer transition-colors">Privacy Policy</span>
//           <span className="hover:text-[#6A304D] cursor-pointer transition-colors">Terms of Service</span>
//           <span className="hover:text-[#6A304D] cursor-pointer transition-colors">Data Methodology</span>
//         </div>
//       </footer>

//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../../api";
import {
  Bell, User, Download, Hexagon, Square, Pentagon, TrendingUp, TrendingDown, Activity
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

export default function DiamondReportPage() {
  const { state } = useLocation();

  // ✅ STATE 
  const [data, setData] = useState(state || {});
  const [filter, setFilter] = useState(state?.filterLabel || "monthly");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(!state);

  // ✅ FETCH DATA
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        let url = `/dashboard/stats?filter=${filter}`;

        if (filter === "custom" && customRange.start && customRange.end) {
          url += `&startDate=${customRange.start}&endDate=${customRange.end}`;
        }

        const res = await API.get(url);
        setData(res.data || {});
      } catch (err) {
        console.error("Diamond Report Load Failed", err);
      } finally {
        setLoading(false);
      }
    };

    if (filter !== "custom" || (customRange.start && customRange.end)) {
      load();
    }
  }, [filter, customRange]);

  // ✅ SAFE DATA EXTRACTION
  const diamondStats = data.analytics?.diamondStats || {};
  const diamondDetails = data.analytics?.diamondDetails || [];
  const diamondTrend = data.graphData?.diamondTrend || [];
  const sizeAnalysis = data.analytics?.diamondSizeAnalysis || [];

  const maxTrendValue = diamondTrend.length > 0
    ? Math.max(...diamondTrend.map(d => d.totalCarats || 0))
    : 100;

  const eyebrowText = filter === "custom"
    ? "CUSTOM ANALYSIS"
    : filter === "daily" ? "DAILY ANALYSIS"
      : filter === "weekly" ? "WEEKLY ANALYSIS"
        : filter === "monthly" ? "MONTHLY ANALYSIS"
          : "QUARTERLY ANALYSIS";

  // Helper for dynamic icons in the table
  const getIconForType = (index) => {
    const iconClass = "text-[#622A46]";
    if (index % 3 === 0) return <Hexagon className={iconClass} size={18} fill="#622A46" />;
    if (index % 3 === 1) return <Square className={iconClass} size={16} fill="#622A46" />;
    return <Pentagon className={iconClass} size={18} fill="#622A46" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex items-center gap-3 text-[#622A46] animate-pulse">
          <Activity size={24} />
          <span className="font-bold tracking-widest uppercase text-xs">Compiling Data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-[#333] pb-10">

      {/* ================= TOP NAVBAR ================= */}
      <nav className="flex justify-between items-center py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <BackButton />
        </div>

      </nav>

      {/* ================= MAIN CONTENT ================= */}
      <div className="max-w-[1200px] mx-auto px-6">

        {/* Page Header */}
        <div className="mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2">
            {eyebrowText}
          </p>
          <h1 className="text-[40px] font-bold text-[#622A46] tracking-tight leading-none">
            Diamond Sell Report
          </h1>
        </div>

        {/* ================= TOP CARDS GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">

          {/* Left Card: Total Volume */}
          <div className="bg-[#F8F5F6] rounded-xl p-10 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-8">
              <Hexagon size={16} className="text-[#622A46]" fill="#622A46" />
              <p className="text-[10px] font-bold tracking-widest text-gray-800 uppercase">
                Total Carat Volume
              </p>
            </div>

            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-[72px] font-bold text-[#622A46] leading-none tracking-tighter">
                {diamondStats.totalCarats?.toFixed(2) || "0.00"}
              </span>
              <span className="text-2xl font-bold text-[#622A46]">ct</span>
            </div>

            <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
              Items Tracked: <span className="font-bold text-[#622A46] text-xl">{diamondStats.sales || 0}</span>
            </p>
          </div>

          {/* Right Card: Trend Chart */}
          <div className="lg:col-span-2 bg-[#F8F5F6] rounded-xl p-10 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-10">
              <h2 className="text-xl font-bold text-[#622A46]">Diamond Trend</h2>

              {/* Filters */}
              <div className="flex items-center gap-6 text-[11px] font-semibold text-gray-400">
                {["daily", "weekly", "monthly", "yearly", "custom"].map((ft) => (
                  <span
                    key={ft}
                    onClick={() => setFilter(ft)}
                    className={`cursor-pointer capitalize transition-all ${filter === ft ? "bg-[#622A46] text-white px-4 py-1.5 rounded-full shadow-sm" : "hover:text-gray-800"
                      }`}
                  >
                    {ft}
                  </span>
                ))}
              </div>
            </div>

            {/* Custom Range Inputs (Hidden unless active) */}
            {filter === "custom" && (
              <div className="flex items-center justify-end gap-3 mb-6">
                <input type="date" value={customRange.start} onChange={(e) => setCustomRange(p => ({ ...p, start: e.target.value }))} className="bg-white border border-gray-200 text-xs p-2 rounded outline-none" />
                <span className="text-gray-400 text-xs">to</span>
                <input type="date" value={customRange.end} onChange={(e) => setCustomRange(p => ({ ...p, end: e.target.value }))} className="bg-white border border-gray-200 text-xs p-2 rounded outline-none" />
              </div>
            )}

            {/* Bar Chart */}
            <div className="h-[200px] w-full flex items-end justify-between gap-3 mt-auto">
              {diamondTrend.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400 tracking-widest uppercase">
                  No data available
                </div>
              ) : (
                diamondTrend.map((row, i) => {
                  const heightPct = maxTrendValue > 0 ? Math.max(5, (row.totalCarats / maxTrendValue) * 100) : 5;
                  const isMax = row.totalCarats === maxTrendValue && maxTrendValue > 0;

                  return (
                    <div key={i} className="flex flex-col items-center flex-1 gap-4 group relative">
                      <div className="absolute -top-8 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        {row.totalCarats?.toFixed(2)} ct
                      </div>
                      <div className="w-full h-[180px] flex items-end">
                        <div
                          className={`w-full rounded-sm transition-all duration-500 ${isMax ? 'bg-[#622A46]' : 'bg-[#B49EAA]'}`}
                          style={{ height: `${heightPct}%`, opacity: isMax ? 1 : 0.7 }}
                        ></div>
                      </div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        {row._id?.substring(0, 3) || `P${i + 1}`}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ================= INVENTORY FOCUS TABLE ================= */}
        <div className="mb-16">
          <p className="text-[11px] font-bold tracking-[0.15em] text-gray-500 uppercase mb-2">
            Inventory Focus
          </p>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[28px] font-bold text-[#622A46] tracking-tight">
              Diamond Breakdown (Type-wise)
            </h2>
            <button
              onClick={() => downloadCSV(diamondDetails, ['type', 'quantity', 'carats', 'amount', 'avgRate'], 'diamond-report.csv')}
              className="flex items-center gap-2 bg-[#622A46] hover:bg-[#4C2036] transition-colors text-white text-[13px] font-bold px-5 py-2.5 rounded-md shadow-sm"
            >
              <Download size={16} /> Export Report
            </button>
          </div>

          <div className="w-full">
            <div className="grid grid-cols-5 bg-[#F8F5F6] rounded-t-lg px-6 py-4 border-b border-gray-100">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest col-span-2">Cut Type</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Quantity</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Avg Carat</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Market Value</div>
            </div>

            {diamondDetails.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-400 border-b border-gray-100">No records found.</div>
            ) : (
              diamondDetails.map((row, i) => {
                const avgCarat = row.quantity > 0 ? (row.carats / row.quantity).toFixed(2) : row.carats;
                const subGrade = row.type?.toLowerCase().includes("round") ? "Premium Grade" : row.type?.toLowerCase().includes("princess") ? "Commercial Grade" : "High Clarity";

                return (
                  <div key={i} className="grid grid-cols-5 items-center px-6 py-5 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4 col-span-2">
                      <div className="w-10 h-10 bg-[#F8F5F6] flex items-center justify-center rounded-sm">
                        {getIconForType(i)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#333] capitalize">{row.type || "Unknown"}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{subGrade}</p>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-[#333] text-center">{row.quantity ?? 0}</div>
                    <div className="text-sm font-medium text-gray-600 text-center">{avgCarat} ct</div>
                    <div className="text-sm font-bold text-[#333] text-right">₹{(row.amount || 0).toLocaleString("en-IN")}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================= CARAT DISTRIBUTION TABLE ================= */}
        {sizeAnalysis && sizeAnalysis.length > 0 && (
          <div className="mb-16">
            <p className="text-[11px] font-bold tracking-[0.15em] text-gray-500 uppercase mb-2">
              Carat Distribution
            </p>
            <h2 className="text-[28px] font-bold text-[#622A46] tracking-tight mb-6">
              Diamond Size Analysis
            </h2>

            <div className="w-full">
              <div className="grid grid-cols-5 bg-[#F8F5F6] rounded-t-lg px-6 py-4 border-b border-gray-100">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Range</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Quantity</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Carats</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Value</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Avg Rate</div>
              </div>

              {sizeAnalysis.map((row, index) => (
                <div key={index} className="grid grid-cols-5 items-center px-6 py-5 border-b border-gray-100">
                  <div className="text-sm font-bold text-[#333]">{row.range}</div>
                  <div className="text-sm font-bold text-[#333] text-center">{row.quantity}</div>
                  <div className="text-sm font-medium text-gray-600 text-center">{row.carats} ct</div>
                  <div className="text-sm font-bold text-[#622A46] text-center">₹{row.amount?.toLocaleString("en-IN")}</div>
                  <div className="text-sm font-medium text-gray-600 text-right">₹{row.avgRate?.toLocaleString("en-IS")}/ct</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-gray-100 bg-[#FAFAFA] py-10 mt-10">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="text-sm font-bold text-[#622A46]">Crystalline Analyst</h3>
            <p className="text-[11px] text-gray-400 mt-1">© 2026 Precision Data Curated.</p>
          </div>
          <div className="flex gap-8 text-[11px] font-bold text-gray-400 hover:text-gray-600 transition-colors">
            <span className="cursor-pointer">Privacy Policy</span>
            <span className="cursor-pointer">Terms of Service</span>
            <span className="cursor-pointer">Data Methodology</span>
          </div>
        </div>
      </footer>

    </div>
  );
}