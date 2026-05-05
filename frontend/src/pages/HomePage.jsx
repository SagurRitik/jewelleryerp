// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { fetchLiveMetalRates } from "../api/metalRateApi";
// import { TrendingUp, RefreshCw } from "lucide-react";

// export default function HomePage() {
//   const [goldRate, setGoldRate] = useState(null);
//   const [silverRate, setSilverRate] = useState(null);
//   const [updatedAt, setUpdatedAt] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const loadRates = async () => {
//     try {
//       setLoading(true);
//       const res = await fetchLiveMetalRates();

//       if (!res || !Array.isArray(res.rates)) {
//         setError("Invalid rate data");
//         return;
//       }

//       const gold = res.rates.find(r => r.metal === "GOLD");
//       const silver = res.rates.find(r => r.metal === "SILVER");

//       setGoldRate(gold?.ratePerGram ?? null);
//       setSilverRate(silver?.ratePerGram ?? null);
//       setUpdatedAt(res.updatedAt ?? null);
//       setError("");
//     } catch (err) {
//       console.error(err);
//       setError("Server not responding");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // initial load + auto refresh
//   useEffect(() => {
//     loadRates();
//     const interval = setInterval(loadRates, 60000); // 60 sec
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="min-h-screen bg-[#FDFBF7] px-4 sm:px-8 py-10 font-sans">

//       {/* HEADER */}
//       <header className="max-w-7xl mx-auto mb-12">
//         <h1 className="font-serif text-4xl sm:text-5xl text-stone-900 tracking-tight">
//           Jewellery Dashboard
//         </h1>
//         <p className="text-stone-500 mt-2">
//           Live bullion rates & inventory overview
//         </p>
//       </header>

//       {/* CONTENT */}
//       <div className="max-w-7xl mx-auto">
//         {loading ? (
//           <div className="flex items-center gap-3 text-stone-500">
//             <RefreshCw className="animate-spin" size={18} />
//             Fetching live metal rates…
//           </div>
//         ) : error ? (
//           <div className="text-red-600">{error}</div>
//         ) : (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4 }}
//             className="grid grid-cols-1 sm:grid-cols-2 gap-8"
//           >
//             {/* GOLD CARD */}
//             <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="font-serif text-2xl text-stone-800">
//                   Gold 24K
//                 </h2>
//                 <TrendingUp className="text-amber-600" />
//               </div>

//               <p className="text-4xl font-semibold text-stone-900">
//                 {goldRate ? `₹ ${goldRate}` : "—"}
//                 <span className="text-base font-normal text-stone-500">
//                   {" "} / g
//                 </span>
//               </p>

//               {updatedAt && (
//                 <p className="text-xs text-stone-400 mt-3">
//                   Updated at {new Date(updatedAt).toLocaleTimeString()}
//                 </p>
//               )}
//             </div>

//             {/* SILVER CARD */}
//             <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="font-serif text-2xl text-stone-800">
//                   Silver
//                 </h2>
//                 <TrendingUp className="text-slate-500" />
//               </div>

//               <p className="text-4xl font-semibold text-stone-900">
//                 {silverRate ? `₹ ${silverRate}` : "—"}
//                 <span className="text-base font-normal text-stone-500">
//                   {" "} / g
//                 </span>
//               </p>

//               <p className="text-xs text-stone-400 mt-3">
//                 Auto-updated every 60 sec
//               </p>
//             </div>
//           </motion.div>
//         )}
//       </div>
//     </div>
//   );
// }


// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { fetchLiveMetalRates } from "../api/metalRateApi";
// import {
//   TrendingUp,
//   RefreshCw,
//   Search,
//   PlusCircle,
//   CreditCard,
//   Boxes,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// export default function HomePage() {
//   const navigate = useNavigate();

//   const [goldRate, setGoldRate] = useState(null);
//   const [silverRate, setSilverRate] = useState(null);
//   const [updatedAt, setUpdatedAt] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [search, setSearch] = useState("");

//   const loadRates = async () => {
//     try {
//       setLoading(true);
//       const res = await fetchLiveMetalRates();

//       if (!res || !Array.isArray(res.rates)) {
//         setError("Invalid rate data");
//         return;
//       }

//       const gold = res.rates.find((r) => r.metal === "GOLD");
//       const silver = res.rates.find((r) => r.metal === "SILVER");

//       setGoldRate(gold?.ratePerGram ?? null);
//       setSilverRate(silver?.ratePerGram ?? null);
//       setUpdatedAt(res.updatedAt ?? null);
//       setError("");
//     } catch (err) {
//       setError("Server not responding");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadRates();
//     const interval = setInterval(loadRates, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="min-h-screen bg-[#FDFBF7] px-4 sm:px-8 py-10 font-sans">
//       {/* HEADER */}
//       <header className="max-w-7xl mx-auto mb-10">
//         <h1 className="font-serif text-4xl text-stone-900 tracking-tight">
//           Jewellery POS Dashboard
//         </h1>
//         <p className="text-stone-500 mt-2">
//           Live metal rates & quick operations
//         </p>
//       </header>

//       <div className="max-w-7xl mx-auto space-y-10">
//         {/* ================= LIVE METAL RATES ================= */}
//         {loading ? (
//           <div className="flex items-center gap-3 text-stone-500">
//             <RefreshCw className="animate-spin" size={18} />
//             Fetching live metal rates…
//           </div>
//         ) : error ? (
//           <div className="text-red-600">{error}</div>
//         ) : (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4 }}
//             className="grid grid-cols-1 md:grid-cols-2 gap-8"
//           >
//             {/* GOLD */}
//             <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-3xl p-8 shadow-sm">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="font-serif text-2xl text-stone-800">
//                   Gold 24K
//                 </h2>
//                 <TrendingUp className="text-amber-600" />
//               </div>

//               <p className="text-5xl font-semibold text-stone-900">
//                 {goldRate ? `₹ ${goldRate}` : "—"}
//                 <span className="text-lg font-normal text-stone-500">
//                   {" "}
//                   / g
//                 </span>
//               </p>

//               {updatedAt && (
//                 <p className="text-xs text-stone-400 mt-4">
//                   Updated at{" "}
//                   {new Date(updatedAt).toLocaleTimeString("en-IN")}
//                 </p>
//               )}
//             </div>

//             {/* SILVER */}
//             <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-3xl p-8 shadow-sm">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="font-serif text-2xl text-stone-800">
//                   Silver
//                 </h2>
//                 <TrendingUp className="text-slate-500" />
//               </div>

//               <p className="text-5xl font-semibold text-stone-900">
//                 {silverRate ? `₹ ${silverRate}` : "—"}
//                 <span className="text-lg font-normal text-stone-500">
//                   {" "}
//                   / g
//                 </span>
//               </p>

//               <p className="text-xs text-stone-400 mt-4">
//                 Auto refresh every 60 sec
//               </p>
//             </div>
//           </motion.div>
//         )}

//         {/* ================= SEARCH ================= */}
//         <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
//           <div className="flex items-center gap-4">
//             <div className="p-3 bg-stone-100 rounded-xl">
//               <Search size={20} className="text-stone-600" />
//             </div>
//             <input
//               type="text"
//               placeholder="Search inventory, orders, invoices…"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="flex-1 text-lg outline-none placeholder:text-stone-400"
//             />
//           </div>
//         </div>

//         {/* ================= QUICK ACTIONS ================= */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//           <button
//             onClick={() => navigate("/orders/new")}
//             className="bg-white border border-stone-200 rounded-2xl p-6 flex items-center gap-4 hover:shadow-md transition"
//           >
//             <PlusCircle className="text-emerald-600" size={28} />
//             <div className="text-left">
//               <p className="font-semibold text-stone-900">New Order</p>
//               <p className="text-sm text-stone-500">
//                 Create custom jewellery order
//               </p>
//             </div>
//           </button>

//           <button
//             onClick={() => navigate("/pos")}
//             className="bg-white border border-stone-200 rounded-2xl p-6 flex items-center gap-4 hover:shadow-md transition"
//           >
//             <CreditCard className="text-indigo-600" size={28} />
//             <div className="text-left">
//               <p className="font-semibold text-stone-900">Billing</p>
//               <p className="text-sm text-stone-500">
//                 POS & invoice generation
//               </p>
//             </div>
//           </button>

//           <button
//             onClick={() => navigate("/inventory")}
//             className="bg-white border border-stone-200 rounded-2xl p-6 flex items-center gap-4 hover:shadow-md transition"
//           >
//             <Boxes className="text-amber-600" size={28} />
//             <div className="text-left">
//               <p className="font-semibold text-stone-900">Inventory</p>
//               <p className="text-sm text-stone-500">
//                 Stock & product management
//               </p>
//             </div>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


// import { useEffect, useState } from "react";
// import API from "../api"; // Aapka axios instance
// import { DollarSign, ShoppingBag, Package, TrendingUp } from "lucide-react";

// export default function HomePage() {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchDashboard = async () => {
//       try {
//         const res = await API.get("/dashboard/stats");
//         setData(res.data);
//       } catch (err) {
//         console.error("Dashboard Load Error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchDashboard();
//   }, []);

//   if (loading) return <div className="p-10">Loading Dashboard...</div>;

//   const { stats, recentOrders, topProducts } = data || {};

//   return (
//     <div className="p-6 max-w-7xl mx-auto space-y-6">
      
//       {/* 1. TOP CARDS */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <StatCard title="Total Revenue" value={`₹${stats?.totalRevenue?.toLocaleString()}`} icon={<DollarSign />} color="bg-purple-100 text-purple-700" />
//         <StatCard title="Total Orders" value={stats?.totalOrders} icon={<ShoppingBag />} color="bg-blue-100 text-blue-700" />
//         <StatCard title="Inventory Items" value={stats?.inventoryItems} icon={<Package />} color="bg-yellow-100 text-yellow-700" />
//         <StatCard title="Avg. Order Value" value={`₹${stats?.avgOrderValue}`} icon={<TrendingUp />} color="bg-green-100 text-green-700" />
//       </div>

//       {/* 2. RECENT ORDERS TABLE */}
//       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//         <h2 className="text-lg font-bold mb-4">Recent Orders</h2>
//         <table className="w-full text-sm">
//           <thead>
//             <tr className="text-left text-gray-500">
//               <th className="pb-2">Invoice No</th>
//               <th className="pb-2">Customer</th>
//               <th className="pb-2">Amount</th>
//               <th className="pb-2">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {recentOrders?.map((order) => (
//               <tr key={order._id} className="border-t">
//                 <td className="py-3 font-mono">{order.invoiceNo}</td>
//                 <td>{order.customer?.name}</td>
//                 <td className="font-bold">₹{order.totals?.grandTotal?.toLocaleString()}</td>
//                 <td>
//                   <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
//                     {order.payment?.status || "Paid"}
//                   </span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//     </div>
//   );
// }

// // Simple Stat Card Component
// function StatCard({ title, value, icon, color }) {
//   return (
//     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
//       <div>
//         <p className="text-sm text-gray-500 mb-1">{title}</p>
//         <h3 className="text-2xl font-bold">{value}</h3>
//       </div>
//       <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
//     </div>
//   );
// }