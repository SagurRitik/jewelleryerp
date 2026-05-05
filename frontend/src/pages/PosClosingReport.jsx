import { useState, useEffect } from "react";
import DailyPosClosingUI from "../components/DailyPosClosing";
import PosSummaryCards from "../components/PosSummaryCards.jsx";
import { getPosClosingSummary } from "../api/posInvoiceApi";

export default function PosClosingReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    period: "today",
    startDate: "",
    endDate: "",
    date: ""
  });

  // Initial data fetch on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch data whenever filters change
  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Remove empty filter values
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== "")
      );
      
      const res = await getPosClosingSummary(params);
      setData(res);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching POS summary:", error);
      setLoading(false);
    }
  };

  const handlePeriodChange = (e) => {
    const period = e.target.value;
    setFilters({
      period,
      // Reset custom dates when switching to predefined periods
      startDate: period === "custom" ? filters.startDate : "",
      endDate: period === "custom" ? filters.endDate : "",
      date: period === "date" ? filters.date : ""
    });
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReset = () => {
    setFilters({
      period: "today",
      startDate: "",
      endDate: "",
      date: ""
    });
  };

  const handleRefresh = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading closing report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">POS Closing Report</h1>
          <p className="text-gray-600">View and analyze your sales performance</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Report</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Period
            </label>
            <select
              value={filters.period}
              onChange={handlePeriodChange}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week (Last 7 Days)</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="lastweek">Last Week</option>
              <option value="lastmonth">Last Month</option>
              <option value="date">Specific Date</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Specific Date Picker */}
          {filters.period === "date" && (
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Date
              </label>
              <input
                type="date"
                name="date"
                value={filters.date}
                onChange={handleDateChange}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Custom Date Range */}
          {filters.period === "custom" && (
            <>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleDateChange}
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleDateChange}
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
            <button
              onClick={fetchData}
              className="px-4 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Date Range Display */}
      {data && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                POS Closing Summary
              </h2>
              <p className="text-gray-600">
                {data.dateRange ? (
                  <>
                    {data.dateRange.start === data.dateRange.end
                      ? `Date: ${data.dateRange.start}`
                      : `Date Range: ${data.dateRange.start} to ${data.dateRange.end}`}
                  </>
                ) : (
                  `Date: ${data.date}`
                )}
              </p>
            </div>
            <span className="mt-2 md:mt-0 text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
              {data.period === "custom" ? "Custom Range" : 
               data.period === "date" ? "Specific Date" :
               data.period.charAt(0).toUpperCase() + data.period.slice(1)}
            </span>
          </div>
        </div>
      )}

      {/* Main Report Data */}
      {data && (
        <>
          {/* Summary Cards */}
          <PosSummaryCards summary={data.summary} />
          
          {/* Detailed Table View */}
          {/* <div className="mb-8">
            <DailyPosClosingUI data={data.summary} />
          </div> */}
          
          {/* Daily Breakup Table for Date Ranges */}
          {data.summary.dailyBreakup && data.summary.dailyBreakup.length > 0 && (
            <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  Daily Breakdown
                </h3>
                <span className="text-sm text-gray-500">
                  {data.summary.dailyBreakup.length} days
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoices
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Sale
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cash
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        UPI
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Card
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        GST
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.summary.dailyBreakup.map((day, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {day.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {day.invoices}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          ₹{day.totalSale.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{day.cash.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{day.upi.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{day.card.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{day.bank.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{day.gst.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    
                    {/* Total Row */}
                    <tr className="bg-gray-50 font-medium">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        Total
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {data.summary.totalInvoices}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                        ₹{data.summary.totalSale.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        ₹{data.summary.cash.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        ₹{data.summary.upi.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        ₹{data.summary.card.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        ₹{data.summary.bank.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                        ₹{data.summary.gst.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}