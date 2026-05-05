
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById } from "../api/orderApi";
import BackButton from "../components/BackButton";
import OrderForm from "../components/OrderForm";
import { toast } from "sonner";

export default function EditOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getOrderById(id)
      .then((res) => {
        if (res.data?.success) {
          setOrder(res.data.order);
        } else {
          toast.error("Failed to load order data");
          navigate("/orders");
        }
      })
      .catch((err) => {
        console.error("Load order error:", err);
        toast.error("Error loading order");
        navigate("/orders");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl animate-pulse text-[#5A374F]">Loading Order Data...</div>
      </div>
    );
  }

  return (
    <div>
      <BackButton />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-slate-900 mb-3 tracking-tight">Edit Order</h1>
          <p className="text-gray-500 font-medium">Order No: {order?.orderNo}</p>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mt-4"></div>
        </div>

        <OrderForm
          initialOrder={order}
          onSuccess={(id) => navigate(`/orders/${id}`)}
        />
      </div>
    </div>
  );
}
