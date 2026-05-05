
// import { useState } from "react";
// import ProductList from "../components/ProductList";
// import CartItems from "../components/CartItems";
// import { useNavigate } from "react-router-dom";
// import { useCart } from "../context/CartContext";

// export default function Products() {
//   const navigate = useNavigate();
//   const { clearCart, cart } = useCart();
//   const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

//   // Calculate Total Items only
//   const totalItems = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

//   return (
//     // MAIN LAYOUT
//     <div className="relative h-[100dvh] w-full bg-[#F3F4F6] dark:bg-[#0a0a0a] font-sans overflow-hidden flex flex-col lg:flex-row transition-colors duration-300">

//       {/* ================= LEFT PANEL: INVENTORY CATALOG (Themed) ================= */}
//       <div className="flex-1 h-full overflow-hidden relative z-0 flex flex-col min-w-0">
//         <div className="flex-1 overflow-hidden relative">
//           <ProductList />
//         </div>

//         {/* MOBILE CART TRIGGER BAR (Visible < 1024px) */}
//         <div className="lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-[500px] pb-safe">
//            <button 
//              onClick={() => setIsMobileCartOpen(true)}
//              className="w-full bg-[#1a1a1a] dark:bg-white text-white dark:text-black p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex items-center justify-between border border-gray-700/50 dark:border-gray-200 backdrop-blur-xl active:scale-[0.98] transition-all duration-200"
//            >
//               <div className="flex items-center gap-3">
//                  <div className="bg-[#B8860B] text-white font-bold w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
//                  </div>
//                  <div className="text-left">
//                     <p className="text-[10px] text-gray-400 dark:text-gray-600 font-bold uppercase tracking-wider">Current Ticket</p>
//                     <p className="font-serif text-xl leading-none tracking-wide">
//                       {totalItems} <span className="text-sm font-sans font-medium opacity-70">Items</span>
//                     </p>
//                  </div>
//               </div>
//               <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#B8860B]">
//                  Open Tray
//                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
//               </div>
//            </button>
//         </div>
//       </div>

//       {/* ================= MOBILE OVERLAY BACKDROP ================= */}
//       <div 
//         className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
//            isMobileCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
//         }`}
//         onClick={() => setIsMobileCartOpen(false)}
//       />

//       {/* ================= RIGHT PANEL: SALES TICKET (ALWAYS LIGHT THEME) ================= */}
//       <aside className={`
//           fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] 
//           bg-white shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]
//           lg:relative lg:transform-none lg:w-[380px] xl:w-[450px] lg:shadow-none lg:border-l lg:border-gray-200 lg:z-10
//           ${isMobileCartOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
//           flex flex-col h-full
//           text-gray-900 
//       `}>

//         {/* HEADER (Always White) */}
//         <div className="px-6 py-5 border-b border-gray-100 bg-white flex justify-between items-center shadow-sm z-20 shrink-0">
//           <div>
//             <div className="flex items-center gap-2">
//               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
//               <h2 className="font-serif text-lg text-gray-900 tracking-wide font-medium">
//                 Sales Ticket
//               </h2>
//             </div>
//             <p className="text-[10px] text-gray-400 font-mono mt-1 uppercase tracking-widest pl-4">
//               #{Math.floor(Date.now() / 1000).toString(16).toUpperCase()}
//             </p>
//           </div>

//           <div className="flex items-center gap-2">
//              {cart?.items?.length > 0 && (
//               <button
//                 onClick={() => {
//                   if (window.confirm("Clear all items?")) {
//                     clearCart();
//                     if(window.innerWidth < 1024) setIsMobileCartOpen(false);
//                   }
//                 }}
//                 className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded transition-all"
//               >
//                 Clear
//               </button>
//             )}

//             <button 
//                onClick={() => setIsMobileCartOpen(false)}
//                className="lg:hidden p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors ml-1"
//             >
//                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
//             </button>
//           </div>
//         </div>

//         {/* BODY: Items List (Always Light Background) */}
//         <div className="flex-1 overflow-y-auto p-4 bg-[#FAFAFA] scrollbar-thin scrollbar-thumb-gray-200">
//           {cart?.items?.length > 0 ? (
//             <div className="space-y-3 pb-safe lg:pb-0"> 
//               {/* Force CartItems to render in light mode if it uses internal logic, or rely on parent styles */}
//               <CartItems compact />
//             </div>
//           ) : (
//             <div className="h-full flex flex-col items-center justify-center text-gray-300 select-none pb-20 lg:pb-0">
//               <div className="w-16 h-16 mb-4 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
//                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
//                 </svg>
//               </div>
//               <p className="text-sm font-medium text-gray-400">Ticket is Empty</p>
//               <p className="text-xs text-gray-300 mt-1">Scan an item to begin</p>
//             </div>
//           )}
//         </div>

//         {/* FOOTER: Summary (Always Light) */}
//         <div className="bg-white border-t border-gray-100 shadow-[0_-4px_30px_rgba(0,0,0,0.03)] p-6 z-30 shrink-0 pb-8 lg:pb-6">

//           <div className="mb-6 bg-gray-50 rounded-lg p-4 flex items-center justify-between border border-gray-100">
//              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
//                 Total Quantity
//              </span>
//              <div className="text-right">
//                 <span className="text-3xl font-serif text-[#1a1a1a] leading-none">
//                   {totalItems}
//                 </span>
//                 <span className="text-xs text-gray-400 block font-medium">Items</span>
//              </div>
//           </div>

//           <div className="grid grid-cols-[1fr_1.5fr] gap-3">
//             <button
//               onClick={() => {
//                   navigate("/cart");
//                   setIsMobileCartOpen(false);
//               }}
//               className="px-4 py-3.5 rounded-lg border border-gray-200 text-gray-600 text-[11px] font-bold uppercase tracking-widest hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all duration-300"
//             >
//               Modify
//             </button>

//             <button
//               onClick={() => navigate("/checkout/calculate")}
//               disabled={!cart?.items?.length}
//               className={`
//                 relative overflow-hidden rounded-lg text-white text-[11px] font-bold uppercase tracking-widest transition-all duration-300 shadow-lg flex items-center justify-center gap-2
//                 ${!cart?.items?.length 
//                   ? 'bg-gray-300 cursor-not-allowed shadow-none' 
//                   : 'bg-[#1a1a1a] hover:bg-black hover:shadow-xl active:scale-[0.98]'
//                 }
//               `}
//             >
//               <span>Checkout</span>
//               <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
//               </svg>
//             </button>
//           </div>
//         </div>
//       </aside>
//     </div>
//   );
// }

// import { useState } from "react";
// import ProductList from "../components/ProductList";
// import CartItems from "../components/CartItems";
// import { useCart } from "../context/CartContext";
// import { useNavigate } from "react-router-dom";
// import { ShoppingBag, X, Trash2, ArrowRight } from "lucide-react";

// export default function Products() {
//   const navigate = useNavigate();
//   const { clearCart, cart } = useCart();
//   const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

//   // Calculate Total Items
//   const totalItems = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

//   return (
//     // MAIN LAYOUT bg-[#faf9f6]
//     <div className="relative h-[calc(100vh-80px)] w-full font-sans flex flex-col lg:flex-row overflow-hidden bg-[#faf9f6]">

//       {/* ================= LEFT PANEL: INVENTORY CATALOG ================= */}
//       <div className="flex-1 h-full relative z-0 flex flex-col min-w-0 overflow-hidden ">
//         <ProductList />

//         {/* MOBILE CART TRIGGER BAR (Visible < 1024px) */}
//         <div className="lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[500px] pb-safe">
//            <button 
//              onClick={() => setIsMobileCartOpen(true)}
//              className="w-full bg-[#1a1a1a] text-white p-4 rounded-xl shadow-2xl flex items-center justify-between border border-gray-700 backdrop-blur-xl active:scale-[0.98] transition-all duration-200"
//            >
//               <div className="flex items-center gap-4">
//                  <div className="bg-[#D4AF37] text-black font-bold w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
//                     <ShoppingBag size={20} />
//                  </div>
//                  <div className="text-left">
//                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Current Ticket</p>
//                     <p className="font-serif text-xl leading-none tracking-wide text-white">
//                       {totalItems} <span className="text-sm font-sans font-medium opacity-70">Items</span>
//                     </p>
//                  </div>
//               </div>
//               <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
//                  Open Tray <ArrowRight size={16} />
//               </div>
//            </button>
//         </div>
//       </div>

//       {/* ================= MOBILE OVERLAY BACKDROP ================= */}
//       <div 
//         className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300 ${
//            isMobileCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
//         }`}
//         onClick={() => setIsMobileCartOpen(false)}
//       />

//       {/* ================= RIGHT PANEL: SALES TICKET (SIDEBAR) ================= */}
//       <aside className={`
//           fixed inset-y-0 right-0 z-[70] w-full sm:w-[450px] 
//           bg-white shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]
//           lg:relative lg:transform-none lg:w-[400px] xl:w-[450px] lg:shadow-none lg:border-l lg:border-gray-200 lg:z-10
//           flex flex-col h-full
//       `}>

//         {/* HEADER */}
//         <div className="px-6 py-5 border-b border-gray-100 bg-white flex justify-between items-center shadow-sm z-20 shrink-0">
//           <div>
//             <div className="flex items-center gap-2">
//               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
//               <h2 className="font-serif text-lg text-gray-900 tracking-wide font-medium">Sales Ticket</h2>
//             </div>
//             <p className="text-[10px] text-gray-400 font-mono mt-1 uppercase tracking-widest pl-4">
//               #{Math.floor(Date.now() / 1000).toString(16).toUpperCase()}
//             </p>
//           </div>

//           <div className="flex items-center gap-2">
//              {cart?.items?.length > 0 && (
//               <button
//                 onClick={() => {
//                   if (window.confirm("Clear all items?")) {
//                     clearCart();
//                     if(window.innerWidth < 1024) setIsMobileCartOpen(false);
//                   }
//                 }}
//                 className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
//                 title="Clear Cart"
//               >
//                 <Trash2 size={18} />
//               </button>
//             )}

//             <button 
//                onClick={() => setIsMobileCartOpen(false)}
//                className="lg:hidden p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors ml-1"
//             >
//                <X size={24} />
//             </button>
//           </div>
//         </div>

//         {/* BODY: Items List */}
//         <div className="flex-1 overflow-y-auto p-4 bg-[#FAFAFA] scrollbar-thin scrollbar-thumb-gray-200">
//           {cart?.items?.length > 0 ? (
//             <div className="space-y-3 pb-24 lg:pb-0"> 
//               <CartItems compact />
//             </div>
//           ) : (
//             <div className="h-full flex flex-col items-center justify-center text-gray-300 select-none pb-20 lg:pb-0">
//               <div className="w-20 h-20 mb-6 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
//                 <ShoppingBag size={32} className="text-gray-300" />
//               </div>
//               <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Ticket Empty</p>
//               <p className="text-xs text-gray-300 mt-2">Scan products to add them here</p>
//             </div>
//           )}
//         </div>

//         {/* FOOTER: Summary */}
//         <div className="bg-white border-t border-gray-100 shadow-[0_-4px_30px_rgba(0,0,0,0.03)] p-6 z-30 shrink-0 pb-8 lg:pb-6">

//           <div className="mb-6 bg-stone-50 rounded-lg p-4 flex items-center justify-between border border-stone-100">
//              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Quantity</span>
//              <div className="text-right">
//                 <span className="text-3xl font-serif text-[#1a1a1a] leading-none">{totalItems}</span>
//                 <span className="text-[10px] text-gray-400 font-bold uppercase ml-1">Units</span>
//              </div>
//           </div>

//           <div className="grid grid-cols-[1fr_1.5fr] gap-3">
//             <button
//               onClick={() => {
//                   navigate("/cart");
//                   setIsMobileCartOpen(false);
//               }}
//               className="px-4 py-3.5 rounded-lg border border-gray-200 text-gray-600 text-[11px] font-bold uppercase tracking-widest hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all duration-300"
//             >
//               Modify
//             </button>

//             <button
//               onClick={() => navigate("/checkout/calculate")}
//               disabled={!cart?.items?.length}
//               className={`
//                 relative overflow-hidden rounded-lg text-white text-[11px] font-bold uppercase tracking-widest transition-all duration-300 shadow-lg flex items-center justify-center gap-2
//                 ${!cart?.items?.length 
//                   ? 'bg-gray-300 cursor-not-allowed shadow-none' 
//                   : 'bg-[#1a1a1a] hover:bg-black hover:shadow-xl active:scale-[0.98]'
//                 }
//               `}
//             >
//               <span>Checkout</span>
//               <ArrowRight size={16} />
//             </button>
//           </div>
//         </div>
//       </aside>
//     </div>
//   );
// }

// import { useState, useEffect } from "react";
// import ProductList from "../components/ProductList";
// import CartItems from "../components/CartItems";
// import { useCart } from "../context/CartContext";
// import { useNavigate } from "react-router-dom";
// import { ShoppingBag, X, Trash2, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

// export default function Products() {
//   const navigate = useNavigate();
//   const { clearCart, cart } = useCart();
//   const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
//   const [isCartExpanded, setIsCartExpanded] = useState(false);

//   // Calculate Total Items
//   const totalItems = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

//   // Auto-expand cart when items are added (desktop only)
//   useEffect(() => {
//     if (totalItems > 0 && window.innerWidth >= 1024) {
//       setIsCartExpanded(true);
//     } else if (totalItems === 0 && window.innerWidth >= 1024) {
//       setIsCartExpanded(false);
//     }
//   }, [totalItems]);

//   // Toggle cart expansion
//   const toggleCart = () => {
//     setIsCartExpanded(!isCartExpanded);
//   };

//   return (
//     <div className="relative h-[calc(100vh-80px)] w-full font-sans flex flex-col lg:flex-row overflow-hidden bg-[#FAFAFA]">

//       {/* ================= LEFT PANEL: INVENTORY CATALOG ================= */}
//       <div 
//         className={`flex-1 h-full relative z-0 flex flex-col min-w-0 overflow-hidden transition-all duration-500 ease-in-out ${
//           isCartExpanded ? 'lg:mr-0' : 'lg:mr-0'
//         }`}
//       >
//         <ProductList />

//         {/* MOBILE CART TRIGGER BAR (Visible < 1024px) */}
//         {totalItems > 0 && (
//           <div className="lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[500px] pb-safe">
//             <button 
//               onClick={() => setIsMobileCartOpen(true)}
//               className="w-full bg-[#1a1a1a] text-white p-4 rounded-xl shadow-2xl flex items-center justify-between border border-gray-700 backdrop-blur-xl active:scale-[0.98] transition-all duration-200"
//             >
//               <div className="flex items-center gap-4">
//                 <div className="bg-[#D4AF37] text-black font-bold w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
//                   <ShoppingBag size={20} />
//                 </div>
//                 <div className="text-left">
//                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Current Ticket</p>
//                   <p className="font-serif text-xl leading-none tracking-wide text-white">
//                     {totalItems} <span className="text-sm font-sans font-medium opacity-70">Items</span>
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
//                 Open Tray <ArrowRight size={16} />
//               </div>
//             </button>
//           </div>
//         )}
//       </div>

//       {/* ================= MOBILE OVERLAY BACKDROP ================= */}
//       <div 
//         className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300 ${
//           isMobileCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
//         }`}
//         onClick={() => setIsMobileCartOpen(false)}
//       />

//       {/* ================= DESKTOP TOGGLE BUTTON (Fixed on left edge of cart) ================= */}
//       {totalItems > 0 && (
//         <button
//           onClick={toggleCart}
//           className={`hidden lg:flex fixed top-1/2 -translate-y-1/2 z-[80] items-center justify-center w-8 h-20 bg-[#1a1a1a] text-white rounded-l-lg shadow-xl hover:bg-black transition-all duration-300 ${
//             isCartExpanded ? 'right-[400px] xl:right-[450px]' : 'right-0'
//           }`}
//           title={isCartExpanded ? "Minimize Cart" : "Expand Cart"}
//         >
//           {isCartExpanded ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
//         </button>
//       )}

//       {/* ================= RIGHT PANEL: SALES TICKET (SIDEBAR) ================= */}
//       <aside 
//         className={`
//           fixed lg:fixed inset-y-0 right-0 z-[70] w-full sm:w-[450px]
//           bg-white shadow-2xl flex flex-col h-full

//           /* Mobile: Slide from right */
//           transform transition-transform duration-300 ease-in-out
//           ${isMobileCartOpen ? 'translate-x-0' : 'translate-x-full'}

//           /* Desktop: Fixed width, slide from right */
//           lg:w-[400px] xl:w-[450px] lg:shadow-xl lg:border-l lg:border-gray-200
//           ${isCartExpanded ? 'lg:translate-x-0' : 'lg:translate-x-full'}
//         `}
//       >

//         {/* HEADER */}
//         <div className="px-6 py-5 border-b border-gray-100 bg-white flex justify-between items-center shadow-sm z-20 shrink-0">
//           <div>
//             <div className="flex items-center gap-2">
//               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
//               <h2 className="font-serif text-lg text-gray-900 tracking-wide font-medium">Sales Ticket</h2>
//             </div>
//             <p className="text-[10px] text-gray-400 font-mono mt-1 uppercase tracking-widest pl-4">
//               #{Math.floor(Date.now() / 1000).toString(16).toUpperCase()}
//             </p>
//           </div>

//           <div className="flex items-center gap-2">
//             {cart?.items?.length > 0 && (
//               <button
//                 onClick={() => {
//                   if (window.confirm("Clear all items from cart?")) {
//                     clearCart();
//                     if (window.innerWidth < 1024) setIsMobileCartOpen(false);
//                     if (window.innerWidth >= 1024) setIsCartExpanded(false);
//                   }
//                 }}
//                 className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
//                 title="Clear Cart"
//               >
//                 <Trash2 size={18} />
//               </button>
//             )}

//             <button 
//               onClick={() => {
//                 setIsMobileCartOpen(false);
//                 if (window.innerWidth >= 1024) setIsCartExpanded(false);
//               }}
//               className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
//               title="Close Cart"
//             >
//               <X size={24} />
//             </button>
//           </div>
//         </div>

//         {/* BODY: Items List */}
//         <div className="flex-1 overflow-y-auto p-4 bg-[#FAFAFA] scrollbar-thin scrollbar-thumb-gray-200">
//           {cart?.items?.length > 0 ? (
//             <div className="space-y-3 pb-24 lg:pb-0"> 
//               <CartItems compact />
//             </div>
//           ) : (
//             <div className="h-full flex flex-col items-center justify-center text-gray-300 select-none pb-20 lg:pb-0">
//               <div className="w-20 h-20 mb-6 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
//                 <ShoppingBag size={32} className="text-gray-300" />
//               </div>
//               <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Ticket Empty</p>
//               <p className="text-xs text-gray-300 mt-2">Scan products to add them here</p>
//             </div>
//           )}
//         </div>

//         {/* FOOTER: Summary */}
//         {cart?.items?.length > 0 && (
//           <div className="bg-white border-t border-gray-100 shadow-[0_-4px_30px_rgba(0,0,0,0.03)] p-6 z-30 shrink-0 pb-8 lg:pb-6">

//             <div className="mb-6 bg-stone-50 rounded-lg p-4 flex items-center justify-between border border-stone-100">
//               <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Quantity</span>
//               <div className="text-right">
//                 <span className="text-3xl font-serif text-[#1a1a1a] leading-none">{totalItems}</span>
//                 <span className="text-[10px] text-gray-400 font-bold uppercase ml-1">Units</span>
//               </div>
//             </div>

//             <div className="grid grid-cols-[1fr_1.5fr] gap-3">
//               <button
//                 onClick={() => {
//                   navigate("/cart");
//                   setIsMobileCartOpen(false);
//                   if (window.innerWidth >= 1024) setIsCartExpanded(false);
//                 }}
//                 className="px-4 py-3.5 rounded-lg border border-gray-200 text-gray-600 text-[11px] font-bold uppercase tracking-widest hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all duration-300"
//               >
//                 Modify
//               </button>

//               <button
//                 onClick={() => {
//                   navigate("/checkout/calculate");
//                   setIsMobileCartOpen(false);
//                   if (window.innerWidth >= 1024) setIsCartExpanded(false);
//                 }}
//                 disabled={!cart?.items?.length}
//                 className={`
//                   relative overflow-hidden rounded-lg text-white text-[11px] font-bold uppercase tracking-widest transition-all duration-300 shadow-lg flex items-center justify-center gap-2
//                   ${!cart?.items?.length 
//                     ? 'bg-gray-300 cursor-not-allowed shadow-none' 
//                     : 'bg-[#1a1a1a] hover:bg-black hover:shadow-xl active:scale-[0.98]'
//                   }
//                 `}
//               >
//                 <span>Checkout</span>
//                 <ArrowRight size={16} />
//               </button>
//             </div>
//           </div>
//         )}
//       </aside>

//       {/* ================= DESKTOP FLOATING CART INDICATOR (When cart is minimized) ================= */}
//       {!isCartExpanded && totalItems > 0 && (
//         <button
//           onClick={toggleCart}
//           className="hidden lg:flex fixed bottom-8 right-8 z-[60] bg-[#1a1a1a] text-white rounded-full shadow-2xl items-center gap-3 pr-5 pl-4 py-3 hover:bg-black hover:scale-105 active:scale-95 transition-all duration-300 group"
//         >
//           <div className="relative">
//             <ShoppingBag size={24} />
//             <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
//               {totalItems}
//             </span>
//           </div>
//           <span className="text-sm font-medium">View Cart</span>
//         </button>
//       )}
//     </div>
//   );
// }

// import { useState, useEffect, useRef } from "react";
// import ProductList from "../components/ProductList";
// import CartItems from "../components/CartItems";
// import { useCart } from "../context/CartContext";
// import { useNavigate } from "react-router-dom";
// import { ShoppingCart, X, Trash2, ChevronRight, Package } from "lucide-react";

// export default function Products() {
//   const navigate = useNavigate();
//   const { clearCart, cart } = useCart();
//   const [isCartOpen, setIsCartOpen] = useState(false);
//   const cartPanelRef = useRef(null);

//   // Calculate Total Items
//   const totalItems = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

//   // Auto-open cart when items are added
//   useEffect(() => {
//     if (totalItems > 0) {
//       setIsCartOpen(true);
//     }
//   }, [totalItems]);

//   // Click outside to close cart
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         cartPanelRef.current &&
//         !cartPanelRef.current.contains(event.target) &&
//         isCartOpen
//       ) {
//         setIsCartOpen(false);
//       }
//     };

//     if (isCartOpen) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [isCartOpen]);

//   // Calculate subtotal
//   const subtotal = cart?.items?.reduce((sum, item) => {
//     return sum + ((item.breakup?.grandTotal || 0) * item.quantity);
//   }, 0) || 0;

//   return (
//     <div className="relative h-[calc(100vh-80px)] w-full flex overflow-hidden bg-gradient-to-br from-gray-50 to-slate-100">

//       {/* ================= MAIN CONTENT AREA ================= */}
//       <div 
//         className={`flex-1 h-full transition-all duration-500 ease-in-out ${
//           isCartOpen ? 'mr-0 lg:mr-[420px]' : 'mr-0'
//         }`}
//       >
//         <ProductList onOpenCart={() => setIsCartOpen(true)} />
//       </div>

//       {/* ================= OVERLAY (Mobile/Tablet) ================= */}
//       {isCartOpen && (
//         <div 
//           className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
//           onClick={() => setIsCartOpen(false)}
//         />
//       )}

//       {/* ================= SLIDING CART PANEL ================= */}
// <div
//   ref={cartPanelRef}
//   className={`
//     fixed top-0 right-0 h-full w-full sm:w-[400px]
//     bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.05)]
//     flex flex-col z-50
//     transition-transform duration-500 ease-in-out
//     ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}
//   `}
// >
//   {/* ================= CART HEADER ================= */}
//   <div className="flex-shrink-0 bg-white px-6 py-4 border-b border-gray-100">
//     <div className="flex items-center justify-between">
//       <h2 className="text-sm font-bold uppercase tracking-widest text-gray-800">
//         Shopping Cart
//       </h2>
//       <button
//         onClick={() => setIsCartOpen(false)}
//         className="group p-2 -mr-2 transition-colors"
//       >
//         <X size={20} className="text-gray-400 group-hover:text-red-500 transition-colors" />
//       </button>
//     </div>
//   </div>

//   {/* ================= CART ITEMS ================= */}
//   <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
//     {cart?.items?.length > 0 ? (
//       /* Note: You may need to pass a 'nazara' variant prop to your CartItems component 
//          to ensure individual item rows also match the screenshot style */
//       <CartItems variant="minimal" />
//     ) : (
//       <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
//         <Package size={32} strokeWidth={1} />
//         <p className="mt-2 text-xs uppercase tracking-widest font-medium">Cart is empty</p>
//       </div>
//     )}
//   </div>

//   {/* ================= CART FOOTER ================= */}
//   {cart?.items?.length > 0 && (
//     <div className="flex-shrink-0 bg-white border-t border-gray-100 p-6 space-y-4">

//       {/* Subtotal Display */}
//       <div className="flex items-center justify-between">
//         <span className="text-sm font-medium text-gray-500 uppercase tracking-tighter">Subtotal:</span>
//         <span className="text-lg font-bold text-[#B28912]">
//           ₹{subtotal.toLocaleString("en-IN")}
//         </span>
//       </div>

//       {/* Action Buttons */}
//       <div className="grid grid-cols-2 gap-3">
//         <button
//           onClick={() => {
//             navigate("/cart");
//             setIsCartOpen(false);
//           }}
//           className="w-full py-3 rounded-md border border-gray-200 text-gray-600 font-bold text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all"
//         >
//           View Cart
//         </button>

//         <button
//           onClick={() => {
//             navigate("/checkout/calculate");
//             setIsCartOpen(false);
//           }}
//           className="w-full py-3 rounded-md bg-[#F2F2F2] text-gray-800 font-bold text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all"
//         >
//           Checkout
//         </button>
//       </div>

//       {/* Optional: Clear Cart Link */}
//       <button
//         onClick={() => window.confirm("Clear cart?") && clearCart()}
//         className="w-full text-center text-[9px] uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
//       >
//         Clear All Items
//       </button>
//     </div>
//   )}
// </div>

//       {/* ================= FLOATING CART BUTTON (When Closed) ================= */}
//       {!isCartOpen && totalItems > 0 && (
//         <button
//           onClick={() => setIsCartOpen(true)}
//           className="fixed bottom-8 right-8 z-30 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center gap-3 px-6 py-4"
//         >
//           <div className="relative">
//             <ShoppingCart size={24} />
//             <span className="absolute -top-2 -right-2 w-6 h-6 bg-white text-purple-700 text-xs font-bold rounded-full flex items-center justify-center border-2 border-purple-600">
//               {totalItems}
//             </span>
//           </div>
//           <span className="font-semibold text-sm">View Cart</span>
//         </button>
//       )}
//     </div>
//   );
// }

import { useState, useEffect, useRef } from "react";
import ProductList from "../components/ProductList";
import CartItems from "../components/CartItems";
import { useCart } from "../context/CartContext";
import { useProductList } from "../context/ProductListContext";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, X, Package, Percent, ToggleLeft, ToggleRight, Tag } from "lucide-react";
import { useModal } from "../context/ModalContext";
import { useRates } from "../context/RatesContext";
import { updateRate } from "../api/ratesApi";
import { toast } from "sonner";


export default function Products() {
  const navigate = useNavigate();
  const { clearCart, cart, fetchCartSummary } = useCart();
  const { refresh, invalidateCache } = useProductList();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartPanelRef = useRef(null);
  const { showConfirm } = useModal();

  const { rawRates, refreshRates } = useRates();
  const [isUpdatingDiscount, setIsUpdatingDiscount] = useState(false);

  const totalItems =
    cart?.items?.reduce((acc, item,) => acc + item.quantity, 0) || 0;

  /* ================= AUTO OPEN CART ================= */
  useEffect(() => {
    if (totalItems > 0) {
      setIsCartOpen(true);
    }
  }, [totalItems]);

  /* ================= CLOSE ON OUTSIDE CLICK (DESKTOP ONLY) ================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        cartPanelRef.current &&
        !cartPanelRef.current.contains(event.target) &&
        isCartOpen
      ) {
        setIsCartOpen(false);
      }
    };

    if (isCartOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCartOpen]);

  /* ================= CALCULATE SUBTOTAL ================= */
  const subtotal =
    cart?.items?.reduce((sum, item) => {
      return sum + (item.breakup?.grandTotal || 0);
    }, 0) || 0;

  return (
    <div className="flex h-[calc(100vh-80px)] w-full bg-gradient-to-br from-gray-50 to-slate-100 overflow-hidden">

      {/* ================= MAIN CONTENT ================= */}
      <div
        className={`
          flex-1 min-w-0 h-full transition-all duration-500
          ${isCartOpen ? "lg:pr-[420px]" : ""}
        `}
      >
        <div className="relative flex-1 h-full overflow-hidden">
          <ProductList />
        </div>
      </div>

      {/* ================= MOBILE OVERLAY ================= */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* ================= CART PANEL ================= */}
      <div
        ref={cartPanelRef}
        className={`
          fixed top-0 right-0 h-full
          w-full sm:w-[400px] lg:w-[420px]
          bg-[#F5F5F5] shadow-[-10px_0_30px_rgba(0,0,0,0.05)]
          flex flex-col z-50
          transform transition-transform duration-500 ease-in-out
          ${isCartOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* ================= HEADER ================= */}
        <div className="flex-shrink-0 bg-[#5A374F] px-6 py-2 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#F2F2F2]">
              Shopping Cart
            </h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="group p-2 -mr-2"
            >
              <X
                size={20}
                className="text-gray-400 group-hover:text-red-500 transition-colors"
              />
            </button>
          </div>
        </div>

        {/* ================= CART ITEMS ================= */}
        <div className="flex-1 overflow-y-auto px-2 py-4 scrollbar-hide">
          {cart?.items?.length > 0 ? (
            <CartItems variant="minimal" />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <Package size={32} strokeWidth={1} />
              <p className="mt-2 text-xs uppercase tracking-widest font-medium">
                Cart is empty
              </p>
            </div>
          )}
        </div>

        {/* ================= FOOTER ================= */}
        {cart?.items?.length > 0 && (
          <div className="flex-shrink-0 bg-white border-t border-gray-100 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-tighter">
                Subtotal:
              </span>
              <span className="text-lg font-bold text-[#B28912]">
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  navigate("/cart");
                  setIsCartOpen(false);
                }}
                className="w-full py-3 rounded-md border border-gray-200 text-gray-600 font-bold text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all"
              >
                View Cart
              </button>

              <button
                onClick={() => {
                  navigate("/checkout/calculate");
                  setIsCartOpen(false);
                }}
                className="w-full py-3 rounded-md bg-[#F2F2F2] text-gray-800 font-bold text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all"
              >
                Checkout
              </button>
            </div>

            {/* <button
              onClick={() =>
                window.confirm("Clear cart?") && clearCart()
              }
    
              className="w-full text-center text-[9px] uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear All Items
            </button> */}

            <button

              onClick={async () => {
                const ok = await showConfirm("Clear cart?");
                if (ok) clearCart();
              }}


              className="w-full text-center text-[9px] uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear All Items
            </button>
          </div>
        )}
      </div>

      {/* ================= FLOATING CART BUTTON ================= */}
      {!isCartOpen && totalItems > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-8 right-8 z-30 bg-[#5A374F] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center gap-3 px-6 py-4"
        >
          <div className="relative">
            <ShoppingCart size={24} />
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-white text-[#6B3151] text-xs font-bold rounded-full flex items-center justify-center border-2 border-[#6B3151]">
              {totalItems}
            </span>
          </div>
          <span className="font-semibold text-sm">View Cart</span>
        </button>
      )}
    </div>
  );
}