import { useEffect, useState } from "react";
import { getActiveRates } from "../../api/ratesApi";

export default function StaffRatesPreview() {
  const [rates, setRates] = useState(null);

  useEffect(() => {
    getActiveRates()
      .then(res => setRates(res.data.rates))
      .catch(() => setRates(null));
  }, []);

  if (!rates) {
    return <div className="p-6 text-sm text-stone-500">No active rates</div>;
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
      <h2 className="font-serif text-xl">💰 Current Active Rates</h2>

      <Row label="Gold 24KT" value={`₹${rates.gold24KT} / gm`} />
      <Row label="Silver 999" value={`₹${rates.silver999} / gm`} />
      <Row label="Platinum 950" value={`₹${rates.platinum950} / gm`} />

      <hr />

      <Row label="Diamond" value={`₹${rates.diamondRate} / ct`} />
      <Row label="Stone" value={`₹${rates.stoneRate} / ct`} />
      <Row label="Making" value={`₹${rates.makingCharge} / gm`} />

      <hr />

      <Row label="GST (Metal)" value={`${rates.gstRate}%`} />
      <Row label="GST (Making)" value={`${rates.gstMakingRate}%`} />

      <hr />

      <Row
        label="Discount"
        value={
          rates.discountType === "none"
            ? "No Discount"
            : rates.discountType === "percent"
            ? `${rates.discountValue}%`
            : `₹${rates.discountValue}`
        }
      />
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-stone-600">{label}</span>
      <span className="font-medium text-stone-900">{value}</span>
    </div>
  );
}
