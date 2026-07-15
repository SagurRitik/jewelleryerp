

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import DashboardStats from "./DashboardStats";
import DashboardCharts from "./DashboardCharts";
import RecentOrdersTable from "./RecentOrdersTable";
import TopSellingList from "./TopSellingList";
import SalesBreakdown from "./SalesBreakdown";
import { Calendar, ArrowLeft } from "lucide-react"; // Icon
import MetalTrendChart from "./MetalTrendChart";


export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handlePrint = () => {
  window.print();
};
  
  // ✅ GLOBAL FILTER STATE
  const [filterType, setFilterType] = useState("monthly"); // daily, weekly, monthly, yearly, custom
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  // useEffect(() => {
  //   const loadDashboard = async () => {
  //     try {
  //       setLoading(true);
  //        console.log("🔥 Dashboard component mounted");
        
  //       // Build Query String
  //       let query = `/dashboard/stats?filter=${filterType}`;
  //       if (filterType === "custom" && customRange.start && customRange.end) {
  //         query += `&startDate=${customRange.start}&endDate=${customRange.end}`;
  //       }

  //       const res = await API.get(query);
  //       setData(res.data);
  //     } catch (error) {
  //       console.error("Dashboard Load Failed", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   // Load data only if not 'custom' OR if 'custom' has both dates selected
  //   if (filterType !== "custom" || (customRange.start && customRange.end)) {
  //     loadDashboard();
  //   }
  // }, [filterType, customRange]);

  useEffect(() => {
  const loadDashboard = async () => {
    try {
      setLoading(true);

      let query = `/dashboard/stats?filter=${filterType}`;
      if (filterType === "custom" && customRange.start && customRange.end) {
        query += `&startDate=${customRange.start}&endDate=${customRange.end}`;
      }

      console.log("📡 API CALL:", query);

      const res = await API.get(query);

      console.log("✅ API RESPONSE:", res.data); // 👈 ADD THIS

      setData(res.data);
    } catch (error) {
      console.error("Dashboard Load Failed", error);
    } finally {
      setLoading(false);
    }
  };

  if (filterType !== "custom" || (customRange.start && customRange.end)) {
    loadDashboard();
  }
}, [filterType, customRange]);



  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f6]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#501b46] border-solid"></div>
      </div>
    );
  }

  const { stats, recentOrders, analytics, graphData } = data || {};

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      
      {/* --- HEADER & GLOBAL FILTER UI --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-200 text-gray-600 hover:text-[#501b46] hover:border-[#501b46]/20 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a1a]">Dashboard Overview</h1>
            <p className="text-gray-500 text-sm mt-1">
              Performance summary & analytics
            </p>
          </div>
        </div>

        {/* ✅ FILTER CONTROLS */}
        <div className="flex flex-wrap items-center gap-3">
           
           {/* Standard Filters */}
           <div className="flex bg-gray-100 p-1 rounded-lg">
              {['daily', 'weekly', 'monthly', 'yearly'].map(ft => (
                <button
                  key={ft}
                  onClick={() => setFilterType(ft)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${
                    filterType === ft ? "bg-white text-[#501b46] shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {ft}
                </button>
              ))}
              <button
                  onClick={() => setFilterType("custom")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${
                    filterType === "custom" ? "bg-white text-[#501b46] shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                  Custom
              </button>
           </div>

           {/* Custom Date Inputs (Visible only when 'custom' is selected) */}
           {filterType === "custom" && (
             <div className="flex items-center gap-2 animate-fadeIn">
               <input 
                 type="date" 
                 value={customRange.start}
                 onChange={(e) => setCustomRange(p => ({ ...p, start: e.target.value }))}
                 className="text-xs border p-1.5 rounded-md focus:outline-none focus:border-[#501b46]"
               />
               <span className="text-gray-400">-</span>
               <input 
                 type="date" 
                 value={customRange.end}
                 onChange={(e) => setCustomRange(p => ({ ...p, end: e.target.value }))}
                 className="text-xs border p-1.5 rounded-md focus:outline-none focus:border-[#501b46]"
               />
             </div>
           )}

           {/* Action Buttons */}
           <div className="h-6 w-px bg-gray-300 mx-2 hidden md:block"></div>
           <button
           onClick={handlePrint}
           className="px-4 py-2 bg-[#501b46] text-white text-sm font-medium rounded-lg hover:bg-[#3a1332] transition flex items-center gap-2">
             <Calendar size={16} /> Export Report
           </button>
        </div>
      </div>

      {/* 1. TOP STATS (These are usually lifetime or can be filtered too if backend supports) */}
      <DashboardStats stats={stats} />

      {/* 2. GRAPHS (Passed Data is already filtered by Backend) */}
      <DashboardCharts 
        salesData={graphData?.salesGraph} 
        categoryData={graphData?.categorySales}
      />

      {/* <MetalTrendChart data={graphData?.metalTrend} /> */}


      {/* 3. ANALYTICS BREAKDOWN (Metals, Diamonds, Stones - Auto Filtered) */}
      <SalesBreakdown analytics={analytics} filterLabel={filterType} />
      

      {/* 4. BOTTOM SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RecentOrdersTable orders={recentOrders} />
        </div>
        <div className="xl:col-span-1">
          <TopSellingList products={analytics?.topProducts} />
        </div>
      </div>

    </div>
  );
}