

// import React, { useMemo, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useCart } from "../../context/CartContext";
// import { motion } from "framer-motion";
// import CheckoutItem from "./CheckoutItem";
// import TotalsBar from "./TotalsBar";
// import RatesSnapshot from "./RatesSnapshot";
// import InvoiceConfirmPanel from "./InvoiceConfirmPanel";
// import { Loader2, ShoppingBag, ArrowLeft,Home } from "lucide-react";

// export default function CheckoutPage() {
//   const {
//     cart,
//     loading,
//     onInvoiceSuccess,
//     fetchCartSummary,
//   } = useCart();

//   const navigate = useNavigate();

//   /* ================= LOAD SUMMARY ================= */
//   useEffect(() => {
//     // fetchCartSummary();
//       fetchCartSummary(true); 
//       console.log("🛒 CART TOTALS IN CHECKOUT:", cart?.totals);

//   }, []);

//   /* ================= REFERENCE METAL RATE ================= */
//   const referenceMetalRate = useMemo(() => {
//     if (!cart?.items?.length) return null;

//     const item = cart.items.find(
//       (i) => i.customSnapshot?.rateSource === "ORDER_LOCKED"
//     ) || cart.items[0];

//     if (!item?.breakup?.metalRate) return null;

//     return {
//       ratePerGram: item.breakup.metalRate,
//       metalType: item.customSnapshot?.productDetails?.metalType,
//       metalPurity: item.customSnapshot?.productDetails?.metalPurity,
//     };
//   }, [cart?.items]);

//   /* ================= STATES ================= */
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
//         <Loader2 className="animate-spin w-10 h-10 text-neutral-400" />
//       </div>
//     );
//   }

//   if (!cart?.items?.length) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F7] gap-4">
//         <ShoppingBag size={64} className="text-neutral-300" />
//         <p className="text-neutral-500">Your cart is empty</p>
//         <button
//           onClick={() => navigate("/")}
//           className="px-6 py-3 bg-neutral-900 text-white rounded-lg"
//         >
//           Continue Shopping
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white px-4 sm:px-6 py-8 sm:py-12 text-neutral-900">
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         className="max-w-7xl mx-auto"
//       >
//         {/* HEADER */}
//         <header className="w-full bg-[#E5E5E5] py-3 mb-2 flex flex-col items-center justify-center">
//   {/* Breadcrumbs */}
//   <div className="flex items-center gap-2 text-[15px] text-gray-600 mb-1">
//     <button
//       onClick={() => navigate(-1)}
//       className="flex items-center hover:text-gray-900 transition-colors"
//       title="Go Back"
//     >
//       <Home size={13} />
//     </button>
//     <span className="text-gray-400">/</span>
//     <span className="text-gray-700">Checkout</span>
//   </div>

//   {/* Page Title */}
//   <h1 className="text-4xl md:text-[36px] font-bold text-[#4E3B47] tracking-wide">
//     Checkout
//   </h1>
// </header>

//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
//           {/* LEFT */}
//           <div className="lg:col-span-7 space-y-1">
//             <RatesSnapshot referenceRate={referenceMetalRate} />

//             <div className="space-y-1">
//               <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 border-b pb-1">
//                 Order Items ({cart.items.length})
//               </h3>

//               {cart.items.map((item) => (
//                 <CheckoutItem key={item._id} item={item} />
//               ))}
//             </div>
//           </div>

//           {/* RIGHT */}
//           <div className="lg:col-span-5">
//             <div className="sticky top-6 space-y-1">
//               <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
//                 <TotalsBar totals={cart.totals} />
//               </div>

//               <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-2">
//                 <InvoiceConfirmPanel
//                   cartTotals={cart.totals}
//                   onSuccess={(invoiceId) => {
//                     onInvoiceSuccess();
//                     navigate(`/invoice/${invoiceId}`);
//                   }}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// }



import React, { useMemo, useEffect, useState  } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { motion } from "framer-motion";
import CheckoutItem from "./CheckoutItem";
import TotalsBar from "./TotalsBar";
import RatesSnapshot from "./RatesSnapshot";
import InvoiceConfirmPanel from "./InvoiceConfirmPanel";
import { Loader2, ShoppingBag, ChevronRight, Bell, Settings, User ,ArrowLeft,Home} from "lucide-react";


export default function CheckoutPage() {
  const {
    cart,
    loading,
    onInvoiceSuccess,
    fetchCartSummary,
  } = useCart();

  const navigate = useNavigate();

  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
  if (cart?.items?.length) {
    const allExpanded = {};
    cart.items.forEach((item) => {
      allExpanded[item._id] = true;
    });
    setExpandedItems(allExpanded);
  }
}, [cart?.items]);

  /* ================= LOAD SUMMARY ================= */
  useEffect(() => {
    fetchCartSummary(true); 
    console.log("🛒 CART TOTALS IN CHECKOUT:", cart?.totals);
  }, []);

  /* ================= REFERENCE METAL RATE ================= */

  const referenceMetalRate = useMemo(() => {
  if (!cart?.items?.length) return null;

  const item =
    cart.items.find(
      (i) => i.customSnapshot?.rateSource === "ORDER_LOCKED"
    ) || cart.items[0];

  if (!item?.breakup?.metalRate) return null;

  return {
    ratePerGram: item.breakup.metalRate,
    metalType: item.customSnapshot?.productDetails?.metalType,
    metalPurity: item.customSnapshot?.productDetails?.metalPurity,
  };
}, [cart]);


  const toggleItem = (id) => {
  setExpandedItems((prev) => ({
    ...prev,
    [id]: !prev[id],
  }));
};

  /* ================= FORMATTER ================= */
  const format = (n) =>
    Number(n || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  /* ================= STATES ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin w-10 h-10 text-[#462434]" />
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] gap-4 font-sans">
        <ShoppingBag size={64} className="text-gray-200" />
        <h2 className="text-2xl font-serif text-[#462434]">Your cart is empty</h2>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-8 py-3 bg-[#C8A153] text-white text-[11px] font-bold tracking-widest uppercase rounded shadow-sm hover:bg-[#b58f45] transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 flex flex-col">
      
     
      {/* ================= MAIN CONTENT ================= */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 w-full max-w-[1400px] mx-auto px-6 md:px-10 py-10"
      >
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase mb-3">
              <button
  onClick={() => navigate("/cart")}
  className="hover:text-[#462434]"
>
  Cart
</button>
<ChevronRight size={10} />
              
              <button onClick={() => navigate("/")} className="hover:text-[#462434] transition-colors">Home</button>
              <ChevronRight size={10} />
              <span className="text-gray-800">Checkout</span>
            </div>
            <h1 className="text-[32px] md:text-[40px] font-bold text-[#462434] uppercase tracking-wide leading-none">
              Checkout
            </h1>
          </div>
          
          {/* Live Gold Rate Component rendered here to match the pill in the screenshot */}
          <div className="flex-shrink-0">
             <RatesSnapshot referenceRate={referenceMetalRate} />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16">
          
          {/* ================= LEFT COLUMN (ITEMS) ================= */}
          <div className="lg:col-span-7 flex flex-col h-full">
            <div className="flex-1 space-y-6">
              {cart.items.map((item) => (
                <CheckoutItem key={item._id} item={item}  
                   isExpanded={!!expandedItems[item._id]}
                   onToggle={() => toggleItem(item._id)} />
              ))}
            </div>

            {/* SUB-PAYABLE AMOUNT FOOTER */}
            <div className="bg-[#462434] mt-10 pt-8 pb-8 border-t border-b border-gray-100 flex justify-between items-center">
               <span className="text-lg font-bold text-white uppercase tracking-widest ml-2">
                 Sub-Payable Amount
               </span>
               <span className="text-3xl font-bold text-white tracking-widest">
                 ₹{format(cart.totals?.payable || 0)}
               </span>
            </div>
          </div>

          {/* ================= RIGHT COLUMN (SUMMARY & FORM) ================= */}
          <div className="lg:col-span-5">
            <div className="space-y-6">
              
              {/* Order Summary Block */}
              <TotalsBar totals={cart.totals}/>

              {/* Action Button (Optional duplication if you wanted it outside, but we rely on InvoiceConfirmPanel) */}
              
              {/* Customer & Payment Forms */}
              <InvoiceConfirmPanel
                cartTotals={cart.totals}
                onSuccess={(invoiceId) => {
                  onInvoiceSuccess();
                  navigate(`/invoice/${invoiceId}`);
                }}
              />
              
            </div>
          </div>

        </div>
      </motion.div>

      {/* ================= MOCK GLOBAL FOOTER ================= */}
      <footer className="w-full border-t border-gray-100 py-8 px-6 md:px-10 mt-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-bold tracking-[0.15em] text-gray-400 uppercase">
        <span>© 2026 ROYAL ATELIER ERP • THE DIGITAL CURATOR</span>
        <div className="flex items-center gap-6">
          <span className="hover:text-[#462434] cursor-pointer transition-colors">Privacy</span>
          <span className="hover:text-[#462434] cursor-pointer transition-colors">Terms of Service</span>
          <span className="hover:text-[#462434] cursor-pointer transition-colors">Security</span>
          <span className="hover:text-[#462434] cursor-pointer transition-colors">Support</span>
        </div>
      </footer>

    </div>
  );
}