import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Package, RefreshCw, CreditCard,
  Gem, Layers, Wrench, Percent, ToggleRight, FileText,
  CheckCircle2, ChevronRight, Zap, DollarSign, BarChart3
} from "lucide-react";
import toast from "react-hot-toast";
import "./AdjustmentWizard.css";
import { useModal } from "../../context/ModalContext";

/* ─────────────────────────────────────────────────────────────── */
/*  PURE CALCULATION (mirrors backend return.adjustment.js)        */
/* ─────────────────────────────────────────────────────────────── */
const PURITY_FACTORS = {
  "24KT": 1, "22KT": 0.916, "18KT": 0.75, "14KT": 0.585,
  "10KT": 0.417, "9KT": 0.375, "999": 1, "925": 0.925,
  "835": 0.835, "800": 0.8, "950": 1, "900": 0.947,
};
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

function computeAdjustment(breakdown, adj, rates) {
  const {
    useLatestMetalRate = true, diamondPercent = 100, stonePercent = 100,
    makingOption = "keep", makingCustomValue = 0, includeGST = true,
  } = adj;

  let metalAdj;
  if (useLatestMetalRate) {
    const nw = Number(breakdown.netWeight || 0);
    const pk = String(breakdown.metalPurity || "").toUpperCase().replace(/\s/g, "");
    const pf = PURITY_FACTORS[pk] || 0;
    const metalType = (breakdown.metalType || "").toLowerCase();
    const base = metalType.includes("silver") ? (rates.silver999 || 0)
      : metalType.includes("platinum") ? (rates.platinum950 || 0)
        : (rates.gold24KT || 0);
    metalAdj = r2(nw * base * pf);
  } else {
    metalAdj = r2(breakdown.metal || 0);
  }
  const { showConfirm, showAlert } = useModal();

  const diamondAdj = r2((breakdown.diamond || 0) * (Number(diamondPercent) / 100));
  const stoneAdj = r2((breakdown.stone || 0) * (Number(stonePercent) / 100));

  let makingAdj;
  if (makingOption === "remove") makingAdj = 0;
  else if (makingOption === "custom") makingAdj = r2(Number(makingCustomValue) || 0);
  else makingAdj = r2(breakdown.making || 0);

  // Apply discount logic
  const totalDiscount = r2(
    (breakdown.discountDiamond || 0) +
    (breakdown.discountStone || 0) +
    (breakdown.discountMaking || 0) || (breakdown.discount || 0)
  );
  const discountAdj = adj.discountMode === "remove" ? 0 : totalDiscount;

  const grossSubtotal = r2(metalAdj + diamondAdj + stoneAdj + makingAdj);
  const netSubtotal = r2(grossSubtotal - discountAdj);

  const gstRate = Number(rates.gstRate || breakdown.gstRate || 3);
  const gstAdj = includeGST ? r2((netSubtotal * gstRate) / 100) : 0;
  const finalAmount = r2(netSubtotal + gstAdj);

  return {
    adjustedValues: { metal: metalAdj, diamond: diamondAdj, stone: stoneAdj, making: makingAdj, discount: discountAdj, gst: gstAdj },
    finalAmount,
    diff: r2(finalAmount - (breakdown.total || 0)),
  };
}

function extractBreakdown(item) {
  // Support both cart items (PRODUCT) and custom/order items (CUSTOM)
  const b = item?.breakup || item?.customSnapshot?.pricingSnapshot || {};
  const pd = item?.itemSnapshot?.productDetails ||
    item?.customSnapshot?.productDetails || {};
  return {
    // Component values at time of sale
    metal: r2(b.metalValue || 0),
    diamond: r2(b.diamondValue || 0),
    stone: r2(b.stoneValue || 0),
    making: r2(b.makingCharge || 0),
    gst: r2(b.gst || 0),
    total: r2(b.grandTotal || 0),
    // Original discounts applied at sale
    discountDiamond: r2(b.discountDiamond || 0),
    discountStone: r2(b.discountStone || 0),
    discountMaking: r2(b.discountMaking || 0),
    discount: r2(b.discount || 0),
    // Metal info
    netWeight: Number(pd.netWeight || 0),
    metalType: pd.metalType || b.metalType || "",
    metalPurity: pd.metalPurity || b.metalPurity || "",
    // Original locked metal rate at time of sale
    originalMetalRate: r2(b.metalRate || b.metalRateLocked || 0),
    gstRate: Number(b.gstPercent || 3),
  };
}

/* ─────────────────────────────────────────────────────────────── */
/*  DEFAULT ADJUSTMENT STATE                                        */
/* ─────────────────────────────────────────────────────────────── */
const DEFAULT_ADJ = {
  useLatestMetalRate: true,
  diamondPercent: 100,
  stonePercent: 100,
  makingOption: "keep",
  makingCustomValue: 0,
  includeGST: true,
  discountMode: "keep",
};

/* ─────────────────────────────────────────────────────────────── */
/*  PRESETS                                                         */
/* ─────────────────────────────────────────────────────────────── */
const PRESETS = [
  { label: "Full Value", adj: { ...DEFAULT_ADJ } },
  { label: "Standard", adj: { ...DEFAULT_ADJ, diamondPercent: 80, stonePercent: 70, makingOption: "remove" } },
  { label: "Metal Only", adj: { ...DEFAULT_ADJ, diamondPercent: 0, stonePercent: 0, makingOption: "remove", includeGST: false } },
  { label: "No Making / GST", adj: { ...DEFAULT_ADJ, makingOption: "remove", includeGST: false } },
];

/* ─────────────────────────────────────────────────────────────── */
/*  DIFF CELL HELPER                                                */
/* ─────────────────────────────────────────────────────────────── */
function DiffBadge({ old: o, new: n }) {
  const d = r2(n - o);
  if (Math.abs(d) < 0.01) return <span className="aw-diff zero">—</span>;
  return (
    <span className={`aw-diff ${d > 0 ? "positive" : "negative"}`}>
      {d > 0 ? "+" : ""}₹{Math.abs(d).toLocaleString("en-IN")}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  STEP INDICATOR                                                  */
/* ─────────────────────────────────────────────────────────────── */
const STEP_LABELS = ["Select Item", "Return Type", "Adjustment"];

function StepBar({ current }) {
  return (
    <div className="aw-steps">
      {STEP_LABELS.map((label, i) => {
        const state = i < current ? "done" : i === current ? "active" : "";
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
            <div className={`aw-step ${state}`} style={{ flex: "0 0 auto" }}>
              <div className="aw-step-dot">
                {i < current ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              <span className="aw-step-label" style={{ whiteSpace: "nowrap" }}>{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`aw-step-line ${i < current ? "done" : ""}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  MAIN COMPONENT                                                  */
/* ─────────────────────────────────────────────────────────────── */
export default function CreateReturn() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { showConfirm, showAlert } = useModal();
  /* state */
  const [step, setStep] = useState(0);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedItemIdx, setSelectedItemIdx] = useState(null);
  const [returnType, setReturnType] = useState("refund");
  const [reason, setReason] = useState("");
  const [adj, setAdj] = useState({ ...DEFAULT_ADJ });
  const [activePreset, setActivePreset] = useState(0);
  const [latestRates, setLatestRates] = useState({ gold24KT: 0, silver999: 0, platinum950: 0, gstRate: 3 });

  /* ── Load invoice + rates ── */
  useEffect(() => {
    const load = async () => {
      try {
        const [invRes, rateRes] = await Promise.all([
          axios.get(`/api/sales-invoices/${invoiceId}`),
          axios.get("/api/admin/rates/active"),
        ]);
        setInvoice(invRes.data.invoice || invRes.data);
        const rc = rateRes.data?.rates || rateRes.data;
        setLatestRates({
          gold24KT: rc?.gold24KT || 0,
          silver999: rc?.silver999 || 0,
          platinum950: rc?.platinum950 || 0,
          gstRate: rc?.gstRate || 3,
        });
      } catch (err) {
        toast.error("Failed to load invoice or rates");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [invoiceId]);

  /* ── Derived: selected item + breakdown ── */
  const selectedItem = selectedItemIdx !== null ? invoice?.items?.[selectedItemIdx] : null;
  const breakdown = selectedItem ? extractBreakdown(selectedItem) : null;
  const { adjustedValues, finalAmount, diff } = breakdown
    ? computeAdjustment(breakdown, adj, latestRates)
    : { adjustedValues: {}, finalAmount: 0, diff: 0 };

  /* ── Preset handler ── */
  const applyPreset = useCallback((idx) => {
    setActivePreset(idx);
    setAdj({ ...PRESETS[idx].adj });
  }, []);

  /* ── Submit ── */
  // const submitReturn = async () => {
  //   if (selectedItemIdx === null) return toast.error("Select an item");
  //   if (!reason.trim()) return toast.error("Please enter a reason");
  //   setSubmitting(true);
  //   try {
  //     await axios.post("/api/returns", {
  //       invoiceId,
  //       invoiceItemIndex: selectedItemIdx,
  //       returnType,
  //       reason,
  //       adjustments: adj,
  //     });
  //     toast.success(returnType === "exchange"
  //       ? "Exchange initiated — credit note will be generated on approval"
  //       : "Refund return created successfully"
  //     );
  //     navigate("/returns");
  //   } catch (err) {
  //     console.error(err);
  //     toast.error(err.response?.data?.message || "Failed to create return");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };


  const submitReturn = async () => {
    if (selectedItemIdx === null) {
      toast.error("Select an item");
      return;
    }

    if (!reason.trim()) {
      showAlert("Reason for return is required");
      return;
    }

    // 🔥 CUSTOM CONFIRM (cart jaisa)
    // const ok = await showConfirm(
    //   returnType === "exchange"
    //     ? "Are you sure you want to initiate exchange?"
    //     : "Are you sure you want to initiate refund?"
    // );

    // if (!ok) return;

    setSubmitting(true);

    try {
      await axios.post("/api/returns", {
        invoiceId,
        invoiceItemIndex: selectedItemIdx,
        returnType,
        reason,
        adjustments: adj,
      });

      toast.success(
        returnType === "exchange"
          ? "Exchange initiated — credit note will be generated on approval"
          : "Refund return created successfully"
      );

      navigate("/returns");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create return");
    } finally {
      setSubmitting(false);
    }
  };


  /* ── Loading / Error ── */
  if (loading) return (
    <div className="aw-page">
      <div className="aw-inner" style={{ textAlign: "center", paddingTop: 80 }}>
        <div className="spinner" />
        <p style={{ marginTop: 16, color: "var(--text-muted)", fontFamily: "Inter,sans-serif" }}>Loading invoice…</p>
      </div>
    </div>
  );
  if (!invoice?.items) return (
    <div className="aw-page">
      <div className="aw-inner">
        <div style={{ background: "#fdecea", borderRadius: 12, padding: "20px 24px", color: "#c0392b", fontFamily: "Inter,sans-serif" }}>
          Invoice not found or no items available.
        </div>
      </div>
    </div>
  );

  /* ── RENDER ── */
  return (
    <div className="aw-page">
      <div className="aw-inner">

        {/* Header */}
        <div className="aw-header">
          <button className="aw-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} /> Back
          </button>
          <div className="aw-header-text">
            <h1>Initiate Return</h1>
            <p>Invoice #{invoice.invoiceNo} · {invoice.customer?.name}</p>
          </div>
        </div>

        {/* Step Bar */}
        <StepBar current={step} />

        <AnimatePresence mode="wait">

          {/* ══════════════════════════════════════════════════ */}
          {/* STEP 0 — SELECT ITEM                              */}
          {/* ══════════════════════════════════════════════════ */}
          {step === 0 && (
            <motion.div key="step0"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <div className="aw-card">
                <h2 className="aw-card-title"><Package size={18} /> Select Item to Return</h2>
                <div className="aw-item-grid">
                  {invoice.items.map((item, idx) => {
                    const pd = item.itemSnapshot?.productDetails || item.customSnapshot?.productDetails || {};
                    const b = item.breakup || {};
                    const total = r2(b.grandTotal || 0);
                    return (
                      <div
                        key={idx}
                        className={`aw-item-card ${selectedItemIdx === idx ? "selected" : ""}`}
                        onClick={() => setSelectedItemIdx(idx)}
                      >
                        <div className="aw-item-card-left">
                          <h4>{pd.title || pd.name || `Item ${idx + 1}`}</h4>
                          <p>
                            {pd.metalType && <span>{pd.metalType}</span>}
                            {pd.metalPurity && <span>{pd.metalPurity}</span>}
                            {pd.netWeight > 0 && <span>{pd.netWeight}g</span>}
                            {b.metalValue > 0 && <span>Metal ₹{r2(b.metalValue).toLocaleString("en-IN")}</span>}
                            {b.diamondValue > 0 && <span>Diamond ₹{r2(b.diamondValue).toLocaleString("en-IN")}</span>}
                          </p>
                        </div>
                        <div className="aw-item-card-right">
                          <div className="aw-item-price">₹{total.toLocaleString("en-IN")}</div>
                          <div className="aw-item-label">Invoice Value</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="aw-nav">
                <span />
                <button className="aw-btn primary" disabled={selectedItemIdx === null} onClick={() => setStep(1)}>
                  Next <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════ */}
          {/* STEP 1 — RETURN TYPE                              */}
          {/* ══════════════════════════════════════════════════ */}
          {step === 1 && (
            <motion.div key="step1"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <div className="aw-card">
                <h2 className="aw-card-title"><Layers size={18} /> Choose Return Type</h2>
                <div className="aw-type-grid">
                  <div
                    className={`aw-type-card refund ${returnType === "refund" ? "selected" : ""}`}
                    onClick={() => setReturnType("refund")}
                  >
                    <div className="aw-type-icon"><DollarSign size={26} /></div>
                    <h3>Refund</h3>
                    <p>Return money directly to the customer via cash, UPI, or bank transfer. No credit note is generated.</p>
                    <span className="aw-type-badge">Direct Payment</span>
                  </div>
                  <div
                    className={`aw-type-card exchange ${returnType === "exchange" ? "selected" : ""}`}
                    onClick={() => setReturnType("exchange")}
                  >
                    <div className="aw-type-icon"><RefreshCw size={26} /></div>
                    <h3>Exchange</h3>
                    <p>Issue a Credit Note for store credit. Customer selects a new product and the credit is applied at billing.</p>
                    <span className="aw-type-badge">Credit Note</span>
                  </div>
                </div>
              </div>
              <div className="aw-nav">
                <button className="aw-btn secondary" onClick={() => setStep(0)}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button className="aw-btn primary" onClick={() => setStep(2)}>
                  Next <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════ */}
          {/* STEP 2 — ADJUSTMENT ENGINE                        */}
          {/* ══════════════════════════════════════════════════ */}
          {step === 2 && breakdown && (
            <motion.div key="step2"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              {/* ── Metal Rate Comparison Card ── */}
              {(() => {
                const metalType = (breakdown.metalType || "").toLowerCase();
                const todayBase = metalType.includes("silver") ? latestRates.silver999
                  : metalType.includes("platinum") ? latestRates.platinum950
                    : latestRates.gold24KT;
                const purityKey = String(breakdown.metalPurity || "").toUpperCase().replace(/\s/g, "");
                const pfMap = { "24KT": 1, "22KT": 0.916, "18KT": 0.75, "14KT": 0.585, "10KT": 0.417, "9KT": 0.375, "999": 1, "925": 0.925, "835": 0.835, "800": 0.8, "950": 1, "900": 0.947 };
                const pf = pfMap[purityKey] || 0;
                const todayEffective = r2((todayBase || 0) * pf);
                const origEffective = r2(breakdown.originalMetalRate || 0);
                const nw = breakdown.netWeight || 0;
                const origMetalVal = r2((origEffective || 0) * nw);
                const todayMetalVal = r2(todayEffective * nw);
                const diff = r2(todayMetalVal - origMetalVal);
                const hasMetal = nw > 0 && todayBase > 0;
                return (
                  <div style={{
                    background: "linear-gradient(135deg,#1a0e14,#2d1520)",
                    borderRadius: 14, padding: "20px 22px", marginBottom: 16,
                    fontFamily: "Inter,sans-serif"
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>
                      🔩 Metal Rate Comparison — {breakdown.metalType || "Gold"} {breakdown.metalPurity} · {nw}g
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                      {/* Original rate */}
                      <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "14px 16px" }}>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Original Rate (at sale)</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "rgba(255,255,255,0.85)" }}>
                          {origEffective > 0 ? `₹${origEffective.toLocaleString("en-IN")}` : "—"}<span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>/g</span>
                        </div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
                          Metal value: {origMetalVal > 0 ? `₹${origMetalVal.toLocaleString("en-IN")}` : "—"}
                        </div>
                      </div>
                      {/* Today's rate */}
                      <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "14px 16px" }}>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Today's Rate (current)</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "#F4EBEF" }}>
                          ₹{todayEffective.toLocaleString("en-IN")}<span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>/g</span>
                        </div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
                          Metal value: {hasMetal ? `₹${todayMetalVal.toLocaleString("en-IN")}` : "—"}
                        </div>
                      </div>
                      {/* Difference */}
                      <div style={{
                        background: Math.abs(diff) < 0.01 ? "rgba(255,255,255,0.05)"
                          : diff > 0 ? "rgba(42,69,49,0.35)" : "rgba(192,57,43,0.25)",
                        borderRadius: 10, padding: "14px 16px"
                      }}>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Difference</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: diff >= 0 ? "#6fcf97" : "#eb5757" }}>
                          {hasMetal && Math.abs(diff) > 0 ? `${diff > 0 ? "+" : ""}₹${Math.abs(diff).toLocaleString("en-IN")}` : "—"}
                        </div>
                        <div style={{ fontSize: 12, marginTop: 4, color: diff > 0 ? "#6fcf97" : diff < 0 ? "#eb5757" : "rgba(255,255,255,0.35)" }}>
                          {!hasMetal ? "No metal data" : diff > 0 ? "Higher today" : diff < 0 ? "Lower today" : "Same rate"}
                        </div>
                      </div>
                    </div>
                    {/* Rate chips */}
                    <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "3px 10px" }}>Gold 24KT: ₹{latestRates.gold24KT?.toLocaleString("en-IN")}/g</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "3px 10px" }}>Silver 999: ₹{latestRates.silver999?.toLocaleString("en-IN")}/g</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "3px 10px" }}>Platinum 950: ₹{latestRates.platinum950?.toLocaleString("en-IN")}/g</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "3px 10px" }}>GST: {latestRates.gstRate}%</span>
                    </div>
                  </div>
                );
              })()}


              {/* Preset Buttons */}
              <div className="aw-card" style={{ padding: "16px 24px", marginBottom: 16 }}>
                <div className="aw-card-title"><Zap size={16} /> Quick Presets</div>
                <div className="aw-presets">
                  {PRESETS.map((p, i) => (
                    <button
                      key={i}
                      className={`aw-preset-btn ${activePreset === i ? "active" : ""}`}
                      onClick={() => applyPreset(i)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="aw-card">
                <h2 className="aw-card-title"><BarChart3 size={18} /> Adjustment Controls</h2>

                <div className="aw-controls">

                  {/* Metal Rate */}
                  <div className="aw-control-group">
                    <div className="aw-control-label"><Layers size={13} /> Metal Rate</div>
                    <div className="aw-pill-group">
                      <button
                        className={`aw-pill ${adj.useLatestMetalRate ? "active" : ""}`}
                        onClick={() => setAdj(a => ({ ...a, useLatestMetalRate: true }))}
                      >
                        Use Latest Rate
                      </button>
                      <button
                        className={`aw-pill ${!adj.useLatestMetalRate ? "active" : ""}`}
                        onClick={() => setAdj(a => ({ ...a, useLatestMetalRate: false }))}
                      >
                        Use Original
                      </button>
                    </div>
                  </div>

                  {/* Making Charge */}
                  <div className="aw-control-group">
                    <div className="aw-control-label"><Wrench size={13} /> Making Charge</div>
                    <div className="aw-pill-group">
                      {["keep", "remove", "custom"].map(opt => (
                        <button
                          key={opt}
                          className={`aw-pill ${adj.makingOption === opt ? "active" : ""}`}
                          onClick={() => setAdj(a => ({ ...a, makingOption: opt }))}
                        >
                          {opt === "keep" ? "Keep Full" : opt === "remove" ? "Remove" : "Custom"}
                        </button>
                      ))}
                    </div>
                    {adj.makingOption === "custom" && (
                      <input
                        type="number"
                        className="aw-input"
                        placeholder="Enter making charge ₹"
                        value={adj.makingCustomValue || ""}
                        onChange={e => setAdj(a => ({ ...a, makingCustomValue: e.target.value }))}
                        style={{ marginTop: 8 }}
                      />
                    )}
                  </div>

                  {/* Diamond % */}
                  <div className="aw-control-group">
                    <div className="aw-control-label"><Gem size={13} /> Diamond Adjustment</div>
                    <div className="aw-slider-row">
                      <input
                        type="range" min={0} max={100} step={5}
                        className="aw-slider"
                        value={adj.diamondPercent}
                        onChange={e => { setActivePreset(-1); setAdj(a => ({ ...a, diamondPercent: Number(e.target.value) })); }}
                      />
                      <input
                        type="number" min={0} max={100}
                        className="aw-slider-value"
                        value={adj.diamondPercent}
                        onChange={e => { setActivePreset(-1); setAdj(a => ({ ...a, diamondPercent: Math.min(100, Math.max(0, Number(e.target.value))) })); }}
                      />
                    </div>
                    <div className="aw-pill-group" style={{ marginTop: 6 }}>
                      {[100, 80, 70, 50].map(v => (
                        <button key={v} className={`aw-pill ${adj.diamondPercent === v ? "active" : ""}`}
                          onClick={() => { setActivePreset(-1); setAdj(a => ({ ...a, diamondPercent: v })); }}
                        >{v}%</button>
                      ))}
                    </div>
                  </div>

                  {/* Stone % */}
                  <div className="aw-control-group">
                    <div className="aw-control-label"><Gem size={13} /> Stone Adjustment</div>
                    <div className="aw-slider-row">
                      <input
                        type="range" min={0} max={100} step={5}
                        className="aw-slider"
                        value={adj.stonePercent}
                        onChange={e => { setActivePreset(-1); setAdj(a => ({ ...a, stonePercent: Number(e.target.value) })); }}
                      />
                      <input
                        type="number" min={0} max={100}
                        className="aw-slider-value"
                        value={adj.stonePercent}
                        onChange={e => { setActivePreset(-1); setAdj(a => ({ ...a, stonePercent: Math.min(100, Math.max(0, Number(e.target.value))) })); }}
                      />
                    </div>
                    <div className="aw-pill-group" style={{ marginTop: 6 }}>
                      {[100, 80, 70, 50].map(v => (
                        <button key={v} className={`aw-pill ${adj.stonePercent === v ? "active" : ""}`}
                          onClick={() => { setActivePreset(-1); setAdj(a => ({ ...a, stonePercent: v })); }}
                        >{v}%</button>
                      ))}
                    </div>
                  </div>

                  {/* GST Toggle */}
                  <div className="aw-control-group">
                    <div className="aw-control-label"><Percent size={13} /> GST</div>
                    <div className="aw-toggle-row">
                      <span>{adj.includeGST ? `Include GST (${latestRates.gstRate}%)` : "Exclude GST"}</span>
                      <label className="aw-toggle">
                        <input type="checkbox" checked={adj.includeGST}
                          onChange={e => setAdj(a => ({ ...a, includeGST: e.target.checked }))} />
                        <div className="aw-toggle-track" />
                      </label>
                    </div>
                  </div>

                  {/* Discount Mode */}
                  <div className="aw-control-group">
                    <div className="aw-control-label"><ToggleRight size={13} /> Discounts</div>
                    <div className="aw-pill-group">
                      {["keep", "remove"].map(opt => (
                        <button key={opt}
                          className={`aw-pill ${adj.discountMode === opt ? "active" : ""}`}
                          onClick={() => setAdj(a => ({ ...a, discountMode: opt }))}
                        >
                          {opt === "keep" ? "Keep Original" : "Remove Discounts"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reason — full width */}
                  <div className="aw-control-group full">
                    <div className="aw-control-label"><FileText size={13} /> Reason for Return</div>
                    <textarea
                      className="aw-textarea"
                      placeholder="Describe the reason for return / exchange…"
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                    />
                  </div>

                </div>

                {/* ── Live Adjustment Table ── */}
                <div className="aw-table-wrap">
                  <div className="aw-table-title">
                    <BarChart3 size={14} /> Live Adjustment Breakdown
                  </div>
                  <table className="aw-table">
                    <thead>
                      <tr>
                        <th>Component</th>
                        <th>Original</th>
                        <th>Adjusted</th>
                        <th>Difference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: "Metal", icon: <Layers size={13} />, old: breakdown.metal, new: adjustedValues.metal || 0 },
                        { label: "Diamond", icon: <Gem size={13} />, old: breakdown.diamond, new: adjustedValues.diamond || 0 },
                        { label: "Stone", icon: <Gem size={13} />, old: breakdown.stone, new: adjustedValues.stone || 0 },
                        { label: "Making", icon: <Wrench size={13} />, old: breakdown.making, new: adjustedValues.making || 0 },

                        // ✅ DISCOUNT ROW (correct place)
                        {
                          label: "Discount",
                          icon: <Percent size={13} />,
                          old:
                            breakdown.discount || (breakdown.discountDiamond || 0) +
                            (breakdown.discountStone || 0) +
                            (breakdown.discountMaking || 0),

                          new: adjustedValues.discount || 0,
                        },
                        { label: "GST", icon: <Percent size={13} />, old: breakdown.gst, new: adjustedValues.gst || 0 },
                      ].map(row => (
                        <tr key={row.label}>
                          <td>{row.icon} {row.label}</td>
                          <td>₹{r2(row.old).toLocaleString("en-IN")}</td>
                          <td>₹{r2(row.new).toLocaleString("en-IN")}</td>
                          <td><DiffBadge old={row.old} new={row.new} /></td>
                        </tr>
                      ))}
                      <tr className="total-row">
                        <td>Total</td>
                        <td>₹{r2(breakdown.total).toLocaleString("en-IN")}</td>
                        <td>₹{r2(finalAmount).toLocaleString("en-IN")}</td>
                        <td><DiffBadge old={breakdown.total} new={finalAmount} /></td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="aw-final-banner">
                    <div>
                      <div className="aw-final-banner-label">
                        {returnType === "exchange" ? "Credit Note Amount" : "Refund Amount"}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
                        {returnType === "exchange"
                          ? "A credit note will be generated upon approval"
                          : "Will be refunded to customer directly"}
                      </div>
                    </div>
                    <div className="aw-final-banner-amount">
                      ₹{r2(finalAmount).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>

              </div>

              <div className="aw-nav">
                <button className="aw-btn secondary" onClick={() => setStep(1)}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  className={`aw-btn ${returnType === "exchange" ? "success" : "primary"}`}
                  onClick={submitReturn}
                  disabled={submitting}
                >
                  {submitting ? "Submitting…" : (
                    returnType === "exchange"
                      ? <><RefreshCw size={16} /> Initiate Exchange</>
                      : <><CreditCard size={16} /> Initiate Refund</>
                  )}
                </button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
}