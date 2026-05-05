
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import { MessageCircle, Download, Printer, ArrowLeft } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export default function InvoicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [htmlContent, setHtmlContent] = useState("");
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch HTML and JSON Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch HTML Preview
        const htmlRes = await API.get(`/sales-invoices/${id}/html`, { responseType: "text" });
        setHtmlContent(htmlRes.data);

        // Fetch JSON for WhatsApp/Details
        const dataRes = await API.get(`/sales-invoices/${id}`);
        if (dataRes.data?.success) {
          setInvoiceData(dataRes.data.invoice);
        }
      } catch (err) {
        console.error("Error fetching invoice:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  // 2. Helpers
  const getItemName = (item) => {
    const snap = item.itemSnapshot || item.customSnapshot || {};
    return snap.productDetails?.title || snap.title || "Custom Jewellery";
  };

  const handlePrint = () => {
    const iframe = document.getElementById("invoice-frame");
    if (iframe) {
      iframe.contentWindow.print();
    }
  };

  const handleWhatsApp = () => {
    if (!invoiceData) return;

    try {
      const customer = invoiceData.customer || {};
      const customerName = customer.name?.trim() || "Customer";
      // Mobile handling (assuming country code +91 if not present)
      let mobile = customer.mobile || "";
      if (mobile && !mobile.startsWith("+") && mobile.length === 10) {
        mobile = `91${mobile}`;
      }
      const mobileForWa = mobile.replace(/\D/g, "");

      const invoiceNo = invoiceData.invoiceNo || "N/A";
      const totals = invoiceData.totals || {};
      const grandTotal = totals.grandTotal || 0;

      // Direct PDF URL (Backend endpoint)
      const pdfUrl = `${window.location.origin}/api/sales-orders/${id}/pdf`;

      // Build Items Breakdown
      const itemsBreakdown = (invoiceData.items || []).map((item, idx) => {
        const name = getItemName(item);
        const qty = item.quantity || 1;
        const total = item.breakup?.grandTotal || 0;
        return `${idx + 1}. *${name}* (x${qty}) - ₹${total.toLocaleString('en-IN')}`;
      }).join('\n');

      const message = `✨ *INVOICE: ${invoiceNo}* ✨\n\nनमस्ते *${customerName}*,\n\nआपका बिल सफलतापूर्वक जनरेट हो गया है।\n\n*आइटम विवरण:*\n--------------------------------\n${itemsBreakdown}\n--------------------------------\n\n*बिल सारांश:*\n• सबटोटल: ₹${(totals.subtotal || 0).toLocaleString('en-IN')}\n• GST: ₹${(totals.gst || 0).toLocaleString('en-IN')}\n• *कुल राशि:* ₹${grandTotal.toLocaleString('en-IN')}\n\n*भुगतान विधि:* ${invoiceData.payment?.mode || "N/A"}\n\nधन्यवाद,\n💎 *Nazara Diamonds - Royal Atelier* 💎`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${mobileForWa}?text=${encodedMessage}`;

      window.open(whatsappUrl, "_blank");
    } catch (err) {
      console.error("WhatsApp Error:", err);
      alert("Failed to open WhatsApp.");
    }
  };

  if (!id) {
    return <div className="p-10">Invalid invoice</div>;
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2] flex flex-col font-sans">

      {/* HEADER */}
      <div className="bg-white border-b border-stone-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-stone-50 rounded-full transition-colors text-stone-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-serif text-xl text-[#462434] font-bold">Invoice Preview</h1>
            <p className="text-[10px] text-stone-400 font-bold tracking-widest uppercase">No: {invoiceData?.invoiceNo || id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* ✅ WhatsApp Button */}
          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider rounded shadow-md hover:bg-[#20ba59] transition-all active:scale-95"
          >
            <MessageCircle size={16} fill="white" />
            Send on WhatsApp
          </button>

          {/* ✅ Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#462434] text-white text-xs font-bold uppercase tracking-wider rounded shadow-md hover:bg-[#341a26] transition-all active:scale-95"
          >
            <Printer size={16} />
            Print Bill
          </button>

          {/* ✅ Download PDF Button */}
          <button
            onClick={() =>
              window.open(
                `${window.location.origin}/api/sales-orders/${id}/pdf`,
                "_blank"
              )
            }
            className="flex items-center gap-2 px-5 py-2.5 border border-stone-300 text-stone-700 text-xs font-bold uppercase tracking-wider rounded hover:bg-stone-50 transition-all"
          >
            <Download size={16} />
            Download PDF
          </button>
        </div>
      </div>

      {/* HTML PREVIEW (Formatted as A4 Paper) */}
      <div className="flex-1 p-8 flex justify-center overflow-auto bg-[#F9F7F2]">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-20">
            <div className="w-12 h-12 border-4 border-[#462434] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-stone-500 font-medium tracking-wide">Rendering Luxury Template...</p>
          </div>
        ) : (
          <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-stone-200 rounded-sm overflow-hidden" style={{ width: "210mm", height: "297mm", minWidth: "210mm" }}>
            <iframe
              id="invoice-frame"
              srcDoc={htmlContent}
              title="Invoice PDF"
              className="w-full h-full border-none"
              style={{ display: "block" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}