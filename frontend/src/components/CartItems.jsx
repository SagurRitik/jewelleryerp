
import { useCart } from "../context/CartContext";
import { resolveImage } from "../utils/resolveImage";
import { Plus, Minus, X, Gem, Weight } from "lucide-react";
import { useModal } from "../context/ModalContext";

export default function CartItems({ compact = false }) {
  const { cart, updateQty, removeItem } = useCart();
  const { showAlert, showConfirm } = useModal();
  if (!cart?.items?.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 select-none">
        <div className="w-14 h-14 mb-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center">
          <Gem size={24} className="text-gray-300" />
        </div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">No Items</p>
        <p className="text-[10px] text-gray-400 mt-1">Add pieces to cart</p>
      </div>
    );
  }

  const getStoneInfo = (components = []) => {
    const diamonds = components.filter(c =>
      ["Diamond", "Polki", "Moissanite"].includes(c.type)
    );
    if (!diamonds.length) return null;
    const total = diamonds.reduce((s, d) => s + (+d.weight || 0), 0);
    return total > 0 ? `${total.toFixed(2)}ct` : null;
  };


  return (
    <div className="space-y-2">
      {cart.items.map((item, index) => {
        const snap = item.customSnapshot || {};
        const pd = snap.productDetails || {};
        const breakup = item.breakup || {};
        const stoneWeight = getStoneInfo(pd.components);
        // const resolveTitle = (snap = {}) =>
        // snap.title ||
        // snap.productDetails?.title ||
        // snap.orderNo ||
        // "JEWELRY PIECE";

        const title = snap.title || "JEWELLERY ITEM";

        return (
          <div
            key={item._id}
            className="group relative bg-[#F5F5F5] border border-gray-200 hover:[#663253] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-xl "
            style={{
              animation: `slideInCart 0.5s ease-out ${index * 0.05}s both`,
            }}
          >
            <style>{`
              @keyframes slideInCart {
                from {
                  opacity: 0;
                  transform: translateX(8px);
                }
                to {
                  opacity: 1;
                  transform: translateX(0);
                }
              }
              
              .quantity-input {
                font-variant-numeric: tabular-nums;
                letter-spacing: 0.02em;
              }
              
              .premium-badge {
                position: relative;
                overflow: hidden;
              }
              
              .premium-badge::before {
                content: '';
                position: absolute;
                inset: 0;
                background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%);
                transform: translateX(-100%);
                transition: transform 0.6s;
              }
              
              .premium-badge:hover::before {
                transform: translateX(100%);
              }
            `}</style>

            {/* Top Accent Bar */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-200/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Background Gradient Overlay */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-[#c8a3b7]-50/0 via-transparent to-yellow-50/0 group-hover:from-amber-50/20 group-hover:to-yellow-50/20 pointer-events-none transition-all duration-300"
            />

            <div className="relative p-3.5 sm:p-4">
              {/* Header: Image + Info + Delete */}
              <div className="flex gap-3 sm:gap-3.5">
                {/* Product Image - Compact */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden transition-all duration-300 shadow-sm">
                    {snap.productImage ? (
                      <img
                        src={resolveImage(snap.productImage || pd.productImage)}
                        alt={snap.title}
                        className="w-full h-full object-contain p-1.5"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-2xl sm:text-3xl">💎</span>
                    )}
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  {/* Title Row */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-sm sm:text-base text-gray-600 tracking-tight truncate leading-snug">
                        {/* {(snap.title || "PIECE").toUpperCase()} */}
                        {/* {resolveTitle(snap).toUpperCase()} */}
                        {title.toUpperCase()}

                      </h3>
                    </div>

                    {/* Delete Button - Compact */}
                    <button
                      onClick={() => removeItem(item._id)}
                      className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 flex items-center justify-center transition-all duration-200 border border-red-100/50 hover:border-red-200 group/btn"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>

                  {/* Details - Compact Single Line for Desktop, Multi-line for Mobile */}
                  <div className="space-y-1">
                    {/* Weight + Metal + Purity */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-medium text-amber-700 bg-[#5A374F]-50/80 px-2 py-0.5 rounded-md border border-[#5A374F]-100/50">
                        {pd.metalType || "Gold"}
                      </span>
                      <span className="text-xs font-semibold text-yellow-700 bg-[#5A374F]-50/80 px-2 py-0.5 rounded-md border border-[#5A374F]-100/50">
                        {pd.metalPurity || "22K"}
                      </span>
                      <span className="text-xs text-gray-600 font-medium hidden sm:inline">
                        {pd.netWeight || "0"}g
                      </span>
                    </div>

                    {/* Stones + QTY Price Row */}
                    <div className="flex items-center justify-between gap-1 text-xs">
                      <div className="flex items-center gap-1 min-w-0">
                        {stoneWeight && (
                          <>
                            <Gem className="w-3 h-3 text-amber-600 flex-shrink-0" />
                            <span className="text-gray-700 font-medium text-[11px]">{stoneWeight}</span>
                          </>
                        )}
                      </div>

                      {/* QTY Compact Controls */}
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center border border-gray-250 rounded-md bg-white">
                          <button
                            onClick={() => updateQty(item._id, -1)}
                            disabled={item.quantity <= 1}
                            className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center hover:bg-gray-50 disabled:opacity-25 disabled:cursor-not-allowed transition-colors text-gray-600 font-semibold text-xs"
                            title="Decrease"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>

                          <span className="px-2 py-0.5 font-bold text-gray-900 text-xs quantity-input bg-gradient-to-b from-gray-50 to-white">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => updateQty(item._id, +1)}
                            className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600 font-semibold text-xs"
                            title="Increase"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>

                        </div>
                        {/* Price - Right Aligned */}
                        <div className="flex flex-col items-end justify-center gap-0.5 min-w-fit">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider leading-none">
                            Price
                          </p>
                          <p className="font-bold bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 bg-clip-text text-transparent text-sm sm:text-base leading-tight">
                            ₹{(breakup.grandTotal || 0).toLocaleString("en-IN").substring(0, 11)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-[10px] text-gray-500 font-medium leading-tight">
                              ×{item.quantity}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


              </div>

              {/* Mobile Weight Info */}
              <div className="sm:hidden flex items-center gap-2 text-xs text-gray-600 mt-2 pt-2 border-t border-gray-100">
                <Weight className="w-3 h-3 text-gray-400" />
                <span className="font-medium">Net {pd.netWeight || "0"}g • Gross {pd.grossWeight || "0"}g</span>
              </div>
            </div>

            {/* Bottom Border Accent */}
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-[#5A374F]-300/0 via-[#5A374F]-300/60 to-[#5A374F]-300/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        );
      })}
    </div>
  );
}
