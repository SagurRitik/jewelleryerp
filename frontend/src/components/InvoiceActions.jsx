// import { createInvoice } from "../api/invoiceApi";
// import { useNavigate } from "react-router-dom";

// export default function InvoiceActions({ order }) {
//   const navigate = useNavigate();

//   const handleInvoice = async () => {
//     try {
//       const res = await createInvoice(order._id, {
//         pricing: {
//           subtotal: 0, // backend calculate karega later
//           gst: 0,
//           grandTotal: 0,
//         },
//         paymentMode: "UPI",
//       });
//       if (!invoiceId) {
//   alert("Invoice ID not returned from server");
//   return;
// }

//      navigate(`/invoice/${res.data.invoice._id}`);

//     } catch (err) {
//       alert(
//         err.response?.data?.message ||
//           "Manufacturing details incomplete. Invoice cannot be generated."
//       );
//     }
//   };

//   const invoiceId =
//     typeof order.finalInvoice === "object"
//       ? order.finalInvoice?._id
//       : order.finalInvoice;

//   return (
//     <>
//       {order.status === "Ready" && !order.finalInvoice && (
//         <button
//           onClick={handleInvoice}
//           className="btn-primary mt-6"
//         >
//           Confirm & Generate Invoice
//         </button>
//       )}

//       {order.finalInvoice && invoiceId && (
//         <button
//           onClick={() => navigate(`/invoice/${invoiceId}`)}
//           className="btn-secondary mt-6"
//         >
//           View Invoice
//         </button>
//       )}
//     </>
//   );
// }

import { createInvoice } from "../api/invoiceApi";
import { useNavigate } from "react-router-dom";

export default function InvoiceActions({ order }) {
  const navigate = useNavigate();

  const handleInvoice = async () => {
    try {
      const res = await createInvoice(order._id, {});

      const invoiceId = res.data?.invoice?._id;
      if (!invoiceId) {
        alert("Invoice ID not received from server");
        return;
      }

      navigate(`/invoice/${invoiceId}`);
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Invoice cannot be generated"
      );
    }
  };

  const invoiceId =
    typeof order.finalInvoice === "object"
      ? order.finalInvoice?._id
      : order.finalInvoice;

  return (
    <>
      {order.status === "Ready" && !order.finalInvoice && (
        <button
          onClick={handleInvoice}
          className="btn-primary mt-6"
        >
          Confirm & Generate Invoice
        </button>
      )}

      {invoiceId && (
        <button
          onClick={() => navigate(`/invoice/${invoiceId}`)}
          className="btn-secondary mt-6"
        >
          View Invoice
        </button>
      )}
    </>
  );
}
