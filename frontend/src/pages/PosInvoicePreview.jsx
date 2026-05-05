// import {useNavigate, useParams } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { getPosInvoiceById } from "../api/posInvoiceApi";
// import Invoice from "./Invoice";


// export default function PosInvoicePreview() {
//   const navigate = useNavigate();

//   const { id } = useParams();
//   const [ready, setReady] = useState(false);

//   useEffect(() => {
//     getPosInvoiceById(id).then((res) => {
//       const inv = res.data.invoice;

//       // 🔥 MAP POS INVOICE → INVOICE.JSX FORMAT
//       const mappedInvoice = {
//         invoiceNo: inv.invoiceNo,
//         date: new Date(inv.createdAt).toLocaleDateString("en-IN"),

//         customer: inv.customer,

//         // POS = first item only
//         product: {
//           sku: inv.items?.[0]?.sku || "",
//           title: inv.items?.[0]?.title || "",
//           description: inv.items?.[0]?.title || "",
//           metalPurity: "",
//           metalWeight: 0,
//           grossWeight: 0,
//           fineGold: 0,
//           diamondSelected: false,
//           otherStoneSelected: false,
//         },

//         qty: inv.items?.[0]?.qty || 1,

//         pricing: {
//           subtotal: inv.pricing?.subtotal || 0,
//           gst: inv.pricing?.gst || 0,
//           grandTotal: inv.pricing?.grandTotal || 0,
//           discount: 0,
//           metalRate: 0,
//           diamondRate: 0,
//           stoneRate: 0,
//           makingCharge: 0,
//         },
//                 // 🔥 NEW: PAYMENT DETAILS (MISSING PART)
//         paymentMode: inv.paymentMode || "Cash",
//         transactionRef: inv.transactionRef || "",
 
//         invoiceId: inv._id,

//         items: inv.items,
//         source: "POS",
//       };

//       localStorage.setItem("invoiceData", JSON.stringify(mappedInvoice));
//       setReady(true);
//     });
//   }, [id]);

//   if (!ready) return <p className="p-6">Loading invoice...</p>;

//   return(
//   <div className="relative">
//     {/* INVOICE PREVIEW */}
//     <Invoice />

//     {/* CREDIT NOTE ACTION */}
//     <div className="max-w-5xl mx-auto mt-6 flex justify-end print:hidden">
//       <button
//         onClick={() => navigate(`/credit-note/${id}`)}
//         className="px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700"
//       >
//         Create Credit Note
//       </button>
//     </div>
//   </div>
// );
// ;
// }
