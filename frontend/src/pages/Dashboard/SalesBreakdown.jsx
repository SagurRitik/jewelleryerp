
import { Gem, Layers, Diamond } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SalesBreakdown({ analytics = {}, filterLabel }) {
  const {
    metalSales = [],
    diamondStats = {},
    topStones = [],
  } = analytics;

  const navigate = useNavigate();

  // ✅ SAFE FILTER
  const safeFilter = filterLabel || "monthly";

  // ✅ FIXED PERIOD TEXT (ACCURATE)
  const periodText =
    safeFilter === "monthly"
      ? "in last 12 months"
      : safeFilter === "weekly"
      ? "in last 12 weeks"
      : safeFilter === "daily"
      ? "in last 30 days"
      : safeFilter === "yearly"
      ? "in last 5 years"
      : "in selected range";

  return (
    <div className="space-y-8 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* ================= METAL ================= */}
        <div className="bg-white p-5 rounded-xl  shadow-sm hover:shadow-md transition">
          
          {/* HEADER */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg">
                <Layers size={20} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800">
                  Metal Sales
                </h4>
                <p className="text-xs text-gray-400 capitalize">
                  {safeFilter}
                </p>
              </div>
            </div>

            {/* ✅ FIX: PASS DATA */}
            <button
              onClick={() =>
                navigate("/reports/metals", {
                  state: {
                    analytics,
                    filterLabel: safeFilter,
                  },
                })
              }
              className="text-xs text-yellow-700 hover:underline"
            >
              View →
            </button>
          </div>

          {/* CONTENT */}
          {metalSales.length === 0 ? (
            <p className="text-gray-400 text-sm italic">
              No metal sales {periodText}
            </p>
          ) : (
            <div className="space-y-3">
              {metalSales.map((metal, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm font-medium">
                    {metal._id}
                  </span>

                  <div className="text-right">
                    <p className="text-xs font-bold">
                      {metal.totalWeight?.toFixed(2)} g
                    </p>
                    <p className="text-[10px] text-gray-400">
                      ₹{metal.totalRevenue?.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================= DIAMOND ================= */}
        <div className="bg-white p-5 rounded-xl  shadow-sm hover:shadow-md transition">

          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                <Diamond size={20} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800">
                  Diamond Analysis
                </h4>
                <p className="text-xs text-gray-400 capitalize">
                  {safeFilter}
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                navigate("/reports/diamonds", {
                  state: {
                    analytics,
                    filterLabel: safeFilter,
                  },
                })
              }
              className="text-xs text-blue-600 hover:underline"
            >
              View →
            </button>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <p className="text-xs text-blue-600 uppercase">
              Total Carats
            </p>
            <p className="text-3xl font-bold text-blue-900">
              {diamondStats.totalCarats?.toFixed(2) || 0}
            </p>
            <p className="text-xs text-blue-400">{periodText}</p>
          </div>

          <div className="flex justify-between mt-4 text-sm">
            <span className="text-gray-500">Items:</span>
            <span className="font-bold">
              {diamondStats.sales || 0}
            </span>
          </div>
        </div>

        {/* ================= STONES ================= */}
        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition">

          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 text-red-700 rounded-lg">
                <Gem size={20} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800">
                  Top Stones
                </h4>
                <p className="text-xs text-gray-400 capitalize">
                  {safeFilter}
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                navigate("/reports/stones", {
                  state: {
                    analytics,
                    filterLabel: safeFilter,
                  },
                })
              }
              className="text-xs text-red-600 hover:underline"
            >
              View →
            </button>
          </div>

          {topStones.length === 0 ? (
            <p className="text-gray-400 text-sm italic">
              No stone sales {periodText}
            </p>
          ) : (
            <div className="space-y-3">
              {topStones.map((stone, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm capitalize">
                    {stone.type}
                  </span>

                  {/* <span className="text-xs font-bold">
                    {stone.totalWeight?.toFixed(2)} cts
                  </span> */}
                  <span className="text-xs font-bold">
                  {stone.weight?.toFixed(2) || 0} cts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}