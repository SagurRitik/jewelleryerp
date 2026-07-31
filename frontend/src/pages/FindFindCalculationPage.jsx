import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  QrCode, 
  Upload, 
  Camera, 
  FileText, 
  Calculator, 
  Sparkles, 
  CheckCircle2, 
  Printer, 
  Copy, 
  RefreshCw, 
  ArrowLeft,
  Gem,
  Hammer,
  Receipt,
  Scale,
  Percent,
  X
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import jsQR from "jsqr";
import axiosInstance from "../api/axiosInstance";
import { toast } from "sonner";

export default function FindFindCalculationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialInv = searchParams.get("inv") || "";

  const [activeTab, setActiveTab] = useState("search"); // 'search', 'camera', 'upload'
  const [queryInput, setQueryInput] = useState(initialInv);
  const [loading, setLoading] = useState(false);
  const [auditData, setAuditData] = useState(null);

  // Camera scanner state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const html5QrCodeRef = useRef(null);

  // Auto-search if URL contains ?inv=...
  useEffect(() => {
    if (initialInv) {
      fetchAudit(initialInv);
    }
  }, [initialInv]);

  // Clean up camera on unmount or tab change
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = async () => {
    if (html5QrCodeRef.current && isCameraActive) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error("Failed to stop camera scanner", err);
      }
      setIsCameraActive(false);
    }
  };

  const startCameraScanner = async () => {
    setActiveTab("camera");
    setIsCameraActive(true);
    toast.info("Starting Camera Scanner...");

    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("qr-camera-reader");
        html5QrCodeRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            toast.success("QR Code Scanned Successfully!");
            stopCamera();
            fetchAudit(decodedText);
          },
          (errorMessage) => {
            // Ignore scan attempt errors
          }
        );
      } catch (err) {
        console.error("Camera Scanner Error:", err);
        toast.error("Unable to access camera. Please check camera permissions.");
        setIsCameraActive(false);
      }
    }, 300);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Decoding QR code from image...");
    let decodedText = "";

    // Stage 1: Try Html5Qrcode scan
    try {
      const html5QrCode = new Html5Qrcode("qr-file-reader-hidden");
      decodedText = await html5QrCode.scanFile(file, true);
    } catch (e) {
      console.log("Html5Qrcode scan failed, switching to multi-pass jsQR decoder...");
    }

    // Stage 2: Try jsQR multi-resolution & contrast passes if Stage 1 failed
    if (!decodedText) {
      try {
        const imageUrl = URL.createObjectURL(file);
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageUrl;
        });

        // Scales to test: 800px (ideal for QR), original width, 600px, 1000px
        const testWidths = Array.from(new Set([800, img.width, 600, 1000])).filter(w => w > 0);

        for (const w of testWidths) {
          if (decodedText) break;
          const scale = w / img.width;
          const h = Math.round(img.height * scale);

          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);

          // Pass A: Color
          let imgData = ctx.getImageData(0, 0, w, h);
          let code = jsQR(imgData.data, w, h, { inversionAttempts: "attemptBoth" });
          if (code?.data) {
            decodedText = code.data;
            break;
          }

          // Pass B: High Contrast Threshold Binarization
          const data = imgData.data;
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const bw = avg > 128 ? 255 : 0;
            data[i] = bw;
            data[i + 1] = bw;
            data[i + 2] = bw;
          }
          ctx.putImageData(imgData, 0, 0);
          code = jsQR(imgData.data, w, h, { inversionAttempts: "attemptBoth" });
          if (code?.data) {
            decodedText = code.data;
            break;
          }
        }
        URL.revokeObjectURL(imageUrl);
      } catch (canvasErr) {
        console.error("jsQR Canvas error:", canvasErr);
      }
    }

    if (decodedText) {
      toast.success("QR Code Decoded Successfully!", { id: toastId });
      fetchAudit(decodedText);
    } else {
      toast.error("Could not find a clear QR code in this image. Try taking a closer photo or search by Invoice No.", { id: toastId });
    }
  };

  const fetchAudit = async (searchTarget) => {
    const target = (searchTarget || queryInput).trim();
    if (!target) {
      toast.error("Please enter an Invoice Number or scan a QR code");
      return;
    }

    const toastId = toast.loading("Fetching Calculation Audit Report...");
    setLoading(true);

    try {
      const res = await axiosInstance.get(`/sales-orders/find-calculation/${encodeURIComponent(target)}`);
      if (res.data?.success) {
        setAuditData(res.data);
        toast.success("Calculation Audit Report Loaded!", { id: toastId });
      } else {
        toast.error(res.data?.error || "Invoice calculation audit not found", { id: toastId });
      }
    } catch (err) {
      console.error("Find Calculation API Error:", err);
      toast.error(err.response?.data?.error || "Failed to load calculation details", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getCustomerName = (cust) => {
    if (!cust) return "Retail Customer";
    if (typeof cust === "string") return cust;
    if (typeof cust === "object") {
      if (typeof cust.name === "string") return cust.name;
      if (typeof cust.name === "object" && cust.name?.name) return String(cust.name.name);
    }
    return "Retail Customer";
  };

  const getCustomerMobile = (cust) => {
    if (!cust) return "N/A";
    if (typeof cust === "string") return "N/A";
    if (typeof cust === "object") {
      if (typeof cust.mobile === "string") return cust.mobile;
      if (typeof cust.name === "object" && cust.name?.mobile) return String(cust.name.mobile);
    }
    return "N/A";
  };

  const formatCurrency = (val) => {
    const num = Math.round(Number(val || 0) * 100) / 100;
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleCopySummary = () => {
    if (!auditData) return;
    const inv = auditData;
    const steps = auditData.audit?.calculationSteps || {};

    const summaryText = `
=== NAZARA LUXE DIAMONDS - CALCULATION AUDIT REPORT ===
Invoice No: ${inv.invoiceNo}
Customer: ${getCustomerName(inv.customer)} (${getCustomerMobile(inv.customer)})
Date: ${new Date(inv.date).toLocaleDateString("en-GB")}

CALCULATION METRICS:
• Gross Product Total: ₹${formatCurrency(steps.step1_grossTotal?.value || steps.step1_grossProductValue?.value || 0)}
• Regular Scheme Discount: ₹${formatCurrency(steps.step2_regularDiscount?.value || 0)}
• Celebration Gift Discount: ₹${formatCurrency(steps.step3_celebrationDiscount?.value || 0)}
• Total Discount Applied: ₹${formatCurrency(steps.step4_totalDiscount?.value || 0)}
• Taxable Net Subtotal: ₹${formatCurrency(steps.step5_taxableSubtotal?.value || 0)}
• Total GST (3%): ₹${formatCurrency(steps.step6_taxation?.gstTotal || 0)}
• Grand Total (Net Payable): ₹${formatCurrency(steps.step7_grandTotal?.value || 0)}

Payment Mode: ${inv.payment?.mode || "CASH"} (${inv.payment?.status || "PAID"})
=========================================================
    `.trim();

    navigator.clipboard.writeText(summaryText);
    toast.success("Calculation summary copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600 transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-[#5D3354]/10 text-[#5D3354] rounded-lg">
                  <Calculator size={18} />
                </span>
                <h1 className="text-2xl font-extrabold text-[#5D3354] tracking-tight">
                  Find Find Calculation 🔍
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Scan Invoice QR Code or enter Invoice Number to view full mathematical audit breakdown
              </p>
            </div>
          </div>

          {auditData && (
            <div className="flex items-center gap-2.5 print:hidden">
              <button
                onClick={handleCopySummary}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Copy size={15} /> Copy Formula Summary
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2.5 rounded-xl bg-[#5D3354] hover:bg-[#4A2843] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                <Printer size={15} /> Print Audit Report
              </button>
            </div>
          )}
        </header>

        {/* INPUT CONTROLLER CARD (3-IN-1: SEARCH / CAMERA SCAN / FILE UPLOAD) */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-5 print:hidden">
          
          {/* TAB BUTTONS */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl w-fit">
            <button
              onClick={() => { stopCamera(); setActiveTab("search"); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "search"
                  ? "bg-white text-[#5D3354] shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Search size={15} /> Invoice Search
            </button>

            <button
              onClick={startCameraScanner}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "camera"
                  ? "bg-white text-[#5D3354] shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Camera size={15} /> Live Camera Scan
            </button>

            <label
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                activeTab === "upload"
                  ? "bg-white text-[#5D3354] shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              onClick={() => { stopCamera(); setActiveTab("upload"); }}
            >
              <Upload size={15} /> Upload QR Image
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* TAB 1: MANUAL SEARCH BAR */}
          {activeTab === "search" && (
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchAudit()}
                  placeholder="Enter Invoice Number (e.g. NZD-2026/07/24-00031)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#5D3354] focus:ring-2 focus:ring-[#5D3354]/10 transition"
                />
              </div>
              <button
                onClick={() => fetchAudit()}
                disabled={loading}
                className="px-6 py-3 bg-[#5D3354] hover:bg-[#4A2843] text-white rounded-xl font-bold text-xs transition shadow-sm active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Searching..." : "Inspect Calculation"}
              </button>
            </div>
          )}

          {/* TAB 2: CAMERA SCANNER CONTAINER */}
          {activeTab === "camera" && (
            <div className="p-6 bg-slate-900 rounded-2xl text-white flex flex-col items-center justify-center relative space-y-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 text-pink-400 font-bold text-xs uppercase tracking-wider">
                  <Camera size={16} /> Scanning QR Code via Camera
                </div>
                <button
                  onClick={() => { stopCamera(); setActiveTab("search"); }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <div id="qr-camera-reader" className="w-full max-w-sm rounded-xl overflow-hidden border-2 border-pink-500/50 shadow-lg"></div>

              <p className="text-xs text-slate-400 text-center max-w-xs">
                Position the printed bill QR code inside the camera box above to automatically decode calculations.
              </p>
            </div>
          )}

          {/* TAB 3: FILE UPLOAD CONTAINER */}
          {activeTab === "upload" && (
            <div className="p-8 border-2 border-dashed border-slate-300 hover:border-[#5D3354] rounded-2xl bg-slate-50 flex flex-col items-center justify-center space-y-3 text-center transition">
              <div className="p-3 bg-purple-100 text-[#5D3354] rounded-full">
                <Upload size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">Upload Bill QR Code Image</p>
                <p className="text-xs text-slate-400 mt-0.5">Supports PNG, JPG, WEBP invoice QR screenshots or photos</p>
              </div>
              <label className="px-5 py-2.5 bg-[#5D3354] text-white rounded-xl font-bold text-xs cursor-pointer hover:bg-[#4A2843] transition">
                Browse Image File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          <div id="qr-file-reader-hidden" className="hidden"></div>
        </div>

        {/* CALCULATION AUDIT DISPLAY (WHEN DATA LOADED) */}
        {auditData && (
          <div className="space-y-6 print:p-0">

            {/* 1. INVOICE OVERVIEW BADGE */}
            <div className="bg-gradient-to-r from-[#5D3354] via-[#4A2843] to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {auditData.isOfflineSelfContainedRecord ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-900 font-extrabold text-[10px] uppercase flex items-center gap-1 shadow-xs">
                      🛡️ Self-Contained QR Record (Permanent Offline Audit)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 font-extrabold text-[10px] uppercase">
                      Verified {auditData.source || "INVOICE"} Audit
                    </span>
                  )}
                  <span className="text-xs text-slate-300 font-mono">Invoice #{auditData.invoiceNo}</span>
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {getCustomerName(auditData.customer)}
                </h2>
                <p className="text-xs text-slate-300">
                  Mobile: {getCustomerMobile(auditData.customer)} | Date: {new Date(auditData.date).toLocaleDateString("en-GB")}
                </p>
              </div>

              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Grand Total Net Payable</p>
                  <p className="text-2xl font-black font-mono text-amber-300">
                    ₹{(auditData.audit?.calculationSteps?.step8_settlement?.value || auditData.rawInvoice?.totals?.netPayable || 0).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold uppercase">
                  {auditData.payment?.status || "PAID"}
                </div>
              </div>
            </div>

            {/* 2. GLOBAL BILL CALCULATION BREAKDOWN STEPS (THE MAIN USER FEATURE) */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-[#5D3354] font-bold text-base">
                  <Calculator size={20} />
                  <span>Executive Calculation Audit Trace</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">100% Verified Formula Step-by-Step</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Step 1: Gross Product Total */}
                <AuditStepCard
                  stepNum="1"
                  title="Gross Product Value (Before Discount)"
                  formula="Sum of Metal Value + Diamond Value + Stone Value + Making Fees across all items"
                  value={`₹${formatCurrency(auditData.audit?.calculationSteps?.step1_grossTotal?.value ?? auditData.audit?.calculationSteps?.step1_grossProductValue?.value ?? auditData.rawInvoice?.totals?.grossTotal ?? 0)}`}
                  color="bg-blue-50 border-blue-200 text-blue-900"
                />

                {/* Step 2: Regular Scheme Discount */}
                <AuditStepCard
                  stepNum="2"
                  title="Regular Scheme Discount"
                  formula="Automatic Diamond, Making & Stone rateConfig markdowns"
                  value={`-₹${formatCurrency(auditData.audit?.calculationSteps?.step2_regularDiscount?.value ?? auditData.rawInvoice?.totals?.regularDiscount ?? 0)}`}
                  color="bg-purple-50 border-purple-200 text-purple-900"
                />

                {/* Step 3: Celebration Gift Discount */}
                <AuditStepCard
                  stepNum="3"
                  title="Celebration Gift Discount 🎁"
                  formula="Special Birthday / Anniversary offer preset applied"
                  value={`-₹${formatCurrency(auditData.audit?.calculationSteps?.step3_celebrationDiscount?.value ?? auditData.rawInvoice?.totals?.celebrationDiscount ?? 0)}`}
                  color="bg-pink-50 border-pink-200 text-pink-900"
                />

                {/* Step 4: Total Combined Discount */}
                <AuditStepCard
                  stepNum="4"
                  title="Total Combined Discount"
                  formula={auditData.audit?.calculationSteps?.step4_totalDiscount?.formula || "Regular Discount + Celebration Discount"}
                  value={`-₹${formatCurrency(auditData.audit?.calculationSteps?.step4_totalDiscount?.value ?? auditData.rawInvoice?.totals?.discount ?? 0)}`}
                  color="bg-amber-50 border-amber-200 text-amber-900"
                  highlight
                />

                {/* Step 5: Net Taxable Subtotal */}
                <AuditStepCard
                  stepNum="5"
                  title="Net Taxable Subtotal"
                  formula={auditData.audit?.calculationSteps?.step5_taxableSubtotal?.formula || "Gross Value - Total Discount"}
                  value={`₹${formatCurrency(auditData.audit?.calculationSteps?.step5_taxableSubtotal?.value ?? auditData.rawInvoice?.totals?.subtotal ?? 0)}`}
                  color="bg-emerald-50 border-emerald-200 text-emerald-900"
                  highlight
                />

                {/* Step 6: GST Taxation Audit */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>6. Applicable GST Taxation (3%)</span>
                    <span className="font-mono text-sm text-[#5D3354]">₹{formatCurrency(auditData.audit?.calculationSteps?.step6_taxation?.gstTotal ?? auditData.rawInvoice?.totals?.gst ?? 0)}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">3% applied on Net Taxable Subtotal</p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2 bg-white rounded border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">CGST 1.5%</span>
                      <span className="text-xs font-mono font-bold text-slate-800">
                        ₹{formatCurrency(auditData.audit?.calculationSteps?.step6_taxation?.cgst1_5 ?? auditData.rawInvoice?.totals?.cgst ?? 0)}
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">SGST 1.5%</span>
                      <span className="text-xs font-mono font-bold text-slate-800">
                        ₹{formatCurrency(auditData.audit?.calculationSteps?.step6_taxation?.sgst1_5 ?? auditData.rawInvoice?.totals?.sgst ?? 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step 7: Grand Total */}
                <AuditStepCard
                  stepNum="7"
                  title="Invoice Grand Total"
                  formula={auditData.audit?.calculationSteps?.step7_grandTotal?.formula || "Taxable Subtotal + GST"}
                  value={`₹${formatCurrency(auditData.audit?.calculationSteps?.step7_grandTotal?.value ?? auditData.rawInvoice?.totals?.grandTotal ?? 0)}`}
                  color="bg-slate-900 text-white border-slate-800"
                  highlight
                />

                {/* Step 8: Settlement Mode */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-slate-900/10 flex items-center justify-center text-[10px] font-black">8</span>
                      <span>Payment Settlement</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Mode: <span className="font-bold text-slate-800 uppercase">{auditData.payment?.mode || "CASH"}</span>
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-lg uppercase">
                    {auditData.payment?.status || "PAID"}
                  </span>
                </div>

              </div>
            </div>

            {/* 3. PER-ITEM DETAILED MATHEMATICAL FORMULAS */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-6">
              <h3 className="text-base font-bold text-[#5D3354] flex items-center gap-2">
                <Receipt size={18} /> Item-by-Item Formula & Price Breakdown ({auditData.audit?.itemsCount || 0} Items)
              </h3>

              {(auditData.audit?.items || []).map((item) => (
                <div key={item.itemIndex} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                    <div>
                      <span className="px-2 py-0.5 bg-[#5D3354] text-white text-[10px] font-bold rounded-md mr-2">
                        Item #{item.itemIndex}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                      {item.sku && <span className="text-xs text-slate-400 ml-2">(SKU: {item.sku})</span>}
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 font-medium block">Item Net Price (After Disc)</span>
                      <span className="text-lg font-black font-mono text-[#5D3354]">
                        ₹{formatCurrency(item.itemNetSubtotal || item.itemGrossTotal || 0)}
                      </span>
                    </div>
                  </div>

                  {/* FORMULAS GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    
                    {/* Metal Value Formula */}
                    <div className="p-3.5 bg-white rounded-lg border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                        <Scale size={14} /> Metal Calculation
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-1">
                        Formula: {item.metalDetails?.metalValueFormula || `${item.metalDetails?.netWeight || 0}g × ₹${item.metalDetails?.metalRate || 0}/g`}
                      </p>
                      <p className="text-sm font-bold text-slate-800 pt-1 border-t border-slate-100">
                        = ₹{formatCurrency(item.metalDetails?.metalValue || 0)}
                      </p>
                    </div>

                    {/* Diamond Component Formula */}
                    <div className="p-3.5 bg-white rounded-lg border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700">
                        <Gem size={14} /> Diamond Valuation
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-1">
                        Weight: {item.componentDetails?.totalDiamondWeight || item.diamondDetails?.totalWeightCarat || 0} ct
                      </p>
                      <p className="text-sm font-bold text-slate-800 pt-1 border-t border-slate-100">
                        = ₹{formatCurrency(item.componentDetails?.totalDiamondValue || item.diamondDetails?.totalValue || 0)}
                      </p>
                    </div>

                    {/* Stone Component Formula */}
                    <div className="p-3.5 bg-white rounded-lg border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                        <Gem size={14} /> Stone Valuation
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-1">
                        Gemstones / Stones
                      </p>
                      <p className="text-sm font-bold text-slate-800 pt-1 border-t border-slate-100">
                        = ₹{formatCurrency(item.componentDetails?.totalStoneValue || item.stoneDetails?.totalValue || 0)}
                      </p>
                    </div>

                    {/* Making Charge Formula */}
                    <div className="p-3.5 bg-white rounded-lg border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700">
                        <Hammer size={14} /> Labor / Making Fee
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-1">
                        Making Fee Chargeable
                      </p>
                      <p className="text-sm font-bold text-slate-800 pt-1 border-t border-slate-100">
                        = ₹{formatCurrency(item.makingDetails?.makingCharge || 0)}
                      </p>
                    </div>

                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

const AuditStepCard = ({ stepNum, title, formula, value, color, highlight }) => (
  <div className={`p-4 rounded-xl border ${color} space-y-1.5 transition ${highlight ? 'ring-2 ring-emerald-500/30' : ''}`}>
    <div className="flex items-center justify-between text-xs font-bold">
      <span className="flex items-center gap-1.5">
        <span className="w-5 h-5 rounded-full bg-slate-900/10 flex items-center justify-center text-[10px] font-black">{stepNum}</span>
        <span>{title}</span>
      </span>
      <span className="font-mono text-sm font-extrabold">{value}</span>
    </div>
    <p className="text-[11px] opacity-80 leading-relaxed font-mono">
      {formula}
    </p>
  </div>
);
