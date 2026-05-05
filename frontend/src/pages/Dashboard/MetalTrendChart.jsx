
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

// export default function MetalTrendChart({ data = [] }) {

//   // ✅ Safe transform
//   const formatted = (data || []).map((item) => {
//     const row = {
//       name: formatLabel(item._id),
//       GOLD: 0,
//       SILVER: 0,
//       PLATINUM: 0,
//       OTHER: 0,
//     };

//     (item.metals || []).forEach((m) => {
//       row[m.metal] = Number((m.weight || 0).toFixed(2));
//     });

//     return row;
//   });

//   // ✅ Format date label nicely
//   function formatLabel(label) {
//     if (!label) return "";

//     // Daily format (2026-02-12)
//     if (label.length === 10) {
//       const date = new Date(label);
//       return date.toLocaleDateString("default", {
//         day: "numeric",
//         month: "short",
//       });
//     }

//     // Monthly (2026-02)
//     if (label.length === 7) {
//       const [y, m] = label.split("-");
//       const date = new Date(y, m - 1);
//       return date.toLocaleDateString("default", {
//         month: "short",
//         year: "2-digit",
//       });
//     }

//     return label; // weekly / yearly fallback
//   }

//   return (
//     <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
//       <div className="mb-6">
//         <h3 className="text-xl font-bold text-gray-900 mb-1">
//           Metal Weight Trend
//         </h3>
//         <p className="text-sm text-gray-500">
//           Gold • Silver • Platinum (grams)
//         </p>
//       </div>

//       <div className="h-[320px] w-full">
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart data={formatted.length ? formatted : [{ name: "No Data" }]}>
//             <CartesianGrid strokeDasharray="3 3" />

//             <XAxis dataKey="name" />
//             <YAxis tickFormatter={(val) => `${val}g`} />

//             <Tooltip
//               formatter={(value, name) => [`${value} g`, name]}
//             />

//             <Line
//               type="monotone"
//               dataKey="GOLD"
//               stroke="#D4AF37"
//               strokeWidth={3}
//               dot={false}
//             />
//             <Line
//               type="monotone"
//               dataKey="SILVER"
//               stroke="#9CA3AF"
//               strokeWidth={3}
//               dot={false}
//             />
//             <Line
//               type="monotone"
//               dataKey="PLATINUM"
//               stroke="#6B7280"
//               strokeWidth={3}
//               dot={false}
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }


// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   Legend,
// } from "recharts";

// export default function MetalTrendChart({ data = [] }) {

//   // =========================
//   // FORMAT TREND DATA
//   // =========================
//   const formatted = (data || []).map((item) => {
//     const row = {
//       name: formatLabel(item._id),
//       GOLD: 0,
//       SILVER: 0,
//       PLATINUM: 0,
//       OTHER: 0,
//     };

//     (item.metals || []).forEach((m) => {
//       row[m.metal] = Number((m.weight || 0).toFixed(2));
//     });

//     return row;
//   });

//   // =========================
//   // FORMAT LABEL
//   // =========================
//   function formatLabel(label) {
//     if (!label) return "";

//     if (label.length === 10) {
//       const date = new Date(label);
//       return date.toLocaleDateString("default", {
//         day: "numeric",
//         month: "short",
//       });
//     }

//     if (label.length === 7) {
//       const [y, m] = label.split("-");
//       const date = new Date(y, m - 1);
//       return date.toLocaleDateString("default", {
//         month: "short",
//         year: "2-digit",
//       });
//     }

//     return label;
//   }

//   // =========================
//   // TOTAL METAL CALCULATION
//   // =========================
//   const totalByMetal = {};

//   (data || []).forEach((item) => {
//     (item.metals || []).forEach((m) => {
//       if (!totalByMetal[m.metal]) totalByMetal[m.metal] = 0;
//       totalByMetal[m.metal] += Number(m.weight || 0);
//     });
//   });

//   // =========================
//   // PURITY BREAKDOWN
//   // =========================
//   const purityBreakdown = {};

//   (data || []).forEach((item) => {
//     (item.metals || []).forEach((m) => {
//       const key = `${m.metal}-${m.purity || "OTHER"}`;

//       if (!purityBreakdown[key]) {
//         purityBreakdown[key] = 0;
//       }

//       purityBreakdown[key] += Number(m.weight || 0);
//     });
//   });

//   const purityData = Object.entries(purityBreakdown).map(([key, value]) => {
//     const [metal, purity] = key.split("-");
//     return {
//       metal,
//       purity,
//       weight: Number(value.toFixed(2)),
//     };
//   });

//   const goldPurity = purityData.filter((d) => d.metal === "GOLD");

//   return (
//     <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">

//       {/* =========================
//           HEADER
//       ========================= */}
//       <div className="mb-6">
//         <h3 className="text-xl font-bold text-gray-900 mb-1">
//           Metal Analytics Dashboard
//         </h3>
//         <p className="text-sm text-gray-500">
//           Trends • Distribution • Purity Breakdown
//         </p>
//       </div>

//       {/* =========================
//           TOTAL METAL CARDS
//       ========================= */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//         {Object.entries(totalByMetal).map(([metal, value]) => (
//           <div
//             key={metal}
//             className="p-4 bg-gray-50 rounded-xl border border-gray-100"
//           >
//             <p className="text-xs text-gray-500 mb-1">{metal}</p>
//             <p className="text-xl font-bold text-gray-900">
//               {value.toFixed(2)} g
//             </p>
//           </div>
//         ))}
//       </div>

//       {/* =========================
//           TREND CHART
//       ========================= */}
//       <div className="h-[320px] w-full mb-10">
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart data={formatted.length ? formatted : [{ name: "No Data" }]}>
//             <CartesianGrid strokeDasharray="3 3" />

//             <XAxis dataKey="name" />
//             <YAxis tickFormatter={(val) => `${val}g`} />

//             <Tooltip formatter={(value, name) => [`${value} g`, name]} />

//             <Line
//               type="monotone"
//               dataKey="GOLD"
//               stroke="#D4AF37"
//               strokeWidth={3}
//               dot={false}
//             />
//             <Line
//               type="monotone"
//               dataKey="SILVER"
//               stroke="#9CA3AF"
//               strokeWidth={3}
//               dot={false}
//             />
//             <Line
//               type="monotone"
//               dataKey="PLATINUM"
//               stroke="#6B7280"
//               strokeWidth={3}
//               dot={false}
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>

//       {/* =========================
//           GOLD PURITY CHART
//       ========================= */}
//       <div>
//         <h4 className="text-lg font-semibold mb-4">
//           Gold Purity Breakdown
//         </h4>

//         <div className="h-[300px]">
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart data={goldPurity.length ? goldPurity : [{ purity: "No Data", weight: 0 }]}>
//               <CartesianGrid strokeDasharray="3 3" />

//               <XAxis dataKey="purity" />
//               <YAxis tickFormatter={(val) => `${val}g`} />

//               <Tooltip formatter={(val) => `${val} g`} />
//               <Legend />

//               <Bar dataKey="weight" fill="#D4AF37" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </div>
//   );
// }











import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export default function MetalTrendChart({ data = [] }) {

  // =========================
  // GET UNIQUE METALS (dynamic)
  // =========================
  const metalsSet = new Set();

  (data || []).forEach((item) => {
    (item.metals || []).forEach((m) => {
      metalsSet.add(m.metal);
    });
  });

  const metals = Array.from(metalsSet);

  // =========================
  // FORMAT TREND DATA (FIXED 🔥)
  // =========================
  const formatted = (data || []).map((item) => {
    const row = {
      name: formatLabel(item._id),
    };

    metals.forEach((metal) => {
      row[metal] = 0;
    });

    (item.metals || []).forEach((m) => {
      row[m.metal] += Number(m.weight || 0); // ✅ FIX (+= instead of =)
    });

    return row;
  });

  // =========================
  // FORMAT LABEL
  // =========================
  function formatLabel(label) {
    if (!label) return "";

    if (label.length === 10) {
      const date = new Date(label);
      return date.toLocaleDateString("default", {
        day: "numeric",
        month: "short",
      });
    }

    if (label.length === 7) {
      const [y, m] = label.split("-");
      const date = new Date(y, m - 1);
      return date.toLocaleDateString("default", {
        month: "short",
        year: "2-digit",
      });
    }

    return label;
  }

  // =========================
  // TOTAL METAL CALCULATION
  // =========================
  const totalByMetal = {};

  (data || []).forEach((item) => {
    (item.metals || []).forEach((m) => {
      if (!totalByMetal[m.metal]) totalByMetal[m.metal] = 0;
      totalByMetal[m.metal] += Number(m.weight || 0);
    });
  });

  // =========================
  // PURITY BREAKDOWN
  // =========================
  const purityBreakdown = {};

  (data || []).forEach((item) => {
    (item.metals || []).forEach((m) => {
      const key = `${m.metal}-${m.purity || "OTHER"}`;

      if (!purityBreakdown[key]) {
        purityBreakdown[key] = 0;
      }

      purityBreakdown[key] += Number(m.weight || 0);
    });
  });

  const purityData = Object.entries(purityBreakdown).map(([key, value]) => {
    const [metal, purity] = key.split("-");
    return {
      metal,
      purity,
      weight: Number(value.toFixed(2)),
    };
  });

  const goldPurity = purityData.filter((d) => d.metal === "GOLD");

  const hasData = formatted.length > 0;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">

      HEADER
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          Metal Analytics Dashboard
        </h3>
        <p className="text-sm text-gray-500">
          Trends • Distribution • Purity Breakdown
        </p>
      </div>

      {/* TOTAL CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Object.keys(totalByMetal).length === 0 ? (
          <p className="col-span-full text-gray-400 text-sm italic text-center">
            No metal data available
          </p>
        ) : (
          Object.entries(totalByMetal).map(([metal, value]) => (
            <div
              key={metal}
              className="p-4 bg-gray-50 rounded-xl border border-gray-100"
            >
              <p className="text-xs text-gray-500 mb-1">{metal}</p>
              <p className="text-xl font-bold text-gray-900">
                {value.toFixed(2)} g
              </p>
            </div>
          ))
        )}
      </div>

      {/* TREND CHART */}
      <div className="h-[320px] w-full mb-10">
        {!hasData ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            No trend data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formatted}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />
              <YAxis tickFormatter={(val) => `${val}g`} />

              <Tooltip formatter={(value, name) => [`${value} g`, name]} />
              <Legend />

              {metals.map((metal, i) => (
                <Line
                  key={metal}
                  type="monotone"
                  dataKey={metal}
                  strokeWidth={3}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* GOLD PURITY CHART */}
      <div>
        <h4 className="text-lg font-semibold mb-4">
          Gold Purity Breakdown
        </h4>

        <div className="h-[300px]">
          {goldPurity.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              No gold purity data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={goldPurity}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="purity" />
                <YAxis tickFormatter={(val) => `${val}g`} />

                <Tooltip formatter={(val) => `${val} g`} />
                <Legend />

                <Bar dataKey="weight" fill="#D4AF37" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}