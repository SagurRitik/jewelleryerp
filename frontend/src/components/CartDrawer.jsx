import { useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Package, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { useModal } from "../context/ModalContext";
import CartItems from "./CartItems";

export default function CartDrawer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, isCartOpen, setIsCartOpen, closeCart, clearCart } = useCart();
  const { isDark } = useTheme();
  const { showConfirm } = useModal();
  const cartPanelRef = useRef(null);

  const isCartAllowedPage =
    location.pathname === "/" ||
    location.pathname === "/home" ||
    location.pathname === "/products" ||
    location.pathname.startsWith("/diamonds");

  const totalItems =
    cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  /* ================= CLOSE ON ESCAPE ================= */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, closeCart]);

  /* ================= CLOSE ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        cartPanelRef.current &&
        !cartPanelRef.current.contains(event.target) &&
        isCartOpen
      ) {
        closeCart();
      }
    };

    if (isCartOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCartOpen, closeCart]);

  /* ================= CALCULATE SUBTOTAL ================= */
  const subtotal =
    cart?.items?.reduce((sum, item) => {
      return sum + (item.breakup?.grandTotal || item.breakup?.subtotal || item.productPrice || 0);
    }, 0) || 0;

  return (
    <>
      {/* ================= BACKDROP OVERLAY ================= */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] transition-opacity duration-300"
          onClick={closeCart}
        />
      )}

      {/* ================= CART SLIDE-OVER PANEL ================= */}
      <div
        ref={cartPanelRef}
        className={`
          fixed top-0 right-0 h-full
          w-full sm:w-[420px] lg:w-[440px]
          shadow-[-10px_0_30px_rgba(0,0,0,0.15)]
          flex flex-col z-[9999]
          transform transition-transform duration-500 ease-in-out
          ${isDark ? "bg-[#1a1a1a] border-l border-[#333333] text-white" : "bg-[#F5F5F5] text-gray-800"}
          ${isCartOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* ================= HEADER ================= */}
        <div
          className={`flex-shrink-0 px-6 py-3 border-b transition-colors ${
            isDark ? "bg-[#0d0d0d] border-white/10" : "bg-[#5A374F] border-white/10"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className={isDark ? "text-pink-400" : "text-white"} />
              <h2
                className={`text-sm font-bold uppercase tracking-widest ${
                  isDark ? "text-pink-400" : "text-white"
                }`}
              >
                Shopping Cart
              </h2>
              {totalItems > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white">
                  {totalItems}
                </span>
              )}
            </div>
            <button
              onClick={closeCart}
              className="p-2 -mr-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              title="Close Cart"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ================= CART ITEMS ================= */}
        <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
          {cart?.items?.length > 0 ? (
            <CartItems variant="minimal" />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 py-16">
              <Package size={40} strokeWidth={1.5} className="mb-2 text-gray-400" />
              <p className="text-xs uppercase tracking-widest font-semibold text-gray-500">
                Cart is empty
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Add products or loose diamonds to begin billing
              </p>
            </div>
          )}
        </div>

        {/* ================= FOOTER ================= */}
        {cart?.items?.length > 0 && (
          <div
            className={`flex-shrink-0 border-t p-4 sm:p-5 pb-6 sm:pb-5 space-y-3 sm:space-y-4 transition-colors ${
              isDark ? "bg-[#111111] border-white/10" : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Subtotal:
              </span>
              <span className="text-base sm:text-lg font-bold text-[#B28912]">
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <button
                onClick={() => {
                  navigate("/cart");
                  closeCart();
                }}
                className={`w-full py-2.5 sm:py-3 rounded-xl border font-bold text-[10px] sm:text-[11px] uppercase tracking-wider transition-all ${
                  isDark
                    ? "border-white/10 text-gray-200 hover:bg-white/5"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                View Cart
              </button>

              <button
                onClick={() => {
                  navigate("/checkout/calculate");
                  closeCart();
                }}
                className="w-full py-2.5 sm:py-3 rounded-xl font-bold text-[10px] sm:text-[11px] uppercase tracking-wider bg-[#5A374F] hover:bg-[#482c3f] text-white shadow-md transition-all active:scale-98"
              >
                Checkout
              </button>
            </div>

            <button
              onClick={async () => {
                const ok = await showConfirm("Are you sure you want to clear the cart?");
                if (ok) clearCart();
              }}
              className="w-full text-center text-[10px] uppercase tracking-wider text-gray-400 hover:text-red-500 transition-colors pt-1 block"
            >
              Clear All Items
            </button>
          </div>
        )}
      </div>

      {/* ================= FLOATING CART BUTTON ================= */}
      {!isCartOpen && totalItems > 0 && isCartAllowedPage && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-5 right-4 sm:bottom-8 sm:right-8 z-40 bg-[#5A374F] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 sm:gap-3 px-4 py-3 sm:px-6 sm:py-4 border border-white/20"
        >
          <div className="relative">
            <ShoppingCart size={20} className="sm:w-6 sm:h-6" />
            <span className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-white text-[#6B3151] text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center border-2 border-[#6B3151]">
              {totalItems}
            </span>
          </div>
          <span className="font-semibold text-xs sm:text-sm">View Cart</span>
        </button>
      )}
    </>
  );
}
