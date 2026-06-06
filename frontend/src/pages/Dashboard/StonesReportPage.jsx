import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../../api";
import { Database, ShieldCheck, Download, Activity, Calendar, Search, Filter } from "lucide-react";
import BackButton from "../../components/BackButton";
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area
} from 'recharts';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseLabel(id, filter) {
  if (!id) return "";
  if (filter === "yearly") return id;
  if (filter === "weekly") {
    const parts = id.split("-");
    return `Wk ${parts[1]}`;
  }
  if (filter === "daily" || filter === "custom") {
    if (id.length === 10) {
        const d = new Date(id + "T00:00:00");
        return `${d.getDate()} ${MONTH_LABELS[d.getMonth()]}`;
    }
    return id;
  }
  const parts = id.split("-");
  if (parts.length === 2 && parts[1].length === 2) {
    const month = parseInt(parts[1], 10) - 1;
    return MONTH_LABELS[month] ?? id;
  }
  return id;
}

const downloadCSV = (data, headers, filename) => {
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
        const val = row[header] ?? '';
        return typeof val === 'string' ? `"${val}"` : val;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function StonesReportPage() {
  const { state } = useLocation();

  const [data, setData] = useState(state || {});
  const [filter, setFilter] = useState(state?.filterLabel || "monthly");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(!state);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        let url = `/dashboard/stats?filter=${filter}`;
        if (filter === "custom" && customRange.start && customRange.end) {
            url += `&startDate=${customRange.start}&endDate=${customRange.end}`;
        }

        const res = await API.get(url);
        setData(res.data);
      } catch (err) {
        console.error("Stone Report Load Failed", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (!state || filter !== (state?.filterLabel || "monthly") || filter === "custom") {
        if (filter !== "custom" || (customRange.start && customRange.end)) {
            load();
        }
    }
  }, [filter, customRange]);

  // ── Extract Data ──────────────────────────────────────────────────────────
  const { topStones = [], stoneStats = {} } = data.analytics || {};
  const stoneTrend = data.graphData?.stoneTrend || [];

  // Filtered Ledger
  const filteredStones = topStones.filter(st => 
    (st.type || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format trend data for Recharts
  const chartData = stoneTrend.map(item => ({
    name: parseLabel(item._id, filter),
    revenue: item.totalAmount || 0,
    units: item.totalQty || 0,
    weight: item.totalWeight || 0
  }));

  // Totals
  const totalWeight = stoneStats.totalWeight || topStones.reduce((s, st) => s + (st.weight || 0), 0);
  const totalQty = stoneStats.totalQty || topStones.reduce((s, st) => s + (st.quantity || 0), 0);
  const totalAmount = stoneStats.totalAmount || topStones.reduce((s, st) => s + (st.amount || 0), 0);

  // Distribution
  const distributionData = topStones.map(st => ({
    label: st.type || "Unknown",
    percent: totalQty > 0 ? Math.round((st.quantity / totalQty) * 100) : 0,
  }));

  const issueDate = new Date().toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFAFB]">
        <div className="flex items-center gap-3 text-[#5A2B43] animate-pulse">
          <Activity size={24} />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Compiling Analytical Overview...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAFB] text-[#2D2A26] font-sans pb-20">
      <nav className="py-2 border-b border-gray-100 bg-white/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-[1100px] mx-auto px-6">
          <BackButton />
        </div>
      </nav>

      <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-8">

        {/* ── HEADER ────────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 border-b border-[#F0EBEF] pb-8">
          <div>
            <h1 className="text-4xl md:text-[44px] font-semibold text-[#5A2B43] tracking-tight uppercase leading-none mb-3">
              Stone Sales Report
            </h1>
            <div className="flex items-center gap-2">
                <p className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase">
                Inventory Certification & Analytical Overview
                </p>
                <span className="bg-[#5A2B43]/10 text-[#5A2B43] text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">{filter}</span>
            </div>
          </div>
          <div className="text-left md:text-right">
            <p className="text-[8px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-1.5">Issue Date</p>
            <p className="text-xs font-bold text-[#5A2B43] uppercase tracking-widest">{issueDate}</p>
          </div>
        </div>

        {/* ── TOP METRIC CARDS ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 border-l-[4px] border-l-[#5A2B43] transition-transform hover:-translate-y-1">
            <p className="text-[9px] font-bold tracking-[0.15em] text-gray-400 uppercase mb-4">Total Weight</p>
            <p className="text-[40px] text-[#5A2B43] font-bold leading-none">
              {totalWeight.toFixed(2)} <span className="text-[12px] font-bold tracking-widest ml-1 opacity-50">CTS</span>
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 border-l-[4px] border-l-[#A67C8E] transition-transform hover:-translate-y-1">
            <p className="text-[9px] font-bold tracking-[0.15em] text-gray-400 uppercase mb-4">Total Quantity</p>
            <p className="text-[40px] text-[#5A2B43] font-bold leading-none">
              {totalQty.toLocaleString()} <span className="text-[12px] font-bold tracking-widest ml-1 opacity-50">UNITS</span>
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 border-l-[4px] border-l-[#CDBDC6] transition-transform hover:-translate-y-1">
            <p className="text-[9px] font-bold tracking-[0.15em] text-gray-400 uppercase mb-4">Total Value</p>
            <p className="text-[40px] text-[#5A2B43] font-bold leading-none">
              <span className="text-xl font-medium mr-1 opacity-50">₹</span>{totalAmount.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* ── MAIN ANALYTICS SECTION ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-14">

          {/* LEFT: INVENTORY LEDGER */}
          <div className="lg:col-span-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <h2 className="text-[14px] font-bold text-[#5A2B43] tracking-[0.1em] uppercase">Inventory Ledger</h2>
              
              <div className="flex items-center gap-3">
                {/* Search Variety */}
                <div className="relative group">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#5A2B43] transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search Variety..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 border border-gray-100 rounded-lg text-[11px] font-medium placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#5A2B43] transition-all w-full md:w-auto"
                    />
                </div>

                <button
                   onClick={() => downloadCSV(topStones, ['type', 'weight', 'quantity', 'amount'], 'Stones_Sales_Report.csv')}
                   className="flex items-center gap-2 bg-[#5A2B43] text-white px-4 py-2 rounded-lg text-[11px] font-bold hover:bg-[#452134] transition-colors shadow-sm"
                >
                  <Download size={14} /> Export
                </button>
              </div>
            </div>

            {filteredStones.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-[11px] font-bold tracking-[0.15em] text-gray-300 uppercase">No records found matching your search</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-50 bg-gray-50/30">
                      <th className="py-4 px-3 text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase w-2/5">Variety</th>
                      <th className="py-4 px-3 text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase text-center">Weight (Cts)</th>
                      <th className="py-4 px-3 text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase text-center">Qty</th>
                      <th className="py-4 px-3 text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStones.map((stone, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                        <td className="py-5 px-3 text-sm font-bold text-gray-700 capitalize group-hover:text-[#5A2B43]">
                          {stone.type || "Other Gemstone"}
                        </td>
                        <td className="py-5 px-3 text-sm text-gray-500 font-medium text-center">
                          {stone.weight?.toFixed(2) ?? "—"}
                        </td>
                        <td className="py-5 px-3 text-sm text-gray-500 font-medium text-center">
                          {stone.quantity ?? 0}
                        </td>
                        <td className="py-5 px-3 text-sm font-bold text-gray-700 text-right">
                          {(stone.amount || 0).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* RIGHT: DISTRIBUTION */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex-1">
                <div className="flex items-center justify-between mb-8">
                <h2 className="text-[14px] font-bold text-[#5A2B43] tracking-[0.1em] uppercase">Distribution</h2>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                </div>

                <div className="space-y-6">
                    {distributionData.length === 0 ? (
                        <p className="text-xs text-gray-300 italic">No distribution data</p>
                    ) : (
                        distributionData.slice(0, 10).map((item, index) => (
                            <div key={index} className="group">
                                <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2 group-hover:text-[#5A2B43] transition-colors">
                                    <span>{item.label}</span>
                                    <span>{item.percent}%</span>
                                </div>
                                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className="bg-[#5A2B43] h-full rounded-full transition-all duration-700 ease-out"
                                        style={{ width: `${item.percent}%`, opacity: 1 - index * 0.1 }}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="bg-[#5A2B43] p-6 rounded-xl shadow-lg flex items-center gap-4 text-white">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-[9px] font-bold tracking-[0.2em] opacity-60 uppercase mb-1">Authorization</p>
                <p className="text-[12px] font-bold tracking-widest uppercase">Verified Portfolio</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── TREND CHART SECTION ────────────────────────────────────────── */}
        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 mb-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
            <div>
              <h2 className="text-[14px] font-bold text-[#5A2B43] tracking-[0.1em] uppercase mb-2">Stone Sales Trend</h2>
              <p className="text-xs text-gray-400 font-medium">Visualization of revenue and inventory movement</p>
            </div>
            
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg self-end">
                    {['daily', 'weekly', 'monthly', 'yearly', 'custom'].map(ft => (
                        <button 
                            key={ft}
                            onClick={() => setFilter(ft)}
                            className={`px-4 py-2 text-[10px] font-bold tracking-widest uppercase rounded-md transition-all ${
                                filter === ft ? "bg-white text-[#5A2B43] shadow-sm" : "text-gray-400 hover:text-gray-600"
                            }`}
                        >
                            {ft}
                        </button>
                    ))}
                </div>

                {filter === "custom" && (
                    <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-[#5A2B43]" />
                            <input 
                                type="date" 
                                value={customRange.start} 
                                onChange={(e) => setCustomRange(p => ({...p, start: e.target.value}))}
                                className="text-[10px] font-bold border-none outline-none bg-transparent"
                            />
                        </div>
                        <span className="text-gray-300 text-xs">—</span>
                        <input 
                            type="date" 
                            value={customRange.end} 
                            onChange={(e) => setCustomRange(p => ({...p, end: e.target.value}))}
                            className="text-[10px] font-bold border-none outline-none bg-transparent"
                        />
                    </div>
                )}
            </div>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData.length ? chartData : [{name: 'No Data', revenue: 0, units: 0}]}>
                <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5A2B43" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#5A2B43" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 700, fill: '#9CA3AF'}} 
                    dy={10}
                />
                <YAxis 
                    yAxisId="left"
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 700, fill: '#9CA3AF'}}
                    tickFormatter={(val) => `₹${val >= 100000 ? (val/100000).toFixed(1) + 'L' : val}`}
                />
                <YAxis 
                    yAxisId="right"
                    orientation="right"
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 700, fill: '#9CA3AF'}}
                />
                <Tooltip 
                    cursor={{fill: '#F9FAFB'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Legend iconType="circle" />
                <Area yAxisId="left" type="monotone" dataKey="revenue" fill="url(#colorRev)" stroke="#5A2B43" strokeWidth={3} dot={{r: 4, fill: '#5A2B43'}} />
                <Bar yAxisId="right" dataKey="units" fill="#CDBDC6" radius={[4, 4, 0, 0]} barSize={40} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── FOOTER ────────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center border-t border-gray-100 pt-16">
          <h3 className="text-xl font-bold text-[#5A2B43] tracking-[0.2em] uppercase mb-4 italic">Analytical Laboratory</h3>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-8">© 2026 PRECISION DATA ENGINE. CONFIDENTIAL DOCUMENT.</p>
          <div className="flex gap-10 text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-12">
            <span className="hover:text-[#5A2B43] cursor-pointer transition-colors">Audit trail</span>
            <span className="hover:text-[#5A2B43] cursor-pointer transition-colors">Methodology</span>
            <span className="hover:text-[#5A2B43] cursor-pointer transition-colors">Systems Check</span>
          </div>
          <div className="flex items-center gap-3 h-px w-full max-w-[400px] bg-gray-100 relative">
             <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FCFAFB] px-4 text-[7px] text-gray-300 tracking-[1em] uppercase">EOF</div>
          </div>
        </div>

      </div>
    </div>
  );
}