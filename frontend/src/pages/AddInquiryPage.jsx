import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { useModal } from "../context/ModalContext";
import { ArrowLeft, UserPlus, Shield, Flag, Tag, MapPin, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

export default function AddInquiryPage() {
  const navigate = useNavigate();
  const { showAlert } = useModal();

  const [form, setForm] = useState({
    customerName: "",
    mobile: "",
    email: "",
    address: "",
    productType: "GOLD",
    notes: "",
    priority: "MEDIUM",
    source: "WALK_IN",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.mobile.trim()) {
      toast.error("Customer Name and Mobile are required");
      return;
    }
    try {
      await API.post("/inquiries", form);
      toast.success("Lead Captured Successfully");
      navigate("/inquiries");
    } catch (err) {
      console.error("Inquiry Create Error:", err);
      toast.error(err.response?.data?.message || "Failed to capture lead");
    }
  };

  const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#462434]/10 focus:border-[#462434] transition-all text-sm font-medium";
  const labelClass = "text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1";

  return (
    <div className="min-h-screen bg-[#FDFBFB] p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto">

        <button
          onClick={() => navigate("/inquiries")}
          className="flex items-center gap-2 text-slate-500 hover:text-[#462434] font-bold text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={18} /> Back to Pipeline
        </button>

        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">

          <div className="bg-[#462434] p-8 text-white flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight mb-1">Enquiry Form</h1>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Enter high-intent customer details</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <UserPlus size={24} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">

            {/* CUSTOMER SECTION */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={16} className="text-[#462434]" />
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Customer Identity</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Full Name *</label>
                  <input
                    placeholder="e.g. Gupta Ji"
                    className={inputClass}
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Mobile Number *</label>
                  <input
                    placeholder="+91 XXXXX XXXXX"
                    className={inputClass}
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    placeholder="Nazara@example.com"
                    className={inputClass}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Location/Address</label>
                  <input
                    placeholder="City, Area"
                    className={inputClass}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* REQUIREMENTS SECTION */}
            <div className="space-y-5 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-2 mb-2">
                <Tag size={16} className="text-[#462434]" />
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Requirement Details</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <label className={labelClass}>Category</label>
                  <select
                    className={inputClass}
                    value={form.productType}
                    onChange={(e) => setForm({ ...form, productType: e.target.value })}
                  >
                    <option value="GOLD">GOLD</option>
                    <option value="DIAMOND">DIAMOND</option>
                    <option value="SILVER">SILVER</option>
                    <option value="PLATINUM">PLATINUM</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Priority</label>
                  <select
                    className={inputClass}
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Lead Source</label>
                  <select
                    className={inputClass}
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                  >
                    <option value="WALK_IN">WALK_IN</option>
                    <option value="INSTAGRAM">INSTAGRAM</option>
                    <option value="WHATSAPP">WHATSAPP</option>
                    <option value="WEBSITE">WEBSITE</option>
                    <option value="REFERRAL">REFERRAL</option>
                    <option value="GOOGLE">GOOGLE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Enquiry Notes / Discussion</label>
                <textarea
                  rows="4"
                  placeholder="What is the customer looking for? Mention specifics..."
                  className={inputClass}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>

            <button className="w-full bg-[#462434] text-white py-4 rounded-2xl font-black text-sm hover:shadow-xl hover:shadow-[#462434]/20 transition-all active:scale-95">
              Create & Pipeline Lead
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}