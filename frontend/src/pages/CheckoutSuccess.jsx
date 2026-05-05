import { Link } from "react-router-dom";

export default function CheckoutSuccess() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] px-4">
      <h1 className="text-3xl font-serif mb-4 text-green-600">
        ✅ Order Placed Successfully
      </h1>

      <p className="text-gray-600 mb-8">
        Thank you for your purchase. Your order has been created.
      </p>

      <div className="flex gap-4">
        <Link
          to="/"
          className="px-6 py-3 border border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white transition"
        >
          Continue Shopping
        </Link>

        <Link
          to="/orders"
          className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition"
        >
          View Orders
        </Link>
      </div>
    </div>
  );
}
