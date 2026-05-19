
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
    (c) => c.pricingRef === "DIAMOND" || c.type?.toLowerCase() === "diamond"
  );

  const belts = components.filter(
    (c) => c.pricingRef === "BELT"
  );

  const stones = components.filter(
    (c) => c.pricingRef === "STONE" || (c.type?.toLowerCase() !== "diamond" && c.pricingRef !== "BELT")
  );

  const totalDiamondWeight = diamonds.reduce((sum, c) => sum + (Number(c.grossWeight) || 0), 0).toFixed(3);
  const totalDiamondCount = diamonds.reduce((sum, c) => sum + (Number(c.count) || 0), 0);

  const totalStoneWeight = stones.reduce((sum, c) => sum + (Number(c.grossWeight) || 0), 0).toFixed(3);
  const totalStoneCount = stones.reduce((sum, c) => sum + (Number(c.count) || 0), 0);

  return (
    <div className="min-h-screen bg-[#f4f1ee] py-10 flex justify-center print:bg-white print:py-0">
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 10mm;
            }
            body {
              background: white !important;
              -webkit-print-color-adjust: exact;
            }
            .print-no-break {
              break-inside: avoid;
            }
            .print-single-page {
              max-height: 100vh;
              overflow: hidden;
            }
          }
        `}
      </style>
      <div className="w-full max-w-4xl bg-white shadow-2xl print:shadow-none relative print:max-h-[285mm]">

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

        <div className="p-12 print:p-8">

          {/* ================= HEADER ================= */}
          <div className="text-center border-b pb-6 mb-8 print:pb-4 print:mb-6">
            <img
              src={logo}
              alt="Nazara Logo"
              className="h-16 mb-2 mx-auto object-contain "
            />

            <h1 className="text-3xl tracking-[0.4em] font-serif text-[#562748]">
              ORDER SLIP
            </h1>
          </div>

          {/* ================= CLIENT & ORDER META ================= */}
          <div className="grid grid-cols-2 gap-12 mb-8 print:mb-6">

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
          <div className="grid grid-cols-3 gap-10 mb-10 print:mb-6">

            <div>
              {primaryImage ? (
                <img
                  src={getImageUrl(primaryImage)}
                  alt="Product"
                  className="border border-gray-200 p-2 bg-gray-50 w-full"
                />
              ) : (
                <div className="h-44 border border-gray-200 flex items-center justify-center text-gray-300 text-sm">
                  No Preview
                </div>
              )}
            </div>

            <div className="col-span-2 space-y-5">

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
                  <p className="text-xs text-gray-500 mt-1 font-bold">
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

              {/* DIAMONDS - TOTALS DISPLAY */}
              {diamonds.length > 0 && (
                <div>
                  <p className="text-xs uppercase text-gray-400 mb-1">
                    Diamonds
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    Total Diamond Wt: {totalDiamondWeight} ct
                  </p>
                  <ul className="text-[11px] text-gray-600 mt-1 opacity-70">
                    {diamonds.map((c, i) => (
                      <li key={i}>
                        {c.shape || "Round"} — {c.weight.toFixed(3)} ct ({c.count} pcs)
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* STONES - TOTALS DISPLAY */}
              {stones.length > 0 && (
                <div>
                  <p className="text-xs uppercase text-gray-400 mb-1 mt-2">
                    Precious Stones
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    Total Stone Wt: {totalStoneWeight} ct
                  </p>
                  <ul className="text-[11px] text-gray-600 mt-1 opacity-70">
                    {stones.map((c, i) => (
                      <li key={i}>
                        {c.type} — {c.weight} ct ({c.count} pcs)
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* BELTS - RATE OVERRIDE INCLUDED */}
              {belts.length > 0 && (
                <div>
                  <p className="text-xs uppercase text-gray-400 mb-1 mt-2">
                    Belts & Accessories
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {belts.map((c, i) => (
                      <li key={i} className="flex justify-between max-w-xs font-bold">
                        <span>• {c.category || "Belt"} ({c.count} pcs)</span>
                        <span>Rate: {money(c.rateOverride || c.price)}</span>
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