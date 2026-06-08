import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Printer, ArrowLeft, Edit3, Phone, ShoppingBag,
  Send, CheckCircle, RefreshCw, Gem, Diamond,
  MapPin, Mail, Clock, FileText, AlertCircle
} from "lucide-react";
import {
  getEstimate,
  markEstimateSent,
  convertEstimateToOrder,
  getEstimatePdfBlob,
  sendEstimateWhatsAppAuto,
} from "../../api/quotationApi";
import { getImageUrl } from "../../utils/getImageUrl";
import logoDark from "../../assets/nazara_logo.png";
import logoLight from "../../assets/NazaraWhite.png";



/* ───── helpers ───── */
const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d, days = 0) => {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + days);
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
};

const STATUS_COLORS = {
  DRAFT: "bg-slate-100 text-slate-600 border-slate-200",
  SENT: "bg-blue-100 text-blue-700 border-blue-200",
  ACCEPTED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  EXPIRED: "bg-orange-100 text-orange-700 border-orange-200",
  CONVERTED: "bg-indigo-100 text-indigo-700 border-indigo-200",
  CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
};


/* ───── Print stylesheet injected into head ───── */
const PRINT_STYLE = `
@media print {
  body { 
    background: white !important; 
    margin: 0 !important; 
    padding: 0 !important;
    -webkit-print-color-adjust: exact !important; 
    print-color-adjust: exact !important;
  }
  @page {
    margin: 5mm !important;
    size: A4;
  }
  
  .no-print, nav, footer, header, button, .sticky { display: none !important; }
  
  #print-area, .item-card { 
    overflow: visible !important;
    height: auto !important;
  }

  .print-container {
    padding: 0 !important;
    margin: 0 !important;
    max-width: none !important;
  }

  #print-area {
    display: block !important;
    position: static !important;
    width: 100% !important; 
    max-width: none !important;
    margin: 0 !important;
    padding: 5mm !important; 
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    background: white !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  
  .item-card {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    margin-bottom: 12px !important;
    border: 1px solid #94a3b8 !important;
    display: block !important;
  }

  table {
    width: 100% !important;
    border-collapse: collapse !important;
    page-break-inside: auto;
  }
  
  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }
}
`;

/* ═══════════════════════════════════════════════════════════════ */
/*  PRINT DOCUMENT (what actually comes out on paper / PDF)       */
/* ═══════════════════════════════════════════════════════════════ */
function PrintDocument({ q }) {
  const validUntil = fmtDate(q.createdAt, q.validDays || 7);
  const issueDate = fmtDate(q.createdAt);

  return (
    <div id="print-area" className="print-area bg-white text-gray-900 rounded-2xl shadow-2xl border border-slate-300 overflow-hidden mx-auto" style={{ maxWidth: 820, fontFamily: "'Inter', sans-serif" }}>
      {/* ── HEADER ── */}
      <div style={{ background: "#5A374F", color: "white", padding: "6px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>

          <div>
            <img src={logoLight} alt="Nazara Diamonds" style={{ height: 50, objectFit: "contain" }} />
          </div>
          <div style={{ textAlign: "right" }}>
            <h1 style={{ fontSize: 11, fontWeight: 900, letterSpacing: "2px", margin: "0 0 1px", color: "white", opacity: 0.8 }}>ESTIMATE</h1>
            <p style={{ fontSize: 16, fontWeight: 900, fontFamily: "monospace", margin: "0 0 4px", color: "#f5f0f5ff" }}>{q.quotationNo}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, marginTop: 1 }}>
              <p style={{ fontSize: 9, fontWeight: 600, margin: 0, color: "white" }}>
                <span style={{ opacity: 0.6 }}>Issued Date:</span> {issueDate}
              </p>
              <p style={{ fontSize: 9, fontWeight: 600, margin: 0, color: "white" }}>
                <span style={{ opacity: 0.6 }}>Valid Until:</span> {validUntil}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── CUSTOMER TABLE ── */}
      <div style={{ padding: "8px 15px 0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "2px solid #5A374F", borderRadius: 8, overflow: "hidden" }}>
          <thead>
            <tr style={{ background: "#5A374F", color: "white" }}>
              <th colSpan={2} style={{ padding: "6px 15px", textAlign: "left", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "2px", color: "white" }}>
                Client Information
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "4px 12px", borderBottom: "1px solid #e2e8f0", width: "130px", fontSize: 9, fontWeight: 700, color: "#64748b", background: "#f8fafc" }}>CUSTOMER NAME</td>
              <td style={{ padding: "4px 12px", borderBottom: "1px solid #e2e8f0", fontSize: 12, fontWeight: 800, color: "#0f172a" }}>{q.customerName}</td>
            </tr>
            {q.mobile && (
              <tr>
                <td style={{ padding: "4px 12px", borderBottom: "1px solid #e2e8f0", fontSize: 9, fontWeight: 700, color: "#64748b", background: "#f8fafc" }}>PHONE NUMBER</td>
                <td style={{ padding: "4px 12px", borderBottom: "1px solid #e2e8f0", fontSize: 11, color: "#334155", fontWeight: 700 }}>📞 {q.mobile}</td>
              </tr>
            )}
            {q.email && (
              <tr>
                <td style={{ padding: "4px 12px", borderBottom: "1px solid #e2e8f0", fontSize: 9, fontWeight: 700, color: "#64748b", background: "#f8fafc" }}>EMAIL ADDRESS</td>
                <td style={{ padding: "4px 12px", borderBottom: "1px solid #e2e8f0", fontSize: 11, color: "#334155", fontWeight: 700 }}>✉ {q.email}</td>
              </tr>
            )}
            {q.address && (
              <tr>
                <td style={{ padding: "4px 12px", fontSize: 9, fontWeight: 700, color: "#64748b", background: "#f8fafc" }}>ADDRESS</td>
                <td style={{ padding: "4px 12px", fontSize: 11, color: "#334155", fontWeight: 500 }}>📍 {q.address}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── ITEMS ── */}
      <div style={{ padding: "6px 15px" }}>
        {(q.items || []).map((item, idx) => {
          const b = item.breakup || {};
          return (
            <div key={idx} className="item-card" style={{ marginBottom: 6, border: "1px solid #94a3b8", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ background: "#5A374F", color: "white", padding: "4px 15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 5, background: "rgba(116, 85, 131, 0.81)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#e4e1f2ff" }}>
                    {idx + 1}
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 12 }}>{item.title || "Jewellery Item"}</span>
                </div>
                <span style={{ fontWeight: 800, fontSize: 13, color: "#ebe9f3ff", fontFamily: "monospace" }}>₹{fmt(b.grandTotal)}</span>
              </div>

              {/* Product Images */}
              {item.images && item.images.length > 0 && (
                <div style={{ padding: "6px 15px", background: "#fff", display: "flex", gap: 6, borderBottom: "1px solid #f3f4f6" }}>
                  {item.images.slice(0, 4).map((img, i) => (
                    <div key={i} style={{ width: 55, height: 55, borderRadius: 6, overflow: "hidden", border: "1px solid #e5e7eb" }}>
                      <img
                        src={getImageUrl(img.url || img)}
                        alt={`Product ${i + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Breakdown Table */}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #94a3b8" }}>
                    <th style={{ textAlign: "left", padding: "6px 15px", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 10 }}>Specification</th>
                    <th style={{ textAlign: "center", padding: "6px 15px", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 10 }}>Detail</th>
                    <th style={{ textAlign: "right", padding: "6px 15px", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 10 }}>Value</th>
                  </tr>
                </thead>
                <tbody style={{ color: "#334155" }}>
                  {/* Metal */}
                  <tr style={{ borderBottom: "1px solid #cbd5e1" }}>
                    <td style={{ padding: "6px 15px", fontWeight: 600 }}>{item.metalType} ({item.metalPurity})</td>
                    <td style={{ padding: "6px 15px", textAlign: "center", color: "#64748b" }}>{item.netWeight}gm × ₹{fmt(b.metalRate)}/gm</td>
                    <td style={{ padding: "6px 15px", textAlign: "right", fontWeight: 700 }}>₹{fmt(b.metalValue)}</td>
                  </tr>

                  {/* Diamonds & Gemstones */}
                  {(b.componentBreakup || []).filter(cb => cb.pricingRef !== "BELT").map((cb, cIdx) => (
                    <tr key={cIdx} style={{ borderBottom: "1px solid #cbd5e1" }}>
                      <td style={{ padding: "6px 15px", textTransform: "uppercase", fontSize: 10 }}>
                        {cb.type} {cb.shape && `— ${cb.shape}`} {cb.color && `${cb.color}`} {cb.clarity && `${cb.clarity}`}
                      </td>
                      <td style={{ padding: "6px 15px", textAlign: "center", color: "#64748b" }}>
                        {cb.count} pc × {cb.weight}ct
                      </td>
                      <td style={{ padding: "6px 15px", textAlign: "right", fontWeight: 700 }}>₹{fmt(cb.value)}</td>
                    </tr>
                  ))}

                  {/* Accessories (Belts) */}
                  {(b.componentBreakup || []).filter(cb => cb.pricingRef === "BELT").length > 0 && (
                    <>
                      <tr style={{ background: "#f1f5f9", borderBottom: "1px solid #cbd5e1" }}>
                        <td colSpan={3} style={{ padding: "4px 15px", color: "#5A374F", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          Accessories
                        </td>
                      </tr>
                      {(b.componentBreakup || []).filter(cb => cb.pricingRef === "BELT").map((cb, cIdx) => (
                        <tr key={`belt-${cIdx}`} style={{ borderBottom: "1px solid #cbd5e1" }}>
                          <td style={{ padding: "6px 15px", fontSize: 10 }}>
                            Belt {cb.category ? `(${cb.category})` : ""} {cb.shape ? `— ${cb.shape}` : ""} {cb.size ? `| Size: ${cb.size}` : ""}
                          </td>
                          <td style={{ padding: "6px 15px", textAlign: "center", color: "#64748b" }}>
                            {cb.count} pcs × ₹{fmt(cb.value / (cb.count || 1))}
                          </td>
                          <td style={{ padding: "6px 15px", textAlign: "right", fontWeight: 700 }}>₹{fmt(cb.value)}</td>
                        </tr>
                      ))}
                    </>
                  )}

                  {/* Summary Rows */}
                  {b.diamondValue > 0 && (
                    <tr style={{ borderBottom: "1px solid #cbd5e1", background: "#fdfdfd" }}>
                      <td colSpan={2} style={{ padding: "4px 15px", color: "#64748b", fontSize: 10 }}>Diamond Value</td>
                      <td style={{ padding: "4px 15px", textAlign: "right", fontWeight: 700, fontSize: 11 }}>₹{fmt(b.diamondValue)}</td>
                    </tr>
                  )}
                  {b.stoneValue > 0 && (
                    <tr style={{ borderBottom: "1px solid #cbd5e1", background: "#fdfdfd" }}>
                      <td colSpan={2} style={{ padding: "4px 15px", color: "#64748b", fontSize: 10 }}>Stone Value</td>
                      <td style={{ padding: "4px 15px", textAlign: "right", fontWeight: 700, fontSize: 11 }}>₹{fmt(b.stoneValue)}</td>
                    </tr>
                  )}
                  {b.accessoryValue > 0 && (
                    <tr style={{ borderBottom: "1px solid #cbd5e1", background: "#fdfdfd" }}>
                      <td colSpan={2} style={{ padding: "4px 15px", color: "#64748b", fontSize: 10 }}>Accessories Value</td>
                      <td style={{ padding: "4px 15px", textAlign: "right", fontWeight: 700, fontSize: 11 }}>₹{fmt(b.accessoryValue)}</td>
                    </tr>
                  )}
                  <tr style={{ borderBottom: "1px solid #cbd5e1", background: "#fdfdfd" }}>
                    <td colSpan={2} style={{ padding: "4px 15px", color: "#64748b", fontSize: 10 }}>Making Charges</td>
                    <td style={{ padding: "4px 15px", textAlign: "right", fontWeight: 700, fontSize: 11 }}>₹{fmt(b.makingCharge)}</td>
                  </tr>

                  {/* Totals within item */}
                  <tr style={{ background: "#f8fafc" }}>
                    <td colSpan={2} style={{ padding: "6px 15px", fontWeight: 700 }}>Subtotal</td>
                    <td style={{ padding: "6px 15px", textAlign: "right", fontWeight: 800 }}>₹{fmt(b.subtotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} style={{ padding: "4px 15px", fontSize: 10, color: "#64748b" }}>GST ({b.gstPercent}%)</td>
                    <td style={{ padding: "4px 15px", textAlign: "right", fontSize: 10, color: "#64748b" }}>+₹{fmt(b.gst)}</td>
                  </tr>
                  <tr style={{ background: "#f1f5f9" }}>
                    <td colSpan={2} style={{ padding: "8px 15px", fontWeight: 800, color: "#5A374F", fontSize: 11 }}>Item Total (incl. GST)</td>
                    <td style={{ padding: "8px 15px", textAlign: "right", fontWeight: 900, fontSize: 14, color: "#5A374F", fontFamily: "monospace" }}>₹{fmt(b.grandTotal)}</td>
                  </tr>

                </tbody>
              </table>
            </div>
          );
        })}

        {/* ── FINAL SUMMARY ── */}
        <div style={{ marginTop: 8, borderTop: "2px solid #94a3b8", paddingTop: 8 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
            <div style={{ width: 220 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <span style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>Total Value</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>₹{fmt(q.subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>Tax Amount (GST)</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>+₹{fmt(q.gstTotal)}</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 15px", background: "#5A374F", borderRadius: 10, color: "white" }}>
            <span style={{ fontSize: 14, fontWeight: 900, letterSpacing: "1px" }}>GRAND TOTAL</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#efebe0ff" }}>₹{fmt(q.grandTotal)}</span>
          </div>
        </div>
      </div>



      {/* ── NOTES ── */}
      {q.notes && (
        <div style={{ padding: "0 30px 4px" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Notes</p>
          <p style={{ fontSize: 12, color: "#374151", background: "#f9fafb", borderRadius: 6, padding: "8px 12px", border: "1px solid #94a3b8" }}>{q.notes}</p>
        </div>
      )}

      {/* ── IMPORTANT NOTES ── */}
      <div style={{ padding: "0 30px 10px" }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Important Notes</p>
        <ol style={{ fontSize: 10, color: "#6b7280", lineHeight: 1.4, paddingLeft: 15, margin: 0 }}>
          <li>Gold / metal rates are subject to market fluctuation and may change without notice.</li>
          <li>Diamond and stone rates are indicative. Final rate on actual measurement at delivery.</li>
          <li>IGI / GIA certification charges, if required, are not included in this estimate.</li>
          <li>GST @ 3% has been included as applicable on jewellery.</li>
          <li>This estimate is valid until <strong>{validUntil}</strong>.</li>
          <li>50% advance payment required to confirm order.</li>
        </ol>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ padding: "6px 30px", borderTop: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 9, color: "#64748b" }}>
        <p style={{ margin: 0 }}>Generated via <strong>Nazara Erp</strong></p>
        <p style={{ margin: 0, fontWeight: 700 }}>Thank you for choosing NAZARA DIAMONDS 💎</p>
      </div>


    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  MAIN PAGE                                                      */
/* ═══════════════════════════════════════════════════════════════ */
export default function EstimatePreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [q, setQ] = useState(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [whatsAppLoading, setWhatsAppLoading] = useState(false);
  const printStyleRef = useRef(null);

  /* Inject print CSS */
  useEffect(() => {
    if (typeof PRINT_STYLE === 'undefined') return;
    const style = document.createElement("style");
    style.innerHTML = PRINT_STYLE;
    document.head.appendChild(style);
    printStyleRef.current = style;
    return () => {
      if (style && style.parentNode) {
        document.head.removeChild(style);
      }
    };
  }, []);

  /* Load data */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getEstimate(id);
        setQ(res.data.quotation);
      } catch {
        toast.error("Failed to load estimate");
        navigate("/quotations");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  /* ── HANDLERS ── */
  const handlePrint = () => window.print();

  const handleMarkSent = async () => {
    try {
      await markEstimateSent(id);
      toast.success("Marked as Sent");
      setQ((prev) => ({ ...prev, status: "SENT" }));
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed");
    }
  };

  const handleConvert = () => {
    if (!q || q.items.length === 0) {
      toast.error("No items to convert");
      return;
    }

    // Prepare data for Order Form
    const firstItem = q.items[0];

    // Convert estimate item structure to order form structure
    const initialProduct = {
      title: firstItem.title,
      jewelleryCategory: firstItem.jewelleryCategory,
      description: firstItem.description,
      metalType: firstItem.metalType,
      metalPurity: firstItem.metalPurity,
      netWeight: firstItem.netWeight,
      grossWeight: firstItem.grossWeight,
      images: firstItem.images || [],
      components: firstItem.components || [],
    };

    const customer = {
      name: q.customerName,
      mobile: q.mobile,
      email: q.email,
      address: q.address,
    };

    navigate("/orders/new", {
      state: {
        initialProduct,
        customer,
        convertedFromEstimateId: id // Keep track of the source
      }
    });
  };

  const handleWhatsApp = async () => {
    if (whatsAppLoading) return;
    setWhatsAppLoading(true);
    try {
      const res = await sendEstimateWhatsAppAuto(id);

      if (res.data?.success) {
        // ✅ AiSensy sent it directly
        toast.success(`📲 Estimate PDF sent to customer's WhatsApp!`);
        if (q.status === "DRAFT") {
          try { await markEstimateSent(id); } catch (_) {}
          setQ((prev) => ({ ...prev, status: "SENT" }));
        }
        return;
      }

      if (res.data?.canFallback) {
        // ⚠️ AiSensy unavailable (e.g. localhost) — fall back to download + WhatsApp text
        toast.info("Direct send unavailable. Downloading PDF to share manually…", { duration: 4000 });

        // 1. Download the PDF
        const pdfRes = await getEstimatePdfBlob(id);
        const blob = new Blob([pdfRes.data], { type: "application/pdf" });
        const safeNo = (q?.quotationNo || id).replace(/[/\\:*?"<>|]/g, "-");
        const filename = `Estimate-${safeNo}.pdf`;
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(blobUrl);

        // 2. Open WhatsApp with a pre-filled message
        setTimeout(() => {
          const mobile = (q?.mobile || "").replace(/\D/g, "");
          const finalMobile = mobile.length === 10 ? `91${mobile}` : mobile;
          const amount = fmt(q?.grandTotal);
          const text =
            `✨ *ESTIMATE: ${q?.quotationNo}* ✨\n\nनमस्ते *${q?.customerName || "Customer"}*,` +
            `\n\nआपके गहनों का एस्टीमेट तैयार है।\n*कुल: ₹${amount}*` +
            `\n\nकृपया संलग्न PDF देखें।\n\n💎 *Nazara Diamonds*`;
          const waUrl = finalMobile
            ? `https://wa.me/${finalMobile}?text=${encodeURIComponent(text)}`
            : `https://wa.me/?text=${encodeURIComponent(text)}`;
          window.open(waUrl, "_blank");
        }, 600);

        toast.success("PDF downloaded! Attach it in the WhatsApp chat that just opened.", { duration: 6000 });
        return;
      }

      toast.error(res.data?.error || "Failed to send WhatsApp");
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || "Failed to send WhatsApp";
      toast.error(msg);
    } finally {
      setWhatsAppLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw size={24} className="animate-spin text-indigo-600" />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* ── TOPBAR ── */}
      <div className="no-print sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/quotations")}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition border border-slate-200"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">Preview Estimate</h1>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-widest ${STATUS_COLORS[q.status] || ""}`}>
                  {q.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{q.quotationNo}</p>
            </div>

          </div>

          <div className="flex items-center gap-2">
            {/* Edit */}
            {q.status === "DRAFT" && (
              <button
                onClick={() => navigate(`/quotations/${id}/edit`)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 transition shadow-sm"
              >
                <Edit3 size={14} className="text-amber-600" />
                <span className="hidden sm:inline">Edit</span>
              </button>

            )}

            {/* Mark Sent */}
            {q.status === "DRAFT" && (
              <button
                onClick={handleMarkSent}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-sm font-bold transition shadow-sm"
              >
                <Send size={14} />
                <span className="hidden sm:inline">Mark Sent</span>
              </button>
            )}


            {/* WhatsApp */}
            <button
              onClick={handleWhatsApp}
              disabled={whatsAppLoading}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-sm font-bold transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {whatsAppLoading
                ? <RefreshCw size={14} className="animate-spin" />
                : <Phone size={14} />}
              <span className="hidden sm:inline">{whatsAppLoading ? "Generating…" : "WhatsApp"}</span>
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 transition shadow-sm"
            >
              <Printer size={14} className="text-slate-500" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>


            {/* Convert to Order */}
            {q.status !== "CONVERTED" && q.status !== "CANCELLED" && (
              <button
                onClick={handleConvert}
                disabled={converting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black transition shadow-lg shadow-indigo-200 disabled:opacity-50"
              >
                <ShoppingBag size={14} />
                {converting ? "Converting…" : "Convert to Order"}
              </button>
            )}

          </div>
        </div>
      </div>

      {/* ── METADATA STRIP ── */}
      <div className="no-print max-w-5xl mx-auto px-4 sm:px-6 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: FileText, label: "Estimate No", value: q.quotationNo },
            { icon: Clock, label: "Issued On", value: fmtDate(q.createdAt) },
            { icon: Clock, label: "Valid Until", value: fmtDate(q.createdAt, q.validDays || 7) },
            { icon: CheckCircle, label: "Status", value: q.status },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon size={12} className="text-indigo-600" />
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{label}</span>
              </div>
              <p className="text-sm font-black text-slate-900">{value}</p>
            </div>
          ))}

        </div>
      </div>

      {/* ── CONVERTED BANNER ── */}
      {q.status === "CONVERTED" && (
        <div className="no-print max-w-5xl mx-auto px-4 sm:px-6 pb-4">
          <div className="flex items-center gap-3 bg-violet-500/10 border border-violet-500/30 rounded-xl px-4 py-3">
            <CheckCircle size={16} className="text-violet-400 shrink-0" />
            <p className="text-sm text-violet-300">
              This estimate has been converted to an order.
            </p>
          </div>
        </div>
      )}

      {/* ── PRINT DOCUMENT ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12 print-container">
        <PrintDocument q={q} />
      </div>
    </div>
  );
}
