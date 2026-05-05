export default function CheckoutLayout({ left, right }) {
  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 bg-white border rounded-xl p-6 space-y-6 overflow-y-auto">
          {left}
        </div>

        {/* RIGHT */}
        <div className="bg-white border rounded-xl p-6 sticky top-6 h-fit">
          {right}
        </div>
      </div>
    </div>
  );
}
