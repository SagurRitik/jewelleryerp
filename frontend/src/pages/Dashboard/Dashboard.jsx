

import { useEffect, useState } from "react";
import API from "../../api";
import DashboardStats from "./DashboardStats";
import DashboardCharts from "./DashboardCharts";
import RecentOrdersTable from "./RecentOrdersTable";
import TopSellingList from "./TopSellingList";
import SalesBreakdown from "./SalesBreakdown";
import { Calendar, ChevronDown, Download, Printer } from "lucide-react"; // Icon
import * as XLSX from "xlsx";
import MetalTrendChart from "./MetalTrendChart";


export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  const handlePrint = () => {
    setExportDropdownOpen(false);
    window.print();
  };

  const handleExportExcel = () => {
    setExportDropdownOpen(false);
    if (!data) return;
    try {
      const { stats, recentOrders, analytics } = data;

      // 1. Prepare Overview Sheet Data
      const overviewData = [
        ["DASHBOARD OVERVIEW REPORT"],
        ["Filter Period:", filterType.toUpperCase()],
        ...(filterType === "custom" && customRange.start && customRange.end
          ? [["Date Range:", `${customRange.start} to ${customRange.end}`]]
          : []),
        ["Generated On:", new Date().toLocaleString("en-IN")],
        [],
        ["KEY PERFORMANCE INDICATORS (KPIs)"],
        ["Metric", "Value"],
        ["Total Revenue", stats?.totalRevenue || 0],
        ["Total Orders", stats?.totalOrders || 0],
        ["Inventory Items", stats?.inventoryItems || 0],
        ["Average Order Value", Math.round(stats?.avgOrderValue || 0)],
        [],
        ["METAL SALES SUMMARY"],
        ["Metal", "Weight (g)", "Revenue (₹)"],
        ...(analytics?.metalSales || []).map(m => [m._id, m.totalWeight || 0, m.totalRevenue || 0]),
        [],
        ["DIAMOND ANALYSIS SUMMARY"],
        ["Total Carats", analytics?.diamondStats?.totalCarats || 0],
        ["Total Sales (Items)", analytics?.diamondStats?.sales || 0],
        [],
        ["STONE SALES SUMMARY"],
        ["Stone Type", "Weight (cts)"],
        ...(analytics?.topStones || []).map(s => [s.type || "Unknown", s.weight || 0])
      ];

      // 2. Prepare Recent Orders Sheet Data
      const recentOrdersData = [
        ["RECENT PURCHASE ORDERS"],
        ["Generated On:", new Date().toLocaleString("en-IN")],
        [],
        ["Invoice No", "Customer Name", "Amount (₹)", "Status", "Date"],
        ...(recentOrders || []).map(o => [
          o.invoiceNo,
          o.customer?.name || "N/A",
          o.totals?.grandTotal || 0,
          o.payment?.status || "N/A",
          new Date(o.createdAt).toLocaleDateString("en-IN")
        ])
      ];

      // 3. Prepare Top Products Sheet Data
      const topProductsData = [
        ["TOP SELLING PRODUCTS"],
        ["Generated On:", new Date().toLocaleString("en-IN")],
        [],
        ["Rank", "Product Name", "Sales (Qty)", "Revenue (₹)"],
        ...(analytics?.topProducts || []).map((p, idx) => [
          idx + 1,
          p._id,
          p.sales || 0,
          p.revenue || 0
        ])
      ];

      // Create worksheets
      const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
      const wsOrders = XLSX.utils.aoa_to_sheet(recentOrdersData);
      const wsProducts = XLSX.utils.aoa_to_sheet(topProductsData);

      // Adjust column widths for better readability
      wsOverview["!cols"] = [{ wch: 25 }, { wch: 20 }, { wch: 20 }];
      wsOrders["!cols"] = [{ wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 15 }];
      wsProducts["!cols"] = [{ wch: 8 }, { wch: 30 }, { wch: 12 }, { wch: 15 }];

      // Create Workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsOverview, "Overview");
      XLSX.utils.book_append_sheet(wb, wsOrders, "Recent Orders");
      XLSX.utils.book_append_sheet(wb, wsProducts, "Top Products");

      // Generate filename based on date/filter
      const dateString = new Date().toISOString().slice(0, 10);
      const filename = `Dashboard_Report_${filterType}_${dateString}.xlsx`;

      // Trigger download
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error("Failed to export Excel report:", error);
      alert("Error exporting report to Excel");
    }
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
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-1">
            Performance summary & analytics
          </p>
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
            <div className="relative">
              <button
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                className="px-4 py-2 bg-[#501b46] text-white text-sm font-medium rounded-lg hover:bg-[#3a1332] transition flex items-center gap-2"
              >
                <Download size={16} /> Export Report <ChevronDown size={14} />
              </button>

              {exportDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setExportDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-20 animate-fadeIn">
                    <button
                      onClick={handlePrint}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-[#501b46] flex items-center gap-2 transition"
                    >
                      <Printer size={16} /> Print Report
                    </button>
                    <button
                      onClick={handleExportExcel}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-[#501b46] flex items-center gap-2 transition"
                    >
                      <Download size={16} /> Export as Excel
                    </button>
                  </div>
                </>
              )}
            </div>
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