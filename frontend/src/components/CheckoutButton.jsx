import API from "../api";
import { useCart } from "../context/CartContext";

export default function CheckoutButton() {
  const { sessionId, clearCart } = useCart();

  const checkout = async () => {
    await API.post("/checkout", {
      sessionId,
      customer: {
        name: "Walk-in Customer",
        mobile: "9999999999",
      },
      paymentMode: "Cash",
    });

    clearCart();
    alert("Order placed successfully");
  };

  return (
    <button
      onClick={checkout}
      className="w-full mt-4 bg-green-600 text-white py-2 rounded"
    >
      Checkout
    </button>
  );
}
