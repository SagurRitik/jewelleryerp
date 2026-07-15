

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  getDiamondRates,
  deleteDiamondRate,
} from "../../../api/diamondRateApi";
import { DIAMOND_COLORS as COLOR_RANK, DIAMOND_CLARITIES as CLARITY_RANK } from "../../../utils/diamondConstants";

export default function DiamondRateList() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  const loadRates = async () => {
    try {
      const res = await getDiamondRates();
      setRates(res.data?.rates || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load diamond rates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRates();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this rate slab?"))
      return;

    try {
      await deleteDiamondRate(id);
      loadRates();
    } catch (err) {
      alert("Failed to delete rate");
    }
  };

  if (loading)
    return <div className="p-6 text-gray-500">Loading diamond rates...</div>;

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
            💎 Diamond Rate Master
          </h1>
        </div>

        <button
          onClick={() => navigate("/admin/diamond-rates/new")}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
        >
          + Add Diamond Rate
        </button>
      </div>

      {rates.length === 0 ? (
        <div className="text-gray-500 text-sm bg-white p-6 rounded-lg shadow">
          No diamond rates configured yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="p-4 text-left">Shape</th>
                <th className="p-4 text-left">Color</th>
                <th className="p-4 text-left">Clarity</th>
                <th className="p-4 text-left">Weight (ct)</th>
                <th className="p-4 text-left">Rate</th>
                <th className="p-4 text-left">Type</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {rates.map((r) => (
                <tr
                  key={r._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-4 font-medium">{r.shape}</td>

  
<td className="p-4">
  {COLOR_RANK[r.colorFromIndex] ?? "?"} – {COLOR_RANK[r.colorToIndex] ?? "?"}
</td>

<td className="p-4">
  {CLARITY_RANK[r.clarityFromIndex] ?? "?"} – {CLARITY_RANK[r.clarityToIndex] ?? "?"}
</td>

                  <td className="p-4">
                    {r.weightFrom} – {r.weightTo}
                  </td>

                  <td className="p-4 font-semibold text-green-600">
                    ₹ {r.rate}
                  </td>

                  <td className="p-4 capitalize">{r.rateType}</td>

                  <td className="p-4">
                    {r.active ? (
                      <span className="text-green-600 font-medium">
                        🟢 Active
                      </span>
                    ) : (
                      <span className="text-gray-400">
                        ⚪ Inactive
                      </span>
                    )}
                  </td>

                  <td className="p-4 space-x-2">
                    <button
                      onClick={() =>
                        navigate(`/admin/diamond-rates/${r._id}/edit`)
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