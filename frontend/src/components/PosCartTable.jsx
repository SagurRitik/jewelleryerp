export default function PosCartTable({ items, onQtyChange, onRemove }) {
  return (
    <table className="w-full border mt-4">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2">SKU</th>
          <th>Product</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Total</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={i} className="border-t">
            <td className="p-2 font-mono">{item.sku}</td>
            <td>{item.title}</td>
            <td>
              <input
                type="number"
                value={item.qty}
                min="1"
                className="w-16 border"
                onChange={(e) =>
                  onQtyChange(i, Number(e.target.value))
                }
              />
            </td>
            <td>₹{item.price}</td>
            <td>₹{item.qty * item.price}</td>
            <td>
              <button
                className="text-red-600"
                onClick={() => onRemove(i)}
              >
                ✕
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
