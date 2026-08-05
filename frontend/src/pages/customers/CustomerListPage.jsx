import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Users,
  UserPlus,
  Search,
  Cake,
  Heart,
  Calendar,
  Send,
  Edit,
  Trash2,
  Phone,
  Mail,
  Gift,
  Award,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "../../context/ThemeContext";
import {
  getCustomers,
  deleteCustomer,
  getUpcomingCelebrations,
} from "../../api/customerApi";
import CustomerFormModal from "../../components/customers/CustomerFormModal";
import SendOfferModal from "../../components/customers/SendOfferModal";

export default function CustomerListPage() {
  const { isDark } = useTheme();

  const [customers, setCustomers] = useState([]);
  const [celebrations, setCelebrations] = useState({
    todayBirthdays: [],
    todayAnniversaries: [],
    upcomingBirthdays: [],
    upcomingAnniversaries: [],
    stats: {
      todayBirthdaysCount: 0,
      todayAnniversariesCount: 0,
      upcomingBirthdaysCount: 0,
      upcomingAnniversariesCount: 0,
    },
  });

  const [activeTab, setActiveTab] = useState("ALL"); // ALL, TODAY_BDAY, TODAY_ANNI, UPCOMING
  const [search, setSearch] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [offerCustomer, setOfferCustomer] = useState(null);
  const [offerType, setOfferType] = useState("BIRTHDAY");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [custRes, celebRes] = await Promise.all([
        getCustomers({ search, customerType }),
        getUpcomingCelebrations(30),
      ]);

      if (custRes.success) setCustomers(custRes.customers || []);
      if (celebRes.success) setCelebrations(celebRes.data);
    } catch (err) {
      console.error("Error loading customer data:", err);
      toast.error("Failed to load customer records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, customerType]);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.prefillCustomer) {
      setSelectedCustomer(location.state.prefillCustomer);
      setIsFormOpen(true);
      toast.info("Customer details prefilled! Please enter Birthday and Anniversary dates.");
    }
  }, [location.state]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete customer "${name}"?`)) return;
    try {
      await deleteCustomer(id);
      toast.success("Customer deleted successfully");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete customer");
    }
  };

  const handleOpenAdd = () => {
    setSelectedCustomer(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleOpenOffer = (customer, type = "BIRTHDAY") => {
    setOfferCustomer(customer);
    setOfferType(type);
    setIsOfferOpen(true);
  };

  // Filtered customer list based on tab
  const getDisplayedCustomers = () => {
    if (activeTab === "TODAY_BDAY") return celebrations.todayBirthdays;
    if (activeTab === "TODAY_ANNI") return celebrations.todayAnniversaries;
    if (activeTab === "UPCOMING") {
      return [...celebrations.upcomingBirthdays, ...celebrations.upcomingAnniversaries];
    }
    return customers;
  };

  const displayedList = getDisplayedCustomers();

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className={`p-4 md:p-6 max-w-[1600px] mx-auto space-y-6 min-h-screen ${isDark ? "bg-[#121212] text-[#e0e0e0]" : "bg-[#faf9f6] text-[#1a1a1a]"}`}>
      {/* Top Title & Header - Nazara Plum Styling */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl shadow-md border ${
        isDark 
          ? "bg-[#1a1a1a] border-[#2e2e2e]" 
          : "bg-gradient-to-r from-[#5A374F] via-[#4a2c41] to-[#381f30] border-[#5A374F] text-white shadow-xl"
      }`}>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              isDark ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-white/10 text-amber-300 border-white/20"
            }`}>
              <Users size={24} />
            </div>
            Customer Management & Celebrations
          </h1>
          <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-purple-100/80"}`}>
            Manage customer directory, track birthdays & wedding anniversaries, and send WhatsApp offer greetings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className={`p-2.5 rounded-xl border transition flex items-center gap-2 text-xs font-semibold ${
              isDark
                ? "bg-[#262626] hover:bg-[#333] text-gray-300 border-[#333]"
                : "bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-xs"
            }`}
            title="Refresh Directory"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-pink-100 hover:bg-pink-200 text-[#5A374F] font-extrabold rounded-xl transition-all active:scale-95 flex items-center gap-2 text-xs shadow-md shadow-pink-900/10 uppercase tracking-wider border border-pink-200"
          >
            <UserPlus size={18} className="text-[#5A374F]" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Stats Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div
          onClick={() => setActiveTab("ALL")}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            activeTab === "ALL"
              ? isDark
                ? "bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30"
                : "bg-amber-50 border-amber-400 shadow-md ring-2 ring-amber-400/20"
              : isDark
                ? "bg-[#1e1e1e] border-[#2e2e2e] hover:border-gray-700"
                : "bg-white border-gray-200 hover:border-amber-300 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-amber-400" : "text-amber-800"}`}>
              Total Directory
            </span>
            <div className={`p-2 rounded-xl ${isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-100 text-amber-700"}`}>
              <Users size={18} />
            </div>
          </div>
          <div className={`text-2xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>{customers.length}</div>
          <div className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Active customer profiles</div>
        </div>

        {/* Today's Birthdays */}
        <div
          onClick={() => setActiveTab("TODAY_BDAY")}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            activeTab === "TODAY_BDAY"
              ? isDark
                ? "bg-pink-500/10 border-pink-500/50 shadow-lg shadow-pink-500/5 ring-1 ring-pink-500/30"
                : "bg-pink-50 border-pink-400 shadow-md ring-2 ring-pink-400/20"
              : isDark
                ? "bg-[#1e1e1e] border-[#2e2e2e] hover:border-gray-700"
                : "bg-white border-gray-200 hover:border-pink-300 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-pink-400" : "text-pink-700"}`}>
              <Cake size={14} /> Today's Birthdays
            </span>
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${isDark ? "bg-pink-500/20 text-pink-300" : "bg-pink-100 text-pink-700"}`}>
              {celebrations.stats.todayBirthdaysCount}
            </span>
          </div>
          <div className={`text-2xl font-black ${isDark ? "text-pink-300" : "text-pink-700"}`}>{celebrations.stats.todayBirthdaysCount}</div>
          <div className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-pink-600 font-medium"}`}>🎂 Celebrate today</div>
        </div>

        {/* Today's Anniversaries */}
        <div
          onClick={() => setActiveTab("TODAY_ANNI")}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            activeTab === "TODAY_ANNI"
              ? isDark
                ? "bg-rose-500/10 border-rose-500/50 shadow-lg shadow-rose-500/5 ring-1 ring-rose-500/30"
                : "bg-rose-50 border-rose-400 shadow-md ring-2 ring-rose-400/20"
              : isDark
                ? "bg-[#1e1e1e] border-[#2e2e2e] hover:border-gray-700"
                : "bg-white border-gray-200 hover:border-rose-300 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-rose-400" : "text-rose-700"}`}>
              <Heart size={14} /> Today's Anniversaries
            </span>
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${isDark ? "bg-rose-500/20 text-rose-300" : "bg-rose-100 text-rose-700"}`}>
              {celebrations.stats.todayAnniversariesCount}
            </span>
          </div>
          <div className={`text-2xl font-black ${isDark ? "text-rose-300" : "text-rose-700"}`}>{celebrations.stats.todayAnniversariesCount}</div>
          <div className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-rose-600 font-medium"}`}>💍 Wedding milestones</div>
        </div>

        {/* Upcoming (30 Days) */}
        <div
          onClick={() => setActiveTab("UPCOMING")}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            activeTab === "UPCOMING"
              ? isDark
                ? "bg-purple-500/10 border-purple-500/50 shadow-lg shadow-purple-500/5 ring-1 ring-purple-500/30"
                : "bg-purple-50 border-purple-400 shadow-md ring-2 ring-purple-400/20"
              : isDark
                ? "bg-[#1e1e1e] border-[#2e2e2e] hover:border-gray-700"
                : "bg-white border-gray-200 hover:border-purple-300 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-purple-400" : "text-purple-700"}`}>
              <Calendar size={14} /> Upcoming (30 Days)
            </span>
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${isDark ? "bg-purple-500/20 text-purple-300" : "bg-purple-100 text-purple-700"}`}>
              {celebrations.stats.upcomingBirthdaysCount + celebrations.stats.upcomingAnniversariesCount}
            </span>
          </div>
          <div className={`text-2xl font-black ${isDark ? "text-purple-300" : "text-purple-700"}`}>
            {celebrations.stats.upcomingBirthdaysCount + celebrations.stats.upcomingAnniversariesCount}
          </div>
          <div className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-purple-600 font-medium"}`}>🗓️ Upcoming celebrations</div>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark ? "bg-[#1e1e1e] border-[#2e2e2e]" : "bg-white border-gray-200 shadow-sm"
      }`}>
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === "ALL"
                ? isDark ? "bg-amber-500 text-black font-extrabold" : "bg-[#5A374F] text-white shadow-md"
                : isDark ? "bg-[#282828] text-gray-300 hover:bg-[#333]" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Users size={14} /> All Customers ({customers.length})
          </button>

          <button
            onClick={() => setActiveTab("TODAY_BDAY")}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === "TODAY_BDAY"
                ? "bg-pink-600 text-white shadow-md"
                : isDark ? "bg-[#282828] text-gray-300 hover:bg-[#333]" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Cake size={14} /> Today's Birthdays ({celebrations.stats.todayBirthdaysCount})
          </button>

          <button
            onClick={() => setActiveTab("TODAY_ANNI")}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === "TODAY_ANNI"
                ? "bg-rose-600 text-white shadow-md"
                : isDark ? "bg-[#282828] text-gray-300 hover:bg-[#333]" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Heart size={14} /> Today's Anniversaries ({celebrations.stats.todayAnniversariesCount})
          </button>

          <button
            onClick={() => setActiveTab("UPCOMING")}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === "UPCOMING"
                ? "bg-purple-600 text-white shadow-md"
                : isDark ? "bg-[#282828] text-gray-300 hover:bg-[#333]" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Sparkles size={14} /> Upcoming Reminders ({celebrations.stats.upcomingBirthdaysCount + celebrations.stats.upcomingAnniversariesCount})
          </button>
        </div>

        {/* Filter Inputs */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className={`absolute left-3 top-2.5 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
            <input
              type="text"
              placeholder="Search name, phone, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs transition focus:outline-none ${
                isDark
                  ? "bg-[#141414] border border-[#333] text-white focus:border-amber-400"
                  : "bg-gray-50 border border-gray-300 text-gray-900 focus:bg-white focus:border-[#5A374F] focus:ring-2 focus:ring-[#5A374F]/20"
              }`}
            />
          </div>

          <select
            value={customerType}
            onChange={(e) => setCustomerType(e.target.value)}
            className={`rounded-xl px-3 py-2 text-xs transition focus:outline-none ${
              isDark
                ? "bg-[#141414] border border-[#333] text-white focus:border-amber-400"
                : "bg-gray-50 border border-gray-300 text-gray-900 focus:bg-white focus:border-[#5A374F] focus:ring-2 focus:ring-[#5A374F]/20"
            }`}
          >
            <option value="">All Types</option>
            <option value="Regular">Regular</option>
            <option value="VIP">VIP 👑</option>
            <option value="Wholesale">Wholesale</option>
          </select>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className={`rounded-2xl border overflow-hidden ${
        isDark ? "bg-[#1e1e1e] border-[#2e2e2e]" : "bg-white border-gray-200 shadow-md"
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={`text-xs uppercase tracking-wider border-b ${
              isDark ? "bg-[#252525] text-gray-400 border-[#333]" : "bg-[#f8f6f8] text-gray-700 border-gray-200 font-bold"
            }`}>
              <tr>
                <th className="px-6 py-4 font-bold">Customer Details</th>
                <th className="px-6 py-4 font-bold">Contact Info</th>
                <th className="px-6 py-4 font-bold text-center">Category</th>
                <th className="px-6 py-4 font-bold">Birthday (DOB)</th>
                <th className="px-6 py-4 font-bold">Anniversary Date</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>

            <tbody className={`divide-y ${isDark ? "divide-[#2a2a2a]" : "divide-gray-200"}`}>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-500">
                    <RefreshCw size={24} className={`animate-spin mx-auto mb-2 ${isDark ? "text-amber-400" : "text-[#5A374F]"}`} />
                    Loading customer directory...
                  </td>
                </tr>
              ) : displayedList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-400">
                    <Users size={40} className="mx-auto mb-2 opacity-30" />
                    No customers found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                displayedList.map((cust) => {
                  const isBdayToday = cust.celebrationType === "BIRTHDAY" && cust.daysRemaining === 0;
                  const isAnniToday = cust.celebrationType === "ANNIVERSARY" && cust.daysRemaining === 0;

                  return (
                    <tr
                      key={cust._id}
                      className={`transition group ${
                        isDark ? "hover:bg-[#252525]/60 text-gray-300" : "hover:bg-[#FCF4FC] text-gray-800"
                      }`}
                    >
                      {/* Name & ID */}
                      <td className="px-6 py-4">
                        <div className={`font-bold transition flex items-center gap-2 ${
                          isDark ? "text-white group-hover:text-amber-400" : "text-gray-900 group-hover:text-[#5A374F]"
                        }`}>
                          {cust.name}
                          {isBdayToday && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-600 border border-pink-500/40 animate-pulse">
                              🎂 Birthday Today!
                            </span>
                          )}
                          {isAnniToday && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-600 border border-rose-500/40 animate-pulse">
                              💍 Anniversary Today!
                            </span>
                          )}
                          {cust.daysRemaining > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                              in {cust.daysRemaining} days
                            </span>
                          )}
                        </div>
                        {cust.city && <div className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{cust.city}</div>}
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1.5 text-xs font-mono font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                          <Phone size={13} className={isDark ? "text-amber-400" : "text-[#5A374F]"} />
                          {cust.mobile}
                        </div>
                        {cust.email && (
                          <div className={`flex items-center gap-1.5 text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            <Mail size={13} className="text-gray-400" />
                            {cust.email}
                          </div>
                        )}
                      </td>

                      {/* Category Badge */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            cust.customerType === "VIP"
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : cust.customerType === "Wholesale"
                              ? "bg-blue-100 text-blue-800 border border-blue-300"
                              : "bg-gray-100 text-gray-700 border border-gray-200"
                          }`}
                        >
                          {cust.customerType === "VIP" && <Award size={12} />}
                          {cust.customerType || "Regular"}
                        </span>
                      </td>

                      {/* Birthday */}
                      <td className="px-6 py-4">
                        {cust.dob ? (
                          <div className="flex items-center gap-2 text-xs font-semibold text-pink-700 bg-pink-50 px-2.5 py-1.5 rounded-lg border border-pink-200 w-fit">
                            <Cake size={13} />
                            {formatDate(cust.dob)}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>

                      {/* Anniversary */}
                      <td className="px-6 py-4">
                        {cust.anniversaryDate ? (
                          <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200 w-fit">
                            <Heart size={13} />
                            {formatDate(cust.anniversaryDate)}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Send WhatsApp Offer */}
                          <button
                            onClick={() =>
                              handleOpenOffer(
                                cust,
                                cust.celebrationType || (cust.dob ? "BIRTHDAY" : "ANNIVERSARY")
                              )
                            }
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                            title="Send WhatsApp Offer Message"
                          >
                            <Send size={13} />
                            Send Offer
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(cust)}
                            className={`p-1.5 rounded-lg transition ${
                              isDark ? "bg-[#2b2b2b] hover:bg-[#383838] text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
                            }`}
                            title="Edit Customer"
                          >
                            <Edit size={14} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(cust._id, cust.name)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition border border-red-200"
                            title="Delete Customer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <CustomerFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        customer={selectedCustomer}
        onSuccess={fetchData}
      />

      {/* Send Offer Modal */}
      <SendOfferModal
        isOpen={isOfferOpen}
        onClose={() => setIsOfferOpen(false)}
        customer={offerCustomer}
        celebrationType={offerType}
        onSuccess={fetchData}
      />
    </div>
  );
}
