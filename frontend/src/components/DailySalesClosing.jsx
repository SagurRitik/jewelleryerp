// export default function DailySalesClosing({ data }) {
//   if (!data) {
//     return <p className="p-6">No data available</p>;
//   }

//   return (
//     <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow">
//       <h1 className="text-xl font-bold mb-6">
//         Sales Order Daily Closing
//       </h1>

//       <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//         <Stat label="Total Invoices" value={data.totalInvoices} />
//         <Stat label="Total Sale" value={`₹ ${data.totalSale}`} />
//         <Stat label="GST" value={`₹ ${data.gst}`} />
//         <Stat label="Cash" value={`₹ ${data.cash}`} />
//         <Stat label="UPI" value={`₹ ${data.upi}`} />
//         <Stat label="Card" value={`₹ ${data.card}`} />
//         <Stat label="Bank" value={`₹ ${data.bank}`} />
//       </div>
//     </div>
//   );
// }

// function Stat({ label, value }) {
//   return (
//     <div className="border rounded p-4">
//       <p className="text-sm text-gray-500">{label}</p>
//       <p className="text-lg font-semibold">{value}</p>
//     </div>
//   );
// }

export default function DailySalesClosing({ data, date, onDateChange }) {
  if (!data) return null;

  const {
    totalInvoices,
    totalSale,
    gst,
    payments = {},
    gstSummary = {},
  } = data;

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-2xl shadow">
      <h1 className="text-2xl font-serif text-center mb-6">
        Sales Order Daily Closing
      </h1>

      {/* DATE */}
      <div className="flex justify-center mb-8">
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="border rounded-lg px-4 py-2"
        />
      </div>

      {/* TOP SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card title="Total Invoices" value={totalInvoices} />
        <Card title="Total Sale" value={`₹${totalSale}`} />
        <Card title="GST" value={`₹${gst}`} />
      </div>

      {/* PAYMENT SUMMARY */}
      <Section title="Payment Summary">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Cash" value={`₹${payments.cash || 0}`} />
          <Card title="UPI" value={`₹${payments.upi || 0}`} />
          <Card title="Card" value={`₹${payments.card || 0}`} />
          <Card title="Bank" value={`₹${payments.bank || 0}`} />
        </div>
      </Section>

      {/* GST SUMMARY */}
      <Section title="GST Summary">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="SGST" value={`₹${gstSummary.sgst || 0}`} />
          <Card title="CGST" value={`₹${gstSummary.cgst || 0}`} />
        </div>
      </Section>

      {/* PRINT */}
      <div className="flex justify-center mt-10 print:hidden">
        <button
          onClick={() => window.print()}
          className="px-10 py-3 bg-black text-white rounded-xl"
        >
          Print Daily Closing
        </button>
      </div>
    </div>
  );
}

/* ===== SMALL COMPONENTS ===== */

function Card({ title, value }) {
  return (
    <div className="border rounded-xl p-6">
      <p className="text-gray-500">{title}</p>
      <p className="text-xl font-semibold mt-1">{value}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mt-10">
      <h2 className="text-sm tracking-widest uppercase text-gray-600 mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}
