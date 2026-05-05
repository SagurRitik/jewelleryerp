
// import React from "react";

// /* ================= UTILS ================= */
// const format = (n) =>
//   Number(n || 0).toLocaleString("en-IN", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   });

// export default function TotalsBar({ totals }) {
//   if (!totals) return null;

//   const {
//   subtotal = 0,
//   gst = 0,
//   grandTotal = 0,

//   advancePayment = 0,
//   metalPayment = 0,
//   payable = grandTotal,

//   discount = 0,
//   discountDiamond = 0,
//   discountStone = 0,
//   discountMaking = 0,
// } = totals;


//   // ✅ single source of truth
//   const totalDiscount =
//     discount > 0
//       ? discount
//       : discountDiamond + discountStone + discountMaking;

//   const hasDiscount = totalDiscount > 0;

// return (
//   <div className="bg-white p-6 md:p-8 rounded-xl border">
//     <h3 className="font-serif text-xl mb-6">Summary</h3>

//     <div className="space-y-3.5">

//       {/* SUBTOTAL */}
//       <Row label="Subtotal" value={subtotal} />

//       {/* DISCOUNTS */}
//       {hasDiscount && (
//         <div className="pt-2 border-t border-dashed border-red-200 space-y-1">
//           <div className="text-[10px] uppercase tracking-wider text-red-500 font-semibold">
//             Discounts Applied
//           </div>

//           {discountDiamond > 0 && (
//             <Row label="Diamond Discount" value={-discountDiamond} muted />
//           )}

//           {discountStone > 0 && (
//             <Row label="Stone Discount" value={-discountStone} muted />
//           )}

//           {discountMaking > 0 && (
//             <Row label="Making Discount" value={-discountMaking} muted />
//           )}

//           <Row label="Total Discount" value={-totalDiscount} bold />
//         </div>
//       )}

//       {/* GST */}
//       <Row label="GST" value={gst} muted />

//       {/* GRAND TOTAL */}
//       <Row label="Grand Total" value={grandTotal} bold />

//       {/* 🔥 PAYMENT ADJUSTMENTS */}
//       {(advancePayment > 0 || metalPayment > 0) && (
//         <div className="pt-2 border-t border-dashed border-amber-200 space-y-1">
//           <div className="text-[10px] uppercase tracking-wider text-amber-600 font-semibold">
//             Payment Adjustments
//           </div>

//           {advancePayment > 0 && (
//             <Row label="Advance Payment" value={-advancePayment} muted />
//           )}

//           {metalPayment > 0 && (
//             <Row label="Metal Payment" value={-metalPayment} muted />
//           )}
//         </div>
//       )}
//     </div>

//     <div className="my-6 border-t border-neutral-200" />

//     {/* ✅ FINAL PAYABLE */}
//     <div className="flex justify-between items-end">
//       <span className="text-base font-medium text-neutral-500">
//         Total Payable
//       </span>

//       <div className="text-right">
//         <span className="text-xs text-neutral-400 font-mono block">
//           INR
//         </span>
//         <span className="text-3xl font-serif font-medium text-emerald-900">
//           ₹{format(payable)}
//         </span>
//       </div>
//     </div>
//   </div>
// );
// }
// /* ================= ROW ================= */
// const Row = ({ label, value, muted, bold }) => (
//   <div className="flex justify-between items-center">
//     <span
//       className={`text-sm ${
//         muted ? "text-neutral-400" : "text-neutral-600"
//       } ${bold ? "font-medium" : ""}`}
//     >
//       {label}
//     </span>

//     <span
//       className={`font-mono text-sm ${
//         bold ? "font-semibold" : "font-medium"
//       }`}
//     >
//       ₹{format(value)}
//     </span>
//   </div>
// );



import React from "react";
import { Receipt } from "lucide-react";

/* ================= UTILS ================= */
const format = (n) =>
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function TotalsBar({ totals }) {
  if (!totals) return null;

  const {
    subtotal = 0,
    gst = 0,
    grandTotal = 0,
    grossTotal ,

    advancePayment = 0,
    metalPayment = 0,
    payable = grandTotal,

    discount = 0,
    discountDiamond = 0,
    discountStone = 0,
    discountMaking = 0,
  } = totals;

  // ✅ single source of truth
  const totalDiscount =
    discount > 0
      ? discount
      : discountDiamond + discountStone + discountMaking;

  const hasDiscount = totalDiscount > 0;

  return (
    <div className="bg-[#5D2B46] text-white p-6 md:p-8 rounded-xl shadow-sm w-full font-sans">
      
      {/* HEADER */}
      <div className="flex items-center gap-2.5 mb-7">
        <Receipt size={16} strokeWidth={2.5} className="text-white" />
        <h3 className="text-[11px] font-bold tracking-[0.15em] uppercase text-white">
          Order Summary
        </h3>
      </div>

      {/* LINE ITEMS */}
      <div className="space-y-4">
        
      <Row className="space-y-1" label="Total Value" value={grossTotal} bold />

        {/* DISCOUNTS */}
        {hasDiscount && (
          <div className="space-y-4 pt-2">
            {/* {discountDiamond > 0 && <Row label="Diamond Discount" value={-discountDiamond} />}
            {discountStone > 0 && <Row label="Stone Discount" value={-discountStone} />}
            {discountMaking > 0 && <Row label="Making Discount" value={-discountMaking} />} */}
            {totalDiscount > 0 && <Row label="Total Discount" value={-totalDiscount} />}
          </div>
        )}

        {/* SUBTOTAL */}
        <Row label="Subtotal" value={subtotal} />

        {/* GST */}
        <Row label="GST" value={gst} />

        {/* GRAND TOTAL (Only show if there are subsequent adjustments) */}
        {(advancePayment > 0 || metalPayment > 0) && (
          <Row label="Grand Total" value={grandTotal} bold />
        )}

        {/* 🔥 PAYMENT ADJUSTMENTS */}
        {(advancePayment > 0 || metalPayment > 0) && (
          <div className="space-y-4">
            {advancePayment > 0 && (
              <Row label="Advance Payment" value={-advancePayment} />
            )}
            {metalPayment > 0 && (
              <Row label="Old Gold Credit" value={-metalPayment} />
            )}
          </div>
        )}
      </div>

      <div className="my-6 border-t border-white/10" />

      {/* ✅ FINAL PAYABLE */}
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/80">
          Total Payable
        </span>

        <span className="text-2xl md:text-[28px] font-bold text-white tracking-tight">
          ₹{format(payable)}
        </span>
      </div>
      
    </div>
  );
}

/* ================= ROW ================= */
const Row = ({ label, value, bold }) => {
  const isNegative = value < 0;
  const absValue = Math.abs(value);

  return (
    <div className="flex justify-between items-center">
      <span
        className={`text-[13px] ${
          bold ? "text-white font-semibold" : "text-white/80 font-light"
        }`}
      >
        {label}
      </span>

      <span
        className={`text-[13px] ${
          bold ? "text-white font-bold" : "text-white font-medium"
        } tracking-wide`}
      >
        {isNegative ? "-" : ""}₹{format(absValue)}
      </span>
    </div>
  );
};