


// import React, { memo, useMemo } from "react";

// /* ================= FORMATTER ================= */
// const format = (n) =>
//   Number(n || 0).toLocaleString("en-IN", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   });

// /* ================= ROW ================= */
// const Row = memo(function Row({
//   label,
//   value,
//   muted,
//   bold,
//   negative,
//   highlight,
// }) {
//   return (
//     <div
//       className={`flex justify-between items-center text-sm ${
//         bold ? "font-semibold text-neutral-900" : "text-neutral-600"
//       } ${highlight ? "text-emerald-700" : ""}`}
//     >
//       <span className={muted ? "text-neutral-400" : ""}>{label}</span>

//       <span
//         className={`font-mono ${
//           negative ? "text-red-500" : highlight ? "text-emerald-700" : ""
//         }`}
//       >
//         ₹{format(value)}
//       </span>
//     </div>
//   );
// });

// /* ================= CALCULATOR ================= */
// function ItemCalculator({ breakup, quantity = 1 }) {
//   if (!breakup) return null;

//   const v = useMemo(
//     () => ({
//       metalRate: breakup.metalRate ?? 0,
//       metalValue: breakup.metalValue ?? 0,
//       makingCharge: breakup.makingCharge ?? 0,

//       grossTotal: breakup.grossTotal ?? 0,

//       diamondValue: breakup.diamondValue ?? 0,
//       stoneValue: breakup.stoneValue ?? 0,

//       discountDiamond: breakup.discountDiamond ?? 0,
//       discountStone: breakup.discountStone ?? 0,
//       discountMaking: breakup.discountMaking ?? 0,
//       totalDiscount: breakup.discount ?? 0,

//       subtotal: breakup.subtotal ?? 0,
//       gst: breakup.gst ?? 0,
//       gstPercent: breakup.gstPercent ?? 3,
//       grandTotal: breakup.grandTotal ?? 0,

//       advancePayment: breakup.advanceUsed ?? 0,
//       metalPayment: breakup.metalUsed ?? 0,
//       payable: breakup.payable ?? breakup.grandTotal ?? 0,

//       netWeight: breakup.netWeight ?? 0,
//       components: Array.isArray(breakup.componentBreakup)
//         ? breakup.componentBreakup
//         : [],
//     }),
//     [breakup]
//   );

//   return (
//     <div className="space-y-4 text-sm">

//       {/* 🧾 BASIC INFO */}
//       <div className="bg-neutral-50 rounded-xl p-3 space-y-1 border border-neutral-100">
//         <div className="flex justify-between text-xs text-neutral-500">
//           <span>Quantity</span>
//           <span className="font-mono">{quantity}</span>
//         </div>

       
//       </div>

//       {/* 🔩 METAL SECTION */}
//       <div className="space-y-2">
//         <Row
//           label={`Metal Value @ ₹${format(v.metalRate)}/g`}
//           value={v.metalValue}
//         />
//       </div>

//       {/* 🔨 MAKING */}
//       <Row label="Making Charges" value={v.makingCharge} />

//       {/* 📦 TOTAL CHARGES (BEFORE DISCOUNT) */}
// <div className="border-t pt-3">
//   <Row
//     label="Total Charges"
//     value={v.grossTotal}
//     bold
//   />
// </div>

//       {/* 🏷 DISCOUNTS */}
//       {v.totalDiscount > 0 && (
//         <div className="bg-red-50 rounded-xl p-3 border border-red-100 space-y-1">
//           <div className="text-xs uppercase tracking-wider text-red-500 font-semibold">
//             Discounts Applied
//           </div>

//           {v.discountDiamond > 0 && (
//             <Row
//               label="Diamond Discount"
//               value={v.discountDiamond}
//               negative
//             />
//           )}

//           {v.discountStone > 0 && (
//             <Row
//               label="Stone Discount"
//               value={v.discountStone}
//               negative
//             />
//           )}

//           {v.discountMaking > 0 && (
//             <Row
//               label="Making Discount"
//               value={v.discountMaking}
//               negative
//             />
//           )}

//           <Row
//             label="Total Discount"
//             value={v.totalDiscount}
//             negative
//             bold
//           />
//         </div>
//       )}

//       {/* 📦 SUBTOTAL */}
//       <div className="border-t pt-3">
//         <Row label="Subtotal" value={v.subtotal} bold />
//       </div>

//       {/* 🧾 GST */}
//       {v.gst > 0 && (
//         <Row
//           label={`GST (${v.gstPercent}%)`}
//           value={v.gst}
//           muted
//         />
//       )}

//       {/* 💰 GRAND TOTAL */}
//       <div className="border-t pt-3">
//         <Row label="Grand Total" value={v.grandTotal} bold />
//       </div>

//       {/* 💳 PAYMENTS DEDUCTION */}
//       {(v.advancePayment > 0 || v.metalPayment > 0) && (
//         <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 space-y-1">
//           <div className="text-xs uppercase tracking-wider text-amber-600 font-semibold">
//             Payment Adjustments
//           </div>

//           {v.advancePayment > 0 && (
//             <Row
//               label="Advance Payment"
//               value={v.advancePayment}
//               negative
//             />
//           )}

//           {v.metalPayment > 0 && (
//             <Row
//               label="Metal Payment"
//               value={v.metalPayment}
//               negative
//             />
//           )}
//         </div>
//       )}

//       {/* ✅ FINAL PAYABLE */}
//       <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 shadow-sm">
//         <div className="flex justify-between items-end">
//           <span className="uppercase tracking-wider text-xs font-semibold text-neutral-600">
//             Payable Amount
//           </span>

//           <span className="text-2xl font-bold font-mono text-emerald-700">
//             ₹{format(v.payable)}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default memo(ItemCalculator);





import React, { memo, useMemo } from "react";
import { Tag, Scale } from "lucide-react";

/* ================= FORMATTER ================= */
const format = (n) =>
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/* ================= ROW ================= */
const Row = memo(function Row({
  label,
  value,
  muted,
  bold,
  negative,
  highlight,
}) {
  return (
    <div className={`flex justify-between items-center text-[11px] mb-2 last:mb-0`}>
      <span className={`${muted ? "text-gray-400" : "text-gray-500"} ${bold ? "font-bold text-gray-700" : ""}`}>
        {label}
      </span>
      <span className={`font-medium ${negative ? "text-red-500" : highlight ? "text-emerald-700" : "text-gray-800"} ${bold ? "font-bold" : ""}`}>
        {negative ? "-" : ""}₹{format(Math.abs(value))}
      </span>
    </div>
  );
});

/* ================= CALCULATOR ================= */
function ItemCalculator({ breakup, quantity = 1 }) {
  if (!breakup) return null;

  const v = useMemo(
    () => ({
      metalRate: breakup.metalRate ?? 0,
      metalValue: breakup.metalValue ?? 0,
      makingCharge: breakup.makingCharge ?? 0,

      diamondValue: breakup.diamondValue ?? 0,
      stoneValue: breakup.stoneValue ?? 0,

      grossTotal: breakup.grossTotal ?? 0,

      discountDiamond: breakup.discountDiamond ?? 0,
      discountStone: breakup.discountStone ?? 0,
      discountMaking: breakup.discountMaking ?? 0,
      totalDiscount: breakup.discount ?? 0,

      subtotal: breakup.subtotal ?? 0,
      gst: breakup.gst ?? 0,
      gstPercent: breakup.gstPercent ?? 3,
      grandTotal: breakup.grandTotal ?? 0,

      advancePayment: breakup.advanceUsed ?? 0,
      metalPayment: breakup.metalUsed ?? 0,
      payable: breakup.payable ?? breakup.grandTotal ?? 0,

      netWeight: breakup.netWeight ?? 0,
      components: Array.isArray(breakup.componentBreakup) ? breakup.componentBreakup : [],
      
      // Calculate net product value based on the image (Subtotal before discounts/adjustments usually)
      netProductValue: (breakup.subtotal ?? 0) + (breakup.discount ?? 0)
    }),
    [breakup]
  );

  const hasDiscounts = v.totalDiscount > 0;
  const hasAdjustments = v.advancePayment > 0 || v.metalPayment > 0 || v.subtotal > 0;

  return (
    <div className="bg-[#FAF8F9] w-full font-sans">
      
      {/* ================= TOP GRID (Values) ================= */}
      <div className="grid grid-cols-4 gap-4 px-6 md:px-8 py-5 border-b border-gray-200/60">
        
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-gray-400">QUANTITY</span>
          <span className="text-sm font-bold text-[#462434]">
            {String(quantity).padStart(2, '0')}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-gray-400">MAKING CHARGES</span>
          <span className="text-sm font-medium text-gray-600">
            ₹{format(v.makingCharge)}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-gray-400">NET PRODUCT VALUE</span>
          <span className="text-sm font-medium text-gray-600">
            ₹{format(v.netProductValue)}
          </span>
        </div>

        <div className="flex flex-col gap-1 text-right">
          <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-gray-400">ROW TOTAL</span>
          <span className="text-sm font-bold text-[#462434]">
            ₹{format(v.netProductValue * quantity)}
          </span>
        </div>

      </div>

      {/* ================= BOTTOM GRID (Discounts & Adjustments) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6 md:px-8 py-5">

       <Row label="Total Charges" value={v.grossTotal} bold />
        
        {/* DISCOUNTS */}
        <div>
          <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-4">
            <Tag size={12} /> DISCOUNTS APPLIED
          </div>
          
          {hasDiscounts ? (
            <div className="space-y-1">
              
              {v.discountDiamond > 0 && <Row label="Diamond Discount" value={v.discountDiamond} negative />}
              {v.discountMaking > 0 && <Row label="Making Discount" value={v.discountMaking} negative />}
              {v.discountStone > 0 && <Row label="Stone Discount" value={v.discountStone} negative />}
              
              <div className="pt-2 mt-2 border-t border-gray-200/60">
                <Row label="Total Discount" value={v.totalDiscount} negative bold />
              </div>
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic">No discounts applied</span>
          )}
        </div>

        {/* PAYMENT ADJUSTMENTS & TOTALS */}
        <div>
          <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-4">
            <Scale size={12} /> PAYMENT ADJUSTMENTS
          </div>

          <div className="space-y-1">
            <Row label="Advance Payment" value={v.advancePayment} negative={v.advancePayment > 0} />
            <Row label="Metal Payment (Old Gold)" value={v.metalPayment} negative={v.metalPayment > 0} />
            <Row label="Subtotal" value={v.subtotal} />
            <Row label={`GST (${v.gstPercent}%)`} value={v.gst} muted />
            
            <div className="pt-3 mt-3">
              <div className="bg-[#F0EBEF] rounded px-3 py-2 flex justify-between items-center">
                <span className="text-[11px] font-bold text-gray-700">Payable Amount</span>
                <span className="text-sm font-bold text-[#462434]">₹{format(v.payable)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default memo(ItemCalculator);