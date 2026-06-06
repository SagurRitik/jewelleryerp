

import React, { memo, useMemo , useState } from "react";
import { Gem, Sparkles, Tag, Scale } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl } from "../../utils/getImageUrl";

/* ================= UTILS ================= */
const resolveImage = (img) => {
  return getImageUrl(img);
};

const formatCurrency = (n) =>
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/* ================= ROW COMPONENT (For Discounts/Adjustments) ================= */
const Row = memo(function Row({ label, value, muted, bold, negative, highlight }) {
  return (
    <div className={`flex justify-between items-center text-[11px] mb-2.5 last:mb-0`}>
      <span className={`${muted ? "text-gray-400" : "text-gray-500"} ${bold ? "font-bold text-gray-800" : ""}`}>
        {label}
      </span>
      <span className={`font-medium tracking-wide ${negative ? "text-red-600" : highlight ? "text-emerald-700" : "text-gray-800"} ${bold ? "font-bold" : ""}`}>
        {negative ? "-" : ""}₹{formatCurrency(Math.abs(value))}
      </span>
    </div>
  );
});

/* ================= COMPONENT ================= */
function CheckoutItem({ item , isExpanded, onToggle}) {
  const snap = item.customSnapshot || {};
  const pd = snap.productDetails || {};
  const breakup = item.breakup || {};

  const image = useMemo(
    () => resolveImage(snap.productImage),
    [snap.productImage]
  );


  

  // const [isExpanded, setIsExpanded] = useState(false); 

  const isLocked = snap.rateSource === "ORDER_LOCKED";
  const title = snap.title || pd.title || "JEWELLERY ITEM";
  const sku = pd.sku || item.sku || "N/A";
  const hsn = pd.hsnCode ;
  const quantity = item.quantity || 1;

  /* 🔒 BACKEND IS SOURCE OF TRUTH */
  const {
    metalRate = 0,
    metalValue = 0,
    makingCharge = 0,
    
    discountDiamond = 0,
    discountStone = 0,
    discountMaking = 0,
    discount = 0, // totalDiscount

    grossTotal=0,
    
    subtotal = 0,
    gst = 0,
    gstPercent = 3,
    grandTotal = 0,
    
    advanceUsed = 0,
    metalUsed = 0,
    payable = grandTotal,
    
    componentBreakup = [],
    accessoryValue = 0,
  } = breakup;

  // Derive net product value (Subtotal before discounts)
  const netProductValue = grossTotal ;
  const hasDiscounts = discount > 0;

  // Separate components for display
  const diamonds = componentBreakup.filter(c => ["Diamond", "Polki", "Moissanite"].includes(c.type));
  const accessories = componentBreakup.filter(c => c.pricingRef === "BELT");
  const gemstones = componentBreakup.filter(c => 
    !["Diamond", "Polki", "Moissanite"].includes(c.type) && 
    c.pricingRef !== "BELT"
  );

  const totalDiamondValue = diamonds.reduce(
    (sum, d) => sum + Number(d.value || 0),
    0
  );

  const totalGemstoneValue = gemstones.reduce(
    (sum, g) => sum + Number(g.value || 0),
    0
  );

  const totalAccessoryValue = accessories.reduce(
    (sum, a) => sum + Number(a.value || 0),
    0
  );

  return (
    <div className="bg-[#F8EFF3] rounded-xl overflow-hidden mb-6 font-sans">

      <button
  onClick={onToggle}
  className="ml-4 px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded bg-[#462434] text-white hover:opacity-90 transition"
>
  {isExpanded ? "Minimize" : "View Details"}
</button>
      
    <AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      
      {/* ================= TOP SECTION: IMAGE & DETAILS ================= */}
      <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
        
        {/* Left: Image */}
        <div className="w-full md:w-[160px] h-[160px] shrink-0 bg-black rounded-xl overflow-hidden border border-gray-200/50 shadow-sm flex items-center justify-center">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
          />
        </div>

        {/* Right: Details Grid */}
        <div className="flex-1 flex flex-col">
          
          {/* Header Row */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold tracking-widest uppercase text-[#462434] mb-2">
                {title}
              </h3>
              <div
                className={`inline-block px-3 py-1 rounded-full text-[9px] font-bold tracking-[0.1em] uppercase ${
                  isLocked ? "bg-amber-100 text-amber-700" : "bg-[#E6F4EA] text-[#137333]"
                }`}
              >
                {isLocked ? "RATE LOCKED" : "LIVE MARKET RATE APPLIED"}
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1 font-bold">HSN: {hsn}</p>
              <p className="text-[11px] font-bold tracking-widest uppercase text-[#462434]">SKU: {sku}</p>
            </div>
          </div>

          {/* Details Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2 flex-1">
            
            {/* Column 1: Metal */}
            <div className="space-y-4 pt-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Net Weight</span>
                <span className="font-bold text-gray-800">{pd.netWeight ? `${pd.netWeight}g` : "-"}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Metal Rate ({pd.metalPurity || "22K"})</span>
                <span className="font-bold text-gray-800">₹{formatCurrency(metalRate)}/g</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Purity</span>
                <span className="font-bold text-gray-800">{pd.metalType} {pd.metalPurity || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2">
                <span className="text-gray-500">Metal Value</span>
                <span className="font-bold text-gray-800">₹{formatCurrency(metalValue)}</span>
              </div>
            </div>

            {/* Column 2: Stones & Diamonds */}
            <div className="space-y-5">
              
              {/* Diamonds */}
              {diamonds.length > 0 && (
                <div className="bg-[#EFE7EC]/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-[9px] font-bold tracking-[0.15em] uppercase text-[#6B4E5D] mb-3">
                    <Gem size={10} /> DIAMONDS
                  </div>
                  {/* {diamonds.map((d, i) => (
                    <div key={i} className="flex justify-between items-center text-xs mb-2 last:mb-0">
                      <span className="text-gray-500">{d.clarity } Diamonds ({d.grossWeight}ct)</span>
                      <span className="font-medium text-gray-800">₹{formatCurrency(d.value)}</span>
                    </div>
                  ))} */}

 {diamonds.map((d, i) => {
  // const gross =
  //   d.grossWeight && d.grossWeight > 0
  //     ? d.grossWeight
  //     : (d.weight || 0) * (d.count || 1);
 const gross =
  d.grossWeight != null && d.grossWeight > 0
    ? d.grossWeight
    : (d.weight || 0) * (d.count || 1);

  return (
    <div key={i} className="flex justify-between items-center text-xs mb-2 last:mb-0">
      <span className="text-gray-500">
        {d.clarity} Diamonds ({gross}ct)
      </span>
      <span className="font-medium text-gray-800">
        ₹{formatCurrency(d.value)}
      </span>
    </div>
  );
})}
<div className="flex justify-between items-center text-xs mt-3 pt-2 border-t border-gray-200">
  <span className="text-gray-600 font-medium">Total Diamond Value</span>
  <span className="font-semibold text-[#462434]">
    ₹{formatCurrency(totalDiamondValue)}
  </span>
</div>
                </div>
              )}

              {/* Gemstones */}
              {gemstones.length > 0 && (
                <div className="bg-[#EFE7EC]/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-[9px] font-bold tracking-[0.15em] uppercase text-[#6B4E5D] mb-3">
                    <Sparkles size={10} /> GEMSTONES
                  </div>
                  {gemstones.map((g, i) => (
                    <div key={i} className="flex justify-between items-center text-xs mb-2 last:mb-0">
                      <span className="text-gray-500">{g.type} ({(g.weight || 0) * (g.count || 1).toFixed(3)}ct)</span>
                      <span className="font-medium text-gray-800">₹{formatCurrency(g.value)}</span>
                    </div>
                  ))}

                  <div className="flex justify-between items-center text-xs mt-3 pt-2 border-t border-gray-200">
  <span className="text-gray-600 font-medium">Total Gemstone Value</span>
  <span className="font-semibold text-[#462434]">
    ₹{formatCurrency(totalGemstoneValue)}
  </span>
</div>
                </div>
              )}

              {/* Accessories (Belts) */}
              {accessories.length > 0 && (
                <div className="bg-[#EFE7EC]/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-[9px] font-bold tracking-[0.15em] uppercase text-[#6B4E5D] mb-3">
                    <Tag size={10} /> ACCESSORIES
                  </div>
                  {accessories.map((a, i) => (
                    <div key={i} className="flex justify-between items-center text-xs mb-2 last:mb-0">
                      <span className="text-gray-500">
                        {a.type} {a.category ? `(${a.category})` : ""} {a.shape ? `— ${a.shape}` : ""} · {a.count} pcs
                      </span>
                      <span className="font-medium text-gray-800">₹{formatCurrency(a.value)}</span>
                    </div>
                  ))}

                  <div className="flex justify-between items-center text-xs mt-3 pt-2 border-t border-gray-200">
                    <span className="text-gray-600 font-medium">Total Accessory Value</span>
                    <span className="font-semibold text-[#462434]">
                      ₹{formatCurrency(totalAccessoryValue)}
                    </span>
                  </div>
                </div>
              )}

            </div>
          </div>
          
        </div>
      </div>

      {/* ================= MIDDLE SECTION: COST BREAKDOWN ================= */}
      <div className="bg-[#EBE2E6] px-6 md:px-8 py-5 flex items-center justify-between overflow-x-auto gap-8 border-y border-gray-100">
        
        <div className="flex flex-col gap-2 min-w-[60px]">
          <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-gray-400">QUANTITY</span>
          <span className="text-sm font-bold text-[#462434]">
            {String(quantity).padStart(2, '0')}
          </span>
        </div>

        <div className="flex flex-col gap-2 min-w-[120px]">
          <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-gray-400">MAKING CHARGES</span>
          <span className="text-sm font-medium text-gray-600">
            ₹{formatCurrency(makingCharge)}
          </span>
        </div>

        <div className="flex flex-col gap-2 min-w-[140px]">
          <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-gray-400">NET PRODUCT VALUE</span>
          <span className="text-sm font-medium text-gray-600">
            ₹{formatCurrency(netProductValue)}
          </span>
        </div>

        <div className="flex flex-col gap-2 min-w-[120px] text-right">
          <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-gray-400">subtotal</span>
          <span className="text-sm font-bold text-[#462434]">
            ₹{formatCurrency(subtotal)}
          </span>
        </div>

      </div>

      {/* ================= BOTTOM SECTION: DISCOUNTS & ADJUSTMENTS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-6 md:px-8 py-6 bg-[#F8EFF3]/50">

       
        
        {/* DISCOUNTS */}
        <div>
          <Row className="space-y-1" label="Total Value" value={grossTotal} bold />
          <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-[0.15em] uppercase text-[#886979] mb-4">
            <Tag size={12} /> DISCOUNTS APPLIED
          </div>
          
          {hasDiscounts ? (
            <div className="space-y-1">
              {discountDiamond > 0 && <Row label="Diamond Discount" value={discountDiamond} negative />}
              {discountMaking > 0 && <Row label="Making Discount" value={discountMaking} negative />}
              {discountStone > 0 && <Row label="Stone Discount" value={discountStone} negative />}
              
              <div className="pt-3 mt-3 border-t border-[#EAE3E7]">
                <Row label="Total Discount" value={discount} negative bold />
              </div>
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic">No discounts applied</span>
          )}

            <div className="pt-3 mt-3 border-t border-[#EAE3E7]">
                <Row className="space-y-1" label="Subtotal" value={subtotal} />
              </div>
        
       
        </div>

        {/* PAYMENT ADJUSTMENTS & TOTALS */}
        <div>
          <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-[0.15em] uppercase text-[#886979] mb-4">
            <Scale size={12} /> PAYMENT ADJUSTMENTS
          </div>

          <div className="space-y-1">
            <Row label="Advance Payment" value={advanceUsed} negative={advanceUsed > 0} />
            <Row label="Metal Payment (Old Gold)" value={metalUsed} negative={metalUsed > 0} />
            <Row label="Subtotal" value={subtotal} />
            <Row label={`GST (${gstPercent}%)`} value={gst} muted />
            
            <div className="pt-4 mt-4">
              <div className="bg-[#EBE2E6] rounded-md px-4 py-3 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-800">Payable Amount</span>
                <span className="text-base font-bold text-[#462434]">₹{formatCurrency(payable)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      </motion.div>
  )}
</AnimatePresence>
    

    </div>
    
  ); 
}
 

export default memo(CheckoutItem);