
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Save, Loader2, Gem, AlertCircle } from "lucide-react";
import API from "../api";
import { toast } from "sonner";
import { useTheme } from "../context/ThemeContext";

export default function AddDiamondStock() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    sku: "",
    shape: "Round",
    weight: "",
    color: "",
    clarity: "",
    cut: "",
    labNatural: "Natural",
    lab: "",
    certificateNo: "",
    costPrice: "",
    sellingPrice: "",
    stock: 1,
    status: "AVAILABLE",
    notes: "",
  });

  useEffect(() => {
    if (isEdit) {
      fetchDiamond();
    }
  }, [id]);

  const fetchDiamond = async () => {
    try {
      setFetching(true);
      const res = await API.get(`/diamonds/${id}`);
      setFormData(res.data.diamond);
    } catch (error) {
      toast.error("Failed to fetch diamond details");
      navigate("/diamonds");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEdit) {
        await API.patch(`/diamonds/${id}`, formData);
        toast.success("Diamond updated successfully");
      } else {
        await API.post("/diamonds", formData);
        toast.success("Diamond added to stock");
      }
      navigate("/diamonds");
    } catch (error) {
      console.error("Submit Error:", error);
      toast.error(error.response?.data?.error || "Failed to save diamond");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#714760]" size={40} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      isDark ? "bg-[#121212] text-white" : "bg-[#fcfaf8] text-[#2f2430]"
    }`}>
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <button
          onClick={() => navigate("/diamonds")}
          className={`flex items-center gap-2 mb-6 transition-colors ${
            isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-[#714760]"
          }`}
        >
          <ChevronLeft size={20} />
          Back to Inventory
        </button>

        <div className={`rounded-[32px] border shadow-xl overflow-hidden ${
          isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-[#eadfdf]"
        }`}>
          <div className="bg-gradient-to-r from-[#5a374f] to-[#8c5f5f] p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                <Gem size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{isEdit ? "Edit Diamond" : "Add Loose Diamond"}</h1>
                <p className="text-white/70 text-sm">Enter diamond specifications and pricing</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Basic Info */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Basic Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">SKU / Stock ID *</label>
                  <input
                    name="sku"
                    required
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="DIA-001"
                    className={`w-full px-4 py-3 rounded-2xl border outline-none transition-all ${
                      isDark ? "bg-[#252525] border-white/10 text-white focus:border-pink-500" : "bg-white border-[#ebdbe2] focus:border-[#714760]"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Shape</label>
                  <select
                    name="shape"
                    value={formData.shape}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-2xl border outline-none appearance-none transition-all ${
                      isDark ? "bg-[#252525] border-white/10 text-white" : "bg-white border-[#ebdbe2]"
                    }`}
                  >
                    <option>Round</option>
                    <option>Princess</option>
                    <option>Emerald</option>
                    <option>Asscher</option>
                    <option>Cushion</option>
                    <option>Marquise</option>
                    <option>Oval</option>
                    <option>Radiant</option>
                    <option>Pear</option>
                    <option>Heart</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Weight (Carats) *</label>
                  <input
                    name="weight"
                    type="number"
                    step="0.001"
                    required
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="1.00"
                    className={`w-full px-4 py-3 rounded-2xl border outline-none transition-all ${
                      isDark ? "bg-[#252525] border-white/10 text-white" : "bg-white border-[#ebdbe2]"
                    }`}
                  />
                </div>
              </div>
            </section>

            {/* Quality Info */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Quality & Grading</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Color</label>
                  <input
                    name="color"
                    value={formData.color || ""}
                    onChange={handleChange}
                    placeholder="COLOR"
                    className={`w-full px-4 py-3 rounded-2xl border outline-none transition-all ${
                      isDark ? "bg-[#252525] border-white/10 text-white" : "bg-white border-[#ebdbe2]"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Clarity</label>
                  <input
                    name="clarity"
                    value={formData.clarity || ""}
                    onChange={handleChange}
                    placeholder="CLARITY"
                    className={`w-full px-4 py-3 rounded-2xl border outline-none transition-all ${
                      isDark ? "bg-[#252525] border-white/10 text-white" : "bg-white border-[#ebdbe2]"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Cut</label>
                  <input
                    name="cut"
                    value={formData.cut || ""}
                    onChange={handleChange}
                    placeholder="CUT"
                    className={`w-full px-4 py-3 rounded-2xl border outline-none transition-all ${
                      isDark ? "bg-[#252525] border-white/10 text-white" : "bg-white border-[#ebdbe2]"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Lab / Natural</label>
                  <select
                    name="labNatural"
                    value={formData.labNatural || "Natural"}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-2xl border outline-none appearance-none transition-all ${
                      isDark ? "bg-[#252525] border-white/10 text-white" : "bg-white border-[#ebdbe2]"
                    }`}
                  >
                    <option value="Natural">Natural</option>
                    <option value="Lab Grown">Lab Grown</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Lab</label>
                  <input
                    name="lab"
                    value={formData.lab || ""}
                    onChange={handleChange}
                    placeholder="LAB"
                    className={`w-full px-4 py-3 rounded-2xl border outline-none transition-all ${
                      isDark ? "bg-[#252525] border-white/10 text-white" : "bg-white border-[#ebdbe2]"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Cert #</label>
                  <input
                    name="certificateNo"
                    value={formData.certificateNo || ""}
                    onChange={handleChange}
                    placeholder="CERTIFICATE NO"
                    className={`w-full px-4 py-3 rounded-2xl border outline-none transition-all ${
                      isDark ? "bg-[#252525] border-white/10 text-white" : "bg-white border-[#ebdbe2]"
                    }`}
                  />
                </div>
              </div>
            </section>

            {/* Pricing Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Pricing & Status</h3>
                <div className="h-px flex-1 bg-[#f0e6e9]"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Cost Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <input
                      name="costPrice"
                      type="number"
                      value={formData.costPrice}
                      onChange={handleChange}
                      className={`w-full pl-8 pr-4 py-3 rounded-2xl border outline-none transition-all ${
                        isDark ? "bg-[#252525] border-white/10 text-white" : "bg-white border-[#ebdbe2]"
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Selling Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <input
                      name="sellingPrice"
                      type="number"
                      value={formData.sellingPrice}
                      onChange={handleChange}
                      className={`w-full pl-8 pr-4 py-3 rounded-2xl border outline-none transition-all ${
                        isDark ? "bg-[#252525] border-white/10 text-white" : "bg-white border-[#ebdbe2]"
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Stock Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-2xl border outline-none transition-all ${
                      isDark ? "bg-[#252525] border-white/10 text-white" : "bg-white border-[#ebdbe2]"
                    }`}
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="SOLD">Sold</option>
                    <option value="RESERVED">Reserved</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Notes */}
            <section className="space-y-4">
              <label className="block text-sm font-semibold mb-2">Internal Notes</label>
              <textarea
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Extra details like location, origin, or specific inclusions..."
                className={`w-full px-4 py-3 rounded-2xl border outline-none resize-none transition-all ${
                  isDark ? "bg-[#252525] border-white/10 text-white" : "bg-white border-[#ebdbe2]"
                }`}
              ></textarea>
            </section>

            <div className="pt-6 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-3 bg-[#5a374f] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#4a2b3d] transition-all disabled:opacity-50 shadow-lg active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {isEdit ? "Update Diamond" : "Save to Inventory"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
