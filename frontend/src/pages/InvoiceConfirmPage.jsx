


// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useCart } from "../context/CartContext";
// import API from "../api";

// export default function InvoiceConfirmPage() {
//   const { cart, loading } = useCart();
//   const navigate = useNavigate();

//   const [customer, setCustomer] = useState({
//     name: "",
//     mobile: "",
//   });

//   const [itemsMeta, setItemsMeta] = useState({});
//   const [submitting, setSubmitting] = useState(false);

//   /* ================= SAFETY RENDERS ================= */

//   if (loading) {
//     return <p className="p-10">Loading cart…</p>;
//   }

//   if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
//     return (
//       <div className="p-10">
//         <p className="mb-4">Cart is empty</p>
//         <button
//           onClick={() => navigate("/")}
//           className="border px-4 py-2"
//         >
//           Go to Products
//         </button>
//       </div>
//     );
//   }

//   /* ================= GENERATE INVOICE ================= */
//   const handleGenerateInvoice = async () => {
//     try {
//       if (!customer.name || !customer.mobile) {
//         alert("Customer name & mobile required");
//         return;
//       }

//       setSubmitting(true);

//       const res = await API.post(
//         "/sales-orders/confirm-invoice",
//         {
//           sessionId: cart.sessionId,
//           customer,
//           itemsMeta: cart.items.map((item) => ({
//             cartItemId: item._id,
//             hsn: itemsMeta[item._id]?.hsn || "",
//             certificateNo:
//               itemsMeta[item._id]?.certificateNo || "",
//           })),
//           payment: {
//             mode: "CASH",
//             status: "PAID",
//           },
//         }
//       );

//       navigate(`/invoice/${res.data.invoiceId}`);
//     } catch (err) {
//       console.error(err);
//       alert(
//         err.response?.data?.error ||
//           "Failed to generate invoice"
//       );
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   /* ================= UI ================= */

//   return (
//     <div className="max-w-3xl mx-auto p-6 space-y-6">
//       <h1 className="font-serif text-2xl">
//         Customer & Invoice Details
//       </h1>

//       {/* CUSTOMER */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <input
//           placeholder="Customer Name"
//           className="border p-3"
//           value={customer.name}
//           onChange={(e) =>
//             setCustomer({ ...customer, name: e.target.value })
//           }
//         />
//         <input
//           placeholder="Mobile Number"
//           className="border p-3"
//           value={customer.mobile}
//           onChange={(e) =>
//             setCustomer({
//               ...customer,
//               mobile: e.target.value,
//             })
//           }
//         />
//       </div>

//       {/* ITEMS META */}
//       <div className="space-y-4">
//         {cart.items.map((item) => (
//           <div key={item._id} className="border p-4">
//             <p className="font-medium mb-2">
//               {item.product?.title ||
//                 item.customSnapshot?.title ||
//                 "Item"}
//             </p>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//               <input
//                 placeholder="HSN Code"
//                 className="border p-2"
//                 value={itemsMeta[item._id]?.hsn || ""}
//                 onChange={(e) =>
//                   setItemsMeta((prev) => ({
//                     ...prev,
//                     [item._id]: {
//                       ...prev[item._id],
//                       hsn: e.target.value,
//                     },
//                   }))
//                 }
//               />
//               <input
//                 placeholder="Certificate No (optional)"
//                 className="border p-2"
//                 value={
//                   itemsMeta[item._id]?.certificateNo || ""
//                 }
//                 onChange={(e) =>
//                   setItemsMeta((prev) => ({
//                     ...prev,
//                     [item._id]: {
//                       ...prev[item._id],
//                       certificateNo: e.target.value,
//                     },
//                   }))
//                 }
//               />
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* FINAL ACTION */}
//       <button
//         disabled={submitting}
//         onClick={handleGenerateInvoice}
//         className="w-full bg-emerald-900 text-white py-4 uppercase tracking-widest disabled:opacity-60"
//       >
//         {submitting
//           ? "Generating Invoice..."
//           : "Generate Invoice"}
//       </button>
//     </div>
//   );
// }
