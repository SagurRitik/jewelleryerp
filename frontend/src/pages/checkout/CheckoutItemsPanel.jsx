export default function CheckoutItemsPanel({ items }) {
  return (
    <div className="bg-white border rounded-xl p-6 space-y-6">
      <h2 className="text-2xl font-serif">Items</h2>

      {items.map(item => {
        const snap = item.customSnapshot || {};
        const pd = snap.productDetails || {};

        return (
          <div key={item._id} className="flex gap-6 border-b pb-6">
            <img
              src={snap.productImage}
              className="w-24 h-24 object-contain border"
            />

            <div className="flex-1">
              <h3 className="font-serif text-lg">
                {snap.title || "Jewellery Item"}
              </h3>

              <p className="text-sm text-gray-600">
                {pd.metalType} • {pd.metalPurity} • {pd.metalColor}
              </p>

              <p className="text-sm">Qty: {item.quantity}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
