
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getOrderById } from "../api/orderApi";
import { getImageUrl } from "../utils/getImageUrl";

// import logo from "../assets/nazara_LogoFnl.png";
import logo from "../assets/NazaraPurple.png";

/* ================= UTILS ================= */

const money = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

/* ================= COMPONENT ================= */
export default function OrderSlip() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    getOrderById(id).then((res) => {
      if (res.data?.success) setOrder(res.data.order);
    });
  }, [id]);

  if (!order) {
    return (
      <div className="h-screen flex items-center justify-center font-serif text-[#562748] animate-pulse">
        Loading Order Slip…
      </div>
    );
  }

  /* ================= SAFE DATA ================= */
  const {
    orderNo,
    status,
    createdAt,
    customer = {},
    productSnapshot = {},
    metalSnapshot = {},
    metalPayment = {},
    advancePayment = {},
    pricingSnapshot,
  } = order;

  const components = productSnapshot.components || [];
  const isReady = status === "Ready" || status === "Delivered";

  /* ================= IMAGE FIX ================= */
  const primaryImage =
    productSnapshot.productImages?.[0] ||
    productSnapshot.productImage ||
    null;

  /* ================= SEPARATE COMPONENTS ================= */
  const diamonds = components.filter(
    (c) => c.type?.toLowerCase() === "diamond"
  );

  const stones = components.filter(
    (c) => c.type?.toLowerCase() !== "diamond"
  );

  return (
    <div className="min-h-screen bg-[#f4f1ee] py-10 flex justify-center print:bg-white print:py-0">
      <div className="w-full max-w-4xl bg-white shadow-2xl print:shadow-none relative">

        {/* ACTION BAR */}
        <div className="absolute top-6 right-8 flex gap-3 print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="border border-gray-300 px-4 py-2 text-xs tracking-wider hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={() => window.print()}
            className="bg-[#562748] text-white px-6 py-2 text-xs tracking-wider hover:opacity-90"
          >
            Print
          </button>
        </div>

        <div className="p-12 print:p-10">

          {/* ================= HEADER ================= */}
          <div className="text-center border-b pb-8 mb-10">
            <img
              src={logo}
              alt="Nazara Logo"
              className="h-20 mb-2 mx-auto object-contain "
            />

            <h1 className="text-3xl tracking-[0.4em] font-serif text-[#562748]">
              ORDER SLIP
            </h1>

            <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mt-2">
              Fine Jewellery Studio
            </p>
          </div>

          {/* ================= CLIENT & ORDER META ================= */}
          <div className="grid grid-cols-2 gap-12 mb-12">

            <div>
              <p className="text-xs tracking-widest uppercase text-gray-400 mb-2">
                Client Details
              </p>

              <p className="font-serif text-lg text-gray-900">
                {customer.name || "—"}
              </p>
              <p className="text-sm text-gray-600">{customer.mobile}</p>
              <p className="text-sm text-gray-500">{customer.address}</p>
              {customer.email && (
                <p className="text-sm text-gray-600">
                  Email: {customer.email}
                </p>
              )}
            </div>

            <div className="text-right">
              <p className="text-xs tracking-widest uppercase text-gray-400 mb-2">
                Order Info
              </p>

              <p className="text-base font-medium">Order No: {orderNo}</p>
              <p className="text-base">Status: {status}</p>
              <p className="text-sm text-gray-500">
                {new Date(createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* ================= PRODUCT SECTION ================= */}
          <div className="grid grid-cols-3 gap-10 mb-14">

            <div>
              {primaryImage ? (
                <img
                  src={getImageUrl(primaryImage)}
                  alt="Product"
                  className="border border-gray-200 p-2 bg-gray-50"
                />
              ) : (
                <div className="h-44 border border-gray-200 flex items-center justify-center text-gray-300 text-sm">
                  No Preview
                </div>
              )}
            </div>

            <div className="col-span-2 space-y-6">

              <div>
                <p className="text-xs tracking-widest uppercase text-gray-400 mb-1">
                  Jewellery
                </p>
                <p className="font-serif text-xl text-gray-900">
                  {productSnapshot.jewelleryCategory || "Custom Jewellery"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs uppercase text-gray-400 mb-1">
                    Metal
                  </p>
                  <p className="text-base">
                    {productSnapshot.metalPurity}{" "}
                    {productSnapshot.metalType}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Est. Net Weight: {productSnapshot.netWeight || 0} g
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase text-gray-400 mb-1">
                    Locked Rate
                  </p>
                  <p className="text-base">
                    {money(metalSnapshot.ratePerGram)}/g
                  </p>
                </div>
              </div>

              {/* DIAMONDS */}
              {diamonds.length > 0 && (
                <div>
                  <p className="text-xs uppercase text-gray-400 mb-2">
                    Diamonds
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {diamonds.map((c, i) => (
                      <li key={i}>
                        • {c.shape || "Round"} — {c.weight || 0} ct ({c.count || 0} pcs)
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* STONES */}
              {stones.length > 0 && (
                <div>
                  <p className="text-xs uppercase text-gray-400 mb-2 mt-4">
                    Precious Stones
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {stones.map((c, i) => (
                      <li key={i}>
                        • {c.type} — {c.weight || 0} ct ({c.count || 0} pcs)
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </div>

          {/* ================= PAYMENT SECTION ================= */}
          <div className="border-t pt-8 mt-6">
            <p className="text-xs tracking-widest uppercase text-gray-400 mb-4">
              Payments Received
            </p>

            <div className="grid grid-cols-2 gap-10">
              <div>
                <p className="text-sm text-gray-500">Advance Payment</p>
                <p className="text-lg font-serif">
                  {money(advancePayment.amount)}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Mode: {advancePayment.mode}
                </p>

                {advancePayment.transactionId && (
                  <p className="text-xs text-gray-400">
                    Txn ID: {advancePayment.transactionId}
                  </p>
                )}
              </div>

              {metalPayment?.weight > 0 && (
                <div>
                  <p className="text-sm text-gray-500">
                    Metal Provided
                  </p>
                  <p className="text-lg font-serif">
                    {money(metalPayment.totalValue)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {metalPayment.weight} g ({metalPayment.purity})
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ================= FINAL BILL ================= */}
          {isReady && pricingSnapshot && (
            <div className="border-t pt-10 mt-10">
              <div className="max-w-md ml-auto space-y-4">

                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{money(pricingSnapshot.subtotal)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Advance Used</span>
                  <span>- {money(pricingSnapshot.advanceUsed)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Metal Adjusted</span>
                  <span>- {money(pricingSnapshot.metalUsed)}</span>
                </div>

                <div className="border-t pt-4 flex justify-between text-lg font-serif text-[#562748]">
                  <span>Payable</span>
                  <span>{money(pricingSnapshot.payable)}</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= FOOTER ================= */}
          <div className="mt-20 flex justify-between items-end">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400">
                Authorized Signature
              </p>
              <div className="w-56 border-b mt-6"></div>
            </div>

            <p className="text-xs text-gray-400 tracking-widest uppercase">
              Please present this slip at delivery
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}