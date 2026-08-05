
// import { Link } from "react-router-dom";
// import { Eye, Package, Truck, Check, Clock, X } from "lucide-react";

// export default function OrderTable({ orders }) {
//   if (!orders.length) {
//     return (
//       <div className="text-center py-20 text-gray-400">
//         No orders found
//       </div>
//     );
//   }

//   const getStatusTheme = (status) => {
//     switch (status) {
//       case "Placed":
//         return {
//           badge: "bg-purple-100 text-purple-700",
//           icon: <Clock className="w-4 h-4" />,
//           card: "from-purple-100 via-purple-50 to-white",
//         };

//       case "Ready":
//       case "Processing":
//         return {
//           badge: "bg-blue-100 text-blue-700",
//           icon: <Package className="w-4 h-4" />,
//           card: "blue-gradient-to-r from-blue-100 via-blue-50 to-white",
//         };

//           case "In-Process":
//         return {
//           badge: "bg-amber-100 text-amber-700",
//           icon: <Package className="w-4 h-4" />,
//           card: "blue-gradient-to-r from-amber-100 via-amber-50 to-white",
//         };

//       case "Shipped":
//         return {
//           badge: "bg-blue-100 text-blue-700",
//           icon: <Truck className="w-4 h-4" />,
//           card: "from-blue-100 via-blue-50 to-white",
//         };

//       case "Delivered":
//         return {
//           badge: "bg-green-100 text-green-700",
//           icon: <Check className="w-4 h-4" />,
//           card: "from-emerald-100 via-emerald-50 to-white",
//         };

//       case "Cancelled":
//         return {
//           badge: "bg-rose-100 text-rose-700",
//           icon: <X className="w-4 h-4" />,
//           card: "from-rose-100 via-rose-50 to-white",
//         };

//       default:
//         return {
//           badge: "bg-gray-100 text-gray-700",
//           icon: <Clock className="w-4 h-4" />,
//           card: "from-gray-100 via-gray-50 to-white",
//         };
//     }
//   };

//   return (
//     <div className="space-y-8">
//       {orders.map((o) => {
//         const theme = getStatusTheme(o.status);
//         const contact =
//           o.customer?.phone ||
//           o.customer?.mobile ||
//           o.customer?.contact ||
//           "—";

//         return (
//           <div
//             key={o._id}
//             className={`
//               relative overflow-hidden
//               bg-gradient-to-br ${theme.card}
//               rounded-3xl
//               border border-white/60
//               px-8 py-7
//               shadow-md
//               transition-all duration-300
//               hover:-translate-y-1 hover:shadow-xl
//             `}
//           >
//             {/* soft light overlay */}
//             <div 
//             className="absolute inset-0 opacity-20 bg-gradient-to-tr from-white via-transparent to-white pointer-events-none" />

//             <div className="relative flex flex-col xl:flex-row xl:items-center gap-10">

//               {/* LEFT */}
//               <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-16">

//                 <div>
//                   <div className="flex items-center gap-3 mb-4">
//                     <h3 className="text-xl font-semibold text-gray-900">
//                       {o.orderNo}
//                     </h3>

//                     <span
//                       className={`
//                         inline-flex items-center gap-1
//                         px-3 py-1
//                         rounded-full
//                         text-xs font-medium
//                         ${theme.badge}
//                       `}
//                     >
//                       {theme.icon}
//                       {o.status}
//                     </span>
//                   </div>

//                   <p className="text-sm text-gray-500 mb-1">Customer</p>
//                   <p className="font-medium text-gray-900">
//                     {o.customer?.name || "—"}
//                   </p>

//                   <p className="text-sm text-gray-500 mt-3 mb-1">
//                     Contact Number
//                   </p>
//                   <p className="font-medium text-gray-800">
//                     {contact}
//                   </p>
//                 </div>

//                 <div>
//                   <p className="text-sm text-gray-500 mb-1">Order Date</p>
//                   <p className="font-medium text-gray-900 mb-4">
//                     {o.orderDate || o.createdAt?.slice(0, 10)}
//                   </p>

//                   <p className="text-sm text-gray-500 mb-1">
//                     Payment Method
//                   </p>
//                   <p className="font-medium text-gray-900">
//                     {o.paymentMethod || "—"}
//                   </p>
//                 </div>

//                 <div className="md:col-span-2">
//                   <p className="text-sm text-gray-500 mb-1">
//                     Shipping Address
//                   </p>
//                   <p className="font-medium text-gray-900">
//                     {o.shippingAddress || "—"}
//                   </p>
//                 </div>
//               </div>

//               {/* RIGHT */}
//               <div className="flex flex-col items-end gap-6 min-w-[200px]">
//                 <div className="text-right">
//                   <p className="text-sm text-gray-500">Total Amount</p>
//                   {/* <p className="text-2xl font-semibold text-gray-900">
//                     ₹{o.total?.toLocaleString() || 0}
//                   </p> */}
//                   <p className="text-2xl font-semibold text-gray-900">
//   ₹{o.totals?.grandTotal?.toLocaleString() || 0}
// </p>

//                 </div>

//                 <Link
//                   to={`/orders/${o._id}`}
//                   className="
//                     inline-flex items-center gap-2
//                     px-5 py-2.5
//                     rounded-xl
//                     text-sm font-medium
//                     bg-white/70 backdrop-blur
//                     border border-gray-300
//                     hover:bg-white
//                     transition
//                   "
//                 >
//                   <Eye className="w-4 h-4" />
//                   View Details
//                 </Link>
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }


import { Link } from "react-router-dom";
import { Eye, Package, Truck, Check, Clock, X, Edit, Trash2 } from "lucide-react";
import { deleteOrderById } from "../api/orderApi";
import { useModal } from "../context/ModalContext";
import { toast } from "sonner";

export default function OrderTable({ orders, onRefresh }) {
  const { showConfirm } = useModal();

  const handleDelete = async (id, orderNo) => {
    const confirmed = await showConfirm(`Are you sure you want to delete order ${orderNo}? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteOrderById(id);
      toast.success("Order deleted successfully");
      onRefresh?.();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.response?.data?.message || "Failed to delete order");
    }
  };
  if (!orders || !orders.length) {
    return (
      <div className="text-center py-20 text-gray-400">
        No orders found
      </div>
    );
  }

  const getStatusTheme = (status) => {
    switch (status) {
      case "Placed":
        return {
          badge: "bg-purple-100 text-purple-700",
          icon: <Clock className="w-4 h-4" />,
          card: "from-purple-100 via-purple-50 to-white",
        };

      case "Ready":
      case "Processing":
        return {
          badge: "bg-blue-100 text-blue-700",
          icon: <Package className="w-4 h-4" />,
          card: "from-blue-100 via-blue-50 to-white",
        };

      case "In-Process":
        return {
          badge: "bg-amber-100 text-amber-700",
          icon: <Package className="w-4 h-4" />,
          card: "from-amber-100 via-amber-50 to-white",
        };

      case "Shipped":
        return {
          badge: "bg-indigo-100 text-indigo-700",
          icon: <Truck className="w-4 h-4" />,
          card: "from-indigo-100 via-indigo-50 to-white",
        };

      case "Delivered":
        return {
          badge: "bg-green-100 text-green-700",
          icon: <Check className="w-4 h-4" />,
          card: "from-emerald-100 via-emerald-50 to-white",
        };

      case "Cancelled":
        return {
          badge: "bg-rose-100 text-rose-700",
          icon: <X className="w-4 h-4" />,
          card: "from-rose-100 via-rose-50 to-white",
        };

      default:
        return {
          badge: "bg-gray-100 text-gray-700",
          icon: <Clock className="w-4 h-4" />,
          card: "from-gray-100 via-gray-50 to-white",
        };
    }
  };

  return (
    <div className="space-y-8">
      {orders.map((o) => {
        const theme = getStatusTheme(o.status);

        const contact =
          o.customer?.phone ||
          o.customer?.mobile ||
          o.customer?.contact ||
          "—";

        return (
          <div
            key={o._id}
            className={`
              relative overflow-hidden
              bg-gradient-to-br ${theme.card}
              rounded-3xl
              border border-white/60
              px-8 py-7
              shadow-md
              transition-all duration-300
              hover:-translate-y-1 hover:shadow-xl
            `}
          >
            {/* Soft overlay */}
            <div className="absolute inset-0 opacity-20 bg-gradient-to-tr from-white via-transparent to-white pointer-events-none" />

            <div className="relative flex flex-col xl:flex-row xl:items-center gap-10">

              {/* LEFT SECTION */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-16">

                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {o.orderNo}
                    </h3>

                    <span
                      className={`
                        inline-flex items-center gap-1
                        px-3 py-1
                        rounded-full
                        text-xs font-medium
                        ${theme.badge}
                      `}
                    >
                      {theme.icon}
                      {o.status}
                    </span>

                    {o.groupOrderNo && (
                      <Link
                        to={`/orders?search=${encodeURIComponent(o.groupOrderNo)}`}
                        className="text-[10px] bg-[#6B2E4A]/10 text-[#6B2E4A] border border-[#6B2E4A]/20 px-2.5 py-1 rounded-full font-semibold hover:bg-[#6B2E4A]/20 transition flex items-center gap-1"
                        title="View all items in this order group"
                      >
                        <Package className="w-3 h-3" />
                        Batch Order: {o.groupOrderNo}
                      </Link>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mb-1">Customer</p>
                  <p className="font-medium text-gray-900">
                    {o.customer?.name || "—"}
                  </p>

                  <p className="text-sm text-gray-500 mt-3 mb-1">
                    Contact Number
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-800">
                      {contact}
                    </p>
                    {o.customer?.mobile && (
                      <a
                        href={`/orders?search=${encodeURIComponent(o.customer.mobile)}`}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-[#6B2E4A]/10 text-[#6B2E4A] font-semibold hover:bg-[#6B2E4A]/20 transition whitespace-nowrap"
                      >
                        All Orders ↗
                      </a>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mt-3 mb-1">
                    Email
                  </p>
                  <p className="font-medium text-gray-800">
                    {o.customer?.email || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Order Date</p>
                  <p className="font-medium text-gray-900 mb-4">
                    {o.orderDate ||
                      (o.createdAt
                        ? new Date(o.createdAt).toLocaleDateString("en-IN")
                        : "—")}
                  </p>

                  <p className="text-sm text-gray-500 mb-1">
                    Advance Payment
                  </p>
                  <p className="font-medium text-gray-900">
                    ₹{o.advancePayment?.amount?.toLocaleString() || 0}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">
                    Address
                  </p>
                  <p className="font-medium text-gray-900">
                    {o.customer?.address || "Walk-in Customer"}
                  </p>
                </div>
              </div>

              {/* RIGHT SECTION */}
              <div className="flex flex-col items-end gap-6 min-w-[200px]">
                <div className="flex flex-col gap-3">
                  <Link
                    to={`/orders/${o._id}`}
                    className="
                      inline-flex items-center justify-center gap-2
                      px-5 py-2.5 min-w-[140px]
                      rounded-xl
                      text-sm font-medium
                      bg-white/70 backdrop-blur
                      border border-gray-300
                      hover:bg-white
                      transition
                    "
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Link>

                  <div className="flex gap-2">
                    <Link
                      to={`/orders/${o._id}/edit`}
                      className="
                        flex-1 inline-flex items-center justify-center gap-2
                        px-3 py-2.5
                        rounded-xl
                        text-xs font-medium
                        bg-amber-50 text-amber-700
                        border border-amber-200
                        hover:bg-amber-100
                        transition
                      "
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(o._id, o.orderNo)}
                      className="
                        flex-1 inline-flex items-center justify-center gap-2
                        px-3 py-2.5
                        rounded-xl
                        text-xs font-medium
                        bg-rose-50 text-rose-700
                        border border-rose-200
                        hover:bg-rose-100
                        transition
                      "
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}