

// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   getStoneRates,
//   toggleStoneRate,
// } from "../../../api/stoneRateApi";

// export default function StoneRateList() {
//   const [rates, setRates] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   const loadRates = async () => {
//     try {
//       const res = await getStoneRates();
//       setRates(res.data?.rates || []);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to load stone rates");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadRates();
//   }, []);

//   const disableRate = async (rate) => {
//     if (!window.confirm("Disable this stone rate slab?")) return;

//     try {
//       await toggleStoneRate(rate._id, false);
//       loadRates();
//     } catch (err) {
//       alert("Failed to disable stone rate");
//     }
//   };

//   if (loading) return <div className="p-6">Loading…</div>;

//   return (
//     <div className="p-6 space-y-4">

//       {/* HEADER */}
//       <div className="flex justify-between items-center">
//         <h1 className="text-xl font-bold">🪨 Stone Rate Master</h1>

//         <button
//           onClick={() => navigate("/admin/stone-rates/new")}
//           className="px-4 py-2 bg-black text-white rounded"
//         >
//           + Add Stone Rate
//         </button>
//       </div>

//       {/* TABLE */}
//       {rates.length === 0 ? (
//         <div className="text-gray-500 text-sm">
//           No stone rates configured yet.
//         </div>
//       ) : (
//         <div className="overflow-x-auto border rounded-lg">
//           <table className="w-full text-sm">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="p-2">Stone Type</th>
//                 <th className="p-2">Shape</th>
//                 <th className="p-2">Weight (ct)</th>
//                 <th className="p-2">Rate</th>
//                 <th className="p-2">Rate Type</th>
//                 <th className="p-2">Status</th>
//                 <th className="p-2">Actions</th>
//               </tr>
//             </thead>

//             <tbody>
//               {rates.map((r) => (
//                 <tr key={r._id} className="border-t">
//                   <td className="p-2 font-medium">{r.stoneType}</td>
//                   <td className="p-2">{r.shape || "-"}</td>
//                   <td className="p-2">
//                     {r.weightFrom} – {r.weightTo}
//                   </td>
//                   <td className="p-2 font-semibold">₹ {r.rate}</td>
//                   <td className="p-2">{r.rateType}</td>
//                   <td className="p-2">
//                     {r.active ? "🟢 Active" : "⚪ Inactive"}
//                   </td>
//                   <td className="p-2 space-x-2">
//                     <button
//                       onClick={() =>
//                         navigate(`/admin/stone-rates/${r._id}/edit`)
//                       }
//                       className="px-2 py-1 text-xs border rounded"
//                     >
//                       Edit
//                     </button>

//                     {r.active && (
//                       <button
//                         onClick={() => disableRate(r)}
//                         className="px-2 py-1 text-xs bg-red-600 text-white rounded"
//                       >
//                         Disable
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  getStoneRates,
  deleteStoneRate,
} from "../../../api/stoneRateApi";

export default function StoneRateList() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadRates = async () => {
    try {
      const res = await getStoneRates();
      setRates(res.data?.rates || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load stone rates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRates();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this stone rate slab?"))
      return;

    try {
      await deleteStoneRate(id);
      loadRates();
    } catch (err) {
      alert("Failed to delete stone rate");
    }
  };

  if (loading)
    return <div className="p-6 text-gray-500">Loading stone rates...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 text-gray-600 hover:text-blue-600 hover:border-blue-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            🪨 Stone Rate Master
          </h1>
        </div>

        <button
          onClick={() => navigate("/admin/stone-rates/new")}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
        >
          + Add Stone Rate
        </button>
      </div>

      {rates.length === 0 ? (
        <div className="text-gray-500 text-sm bg-white p-6 rounded-lg shadow">
          No stone rates configured yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="p-4 text-left">Stone Type</th>
                <th className="p-4 text-left">Shape</th>
                <th className="p-4 text-left">Weight (ct)</th>
                <th className="p-4 text-left">Rate</th>
                <th className="p-4 text-left">Rate Type</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {rates.map((r) => (
                <tr
                  key={r._id}
                  className="border-b hover:bg-blue-50 transition duration-150"
                >
                  <td className="p-4 font-medium">{r.stoneType}</td>

                  <td className="p-4">{r.shape || "All"}</td>

                  <td className="p-4">
                    {r.weightFrom} – {r.weightTo}
                  </td>

                  <td className="p-4 font-bold text-emerald-600">
                    ₹ {r.rate.toLocaleString()}
                  </td>

                  <td className="p-4 capitalize">
                    {r.rateType === "PER_CT" ? "Per Carat" : "Per Piece"}
                  </td>

                  <td className="p-4">
                    {r.active ? (
                      <span className="inline-flex items-center gap-2 text-green-600 font-medium">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-gray-400">
                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                        Inactive
                      </span>
                    )}
                  </td>

                  <td className="p-4 space-x-2">
                    <button
                      onClick={() =>
                        navigate(`/admin/stone-rates/${r._id}/edit`)
                      }
                      className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(r._id)}
                      className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}