
export default function ItemSummary({ breakup, quantity }) {
  if (!breakup) return null;

  const components = Array.isArray(breakup.componentBreakup)
    ? breakup.componentBreakup
    : [];

  const diamondRows = components.filter(c => c.type === "Diamond");
  const stoneRows = components.filter(c => c.type !== "Diamond");

  return (
    <div className="bg-stone-50 border-t p-6">
      <h4 className="font-serif mb-3 text-stone-900">
        Valuation Summary
      </h4>

      {/* METAL & MAKING — DIRECT */}
      <BillRow label="Metal Value" amount={breakup.metalValue} />
      <BillRow label="Making Charges" amount={breakup.makingCharge} />

      {/* 💎 DIAMOND — BACKEND ONLY */}
      {diamondRows.map((d, i) => (
        <BillRow
          key={`d-${i}`}
          label={`Diamond (${d.weight} × ${d.count})`}
          amount={d.value}
        />
      ))}

      {/* 🔶 STONES — BACKEND ONLY */}
      {stoneRows.map((s, i) => (
        <BillRow
          key={`s-${i}`}
          label={`${s.type} (${s.count} pc)`}
          amount={s.value}
        />
      ))}

      {/* SUBTOTAL */}
      <div className="border-t border-stone-200 mt-3 pt-3 flex justify-between font-medium">
        <span>
          Subtotal <span className="text-xs">(x{quantity})</span>
        </span>
        <span className="font-mono">
          ₹ {Number(breakup.subtotal || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          })}
        </span>
      </div>

      {/* DISCOUNTS — BACKEND ONLY */}
      {breakup.discountMaking > 0 && (
        <BillRow
          label="Making Discount"
          amount={-breakup.discountMaking}
          highlight
        />
      )}

      {breakup.discountDiamond > 0 && (
        <BillRow
          label="Diamond Discount"
          amount={-breakup.discountDiamond}
          highlight
        />
      )}

      {breakup.discountStone > 0 && (
        <BillRow
          label="Stone Discount"
          amount={-breakup.discountStone}
          highlight
        />
      )}
    </div>
  );
}

const BillRow = ({ label, amount, highlight }) => (
  <div
    className={`flex justify-between items-center py-2 border-b border-stone-100 last:border-0 ${
      highlight ? "text-emerald-700 font-medium" : ""
    }`}
  >
    <span className="text-sm">{label}</span>
    <span className="font-mono text-sm">
      ₹ {Number(amount || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      })}
    </span>
  </div>
);
