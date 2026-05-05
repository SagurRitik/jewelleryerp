

// CartContext.js
import { createContext, useContext, useEffect, useState } from "react";
import API from "../api";
import axios from "axios";

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
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i._id === itemId
          ? { ...i, quantity: Math.max(1, i.quantity + delta) }
          : i
      ),
    }));

    const item = cart.items.find((i) => i._id === itemId);
    if (!item) return;

    const newQty = Math.max(1, item.quantity + delta);

    try {
      await API.patch("/cart/update-qty", {
        sessionId,
        itemId,
        quantity: newQty,
      });
      await fetchCartSummary();
    } catch {
      await fetchCartSummary(); // rollback
    }
  };

  /* ================= REMOVE ================= */
  const removeItem = async (itemId) => {
    await API.delete(`/cart/${sessionId}/item/${itemId}`);
    await fetchCartSummary();
  };

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
        sessionId, // ✅ THIS WAS MISSING
        addProduct,
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
