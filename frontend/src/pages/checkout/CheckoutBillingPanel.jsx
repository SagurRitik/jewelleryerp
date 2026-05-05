export default function CheckoutBillingPanel({
  goldRate,
  setGoldRate,
  makingCharge,
  setMakingCharge,
  gstPercent,
  setGstPercent,
  advance,
  setAdvance,
  totals,
  onSubmit,
}) {
  return (
    <div className="bg-white border rounded-xl p-6 space-y-5">
      <h2 className="text-2xl font-serif">Billing</h2>

      <input value={goldRate} onChange={e => setGoldRate(e.target.value)} />
      <input value={makingCharge} onChange={e => setMakingCharge(e.target.value)} />
      <input value={gstPercent} onChange={e => setGstPercent(e.target.value)} />
      <input value={advance} onChange={e => setAdvance(e.target.value)} />

      <hr />

      <div className="flex justify-between font-bold">
        <span>Payable</span>
        <span>₹ {totals.payable.toFixed(2)}</span>
      </div>

      <button onClick={onSubmit} className="bg-black text-white py-3">
        Generate Invoice 
      </button>
    </div>
  );
}
