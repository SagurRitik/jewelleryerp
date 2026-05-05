import { useEffect, useState } from "react";
import { getOrderClosingSummary } from "../api/orderApi";

export default function OrderClosingReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    period: "today",
    date: "",
    startDate: "",
    endDate: "",
  });

  /* ================= FETCH DATA ================= */
  const fetchReport = async () => {
    try {
      setLoading(true);

      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      );

      const res = await getOrderClosingSummary(params);
      setData(res);
    } catch (err) {
      console.error("Order Closing Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [filters]);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center text-gray-500">
        Loading Order Analytics...
      </div>
    );
  }

  if (!data) return null;

  const { summary, dateRange } = data;

  return (
    <div className="p-6 space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Order Closing Report</h1>
          <p className="text-sm text-gray-500">
            Online + COD Orders Summary
          </p>
        </div>

        {/* FILTER */}
        <div className="flex gap-2">
          <select
            value={filters.period}
            onChange={(e) =>
              setFilters({ period: e.target.value })
            }
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="today">Today</option>
            <option value="date">Specific Date</option>
            <option value="custom">Custom Range</option>
          </select>

          {filters.period === "date" && (
            <input
              type="date"
              onChange={(e) =>
                setFilters({ period: "date", date: e.target.value })
              }
              className="border rounded-md px-3 py-2 text-sm"
            />
          )}
        </div>
      </div>

      {/* ================= DATE INFO ================= */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          📅 {dateRange.start === dateRange.end
            ? `Date: ${dateRange.start}`
            : `Date Range: ${dateRange.start} to ${dateRange.end}`}
        </p>
      </div>

      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Kpi title="Total Orders" value={summary.totalOrders} />
        <Kpi title="Total Sale" value={summary.totalSale} />
        <Kpi title="GST Collected" value={summary.gst} />
        <Kpi title="Online Sales" value={summary.online} />
        <Kpi title="COD Sales" value={summary.cod} />
      </div>

      {/* ================= EXPLANATION ================= */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold">How Order Analytics Works</h3>

        <ul className="text-sm text-gray-600 space-y-2 list-disc ml-5">
          <li>
            <b>Total Sale</b> = Orders ka final grand total (GST included)
          </li>
          <li>
            <b>GST</b> = Product GST + Making GST
          </li>
          <li>
            <b>Net Sale</b> = Total Sale – GST
          </li>
          <li>
            <b>Online</b> = UPI / Card / Net Banking Orders
          </li>
          <li>
            <b>COD</b> = Cash on Delivery Orders
          </li>
        </ul>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm">
          <b>Net Sale (Business Income):</b>{" "}
          <span className="text-green-600 font-semibold">
            ₹{Number(summary.netSale).toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ================= KPI CARD ================= */
function Kpi({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-xl font-bold mt-1">
        ₹{Number(value || 0).toLocaleString("en-IN")}
      </p>
    </div>
  );
}
