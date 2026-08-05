
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import { MessageCircle, Download, Printer, ArrowLeft, UserPlus, QrCode, Calculator } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export default function InvoicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.role?.toLowerCase() === "superadmin";
  const [htmlContent, setHtmlContent] = useState("");
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [whatsAppLoading, setWhatsAppLoading] = useState(false);

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

  const handleWhatsApp = async () => {
    if (!invoiceData) return;

    if (whatsAppLoading) return;
    setWhatsAppLoading(true);
    const toastId = toast.loading("Sending PDF to WhatsApp...");

    try {
      const res = await API.post(`/sales-invoices/${id}/whatsapp`);

      if (res.data?.success) {
        toast.success(`📲 Invoice PDF sent directly to customer's WhatsApp!`, { id: toastId });
        return;
      }

      toast.info("Direct send unavailable. Downloading PDF to share manually...", { id: toastId, duration: 4000 });

      // Fetch PDF Blob
      const pdfRes = await API.get(`/sales-invoices/${id}/pdf`, { responseType: "blob" });
      const blob = new Blob([pdfRes.data], { type: "application/pdf" });
      const safeNo = (invoiceData.invoiceNo || id).replace(/[/\\:*?"<>|]/g, "-");
      const filename = `Invoice-${safeNo}.pdf`;
      const blobUrl = URL.createObjectURL(blob);

      // Mobile share fallback
      const pdfFile = new File([blob], filename, { type: "application/pdf" });
      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        try {
          await navigator.share({
            title: `Invoice ${invoiceData.invoiceNo || ""}`,
            text: `Invoice ${invoiceData.invoiceNo || ""} for ${invoiceData.customer?.name || "Customer"}`,
            files: [pdfFile],
          });
          URL.revokeObjectURL(blobUrl);
          return;
        } catch (shareErr) {
          console.log("Web Share cancelled", shareErr);
        }
      }

      // Download file
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      // Open WhatsApp web link
      setTimeout(() => {
        const customer = invoiceData.customer || {};
        const customerName = customer.name?.trim() || "Customer";
        let mobile = customer.mobile || "";
        if (mobile && !mobile.startsWith("+") && mobile.length === 10) {
          mobile = `91${mobile}`;
        }
        const mobileForWa = mobile.replace(/\D/g, "");

        const invoiceNo = invoiceData.invoiceNo || "N/A";
        const totals = invoiceData.totals || {};
        const grandTotal = totals.grandTotal || 0;

        const message = `✨ *INVOICE: ${invoiceNo}* ✨\n\nHello *${customerName}*,\n\nYour invoice PDF (*${filename}*) has been generated and downloaded to your device.\n\n*Summary:*\n• Subtotal: ₹${(totals.subtotal || 0).toLocaleString('en-IN')}\n• GST: ₹${(totals.gst || 0).toLocaleString('en-IN')}\n• *Total Amount:* ₹${grandTotal.toLocaleString('en-IN')}\n\n*Payment Method:* ${invoiceData.payment?.mode || "N/A"}\n\n📎 *Please attach the downloaded PDF file here in our chat.* \n\nThank you for choosing us!\n💎 *Nazara Diamonds* 💎`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${mobileForWa}?text=${encodedMessage}`, "_blank");
      }, 500);

    } catch (err) {
      console.error("WhatsApp Error:", err);
      toast.error(err?.response?.data?.error || "Failed to send WhatsApp", { id: toastId });
    } finally {
      setWhatsAppLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const res = await API.get(`/sales-invoices/export?id=${id}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${invoiceData?.invoiceNo || id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Failed to export invoice to Excel");
    }
  };

  if (!id) {
    return <div className="p-10">Invalid invoice</div>;
  }

  const handleAddCustomerFromInvoice = () => {
    const cust = invoiceData?.customer || {};
    const rawMobile = (cust.mobile || "").replace(/\D/g, "");
    const cleanMobile = rawMobile.length >= 10 ? rawMobile.slice(-10) : rawMobile;

    navigate("/customers", {
      state: {
        prefillCustomer: {
          name: cust.name || "",
          mobile: cleanMobile,
          email: cust.email || "",
          address: cust.address || "",
          city: cust.city || "",
          gstin: cust.gstin || "",
        },
      },
    });
  };

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

        <div className="flex items-center gap-2.5">
          {/* ✅ Save Customer & Reminders Button */}
          <button
            onClick={handleAddCustomerFromInvoice}
            className="p-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-lg shadow-md shadow-pink-600/20 transition-all active:scale-95 flex items-center justify-center"
            title="Save Customer Profile & Add Birthday / Anniversary Dates"
          >
            <UserPlus size={18} />
          </button>

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

          {/* ✅ Export Excel Button (Superadmin Only) */}
          {isSuperAdmin && (
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-5 py-2.5 border border-stone-300 text-stone-700 text-xs font-bold uppercase tracking-wider rounded hover:bg-stone-50 transition-all"
            >
              <Download size={16} />
              Export Excel
            </button>
          )}
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