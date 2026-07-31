import React, { useState, useEffect } from "react";
import { X, User, Phone, Mail, MapPin, Calendar, Award, Star, MessageSquareQuote, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "../../context/ThemeContext";
import { createCustomer, updateCustomer } from "../../api/customerApi";

export default function CustomerFormModal({ isOpen, onClose, customer, onSuccess }) {
  const { isDark } = useTheme();

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    city: "",
    gstin: "",
    dob: "",
    anniversaryDate: "",
    customerType: "Regular",
    feedback: "",
    rating: 5,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        mobile: customer.mobile || "",
        email: customer.email || "",
        address: customer.address || "",
        city: customer.city || "",
        gstin: customer.gstin || "",
        dob: customer.dob ? new Date(customer.dob).toISOString().split("T")[0] : "",
        anniversaryDate: customer.anniversaryDate ? new Date(customer.anniversaryDate).toISOString().split("T")[0] : "",
        customerType: customer.customerType || "Regular",
        feedback: customer.feedback || customer.notes || "",
        rating: customer.rating || 5,
      });
    } else {
      setFormData({
        name: "",
        mobile: "",
        email: "",
        address: "",
        city: "",
        gstin: "",
        dob: "",
        anniversaryDate: "",
        customerType: "Regular",
        feedback: "",
        rating: 5,
      });
    }
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.mobile.trim()) {
      toast.error("Name and Mobile number are required");
      return;
    }

    try {
      setLoading(true);
      if (customer?._id) {
        await updateCustomer(customer._id, {
          ...formData,
          notes: formData.feedback,
        });
        toast.success("Customer feedback & profile updated!");
      } else {
        await createCustomer({
          ...formData,
          notes: formData.feedback,
        });
        toast.success("Thank you! Customer feedback saved successfully.");
      }
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to save feedback";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8 border ${
        isDark ? "bg-[#1e1e1e] text-white border-[#333]" : "bg-white text-gray-900 border-gray-200"
      }`}>
        {/* Header - Premium Nazara Deep Plum */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? "bg-[#252525] border-[#333]" : "bg-gradient-to-r from-[#5A374F] via-[#4a2c41] to-[#361e2f] text-white border-gray-200"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${isDark ? "bg-pink-500/10 text-pink-400 border-pink-500/20" : "bg-white/10 text-pink-200 border-white/20"}`}>
              <MessageSquareQuote size={22} />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-white tracking-wide flex items-center gap-2">
                Customer Feedback Form
              </h3>
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-purple-100/90"}`}>
                Share celebration dates & review your shopping experience
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition ${
              isDark ? "text-gray-400 hover:text-white hover:bg-[#333]" : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Thank You Banner - Luxury Plum & Pink Gradient */}
        <div className={`px-6 py-3 border-b flex items-center justify-between ${
          isDark
            ? "bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10 border-pink-500/20 text-pink-300"
            : "bg-gradient-to-r from-[#5A374F]/10 via-pink-500/10 to-[#5A374F]/10 border-pink-200 text-[#5A374F]"
        }`}>
          <div className="flex items-center gap-2 font-extrabold text-sm">
            <Sparkles size={16} className="text-pink-500 shrink-0" />
            <span>Thank you for shopping with Nazara Jewellery! ✨</span>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-white bg-[#5A374F] px-3 py-1 rounded-full shadow-xs">
            Special Member
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Personal Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Shah"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full rounded-xl pl-9 pr-3 py-2 text-sm transition focus:outline-none ${
                    isDark
                      ? "bg-[#141414] border border-[#333] text-white focus:border-pink-400"
                      : "bg-gray-50 border border-gray-300 text-gray-900 focus:bg-white focus:border-[#5A374F] focus:ring-2 focus:ring-[#5A374F]/20"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 9876543210"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className={`w-full rounded-xl pl-9 pr-3 py-2 text-sm transition focus:outline-none ${
                    isDark
                      ? "bg-[#141414] border border-[#333] text-white focus:border-pink-400"
                      : "bg-gray-50 border border-gray-300 text-gray-900 focus:bg-white focus:border-[#5A374F] focus:ring-2 focus:ring-[#5A374F]/20"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  placeholder="ramesh@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full rounded-xl pl-9 pr-3 py-2 text-sm transition focus:outline-none ${
                    isDark
                      ? "bg-[#141414] border border-[#333] text-white focus:border-pink-400"
                      : "bg-gray-50 border border-gray-300 text-gray-900 focus:bg-white focus:border-[#5A374F] focus:ring-2 focus:ring-[#5A374F]/20"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Customer Category</label>
              <div className="relative">
                <Award size={16} className="absolute left-3 top-3 text-gray-400" />
                <select
                  value={formData.customerType}
                  onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                  className={`w-full rounded-xl pl-9 pr-3 py-2 text-sm transition focus:outline-none ${
                    isDark
                      ? "bg-[#141414] border border-[#333] text-white focus:border-pink-400"
                      : "bg-gray-50 border border-gray-300 text-gray-900 focus:bg-white focus:border-[#5A374F] focus:ring-2 focus:ring-[#5A374F]/20"
                  }`}
                >
                  <option value="Regular">Regular Customer</option>
                  <option value="VIP">VIP Customer 👑</option>
                  <option value="Wholesale">Wholesale Client</option>
                </select>
              </div>
            </div>
          </div>

          {/* Celebration Dates Section */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            isDark ? "bg-[#262626] border-pink-500/20" : "bg-[#FCF4FC] border-[#632947]/20"
          }`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
              isDark ? "text-pink-400" : "text-[#5A374F]"
            }`}>
              <Calendar size={15} className="text-pink-500" /> Celebration Dates & Birthday/Anniversary Offers
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>🎂 Date of Birth (DOB)</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-sm transition focus:outline-none ${
                    isDark
                      ? "bg-[#141414] border border-[#333] text-white focus:border-pink-400"
                      : "bg-white border border-gray-300 text-gray-900 focus:border-[#5A374F]"
                  }`}
                />
              </div>
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>💍 Wedding Anniversary Date</label>
                <input
                  type="date"
                  value={formData.anniversaryDate}
                  onChange={(e) => setFormData({ ...formData, anniversaryDate: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-sm transition focus:outline-none ${
                    isDark
                      ? "bg-[#141414] border border-[#333] text-white focus:border-pink-400"
                      : "bg-white border border-gray-300 text-gray-900 focus:border-[#5A374F]"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Full Address Single Row */}
          <div>
            <label className={`block text-xs font-bold mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Full Address</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="House / Street / Area / City"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={`w-full rounded-xl pl-9 pr-3 py-2 text-sm transition focus:outline-none ${
                  isDark
                    ? "bg-[#141414] border border-[#333] text-white focus:border-pink-400"
                    : "bg-gray-50 border border-gray-300 text-gray-900 focus:bg-white focus:border-[#5A374F]"
                }`}
              />
            </div>
          </div>

          {/* ⭐ CUSTOMER FEEDBACK & REVIEW SECTION ⭐ */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            isDark ? "bg-[#252525] border-[#333]" : "bg-[#fcf7fc] border-purple-200"
          }`}>
            <div className="flex items-center justify-between">
              <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                isDark ? "text-pink-400" : "text-[#5A374F]"
              }`}>
                <Star size={16} className="text-amber-500 fill-amber-500" /> Customer Experience & Rating
              </h4>

              {/* Star Selector */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="p-1 transition transform hover:scale-125 focus:outline-none"
                    title={`${star} Star Rating`}
                  >
                    <Star
                      size={18}
                      className={star <= formData.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Customer Feedback / Remarks
              </label>
              <textarea
                rows={3}
                placeholder="Share customer feedback on designs, making charges, shopping experience or special requests..."
                value={formData.feedback}
                onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                className={`w-full rounded-xl p-3 text-sm transition focus:outline-none ${
                  isDark
                    ? "bg-[#141414] border border-[#333] text-white focus:border-pink-400"
                    : "bg-white border border-gray-300 text-gray-900 focus:border-[#5A374F] focus:ring-2 focus:ring-[#5A374F]/20"
                }`}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className={`flex items-center justify-end gap-3 pt-4 border-t ${isDark ? "border-[#333]" : "border-gray-200"}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                isDark ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#5A374F] hover:bg-[#45273c] text-white font-bold text-sm transition shadow-lg shadow-[#5A374F]/20 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "Saving..." : "Submit Feedback & Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
