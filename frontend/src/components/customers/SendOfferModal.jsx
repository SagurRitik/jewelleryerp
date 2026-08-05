import React, { useState, useEffect } from "react";
import { X, Send, Gift, Sparkles, Copy } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "../../context/ThemeContext";
import { sendOfferMessage } from "../../api/customerApi";

export default function SendOfferModal({ isOpen, onClose, customer, celebrationType, onSuccess }) {
  const { isDark } = useTheme();

  const [eventType, setEventType] = useState("BIRTHDAY");
  const [offerCode, setOfferCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      const type = celebrationType || "BIRTHDAY";
      setEventType(type);

      const code = type === "BIRTHDAY" ? `BDAY${new Date().getFullYear().toString().slice(-2)}` : `ANNI${new Date().getFullYear().toString().slice(-2)}`;
      setOfferCode(code);

      if (type === "BIRTHDAY") {
        setMessage(
          `Dear ${customer.name},\n\n🎂 Happy Birthday from Luxe Jewellery! 🎉\n\nTo make your day extra special, we are delighted to gift you an EXCLUSIVE CELEBRATION OFFER:\n✨ 15% OFF on Making Charges + ₹1,000 Special Birthday Voucher on your next purchase!\n\n🎟️ Coupon Code: ${code}\n\nVisit our store today or show this message to claim your gift!`
        );
      } else {
        setMessage(
          `Dear ${customer.name},\n\n💍 Happy Wedding Anniversary from Luxe Jewellery! 💐\n\nTo celebrate your special day, we are offering an EXCLUSIVE ANNIVERSARY GIFT:\n✨ 20% OFF on Making Charges for Gold & Diamond Jewellery!\n\n🎟️ Coupon Code: ${code}\n\nVisit our store today or show this message to claim your gift!`
        );
      }
    }
  }, [customer, celebrationType, isOpen]);

  if (!isOpen || !customer) return null;

  const handleSend = async () => {
    try {
      setLoading(true);
      const res = await sendOfferMessage(customer._id, {
        eventType,
        offerCode,
        message,
        channel: "WHATSAPP",
      });

      toast.success("Offer recorded! Opening WhatsApp...");

      // Open WhatsApp web link directly
      if (res.waWebUrl) {
        window.open(res.waWebUrl, "_blank");
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send offer");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message);
    toast.success("Message copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-8 border ${
        isDark ? "bg-[#1e1e1e] text-white border-[#333]" : "bg-white text-gray-900 border-gray-200"
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? "bg-[#252525] border-[#333]" : "bg-gradient-to-r from-emerald-700 to-teal-800 text-white border-gray-200"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-white/10 text-emerald-200"}`}>
              <Gift size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Send Celebration Offer
              </h3>
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-emerald-100"}`}>
                Target Customer: {customer.name} ({customer.mobile})
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

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-sm transition focus:outline-none ${
                  isDark
                    ? "bg-[#141414] border border-[#333] text-white focus:border-emerald-400"
                    : "bg-gray-50 border border-gray-300 text-gray-900 focus:bg-white focus:border-emerald-600"
                }`}
              >
                <option value="BIRTHDAY">🎂 Birthday Offer</option>
                <option value="ANNIVERSARY">💍 Anniversary Offer</option>
                <option value="CUSTOM">🌟 Special Promo</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Coupon Code</label>
              <input
                type="text"
                value={offerCode}
                onChange={(e) => setOfferCode(e.target.value.toUpperCase())}
                placeholder="e.g. BDAY15"
                className={`w-full rounded-xl px-3 py-2 text-sm font-mono font-bold tracking-wider transition focus:outline-none ${
                  isDark
                    ? "bg-[#141414] border border-[#333] text-amber-400 focus:border-emerald-400"
                    : "bg-amber-50 border border-amber-300 text-amber-900 focus:border-emerald-600"
                }`}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={`block text-xs font-bold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                WhatsApp Greeting & Offer Text
              </label>
              <button
                onClick={handleCopyMessage}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 transition"
              >
                <Copy size={12} /> Copy Text
              </button>
            </div>
            <textarea
              rows={7}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`w-full rounded-xl p-3 text-xs font-sans leading-relaxed transition focus:outline-none ${
                isDark
                  ? "bg-[#141414] border border-[#333] text-gray-200 focus:border-emerald-400"
                  : "bg-gray-50 border border-gray-300 text-gray-800 focus:bg-white focus:border-emerald-600"
              }`}
            />
          </div>

          <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
            isDark
              ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
              : "bg-amber-50 border-amber-200 text-amber-900"
          }`}>
            <Sparkles size={16} className="shrink-0 mt-0.5 text-amber-500" />
            <span>
              Clicking <strong>Send via WhatsApp</strong> will log this offer in customer history and open WhatsApp Web with pre-filled message text.
            </span>
          </div>

          {/* Buttons */}
          <div className={`flex items-center justify-end gap-3 pt-4 border-t ${isDark ? "border-[#333]" : "border-gray-200"}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                isDark ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition shadow-md shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={16} />
              {loading ? "Sending..." : "Send via WhatsApp"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
