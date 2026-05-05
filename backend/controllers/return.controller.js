import ReturnOrder from "../models/ReturnOrder.js";
import Invoice from "../models/SalesOrder.js";
import CreditNote from "../models/creditnotes.js";
import RateConfig from "../models/RateConfig.js";
import Product from "../models/Product.js";
import {
  computeReturnAdjustment,
  extractBreakdownFromInvoiceItem,
} from "../utils/return.adjustment.js";


/* ─────────────────────────────── HELPERS ──────────────────────── */

const round2 = (n) => Number(Number(n || 0).toFixed(2));

async function getLatestRates() {
  const rc = await RateConfig.findOne({ active: true }).sort({ createdAt: -1 });
  return rc || {};
}

async function generateReturnNo() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const prefix = `RET-${y}/${m}/${d}-`;

  const latest = await ReturnOrder.findOne({
    returnNo: { $regex: `^${prefix}` },
  }).sort({ createdAt: -1 });

  let seq = "001";
  if (latest?.returnNo) {
    const parts = latest.returnNo.split("-");
    const last = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(last)) seq = String(last + 1).padStart(3, "0");
  }
  return `${prefix}${seq}`;
}

/* ─────────────────────────────────────────────────────────────────
   POST /api/returns/preview-adjustment
   Body: { invoiceId, invoiceItemIndex, adjustments }
   Returns live computation WITHOUT saving anything.
   ───────────────────────────────────────────────────────────────── */
export const previewAdjustment = async (req, res) => {
  try {
    const { invoiceId, invoiceItemIndex, adjustments = {} } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice)
      return res.status(404).json({ message: "Invoice not found" });

    const item = invoice.items[Number(invoiceItemIndex)];
    if (!item)
      return res.status(400).json({ message: "Invoice item not found" });

    const latestRates = await getLatestRates();
    const breakdown = extractBreakdownFromInvoiceItem(item);
    console.log("RAW BREAKUP:", JSON.stringify(item.breakup || item.itemSnapshot?.breakup || item.customSnapshot?.pricingSnapshot, null, 2));
    console.log("BREAKDOWN:", JSON.stringify(breakdown, null, 2));

    const result = computeReturnAdjustment(breakdown, adjustments, latestRates);

    res.json({
      breakdown,
      ...result,
      latestRates: {
        gold24KT: latestRates.gold24KT,
        silver999: latestRates.silver999,
        platinum950: latestRates.platinum950,
        gstRate: latestRates.gstRate || 3,
      },
    });
  } catch (err) {
    console.error("PREVIEW ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────────
   POST /api/returns
   Creates a return order with full adjustment data saved.
   Body: {
     invoiceId, invoiceItemIndex, reason,
     returnType: "refund" | "exchange",
     adjustments: { ... },
     refundMode (optional, for refund)
   }
   ───────────────────────────────────────────────────────────────── */
export const createReturn = async (req, res) => {
  try {
    const {
      invoiceId,
      invoiceItemIndex,
      reason,
      returnType = "refund",
      adjustments = {},
      refundMode,
      /* legacy multi-item support */
      items,
    } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice)
      return res.status(404).json({ message: "Invoice not found" });

    /* ── Support legacy format (items array) ── */
    const itemIndex =
      invoiceItemIndex !== undefined
        ? Number(invoiceItemIndex)
        : items?.[0]?.invoiceItemId !== undefined
          ? Number(items[0].invoiceItemId)
          : 0;

    const item = invoice.items[itemIndex];
    if (!item)
      return res.status(400).json({ message: "Invoice item not found" });

    /* ── Compute adjustments ── */
    const latestRates = await getLatestRates();
    const breakdown = extractBreakdownFromInvoiceItem(item);

    const { adjustedValues, finalAmount } = computeReturnAdjustment(
      breakdown,
      adjustments,
      latestRates
    );

    /* ── Build returnItems ── */
    const returnItems = [
      {
        invoiceItemIndex: itemIndex,
        itemSnapshot: item.itemSnapshot || item.customSnapshot || {},
        quantityReturned: 1,
        /* legacy breakup for backwards compat */
        returnBreakup: {
          metalValue: breakdown.metal,
          diamondValue: breakdown.diamond,
          stoneValue: breakdown.stone,
          makingCharge: breakdown.making,

          gst: breakdown.gst,
          totalRefund: finalAmount,
        },
      },
    ];

    const returnNo = await generateReturnNo();

    const returnOrder = await ReturnOrder.create({
      returnNo,
      invoiceId: invoice._id,
      invoiceNo: invoice.invoiceNo,
      customer: invoice.customer,
      returnType,
      reason,
      returnItems,

      breakdown,
      adjustments: {
        ...adjustments,
        metalRateUsed: latestRates.gold24KT || 0,
      },
      adjustedValues,
      finalAmount,

      refund: refundMode ? { mode: refundMode, amount: finalAmount } : undefined,
      status: "PENDING",
      inspectionStatus: "PENDING",
    });

    res.status(201).json(returnOrder);
  } catch (err) {
    console.error("CREATE RETURN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────────
   GET /api/returns
   ───────────────────────────────────────────────────────────────── */
export const getReturns = async (req, res) => {
  try {
    const returns = await ReturnOrder.find().sort({ createdAt: -1 });
    res.json(returns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────────
   GET /api/returns/:id
   ───────────────────────────────────────────────────────────────── */
export const getReturnById = async (req, res) => {
  try {
    const returnOrder = await ReturnOrder.findById(req.params.id);
    if (!returnOrder)
      return res.status(404).json({ message: "Return not found" });
    res.json(returnOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────────
   PATCH /api/returns/:id/approve
   ───────────────────────────────────────────────────────────────── */
export const approveReturn = async (req, res) => {
  try {
    const returnOrder = await ReturnOrder.findById(req.params.id);
    if (!returnOrder)
      return res.status(404).json({ message: "Return not found" });

    const { refundAmount } = req.body;

    returnOrder.status = "APPROVED";
    returnOrder.inspectionStatus = "PASSED";

    if (refundAmount !== undefined) {
      returnOrder.finalAmount = round2(Number(refundAmount));
      if (!returnOrder.refund) returnOrder.refund = {};
      returnOrder.refund.amount = round2(Number(refundAmount));
    }

    await returnOrder.save();
    res.json(returnOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────────
   PATCH /api/returns/:id/reject
   ───────────────────────────────────────────────────────────────── */
export const rejectReturn = async (req, res) => {
  try {
    const returnOrder = await ReturnOrder.findById(req.params.id);
    if (!returnOrder)
      return res.status(404).json({ message: "Return not found" });

    returnOrder.status = "REJECTED";
    returnOrder.inspectionStatus = "FAILED";
    await returnOrder.save();
    res.json(returnOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────────
   PATCH /api/returns/:id/complete
   
   REFUND  → records payment mode, does NOT create credit note
   EXCHANGE → creates Credit Note with finalAmount
   ───────────────────────────────────────────────────────────────── */
/* ─────────────────────────────────────────────────────────────────
   HELPER: _restockItems
   For each returnItem where stockAction === "RESTOCK",
   increments Product.stock by quantityReturned using SKU from snapshot.
   Silently skips items with no matching product.
   ───────────────────────────────────────────────────────────────── */
async function _restockItems(returnItems = []) {
  for (const item of returnItems) {
    if (item.stockAction !== "RESTOCK") continue;

    const pd =
      item.itemSnapshot?.productDetails ||
      item.itemSnapshot?.customSnapshot?.productDetails ||
      {};

    const sku = pd.sku || item.itemSnapshot?.sku;
    if (!sku) continue;

    const qty = Number(item.quantityReturned) || 1;
    await Product.findOneAndUpdate(
      { sku },
      { $inc: { stock: qty } }
    );
  }
}

export const completeReturn = async (req, res) => {
  try {
    const returnOrder = await ReturnOrder.findById(req.params.id);
    if (!returnOrder)
      return res.status(404).json({ message: "Return not found" });

    if (returnOrder.status !== "APPROVED")
      return res.status(400).json({ message: "Return must be approved first" });

    const { paymentMode } = req.body || {};
    const finalAmount = round2(returnOrder.finalAmount || 0);

    /* ── REFUND flow ── */
    if (returnOrder.returnType === "refund") {
      if (paymentMode) {
        if (!returnOrder.refund) returnOrder.refund = {};
        returnOrder.refund.mode = paymentMode;
        returnOrder.refund.amount = finalAmount;
      }
      returnOrder.status = "COMPLETED";
      await returnOrder.save();

      /* ── Restock ── */
      await _restockItems(returnOrder.returnItems);

      return res.json({
        message: "Refund completed successfully",
        returnOrder,
      });
    }

    /* ── EXCHANGE flow — generate Credit Note ── */
    const av = returnOrder.adjustedValues || {};

    // Generate sequential credit note number
    const date = new Date();
    const cnPrefix = `CN-${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}-`;
    const latestCN = await CreditNote.findOne({ creditNoteNo: { $regex: `^${cnPrefix}` } }).sort({ createdAt: -1 });
    let cnSeq = "001";
    if (latestCN?.creditNoteNo) {
      const parts = latestCN.creditNoteNo.split("-");
      const last = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(last)) cnSeq = String(last + 1).padStart(3, "0");
    }

    const creditNote = await CreditNote.create({
      creditNoteNo: `${cnPrefix}${cnSeq}`,
      customer: returnOrder.customer,
      invoiceId: returnOrder.invoiceId,
      returnOrderId: returnOrder._id,
      amount: finalAmount,
      metalValue: av.metal || 0,
      diamondValue: av.diamond || 0,
      stoneValue: av.stone || 0,
      makingCharge: av.making || 0,
      discount: av.discount || 0,
      gst: av.gst || 0,
      usableForExchange: true,
      usedAmount: 0,
      remainingAmount: finalAmount,
      status: "ACTIVE",
    });

    returnOrder.creditNoteId = creditNote._id;
    returnOrder.status = "COMPLETED";
    await returnOrder.save();

    /* ── Restock for exchange items too ── */
    await _restockItems(returnOrder.returnItems);

    res.json({
      message: "Exchange credit note generated successfully",
      returnOrder,
      creditNote,
    });
  } catch (err) {
    console.error("COMPLETE RETURN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};