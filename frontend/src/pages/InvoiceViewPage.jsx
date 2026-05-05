import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../../api";

export default function InvoiceViewPage() {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    API.get(`/sales/invoice/${invoiceId}`).then(res =>
      setInvoice(res.data.invoice)
    );
  }, [invoiceId]);

  if (!invoice) return <div>Loading invoice…</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="font-serif text-2xl mb-4">
        Invoice #{invoice.invoiceNo}
      </h1>

      <p>
        {invoice.customer.name} • {invoice.customer.mobile}
      </p>

      <hr className="my-4" />

      <p className="text-xl font-medium">
        Grand Total: ₹ {invoice.totals.grandTotal.toFixed(2)}
      </p>
    </div>
  );
}
