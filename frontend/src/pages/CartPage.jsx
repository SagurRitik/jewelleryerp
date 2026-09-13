



import React, { useState, useMemo, memo,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Loader from "../components/Loader";
import { getImageUrl } from "../utils/getImageUrl";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useModal } from "../context/ModalContext";

// --- CART ITEM COMPONENT ---
const CartItemRow = memo(({ item, removeItem  ,showConfirm , updateQty  }) => {

const [qty, setQty] = useState(item.quantity);

useEffect(() => {
  setQty(item.quantity);
}, [item.quantity]);

const handleQty = (delta) => {
  const newQty = Math.max(1, qty + delta);
  setQty(newQty);
  updateQty(item._id, delta);
};
  const snap = item.customSnapshot || {};
  const pd = snap.productDetails || {};
  const imageSrc = getImageUrl(snap.productImage || snap.productImages?.[0]) || "/placeholder.png";

  const price = item.breakup?.grandTotal || 0;
  const components = pd.components || [];

  // Separate diamonds & stones based on your logic
  const diamonds = components.filter(c => ["Diamond", "Polki", "Moissanite"].includes(c.type));
  const stones = components.filter(c => !["Diamond", "Polki", "Moissanite"].includes(c.type));
  
  const title = snap.title || snap.productDetails?.title || snap.orderNo || "Jewelry Piece";
  const category = snap.productDetails?.jewelleryCategory || "FINE JEWELRY";

  const isLoose = item.itemType === "LOOSE_DIAMOND" || pd.jewelleryCategory === "Loose Diamond" || snap.isLooseDiamond || snap.diamondId;

  // Build the text strings for the layout
  const metalText = `${pd.metalPurity || "18K"} ${pd.metalType || "Solid Gold"}`;
  
  const diamondText = diamonds.length > 0 
    ? `${diamonds[0].clarity || "VS1"} Clarity, ${diamonds[0].color || "E"}-Color` 
    : "-";

  const stoneText = stones.length > 0 
    ? `${stones[0].shape || "Brilliant Cut"} ${stones[0].weight || "1.2"}ct` 
    : "-";

  const maxStock = item.availableStock ?? snap.stock ?? pd.stock;
  const isMax = maxStock !== undefined && maxStock > 0 && item.quantity >= maxStock;

  return (
    <motion.div
    
      // layout
      // initial={{ opacity: 0, y: 20 }}
      // animate={{ opacity: 1, y: 0 }}
      // exit={{ opacity: 0, scale: 0.95 }}
      // transition={{ duration: 0.25 }}
      className="flex flex-col sm:flex-row gap-4 sm:gap-8 py-5 sm:py-8 border-b border-gray-100 bg-white group relative"
    >
      {/* Remove Button (Top Right) */}
      <button
       onClick={async () => {
         const ok = await showConfirm("Remove item?");
         if (ok) removeItem(item._id);
       }}
        className="absolute top-4 sm:top-8 right-0 text-gray-300 hover:text-red-400 transition-colors p-1"
        aria-label="Remove item"
      >
        <Trash2 size={18} strokeWidth={1.5} />
      </button>

      {/* IMAGE */}
      <div className="w-full sm:w-[200px] md:w-[240px] h-[180px] sm:h-[200px] md:h-[240px] shrink-0 bg-black flex items-center justify-center overflow-hidden rounded-lg sm:rounded-none">
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
        />
      </div>

      {/* PRODUCT INFO */}
      <div className="flex-1 flex flex-col pt-2">
        
        {/* Category & Title */}
        <div className="mb-4 sm:mb-8 pr-8 sm:pr-0">
          <p className="text-[10px] tracking-[0.15em] text-gray-400 uppercase mb-1 sm:mb-2">
            {isLoose ? "LOOSE DIAMOND" : category}
          </p>
          <h3 className="text-xl sm:text-2xl md:text-[28px] font-serif italic text-[#6B3151] font-light">
            {title}
          </h3>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-y-6 gap-x-12 mb-8">
          {isLoose ? (
            <>
              <div>
                <p className="text-[9px] tracking-[0.1em] text-gray-400 uppercase mb-1">Carat Weight</p>
                <p className="text-[13px] text-gray-800 font-light">{snap.weight || pd.components?.[0]?.weight || 0} ct</p>
              </div>
              <div>
                <p className="text-[9px] tracking-[0.1em] text-gray-400 uppercase mb-1">Color & Clarity</p>
                <p className="text-[13px] text-gray-800 font-light">{snap.color || pd.components?.[0]?.color || "—"} / {snap.clarity || pd.components?.[0]?.clarity || "—"}</p>
              </div>
              <div>
                <p className="text-[9px] tracking-[0.1em] text-gray-400 uppercase mb-1">Shape & Cut</p>
                <p className="text-[13px] text-gray-800 font-light">{snap.shape || pd.components?.[0]?.shape || "Round"} {snap.cut ? `• ${snap.cut}` : ""}</p>
              </div>
              <div>
                <p className="text-[9px] tracking-[0.1em] text-gray-400 uppercase mb-1">Cert / HSN</p>
                <p className="text-[13px] text-gray-800 font-light">{snap.certificateNo || snap.lab || snap.sku || "HSN 7102"}</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-[9px] tracking-[0.1em] text-gray-400 uppercase mb-1">Metal</p>
                <p className="text-[13px] text-gray-800 font-light">{metalText}</p>
              </div>
              
              <div>
                <p className="text-[9px] tracking-[0.1em] text-gray-400 uppercase mb-1">Diamond</p>
                <p className="text-[13px] text-gray-800 font-light">{diamondText}</p>
              </div>

              <div>
                <p className="text-[9px] tracking-[0.1em] text-gray-400 uppercase mb-1">Stone</p>
                <p className="text-[13px] text-gray-800 font-light">{stoneText}</p>
              </div>

              <div>
                <p className="text-[9px] tracking-[0.1em] text-gray-400 uppercase mb-1">Net Weight</p>
                <p className="text-[13px] text-gray-800 font-light">{(pd.netWeight || 0).toFixed(2)} Grams</p>
              </div>
            </>
          )}
        </div>

        {/* QTY CONTROL */}

<div className="flex items-center gap-3 mt-6">
  <p className="text-[9px] tracking-[0.1em] text-gray-400 uppercase">Qty</p>

  <div className="flex items-center border border-gray-200">
    <button
       onClick={() => updateQty(item._id, -1)}
      disabled={item.quantity <= 1}
      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30"
    >
      −
    </button>

    <span className="w-10 text-center text-sm font-medium">
        {item.quantity}
    </span>

    <button
       onClick={() => updateQty(item._id, +1)}
      disabled={isMax}
      title={isMax ? `Maximum stock (${maxStock}) reached` : undefined}
      className={`w-8 h-8 flex items-center justify-center text-gray-500 transition-all ${
        isMax
          ? "opacity-25 cursor-not-allowed bg-gray-100 text-gray-300"
          : "hover:bg-gray-100"
      }`}
    >
      +
    </button>
  </div>

  {maxStock !== undefined && maxStock > 0 && (
    <span className={`text-[10px] font-medium tracking-wider uppercase px-2 py-0.5 rounded ${
      isMax ? "bg-amber-50 text-amber-700 font-semibold border border-amber-200" : "text-gray-400"
    }`}>
      Max: {maxStock}
    </span>
  )}

     
        <div className="mt-auto">
          <p className="text-[9px] tracking-[0.1em] text-gray-400 uppercase mb-1">Price</p>
          <p className="text-lg font-serif italic text-[#6B3151]">
           
{price.toLocaleString("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2
})}
          </p>
        </div>

</div>

{/* <div className="flex items-center justify-between mt-3">

  
  <div className="flex items-center border rounded-lg h-8">
    <button
      onClick={() => updateQty(item._id, -1)}
      disabled={item.quantity <= 1}
      className="px-3"
    >
      −
    </button>

    <span className="px-4 font-bold">
      {item.quantity}
    </span>

    <button
      onClick={() => updateQty(item._id, +1)}
      className="px-3"
    >
      +
    </button>
  </div>

 
  <div className="font-bold text-[#6B3151]">
    ₹{(item.breakup?.grandTotal || 0).toLocaleString("en-IN")}
  </div>

</div> */}
    
        
      </div>
    </motion.div>
  );
});

// --- MAIN PAGE ---
export default function CartPage() {
  const { showConfirm } = useModal();
  const navigate = useNavigate();
  const { cart, loading, removeItem, clearCart,updateQty } = useCart();

  const totals = useMemo(() => {
    if (!cart?.items) return { count: 0, value: 0 };
    return cart.items.reduce((acc, item) => ({
      count: acc.count + item.quantity,
      value: acc.value + ((item.breakup?.grandTotal || 0) * item.quantity)
    }), { count: 0, value: 0 });
  }, [cart]);

  if (loading) return <Loader text="Loading Selections..." />;

  // Empty State
  if (!cart?.items?.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] p-4 font-sans text-center">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-6">
          <ShoppingBag size={32} className="text-gray-300" strokeWidth={1} />
        </div>
        <h2 className="text-3xl font-serif italic text-[#6B3151] mb-2">Your Selections are empty</h2>
        <p className="text-gray-400 font-light text-sm tracking-wide">Review our collections to curate pieces.</p>
        <button 
          onClick={() => navigate("/")} 
          className="mt-8 px-10 py-3 bg-[#D4BA7B] text-white text-[11px] tracking-[0.2em] font-bold uppercase rounded hover:bg-[#c2a665] transition-colors shadow-sm"
        >
          Discover Collections
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 pb-20">
      
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-12 pt-6 sm:pt-12">

        <button
          onClick={() => navigate(-1)}
          className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-500 hover:text-[#6B3151] transition-colors"
        >
          ← Back
        </button>
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-12 border-b border-gray-100 pb-4 sm:pb-6 gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-[42px] font-serif italic text-[#6B3151] leading-tight">Your Selections</h1>
            <p className="text-[10px] tracking-[0.15em] text-gray-400 uppercase mt-1 sm:mt-2">
              Review your curated pieces before finalization
            </p>
          </div>
          
          <button 
            onClick={async () => {
              const ok = await showConfirm("Clear all items?");
              if (ok) clearCart();
            }}
            className="flex items-center gap-2 text-[10px] tracking-[0.1em] uppercase text-gray-400 hover:text-[#6B3151] transition-colors pb-1"
          >
            <Trash2 size={12} /> Clear All
          </button>
        </div>

        {/* CONTENT LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          
          {/* LEFT: ITEM LIST */}
          <div className="flex-1">
            {cart.items.map((item) => (
              <CartItemRow 
                key={item._id} 
                item={item} 
                removeItem={removeItem} 
                showConfirm={showConfirm} 
                updateQty={updateQty}
              />
            ))}
          </div>

          {/* RIGHT: SUMMARY PANEL */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="bg-[#6B3151] text-white p-5 sm:p-8 md:p-10 rounded-xl sm:rounded-none sticky top-10 shadow-sm">
              
              <h2 className="text-xl sm:text-2xl font-serif font-light mb-6 sm:mb-10">Order Summary</h2>
              
              <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-10 text-[11px] tracking-wide font-light border-b border-white/20 pb-6 sm:pb-10">
                <div className="flex justify-between items-center">
                  <span className="uppercase tracking-[0.1em] text-white/70">Subtotal</span>
                  <span className="text-[13px]">₹{totals.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="uppercase tracking-[0.1em] text-white/70">Shipping</span>
                  <span className="font-serif italic text-[14px]">Complimentary</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="uppercase tracking-[0.1em] text-white/70">Duties & Taxes</span>
                  <span className="text-white/80">Calculated at next step</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6 sm:mb-10">
                <span className="text-xl sm:text-2xl font-serif italic">Total</span>
                <span className="text-xl sm:text-2xl font-light">
                  ₹{totals.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <button
                onClick={() => navigate("/checkout/calculate")}
                className="w-full py-4 bg-[#D4BA7B] hover:bg-[#c2a665] text-[#6B3151] text-[10px] tracking-[0.2em] font-bold uppercase transition-colors flex items-center justify-center gap-3 group"
              >
                Calculate Final Amount
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="mt-8 space-y-2 text-center text-[9px] tracking-[0.1em] uppercase text-white/50">
                <p>Secure Encrypted Checkout</p>
                <p>Personal Concierge Available</p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}