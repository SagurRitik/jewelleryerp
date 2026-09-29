
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import {
  MessageCircle,
  Download,
  Printer,
  ArrowLeft,
  UserPlus,
  QrCode,
  Calculator,
  Maximize2,
  Minimize2,
} from "lucide-react";
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
  const [isFitMode, setIsFitMode] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  const [scale, setScale] = useState(1);
  const [iframeHeight, setIframeHeight] = useState(1123);

  const handleIframeLoad = (e) => {
    try {
      const doc = e.target.contentDocument || e.target.contentWindow?.document;
      if (doc && doc.body) {
        const h = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight, 1123);
        setIframeHeight(h);
      }
    } catch (err) {
      console.warn("Could not measure iframe height:", err);
    }
  };

  useEffect(() => {
    const updateScale = () => {
      if (typeof window === "undefined") return;
      const screenWidth = window.innerWidth;
      const horizontalPadding = screenWidth < 640 ? 16 : 48;
      const availableWidth = Math.max(280, screenWidth - horizontalPadding);
      const a4WidthPx = 794;
      const calculatedScale = Math.min(1, availableWidth / a4WidthPx);
      setScale(calculatedScale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

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

      if (res.data?.error) {
        console.warn("AiSensy direct send notice:", res.data.error);
      }
      toast.info(`Direct send unavailable. Downloading PDF to share via WhatsApp...`, { id: toastId, duration: 4000 });

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
        const rawDigits = (customer.mobile || "").replace(/\D/g, "");
        const last10 = rawDigits.slice(-10);
        const mobileForWa = last10.length === 10 ? `91${last10}` : rawDigits;

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
      <div className="bg-white border-b border-stone-200 px-3 sm:px-6 py-3 sm:py-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between md:justify-start gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 sm:p-2 hover:bg-stone-50 rounded-full transition-colors text-stone-600"
              aria-label="Go Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="font-serif text-base sm:text-xl text-[#462434] font-bold leading-tight">Invoice Preview</h1>
              <p className="text-[9px] sm:text-[10px] text-stone-400 font-bold tracking-widest uppercase">No: {invoiceData?.invoiceNo || id}</p>
            </div>
          </div>

          {/* UserPlus button for mobile top-right */}
          <button
            onClick={handleAddCustomerFromInvoice}
            className="md:hidden p-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg shadow-sm transition-all active:scale-95 flex items-center justify-center"
            title="Save Customer Profile"
          >
            <UserPlus size={16} />
          </button>
        </div>

        <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 justify-end">
          {/* UserPlus (Desktop) */}
          <button
            onClick={handleAddCustomerFromInvoice}
            className="hidden md:flex p-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-lg shadow-md shadow-pink-600/20 transition-all active:scale-95 items-center justify-center shrink-0"
            title="Save Customer Profile & Add Birthday / Anniversary Dates"
          >
            <UserPlus size={18} />
          </button>

          {/* Fit Screen / 100% Toggle */}
          <button
            type="button"
            onClick={() => setIsFitMode((prev) => !prev)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold transition shrink-0"
            title={isFitMode ? "View at 100% size" : "Auto-fit invoice width to screen"}
          >
            {isFitMode ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            <span>{isFitMode ? "Full Size (100%)" : "Fit Screen"}</span>
          </button>

          {/* WhatsApp Button */}
          <button
            onClick={handleWhatsApp}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#25D366] text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded shadow hover:bg-[#20ba59] transition-all active:scale-95 shrink-0"
          >
            <MessageCircle size={15} fill="white" />
            <span>WhatsApp</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#462434] text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded shadow hover:bg-[#341a26] transition-all active:scale-95 shrink-0"
          >
            <Printer size={15} />
            <span>Print</span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={() =>
              window.open(
                `${window.location.origin}/api/sales-orders/${id}/pdf`,
                "_blank"
              )
            }
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 border border-stone-300 text-stone-700 text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded hover:bg-stone-50 transition-all shrink-0"
          >
            <Download size={15} />
            <span>PDF</span>
          </button>

          {/* Export Excel Button (Superadmin Only) */}
          {isSuperAdmin && (
            <button
              onClick={handleExportExcel}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 border border-stone-300 text-stone-700 text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded hover:bg-stone-50 transition-all shrink-0"
            >
              <Download size={15} />
              <span>Excel</span>
            </button>
          )}
        </div>
      </div>

      {/* HTML PREVIEW (Formatted as A4 Paper) */}
      <div className={`flex-1 p-2 sm:p-6 md:p-8 flex ${isFitMode && scale < 1 ? "justify-center" : "justify-start sm:justify-center"} overflow-x-auto bg-[#F9F7F2]`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-20">
            <div className="w-12 h-12 border-4 border-[#462434] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-stone-500 font-medium tracking-wide">Rendering Luxury Template...</p>
          </div>
        ) : (
          <div
            className="relative transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-stone-200 rounded-sm overflow-hidden bg-white shrink-0"
            style={{
              width: isFitMode && scale < 1 ? `${Math.round(794 * scale)}px` : "794px",
              height: isFitMode && scale < 1 ? `${Math.round(iframeHeight * scale)}px` : `${iframeHeight}px`,
              minWidth: isFitMode && scale < 1 ? `${Math.round(794 * scale)}px` : "794px",
            }}
          >
            <div
              style={{
                width: "794px",
                height: `${iframeHeight}px`,
                minWidth: "794px",
                transform: isFitMode && scale < 1 ? `scale(${scale})` : "none",
                transformOrigin: "0 0",
                position: isFitMode && scale < 1 ? "absolute" : "relative",
                top: 0,
                left: 0,
              }}
            >
              <iframe
                id="invoice-frame"
                srcDoc={htmlContent}
                title="Invoice PDF"
                onLoad={handleIframeLoad}
                className="w-full h-full border-none"
                style={{ display: "block", backgroundColor: "white" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}