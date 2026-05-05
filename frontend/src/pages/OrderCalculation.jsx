

//=================================================================deep fixed version below=================================================================




// import { useEffect, useState } from "react";
// import { useParams, useNavigate, Link } from "react-router-dom";
// import API from "../api/api";
// import Loader from "../components/Loader";

// /* ================= GLOBAL RATE HELPERS ================= */
// const GLOBAL_RATE_KEY = "NZR_GLOBAL_RATES";

// const getGlobalRates = () => {
//   try {
//     return JSON.parse(localStorage.getItem(GLOBAL_RATE_KEY));
//   } catch {
//     return null;
//   }
// };

// const setGlobalRates = (rates) => {
//   localStorage.setItem(GLOBAL_RATE_KEY, JSON.stringify(rates));
// };

// export default function OrderCalculation() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   /* ================= STATE ================= */
//   const [order, setOrder] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [ratesLocked, setRatesLocked] = useState(false);

//   // Customer state
//   const [customer, setCustomer] = useState({
//     name: "",
//     mobile: "",
//     address: "",
//     city: "",
//     email: "",
//     gst: ""
//   });

//   const [pricing, setPricing] = useState({
//     metalRate: "",
//     diamondRate: "",
//     stoneRate: "",
//     makingCharge: "",
//     discountType: "flat",
//     discountValue: "",
//     gstRate: 3,
//     gstMakingRate: 5,
//     metalAmount: 0,
//     diamondAmount: 0,
//     stoneAmount: 0,
//     stoneWeight: 0,
//     makingAmount: 0,
//     gstOnMaking: 0,
//     discountAmount: 0,
//     subtotal: 0,
//     gst: 0,
//     grandTotal: 0,
//   });

//   /* ================= FETCH ORDER ================= */
//   useEffect(() => {
//     const fetchOrder = async () => {
//       try {
//         const res = await API.get(`/orders/${id}`);
//         const ord = res.data.order;
//         setOrder(ord);

//         // Set customer details if available
//         if (ord.customer) {
//           setCustomer({
//             name: ord.customer.name || "",
//             mobile: ord.customer.mobile || "",
//             address: ord.customer.address || "",
//             city: ord.customer.city || "",
//             email: ord.customer.email || "",
//             gst: ord.customer.gst || ""
//           });
//         }

//         // 🔐 If order already locked → restore snapshot
//         if (ord.pricingLocked && ord.pricingSnapshot) {
//           setPricing(ord.pricingSnapshot);
//           setRatesLocked(true);
//           return;
//         }

//         // 🌍 Else load GLOBAL rates
//         const globalRates = getGlobalRates();
//         if (globalRates) {
//           setPricing((p) => ({
//             ...p,
//             ...globalRates,
//           }));
//         }
//       } catch {
//         setError("Failed to load order");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrder();
//   }, [id]);

//   /* ================= CALCULATIONS FIXED ================= */
//   useEffect(() => {
//     if (!order || ratesLocked) return;

//     const pd = order.productDetails || {};

//     /* ---------- BASE AMOUNTS ---------- */
//     const metalAmount = Number(pricing.metalRate || 0) * Number(pd.metalWeight || 0);
//     const diamondAmount = Number(pricing.diamondRate || 0) * Number(pd.diamondWeight || 0);

//     const stoneWeight = Array.isArray(pd.stones)
//       ? pd.stones.reduce((s, st) => s + Number(st.stoneWeight || 0), 0)
//       : 0;

//     const stoneAmount = Number(pricing.stoneRate || 0) * stoneWeight;
//     const makingAmount = Number(pricing.makingCharge || 0) * Number(pd.metalWeight || 0);

//     /* ---------- SUBTOTAL (PRE-DISCOUNT) ---------- */
//     const subtotal = metalAmount + diamondAmount + stoneAmount + makingAmount;

//     /* ---------- DISCOUNT ---------- */
//     const discountAmount = pricing.discountType === "percent"
//       ? (subtotal * Number(pricing.discountValue || 0)) / 100
//       : Number(pricing.discountValue || 0);

//     /* ---------- GST BASE SPLIT ---------- */
//     const base3 = metalAmount + diamondAmount + stoneAmount;
//     const base5 = makingAmount;

//     /* ---------- DISCOUNT PROPORTION SPLIT ---------- */
//     const discountRatio = subtotal > 0 ? discountAmount / subtotal : 0;
//     const discountOn3 = base3 * discountRatio;
//     const discountOn5 = base5 * discountRatio;

//     /* ---------- TAXABLE VALUES ---------- */
//     const taxable3 = Math.max(base3 - discountOn3, 0);
//     const taxable5 = Math.max(base5 - discountOn5, 0);

//     const round2 = (v) => Number(v.toFixed(2));
//     const gst = round2(taxable3 * (pricing.gstRate / 100));
//     const gstOnMaking = round2(taxable5 * (pricing.gstMakingRate / 100));
//     const grandTotal = round2(taxable3 + taxable5 + gst + gstOnMaking);

//     /* ---------- STATE UPDATE ---------- */
//     setPricing((p) => ({
//       ...p,
//       metalAmount,
//       diamondAmount,
//       stoneAmount,
//       stoneWeight,
//       makingAmount,
//       discountAmount,
//       subtotal,
//       gst,
//       gstOnMaking,
//       grandTotal,
//     }));
//   }, [
//     pricing.metalRate,
//     pricing.diamondRate,
//     pricing.stoneRate,
//     pricing.makingCharge,
//     pricing.discountType,
//     pricing.discountValue,
//     order,
//     ratesLocked,
//   ]);

//   /* ================= LOCK PRICING ================= */
//   const handleLockRates = async () => {
//     try {
//       // 🌍 Save GLOBAL rates
//       setGlobalRates({
//         metalRate: pricing.metalRate,
//         diamondRate: pricing.diamondRate,
//         stoneRate: pricing.stoneRate,
//         makingCharge: pricing.makingCharge,
//         gstRate: pricing.gstRate,
//         gstMakingRate: pricing.gstMakingRate,
//       });

//       // 🔒 Lock THIS order with customer data
//       await API.patch(`/orders/${order._id}/lock-pricing`, {
//         pricingSnapshot: pricing,
//         customer: customer // Save customer data with order
//       });

//       setRatesLocked(true);
//       alert("Rates locked & customer data saved");
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to lock rates");
//     }
//   };

//   /* ================= UNLOCK (ORDER ONLY) ================= */
//   const handleUnlockRates = async () => {
//     if (!window.confirm("Unlock pricing for this order?")) return;

//     try {
//       await API.patch(`/orders/${order._id}/unlock-pricing`);
//       setRatesLocked(false);
//       alert("Order pricing unlocked");
//     } catch {
//       alert("Failed to unlock pricing");
//     }
//   };

//   /* ================= GENERATE INVOICE ================= */
//   const handleGenerateInvoice = async () => {
//     try {
//       // Validate customer data
//       if (!customer.name || !customer.mobile || !customer.address) {
//         alert("Please fill mandatory customer details");
//         return;
//       }

//       const res = await API.post(`/invoices/${order._id}`, {
//         pricing,
//         customer, // Include customer data
//         paymentMode: "UPI",
//       });
//       navigate(`/invoice/${res.data.invoice._id}`);
//     } catch (err) {
//       alert(err.response?.data?.message || "Order not ready for billing");
//     }
//   };

//   /* ================= UI ================= */
//   if (loading) return <Loader text="Loading order details..." />;
//   if (error) return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fcf9f4] to-white">
//       <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl max-w-md border border-amber-100">
//         <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//           <span className="text-red-500 text-2xl">!</span>
//         </div>
//         <p className="text-red-500 text-xl font-serif mb-3">{error}</p>
//         <Link 
//           to="/" 
//           className="inline-block px-6 py-3 bg-amber-900 text-white rounded-full hover:bg-amber-800 transition-colors"
//         >
//           Back to Dashboard
//         </Link>
//       </div>
//     </div>
//   );
//   if (!order) return null;

//   const pd = order.productDetails || {};

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-[#fcf9f4] to-white">
//       {/* Header */}
//       <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-amber-200">
//         <div className="max-w-7xl mx-auto px-6 py-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <Link 
//                 to="/"
//                 className="inline-flex items-center gap-2 text-amber-800 hover:text-amber-900 transition-colors group"
//               >
//                 <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//                 </svg>
//                 <span className="font-serif font-medium">Back to Orders</span>
//               </Link>
//             </div>
            
//             <div className="text-center">
//               <h1 className="text-3xl font-serif font-light text-gray-900 tracking-tight">Order Calculation</h1>
//               <p className="text-sm text-gray-500 font-light">Order No: {order.orderNo}</p>
//             </div>
            
//             <div className="text-right">
//               <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-800 rounded-full">
//                 <span className="text-sm font-medium">Status:</span>
//                 <span className={`text-xs font-bold px-2 py-1 rounded-full ${
//                   order.status === 'completed' ? 'bg-green-100 text-green-800' :
//                   order.status === 'pending' ? 'bg-amber-100 text-amber-800' :
//                   'bg-blue-100 text-blue-800'
//                 }`}>
//                   {order.status}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-6 py-10">
//         <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          
//           {/* LEFT PANEL - Customer Information (SWAPPED FROM Product Details) */}
//           <div className="space-y-8">
//             {/* Customer Information Card - Now in top position */}
//             <div className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
//               <div className="bg-gradient-to-r from-amber-50 to-white p-6 border-b border-amber-100">
//                 <h2 className="font-serif text-2xl text-gray-900 font-light flex items-center gap-3">
//                   <svg className="w-6 h-6 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
//                   </svg>
//                   Customer Information
//                 </h2>
//                 <p className="text-sm text-gray-600 mt-1">Update customer details for this order</p>
//               </div>
              
//               <div className="p-6 space-y-5">
//                 <div className="grid md:grid-cols-2 gap-5">
//                   <InputField
//                     icon={
//                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
//                       </svg>
//                     }
//                     placeholder="Full Name *"
//                     value={customer.name}
//                     onChange={(e) => setCustomer({...customer, name: e.target.value})}
//                     required
//                   />
//                   <InputField
//                     icon={
//                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
//                       </svg>
//                     }
//                     placeholder="Mobile Number *"
//                     value={customer.mobile}
//                     onChange={(e) => setCustomer({...customer, mobile: e.target.value})}
//                     required
//                   />
//                   <InputField
//                     icon={
//                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                         <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
//                         <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
//                       </svg>
//                     }
//                     placeholder="Email Address"
//                     type="email"
//                     value={customer.email}
//                     onChange={(e) => setCustomer({...customer, email: e.target.value})}
//                   />
//                   <InputField
//                     icon="🏢"
//                     placeholder="GST Number (Optional)"
//                     value={customer.gst}
//                     onChange={(e) => setCustomer({...customer, gst: e.target.value})}
//                   />
//                 </div>
                
//                 <div>
//                   <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 font-medium">
//                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
//                     </svg>
//                     Complete Address (Including City) *
//                   </label>
//                   <textarea
//                     placeholder="Enter complete delivery address including city, state, and pincode..."
//                     value={`${customer.address || ''}${customer.city ? `, ${customer.city}` : ''}`}
//                     onChange={(e) => {
//                       const address = e.target.value;
//                       // Extract city if present, otherwise keep as is
//                       const cityMatch = address.match(/,\s*([^,]+)$/);
//                       const extractedCity = cityMatch ? cityMatch[1] : "";
//                       const baseAddress = cityMatch ? address.replace(/,\s*[^,]+$/, '') : address;
                      
//                       setCustomer({
//                         ...customer,
//                         address: baseAddress,
//                         city: extractedCity
//                       });
//                     }}
//                     className="w-full px-4 py-3 border-2 border-amber-100 rounded-xl focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors min-h-[100px] resize-none font-serif"
//                     required
//                   />
//                   <p className="text-xs text-gray-500 mt-2">
//                     Include city at the end of address (e.g., "...Mumbai")
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Discount Section */}
//             <div className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
//               <div className="bg-gradient-to-r from-amber-50 to-white p-6 border-b border-amber-100">
//                 <h2 className="font-serif text-2xl text-gray-900 font-light">Discount Configuration</h2>
//               </div>
              
//               <div className="p-6 space-y-5">
//                 <div className="grid md:grid-cols-2 gap-5">
//                   <div>
//                     <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 font-medium">
//                       <span className="text-lg">💸</span>
//                       Discount Type
//                     </label>
//                     <select
//                       className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl bg-white focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-serif disabled:bg-gray-100 disabled:cursor-not-allowed"
//                       disabled={ratesLocked}
//                       value={pricing.discountType}
//                       onChange={(e) => setPricing({ ...pricing, discountType: e.target.value })}
//                     >
//                       <option value="flat">Flat ₹</option>
//                       <option value="percent">Percentage %</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 font-medium">
//                       <span className="text-lg">💰</span>
//                       Discount Value {pricing.discountType === "percent" ? "(%)" : "(₹)"}
//                     </label>
//                     <input
//                       type="number"
//                       className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-serif disabled:bg-gray-100 disabled:cursor-not-allowed"
//                       disabled={ratesLocked}
//                       value={pricing.discountValue}
//                       onChange={(e) => setPricing({ ...pricing, discountValue: e.target.value })}
//                     />
//                   </div>
//                 </div>

//                 <div className="bg-amber-50/50 rounded-xl p-4">
//                   <div className="flex items-center justify-between">
//                     <span className="text-gray-700 font-medium">Calculated Discount</span>
//                     <span className="font-mono font-bold text-gray-900">
//                       ₹ {pricing.discountAmount.toFixed(2)}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>





            
//             {/* Product Summary Card - Now moved to right side */}
//             <div className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
//               <div className="bg-gradient-to-r from-amber-50 to-white p-6 border-b border-amber-100">
//                 <h2 className="font-serif text-2xl text-gray-900 font-light">Product Details</h2>
//               </div>
              
//               <div className="p-6">
//                 {/* Product Info */}
//                 <div className="mb-6 pb-6 border-b border-amber-100">
//                   <h3 className="font-serif text-xl text-gray-900 font-light mb-3">{pd.title || "Jewellery Product"}</h3>
//                   <div className="flex flex-wrap gap-2 mb-4">
//                     <span className="text-xs px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full">
//                       {pd.category || "Jewellery"}
//                     </span>
//                     <span className="text-xs px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full">
//                       {pd.metalType} {pd.metalPurity}
//                     </span>
//                     {pd.diamondWeight && pd.diamondWeight > 0 && (
//                       <span className="text-xs px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full">
//                         Diamond
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 {/* Specifications Grid */}
//                 <div className="grid grid-cols-2 gap-4 mb-6">
//                   <DetailItem label="Metal Type" value={pd.metalType} />
//                   <DetailItem label="Metal Purity" value={pd.metalPurity} />
//                   <DetailItem label="Net Metal Weight" value={`${pd.metalWeight || 0} g`} />
//                   <DetailItem label="Gross Weight" value={`${pd.grossWeight || 0} g`} />
//                   <DetailItem label="Diamond Weight" value={`${pd.diamondWeight || 0} ct`} />
//                   <DetailItem label="Stone Weight" value={`
//                     ${Array.isArray(pd.stones)
//                       ? pd.stones.reduce((s, st) => s + Number(st.stoneWeight || 0), 0)
//                       : 0
//                     } ct
//                   `} />
//                 </div>          
//               </div>
//             </div>

//           </div>

//           {/* RIGHT PANEL - Pricing, Calculations & Product Details (SWAPPED) */}
//           <div className="space-y-8">
//             {/* Rates Input Card */}
//             <div className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
//               <div className="bg-gradient-to-r from-amber-50 to-white p-6 border-b border-amber-100">
//                 <div className="flex items-center justify-between">
//                   <h2 className="font-serif text-2xl text-gray-900 font-light flex items-center gap-3">
//                     <svg className="w-6 h-6 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h6a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
//                     </svg>
//                     Rate Configuration
//                   </h2>
//                   <button
//                     onClick={() => ratesLocked ? handleUnlockRates() : handleLockRates()}
//                     className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
//                       ratesLocked
//                         ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                         : "bg-green-100 text-green-700 hover:bg-green-200"
//                     }`}
//                   >
//                     {ratesLocked ? (
//                       <>
//                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                           <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
//                         </svg>
//                         Unlock Rates
//                       </>
//                     ) : (
//                       <>
//                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                           <path fillRule="evenodd" d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243zM12 10a2 2 0 10-4 0 2 2 0 004 0z" clipRule="evenodd" />
//                         </svg>
//                         Lock Rates
//                       </>
//                     )}
//                   </button>
//                 </div>
//                 <p className="text-sm text-gray-600 mt-1">
//                   {ratesLocked ? "Rates are locked for editing" : "Adjust rates as needed"}
//                 </p>
//               </div>
              
//               <div className="p-6">
//                 <div className="grid md:grid-cols-2 gap-5">
//                   <RateInput
//                     label="Metal Rate ₹/gm"
//                     value={pricing.metalRate}
//                     setValue={(val) => setPricing({ ...pricing, metalRate: val })}
//                     locked={ratesLocked}
//                     icon="⛁"
//                   />
//                   <RateInput
//                     label="Diamond Rate ₹/ct"
//                     value={pricing.diamondRate}
//                     setValue={(val) => setPricing({ ...pricing, diamondRate: val })}
//                     locked={ratesLocked}
//                     icon="💎"
//                   />
//                   <RateInput
//                     label="Stone Rate ₹/ct"
//                     value={pricing.stoneRate}
//                     setValue={(val) => setPricing({ ...pricing, stoneRate: val })}
//                     locked={ratesLocked}
//                     icon="🔮"
//                   />
//                   <RateInput
//                     label="Making Charge ₹/gm"
//                     value={pricing.makingCharge}
//                     setValue={(val) => setPricing({ ...pricing, makingCharge: val })}
//                     locked={ratesLocked}
//                     icon="🔨"
//                   />
//                   <RateInput
//                     label="GST % (Metal/Diamond)"
//                     value={pricing.gstRate}
//                     setValue={(val) => setPricing({ ...pricing, gstRate: val })}
//                     locked={ratesLocked}
//                     icon="🏢"
//                   />
//                   <RateInput
//                     label="GST % (Making)"
//                     value={pricing.gstMakingRate}
//                     setValue={(val) => setPricing({ ...pricing, gstMakingRate: val })}
//                     locked={ratesLocked}
//                     icon="⚖️"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Calculation Results Card */}
//             <div className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
//               <div className="bg-gradient-to-r from-amber-50 to-white p-6 border-b border-amber-100">
//                 <h2 className="font-serif text-2xl text-gray-900 font-light">Calculation Results</h2>
//               </div>
              
//               <div className="p-6 space-y-4">
//                 <CalculationRow label="Metal Amount" value={pricing.metalAmount} />
//                 <CalculationRow label="Diamond Amount" value={pricing.diamondAmount} />
//                 <CalculationRow label="Stone Amount" value={pricing.stoneAmount} />
//                 <CalculationRow label="Making Charges" value={pricing.makingAmount} />
                
//                 <div className="border-t border-amber-100 pt-4 space-y-3">
//                   <CalculationRow label="Subtotal" value={pricing.subtotal} bold />
//                   <CalculationRow label="Discount" value={-pricing.discountAmount} />
//                   <CalculationRow label="Taxable Amount" value={pricing.subtotal - pricing.discountAmount} />
//                   <CalculationRow label="GST @ 3%" value={pricing.gst} />
//                   <CalculationRow label="GST @ 5%" value={pricing.gstOnMaking} />
//                 </div>

//                 {/* Grand Total */}
//                 <div className="bg-gradient-to-r from-amber-700 to-amber-900 rounded-2xl p-6 text-white mt-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm opacity-90">Grand Total</p>
//                       <p className="text-xs opacity-80">Inclusive of all taxes</p>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-3xl font-serif font-bold">₹{pricing.grandTotal.toFixed(2)}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="space-y-4">
//               {ratesLocked && (
//                 <button
//                   onClick={handleGenerateInvoice}
//                   className="w-full bg-gradient-to-r from-gray-900 to-black text-white py-5 rounded-2xl font-serif text-xl tracking-wide hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
//                 >
//                   Generate Invoice
//                 </button>
//               )}

//               <div className="text-center">
//                 <p className="text-sm text-gray-500">
//                   ✦ Customer data saved with order ✦ Rates saved globally when locked ✦
//                 </p>
//                 <p className="text-xs text-gray-400 mt-2">
//                   All calculations are performed in real-time
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ================= REUSABLE COMPONENTS ================= */
// const InputField = ({ icon, placeholder, value, onChange, type = "text", required = false, fullWidth = false }) => (
//   <div className={fullWidth ? "col-span-2" : ""}>
//     <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 font-medium">
//       {icon}
//       {placeholder}
//     </label>
//     <input
//       type={type}
//       placeholder={placeholder}
//       value={value}
//       onChange={onChange}
//       required={required}
//       className="w-full px-4 py-3 border-2 border-amber-100 rounded-xl focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors font-serif"
//     />
//   </div>
// );

// const RateInput = ({ label, value, setValue, locked, icon }) => (
//   <div>
//     <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 font-medium">
//       <span className="text-lg">{icon}</span>
//       {label}
//     </label>
//     <input
//       type="number"
//       value={value}
//       disabled={locked}
//       onChange={(e) => setValue(+e.target.value || 0)}
//       className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors font-serif ${
//         locked
//           ? "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
//           : "border-amber-200 focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20"
//       }`}
//     />
//   </div>
// );

// const CalculationRow = ({ label, value, bold = false }) => (
//   <div className="flex items-center justify-between py-2">
//     <span className={`text-gray-700 ${bold ? 'font-semibold' : ''}`}>{label}</span>
//     <span className={`font-mono ${bold ? 'font-bold text-gray-900' : 'text-gray-900'}`}>
//       ₹{value.toFixed(2)}
//     </span>
//   </div>
// );

// const DetailItem = ({ label, value }) => (
//   <div className="bg-gray-50/50 rounded-xl p-3">
//     <p className="text-xs text-gray-500 mb-1">{label}</p>
//     <p className="text-sm font-medium text-gray-900">{value || "-"}</p>
//   </div>
// );







// //================================================================================================
// import { useEffect, useState } from "react";
// import { useParams, useNavigate, Link } from "react-router-dom";
// import API from "../api/api";
// import Loader from "../components/Loader";

// /* ================= GLOBAL RATE HELPERS ================= */
// const GLOBAL_RATE_KEY = "NZR_GLOBAL_RATES";

// const getGlobalRates = () => {
//   try {
//     return JSON.parse(localStorage.getItem(GLOBAL_RATE_KEY));
//   } catch {
//     return null;
//   }
// };

// const setGlobalRates = (rates) => {
//   localStorage.setItem(GLOBAL_RATE_KEY, JSON.stringify(rates));
// };

// export default function OrderCalculation() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   /* ================= STATE ================= */
//   const [order, setOrder] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [ratesLocked, setRatesLocked] = useState(false);

//   // Customer state - नए फ़ील्ड्स जोड़े
//   const [customer, setCustomer] = useState({
//     name: "",
//     mobile: "",
//     address: "",
//     city: "",
//     email: "",
//     gst: "",
//     stateCode: "", // नया
//     gstin: "", // नया
//   });

//   // Payment state - अलग state में
//   const [payment, setPayment] = useState({
//     paymentMode: "UPI",
//     transactionId: "",
//   });

//   // Pricing state - नए फ़ील्ड्स जोड़े
//   const [pricing, setPricing] = useState({
//     metalRate: "",
//     diamondRate: "",
//     stoneRate: "",
//     makingCharge: "",
//     discountType: "flat",
//     discountValue: "",
//     gstRate: 3,
//     gstMakingRate: 5,
//     metalAmount: 0,
//     diamondAmount: 0,
//     stoneAmount: 0,
//     stoneWeight: 0,
//     makingAmount: 0,
//     gstOnMaking: 0,
//     discountAmount: 0,
//     subtotal: 0,
//     gst: 0,
//     grandTotal: 0,
//     fineGoldWeight: 0, // नया
//     certificateNo: "", // नया
//   });

//   /* ================= FETCH ORDER ================= */
//   useEffect(() => {
//     const fetchOrder = async () => {
//       try {
//         const res = await API.get(`/orders/${id}`);
//         const ord = res.data.order;
//         setOrder(ord);

//         // Set customer details if available
//         if (ord.customer) {
//           setCustomer({
//             name: ord.customer.name || "",
//             mobile: ord.customer.mobile || "",
//             address: ord.customer.address || "",
//             city: ord.customer.city || "",
//             email: ord.customer.email || "",
//             gst: ord.customer.gst || "",
//             stateCode: ord.customer.stateCode || ord.stateCode || "", // दोनों जगह से चेक करें
//             gstin: ord.customer.gstin || ord.gstin || "", // दोनों जगह से चेक करें
//           });
//         }

//         // Set payment details
//         setPayment({
//           paymentMode: ord.paymentMode || "UPI",
//           transactionId: ord.transactionId || "",
//         });

//         // Set jewellery specific fields
//         const pd = ord.productDetails || {};
//         setPricing(prev => ({
//           ...prev,
//           fineGoldWeight: pd.fineGoldWeight || 0,
//           certificateNo: pd.certificateNo || "",
//         }));

//         // 🔐 If order already locked → restore snapshot
//         if (ord.pricingLocked && ord.pricingSnapshot) {
//           setPricing(prev => ({
//             ...prev,
//             ...ord.pricingSnapshot,
//             fineGoldWeight: pd.fineGoldWeight || ord.pricingSnapshot.fineGoldWeight || 0,
//             certificateNo: pd.certificateNo || ord.pricingSnapshot.certificateNo || "",
//           }));
//           setRatesLocked(true);
//           return;
//         }

//         // 🌍 Else load GLOBAL rates
//         const globalRates = getGlobalRates();
//         if (globalRates) {
//           setPricing((p) => ({
//             ...p,
//             ...globalRates,
//           }));
//         }
//       } catch {
//         setError("Failed to load order");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrder();
//   }, [id]);

//   /* ================= CALCULATIONS FIXED ================= */
//   useEffect(() => {
//     if (!order || ratesLocked) return;

//     const pd = order.productDetails || {};

//     /* ---------- BASE AMOUNTS ---------- */
//     const metalAmount = Number(pricing.metalRate || 0) * Number(pd.metalWeight || 0);
//     const diamondAmount = Number(pricing.diamondRate || 0) * Number(pd.diamondWeight || 0);

//     const stoneWeight = Array.isArray(pd.stones)
//       ? pd.stones.reduce((s, st) => s + Number(st.stoneWeight || 0), 0)
//       : 0;

//     const stoneAmount = Number(pricing.stoneRate || 0) * stoneWeight;
//     const makingAmount = Number(pricing.makingCharge || 0) * Number(pd.metalWeight || 0);

//     /* ---------- SUBTOTAL (PRE-DISCOUNT) ---------- */
//     const subtotal = metalAmount + diamondAmount + stoneAmount + makingAmount;

//     /* ---------- DISCOUNT ---------- */
//     const discountAmount = pricing.discountType === "percent"
//       ? (subtotal * Number(pricing.discountValue || 0)) / 100
//       : Number(pricing.discountValue || 0);

//     /* ---------- GST BASE SPLIT ---------- */
//     const base3 = metalAmount + diamondAmount + stoneAmount;
//     const base5 = makingAmount;

//     /* ---------- DISCOUNT PROPORTION SPLIT ---------- */
//     const discountRatio = subtotal > 0 ? discountAmount / subtotal : 0;
//     const discountOn3 = base3 * discountRatio;
//     const discountOn5 = base5 * discountRatio;

//     /* ---------- TAXABLE VALUES ---------- */
//     const taxable3 = Math.max(base3 - discountOn3, 0);
//     const taxable5 = Math.max(base5 - discountOn5, 0);

//     const round2 = (v) => Number(v.toFixed(2));
//     const gst = round2(taxable3 * (pricing.gstRate / 100));
//     const gstOnMaking = round2(taxable5 * (pricing.gstMakingRate / 100));
//     const grandTotal = round2(taxable3 + taxable5 + gst + gstOnMaking);

//     /* ---------- STATE UPDATE ---------- */
//     setPricing((p) => ({
//       ...p,
//       metalAmount,
//       diamondAmount,
//       stoneAmount,
//       stoneWeight,
//       makingAmount,
//       discountAmount,
//       subtotal,
//       gst,
//       gstOnMaking,
//       grandTotal,
//     }));
//   }, [
//     pricing.metalRate,
//     pricing.diamondRate,
//     pricing.stoneRate,
//     pricing.makingCharge,
//     pricing.discountType,
//     pricing.discountValue,
//     order,
//     ratesLocked,
//   ]);

//   /* ================= LOCK PRICING ================= */
//   const handleLockRates = async () => {
//     try {
//       // 🌍 Save GLOBAL rates
//       setGlobalRates({
//         metalRate: pricing.metalRate,
//         diamondRate: pricing.diamondRate,
//         stoneRate: pricing.stoneRate,
//         makingCharge: pricing.makingCharge,
//         gstRate: pricing.gstRate,
//         gstMakingRate: pricing.gstMakingRate,
//       });

//       // 🔒 Lock THIS order with all data
//       await API.patch(`/orders/${order._id}/lock-pricing`, {
//         pricingSnapshot: {
//           ...pricing,
//           customer: customer,
//           payment: payment,
//           gstin: customer.gstin,
//           stateCode: customer.stateCode,
//           fineGoldWeight: pricing.fineGoldWeight,
//           certificateNo: pricing.certificateNo,
//         },
//         customer: {
//           ...customer,
//           gstin: customer.gstin,
//           stateCode: customer.stateCode,
//         },
//         paymentMode: payment.paymentMode,
//         transactionId: payment.transactionId,
//         gstin: customer.gstin,
//         stateCode: customer.stateCode,
//       });

//       // Update product details with jewellery specific fields
//       await API.patch(`/orders/${order._id}`, {
//         productDetails: {
//           fineGoldWeight: pricing.fineGoldWeight,
//           certificateNo: pricing.certificateNo,
//         }
//       });

//       setRatesLocked(true);
//       alert("Rates locked & all data saved");
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to lock rates");
//     }
//   };

//   /* ================= UNLOCK (ORDER ONLY) ================= */
//   const handleUnlockRates = async () => {
//     if (!window.confirm("Unlock pricing for this order?")) return;

//     try {
//       await API.patch(`/orders/${order._id}/unlock-pricing`);
//       setRatesLocked(false);
//       alert("Order pricing unlocked");
//     } catch {
//       alert("Failed to unlock pricing");
//     }
//   };

//   /* ================= GENERATE INVOICE ================= */
//   const handleGenerateInvoice = async () => {
//     try {
//       // Validate customer data
//       if (!customer.name || !customer.mobile || !customer.address) {
//         alert("Please fill mandatory customer details");
//         return;
//       }

//       const res = await API.post(`/invoices/${order._id}`, {
//         pricing,
//         customer: {
//           ...customer,
//           gstin: customer.gstin,
//           stateCode: customer.stateCode,
//         },
//         paymentMode: payment.paymentMode,
//         transactionId: payment.transactionId,
//         fineGoldWeight: pricing.fineGoldWeight,
//         certificateNo: pricing.certificateNo,
//         gstin: customer.gstin,
//         stateCode: customer.stateCode,
//       });
      
//       navigate(`/invoice/${res.data.invoice._id}`);
//     } catch (err) {
//       alert(err.response?.data?.message || "Order not ready for billing");
//     }
//   };

//   /* ================= UI ================= */
//   if (loading) return <Loader text="Loading order details..." />;
//   if (error) return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fcf9f4] to-white">
//       <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl max-w-md border border-amber-100">
//         <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//           <span className="text-red-500 text-2xl">!</span>
//         </div>
//         <p className="text-red-500 text-xl font-serif mb-3">{error}</p>
//         <Link 
//           to="/" 
//           className="inline-block px-6 py-3 bg-amber-900 text-white rounded-full hover:bg-amber-800 transition-colors"
//         >
//           Back to Dashboard
//         </Link>
//       </div>
//     </div>
//   );
//   if (!order) return null;

//   const pd = order.productDetails || {};

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-[#fcf9f4] to-white">
//       {/* Header */}
//       <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-amber-200">
//         <div className="max-w-7xl mx-auto px-6 py-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <Link 
//                 to="/"
//                 className="inline-flex items-center gap-2 text-amber-800 hover:text-amber-900 transition-colors group"
//               >
//                 <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//                 </svg>
//                 <span className="font-serif font-medium">Back to Orders</span>
//               </Link>
//             </div>
            
//             <div className="text-center">
//               <h1 className="text-3xl font-serif font-light text-gray-900 tracking-tight">Order Calculation</h1>
//               <p className="text-sm text-gray-500 font-light">Order No: {order.orderNo}</p>
//             </div>
            
//             <div className="text-right">
//               <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-800 rounded-full">
//                 <span className="text-sm font-medium">Status:</span>
//                 <span className={`text-xs font-bold px-2 py-1 rounded-full ${
//                   order.status === 'completed' ? 'bg-green-100 text-green-800' :
//                   order.status === 'pending' ? 'bg-amber-100 text-amber-800' :
//                   'bg-blue-100 text-blue-800'
//                 }`}>
//                   {order.status}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-6 py-10">
//         <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          
//           {/* LEFT PANEL - Customer Information */}
//           <div className="space-y-8">
//             {/* Customer Information Card */}
//             <div className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
//               <div className="bg-gradient-to-r from-amber-50 to-white p-6 border-b border-amber-100">
//                 <h2 className="font-serif text-2xl text-gray-900 font-light flex items-center gap-3">
//                   <svg className="w-6 h-6 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
//                   </svg>
//                   Customer Information
//                 </h2>
//                 <p className="text-sm text-gray-600 mt-1">Update customer details for this order</p>
//               </div>
              
//               <div className="p-6 space-y-5">
//                 <div className="grid md:grid-cols-2 gap-5">
//                   <InputField
//                     icon={
//                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
//                       </svg>
//                     }
//                     placeholder="Full Name *"
//                     value={customer.name}
//                     onChange={(e) => setCustomer({...customer, name: e.target.value})}
//                     required
//                   />
//                   <InputField
//                     icon={
//                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
//                       </svg>
//                     }
//                     placeholder="Mobile Number *"
//                     value={customer.mobile}
//                     onChange={(e) => setCustomer({...customer, mobile: e.target.value})}
//                     required
//                   />
//                   <InputField
//                     icon={
//                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                         <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
//                         <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
//                       </svg>
//                     }
//                     placeholder="Email Address"
//                     type="email"
//                     value={customer.email}
//                     onChange={(e) => setCustomer({...customer, email: e.target.value})}
//                   />
//                   <InputField
//                     icon="🏢"
//                     placeholder="GST Number"
//                     value={customer.gst}
//                     onChange={(e) => setCustomer({...customer, gst: e.target.value})}
//                   />
                  
//                   {/* New GSTIN Field */}
//                   <InputField
//                     icon="📋"
//                     placeholder="GSTIN (15 characters)"
//                     value={customer.gstin}
//                     onChange={(e) => setCustomer({...customer, gstin: e.target.value.toUpperCase()})}
//                     maxLength="15"
//                   />
                  
//                   {/* New State Code Field */}
//                   <InputField
//                     icon="📍"
//                     placeholder="State Code (2 digits)"
//                     value={customer.stateCode}
//                     onChange={(e) => {
//                       const value = e.target.value.replace(/\D/g, '').slice(0, 2);
//                       setCustomer({...customer, stateCode: value});
//                     }}
//                     maxLength="2"
//                   />
//                 </div>
                
//                 {/* Address Textarea */}
//                 <div>
//                   <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 font-medium">
//                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
//                     </svg>
//                     Complete Address (Including City) *
//                   </label>
//                   <textarea
//                     placeholder="Enter complete delivery address including city, state, and pincode..."
//                     value={`${customer.address || ''}${customer.city ? `, ${customer.city}` : ''}`}
//                     onChange={(e) => {
//                       const address = e.target.value;
//                       const cityMatch = address.match(/,\s*([^,]+)$/);
//                       const extractedCity = cityMatch ? cityMatch[1] : "";
//                       const baseAddress = cityMatch ? address.replace(/,\s*[^,]+$/, '') : address;
                      
//                       setCustomer({
//                         ...customer,
//                         address: baseAddress,
//                         city: extractedCity
//                       });
//                     }}
//                     className="w-full px-4 py-3 border-2 border-amber-100 rounded-xl focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors min-h-[100px] resize-none font-serif"
//                     required
//                   />
//                   <p className="text-xs text-gray-500 mt-2">
//                     Include city at the end of address (e.g., "...Mumbai")
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Payment Information Card - New Section */}
//             <div className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
//               <div className="bg-gradient-to-r from-amber-50 to-white p-6 border-b border-amber-100">
//                 <h2 className="font-serif text-2xl text-gray-900 font-light flex items-center gap-3">
//                   <svg className="w-6 h-6 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h6a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
//                   </svg>
//                   Payment Information
//                 </h2>
//                 <p className="text-sm text-gray-600 mt-1">Payment mode and transaction details</p>
//               </div>
              
//               <div className="p-6 space-y-5">
//                 <div className="grid md:grid-cols-2 gap-5">
//                   <div>
//                     <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 font-medium">
//                       <span className="text-lg">💳</span>
//                       Payment Mode
//                     </label>
//                     <select
//                       className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl bg-white focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-serif"
//                       value={payment.paymentMode}
//                       onChange={(e) => setPayment({...payment, paymentMode: e.target.value})}
//                     >
//                       <option value="UPI">UPI</option>
//                       <option value="Cash">Cash</option>
//                       <option value="Card">Card</option>
//                       <option value="Bank Transfer">Bank Transfer</option>
//                       <option value="Cheque">Cheque</option>
//                       <option value="Online">Online</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 font-medium">
//                       <span className="text-lg">🔢</span>
//                       Transaction ID
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Transaction reference number"
//                       value={payment.transactionId}
//                       onChange={(e) => setPayment({...payment, transactionId: e.target.value})}
//                       className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-serif"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Discount Section */}
//             <div className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
//               <div className="bg-gradient-to-r from-amber-50 to-white p-6 border-b border-amber-100">
//                 <h2 className="font-serif text-2xl text-gray-900 font-light">Discount Configuration</h2>
//               </div>
              
//               <div className="p-6 space-y-5">
//                 <div className="grid md:grid-cols-2 gap-5">
//                   <div>
//                     <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 font-medium">
//                       <span className="text-lg">💸</span>
//                       Discount Type
//                     </label>
//                     <select
//                       className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl bg-white focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-serif disabled:bg-gray-100 disabled:cursor-not-allowed"
//                       disabled={ratesLocked}
//                       value={pricing.discountType}
//                       onChange={(e) => setPricing({ ...pricing, discountType: e.target.value })}
//                     >
//                       <option value="flat">Flat ₹</option>
//                       <option value="percent">Percentage %</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 font-medium">
//                       <span className="text-lg">💰</span>
//                       Discount Value {pricing.discountType === "percent" ? "(%)" : "(₹)"}
//                     </label>
//                     <input
//                       type="number"
//                       className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-serif disabled:bg-gray-100 disabled:cursor-not-allowed"
//                       disabled={ratesLocked}
//                       value={pricing.discountValue}
//                       onChange={(e) => setPricing({ ...pricing, discountValue: e.target.value })}
//                     />
//                   </div>
//                 </div>

//                 <div className="bg-amber-50/50 rounded-xl p-4">
//                   <div className="flex items-center justify-between">
//                     <span className="text-gray-700 font-medium">Calculated Discount</span>
//                     <span className="font-mono font-bold text-gray-900">
//                       ₹ {pricing.discountAmount.toFixed(2)}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//             {/* Product Summary Card */}
//             <div className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
//               <div className="bg-gradient-to-r from-amber-50 to-white p-6 border-b border-amber-100">
//                 <h2 className="font-serif text-2xl text-gray-900 font-light">Product Details</h2>
//               </div>
              
//               <div className="p-6">
//                 {/* Product Info */}
//                 <div className="mb-6 pb-6 border-b border-amber-100">
//                   <h3 className="font-serif text-xl text-gray-900 font-light mb-3">{pd.title || "Jewellery Product"}</h3>
//                   <div className="flex flex-wrap gap-2 mb-4">
//                     <span className="text-xs px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full">
//                       {pd.category || "Jewellery"}
//                     </span>
//                     <span className="text-xs px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full">
//                       {pd.metalType} {pd.metalPurity}
//                     </span>
//                     {pd.diamondWeight && pd.diamondWeight > 0 && (
//                       <span className="text-xs px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full">
//                         Diamond
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 {/* Specifications Grid - New Fields Added */}
//                 <div className="grid grid-cols-2 gap-4 mb-6">
//                   <DetailItem label="Metal Type" value={pd.metalType} />
//                   <DetailItem label="Metal Purity" value={pd.metalPurity} />
//                   <DetailItem label="Net Metal Weight" value={`${pd.metalWeight || 0} g`} />
//                   <DetailItem label="Gross Weight" value={`${pd.grossWeight || 0} g`} />
//                   <DetailItem label="Diamond Weight" value={`${pd.diamondWeight || 0} ct`} />
//                   <DetailItem label="Stone Weight" value={`
//                     ${Array.isArray(pd.stones)
//                       ? pd.stones.reduce((s, st) => s + Number(st.stoneWeight || 0), 0)
//                       : 0
//                     } ct
//                   `} />
                  
//                   {/* New Fine Gold Weight Field - Editable */}
//                   <div className="bg-gray-50/50 rounded-xl p-3">
//                     <label className="text-xs text-gray-500 mb-1 block">Fine Gold Weight (g)</label>
//                     <input
//                       type="number"
//                       step="0.01"
//                       className="w-full bg-transparent border-none p-0 text-sm font-medium text-gray-900 focus:outline-none focus:ring-0"
//                       value={pricing.fineGoldWeight}
//                       onChange={(e) => setPricing({...pricing, fineGoldWeight: e.target.value})}
//                       placeholder="Enter fine gold weight"
//                     />
//                   </div>
                  
//                   {/* New Certificate Number Field - Editable */}
//                   <div className="bg-gray-50/50 rounded-xl p-3">
//                     <label className="text-xs text-gray-500 mb-1 block">Certificate No</label>
//                     <input
//                       type="text"
//                       className="w-full bg-transparent border-none p-0 text-sm font-medium text-gray-900 focus:outline-none focus:ring-0"
//                       value={pricing.certificateNo}
//                       onChange={(e) => setPricing({...pricing, certificateNo: e.target.value})}
//                       placeholder="Enter certificate number"
//                     />
//                   </div>
//                 </div>          
//               </div>
//             </div>
//           </div>

//           {/* RIGHT PANEL - Pricing, Calculations */}
//           <div className="space-y-8">
//             {/* Rates Input Card */}
//             <div className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
//               <div className="bg-gradient-to-r from-amber-50 to-white p-6 border-b border-amber-100">
//                 <div className="flex items-center justify-between">
//                   <h2 className="font-serif text-2xl text-gray-900 font-light flex items-center gap-3">
//                     <svg className="w-6 h-6 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h6a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
//                     </svg>
//                     Rate Configuration
//                   </h2>
//                   <button
//                     onClick={() => ratesLocked ? handleUnlockRates() : handleLockRates()}
//                     className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
//                       ratesLocked
//                         ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                         : "bg-green-100 text-green-700 hover:bg-green-200"
//                     }`}
//                   >
//                     {ratesLocked ? (
//                       <>
//                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                           <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
//                         </svg>
//                         Unlock Rates
//                       </>
//                     ) : (
//                       <>
//                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                           <path fillRule="evenodd" d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243zM12 10a2 2 0 10-4 0 2 2 0 004 0z" clipRule="evenodd" />
//                         </svg>
//                         Lock Rates
//                       </>
//                     )}
//                   </button>
//                 </div>
//                 <p className="text-sm text-gray-600 mt-1">
//                   {ratesLocked ? "Rates are locked for editing" : "Adjust rates as needed"}
//                 </p>
//               </div>
              
//               <div className="p-6">
//                 <div className="grid md:grid-cols-2 gap-5">
//                   <RateInput
//                     label="Metal Rate ₹/gm"
//                     value={pricing.metalRate}
//                     setValue={(val) => setPricing({ ...pricing, metalRate: val })}
//                     locked={ratesLocked}
//                     icon="⛁"
//                   />
//                   <RateInput
//                     label="Diamond Rate ₹/ct"
//                     value={pricing.diamondRate}
//                     setValue={(val) => setPricing({ ...pricing, diamondRate: val })}
//                     locked={ratesLocked}
//                     icon="💎"
//                   />
//                   <RateInput
//                     label="Stone Rate ₹/ct"
//                     value={pricing.stoneRate}
//                     setValue={(val) => setPricing({ ...pricing, stoneRate: val })}
//                     locked={ratesLocked}
//                     icon="🔮"
//                   />
//                   <RateInput
//                     label="Making Charge ₹/gm"
//                     value={pricing.makingCharge}
//                     setValue={(val) => setPricing({ ...pricing, makingCharge: val })}
//                     locked={ratesLocked}
//                     icon="🔨"
//                   />
//                   <RateInput
//                     label="GST % (Metal/Diamond)"
//                     value={pricing.gstRate}
//                     setValue={(val) => setPricing({ ...pricing, gstRate: val })}
//                     locked={ratesLocked}
//                     icon="🏢"
//                   />
//                   <RateInput
//                     label="GST % (Making)"
//                     value={pricing.gstMakingRate}
//                     setValue={(val) => setPricing({ ...pricing, gstMakingRate: val })}
//                     locked={ratesLocked}
//                     icon="⚖️"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Calculation Results Card */}
//             <div className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
//               <div className="bg-gradient-to-r from-amber-50 to-white p-6 border-b border-amber-100">
//                 <h2 className="font-serif text-2xl text-gray-900 font-light">Calculation Results</h2>
//               </div>
              
//               <div className="p-6 space-y-4">
//                 <CalculationRow label="Metal Amount" value={pricing.metalAmount} />
//                 <CalculationRow label="Diamond Amount" value={pricing.diamondAmount} />
//                 <CalculationRow label="Stone Amount" value={pricing.stoneAmount} />
//                 <CalculationRow label="Making Charges" value={pricing.makingAmount} />
                
//                 <div className="border-t border-amber-100 pt-4 space-y-3">
//                   <CalculationRow label="Subtotal" value={pricing.subtotal} bold />
//                   <CalculationRow label="Discount" value={-pricing.discountAmount} />
//                   <CalculationRow label="Taxable Amount" value={pricing.subtotal - pricing.discountAmount} />
//                   <CalculationRow label="GST @ 3%" value={pricing.gst} />
//                   <CalculationRow label="GST @ 5%" value={pricing.gstOnMaking} />
//                 </div>

//                 {/* Grand Total */}
//                 <div className="bg-gradient-to-r from-amber-700 to-amber-900 rounded-2xl p-6 text-white mt-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm opacity-90">Grand Total</p>
//                       <p className="text-xs opacity-80">Inclusive of all taxes</p>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-3xl font-serif font-bold">₹{pricing.grandTotal.toFixed(2)}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="space-y-4">
//               {ratesLocked && (
//                 <button
//                   onClick={handleGenerateInvoice}
//                   className="w-full bg-gradient-to-r from-gray-900 to-black text-white py-5 rounded-2xl font-serif text-xl tracking-wide hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
//                 >
//                   Generate Invoice
//                 </button>
//               )}

//               <div className="text-center">
//                 <p className="text-sm text-gray-500">
//                   ✦ Customer data saved with order ✦ Rates saved globally when locked ✦
//                 </p>
//                 <p className="text-xs text-gray-400 mt-2">
//                   All calculations are performed in real-time
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ================= REUSABLE COMPONENTS ================= */
// const InputField = ({ icon, placeholder, value, onChange, type = "text", required = false, fullWidth = false, maxLength }) => (
//   <div className={fullWidth ? "col-span-2" : ""}>
//     <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 font-medium">
//       {icon}
//       {placeholder}
//     </label>
//     <input
//       type={type}
//       placeholder={placeholder}
//       value={value}
//       onChange={onChange}
//       required={required}
//       maxLength={maxLength}
//       className="w-full px-4 py-3 border-2 border-amber-100 rounded-xl focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors font-serif"
//     />
//   </div>
// );

// const RateInput = ({ label, value, setValue, locked, icon }) => (
//   <div>
//     <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 font-medium">
//       <span className="text-lg">{icon}</span>
//       {label}
//     </label>
//     <input
//       type="number"
//       value={value}
//       disabled={locked}
//       onChange={(e) => setValue(+e.target.value || 0)}
//       className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors font-serif ${
//         locked
//           ? "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
//           : "border-amber-200 focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20"
//       }`}
//     />
//   </div>
// );

// const CalculationRow = ({ label, value, bold = false }) => (
//   <div className="flex items-center justify-between py-2">
//     <span className={`text-gray-700 ${bold ? 'font-semibold' : ''}`}>{label}</span>
//     <span className={`font-mono ${bold ? 'font-bold text-gray-900' : 'text-gray-900'}`}>
//       ₹{value.toFixed(2)}
//     </span>
//   </div>
// );

// const DetailItem = ({ label, value }) => (
//   <div className="bg-gray-50/50 rounded-xl p-3">
//     <p className="text-xs text-gray-500 mb-1">{label}</p>
//     <p className="text-sm font-medium text-gray-900">{value || "-"}</p>
//   </div>
// );









// //================================== ========================== ========================= ===============================
// import { useEffect, useState } from "react";
// import { useParams, useNavigate, Link } from "react-router-dom";
// import API from "../api/api";
// import Loader from "../components/Loader";

// /* ================= GLOBAL RATE HELPERS ================= */
// const GLOBAL_RATE_KEY = "NZR_GLOBAL_RATES";

// const getGlobalRates = () => {
//   try {
//     return JSON.parse(localStorage.getItem(GLOBAL_RATE_KEY));
//   } catch {
//     return null;
//   }
// };

// const setGlobalRates = (rates) => {
//   localStorage.setItem(GLOBAL_RATE_KEY, JSON.stringify(rates));
// };

// export default function OrderCalculation() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   /* ================= STATE ================= */
//   const [order, setOrder] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [ratesLocked, setRatesLocked] = useState(false);

//   // Customer state - GSTIN और City फ़ील्ड्स यहाँ
//   const [customer, setCustomer] = useState({
//     name: "",
//     mobile: "",
//     address: "",
//     email: "",
//     // ✅ NEW: Only GSTIN (replaces old gst)
//     gstin: "",
//     stateCode: "",
//   });

//   // Payment state - बिल्कुल नया section
//   const [payment, setPayment] = useState({
//     paymentMode: "UPI",
//     transactionId: "",
//   });

//   // Pricing state
//   const [pricing, setPricing] = useState({
//     metalRate: "",
//     diamondRate: "",
//     stoneRate: "",
//     makingCharge: "",
//     discountType: "flat",
//     discountValue: "",
//     gstRate: 3,
//     gstMakingRate: 5,
//     metalAmount: 0,
//     diamondAmount: 0,
//     stoneAmount: 0,
//     stoneWeight: 0,
//     makingAmount: 0,
//     gstOnMaking: 0,
//     discountAmount: 0,
//     subtotal: 0,
//     gst: 0,
//     grandTotal: 0,
//     // ✅ NEW: Jewellery specific fields
//     fineGoldWeight: 0,
//     certificateNo: "",
//     hsnCode: "", // ✅ NEW: HSN Code field
//   });

//   /* ================= FETCH ORDER ================= */
//   useEffect(() => {
//     const fetchOrder = async () => {
//       try {
//         const res = await API.get(`/orders/${id}`);
//         const ord = res.data.order;
//         setOrder(ord);

//         // Set customer details if available
//         if (ord.customer) {
//           setCustomer({
//             name: ord.customer.name || "",
//             mobile: ord.customer.mobile || "",
//             address: ord.customer.address || "",
//             email: ord.customer.email || "",
//             // ✅ Convert old gst to new gstin if needed
//             gstin: ord.customer.gstin || ord.customer.gst || "",
//             stateCode: ord.customer.stateCode || "",
//           });
//         }

//         // Set payment details from order
//         setPayment({
//           paymentMode: ord.paymentMode || "UPI",
//           transactionId: ord.transactionId || "",
//         });

//         // Set jewellery specific fields from product details
//         const pd = ord.productDetails || {};
//         setPricing(prev => ({
//           ...prev,
//           fineGoldWeight: pd.fineGoldWeight || 0,
//           certificateNo: pd.certificateNo || "",
//           hsnCode: pd.hsnCode || "", // ✅ Load HSN Code from product details
//         }));

//         // 🔐 If order already locked → restore snapshot
//         if (ord.pricingLocked && ord.pricingSnapshot) {
//           setPricing(prev => ({
//             ...prev,
//             ...ord.pricingSnapshot,
//             fineGoldWeight: pd.fineGoldWeight || ord.pricingSnapshot.fineGoldWeight || 0,
//             certificateNo: pd.certificateNo || ord.pricingSnapshot.certificateNo || "",
//             hsnCode: pd.hsnCode || ord.pricingSnapshot.hsnCode || "", // ✅ Load HSN from snapshot
//           }));
          
//           // Also restore customer data from snapshot if available
//           if (ord.pricingSnapshot.customer) {
//             setCustomer(prev => ({
//               ...prev,
//               ...ord.pricingSnapshot.customer,
//               gstin: ord.pricingSnapshot.customer.gstin || ord.pricingSnapshot.customer.gst || ""
//             }));
//           }
          
//           // Restore payment data
//           if (ord.pricingSnapshot.paymentMode) {
//             setPayment(prev => ({
//               ...prev,
//               paymentMode: ord.pricingSnapshot.paymentMode,
//               transactionId: ord.pricingSnapshot.transactionId || ""
//             }));
//           }
          
//           setRatesLocked(true);
//           return;
//         }

//         // 🌍 Else load GLOBAL rates
//         const globalRates = getGlobalRates();
//         if (globalRates) {
//           setPricing((p) => ({
//             ...p,
//             ...globalRates,
//           }));
//         }
//       } catch {
//         setError("Failed to load order");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrder();
//   }, [id]);

//   /* ================= CALCULATIONS FIXED ================= */
//   useEffect(() => {
//     if (!order || ratesLocked) return;

//     const pd = order.productDetails || {};

//     /* ---------- BASE AMOUNTS ---------- */
//     const metalAmount = Number(pricing.metalRate || 0) * Number(pd.metalWeight || 0);
//     const diamondAmount = Number(pricing.diamondRate || 0) * Number(pd.diamondWeight || 0);

//     const stoneWeight = Array.isArray(pd.stones)
//       ? pd.stones.reduce((s, st) => s + Number(st.stoneWeight || 0), 0)
//       : 0;

//     const stoneAmount = Number(pricing.stoneRate || 0) * stoneWeight;
//     const makingAmount = Number(pricing.makingCharge || 0) * Number(pd.metalWeight || 0);

//     /* ---------- SUBTOTAL (PRE-DISCOUNT) ---------- */
//     const subtotal = metalAmount + diamondAmount + stoneAmount + makingAmount;

//     /* ---------- DISCOUNT ---------- */
//     const discountAmount = pricing.discountType === "percent"
//       ? (subtotal * Number(pricing.discountValue || 0)) / 100
//       : Number(pricing.discountValue || 0);

//     /* ---------- GST BASE SPLIT ---------- */
//     const base3 = metalAmount + diamondAmount + stoneAmount;
//     const base5 = makingAmount;

//     /* ---------- DISCOUNT PROPORTION SPLIT ---------- */
//     const discountRatio = subtotal > 0 ? discountAmount / subtotal : 0;
//     const discountOn3 = base3 * discountRatio;
//     const discountOn5 = base5 * discountRatio;

//     /* ---------- TAXABLE VALUES ---------- */
//     const taxable3 = Math.max(base3 - discountOn3, 0);
//     const taxable5 = Math.max(base5 - discountOn5, 0);

//     const round2 = (v) => Number(v.toFixed(2));
//     const gst = round2(taxable3 * (pricing.gstRate / 100));
//     const gstOnMaking = round2(taxable5 * (pricing.gstMakingRate / 100));
//     const grandTotal = round2(taxable3 + taxable5 + gst + gstOnMaking);

//     /* ---------- STATE UPDATE ---------- */
//     setPricing((p) => ({
//       ...p,
//       metalAmount,
//       diamondAmount,
//       stoneAmount,
//       stoneWeight,
//       makingAmount,
//       discountAmount,
//       subtotal,
//       gst,
//       gstOnMaking,
//       grandTotal,
//     }));
//   }, [
//     pricing.metalRate,
//     pricing.diamondRate,
//     pricing.stoneRate,
//     pricing.makingCharge,
//     pricing.discountType,
//     pricing.discountValue,
//     order,
//     ratesLocked,
//   ]);

//   /* ================= LOCK PRICING ================= */
//   const handleLockRates = async () => {
//     try {
//       // Validate required fields
//       if (!customer.name || !customer.mobile || !customer.address) {
//         alert("Please fill mandatory customer details (Name, Mobile, Address)");
//         return;
//       }

//       // 🌍 Save GLOBAL rates
//       setGlobalRates({
//         metalRate: pricing.metalRate,
//         diamondRate: pricing.diamondRate,
//         stoneRate: pricing.stoneRate,
//         makingCharge: pricing.makingCharge,
//         gstRate: pricing.gstRate,
//         gstMakingRate: pricing.gstMakingRate,
//       });

//       // 🔒 Lock THIS order with all data
//       await API.patch(`/orders/${order._id}/lock-pricing`, {
//         pricingSnapshot: {
//           ...pricing,
//           customer: customer,
//           payment: payment,
//           gstin: customer.gstin,
//           stateCode: customer.stateCode,
//           fineGoldWeight: pricing.fineGoldWeight,
//           certificateNo: pricing.certificateNo,
//           hsnCode: pricing.hsnCode, // ✅ Include HSN in snapshot
//           paymentMode: payment.paymentMode,
//           transactionId: payment.transactionId,
//         },
//         customer: {
//           ...customer,
//           gstin: customer.gstin,
//           stateCode: customer.stateCode,
//         },
//         paymentMode: payment.paymentMode,
//         transactionId: payment.transactionId,
//         gstin: customer.gstin,
//         stateCode: customer.stateCode,
//       });

//       // Update product details with jewellery specific fields
//       await API.patch(`/orders/${order._id}`, {
//         productDetails: {
//           fineGoldWeight: pricing.fineGoldWeight,
//           certificateNo: pricing.certificateNo,
//           hsnCode: pricing.hsnCode, // ✅ Save HSN to product details
//         }
//       });

//       setRatesLocked(true);
//       alert("Rates locked & all data saved");
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to lock rates");
//     }
//   };

//   /* ================= UNLOCK (ORDER ONLY) ================= */
//   const handleUnlockRates = async () => {
//     if (!window.confirm("Unlock pricing for this order?")) return;

//     try {
//       await API.patch(`/orders/${order._id}/unlock-pricing`);
//       setRatesLocked(false);
//       alert("Order pricing unlocked");
//     } catch {
//       alert("Failed to unlock pricing");
//     }
//   };

//  /* ================= GENERATE INVOICE ================= */
// const handleGenerateInvoice = async () => {
//   try {
//     // Validate customer data
//     if (!customer.name || !customer.mobile || !customer.address) {
//       alert("Please fill mandatory customer details");
//       return;
//     }

//     console.log("Invoice Data being sent:", {
//       pricing: pricing,
//       customer: customer,
//       paymentMode: payment.paymentMode,
//       transactionId: payment.transactionId,
//       fineGoldWeight: pricing.fineGoldWeight,
//       certificateNo: pricing.certificateNo,
//       hsnCode: pricing.hsnCode,
//       gstin: customer.gstin,
//       stateCode: customer.stateCode,
//     });

//     const res = await API.post(`/invoices/${order._id}`, {
//       pricing,
//       customer: {
//         ...customer,
//         gstin: customer.gstin,
//         stateCode: customer.stateCode,
//       },
//       paymentMode: payment.paymentMode,
//       transactionId: payment.transactionId,
//       fineGoldWeight: pricing.fineGoldWeight,
//       certificateNo: pricing.certificateNo,
//       hsnCode: pricing.hsnCode, // ✅ Include HSN in invoice
//       gstin: customer.gstin,
//       stateCode: customer.stateCode,
//     });
    
//     navigate(`/invoice/${res.data.invoice._id}`);
//   } catch (err) {
//     console.error("Invoice generation error:", err.response?.data || err);
//     alert(err.response?.data?.message || "Order not ready for billing");
//   }
// };
//   /* ================= UI ================= */
//   if (loading) return <Loader text="Loading order details..." />;
//   if (error) return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fcf9f4] to-white">
//       <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl max-w-md border border-amber-100">
//         <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//           <span className="text-red-500 text-2xl">!</span>
//         </div>
//         <p className="text-red-500 text-xl font-serif mb-3">{error}</p>
//         <Link 
//           to="/" 
//           className="inline-block px-6 py-3 bg-amber-900 text-white rounded-full hover:bg-amber-800 transition-colors"
//         >
//           Back to Dashboard
//         </Link>
//       </div>
//     </div>
//   );
//   if (!order) return null;

//   const pd = order.productDetails || {};

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-[#fcf9f4] to-white">
//       {/* Header */}
//       <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-amber-200">
//         <div className="max-w-7xl mx-auto px-6 py-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <Link 
//                 to="/"
//                 className="inline-flex items-center gap-2 text-amber-800 hover:text-amber-900 transition-colors group"
//               >
//                 <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//                 </svg>
//                 <span className="font-serif font-medium">Back to Orders</span>
//               </Link>
//             </div>
            
//             <div className="text-center">
//               <h1 className="text-3xl font-serif font-light text-gray-900 tracking-tight">Order Calculation</h1>
//               <p className="text-sm text-gray-500 font-light">Order No: {order.orderNo}</p>
//             </div>
            
//             <div className="text-right">
//               <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-800 rounded-full">
//                 <span className="text-sm font-medium">Status:</span>
//                 <span className={`text-xs font-bold px-2 py-1 rounded-full ${
//                   order.status === 'completed' ? 'bg-green-100 text-green-800' :
//                   order.status === 'pending' ? 'bg-amber-100 text-amber-800' :
//                   'bg-blue-100 text-blue-800'
//                 }`}>
//                   {order.status}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-6 py-10">
//         <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          
//           {/* LEFT PANEL - Customer Information, Payment & Product Details */}
//           <div className="space-y-8">
//             {/* Customer Information Card - सभी नए फ़ील्ड्स */}
//             <div className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
//               <div className="bg-gradient-to-r from-amber-50 to-white p-6 border-b border-amber-100">
//                 <h2 className="font-serif text-2xl text-gray-900 font-light flex items-center gap-3">
//                   <svg className="w-6 h-6 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
//                   </svg>
//                   Customer Information
//                 </h2>
//                 <p className="text-sm text-gray-600 mt-1">Complete billing details for invoice</p>
//               </div>
              
//               <div className="p-6 space-y-5">
//                 {/* Basic Information */}
//                 <div className="grid md:grid-cols-2 gap-5">
//                   <InputField
//                     icon="👤"
//                     placeholder="Full Name *"
//                     value={customer.name}
//                     onChange={(e) => setCustomer({...customer, name: e.target.value})}
//                     required
//                   />
//                   <InputField
//                     icon="📱"
//                     placeholder="Mobile Number *"
//                     value={customer.mobile}
//                     onChange={(e) => setCustomer({...customer, mobile: e.target.value})}
//                     required
//                   />
//                   <InputField
//                     icon="📧"
//                     placeholder="Email Address"
//                     type="email"
//                     value={customer.email}
//                     onChange={(e) => setCustomer({...customer, email: e.target.value})}
//                   />
//                 </div>

//                 {/* GSTIN & State Code */}
//                 <div className="grid md:grid-cols-2 gap-5">
//                   <div>
//                     <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 font-medium">
//                       <span className="text-lg">📋</span>
//                       GSTIN (15 characters)
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="GSTIN Number"
//                       value={customer.gstin}
//                       onChange={(e) => setCustomer({...customer, gstin: e.target.value.toUpperCase()})}
//                       maxLength="15"
//                       className="w-full px-4 py-3 border-2 border-amber-100 rounded-xl focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors font-serif"
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 font-medium">
//                       <span className="text-lg">📍</span>
//                       State Code (2 digits)
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="e.g., 27"
//                       value={customer.stateCode}
//                       onChange={(e) => {
//                         const value = e.target.value.replace(/\D/g, '').slice(0, 2);
//                         setCustomer({...customer, stateCode: value});
//                       }}
//                       maxLength="2"
//                       className="w-full px-4 py-3 border-2 border-amber-100 rounded-xl focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors font-serif"
//                     />
//                   </div>
//                 </div>

//                 {/* Address */}
//                 <div>
//                   <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 font-medium">
//                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
//                     </svg>
//                     Complete Address (Including City) *
//                   </label>
//                   <textarea
//                     placeholder="Enter complete delivery address including city, state, and pincode..."
//                     value={customer.address}
//                     onChange={(e) => setCustomer({...customer, address: e.target.value})}
//                     className="w-full px-4 py-3 border-2 border-amber-100 rounded-xl focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors min-h-[100px] resize-none font-serif"
//                     required
//                   />
//                   <p className="text-xs text-gray-500 mt-2">
//                     Include city, state and pincode in the address (e.g., "123 Street, Mumbai, Maharashtra - 400001")
//                   </p>
//                 </div>
//               </div>
//             </div>








//      {/* ✅ Jewellery Specific Fields - Editable */}
//                 <div className="space-y-4 mb-6">
//                   <h3 className="font-serif text-lg text-gray-900 font-light border-b pb-2">
//                     Jewellery Specific Information
//                   </h3>
                  
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 font-medium">
//                         <span className="text-lg">⚖️</span>
//                         Fine Gold Weight (g)
//                       </label>
//                       <input
//                         type="number"
//                         step="0.01"
//                         className="w-full px-4 py-3 border-2 border-amber-100 rounded-xl focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors font-serif"
//                         value={pricing.fineGoldWeight}
//                         onChange={(e) => setPricing({...pricing, fineGoldWeight: e.target.value})}
//                         placeholder="Enter fine gold weight"
//                       />
//                     </div>
                    
//                     <div>
//                       <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 font-medium">
//                         <span className="text-lg">📋</span>
//                         Certificate No
//                       </label>
//                       <input
//                         type="text"
//                         className="w-full px-4 py-3 border-2 border-amber-100 rounded-xl focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors font-serif"
//                         value={pricing.certificateNo}
//                         onChange={(e) => setPricing({...pricing, certificateNo: e.target.value})}
//                         placeholder="Enter certificate number"
//                       />
//                     </div>
                    
//                     <div className="col-span-2">
//                       <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 font-medium">
//                         <span className="text-lg">🏷️</span>
//                         HSN Code
//                       </label>
//                       <input
//                         type="text"
//                         className="w-full px-4 py-3 border-2 border-amber-100 rounded-xl focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors font-serif"
//                         value={pricing.hsnCode}
//                         onChange={(e) => setPricing({...pricing, hsnCode: e.target.value})}
//                         placeholder="Enter HSN code (e.g., 7113)"
//                       />
//                       <p className="text-xs text-gray-500 mt-2">
//                         HSN code is required for GST invoicing (e.g., 7113 for jewellery)
//                       </p>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="bg-blue-50/50 rounded-xl p-4">
//                   <p className="text-sm text-gray-600 mb-1">Note:</p>
//                   <p className="text-xs text-gray-500">
//                     Fine Gold Weight, Certificate Number and HSN Code are specific to this jewellery piece and will be included in the invoice.
//                   </p>
//                 </div>










//             {/* Payment Information Card */}
//             <div className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
//               <div className="bg-gradient-to-r from-amber-50 to-white p-6 border-b border-amber-100">
//                 <h2 className="font-serif text-2xl text-gray-900 font-light flex items-center gap-3">
//                   <svg className="w-6 h-6 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h6a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
//                   </svg>
//                   Payment Information
//                 </h2>
//                 <p className="text-sm text-gray-600 mt-1">Payment mode and transaction details</p>
//               </div>
              
//               <div className="p-6 space-y-5">
//                 <div className="grid md:grid-cols-2 gap-5">
//                   <div>
//                     <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 font-medium">
//                       <span className="text-lg">💳</span>
//                       Payment Mode *
//                     </label>
//                     <select
//                       className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl bg-white focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-serif"
//                       value={payment.paymentMode}
//                       onChange={(e) => setPayment({...payment, paymentMode: e.target.value})}
//                     >
//                       <option value="UPI">UPI</option>
//                       <option value="Cash">Cash</option>
//                       <option value="Card">Card</option>
//                       <option value="Bank Transfer">Bank Transfer</option>
//                       <option value="Cheque">Cheque</option>
//                       <option value="Online">Online</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 font-medium">
//                       <span className="text-lg">🔢</span>
//                       Transaction ID
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Transaction reference number"
//                       value={payment.transactionId}
//                       onChange={(e) => setPayment({...payment, transactionId: e.target.value})}
//                       className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-serif"
//                     />
//                   </div>
//                 </div>
                
//                 <div className="bg-amber-50/50 rounded-xl p-4">
//                   <p className="text-sm text-gray-600 mb-1">Note:</p>
//                   <p className="text-xs text-gray-500">
//                     Payment details will be saved with the invoice and cannot be changed after locking rates.
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Product Summary Card with Jewellery Specific Fields */}
//             <div className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
//               <div className="bg-gradient-to-r from-amber-50 to-white p-6 border-b border-amber-100">
//                 <h2 className="font-serif text-2xl text-gray-900 font-light">Product & Jewellery Details</h2>
//               </div>
              
//               <div className="p-6">
//                 {/* Product Info */}
//                 <div className="mb-6 pb-6 border-b border-amber-100">
//                   <h3 className="font-serif text-xl text-gray-900 font-light mb-3">
//                     {pd.title || "Jewellery Product"}
//                   </h3>
//                   <div className="flex flex-wrap gap-2 mb-4">
//                     <span className="text-xs px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full">
//                       {pd.category || "Jewellery"}
//                     </span>
//                     <span className="text-xs px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full">
//                       {pd.metalType} {pd.metalPurity}
//                     </span>
//                     {pd.diamondWeight && pd.diamondWeight > 0 && (
//                       <span className="text-xs px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full">
//                         Diamond
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 {/* Specifications Grid */}
//                 <div className="grid grid-cols-2 gap-4 mb-6">
//                   <DetailItem label="Metal Type" value={pd.metalType} />
//                   <DetailItem label="Metal Purity" value={pd.metalPurity} />
//                   <DetailItem label="Net Metal Weight" value={`${pd.metalWeight || 0} g`} />
//                   <DetailItem label="Gross Weight" value={`${pd.grossWeight || 0} g`} />
//                   <DetailItem label="Diamond Weight" value={`${pd.diamondWeight || 0} ct`} />
//                   <DetailItem label="Stone Weight" value={`
//                     ${Array.isArray(pd.stones)
//                       ? pd.stones.reduce((s, st) => s + Number(st.stoneWeight || 0), 0)
//                       : 0
//                     } ct
//                   `} />
//                 </div>

           
//               </div>
//             </div>
//           </div>

//           {/* RIGHT PANEL - Pricing, Calculations */}
//           <div className="space-y-8">
//             {/* Rates Input Card */}
//             <div className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
//               <div className="bg-gradient-to-r from-amber-50 to-white p-6 border-b border-amber-100">
//                 <div className="flex items-center justify-between">
//                   <h2 className="font-serif text-2xl text-gray-900 font-light flex items-center gap-3">
//                     <svg className="w-6 h-6 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h6a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
//                     </svg>
//                     Rate Configuration
//                   </h2>
//                   <button
//                     onClick={() => ratesLocked ? handleUnlockRates() : handleLockRates()}
//                     className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
//                       ratesLocked
//                         ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                         : "bg-green-100 text-green-700 hover:bg-green-200"
//                     }`}
//                   >
//                     {ratesLocked ? (
//                       <>
//                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                           <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
//                         </svg>
//                         Unlock Rates
//                       </>
//                     ) : (
//                       <>
//                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                           <path fillRule="evenodd" d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243zM12 10a2 2 0 10-4 0 2 2 0 004 0z" clipRule="evenodd" />
//                         </svg>
//                         Lock Rates
//                       </>
//                     )}
//                   </button>
//                 </div>
//                 <p className="text-sm text-gray-600 mt-1">
//                   {ratesLocked ? "Rates are locked for editing" : "Adjust rates as needed"}
//                 </p>
//               </div>
              
//               <div className="p-6">
//                 <div className="grid md:grid-cols-2 gap-5">
//                   <RateInput
//                     label="Metal Rate ₹/gm"
//                     value={pricing.metalRate}
//                     setValue={(val) => setPricing({ ...pricing, metalRate: val })}
//                     locked={ratesLocked}
//                     icon="⛁"
//                   />
//                   <RateInput
//                     label="Diamond Rate ₹/ct"
//                     value={pricing.diamondRate}
//                     setValue={(val) => setPricing({ ...pricing, diamondRate: val })}
//                     locked={ratesLocked}
//                     icon="💎"
//                   />
//                   <RateInput
//                     label="Stone Rate ₹/ct"
//                     value={pricing.stoneRate}
//                     setValue={(val) => setPricing({ ...pricing, stoneRate: val })}
//                     locked={ratesLocked}
//                     icon="🔮"
//                   />
//                   <RateInput
//                     label="Making Charge ₹/gm"
//                     value={pricing.makingCharge}
//                     setValue={(val) => setPricing({ ...pricing, makingCharge: val })}
//                     locked={ratesLocked}
//                     icon="🔨"
//                   />
//                   <RateInput
//                     label="GST % (Metal/Diamond)"
//                     value={pricing.gstRate}
//                     setValue={(val) => setPricing({ ...pricing, gstRate: val })}
//                     locked={ratesLocked}
//                     icon="🏢"
//                   />
//                   <RateInput
//                     label="GST % (Making)"
//                     value={pricing.gstMakingRate}
//                     setValue={(val) => setPricing({ ...pricing, gstMakingRate: val })}
//                     locked={ratesLocked}
//                     icon="⚖️"
//                   />
//                 </div>


                

//   <div className="grid md:grid-cols-2 gap-5">
//     {/* Discount Type using RateInput if it supports select inputs */}
//     <div>
//       <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 font-medium">
//         <span className="text-lg">💸</span>
//         Discount Type
//       </label>
//       <select
//         className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-serif disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
//         disabled={ratesLocked}
//         value={pricing.discountType}
//         onChange={(e) => setPricing({ ...pricing, discountType: e.target.value })}
//       >
//         <option value="flat">Flat ₹</option>
//         <option value="percent">Percentage %</option>
//       </select>
//     </div>

//     {/* Discount Value using RateInput pattern */}
//     <RateInput
//       label={`Discount Value ${pricing.discountType === "percent" ? "(%)" : "(₹)"}`}
//       value={pricing.discountValue}
//       setValue={(val) => setPricing({ ...pricing, discountValue: val })}
//       locked={ratesLocked}
//       icon="💰"
//       unit={pricing.discountType === "percent" ? "%" : "₹"}
//     />
//   </div>

//   {/* Calculated Discount - Summary card */}
//   <div className="mt-6 bg-gradient-to-r from-amber-50/80 to-orange-50/50 rounded-xl p-5 border border-amber-200 shadow-sm">
//     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//       <div>
//         <div className="flex items-center gap-3 mb-1">
//           <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center">
//             <span className="text-amber-600 text-lg">🎯</span>
//           </div>
//           <h3 className="text-gray-800 font-semibold">Discount Applied</h3>
//         </div>
//         <p className="text-gray-600 text-sm ml-11">
//           {pricing.discountType === "percent" 
//             ? `${pricing.discountValue}% of total amount`
//             : `Flat ₹${pricing.discountValue} reduction`
//           }
//         </p>
//       </div>
//       <div className="text-right">
//         <div className="text-2xl font-bold font-mono text-gray-900">
//           ₹ {pricing.discountAmount.toFixed(2)}
//         </div>
//         <div className="text-sm text-gray-500 mt-1">Total discount value</div>
//       </div>
//     </div>
//   </div>

//               </div>













//             </div>

//             {/* Calculation Results Card */}
//             <div className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
//               <div className="bg-gradient-to-r from-amber-50 to-white p-6 border-b border-amber-100">
//                 <h2 className="font-serif text-2xl text-gray-900 font-light">Calculation Results</h2>
//               </div>
              
//               <div className="p-6 space-y-4">
//                 <CalculationRow label="Metal Amount" value={pricing.metalAmount} />
//                 <CalculationRow label="Diamond Amount" value={pricing.diamondAmount} />
//                 <CalculationRow label="Stone Amount" value={pricing.stoneAmount} />
//                 <CalculationRow label="Making Charges" value={pricing.makingAmount} />
                
//                 <div className="border-t border-amber-100 pt-4 space-y-3">
//                   <CalculationRow label="Subtotal" value={pricing.subtotal} bold />
//                   <CalculationRow label="Discount" value={-pricing.discountAmount} />
//                   <CalculationRow label="Taxable Amount" value={pricing.subtotal - pricing.discountAmount} />
//                   <CalculationRow label="GST @ 3%" value={pricing.gst} />
//                   <CalculationRow label="GST @ 5%" value={pricing.gstOnMaking} />
//                 </div>

//                 {/* Grand Total */}
//                 <div className="bg-gradient-to-r from-amber-700 to-amber-900 rounded-2xl p-6 text-white mt-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm opacity-90">Grand Total</p>
//                       <p className="text-xs opacity-80">Inclusive of all taxes</p>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-3xl font-serif font-bold">₹{pricing.grandTotal.toFixed(2)}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="space-y-4">
//               {ratesLocked ? (
//                 <>
//                   <button
//                     onClick={handleGenerateInvoice}
//                     className="w-full bg-gradient-to-r from-gray-900 to-black text-white py-5 rounded-2xl font-serif text-xl tracking-wide hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
//                   >
//                     Generate Invoice
//                   </button>
                  
//                   <button
//                     onClick={handleUnlockRates}
//                     className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-3 rounded-2xl font-serif text-lg tracking-wide hover:shadow-xl transition-all duration-300"
//                   >
//                     Unlock Rates for Editing
//                   </button>
//                 </>
//               ) : (
//                 <button
//                   onClick={handleLockRates}
//                   className="w-full bg-gradient-to-r from-green-600 to-emerald-800 text-white py-5 rounded-2xl font-serif text-xl tracking-wide hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
//                 >
//                   Lock Rates & Save All Data
//                 </button>
//               )}

//               <div className="text-center">
//                 <p className="text-sm text-gray-500">
//                   ✦ Customer data saved with order ✦ Rates saved globally when locked ✦
//                 </p>
//                 <p className="text-xs text-gray-400 mt-2">
//                   All calculations are performed in real-time
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ================= REUSABLE COMPONENTS ================= */
// const InputField = ({ icon, placeholder, value, onChange, type = "text", required = false, fullWidth = false, maxLength }) => (
//   <div className={fullWidth ? "col-span-2" : ""}>
//     <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 font-medium">
//       {icon}
//       {placeholder}
//     </label>
//     <input
//       type={type}
//       placeholder={placeholder}
//       value={value}
//       onChange={onChange}
//       required={required}
//       maxLength={maxLength}
//       className="w-full px-4 py-3 border-2 border-amber-100 rounded-xl focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors font-serif"
//     />
//   </div>
// );

// const RateInput = ({ label, value, setValue, locked, icon }) => (
//   <div>
//     <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 font-medium">
//       <span className="text-lg">{icon}</span>
//       {label}
//     </label>
//     <input
//       type="number"
//       value={value}
//       disabled={locked}
//       onChange={(e) => setValue(+e.target.value || 0)}
//       className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors font-serif ${
//         locked
//           ? "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
//           : "border-amber-200 focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20"
//       }`}
//     />
//   </div>
// );

// const CalculationRow = ({ label, value, bold = false }) => (
//   <div className="flex items-center justify-between py-2">
//     <span className={`text-gray-700 ${bold ? 'font-semibold' : ''}`}>{label}</span>
//     <span className={`font-mono ${bold ? 'font-bold text-gray-900' : 'text-gray-900'}`}>
//       ₹{value.toFixed(2)}
//     </span>
//   </div>
// );

// const DetailItem = ({ label, value }) => (
//   <div className="bg-gray-50/50 rounded-xl p-3">
//     <p className="text-xs text-gray-500 mb-1">{label}</p>
//     <p className="text-sm font-medium text-gray-900">{value || "-"}</p>
//   </div>
// );



//================================== ========================== ========================= ===============================

// import { useEffect, useState } from "react";
// import { useParams, useNavigate, Link } from "react-router-dom";
// import API from "../api/api";
// import Loader from "../components/Loader";

// /* ================= GLOBAL RATE HELPERS ================= */
// const GLOBAL_RATE_KEY = "NZR_GLOBAL_RATES";

// const getGlobalRates = () => {
//   try {
//     return JSON.parse(localStorage.getItem(GLOBAL_RATE_KEY));
//   } catch {
//     return null;
//   }
// };

// const setGlobalRates = (rates) => {
//   localStorage.setItem(GLOBAL_RATE_KEY, JSON.stringify(rates));
// };

// export default function OrderCalculation() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   /* ================= STATE ================= */
//   const [order, setOrder] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [ratesLocked, setRatesLocked] = useState(false);

//   // Customer state - GSTIN और City फ़ील्ड्स यहाँ
//   const [customer, setCustomer] = useState({
//     name: "",
//     mobile: "",
//     address: "",
//     email: "",
//     // ✅ NEW: Only GSTIN (replaces old gst)
//     gstin: "",
//     stateCode: "",
//   });

//   // Payment state - बिल्कुल नया section
//   const [payment, setPayment] = useState({
//     paymentMode: "UPI",
//     transactionId: "",
//   });

//   // Pricing state
//   const [pricing, setPricing] = useState({
//     metalRate: "",
//     diamondRate: "",
//     stoneRate: "",
//     makingCharge: "",
//     discountType: "flat",
//     discountValue: "",
//     gstRate: 3,
//     gstMakingRate: 5,
//     metalAmount: 0,
//     diamondAmount: 0,
//     stoneAmount: 0,
//     stoneWeight: 0,
//     makingAmount: 0,
//     gstOnMaking: 0,
//     discountAmount: 0,
//     subtotal: 0,
//     gst: 0,
//     grandTotal: 0,
//     // ✅ NEW: Jewellery specific fields
//     fineGoldWeight: 0,
//     certificateNo: "",
//     hsnCode: "", // ✅ NEW: HSN Code field
//   });

//   /* ================= FETCH ORDER ================= */
//   useEffect(() => {
//     const fetchOrder = async () => {
//       try {
//         const res = await API.get(`/orders/${id}`);
//         const ord = res.data.order;
//         setOrder(ord);

//         // Set customer details if available
//         if (ord.customer) {
//           setCustomer({
//             name: ord.customer.name || "",
//             mobile: ord.customer.mobile || "",
//             address: ord.customer.address || "",
//             email: ord.customer.email || "",
//             // ✅ Convert old gst to new gstin if needed
//             gstin: ord.customer.gstin || ord.customer.gst || "",
//             stateCode: ord.customer.stateCode || "",
//           });
//         }

//         // Set payment details from order
//         setPayment({
//           paymentMode: ord.paymentMode || "UPI",
//           transactionId: ord.transactionId || "",
//         });

//         // Set jewellery specific fields from product details
//         const pd = ord.productDetails || {};
//         setPricing(prev => ({
//           ...prev,
//           fineGoldWeight: pd.fineGoldWeight || 0,
//           certificateNo: pd.certificateNo || "",
//           hsnCode: pd.hsnCode || "", // ✅ Load HSN Code from product details
//         }));

//         // 🔐 If order already locked → restore snapshot
//         if (ord.pricingLocked && ord.pricingSnapshot) {
//           setPricing(prev => ({
//             ...prev,
//             ...ord.pricingSnapshot,
//             fineGoldWeight: pd.fineGoldWeight || ord.pricingSnapshot.fineGoldWeight || 0,
//             certificateNo: pd.certificateNo || ord.pricingSnapshot.certificateNo || "",
//             hsnCode: pd.hsnCode || ord.pricingSnapshot.hsnCode || "", // ✅ Load HSN from snapshot
//           }));
          
//           // Also restore customer data from snapshot if available
//           if (ord.pricingSnapshot.customer) {
//             setCustomer(prev => ({
//               ...prev,
//               ...ord.pricingSnapshot.customer,
//               gstin: ord.pricingSnapshot.customer.gstin || ord.pricingSnapshot.customer.gst || ""
//             }));
//           }
          
//           // Restore payment data
//           if (ord.pricingSnapshot.paymentMode) {
//             setPayment(prev => ({
//               ...prev,
//               paymentMode: ord.pricingSnapshot.paymentMode,
//               transactionId: ord.pricingSnapshot.transactionId || ""
//             }));
//           }
          
//           setRatesLocked(true);
//           return;
//         }

//         // 🌍 Else load GLOBAL rates
//         const globalRates = getGlobalRates();
//         if (globalRates) {
//           setPricing((p) => ({
//             ...p,
//             ...globalRates,
//           }));
//         }
//       } catch {
//         setError("Failed to load order");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrder();
//   }, [id]);

//   /* ================= CALCULATIONS FIXED ================= */
//   useEffect(() => {
//     if (!order || ratesLocked) return;

//     const pd = order.productDetails || {};

//     /* ---------- BASE AMOUNTS ---------- */
//     const metalAmount = Number(pricing.metalRate || 0) * Number(pd.metalWeight || 0);
//     const diamondAmount = Number(pricing.diamondRate || 0) * Number(pd.diamondWeight || 0);

//     const stoneWeight = Array.isArray(pd.stones)
//       ? pd.stones.reduce((s, st) => s + Number(st.stoneWeight || 0), 0)
//       : 0;

//     const stoneAmount = Number(pricing.stoneRate || 0) * stoneWeight;
//     const makingAmount = Number(pricing.makingCharge || 0) * Number(pd.metalWeight || 0);

//     /* ---------- SUBTOTAL (PRE-DISCOUNT) ---------- */
//     const subtotal = metalAmount + diamondAmount + stoneAmount + makingAmount;

//     /* ---------- DISCOUNT ---------- */
//     const discountAmount = pricing.discountType === "percent"
//       ? (subtotal * Number(pricing.discountValue || 0)) / 100
//       : Number(pricing.discountValue || 0);

//     /* ---------- GST BASE SPLIT ---------- */
//     const base3 = metalAmount + diamondAmount + stoneAmount;
//     const base5 = makingAmount;

//     /* ---------- DISCOUNT PROPORTION SPLIT ---------- */
//     const discountRatio = subtotal > 0 ? discountAmount / subtotal : 0;
//     const discountOn3 = base3 * discountRatio;
//     const discountOn5 = base5 * discountRatio;

//     /* ---------- TAXABLE VALUES ---------- */
//     const taxable3 = Math.max(base3 - discountOn3, 0);
//     const taxable5 = Math.max(base5 - discountOn5, 0);

//     const round2 = (v) => Number(v.toFixed(2));
//     const gst = round2(taxable3 * (pricing.gstRate / 100));
//     const gstOnMaking = round2(taxable5 * (pricing.gstMakingRate / 100));
//     const grandTotal = round2(taxable3 + taxable5 + gst + gstOnMaking);

//     /* ---------- STATE UPDATE ---------- */
//     setPricing((p) => ({
//       ...p,
//       metalAmount,
//       diamondAmount,
//       stoneAmount,
//       stoneWeight,
//       makingAmount,
//       discountAmount,
//       subtotal,
//       gst,
//       gstOnMaking,
//       grandTotal,
//     }));
//   }, [
//     pricing.metalRate,
//     pricing.diamondRate,
//     pricing.stoneRate,
//     pricing.makingCharge,
//     pricing.discountType,
//     pricing.discountValue,
//     order,
//     ratesLocked,
//   ]);

//   /* ================= LOCK PRICING ================= */
//   const handleLockRates = async () => {
//     try {
//       // Validate required fields
//       if (!customer.name || !customer.mobile || !customer.address) {
//         alert("Please fill mandatory customer details (Name, Mobile, Address)");
//         return;
//       }

//       // 🌍 Save GLOBAL rates
//       setGlobalRates({
//         metalRate: pricing.metalRate,
//         diamondRate: pricing.diamondRate,
//         stoneRate: pricing.stoneRate,
//         makingCharge: pricing.makingCharge,
//         gstRate: pricing.gstRate,
//         gstMakingRate: pricing.gstMakingRate,
//       });

//       // 🔒 Lock THIS order with all data
//       await API.patch(`/orders/${order._id}/lock-pricing`, {
//         pricingSnapshot: {
//           ...pricing,
//           customer: customer,
//           payment: payment,
//           gstin: customer.gstin,
//           stateCode: customer.stateCode,
//           fineGoldWeight: pricing.fineGoldWeight,
//           certificateNo: pricing.certificateNo,
//           hsnCode: pricing.hsnCode, // ✅ Include HSN in snapshot
//           paymentMode: payment.paymentMode,
//           transactionId: payment.transactionId,
//         },
//         customer: {
//           ...customer,
//           gstin: customer.gstin,
//           stateCode: customer.stateCode,
//         },
//         paymentMode: payment.paymentMode,
//         transactionId: payment.transactionId,
//         gstin: customer.gstin,
//         stateCode: customer.stateCode,
//       });

//       // Update product details with jewellery specific fields
//       await API.patch(`/orders/${order._id}`, {
//         productDetails: {
//           fineGoldWeight: pricing.fineGoldWeight,
//           certificateNo: pricing.certificateNo,
//           hsnCode: pricing.hsnCode, // ✅ Save HSN to product details
//         }
//       });

//       setRatesLocked(true);
//       alert("Rates locked & all data saved");
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to lock rates");
//     }
//   };

//   /* ================= UNLOCK (ORDER ONLY) ================= */
//   const handleUnlockRates = async () => {
//     if (!window.confirm("Unlock pricing for this order?")) return;

//     try {
//       await API.patch(`/orders/${order._id}/unlock-pricing`);
//       setRatesLocked(false);
//       alert("Order pricing unlocked");
//     } catch {
//       alert("Failed to unlock pricing");
//     }
//   };

//  /* ================= GENERATE INVOICE ================= */
// const handleGenerateInvoice = async () => {
//   try {
//     // Validate customer data
//     if (!customer.name || !customer.mobile || !customer.address) {
//       alert("Please fill mandatory customer details");
//       return;
//     }

//     console.log("Invoice Data being sent:", {
//       pricing: pricing,
//       customer: customer,
//       paymentMode: payment.paymentMode,
//       transactionId: payment.transactionId,
//       fineGoldWeight: pricing.fineGoldWeight,
//       certificateNo: pricing.certificateNo,
//       hsnCode: pricing.hsnCode,
//       gstin: customer.gstin,
//       stateCode: customer.stateCode,
//     });

//     const res = await API.post(`/invoices/${order._id}`, {
//       pricing,
//       customer: {
//         ...customer,
//         gstin: customer.gstin,
//         stateCode: customer.stateCode,
//       },
//       paymentMode: payment.paymentMode,
//       transactionId: payment.transactionId,
//       fineGoldWeight: pricing.fineGoldWeight,
//       certificateNo: pricing.certificateNo,
//       hsnCode: pricing.hsnCode, // ✅ Include HSN in invoice
//       gstin: customer.gstin,
//       stateCode: customer.stateCode,
//     });
    
//     navigate(`/invoice/${res.data.invoice._id}`);
//   } catch (err) {
//     console.error("Invoice generation error:", err.response?.data || err);
//     alert(err.response?.data?.message || "Order not ready for billing");
//   }
// };
  
//   /* ================= UI ================= */
//   if (loading) return <Loader text="Loading order details..." />;
//   if (error) return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fcf9f4] to-white">
//       <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl max-w-md border border-amber-100">
//         <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//           <span className="text-red-500 text-2xl">!</span>
//         </div>
//         <p className="text-red-500 text-xl font-serif mb-3">{error}</p>
//         <Link 
//           to="/" 
//           className="inline-block px-6 py-3 bg-amber-900 text-white rounded-full hover:bg-amber-800 transition-colors"
//         >
//           Back to Dashboard
//         </Link>
//       </div>
//     </div>
//   );
//   if (!order) return null;

//   const pd = order.productDetails || {};

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-[#fcf9f4] to-white">
//       {/* Header */}
//       <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-amber-200">
//         <div className="max-w-7xl mx-auto px-6 py-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <Link 
//                 to="/"
//                 className="inline-flex items-center gap-2 text-amber-800 hover:text-amber-900 transition-colors group"
//               >
//                 <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//                 </svg>
//                 <span className="font-serif font-medium">Back to Orders</span>
//               </Link>
//             </div>
            
//             <div className="text-center">
//               <h1 className="text-3xl font-serif font-light text-gray-900 tracking-tight">Order Calculation</h1>
//               <p className="text-sm text-gray-500 font-light">Order No: {order.orderNo}</p>
//             </div>
            
//             <div className="text-right">
//               <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-800 rounded-full">
//                 <span className="text-sm font-medium">Status:</span>
//                 <span className={`text-xs font-bold px-2 py-1 rounded-full ${
//                   order.status === 'completed' ? 'bg-green-100 text-green-800' :
//                   order.status === 'pending' ? 'bg-amber-100 text-amber-800' :
//                   'bg-blue-100 text-blue-800'
//                 }`}>
//                   {order.status}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-6 py-10">
//         <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          
//           {/* LEFT PANEL - Customer Information, Payment & Product Details */}
//           <div className="space-y-8">
//             {/* ===== CUSTOMER INFORMATION CARD ===== */}
//             <div className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
//               <div className="bg-gradient-to-r from-amber-50 to-white p-6 border-b border-amber-100">
//                 <h2 className="font-serif text-2xl text-gray-900 font-light flex items-center gap-3">
//                   <svg className="w-6 h-6 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
//                   </svg>
//                   Customer Information
//                 </h2>
//                 <p className="text-sm text-gray-600 mt-1">Complete billing details for invoice</p>
//               </div>
              
//               <div className="p-6 space-y-5">
//                 {/* Basic Information */}
//                 <div className="space-y-3">
//                   <h3 className="font-serif text-lg text-gray-800 font-medium">Personal Details</h3>
//                   <div className="grid md:grid-cols-2 gap-5">
//                     <InputField
//                       icon="👤"
//                       placeholder="Full Name *"
//                       value={customer.name}
//                       onChange={(e) => setCustomer({...customer, name: e.target.value})}
//                       required
//                     />
//                     <InputField
//                       icon="📱"
//                       placeholder="Mobile Number *"
//                       value={customer.mobile}
//                       onChange={(e) => setCustomer({...customer, mobile: e.target.value})}
//                       required
//                     />
//                     <InputField
//                       icon="📧"
//                       placeholder="Email Address"
//                       type="email"
//                       value={customer.email}
//                       onChange={(e) => setCustomer({...customer, email: e.target.value})}
//                     />
//                   </div>
//                 </div>

//                 {/* GSTIN & State Code */}
//                 <div className="space-y-3">
//                   <h3 className="font-serif text-lg text-gray-800 font-medium">Tax Information</h3>
//                   <div className="grid md:grid-cols-2 gap-5">
//                     <div>
//                       <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 font-medium">
//                         <span className="text-lg">📋</span>
//                         GSTIN (15 characters)
//                       </label>
//                       <input
//                         type="text"
//                         placeholder="GSTIN Number"
//                         value={customer.gstin}
//                         onChange={(e) => setCustomer({...customer, gstin: e.target.value.toUpperCase()})}
//                         maxLength="15"
//                         className="w-full px-4 py-3 border-2 border-amber-100 rounded-xl focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors font-serif"
//                       />
//                     </div>
                    
//                     <div>
//                       <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 font-medium">
//                         <span className="text-lg">📍</span>
//                         State Code (2 digits)
//                       </label>
//                       <input
//                         type="text"
//                         placeholder="e.g., 27"
//                         value={customer.stateCode}
//                         onChange={(e) => {
//                           const value = e.target.value.replace(/\D/g, '').slice(0, 2);
//                           setCustomer({...customer, stateCode: value});
//                         }}
//                         maxLength="2"
//                         className="w-full px-4 py-3 border-2 border-amber-100 rounded-xl focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors font-serif"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Address */}
//                 <div className="space-y-3">
//                   <h3 className="font-serif text-lg text-gray-800 font-medium">Delivery Address</h3>
//                   <div>
//                     <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 font-medium">
//                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
//                       </svg>
//                       Complete Address *
//                     </label>
//                     <textarea
//                       placeholder="Enter complete delivery address including city, state, and pincode..."
//                       value={customer.address}
//                       onChange={(e) => setCustomer({...customer, address: e.target.value})}
//                       className="w-full px-4 py-3 border-2 border-amber-100 rounded-xl focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors min-h-[100px] resize-none font-serif"
//                       required
//                     />
//                     <p className="text-xs text-gray-500 mt-2">
//                       Include city, state and pincode in the address (e.g., "123 Street, Mumbai, Maharashtra - 400001")
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* ===== JEWELLERY SPECIFIC FIELDS CARD ===== */}
//             <div className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
//               <div className="bg-gradient-to-r from-amber-50 to-white p-6 border-b border-amber-100">
//                 <h2 className="font-serif text-2xl text-gray-900 font-light flex items-center gap-3">
//                   <svg className="w-6 h-6 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
//                   </svg>
//                   Jewellery Specific Information
//                 </h2>
//                 <p className="text-sm text-gray-600 mt-1">Details specific to this jewellery piece</p>
//               </div>
              
//               <div className="p-6 space-y-5">
//                 <div className="grid grid-cols-2 gap-5">
//                   <div className="space-y-2">
//                     <label className="flex items-center gap-2 text-sm text-gray-600 font-medium">
//                       <span className="text-lg">⚖️</span>
//                       Fine Gold Weight (g)
//                     </label>
//                     <input
//                       type="number"
//                       step="0.01"
//                       className="w-full px-4 py-3 border-2 border-amber-100 rounded-xl focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors font-serif"
//                       value={pricing.fineGoldWeight}
//                       onChange={(e) => setPricing({...pricing, fineGoldWeight: e.target.value})}
//                       placeholder="Enter fine gold weight"
//                     />
//                   </div>
                  
//                   <div className="space-y-2">
//                     <label className="flex items-center gap-2 text-sm text-gray-600 font-medium">
//                       <span className="text-lg">📋</span>
//                       Certificate No
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full px-4 py-3 border-2 border-amber-100 rounded-xl focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors font-serif"
//                       value={pricing.certificateNo}
//                       onChange={(e) => setPricing({...pricing, certificateNo: e.target.value})}
//                       placeholder="Enter certificate number"
//                     />
//                   </div>
                  
//                   <div className="col-span-2 space-y-2">
//                     <label className="flex items-center gap-2 text-sm text-gray-600 font-medium">
//                       <span className="text-lg">🏷️</span>
//                       HSN Code
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full px-4 py-3 border-2 border-amber-100 rounded-xl focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors font-serif"
//                       value={pricing.hsnCode}
//                       onChange={(e) => setPricing({...pricing, hsnCode: e.target.value})}
//                       placeholder="Enter HSN code (e.g., 7113)"
//                     />
//                     <p className="text-xs text-gray-500">
//                       HSN code is required for GST invoicing (e.g., 7113 for jewellery)
//                     </p>
//                   </div>
//                 </div>
                
//                 <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
//                   <p className="text-sm text-gray-600 mb-1">Note:</p>
//                   <p className="text-xs text-gray-500">
//                     Fine Gold Weight, Certificate Number and HSN Code are specific to this jewellery piece and will be included in the invoice.
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* ===== PAYMENT INFORMATION CARD ===== */}
//             <div className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
//               <div className="bg-gradient-to-r from-amber-50 to-white p-6 border-b border-amber-100">
//                 <h2 className="font-serif text-2xl text-gray-900 font-light flex items-center gap-3">
//                   <svg className="w-6 h-6 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h6a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
//                   </svg>
//                   Payment Information
//                 </h2>
//                 <p className="text-sm text-gray-600 mt-1">Payment mode and transaction details</p>
//               </div>
              
//               <div className="p-6 space-y-5">
//                 <div className="grid md:grid-cols-2 gap-5">
//                   <div className="space-y-2">
//                     <label className="flex items-center gap-2 text-sm text-gray-600 font-medium">
//                       <span className="text-lg">💳</span>
//                       Payment Mode *
//                     </label>
//                     <select
//                       className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl bg-white focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-serif"
//                       value={payment.paymentMode}
//                       onChange={(e) => setPayment({...payment, paymentMode: e.target.value})}
//                     >
//                       <option value="UPI">UPI</option>
//                       <option value="Cash">Cash</option>
//                       <option value="Card">Card</option>
//                       <option value="Bank Transfer">Bank Transfer</option>
//                       <option value="Cheque">Cheque</option>
//                       <option value="Online">Online</option>
//                     </select>
//                   </div>

//                   <div className="space-y-2">
//                     <label className="flex items-center gap-2 text-sm text-gray-600 font-medium">
//                       <span className="text-lg">🔢</span>
//                       Transaction ID
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Transaction reference number"
//                       value={payment.transactionId}
//                       onChange={(e) => setPayment({...payment, transactionId: e.target.value})}
//                       className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-serif"
//                     />
//                   </div>
//                 </div>
                
//                 <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
//                   <p className="text-sm text-gray-600 mb-1">Note:</p>
//                   <p className="text-xs text-gray-500">
//                     Payment details will be saved with the invoice and cannot be changed after locking rates.
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* ===== PRODUCT SUMMARY CARD ===== */}
//             <div className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
//               <div className="bg-gradient-to-r from-amber-50 to-white p-6 border-b border-amber-100">
//                 <h2 className="font-serif text-2xl text-gray-900 font-light">Product & Jewellery Details</h2>
//               </div>
              
//               <div className="p-6 space-y-6">
//                 {/* Product Info */}
//                 <div className="space-y-4">
//                   <h3 className="font-serif text-xl text-gray-900 font-light">
//                     {pd.title || "Jewellery Product"}
//                   </h3>
//                   <div className="flex flex-wrap gap-2">
//                     <span className="text-xs px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full">
//                       {pd.category || "Jewellery"}
//                     </span>
//                     <span className="text-xs px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full">
//                       {pd.metalType} {pd.metalPurity}
//                     </span>
//                     {pd.diamondWeight && pd.diamondWeight > 0 && (
//                       <span className="text-xs px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full">
//                         Diamond
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 {/* Specifications Grid */}
//                 <div className="space-y-3">
//                   <h3 className="font-serif text-lg text-gray-800 font-medium">Specifications</h3>
//                   <div className="grid grid-cols-2 gap-4">
//                     <DetailItem label="Metal Type" value={pd.metalType} />
//                     <DetailItem label="Metal Purity" value={pd.metalPurity} />
//                     <DetailItem label="Net Metal Weight" value={`${pd.metalWeight || 0} g`} />
//                     <DetailItem label="Gross Weight" value={`${pd.grossWeight || 0} g`} />
//                     <DetailItem label="Diamond Weight" value={`${pd.diamondWeight || 0} ct`} />
//                     <DetailItem label="Stone Weight" value={`
//                       ${Array.isArray(pd.stones)
//                         ? pd.stones.reduce((s, st) => s + Number(st.stoneWeight || 0), 0)
//                         : 0
//                       } ct
//                     `} />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* RIGHT PANEL - Pricing, Calculations */}
//           <div className="space-y-8">
//             {/* ===== RATE CONFIGURATION CARD ===== */}
//             <div className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
//               <div className="bg-gradient-to-r from-amber-50 to-white p-6 border-b border-amber-100">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h2 className="font-serif text-2xl text-gray-900 font-light flex items-center gap-3">
//                       <svg className="w-6 h-6 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h6a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
//                       </svg>
//                       Rate Configuration
//                     </h2>
//                     <p className="text-sm text-gray-600 mt-1">
//                       {ratesLocked ? "Rates are locked for editing" : "Adjust rates as needed"}
//                     </p>
//                   </div>
//                   <button
//                     onClick={() => ratesLocked ? handleUnlockRates() : handleLockRates()}
//                     className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
//                       ratesLocked
//                         ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
//                         : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
//                     }`}
//                   >
//                     {ratesLocked ? (
//                       <>
//                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                           <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
//                         </svg>
//                         Unlock Rates
//                       </>
//                     ) : (
//                       <>
//                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                           <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
//                         </svg>
//                         Lock Rates
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>
              
//               <div className="p-6 space-y-6">
//                 {/* SECTION 1: Primary Rates */}
//                 <div className="space-y-3">
//                   <h3 className="font-serif text-lg text-gray-800 font-medium flex items-center gap-2">
//                     <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
//                       <span className="text-amber-700">💎</span>
//                     </div>
//                     Primary Rates
//                   </h3>
//                   <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
//                     <RateInput
//                       label="Metal Rate ₹/gm"
//                       value={pricing.metalRate}
//                       setValue={(val) => setPricing({ ...pricing, metalRate: val })}
//                       locked={ratesLocked}
//                       icon="⛁"
//                     />
//                     <RateInput
//                       label="Diamond Rate ₹/ct"
//                       value={pricing.diamondRate}
//                       setValue={(val) => setPricing({ ...pricing, diamondRate: val })}
//                       locked={ratesLocked}
//                       icon="💎"
//                     />
//                     <RateInput
//                       label="Stone Rate ₹/ct"
//                       value={pricing.stoneRate}
//                       setValue={(val) => setPricing({ ...pricing, stoneRate: val })}
//                       locked={ratesLocked}
//                       icon="🔮"
//                     />
//                   </div>
//                 </div>

//                 {/* SECTION 2: Charges & Taxes */}
//                 <div className="space-y-3">
//                   <h3 className="font-serif text-lg text-gray-800 font-medium flex items-center gap-2">
//                     <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
//                       <span className="text-blue-700">🏢</span>
//                     </div>
//                     Charges & Taxes
//                   </h3>
//                   <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
//                     <RateInput
//                       label="Making Charge ₹/gm"
//                       value={pricing.makingCharge}
//                       setValue={(val) => setPricing({ ...pricing, makingCharge: val })}
//                       locked={ratesLocked}
//                       icon="🔨"
//                     />
//                     <RateInput
//                       label="GST % (Metal/Diamond)"
//                       value={pricing.gstRate}
//                       setValue={(val) => setPricing({ ...pricing, gstRate: val })}
//                       locked={ratesLocked}
//                       icon="🏢"
//                     />
//                     <RateInput
//                       label="GST % (Making)"
//                       value={pricing.gstMakingRate}
//                       setValue={(val) => setPricing({ ...pricing, gstMakingRate: val })}
//                       locked={ratesLocked}
//                       icon="⚖️"
//                     />
//                   </div>
//                 </div>

//                 {/* SECTION 3: Discount Configuration */}
//                 <div className="space-y-3">
//                   <h3 className="font-serif text-lg text-gray-800 font-medium flex items-center gap-2">
//                     <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
//                       <span className="text-green-700">🎯</span>
//                     </div>
//                     Discount Configuration
//                   </h3>
//                   <div className="grid md:grid-cols-2 gap-5">
//                     <div className="space-y-2">
//                       <label className="flex items-center gap-2 text-sm text-gray-600 font-medium">
//                         <span className="text-lg">💸</span>
//                         Discount Type
//                       </label>
//                       <select
//                         className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 font-serif disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
//                         disabled={ratesLocked}
//                         value={pricing.discountType}
//                         onChange={(e) => setPricing({ ...pricing, discountType: e.target.value })}
//                       >
//                         <option value="flat">Flat ₹ Discount</option>
//                         <option value="percent">Percentage % Discount</option>
//                       </select>
//                     </div>

//                     <div className="space-y-2">
//                       <label className="flex items-center gap-2 text-sm text-gray-600 font-medium">
//                         <span className="text-lg">💰</span>
//                         Discount Value {pricing.discountType === "percent" ? "(%)" : "(₹)"}
//                       </label>
//                       <input
//                         type="number"
//                         className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 font-serif disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
//                         disabled={ratesLocked}
//                         value={pricing.discountValue}
//                         onChange={(e) => setPricing({ ...pricing, discountValue: e.target.value })}
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* SECTION 4: Discount Summary */}
//                 <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
//                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//                     <div className="flex items-start gap-4">
//                       <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
//                         <span className="text-green-700 text-xl">🎯</span>
//                       </div>
//                       <div>
//                         <h3 className="text-gray-800 font-semibold">Discount Applied</h3>
//                         <p className="text-gray-600 text-sm mt-1">
//                           {pricing.discountType === "percent" 
//                             ? `${pricing.discountValue || 0}% of subtotal amount`
//                             : `Flat ₹${pricing.discountValue || 0} reduction`
//                           }
//                         </p>
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <div className="text-2xl font-bold font-mono text-gray-900">
//                         ₹ {pricing.discountAmount.toFixed(2)}
//                       </div>
//                       <div className="text-sm text-gray-500 mt-1">Total discount value</div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* ===== CALCULATION RESULTS CARD ===== */}
//             <div className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
//               <div className="bg-gradient-to-r from-amber-50 to-white p-6 border-b border-amber-100">
//                 <h2 className="font-serif text-2xl text-gray-900 font-light">Calculation Results</h2>
//               </div>
              
//               <div className="p-6 space-y-6">
//                 {/* Base Amounts Section */}
//                 <div className="space-y-3">
//                   <h3 className="font-serif text-lg text-gray-800 font-medium">Base Amounts</h3>
//                   <div className="space-y-2">
//                     <CalculationRow label="Metal Amount" value={pricing.metalAmount} />
//                     <CalculationRow label="Diamond Amount" value={pricing.diamondAmount} />
//                     <CalculationRow label="Stone Amount" value={pricing.stoneAmount} />
//                     <CalculationRow label="Making Charges" value={pricing.makingAmount} />
//                   </div>
//                 </div>

//                 {/* Totals & Taxes Section */}
//                 <div className="space-y-3">
//                   <h3 className="font-serif text-lg text-gray-800 font-medium">Totals & Taxes</h3>
//                   <div className="space-y-3">
//                     <CalculationRow label="Subtotal" value={pricing.subtotal} bold />
//                     <CalculationRow label="Discount" value={-pricing.discountAmount} />
//                     <CalculationRow label="Taxable Amount" value={pricing.subtotal - pricing.discountAmount} />
//                     <CalculationRow label="GST @ 3%" value={pricing.gst} />
//                     <CalculationRow label="GST @ 5%" value={pricing.gstOnMaking} />
//                   </div>
//                 </div>

//                 {/* Grand Total */}
//                 <div className="bg-gradient-to-r from-amber-700 to-amber-900 rounded-2xl p-6 text-white">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm opacity-90">Grand Total</p>
//                       <p className="text-xs opacity-80">Inclusive of all taxes</p>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-3xl font-serif font-bold">₹{pricing.grandTotal.toFixed(2)}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* ===== ACTION BUTTONS ===== */}
//             <div className="space-y-4">
//               {ratesLocked ? (
//                 <>
//                   <button
//                     onClick={handleGenerateInvoice}
//                     className="w-full bg-gradient-to-r from-gray-900 to-black text-white py-5 rounded-2xl font-serif text-xl tracking-wide hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
//                   >
//                     Generate Invoice
//                   </button>
                  
//                   <button
//                     onClick={handleUnlockRates}
//                     className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-3 rounded-2xl font-serif text-lg tracking-wide hover:shadow-xl transition-all duration-300"
//                   >
//                     Unlock Rates for Editing
//                   </button>
//                 </>
//               ) : (
//                 <button
//                   onClick={handleLockRates}
//                   className="w-full bg-gradient-to-r from-green-600 to-emerald-800 text-white py-5 rounded-2xl font-serif text-xl tracking-wide hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
//                 >
//                   Lock Rates & Save All Data
//                 </button>
//               )}

//               <div className="text-center">
//                 <p className="text-sm text-gray-500">
//                   ✦ Customer data saved with order ✦ Rates saved globally when locked ✦
//                 </p>
//                 <p className="text-xs text-gray-400 mt-2">
//                   All calculations are performed in real-time
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ================= REUSABLE COMPONENTS ================= */
// const InputField = ({ icon, placeholder, value, onChange, type = "text", required = false, fullWidth = false, maxLength }) => (
//   <div className={fullWidth ? "col-span-2" : ""}>
//     <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 font-medium">
//       {icon}
//       {placeholder}
//     </label>
//     <input
//       type={type}
//       placeholder={placeholder}
//       value={value}
//       onChange={onChange}
//       required={required}
//       maxLength={maxLength}
//       className="w-full px-4 py-3 border-2 border-amber-100 rounded-xl focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors font-serif"
//     />
//   </div>
// );

// const RateInput = ({ label, value, setValue, locked, icon }) => (
//   <div className="space-y-2">
//     <label className="flex items-center gap-2 text-sm text-gray-600 font-medium">
//       <span className="text-lg">{icon}</span>
//       {label}
//     </label>
//     <input
//       type="number"
//       value={value}
//       disabled={locked}
//       onChange={(e) => setValue(+e.target.value || 0)}
//       className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors font-serif ${
//         locked
//           ? "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
//           : "border-amber-200 focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20"
//       }`}
//     />
//   </div>
// );

// const CalculationRow = ({ label, value, bold = false }) => (
//   <div className="flex items-center justify-between py-2">
//     <span className={`text-gray-700 ${bold ? 'font-semibold' : ''}`}>{label}</span>
//     <span className={`font-mono ${bold ? 'font-bold text-gray-900' : 'text-gray-900'}`}>
//       ₹{value.toFixed(2)}
//     </span>
//   </div>
// );

// const DetailItem = ({ label, value }) => (
//   <div className="bg-gray-50/50 rounded-xl p-3">
//     <p className="text-xs text-gray-500 mb-1">{label}</p>
//     <p className="text-sm font-medium text-gray-900">{value || "-"}</p>
//   </div>
// );