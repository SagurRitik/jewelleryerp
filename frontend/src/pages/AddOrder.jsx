


import BackButton from "../components/BackButton";
import OrderForm from "../components/OrderForm";
import { useNavigate, useLocation } from "react-router-dom";


export default function AddOrder() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialProduct = location.state?.product || null;

  return (
    <div>
      <BackButton />

      <div className="max-w-4xl mx-auto ">

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-slate-900 mb-3 tracking-tight">Create New Order</h1>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mb-4"></div>
        </div>
        <OrderForm
          initialProduct={initialProduct}
          onSuccess={(id) => navigate(`/orders/${id}`)}
        />
      </div>
    </div>
  );
}













