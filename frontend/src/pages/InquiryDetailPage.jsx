import { useEffect, useState } from "react";
import API from "../api";
import { useParams, useNavigate } from "react-router-dom";
import { useModal } from "../context/ModalContext";
import {
  Trash2, ArrowLeft, Phone, Mail, MapPin, MessageSquare,
  Clock, Calendar, Plus, User, Flag, CheckCircle2,
  TrendingUp, Hash, Tag, History, Send, MoreHorizontal
} from "lucide-react";
import { toast } from "sonner";

const STATUS_OPTIONS = ["NEW", "CONTACTED", "FOLLOW_UP", "INTERESTED", "NEGOTIATION", "NOT_INTERESTED", "CONVERTED", "CLOSED"];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH"];
const SOURCE_OPTIONS = ["WALK_IN", "INSTAGRAM", "WEBSITE", "REFERRAL", "FACEBOOK", "WHATSAPP", "GOOGLE"];

const STATUS_COLORS = {
  NEW: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-purple-100 text-purple-700",
  FOLLOW_UP: "bg-orange-100 text-orange-700",
  INTERESTED: "bg-indigo-100 text-indigo-700",
  NEGOTIATION: "bg-amber-100 text-amber-700",
  NOT_INTERESTED: "bg-gray-100 text-gray-700",
  CONVERTED: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-rose-100 text-rose-700",
};

export default function InquiryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showConfirm } = useModal();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Follow-up Form State
  const [followUpNote, setFollowUpNote] = useState("");
  const [nextFollowUpDate, setNextFollowUpDate] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const res = await API.get(`/inquiries/${id}`);
      setData(res.data.data);
      if (res.data.data) {
        setNewStatus(res.data.data.status);
      }
    } catch (error) {
      console.error("Failed to fetch inquiry", error);
      toast.error("Failed to load lead details");
    } finally {
      setLoading(false);
    }
  };

  const updateLeadInfo = async (updates) => {
    try {
      await API.put(`/inquiries/${id}/status`, updates);
      toast.success("Lead information updated");
      fetchData();
    } catch (error) {
      console.error("Failed to update lead", error);
      toast.error("Update failed");
    }
  };

  const handleAddFollowUp = async (e) => {
    e.preventDefault();
    if (!followUpNote.trim()) return toast.error("Please enter a note");

    setIsSubmitting(true);
    try {
      await API.post(`/inquiries/${id}/followup`, {
        note: followUpNote,
        status: newStatus,
        nextFollowUpDate: nextFollowUpDate || null,
        salesperson: "Current User" // Replace with actual user name
      });
      toast.success("Follow-up logged successfully");
      setFollowUpNote("");
      setNextFollowUpDate("");
      fetchData();
    } catch (error) {
      console.error("Failed to add follow-up", error);
      toast.error("Failed to log follow-up");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const ok = await showConfirm("Delete this lead permanently?");
    if (ok) {
      try {
        await API.delete(`/inquiries/${id}`);
        navigate("/inquiries");
      } catch (error) {
        console.error("Failed to delete inquiry", error);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBFB] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#462434] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return <div className="text-center py-20">Lead not found</div>;

  return (
    <div className="min-h-screen bg-[#FDFBFB] p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-[1200px] mx-auto">

        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate("/inquiries")}
            className="flex items-center gap-2 text-slate-500 hover:text-[#462434] font-bold text-sm transition-colors"
          >
            <ArrowLeft size={18} /> Back to Pipeline
          </button>

          <div className="flex items-center gap-3">
            <span className={`px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest uppercase border ${STATUS_COLORS[data.status] || 'bg-gray-100'}`}>
              {data.status?.replace("_", " ")}
            </span>
            <button
              onClick={handleDelete}
              className="p-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all border border-rose-100"
              title="Delete Lead"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN: LEAD PROFILE */}
          <div className="lg:col-span-1 space-y-6">

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-24 h-24 rounded-3xl bg-[#F8F3F5] text-[#462434] flex items-center justify-center text-3xl font-black mb-4 border-2 border-[#F1E9ED] shadow-inner">
                  {data.customerName?.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-1">{data.customerName}</h2>
                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs uppercase tracking-widest">
                  <Clock size={12} /> Lead since {new Date(data.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</p>
                    <p className="text-sm font-black text-slate-700">{data.mobile || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-purple-50 group-hover:text-purple-600 transition-all">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</p>
                    <p className="text-sm font-black text-slate-700 truncate max-w-[180px]">{data.email || "No email"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-600 transition-all">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Address</p>
                    <p className="text-sm font-black text-slate-700 leading-relaxed">{data.address || "No address"}</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-50 space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Priority</label>
                  <select
                    value={data.priority || "MEDIUM"}
                    onChange={(e) => updateLeadInfo({ priority: e.target.value })}
                    className={`w-full p-3 rounded-xl border font-bold text-sm outline-none transition-all ${data.priority === 'HIGH' ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-100 bg-slate-50'}`}
                  >
                    {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Lead Source</label>
                  <select
                    value={data.source || "WALK_IN"}
                    onChange={(e) => updateLeadInfo({ source: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 font-bold text-sm outline-none"
                  >
                    {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* PRODUCT INTEREST */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <h3 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-widest">
                <Tag size={16} className="text-[#462434]" /> Product Interest
              </h3>
              <div className="p-4 rounded-2xl bg-[#F8F3F5] border border-[#F1E9ED]">
                <p className="text-xs font-black text-[#462434] uppercase tracking-tighter mb-1">Interest</p>
                <p className="text-sm font-bold text-slate-700">{data.productType || "General Enquiry"}</p>
              </div>
              {data.budget && (
                <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <p className="text-xs font-black text-emerald-700 uppercase tracking-tighter mb-1">Budget</p>
                  <p className="text-sm font-black text-emerald-800">₹{Number(data.budget).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: TIMELINE & ACTIONS */}
          <div className="lg:col-span-2 space-y-8">

            {/* ACTION CARD: LOG FOLLOWUP */}
            <div className="bg-[#2D1B24] rounded-[32px] p-8 shadow-xl shadow-[#2D1B24]/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Send size={120} />
              </div>
              <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                <CheckCircle2 size={22} className="text-emerald-400" /> Log Activity & Follow-up
              </h3>

              <form onSubmit={handleAddFollowUp} className="relative z-10 space-y-4">
                <textarea
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                  placeholder="What was discussed with the customer?..."
                  className="w-full h-32 p-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/30 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Update Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold outline-none"
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-[#2D1B24]">{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Next Follow-up</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="date"
                        value={nextFollowUpDate}
                        onChange={(e) => setNextFollowUpDate(e.target.value)}
                        className="w-full p-4 pl-12 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold outline-none [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? "Logging..." : "Complete & Save Log"}
                </button>
              </form>
            </div>

            {/* TIMELINE */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                  <History size={22} className="text-[#462434]" /> Activity Timeline
                </h3>
                <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {data.followUps?.length || 0} Entries
                </div>
              </div>

              <div className="relative space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">

                {/* INITIAL ENQUIRY ENTRY */}
                <div className="relative pl-12">
                  <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-blue-50 border-4 border-white shadow-sm flex items-center justify-center z-10 text-blue-600">
                    <Plus size={16} strokeWidth={3} />
                  </div>
                  <div className="p-5 rounded-2xl bg-blue-50/30 border border-blue-100">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-black text-blue-700 uppercase tracking-widest">Initial Enquiry</span>
                        <p className="text-[10px] font-bold text-slate-400">{new Date(data.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                      "{data.notes || "Lead generated via walkthrough/form"}"
                    </p>
                  </div>
                </div>

                {/* FOLLOWUP ENTRIES */}
                {data.followUps?.slice().reverse().map((fu, idx) => (
                  <div key={idx} className="relative pl-12 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-white border-4 border-slate-50 shadow-sm flex items-center justify-center z-10 text-[#462434]">
                      <MessageSquare size={16} strokeWidth={3} />
                    </div>
                    <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Follow-up Session</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${STATUS_COLORS[fu.status] || 'bg-slate-100'}`}>
                              {fu.status}
                            </span>
                          </div>
                          <p className="text-[10px] font-bold text-slate-400">{new Date(fu.date).toLocaleString()} by {fu.salesperson || "Agent"}</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed">
                        {fu.note}
                      </p>
                      {fu.nextFollowUpDate && (
                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] font-black text-orange-600 uppercase tracking-widest">
                          <Calendar size={12} /> Next action scheduled: {new Date(fu.nextFollowUpDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}