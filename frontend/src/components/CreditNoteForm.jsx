import { useState } from "react";
import { createCreditNote } from "../api/posInvoiceApi";

export default function CreditNoteForm({ invoice, onSuccess }) {
  const [selected, setSelected] = useState(
    invoice.items.map((i) => ({
      ...i,
      checked: false,
      returnQty: 1,
    }))
  );

  const [reason, setReason] = useState("Return");
  const [refundMode, setRefundMode] = useState("Cash");
  const [refundRef, setRefundRef] = useState("");

  const toggleItem = (idx) => {
    const copy = [...selected];
    copy[idx].checked = !copy[idx].checked;
    setSelected(copy);
  };

  const updateQty = (idx, qty) => {
    const copy = [...selected];
    copy[idx].returnQty = qty;
    setSelected(copy);
  };

  /* ================= CALCULATIONS ================= */

  const returnedItems = selected.filter((i) => i.checked);

  const subtotal = returnedItems.reduce(
    (sum, i) => sum + i.price * i.returnQty,
    0
  );

  const gst = subtotal * 0.03;
  const total = subtotal + gst;

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!returnedItems.length) {
      alert("Select at least one item");
      return;
    }

    const payload = {
      invoiceId: invoice._id,
      items: returnedItems.map((i) => ({
        sku: i.sku,
        title: i.title,
        qty: i.returnQty,
        amount: i.price * i.returnQty,
      })),
      pricing: {
        subtotal,
        gst,
        total,
      },
      reason,
      refundMode,
      refundRef,
    };

    const res = await createCreditNote(payload);

    alert("Credit note created successfully");

    onSuccess(res.data.creditNoteId);
  };

  return (
    <div className="bg-white shadow rounded-2xl p-6 space-y-6">

      {/* ===== ITEMS ===== */}
      <div>
        <h3 className="font-serif text-lg mb-2">Returned Items</h3>

        {selected.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl mb-2"
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggleItem(idx)}
            />
            <span className="flex-1">{item.title}</span>

            <input
              type="number"
              min={1}
              max={item.qty}
              value={item.returnQty}
              disabled={!item.checked}
              onChange={(e) => updateQty(idx, +e.target.value)}
              className="w-24 border rounded px-2 py-1"
            />
          </div>
        ))}
      </div>

      {/* ===== REASON ===== */}
      <div>
        <label className="block text-sm mb-1">Reason</label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border rounded-xl px-4 py-3"
        >
          <option>Return</option>
          <option>Damage</option>
          <option>Wrong Billing</option>
          <option>Discount Adjustment</option>
          <option>Other</option>
        </select>
      </div>

      {/* ===== REFUND ===== */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Refund Mode</label>
          <select
            value={refundMode}
            onChange={(e) => setRefundMode(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          >
            <option>Cash</option>
            <option>UPI</option>
            <option>Card</option>
            <option>Bank</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Refund Reference</label>
          <input
            type="text"
            value={refundRef}
            onChange={(e) => setRefundRef(e.target.value)}
            disabled={refundMode === "Cash"}
            className="w-full border rounded-xl px-4 py-3"
          />
        </div>
      </div>

      {/* ===== SUMMARY ===== */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
        <p>GST: ₹{gst.toFixed(2)}</p>
        <p className="font-semibold">Total Refund: ₹{total.toFixed(2)}</p>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700"
      >
        Generate Credit Note
      </button>
    </div>
  );
}
