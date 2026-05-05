

// import React from "react";
// import { Gem, Percent, Wrench } from "lucide-react";
// import { useRates } from "../../context/RatesContext";

// const formatCurrency = (value) =>
//   value ? Number(value).toLocaleString("en-IN") : "0";

// const formatPercent = (value) =>
//   value ? Number(value).toFixed(1) : "0";

// export default function RatesSnapshot() {
//   const { rates, loading, error } = useRates();

//   if (loading || !rates) {
//     return (
//       <div className="w-full bg-[#E5E5E5] px-6 py-3 text-xs text-neutral-600">
//         Loading market rates...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="w-full bg-[#E5E5E5] px-6 py-3 text-xs text-red-600">
//         Failed to load rates
//       </div>
//     );
//   }

//   return (
//     <div className="w-full bg-[#E5E5E5] border-y border-neutral-300">
//       <div className="flex items-center justify-between px-6 py-3 text-sm">

//         {/* LEFT SECTION - METALS */}
//         <div className="flex items-center gap-8">

//           <RateItem
//             icon={<Gem size={14} className="text-amber-500" />}
//             label="Gold 24KT"
//             value={`₹${formatCurrency(rates.base.gold24KT)}/gm`}
//           />

//           <RateItem
//             icon={<Gem size={14} className="text-slate-500" />}
//             label="Silver 999"
//             value={`₹${formatCurrency(rates.base.silver999)}/gm`}
//           />

//           <RateItem
//             icon={<Gem size={14} className="text-indigo-500" />}
//             label="Platinum 950"
//             value={`₹${formatCurrency(rates.base.platinum950)}/gm`}
//           />

//         </div>

//         {/* RIGHT SECTION - CHARGES */}
//         <div className="flex items-center gap-8 border-l border-neutral-300 pl-8">

//           <RateItem
//             icon={<Wrench size={14} className="text-orange-500" />}
//             label="Making"
//             value={`₹${formatCurrency(rates.making.perGram)}/gm`}
//           />

//           <RateItem
//             icon={<Percent size={14} className="text-blue-500" />}
//             label="GST"
//             value={`${formatPercent(rates.tax.gst)}%`}
//           />

//         </div>

//       </div>
//     </div>
//   );
// }

// /* ===== Reusable Rate Item ===== */
// const RateItem = ({ icon, label, value }) => (
//   <div className="flex items-center gap-2 group">
//     <div className="p-1.5 bg-white rounded-md shadow-sm">
//       {icon}
//     </div>
//     <div className="flex flex-col leading-none">
//       <span className="text-[10px] uppercase tracking-wide text-neutral-500 font-semibold">
//         {label}
//       </span>
//       <span className="font-bold text-neutral-900 tracking-tight">
//         {value}
//       </span>
//     </div>
//   </div>
// );



// import React from "react";
// import { TrendingUp } from "lucide-react";
// import { useRates } from "../../context/RatesContext";

// const formatCurrency = (value) =>
//   value ? Number(value).toLocaleString("en-IN") : "0";

// const formatPercent = (value) =>
//   value ? Number(value).toFixed(1) : "0";

// export default function RatesSnapshot() {
//   const { rates, loading, error } = useRates();

//   if (loading || !rates) {
//     return (
//       <div className="bg-[#F8F9F5] border border-[#E9EBE4] rounded-lg px-6 py-3 flex items-center justify-center text-xs text-[#526B45] font-medium tracking-wide">
//         Loading live market rates...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-50 border border-red-100 rounded-lg px-6 py-3 flex items-center justify-center text-xs text-red-600 font-medium tracking-wide">
//         Failed to sync live rates
//       </div>
//     );
//   }

//   return (
//     <div className="bg-[#F8F9F5] border border-[#E9EBE4] rounded-lg px-6 py-3 flex items-center shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-x-auto no-scrollbar w-fit max-w-full">
//          <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#8FA382]">
//               Live rates 
//         </span>
//       {/* Icon */}
//       <div className="mr-5 text-[#325A21]">
//          <TrendingUp size={16} strokeWidth={2.5} />
//       </div>

//       <div className="flex items-center divide-x divide-[#E9EBE4]">
        
//         {/* GOLD */}
//         <div className="px-5 first:pl-0 flex items-baseline gap-1.5 whitespace-nowrap">
//           <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#8FA382]">
//             Gold 24KT:
//           </span>
//           <span className="text-xs font-bold text-[#325A21]">
//             ₹{formatCurrency(rates.base.gold24KT)}/GM
//           </span>
//         </div>

//         {/* SILVER */}
//         <div className="px-5 flex items-baseline gap-1.5 whitespace-nowrap">
//           <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#8FA382]">
//             Silver 999:
//           </span>
//           <span className="text-xs font-bold text-[#325A21]">
//             ₹{formatCurrency(rates.base.silver999)}/GM
//           </span>
//         </div>

//         {/* PLATINUM */}
//         <div className="px-5 flex items-baseline gap-1.5 whitespace-nowrap">
//           <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#8FA382]">
//             Platinum 950:
//           </span>
//           <span className="text-xs font-bold text-[#325A21]">
//             ₹{formatCurrency(rates.base.platinum950)}/GM
//           </span>
//         </div>

//         {/* MAKING */}
//         <div className="px-5 flex items-baseline gap-1.5 whitespace-nowrap">
//           <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#8FA382]">
//             Making:
//           </span>
//           <span className="text-xs font-bold text-[#325A21]">
//             ₹{formatCurrency(rates.making.perGram)}/GM
//           </span>
//         </div>

//         {/* GST */}
//         <div className="px-5 last:pr-0 flex items-baseline gap-1.5 whitespace-nowrap">
//           <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#8FA382]">
//             GST:
//           </span>
//           <span className="text-xs font-bold text-[#325A21]">
//             {formatPercent(rates.tax.gst)}%
//           </span>
//         </div>

//       </div>

//     </div>
//   );
// }


import React from "react";
import { TrendingUp } from "lucide-react";
import { useRates } from "../../context/RatesContext";

const formatCurrency = (value) =>
  value ? Number(value).toLocaleString("en-IN") : "0";

const formatPercent = (value) =>
  value ? Number(value).toFixed(1) : "0";

export default function RatesSnapshot() {
  const { rates, loading, error } = useRates();

  if (loading || !rates) {
    return (
      <div className="bg-[#F8F9F5] border border-[#E9EBE4] rounded-lg px-4 py-3 text-xs text-[#526B45] text-center">
        Loading live market rates...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-xs text-red-600 text-center">
        Failed to sync live rates
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9F5] border border-[#E9EBE4] rounded-lg px-4 py-3 shadow-sm w-full overflow-hidden">
      
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp size={14} className="text-[#325A21]" />
        <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#8FA382]">
          Live Rates
        </span>
      </div>

      {/* CONTENT */}
      <div className="
        flex gap-4 
        overflow-x-auto no-scrollbar
        sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5
      ">

        {/* GOLD */}
        <div className="min-w-[120px]">
          <p className="text-[10px] text-[#8FA382] uppercase font-bold">
            Gold 24KT
          </p>
          <p className="text-sm font-bold text-[#325A21]">
            ₹{formatCurrency(rates.base.gold24KT)}/GM
          </p>
        </div>

        {/* SILVER */}
        <div className="min-w-[120px]">
          <p className="text-[10px] text-[#8FA382] uppercase font-bold">
            Silver 999
          </p>
          <p className="text-sm font-bold text-[#325A21]">
            ₹{formatCurrency(rates.base.silver999)}/GM
          </p>
        </div>

        {/* PLATINUM */}
        <div className="min-w-[120px]">
          <p className="text-[10px] text-[#8FA382] uppercase font-bold">
            Platinum 950
          </p>
          <p className="text-sm font-bold text-[#325A21]">
            ₹{formatCurrency(rates.base.platinum950)}/GM
          </p>
        </div>

        {/* MAKING */}
        <div className="min-w-[120px]">
          <p className="text-[10px] text-[#8FA382] uppercase font-bold">
            Making
          </p>
          <p className="text-sm font-bold text-[#325A21]">
            ₹{formatCurrency(rates.making.perGram)}/GM
          </p>
        </div>

        {/* GST */}
        <div className="min-w-[120px]">
          <p className="text-[10px] text-[#8FA382] uppercase font-bold">
            GST
          </p>
          <p className="text-sm font-bold text-[#325A21]">
            {formatPercent(rates.tax.gst)}%
          </p>
        </div>

      </div>
    </div>
  );
}