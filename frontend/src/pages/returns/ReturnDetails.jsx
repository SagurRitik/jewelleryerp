import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ArrowLeft, CheckCircle, XCircle, CreditCard,
  RefreshCw, AlertCircle, Gem, Wrench, Percent, Layers,
  TrendingDown, Receipt, BadgeCheck
} from "lucide-react";
import toast from "react-hot-toast";
import "./ReturnDetails.css";

const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const fmt = (n) => r2(n).toLocaleString("en-IN");

/* ── Diff Badge ── */
function DiffBadge({ old: o, nw }) {
  const d = r2(nw - o);
  if (Math.abs(d) < 0.01) return <span className="diff-badge neutral">—</span>;
  const isPos = d > 0;
  return (
    <span className={`diff-badge ${isPos ? "positive" : "negative"}`}>
      {isPos ? "+" : "-"}₹{fmt(Math.abs(d))}
    </span>
  );
}

/* ── Component Metadata ── */
const COMP_META = {
  metal: { label: "Metal", icon: <Layers size={14} /> },
  diamond: { label: "Diamond", icon: <Gem size={14} /> },
  stone: { label: "Stone", icon: <Gem size={14} /> },
  making: { label: "Making", icon: <Wrench size={14} /> },
  discount: { label: "Discount", icon: <Percent size={14} /> },
  gst: { label: "GST", icon: <Percent size={14} /> },
};

export default function ReturnDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ret, setRet] = useState(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [loadingAction, setLoadingAction] = useState(false);

  const fetchReturn = () => {
    axios.get(`/api/returns/${id}`)
      .then(res => setRet(res.data))
      .catch(err => { toast.error("Failed to load return details"); console.error(err); });
  };

  useEffect(() => { fetchReturn(); }, [id]);

  useEffect(() => {
    if (ret?.status === "PENDING") {
      const amount = ret.finalAmount
        ?? ret.returnItems?.reduce((s, i) => s + (i.returnBreakup?.totalRefund || 0), 0)
        ?? 0;
      setRefundAmount(amount);
    }
  }, [ret]);

  if (!ret) return (
    <div className="rd-container"><div className="spinner" /></div>
  );

  const approve = async () => {
    if (refundAmount === "") return toast.error("Please enter refund amount");
    setLoadingAction(true);
    try {
      await axios.patch(`/api/returns/${id}/approve`, { refundAmount });
      toast.success("Return approved");
      fetchReturn();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve");
    } finally { setLoadingAction(false); }
  };

  const reject = async () => {
    setLoadingAction(true);
    try {
      await axios.patch(`/api/returns/${id}/reject`);
      toast.success("Return rejected");
      fetchReturn();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject");
    } finally { setLoadingAction(false); }
  };

  const complete = async () => {
    setLoadingAction(true);
    try {
      const payload = ret.returnType === "refund" ? { paymentMode } : {};
      await axios.patch(`/api/returns/${id}/complete`, payload);
      toast.success("Return completed");
      fetchReturn();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete return");
    } finally { setLoadingAction(false); }
  };

  const isExchange = ret.returnType === "exchange";
  const hasAdjEngine = !!(ret.breakdown && ret.adjustedValues);
  const finalAmt = ret.finalAmount ?? ret.refund?.amount
    ?? ret.returnItems?.reduce((s, i) => s + (i.returnBreakup?.totalRefund || 0), 0) ?? 0;

  const bdRows = hasAdjEngine
    ? [
      { key: "metal", ...COMP_META.metal, old: ret.breakdown?.metal || 0, nw: ret.adjustedValues?.metal || 0 },
      { key: "diamond", ...COMP_META.diamond, old: ret.breakdown?.diamond || 0, nw: ret.adjustedValues?.diamond || 0 },
      { key: "stone", ...COMP_META.stone, old: ret.breakdown?.stone || 0, nw: ret.adjustedValues?.stone || 0 },
      { key: "making", ...COMP_META.making, old: ret.breakdown?.making || 0, nw: ret.adjustedValues?.making || 0 },
      {
        key: "discount",
        ...COMP_META.discount,
        old: ret.breakdown?.discount ?? ((ret.breakdown?.discountDiamond ?? 0) + (ret.breakdown?.discountStone ?? 0) + (ret.breakdown?.discountMaking ?? 0)),
        nw: ret.adjustedValues?.discount ?? (ret.adjustments?.discountMode === "remove" ? 0 : (ret.breakdown?.discountDiamond ?? 0) + (ret.breakdown?.discountStone ?? 0) + (ret.breakdown?.discountMaking ?? 0)),
      },
      { key: "gst", ...COMP_META.gst, old: ret.breakdown?.gst || 0, nw: ret.adjustedValues?.gst || 0 },
    ]
    : (ret.returnItems?.[0]?.returnBreakup
      ? [
        { key: "metal", ...COMP_META.metal, old: ret.returnItems[0].returnBreakup.metalValue || 0, nw: ret.returnItems[0].returnBreakup.metalValue || 0 },
        { key: "diamond", ...COMP_META.diamond, old: ret.returnItems[0].returnBreakup.diamondValue || 0, nw: ret.returnItems[0].returnBreakup.diamondValue || 0 },
        { key: "stone", ...COMP_META.stone, old: ret.returnItems[0].returnBreakup.stoneValue || 0, nw: ret.returnItems[0].returnBreakup.stoneValue || 0 },
        { key: "making", ...COMP_META.making, old: ret.returnItems[0].returnBreakup.makingCharge || 0, nw: ret.returnItems[0].returnBreakup.makingCharge || 0 },
        {
          key: "discount",
          ...COMP_META.discount,
          old: ret.breakdown?.discount ?? ((ret.breakdown?.discountDiamond ?? 0) + (ret.breakdown?.discountStone ?? 0) + (ret.breakdown?.discountMaking ?? 0)),
          nw: ret.adjustedValues?.discount ?? ((ret.breakdown?.discountDiamond ?? 0) + (ret.breakdown?.discountStone ?? 0) + (ret.breakdown?.discountMaking ?? 0)),
        },
        { key: "gst", ...COMP_META.gst, old: ret.returnItems[0].returnBreakup.gst || 0, nw: ret.returnItems[0].returnBreakup.gst || 0 },
      ]
      : []);

  return (
    <div className="rd-container">
      <motion.div className="rd-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        {/* ── Header ── */}
        <div className="rd-header">
          <div className="rd-header-left">
            <button className="rd-back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Back to Returns
            </button>
            <h2 className="rd-title">Return #{ret.returnNo}</h2>
            <p className="rd-invoice-info">
              Invoice: {ret.invoiceNo} · {ret.customer?.name}
            </p>
          </div>
          <div className="rd-header-right">
            <span className={`badge-base badge-type ${isExchange ? "exchange" : "refund"}`}>
              {isExchange ? <RefreshCw size={12} /> : <CreditCard size={12} />}
              {isExchange ? "Exchange" : "Refund"}
            </span>
            <span className={`badge-base badge-status ${ret.status.toLowerCase()}`}>
              {ret.status}
            </span>
          </div>
        </div>

        <div className="rd-body">

          {/* ── Adjustment Rules Summary ── */}
          {hasAdjEngine && ret.adjustments && (
            <motion.div className="rd-adjustments-box" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <h4 className="rd-section-title-sm">
                <TrendingDown size={13} /> Applied Adjustments
              </h4>
              <div className="rd-adj-tags">
                {[
                  { l: "Metal Rate", v: ret.adjustments.useLatestMetalRate ? "Latest" : "Original" },
                  { l: "Diamond", v: `${ret.adjustments.diamondPercent}%` },
                  { l: "Stone", v: `${ret.adjustments.stonePercent}%` },
                  {
                    l: "Making", v: ret.adjustments.makingOption === "custom"
                      ? `₹${fmt(ret.adjustments.makingCustomValue)}` : ret.adjustments.makingOption
                  },
                  { l: "GST", v: ret.adjustments.includeGST ? "Included" : "Excluded" },
                  { l: "Discounts", v: ret.adjustments.discountMode === "keep" ? "Kept" : "Removed" },
                ].map(({ l, v }) => (
                  <span key={l} className="rd-adj-tag">
                    <span className="rd-adj-tag-label">{l}:</span> {v}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Breakdown Table ── */}
          {bdRows.length > 0 && (
            <motion.div className="rd-breakdown-container" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <h3 className="rd-section-title-md"><Receipt size={18} /> Component Breakdown</h3>
              <div className="rd-glass-table-wrap">
                <table className="rd-table">
                  <thead>
                    <tr>
                      <th>Component</th>
                      <th>Original</th>
                      <th>Adjusted</th>
                      <th>Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bdRows.map(row => (
                      <tr key={row.key}>
                        <td>
                          <div className="rd-comp-cell">{row.icon} {row.label}</div>
                        </td>
                        <td className="rd-num-cell">
                          {row.key === 'discount' ? '-' : ''}₹{fmt(row.old)}
                        </td>
                        <td className="rd-num-cell">
                          {row.key === 'discount' ? '-' : ''}₹{fmt(row.nw)}
                        </td>
                        <td className="rd-num-cell">
                          <DiffBadge old={row.old} nw={row.nw} />
                        </td>
                      </tr>
                    ))}
                    {/* Total row */}
                    <tr className="rd-total-row">
                      <td>
                        <div className="rd-comp-cell"><BadgeCheck size={14} /> Total</div>
                      </td>
                      <td className="rd-num-cell">
                        ₹{fmt(bdRows.reduce((s, r) => s + (r.key === 'discount' ? -r.old : r.old), 0))}
                      </td>
                      <td className="rd-num-cell">
                        ₹{fmt(finalAmt)}
                      </td>
                      <td className="rd-num-cell">
                        <DiffBadge old={bdRows.reduce((s, r) => s + (r.key === 'discount' ? -r.old : r.old), 0)} nw={finalAmt} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ── Action Boxes ── */}
          {ret.status === "PENDING" && (
            <motion.div className="rd-action-box" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h3 className="rd-action-title">Approval Action Required</h3>
              <div className="rd-form-group">
                <label className="rd-label">{isExchange ? "Credit Note Amount (₹)" : "Refund Amount (₹)"}</label>
                <input
                  type="number"
                  className="rd-input"
                  value={refundAmount}
                  onChange={e => setRefundAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="rd-btn-group">
                <button className="rd-btn primary" onClick={approve} disabled={loadingAction}>
                  <CheckCircle size={18} /> Approve
                </button>
                <button className="rd-btn danger" onClick={reject} disabled={loadingAction}>
                  <XCircle size={18} /> Reject
                </button>
              </div>
            </motion.div>
          )}

          {ret.status === "APPROVED" && (
            <motion.div className="rd-action-box" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              {isExchange ? (
                <div>
                  <h3 className="rd-action-title">Complete Exchange</h3>
                  <div className="rd-alert info">
                    <AlertCircle className="rd-alert-icon" size={20} />
                    <div>
                      <strong>Exchange Flow:</strong> A Credit Note for <strong>₹{fmt(finalAmt)}</strong> will be issued to {ret.customer?.name}. They can use it on the next purchase.
                    </div>
                  </div>
                  <div className="rd-btn-group" style={{ marginTop: 24 }}>
                    <button className="rd-btn secondary" onClick={complete} disabled={loadingAction}>
                      <RefreshCw size={18} /> Issue Credit Note & Complete
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="rd-action-title">Process Refund Finalisation</h3>
                  <div className="rd-alert info">
                    <AlertCircle className="rd-alert-icon" size={20} />
                    <div>
                      <strong>Refund Flow:</strong> Returning <strong>₹{fmt(finalAmt)}</strong> directly to {ret.customer?.name}. No credit note will be generated.
                    </div>
                  </div>
                  <div className="rd-form-group" style={{ marginTop: 24 }}>
                    <label className="rd-label">Payment Mode</label>
                    <select className="rd-select" value={paymentMode} onChange={e => setPaymentMode(e.target.value)}>
                      <option value="CASH">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="CARD">Card</option>
                      <option value="BANK">Bank Transfer</option>
                    </select>
                  </div>
                  <div className="rd-btn-group">
                    <button className="rd-btn primary" onClick={complete} disabled={loadingAction}>
                      <CreditCard size={18} /> Complete Refund
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── COMPLETED Notification ── */}
          {ret.status === "COMPLETED" && (
            <motion.div className="rd-breakdown-container" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <div className="rd-alert success">
                <CheckCircle className="rd-alert-icon" size={24} />
                <div>
                  {ret.creditNoteId ? (
                    <>
                      Credit Note generated successfully for <strong>₹{fmt(finalAmt)}</strong>.
                      <span className="rd-link" style={{ marginLeft: 12 }} onClick={() => navigate("/credit-notes")}>
                        View Credit Notes →
                      </span>
                    </>
                  ) : (
                    <>Refund of <strong>₹{fmt(finalAmt)}</strong> completed via <strong>{ret.refund?.mode || "N/A"}</strong>.</>
                  )}
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </motion.div>
    </div>
  );
}