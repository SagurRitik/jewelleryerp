

// //======

// import React, { useState,useEffect } from "react";
// import API from "../../api";
// import { useCart } from "../../context/CartContext";
// import { useNavigate } from "react-router-dom";
// import { 
//   User, Mail, MapPin, Building, CreditCard, 
//   FileText, CheckCircle2, Loader2, Banknote, Landmark, 
//   SmartphoneNfc, ChevronDown, ChevronUp, AlertCircle,
//   Calendar, Hash, Shield, Flag, Globe
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useRates } from "../../context/RatesContext";


// // --- CONSTANTS ---
// const COUNTRY_CODES = [
//   { code: "+91", country: "IN", flag: "🇮🇳" },
//   { code: "+1", country: "US", flag: "🇺🇸" },
//   { code: "+44", country: "UK", flag: "🇬🇧" },
//   { code: "+971", country: "UAE", flag: "🇦🇪" },
// ];

// const INDIAN_STATE_CODES = [
//   "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", 
//   "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
//   "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
//   "31", "32", "33", "34", "35", "36", "37"
// ];

// const purityOptions = {
//   gold: ["24KT","22KT","18KT","14KT","10KT","9KT"],
//   silver: ["999","925","835","800"],
//   platinum: ["950","900"]
// };
// export default function InvoiceConfirmPanel() {
//   const { cart, sessionId,clearCart, fetchCartSummary } = useCart();
//   const navigate = useNavigate();

//   // --- STATE ---
//   const [isMinimized, setIsMinimized] = useState(false);
//   const [useMetalExchange,setUseMetalExchange] = useState(false);

//   // Default expanded state
//   const [expandedSections, setExpandedSections] = useState({
//     customer: true, 
//     items: false, // Collapsed by default to save space in sticky bar
//     payment: true,
//   });

//   const { rates } = useRates();

//   const [metalExchange, setMetalExchange] = useState({
//   metalType: "gold",
//   purity: "22KT",
//   weight: 0,
//   ratePerGram: 0,
//   totalValue: 0
// });

// useEffect(() => {
//   if (!rates) return;

//   const rate = rates.helpers.getMetalRate(
//     metalExchange.metalType,
//     metalExchange.purity
//   );

//   setMetalExchange(prev => ({
//     ...prev,
//     ratePerGram: rate
//   }));

// }, [metalExchange.metalType, metalExchange.purity, rates]);

// useEffect(() => {
//   const value =
//     (metalExchange.weight || 0) *
//     (metalExchange.ratePerGram || 0);

//   setMetalExchange(prev => ({
//     ...prev,
//     totalValue: value
//   }));

// }, [metalExchange.weight, metalExchange.ratePerGram]);

// useEffect(() => {
//   if (!cart?.totals) return;


//   const basePayable =
//   cart.totals.grandTotal -
//   (cart.totals.advancePayment || 0) -
//   (cart.totals.metalPayment || 0);

//   const remaining = Math.max(
//     0,
//     basePayable - (metalExchange.totalValue || 0)
//   );

//   setPayment(prev => ({
//     ...prev,
//     amount: remaining
//   }));

// }, [cart?.totals, metalExchange.totalValue]);

//   const [customer, setCustomer] = useState({
//     name: "", countryCode: "+91", mobile: "", email: "", 
//     address: "", gstin: "", stateCode: "",
//   });

// const [payment, setPayment] = useState({ 
//   mode: "CASH",
//   referenceNo: "",
//   amount: 0,
//   date: new Date().toISOString().split('T')[0]
// });

//   const [itemsMeta, setItemsMeta] = useState({});
//   const [submitting, setSubmitting] = useState(false);
//   const [errors, setErrors] = useState({});

//   // --- LOGIC ---
//   const toggleSection = (section) => {
//     setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
//   };

// const handleGenerateInvoice = async () => {
//   if (!sessionId) {
//   setErrors({ submit: "Session expired. Please reload checkout." });
//   return;
// }

//   // ---------- HARD REQUIRED VALIDATION ----------
//   if (!customer.name?.trim()) {
//     setErrors({ submit: "Customer name is required" });
//     if (!expandedSections.customer) toggleSection("customer");
//     return;
//   }

//   if (!customer.mobile?.trim()) {
//     setErrors({ submit: "Customer mobile number is required" });
//     if (!expandedSections.customer) toggleSection("customer");
//     return;
//   }

//   // ---------- FORMAT VALIDATION ----------
//   const newErrors = {};
//   if (customer.mobile.length < 5) newErrors.mobile = "Invalid mobile number";
//   if (customer.email && !/^\S+@\S+\.\S+$/.test(customer.email)) {
//     newErrors.email = "Invalid email";
//   }

//   if (Object.keys(newErrors).length > 0) {
//     setErrors(newErrors);
//     if (!expandedSections.customer) toggleSection("customer");
//     return;
//   }

//   setErrors({});

//   try {
//     setSubmitting(true);

// const metalPayload =
//   useMetalExchange &&
//   Number(metalExchange.weight) > 0 &&
//   Number(metalExchange.ratePerGram) > 0
//     ? {
//         metalType: metalExchange.metalType,
//         purity: metalExchange.purity,
//         weight: Number(metalExchange.weight),
//         ratePerGram: Number(metalExchange.ratePerGram),
//       }
//     : undefined;

// const invoiceData = {
//   sessionId,
//   customer: {
//     name: customer.name.trim(),
//     mobile: `${customer.countryCode}${customer.mobile}`,
//     email: customer.email || "",
//     address: customer.address || "",
//     gstin: customer.gstin?.toUpperCase() || "",
//     stateCode: customer.stateCode || "",
//   },

//   itemsMeta: cart.items.map((item) => ({
//     cartItemId: item._id,
//     hsn: itemsMeta[item._id]?.hsn || "",
//     certificateNo: itemsMeta[item._id]?.certificateNo || "",
//   })),

//   payment: {
//     mode: payment.mode || "CASH",
//     referenceNo: payment.referenceNo || "",
//     amount: Number(payment.amount || 0),
//   },

//   metalPayment: metalPayload
// };

//     // 🔍 DEBUG (optional – remove later)
//     console.log("CONFIRM INVOICE PAYLOAD 👉", invoiceData);

//     // ✅ API CALL
//     const res = await API.post(
//       "/sales-orders/confirm-invoice",
//       invoiceData
//     );

//     // ✅ SAFE INVOICE ID EXTRACTION
//     const finalInvoiceId =
//       res.data.invoiceId || res.data.invoice?._id;

//     if (!finalInvoiceId) {
//       throw new Error("Invoice ID missing in response");
//     }
//     // 🔥 IMPORTANT FIX
// await fetchCartSummary();   // Sync with backend (cart now deleted)
// await clearCart();          // Immediately clear local state

//     navigate(`/invoice/${finalInvoiceId}`);
//   } catch (err) {
//     console.error("INVOICE ERROR:", err.response?.data || err.message);
//     setErrors({
//       submit:
//         err?.response?.data?.error ||
//         "Failed to generate invoice. Please try again.",
//     });
//   } finally {
//     setSubmitting(false);
//   }
// };

//   const getItemName = (item) => {
//     const snap = item.itemSnapshot || item.customSnapshot || {};
//     return snap.productName || snap.title || "Jewellery Item";
//   };

//   if (!cart || !cart.items?.length) return null;

//   return (
//     <motion.div 
//       initial={{ opacity: 0, x: 20 }}
//       animate={{ opacity: 1, x: 0 }}
//       className="w-full flex flex-col gap-4 font-sans"
//     >
//       {/* HEADER */}
//       {/* <div className="flex items-center justify-between pb-2">
//         <div>
//            <h3 className="font-serif text-lg font-medium text-neutral-900">Invoice Summary</h3>
//            <p className="text-xs text-neutral-500">Confirm details & generate</p>
//         </div>
//         <button
//           onClick={() => setIsMinimized(!isMinimized)}
//           className="text-xs font-medium px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors"
//         >
//           {isMinimized ? "Expand" : "Minimize"}
//         </button>
//       </div> */}

//       <div className="flex items-center justify-between pb-2">
//         <button
//           onClick={() => setIsMinimized(!isMinimized)}
//           className="text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded transition-colors"
//         >
//           {isMinimized ? "Expand Details" : "Minimize Details"}
//         </button>
//       </div>

//       {!isMinimized && (
//         <>

//           {/* 1. CUSTOMER DETAILS (Revised Layout)                      */}

//           {/* <SectionCard 
//             title="Customer Details" 
//             icon={<User size={18} />} 
//             isExpanded={expandedSections.customer}
//             onToggle={() => toggleSection('customer')}
//             subtitle={customer.name || "Optional Details"}
//           >
//             <div className="space-y-4">


//               <ModernInput 
//                 label="Full Name"
//                 icon={<User size={16} />}
//                 value={customer.name}
//                 onChange={(e) => setCustomer({...customer, name: e.target.value})}
//                 placeholder="Customer Name"
//               />


//               <div>
//                 <label className="block text-xs font-medium text-neutral-600 mb-1.5 ml-1">
//                   Mobile Number
//                 </label>
//                 <div className={`flex items-stretch bg-gray-50 border rounded-xl overflow-hidden transition-all ${errors.mobile ? "border-red-300 ring-2 ring-red-100" : "border-neutral-200 focus-within:border-neutral-400"}`}>

//                   <div className="relative border-r border-neutral-200 bg-gray-100/50 min-w-[80px]">
//                     <select
//                       className="w-full h-full appearance-none bg-transparent pl-3 pr-6 text-sm font-medium text-neutral-700 focus:outline-none cursor-pointer"
//                       value={customer.countryCode}
//                       onChange={(e) => setCustomer({...customer, countryCode: e.target.value})}
//                     >
//                       {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
//                     </select>
//                     <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
//                   </div>


//                   <input 
//                     type="tel"
//                     className="flex-1 bg-transparent px-3 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
//                     placeholder="Mobile Number"
//                     value={customer.mobile}
//                     onChange={(e) => setCustomer({...customer, mobile: e.target.value.replace(/\D/g, '')})}
//                   />
//                 </div>
//                 {errors.mobile && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.mobile}</p>}
//               </div>


//               <ModernInput 
//                 label="Email Address"
//                 icon={<Mail size={16} />}
//                 value={customer.email}
//                 onChange={(e) => setCustomer({...customer, email: e.target.value})}
//                 placeholder="Email Address"
//                 error={errors.email}
//               />


//               <div className="grid grid-cols-2 gap-3">
//                 <ModernInput 
//                   label="GSTIN"
//                   icon={<Building size={16} />}
//                   value={customer.gstin}
//                   onChange={(e) => setCustomer({...customer, gstin: e.target.value.toUpperCase()})}
//                   placeholder="GSTIN"
//                   className="uppercase"
//                 />

//                 <div>
//                    <label className="block text-xs font-medium text-neutral-600 mb-1.5 ml-1">State Code</label>
//                    <div className="relative group">
//                       <select 
//                         className="w-full bg-gray-50 border border-neutral-200 text-neutral-900 text-sm rounded-xl pl-9 pr-8 py-3 appearance-none focus:outline-none focus:border-neutral-400 transition-all cursor-pointer"
//                         value={customer.stateCode}
//                         onChange={(e) => setCustomer({...customer, stateCode: e.target.value})}
//                       >
//                         <option value="">Code</option>
//                         {INDIAN_STATE_CODES.map(code => <option key={code} value={code}>{code}</option>)}
//                       </select>
//                       <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
//                          <Flag size={14} />
//                       </div>
//                       <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
//                    </div>
//                 </div>
//               </div>


//               <div>
//                  <label className="block text-xs font-medium text-neutral-600 mb-1.5 ml-1">Billing Address</label>
//                  <div className="relative group">
//                     <textarea
//                       rows={2}
//                       className="w-full bg-gray-50 border border-neutral-200 text-neutral-900 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-neutral-400 transition-all resize-none placeholder:text-neutral-400"
//                       placeholder="Street, City, Pincode"
//                       value={customer.address}
//                       onChange={(e) => setCustomer({...customer, address: e.target.value})}
//                     />
//                     <div className="absolute left-3 top-3.5 text-neutral-400 group-focus-within:text-neutral-800 transition-colors">
//                       <MapPin size={16} />
//                     </div>
//                  </div>
//               </div>

//             </div>
//           </SectionCard> */}



//         {/* ================= 1. CUSTOMER DETAILS ================= */}
//           <SectionCard 
//             title="CUSTOMER DETAILS" 
//             icon={<User size={16} strokeWidth={2.5} />} 
//             isExpanded={expandedSections.customer}
//             onToggle={() => toggleSection('customer')}
//           >
//             <div className="space-y-4">
//               <ModernInput 
//                 label="FULLNAME"
//                 icon={<User size={14} className="text-[#462434]" />}
//                 value={customer.name}
//                 onChange={(e) => setCustomer({...customer, name: e.target.value})}
//                 placeholder="Customer Name"
//               />

//               <div>
//                 <label className="block text-[9px] font-bold tracking-[0.1em] uppercase text-[#462434] mb-1.5">
//                   MOBILE NUMBER
//                 </label>
//                 <div className={`flex items-center h-10 bg-white border rounded text-sm transition-all ${errors.mobile ? "border-red-300 ring-1 ring-red-100" : "border-gray-200"}`}>
//                   <div className="px-3 border-r border-gray-200 bg-gray-50 h-full flex items-center justify-center">
//                     <SmartphoneNfc size={14} className="text-[#462434]" />
//                   </div>
//                   <select
//                     className="h-full appearance-none bg-transparent pl-3 pr-2 text-sm font-medium text-neutral-700 focus:outline-none cursor-pointer"
//                     value={customer.countryCode}
//                     onChange={(e) => setCustomer({...customer, countryCode: e.target.value})}
//                   >
//                     {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
//                   </select>
//                   <input 
//                     type="tel"
//                     className="flex-1 bg-transparent px-3 h-full text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
//                     placeholder="Mobile Number"
//                     value={customer.mobile}
//                     onChange={(e) => setCustomer({...customer, mobile: e.target.value.replace(/\D/g, '')})}
//                   />
//                 </div>
//                 {errors.mobile && <p className="text-[10px] text-red-500 mt-1">{errors.mobile}</p>}
//               </div>

//               <ModernInput 
//                 label="EMAIL"
//                 icon={<Mail size={14} className="text-[#462434]" />}
//                 value={customer.email}
//                 onChange={(e) => setCustomer({...customer, email: e.target.value})}
//                 placeholder="Email Address"
//                 error={errors.email}
//               />

//               <div className="grid grid-cols-2 gap-4">
//                 <ModernInput 
//                   label="GSTIN"
//                   icon={<Building size={14} className="text-[#462434]" />}
//                   value={customer.gstin}
//                   onChange={(e) => setCustomer({...customer, gstin: e.target.value.toUpperCase()})}
//                   placeholder="GSTIN Code"
//                   className="uppercase"
//                 />
//                 <div>
//                    <label className="block text-[9px] font-bold tracking-[0.1em] uppercase text-[#462434] mb-1.5">STATE CODE</label>
//                    <div className="relative h-10 flex items-center bg-white border border-gray-200 rounded">
//                       <div className="px-3 border-r border-gray-200 bg-gray-50 h-full flex items-center justify-center">
//                         <Flag size={14} className="text-[#462434]" />
//                       </div>
//                       <select 
//                         className="w-full h-full bg-transparent text-neutral-900 text-sm pl-3 pr-8 appearance-none focus:outline-none cursor-pointer"
//                         value={customer.stateCode}
//                         onChange={(e) => setCustomer({...customer, stateCode: e.target.value})}
//                       >
//                         <option value="">Code</option>
//                         {INDIAN_STATE_CODES.map(code => <option key={code} value={code}>{code}</option>)}
//                       </select>
//                       <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
//                    </div>
//                 </div>
//               </div>

//               <div>
//                  <label className="block text-[9px] font-bold tracking-[0.1em] uppercase text-[#462434] mb-1.5">BILLING ADDRESS</label>
//                  <div className="relative flex bg-white border border-gray-200 rounded overflow-hidden">
//                     <div className="pl-3 pt-3 text-[#462434]">
//                       <MapPin size={14} />
//                     </div>
//                     <textarea
//                       rows={2}
//                       className="w-full bg-transparent text-neutral-900 text-sm px-3 py-2.5 focus:outline-none resize-none placeholder:text-neutral-400"
//                       placeholder="Street, City, Pincode"
//                       value={customer.address}
//                       onChange={(e) => setCustomer({...customer, address: e.target.value})}
//                     />
//                  </div>
//               </div>
//             </div>
//           </SectionCard>  


//           {/* 2. ITEM METADATA                                          */}

//           <SectionCard 
//             title="Item Details" 
//             icon={<FileText size={18} />} 
//             isExpanded={expandedSections.items}
//             onToggle={() => toggleSection('items')}
//             subtitle={`${cart.items.length} Items`}
//           >
//             <div className="space-y-3">
//               {cart.items.map((item) => (
//                 <div key={item._id} className="flex items-center gap-2">
//                    <div className="flex items-center gap-2">
//                       <div className="w-1 h-6 rounded-full bg-neutral-300"></div>
//                       <span className="text-sm font-medium text-neutral-700 truncate">{getItemName(item)}</span>
//                    </div>
//                    <div className="grid grid-cols-2 gap-2">
//                      <input 
//                        placeholder="HSN"
//                        className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs outline-none focus:border-neutral-400"
//                        value={itemsMeta[item._id]?.hsn || ""}
//                        onChange={(e) => setItemsMeta(p => ({ ...p, [item._id]: { ...p[item._id], hsn: e.target.value } }))}
//                      />
//                      <input 
//                        placeholder="Cert No."
//                        className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs outline-none focus:border-neutral-400"
//                        value={itemsMeta[item._id]?.certificateNo || ""}
//                        onChange={(e) => setItemsMeta(p => ({ ...p, [item._id]: { ...p[item._id], certificateNo: e.target.value } }))}
//                      />
//                    </div>
//                 </div>
//               ))}
//             </div>
//           </SectionCard>


//           {/* 3. PAYMENT DETAILS                                        */}

//  <SectionCard 
//   title="Payment" 
//   icon={<CreditCard size={18} />} 
//   isExpanded={expandedSections.payment}
//   onToggle={() => toggleSection('payment')}
//   subtitle={`${payment.mode}`}
// >
// <div className="space-y-4">

// {/* PAYMENT MODE */}
// <div className="flex flex-wrap gap-2">
// {[
// { id: "CASH", label: "Cash", icon: Banknote },
// { id: "UPI", label: "UPI", icon: SmartphoneNfc },
// { id: "CARD", label: "Card", icon: CreditCard },
// { id: "BANK", label: "Bank", icon: Landmark },
// ].map((mode) => (
// <button
// key={mode.id}
// onClick={() => setPayment({ ...payment, mode: mode.id, referenceNo: "" })}
// className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
// payment.mode === mode.id
// ? "bg-neutral-900 text-white border-neutral-900 shadow"
// : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
// }`}
// >
// <mode.icon size={14}/>
// {mode.label}
// </button>
// ))}
// </div>

// {/* PAYMENT DATE */}
// <div>
// <label className="block text-xs font-medium text-neutral-600 mb-1 ml-1">
// Payment Date
// </label>

// <div className="relative">
// <input
// type="date"
// className="w-full bg-gray-50 border border-neutral-200 rounded-xl px-4 pl-10 py-2.5 text-sm outline-none focus:border-neutral-400"
// value={payment.date}
// onChange={(e)=>setPayment({...payment,date:e.target.value})}
// />

// <Calendar
// className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
// size={14}
// />
// </div>
// </div>

// {/* REFERENCE NUMBER */}
// {payment.mode !== "CASH" && (
// <ModernInput
// label="Reference No."
// icon={<Hash size={14}/>}
// placeholder="Transaction ID"
// value={payment.referenceNo}
// onChange={(e)=>setPayment({...payment,referenceNo:e.target.value})}
// />
// )}

// {/* OLD METAL TOGGLE */}
// <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
// <input
// type="checkbox"
// checked={useMetalExchange}
// onChange={()=>setUseMetalExchange(!useMetalExchange)}
// className="accent-black"
// />
// Old Metal Exchange
// </label>

// {/* METAL EXCHANGE */}
// {useMetalExchange && (
// <div className="border-t pt-4 space-y-3">

// <h4 className="text-sm font-semibold text-neutral-800">
// Old Metal Exchange
// </h4>

// <div className="flex gap-2">

// <select
// className="border rounded-lg px-2 py-1 text-sm"
// value={metalExchange.metalType}
// onChange={(e)=>setMetalExchange({
// ...metalExchange,
// metalType:e.target.value
// })}
// >
// <option value="gold">Gold</option>
// <option value="silver">Silver</option>
// <option value="platinum">Platinum</option>
// </select>

// <select
// className="border rounded-lg px-2 py-1 text-sm"
// value={metalExchange.purity}
// onChange={(e)=>setMetalExchange({
// ...metalExchange,
// purity:e.target.value
// })}
// >
// {purityOptions[metalExchange.metalType].map(p=>(
// <option key={p}>{p}</option>
// ))}
// </select>

// <input
// type="number"
// className="border rounded-lg px-2 py-1 text-sm w-24"
// placeholder="Weight"
// value={metalExchange.weight}
// onChange={(e)=>setMetalExchange({
// ...metalExchange,
// weight:Number(e.target.value) || 0
// })}
// />

// </div>

// <div className="text-xs text-gray-500">
// Rate ₹{metalExchange.ratePerGram}/g
// </div>

// <div className="text-green-600 font-semibold">
// Metal Credit ₹{metalExchange.totalValue.toLocaleString()}
// </div>

// {/* {cart?.summary && (
// <>
// <div className="text-sm font-medium text-neutral-700">
// Remaining Payable ₹
// {Math.max(
// 0,
// (cart.summary.grandTotal || 0) - metalExchange.totalValue
// ).toLocaleString()}
// </div>

// <div className="text-xs text-blue-600">
// Suggested Payment ₹
// {Math.max(
// 0,
// (cart.summary.grandTotal || 0) - metalExchange.totalValue
// ).toLocaleString()}
// </div>
// </>
// )} */}
// {/* {cart?.totals && (
// <>
// <div className="text-sm font-medium text-neutral-700">
// Remaining Payable ₹
// {Math.max(
// 0,
// (cart?.totals?.grandTotal || 0) - (metalExchange.totalValue || 0)
// ).toLocaleString()}
// </div>

// <div className="text-xs text-blue-600">
// Suggested Payment ₹
// {Math.max(
// 0,
// (cart?.totals?.grandTotal || 0) - (metalExchange.totalValue || 0)
// ).toLocaleString()}
// </div>
// </>
// )} */}

// {cart?.totals && (
// <>
// <div className="text-sm font-medium text-neutral-700">
// Remaining Payable ₹
// {Math.max(
// 0,
// (cart?.totals?.netPayable || cart?.totals?.grandTotal || 0)
// - (metalExchange.totalValue || 0)
// ).toLocaleString()}
// </div>

// <div className="text-xs text-blue-600">
// Suggested Payment ₹
// {/* {Math.max(
// 0,
// (cart?.totals?.netPayable || cart?.totals?.grandTotal || 0)
// - (metalExchange.totalValue || 0)
// ).toLocaleString()} */}
// {Math.max(
//   0,
//   (cart?.totals?.netPayable || cart?.totals?.grandTotal || 0)
//   - (metalExchange.totalValue || 0)
// ).toLocaleString()}
// </div>
// </>
// )}
// </div>
// )}

// {/* AMOUNT RECEIVED */}
// <ModernInput
// label="Amount Received"
// icon={<Banknote size={14}/>}
// type="number"
// value={payment.amount}
// // onChange={(e)=>
// // setPayment({...payment,amount:Number(e.target.value)})
// onChange={(e)=>
// setPayment({
//   ...payment,
//   amount: Math.max(0, Number(e.target.value))
// })
// }
// />

// </div>
// </SectionCard>
//         </>
//       )}

//       {/* FOOTER ACTIONS */}
//       <div className="space-y-3 pt-2">
//         <AnimatePresence>
//           {errors.submit && (
//             <motion.div initial={{opacity:0}} animate={{opacity:1}} className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex gap-2">
//                <AlertCircle size={14} className="shrink-0" /> {errors.submit}
//             </motion.div>
//           )}
//         </AnimatePresence>

//         <button
//           onClick={handleGenerateInvoice}
//           disabled={submitting}
//           className="w-full bg-[#1C1C1C] text-white py-4 rounded-xl font-medium text-sm transition-all hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-neutral-900/10 flex items-center justify-center gap-2"
//         >
//            {submitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
//            <span>{submitting ? "Processing..." : "Generate Invoice"}</span>
//         </button>

//         <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-400">
//            <Shield size={10} />
//            <span>Optional Details • Secure Processing</span>
//         </div>
//       </div>

//     </motion.div>
//   );
// }

// // --- REUSABLE COMPONENTS ---

// const SectionCard = ({ title, icon, isExpanded, onToggle, children, subtitle }) => (
//   <div className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${isExpanded ? "border-neutral-300 shadow-sm" : "border-neutral-200"}`}>
//     <button onClick={onToggle} className="w-full p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors">
//        <div className="flex items-center gap-3">
//           <div className={`text-neutral-500 ${isExpanded ? "text-neutral-900" : ""}`}>{icon}</div>
//           <div className="text-left">
//              <h4 className="text-sm font-semibold text-neutral-900">{title}</h4>
//              <p className="text-[11px] text-neutral-500">{subtitle}</p>
//           </div>
//        </div>
//        {isExpanded ? <ChevronUp size={16} className="text-neutral-400"/> : <ChevronDown size={16} className="text-neutral-400"/>}
//     </button>
//     <AnimatePresence>
//       {isExpanded && (
//         <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
//            <div className="px-4 pb-4 pt-0">
//              <div className="h-px bg-neutral-100 mb-4 w-full" />
//              {children}
//            </div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   </div>
// );

// const ModernInput = ({ label, icon, error, className = "", ...props }) => (
//   <div className="w-full">
//     {label && <label className="block text-xs font-medium text-neutral-600 mb-1.5 ml-1">{label}</label>}
//     <div className="relative group">
//       <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-800 transition-colors">
//         {icon}
//       </div>
//       <input 
//         className={`w-full bg-gray-50 border border-neutral-200 text-neutral-900 text-sm rounded-xl pl-9 pr-4 py-3 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 transition-all ${error ? 'border-red-300 ring-1 ring-red-100' : ''} ${className}`}
//         {...props}
//       />
//     </div>
//     {error && <p className="text-[10px] text-red-500 mt-1 ml-1">{error}</p>}
//   </div>
// );





import React, { useState, useEffect } from "react";
import API from "../../api";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, MapPin, Building, CreditCard,
  FileText, CheckCircle2, Loader2, Banknote, Landmark,
  SmartphoneNfc, ChevronDown, ChevronUp, AlertCircle,
  Calendar, Hash, Shield, Flag, Globe, RotateCcw, Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRates } from "../../context/RatesContext";
import { toast } from "sonner";

// --- CONSTANTS ---
const COUNTRY_CODES = [
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
];

const INDIAN_STATE_CODES = [
  "01", "02", "03", "04", "05", "06", "07", "08", "09", "10",
  "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
  "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
  "31", "32", "33", "34", "35", "36", "37"
];

const purityOptions = {
  gold: ["24KT", "22KT", "18KT", "14KT", "10KT", "9KT"],
  silver: ["999", "925", "835", "800"],
  platinum: ["950", "900"]
};

export default function InvoiceConfirmPanel() {
  const { cart, sessionId, clearCart, fetchCartSummary } = useCart();
  const navigate = useNavigate();

  // --- STATE ---
  const [isMinimized, setIsMinimized] = useState(false);
  const [useMetalExchange, setUseMetalExchange] = useState(false);

  // Default expanded state matched to reference layout logic
  const [expandedSections, setExpandedSections] = useState({
    customer: true,
    metal: true,
    items: true,
    payment: true,
  });

  const { rates } = useRates();

  const [metalExchange, setMetalExchange] = useState({
    metalType: "gold",
    purity: "22KT",
    weight: 0,
    ratePerGram: 0,
    totalValue: 0
  });

  useEffect(() => {
    if (!rates) return;
    const rate = rates.helpers.getMetalRate(
      metalExchange.metalType,
      metalExchange.purity
    );
    setMetalExchange(prev => ({
      ...prev,
      ratePerGram: rate
    }));
  }, [metalExchange.metalType, metalExchange.purity, rates]);

  useEffect(() => {
    const value = (metalExchange.weight || 0) * (metalExchange.ratePerGram || 0);
    setMetalExchange(prev => ({
      ...prev,
      totalValue: value
    }));
  }, [metalExchange.weight, metalExchange.ratePerGram]);

  const [customer, setCustomer] = useState({
    name: "", countryCode: "+91", mobile: "", email: "",
    address: "", gstin: "", stateCode: "", panNumber: "",
  });

  const [payment, setPayment] = useState({
    mode: "CASH",
    referenceNo: "",
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (!cart?.totals) return;
    const basePayable = cart.totals.grandTotal - (cart.totals.advancePayment || 0) - (cart.totals.metalPayment || 0);
    const remaining = Math.max(0, basePayable - (metalExchange.totalValue || 0));
    setPayment(prev => ({
      ...prev,
      amount: remaining
    }));
  }, [cart?.totals, metalExchange.totalValue]);

  const [itemsMeta, setItemsMeta] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // --- LOGIC ---
  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const addCertificate = (itemId) => {
    setItemsMeta(prev => {
      const current = prev[itemId] || { certificates: [] };
      const certs = [...(current.certificates || [])];
      certs.push({ lab: "", certificateNo: "" });
      return { ...prev, [itemId]: { ...current, certificates: certs } };
    });
  };

  const removeCertificate = (itemId, cIndex) => {
    setItemsMeta(prev => {
      const current = prev[itemId];
      if (!current || !current.certificates) return prev;
      const certs = [...current.certificates];
      certs.splice(cIndex, 1);
      return { ...prev, [itemId]: { ...current, certificates: certs } };
    });
  };

  const handleCertificateChange = (itemId, cIndex, field, value) => {
    setItemsMeta(prev => {
      const current = prev[itemId];
      if (!current || !current.certificates) return prev;
      const certs = [...current.certificates];
      certs[cIndex] = { ...certs[cIndex], [field]: value };
      return { ...prev, [itemId]: { ...current, certificates: certs } };
    });
  };

  const handleGenerateInvoice = async () => {
    if (!sessionId) {
      setErrors({ submit: "Session expired. Please reload checkout." });
      return;
    }

    if (!customer.name?.trim()) {
      setErrors({ submit: "Customer name is required" });
      if (!expandedSections.customer) toggleSection("customer");
      return;
    }

    if (!customer.mobile?.trim()) {
      setErrors({ submit: "Customer mobile number is required" });
      if (!expandedSections.customer) toggleSection("customer");
      return;
    }


    // ✅ PAN REQUIRED CHECK (subtotal without GST)
    if (
      Number(cart?.totals?.subtotal) >= 200000 &&
      !customer.panNumber
    ) {
      setErrors({ submit: "PAN required above ₹2,00,000 (before GST)" });
      if (!expandedSections.customer) toggleSection("customer");
      return;
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    if (customer.panNumber && !panRegex.test(customer.panNumber)) {
      setErrors({ submit: "Invalid PAN format" });
      return;
    }


    const newErrors = {};
    if (customer.mobile.length < 5) newErrors.mobile = "Invalid mobile number";
    if (customer.email && !/^\S+@\S+\.\S+$/.test(customer.email)) {
      newErrors.email = "Invalid email";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (!expandedSections.customer) toggleSection("customer");
      return;
    }

    setErrors({});

    try {
      setSubmitting(true);

      const metalPayload = useMetalExchange && Number(metalExchange.weight) > 0 && Number(metalExchange.ratePerGram) > 0
        ? {
          metalType: metalExchange.metalType,
          purity: metalExchange.purity,
          weight: Number(metalExchange.weight),
          ratePerGram: Number(metalExchange.ratePerGram),
        }
        : undefined;

      const invoiceData = {
        sessionId,
        date: payment.date || null,
        customer: {
          name: customer.name.trim(),
          mobile: `${customer.countryCode}${customer.mobile}`,
          email: customer.email || "",
          address: customer.address || "",
          gstin: customer.gstin?.toUpperCase() || "",
          stateCode: customer.stateCode || "",
          panNumber: customer.panNumber?.toUpperCase() || "",
        },
        itemsMeta: cart.items.map((item) => {
          const snap = item.customSnapshot || item.itemSnapshot || {};
          const existingHSN = snap?.hsn || snap?.productDetails?.hsnCode || snap?.productDetails?.hsn || item.product?.hsnCode;
          const certs = snap?.productDetails?.certificates || snap?.certificates || item.product?.certificates || [];
          const existingCert = certs.length > 0 
            ? certs.map(c => `${c.lab} - ${c.certificateNo}`).join(", ")
            : (snap?.certificateNo || snap?.certificateNumber || snap?.productDetails?.certificateNo || "");

          return {
            cartItemId: item._id,
            hsn: itemsMeta[item._id]?.hsn || existingHSN || "",
            certificateNo: itemsMeta[item._id]?.certificateNo || existingCert || "",
            certificates: itemsMeta[item._id]?.certificates || certs || [],
          };
        }),
        payment: {
          mode: payment.mode || "CASH",
          referenceNo: payment.referenceNo || "",
          amount: Number(payment.amount || 0),
          date: payment.date || null,
        },
        metalPayment: metalPayload,
      };

      const res = await API.post("/sales-orders/confirm-invoice", invoiceData);
      const finalInvoiceId = res.data.invoiceId || res.data.invoice?._id;
      const invoiceNo = res.data.invoiceNo || "N/A";
      const finalGrandTotal = res.data.grandTotal || cart?.totals?.grandTotal || 0;

      if (!finalInvoiceId) throw new Error("Invoice ID missing in response");

      await fetchCartSummary();
      await clearCart();

      // Navigate to the invoice preview as requested.
      // WhatsApp and PDF options will now be available on the preview page.
      navigate(`/invoice/${finalInvoiceId}`);
    } catch (err) {
      console.error("INVOICE ERROR:", err.response?.data || err.message);
      setErrors({ submit: err?.response?.data?.error || "Failed to generate invoice." });
    } finally {
      setSubmitting(false);
    }
  };

  const getItemName = (item) => {
    const snap = item.itemSnapshot || item.customSnapshot || {};
    return snap.productName || snap.title || "Jewellery Item";
  };

  if (!cart || !cart.items?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full flex flex-col gap-4 font-sans"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between pb-2">
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded transition-colors"
        >
          {isMinimized ? "Expand Details" : "Minimize Details"}
        </button>
      </div>

      {!isMinimized && (
        <div className="space-y-4">

          {/* ================= 1. CUSTOMER DETAILS ================= */}
          <SectionCard
            title="CUSTOMER DETAILS"
            icon={<User size={16} strokeWidth={2.5} />}
            isExpanded={expandedSections.customer}
            onToggle={() => toggleSection('customer')}
          >
            <div className="space-y-4">
              <ModernInput
                label="FULLNAME"
                icon={<User size={14} className="text-[#462434]" />}
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                placeholder="Customer Name"
              />

              <div>
                <label className="block text-[9px] font-bold tracking-[0.1em] uppercase text-[#462434] mb-1.5">
                  MOBILE NUMBER
                </label>
                <div className={`flex items-center h-10 bg-white border rounded text-sm transition-all ${errors.mobile ? "border-red-300 ring-1 ring-red-100" : "border-gray-200"}`}>
                  <div className="px-3 border-r border-gray-200 bg-gray-50 h-full flex items-center justify-center">
                    <SmartphoneNfc size={14} className="text-[#462434]" />
                  </div>
                  <select
                    className="h-full appearance-none bg-transparent pl-3 pr-2 text-sm font-medium text-neutral-700 focus:outline-none cursor-pointer"
                    value={customer.countryCode}
                    onChange={(e) => setCustomer({ ...customer, countryCode: e.target.value })}
                  >
                    {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                  </select>
                  <input
                    type="tel"
                    className="flex-1 bg-transparent px-3 h-full text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                    placeholder="Mobile Number"
                    value={customer.mobile}
                    onChange={(e) => setCustomer({ ...customer, mobile: e.target.value.replace(/\D/g, '') })}
                  />
                </div>
                {errors.mobile && <p className="text-[10px] text-red-500 mt-1">{errors.mobile}</p>}
              </div>

              <ModernInput
                label="EMAIL"
                icon={<Mail size={14} className="text-[#462434]" />}
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                placeholder="Email Address"
                error={errors.email}
              />
              <ModernInput
                label="PAN NUMBER"
                icon={<Shield size={14} className="text-[#462434]" />}
                value={customer.panNumber}
                onChange={(e) => setCustomer({
                  ...customer,
                  panNumber: e.target.value.toUpperCase()
                })}
                placeholder="ABCDE1234F"
                className="uppercase"
              />

              <div className="grid grid-cols-2 gap-4">
                <ModernInput
                  label="GSTIN"
                  icon={<Building size={14} className="text-[#462434]" />}
                  value={customer.gstin}
                  onChange={(e) => setCustomer({ ...customer, gstin: e.target.value.toUpperCase() })}
                  placeholder="GSTIN Code"
                  className="uppercase"
                />
                <div>
                  <label className="block text-[9px] font-bold tracking-[0.1em] uppercase text-[#462434] mb-1.5">STATE CODE</label>
                  <div className="relative h-10 flex items-center bg-white border border-gray-200 rounded">
                    <div className="px-3 border-r border-gray-200 bg-gray-50 h-full flex items-center justify-center">
                      <Flag size={14} className="text-[#462434]" />
                    </div>
                    <select
                      className="w-full h-full bg-transparent text-neutral-900 text-sm pl-3 pr-8 appearance-none focus:outline-none cursor-pointer"
                      value={customer.stateCode}
                      onChange={(e) => setCustomer({ ...customer, stateCode: e.target.value })}
                    >
                      <option value="">Code</option>
                      {INDIAN_STATE_CODES.map(code => <option key={code} value={code}>{code}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold tracking-[0.1em] uppercase text-[#462434] mb-1.5">BILLING ADDRESS</label>
                <div className="relative flex bg-white border border-gray-200 rounded overflow-hidden">
                  <div className="pl-3 pt-3 text-[#462434]">
                    <MapPin size={14} />
                  </div>
                  <textarea
                    rows={2}
                    className="w-full bg-transparent text-neutral-900 text-sm px-3 py-2.5 focus:outline-none resize-none placeholder:text-neutral-400"
                    placeholder="Street, City, Pincode"
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ================= 2. OLD GOLD EXCHANGE ================= */}
          <SectionCard
            title="OLD GOLD EXCHANGE"
            icon={<RotateCcw size={16} strokeWidth={2.5} />}
            isExpanded={expandedSections.metal}
            onToggle={() => toggleSection('metal')}
            headerAction={
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setUseMetalExchange(!useMetalExchange)}
                  className={`w-9 h-5 rounded-full relative transition-colors duration-300 focus:outline-none ${useMetalExchange ? 'bg-[#462434]' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${useMetalExchange ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
            }
          >
            {useMetalExchange && (
              <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-[8px] font-bold tracking-[0.1em] uppercase text-[#462434] mb-1">METAL TYPE</label>
                    <select className="w-full h-9 border border-gray-200 rounded bg-white text-sm px-3 outline-none" value={metalExchange.metalType} onChange={(e) => setMetalExchange({ ...metalExchange, metalType: e.target.value })}>
                      <option value="gold">Gold</option>
                      <option value="silver">Silver</option>
                      <option value="platinum">Platinum</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[8px] font-bold tracking-[0.1em] uppercase text-[#462434] mb-1">PURITY</label>
                    <select className="w-full h-9 border border-gray-200 rounded bg-white text-sm px-3 outline-none" value={metalExchange.purity} onChange={(e) => setMetalExchange({ ...metalExchange, purity: e.target.value })}>
                      {purityOptions[metalExchange.metalType].map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[8px] font-bold tracking-[0.1em] uppercase text-[#462434] mb-1">WEIGHT (G)</label>
                    <input type="number" className="w-full h-9 border border-gray-200 rounded bg-white text-sm px-3 outline-none" placeholder="0.00" value={metalExchange.weight} onChange={(e) => setMetalExchange({ ...metalExchange, weight: Number(e.target.value) || 0 })} />
                  </div>
                </div>

                <div className="bg-[#F6FAF5] border border-[#E9F2E7] rounded-lg p-4 flex flex-col justify-center items-start">
                  <span className="text-[9px] font-bold tracking-widest text-[#3B5B33] uppercase mb-1">METAL CREDIT VALUE</span>
                  <span className="text-xl font-bold text-[#2A4523]">
                    ₹{metalExchange.totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-[#557A4C] mt-0.5 font-medium">Applied @ ₹{metalExchange.ratePerGram}/g</span>
                </div>
              </div>
            )}
          </SectionCard>

          {/* ================= 3. ITEM METADATA ================= */}
          {cart.items.some(item => {
            const snap = item.customSnapshot || item.itemSnapshot || {};
            const existingHSN = snap?.hsn || snap?.productDetails?.hsnCode || snap?.productDetails?.hsn || item.product?.hsnCode;
            const existingCert = snap?.certificateNo || snap?.certificateNumber || snap?.productDetails?.certificateNo || snap?.productDetails?.certificates?.[0]?.certificateNo || item.product?.certificates?.[0]?.certificateNo;
            return !existingHSN || !existingCert;
          }) && (
              <SectionCard
                title="Compliance & Certificate"
                icon={<Tag size={16} strokeWidth={2.5} />}
                isExpanded={expandedSections.items}
                onToggle={() => toggleSection('items')}
              >
                <div className="space-y-4">
                  {cart.items.map((item) => {
                    // 🔥 EXISTING DATA CHECK
                    const snap = item.customSnapshot || item.itemSnapshot || {};
                    const existingHSN = snap?.hsn || snap?.productDetails?.hsnCode || snap?.productDetails?.hsn || item.product?.hsnCode;
                    const existingCertsArray = snap?.productDetails?.certificates || snap?.certificates || item.product?.certificates || [];
                    const existingCert = existingCertsArray.length > 0 
                      ? existingCertsArray.map(c => `${c.lab} - ${c.certificateNo}`).join(", ")
                      : (snap?.certificateNo || snap?.certificateNumber || snap?.productDetails?.certificateNo || "");

                    if (existingHSN && existingCert) return null;

                    return (
                      <div key={item._id} className="space-y-4">

                        <h4 className="text-xs font-bold text-gray-800">
                          {getItemName(item)}
                        </h4>

                        <div className="space-y-3">

                          {/* ✅ HSN */}
                          {!existingHSN && (
                            <ModernInput
                              label="HSN"
                              icon={<FileText size={14} className="text-[#462434]" />}
                              placeholder="e.g. 7113"
                              value={itemsMeta[item._id]?.hsn || ""}
                              onChange={(e) =>
                                setItemsMeta(p => ({
                                  ...p,
                                  [item._id]: {
                                    ...p[item._id],
                                    hsn: e.target.value
                                  }
                                }))
                              }
                            />
                          )}

                          {/* ✅ MULTIPLE CERTIFICATES */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-[9px] font-bold tracking-[0.1em] uppercase text-[#462434]">
                                Certificates
                              </label>
                              <button
                                type="button"
                                onClick={() => addCertificate(item._id)}
                                className="text-[10px] text-[#462434] font-bold hover:underline"
                              >
                                + Add Certificate
                              </button>
                            </div>
                            
                            {(itemsMeta[item._id]?.certificates || []).map((cert, cIndex) => (
                              <div key={cIndex} className="flex gap-2 items-center">
                                <input
                                  placeholder="Lab"
                                  className="w-1/3 h-9 bg-gray-50 border border-neutral-200 text-neutral-900 text-sm rounded-lg px-3 focus:outline-none focus:border-neutral-400"
                                  value={cert.lab}
                                  onChange={(e) => handleCertificateChange(item._id, cIndex, "lab", e.target.value)}
                                />
                                <input
                                  placeholder="Certificate #"
                                  className="flex-1 h-9 bg-gray-50 border border-neutral-200 text-neutral-900 text-sm rounded-lg px-3 focus:outline-none focus:border-neutral-400"
                                  value={cert.certificateNo}
                                  onChange={(e) => handleCertificateChange(item._id, cIndex, "certificateNo", e.target.value)}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeCertificate(item._id, cIndex)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <RotateCcw size={14} />
                                </button>
                              </div>
                            ))}

                            {(!itemsMeta[item._id]?.certificates || itemsMeta[item._id].certificates.length === 0) && !existingCert && (
                              <p className="text-[10px] text-neutral-400 italic">No additional certificates added</p>
                            )}

                            {existingCert && (
                              <div className="p-2 bg-neutral-50 rounded text-[10px] text-neutral-600 border border-neutral-100">
                                <b>Existing:</b> {existingCert}
                              </div>
                            )}
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            )}

          {/* ================= 4. PAYMENT DETAILS ================= */}
          <SectionCard
            title="PAYMENT METHOD"
            icon={<Banknote size={16} strokeWidth={2.5} />}
            isExpanded={expandedSections.payment}
            onToggle={() => toggleSection('payment')}
          >
            <div className="space-y-5">

              {/* PAYMENT MODE PILLS */}
              <div className="flex gap-2">
                {[
                  { id: "CASH", label: "CASH" },
                  { id: "UPI", label: "UPI" },
                  { id: "CARD", label: "CARD" },
                  { id: "BANK", label: "BANK" },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setPayment({ ...payment, mode: mode.id, referenceNo: "" })}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest transition-all ${payment.mode === mode.id
                      ? "bg-[#462434] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* PAYMENT DATE */}
              <ModernInput
                label="TRANSACTION DATE"
                type="date"
                icon={<Calendar size={14} className="text-[#462434]" />}
                value={payment.date}
                onChange={(e) => setPayment({ ...payment, date: e.target.value })}
              />

              {/* REFERENCE NUMBER */}
              {payment.mode !== "CASH" && (
                <ModernInput
                  label="REFERENCE / TRANSACTION ID"
                  icon={<Hash size={14} className="text-[#462434]" />}
                  placeholder="TXN987654321"
                  value={payment.referenceNo}
                  onChange={(e) => setPayment({ ...payment, referenceNo: e.target.value })}
                />
              )}

              {/* AMOUNT RECEIVED (Auto-Calculated if Metal Exchange used) */}
              <ModernInput
                label="AMOUNT COLLECTED"
                icon={<span className="text-xs font-bold text-[#462434]">₹</span>}
                type="number"
                value={payment.amount}
                onChange={(e) => setPayment({ ...payment, amount: Math.max(0, Number(e.target.value)) })}
              />

            </div>
          </SectionCard>
        </div>
      )}

      {/* FOOTER ACTIONS */}
      <div className="space-y-3 pt-4">
        <AnimatePresence>
          {errors.submit && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-3 bg-[#FCE8E6] text-[#C5221F] text-xs font-medium rounded border border-[#F9DEDC] flex items-center gap-2">
              <AlertCircle size={14} /> {errors.submit}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleGenerateInvoice}
          disabled={submitting}
          className="w-full bg-[#462434] text-white py-3.5 rounded text-[11px] font-bold tracking-widest uppercase transition-all hover:bg-[#341a26] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
          <span>{submitting ? "Processing..." : "Generate Invoice"}</span>
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[8px] font-bold tracking-[0.15em] text-gray-400 uppercase pt-2">
          <span>SECURE TRANSACTION</span>
          <span>•</span>
          <span>ROYAL ATELIER ERP V2.4</span>
        </div>
      </div>

    </motion.div>
  );
}

// --- REUSABLE UI COMPONENTS ---

const SectionCard = ({ title, icon, isExpanded, onToggle, children, headerAction }) => (
  <div className="bg-white rounded-lg shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden mb-4">
    <div className="flex items-center justify-between p-4 cursor-pointer select-none" onClick={onToggle}>
      <div className="flex items-center gap-2 text-[#462434]">
        {icon}
        <h4 className="text-[11px] font-extrabold uppercase tracking-widest leading-none mt-0.5">{title}</h4>
      </div>
      {headerAction ? headerAction : (
        <div className="text-gray-400">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      )}
    </div>
    <AnimatePresence>
      {isExpanded && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
          <div className="px-4 pb-5 pt-1">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const ModernInput = ({ label, icon, error, className = "", ...props }) => (
  <div className="w-full">
    {label && <label className="block text-[9px] font-bold tracking-[0.1em] uppercase text-[#462434] mb-1.5">{label}</label>}
    <div className={`relative flex items-center h-10 bg-white border rounded transition-colors ${error ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-200 focus-within:border-gray-400'}`}>
      <div className="px-3 border-r border-gray-200 bg-gray-50 h-full flex items-center justify-center shrink-0 min-w-[40px]">
        {icon}
      </div>
      <input
        className={`w-full h-full bg-transparent text-sm text-gray-800 placeholder:text-gray-400 px-3 outline-none ${className}`}
        {...props}
      />
    </div>
  </div>
);