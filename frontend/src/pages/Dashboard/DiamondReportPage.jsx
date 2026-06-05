import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../../api";
import {
  Download, Hexagon, Square, Pentagon, Activity
} from "lucide-react";
import BackButton from "../../components/BackButton";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

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

  const [data, setData] = useState(state || {});
  const [filter, setFilter] = useState(state?.filterLabel || "monthly");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(!state);

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

  const diamondStats = data.analytics?.diamondStats || {};
  const diamondDetails = data.analytics?.diamondDetails || [];
  const diamondTrend = data.graphData?.diamondTrend || [];
  const sizeAnalysis = data.analytics?.diamondSizeAnalysis || [];

  const eyebrowText = filter === "custom"
    ? "CUSTOM ANALYSIS"
    : filter === "daily" ? "DAILY ANALYSIS"
      : filter === "weekly" ? "WEEKLY ANALYSIS"
        : filter === "monthly" ? "MONTHLY ANALYSIS"
          : "QUARTERLY ANALYSIS";

  const getIconForType = (index) => {
    const iconClass = "text-[#622A46]";
    if (index % 3 === 0) return <Hexagon className={iconClass} size={18} fill="#622A46" />;
    if (index % 3 === 1) return <Square className={iconClass} size={16} fill="#622A46" />;
    return <Pentagon className={iconClass} size={18} fill="#622A46" />;
  };

  // Format trend data for Recharts
  const chartData = diamondTrend.map(item => {
    let label = item._id; 
    if (label.includes("-") && label.length === 10) {
        const date = new Date(label);
        label = date.toLocaleString('default', { day: 'numeric', month: 'short' });
    } else if (label.includes("-") && label.length === 7) {
        const [y, m] = label.split("-");
        const date = new Date(y, m - 1);
        label = date.toLocaleString('default', { month: 'short' });
    }
    return { name: label, carats: item.totalCarats };
  });

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

      <nav className="py-2 border-b border-gray-100 bg-white/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-6">
          <BackButton />
        </div>
      </nav>

      {/* ================= MAIN CONTENT ================= */}
      <div className="max-w-[1200px] mx-auto px-6 mt-8">

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
          <div className="bg-[#F8F5F6] rounded-xl p-10 flex flex-col justify-center shadow-sm">
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

          {/* Right Card: Trend Chart - NOW POWERED BY RECHARTS */}
          <div className="lg:col-span-2 bg-[#F8F5F6] rounded-xl p-10 flex flex-col shadow-sm">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-xl font-bold text-[#622A46]">Diamond Trend</h2>
                <p className="text-xs text-gray-500 mt-1">Carat volume analysis</p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 bg-white/50 p-1 rounded-lg">
                {["daily", "weekly", "monthly", "yearly"].map((ft) => (
                  <button
                    key={ft}
                    onClick={() => setFilter(ft)}
                    className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                      filter === ft ? "bg-[#622A46] text-white shadow-md" : "text-gray-400 hover:text-[#622A46]"
                    }`}
                  >
                    {ft}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[220px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.length ? chartData : [{name: 'No Data', carats: 0}]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 700, fill: '#9CA3AF'}} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 700, fill: '#9CA3AF'}}
                    tickFormatter={(val) => `${val}ct`}
                  />
                  <Tooltip 
                    cursor={{fill: '#F3F4F6'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="carats" radius={[4, 4, 0, 0]} barSize={32}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.carats === Math.max(...chartData.map(d => d.carats)) ? '#622A46' : '#B49EAA'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
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

          <div className="w-full overflow-hidden rounded-xl border border-gray-100 shadow-sm">
            <div className="grid grid-cols-5 bg-[#F8F5F6] px-6 py-4 border-b border-gray-100">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest col-span-2">Cut Type</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Quantity</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Avg Carat</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Market Value</div>
            </div>

            {diamondDetails.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-400 border-b border-gray-100 bg-white">No records found.</div>
            ) : (
              diamondDetails.map((row, i) => {
                const avgCarat = row.quantity > 0 ? (row.carats / row.quantity).toFixed(2) : row.carats;
                const subGrade = row.type?.toLowerCase().includes("round") ? "Premium Grade" : row.type?.toLowerCase().includes("princess") ? "Commercial Grade" : "High Clarity";

                return (
                  <div key={i} className="grid grid-cols-5 items-center px-6 py-5 border-b border-gray-100 hover:bg-gray-50 transition-colors bg-white">
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

        {/* ================= CARAT DISTRIBUTION TABLE - NOW REAL DATA ================= */}
        <div className="mb-16">
          <p className="text-[11px] font-bold tracking-[0.15em] text-gray-500 uppercase mb-2">
            Carat Distribution
          </p>
          <h2 className="text-[28px] font-bold text-[#622A46] tracking-tight mb-6">
            Diamond Size Analysis (Slabs)
          </h2>

          <div className="w-full overflow-hidden rounded-xl border border-gray-100 shadow-sm">
            <div className="grid grid-cols-5 bg-[#F8F5F6] px-6 py-4 border-b border-gray-100">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Carat Range</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Quantity</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Total Carats</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Sales Value</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Avg Rate/ct</div>
            </div>

            {sizeAnalysis.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400 bg-white">No slab data available.</div>
            ) : (
                sizeAnalysis.map((row, index) => (
                    <div key={index} className="grid grid-cols-5 items-center px-6 py-5 border-b border-gray-100 bg-white hover:bg-gray-50 transition-colors">
                      <div className="text-sm font-bold text-[#333]">{row.range}</div>
                      <div className="text-sm font-bold text-[#333] text-center">{row.quantity}</div>
                      <div className="text-sm font-medium text-gray-600 text-center">{row.weight} ct</div>
                      <div className="text-sm font-bold text-[#622A46] text-center">₹{row.amount?.toLocaleString("en-IN")}</div>
                      <div className="text-sm font-medium text-gray-600 text-right">₹{row.avgRate?.toLocaleString("en-IN")}/ct</div>
                    </div>
                ))
            )}
          </div>
        </div>

      </div>

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