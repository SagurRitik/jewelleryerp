

import { createContext, useContext, useEffect, useState } from "react";
import API from "../api";
import axios from "axios";
import { toast } from "sonner";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  // ✅ SINGLE SOURCE OF TRUTH
  const [sessionId] = useState(() => {
    const existing = localStorage.getItem("sessionId");
    if (existing) return existing;

    const id = "sess-" + Date.now();
    localStorage.setItem("sessionId", id);
    return id;
  });

  const [cart, setCart] = useState({ items: [], totals: {} });
  const [loading, setLoading] = useState(false);

  /* ================= FETCH ================= */
  const fetchCartSummary = async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      const { data } = await API.get(`/cart/${sessionId}`);
      // setCart(data?.cart || { items: [], totals: {} });
      setCart(data?.cart || { items: [], totals: {} });

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartSummary();
  }, [sessionId]);

  /* ================= ADD ================= */
  const addProduct = async (productId, qty = 1) => {
    await API.post("/cart/product", {
      sessionId,
      productId,
      quantity: qty,
    });
    await fetchCartSummary();
  };

//   const addCustomOrder = async ({ sessionId, orderId }) => {
//   const res = await axios.post("/api/cart/custom", {
//     sessionId,
//     orderId,
//   });

//   if (!res.data?.success) {
//     throw new Error("Failed to add custom order to cart");
//   }

//   setCart(res.data.cart);
//   return res.data;
// };
const addCustomOrder = async ({ sessionId, orderId }) => {
  const res = await axios.post("/api/cart/custom", {
    sessionId,
    orderId,
  });

  if (!res.data?.success) {
    throw new Error("Failed to add custom order to cart");
  }

  // ✅ DO NOT trust returned cart blindly
  // Force refresh from DB
  await fetchCartSummary();

  return res.data;
};


  /* ================= UPDATE QTY ================= */
  const updateQty = async (itemId, delta) => {
    const item = cart.items.find((i) => i._id === itemId);
    if (!item) return;

    const maxStock = item.availableStock ?? item.customSnapshot?.stock ?? item.customSnapshot?.productDetails?.stock;
    if (delta > 0 && maxStock !== undefined && item.quantity >= maxStock) {
      toast.error(`Cannot add more. Available stock is ${maxStock}.`);
      return;
    }

    const newQty = Math.max(1, item.quantity + delta);
    if (maxStock !== undefined && newQty > maxStock) {
      toast.error(`Cannot add more. Available stock is ${maxStock}.`);
      return;
    }

    setCart((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i._id === itemId
          ? { ...i, quantity: newQty }
          : i
      ),
    }));

    try {
      await API.patch("/cart/update-qty", {
        sessionId,
        itemId,
        quantity: newQty,
      });
      await fetchCartSummary();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update quantity");
      await fetchCartSummary(); // rollback
    }
  };

  /* ================= REMOVE ================= */
  const removeItem = async (itemId) => {
    await API.delete(`/cart/${sessionId}/item/${itemId}`);
    await fetchCartSummary();
  };

  const addLooseDiamond = async (diamondData) => {
    const res = await API.post("/cart/loose-diamond", {
      sessionId,
      ...diamondData,
    });
    await fetchCartSummary();
    return res.data;
  };

  /* ================= DRAWER STATE ================= */
  const [isCartOpen, setIsCartOpen] = useState(false);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  /* ================= CLEAR ================= */
  const clearCart = async () => {
    await API.delete(`/cart/${sessionId}`);
    setCart({ items: [], totals: {} });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        sessionId,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        addProduct,
        addLooseDiamond,
        updateQty,
        removeItem,
        clearCart,
        fetchCartSummary,
        addCustomOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
