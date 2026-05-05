// import { useEffect, useState, useCallback } from "react";
// import { getPosInvoices } from "../api/posInvoiceApi";
// import { useNavigate } from "react-router-dom";

// export default function PosInvoices() {
//   const navigate = useNavigate();

//   /* ================= STATE ================= */
//   const [invoices, setInvoices] = useState([]);
//   const [page, setPage] = useState(1);
//   const [limit] = useState(10);
//   const [totalPages, setTotalPages] = useState(1);

//   const [search, setSearch] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [sort, setSort] = useState("date-desc");

//   const [loading, setLoading] = useState(false);

//   /* ================= FETCH (MEMOIZED) ================= */
//   const fetchInvoices = useCallback(async () => {
//     try {
//       setLoading(true);

//       const res = await getPosInvoices({
//         page,
//         limit,
//         search,
//         fromDate,
//         toDate,
//         sort,
//       });

//       setInvoices(res.data.invoices);
//       setTotalPages(res.data.pagination.totalPages);
//     } catch (err) {
//       console.error("Failed to load POS invoices", err);
//     } finally {
//       setLoading(false);
//     }
//   }, [page, limit, search, fromDate, toDate, sort]);

//   /* ================= EFFECT ================= */
//   useEffect(() => {
//     fetchInvoices();
//   }, [fetchInvoices]);

//   /* ================= UI ================= */
//   return (
//     <div className="max-w-7xl mx-auto p-6">
//       <h1 className="text-2xl tracking-widest uppercase mb-6">
//         POS Invoice History
//       </h1>

//       {/* 🔍 FILTERS */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//         <input
//           type="text"
//           placeholder="Search Invoice / Customer"
//           value={search}
//           onChange={(e) => {
//             setPage(1);
//             setSearch(e.target.value);
//           }}
//           className="border p-2 rounded"
//         />

//         <input
//           type="date"
//           value={fromDate}
//           onChange={(e) => {
//             setPage(1);
//             setFromDate(e.target.value);
//           }}
//           className="border p-2 rounded"
//         />

//         <input
//           type="date"
//           value={toDate}
//           onChange={(e) => {
//             setPage(1);
//             setToDate(e.target.value);
//           }}
//           className="border p-2 rounded"
//         />

//         <select
//           value={sort}
//           onChange={(e) => {
//             setPage(1);
//             setSort(e.target.value);
//           }}
//           className="border p-2 rounded"
//         >
//           <option value="date-desc">Date ↓</option>
//           <option value="date-asc">Date ↑</option>
//           <option value="amount-desc">Amount ↓</option>
//           <option value="amount-asc">Amount ↑</option>
//         </select>
//       </div>

//       {/* 📋 TABLE */}
//       <div className="overflow-x-auto border rounded">
//         <table className="w-full text-sm">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="p-3 text-left">Invoice No</th>
//               <th>Date</th>
//               <th>Customer</th>
//               <th>Total</th>
//               <th></th>
//             </tr>
//           </thead>

//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan="5" className="p-6 text-center">
//                   Loading...
//                 </td>
//               </tr>
//             ) : invoices.length === 0 ? (
//               <tr>
//                 <td colSpan="5" className="p-6 text-center">
//                   No invoices found
//                 </td>
//               </tr>
//             ) : (
//               invoices.map((inv) => (
//                 <tr key={inv._id} className="border-t hover:bg-gray-50">
//                   <td className="p-3 font-mono">{inv.invoiceNo}</td>
//                   <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
//                   <td>{inv.customer?.name || "Walk-in"}</td>
//                   <td>₹ {inv.pricing?.grandTotal}</td>
//                   <td>
//                     <button
//                       onClick={() =>
//                         navigate(`/pos-invoices/${inv._id}`)
//                       }
//                       className="text-[#5A374F] font-semibold"
//                     >
//                       View
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* 🔢 PAGINATION */}
//       <div className="flex justify-between items-center mt-6">
//         <button
//           disabled={page === 1}
//           onClick={() => setPage((p) => p - 1)}
//           className="px-4 py-2 border rounded disabled:opacity-40"
//         >
//           Prev
//         </button>

//         <span>
//           Page {page} of {totalPages}
//         </span>

//         <button
//           disabled={page === totalPages}
//           onClick={() => setPage((p) => p + 1)}
//           className="px-4 py-2 border rounded disabled:opacity-40"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// }
