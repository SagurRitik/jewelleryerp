
import { generateTallySalesXML } from "../../utils/generateTallySalesXML.js";
import { sendToTally } from "../../utils/sendToTally.js";

import Order from "../../models/Order.js";
import Cart from "../../models/Cart.js";
import SalesOrder from "../../models/SalesOrder.js";
import RateConfig from "../../models/RateConfig.js";
import Product from "../../models/Product.js";
import calculateItem from "../../utils/calculateItem.js";
import { generateInvoiceNo } from "../../utils/generateInvoiceNo.js";
import MetalLedger from "../../models/MetalLedger.js";
import { clearProductCache } from "../../utils/productCache.js";

const round2 = (n) => Math.round(Number(n || 0) * 100) / 100;

const normalizeMetal = (metal) => {
  if (!metal) return null
  const m = metal.toLowerCase()
  if (m.includes("gold")) return "Gold"
  if (m.includes("silver")) return "Silver"
  if (m.includes("platinum")) return "Platinum"
  return null
}

export const confirmInvoice = async (req, res) => {
  try {
    const {
      sessionId,
      customer = {},
      itemsMeta = [],
      payment = {},
      metalPayment = {},
      date = null
    } = req.body;

    const invoiceDate = date ? new Date(date) : new Date();

    /* ================= BASIC VALIDATION ================= */
    if (!sessionId) {
      return res.status(400).json({ success: false, error: "Session ID missing" });
    }

    if (customer) {
      if (customer.panNumber === "") delete customer.panNumber;
      if (customer.gstin === "") delete customer.gstin;
      if (customer.email === "") delete customer.email;
    }

    if (!customer.name || !customer.mobile) {
      return res.status(400).json({
        success: false,
        error: "Customer name & mobile required",
      });
    }

    /* ================= 1️⃣ ACTIVE RATES ================= */
    const activeRates = await RateConfig.findOne({ active: true }).lean();
    if (!activeRates) {
      return res.status(500).json({
        success: false,
        error: "Rates not configured",
      });
    }

    /* ================= 2️⃣ LOAD CART ================= */
    const cart = await Cart.findOne({ sessionId }).populate("items.product");
    if (!cart || !cart.items?.length) {
      return res.status(400).json({
        success: false,
        error: "Cart empty or expired",
      });
    }

    let metalCredit = 0;
    let metalPayments = [];
    let discount = 0;
    let discountDiamond = 0;
    let discountStone = 0;
    let discountMaking = 0;

    /* ================= INVOICE METAL ================= */
    if (Number(metalPayment?.weight) > 0 && Number(metalPayment?.ratePerGram) > 0) {
      const weight = Number(metalPayment.weight) || 0;
      const rate = Number(metalPayment.ratePerGram) || 0;
      metalCredit = round2(weight * rate);

      metalPayments.push({
        source: "INVOICE",
        metalType: metalPayment.metalType || null,
        purity: metalPayment.purity || null,
        weight: weight,
        ratePerGram: rate,
        totalValue: metalCredit,
        receivedAt: new Date()
      });
    }

    /* ================= 3️⃣ PREPARE ITEMS ================= */
    let subtotal = 0;
    let gst = 0;
    let grandTotal = 0;
    let totalAdvancePayment = 0;
    let totalMetalPayment = 0;

    const items = await Promise.all(
      cart.items.map(async (item) => {
        let calc;
        if (item.itemType === "CUSTOM") {
          calc = item.customSnapshot?.pricingSnapshot || {};
        } else {
          calc = await calculateItem(item, activeRates);
        }

        subtotal += Number(calc.subtotal || 0);
        gst += Number(calc.gst || 0);
        grandTotal += Number(calc.grandTotal || 0);
        totalAdvancePayment += Number(calc.advanceUsed || 0);
        totalMetalPayment += Number(calc.metalUsed || 0);

        discount += Number(calc.discount || 0);
        discountDiamond += Number(calc.discountDiamond || 0);
        discountStone += Number(calc.discountStone || 0);
        discountMaking += Number(calc.discountMaking || 0);

        const meta = itemsMeta.find((m) => m.cartItemId === item._id.toString());
        const snap = item.customSnapshot || item.itemSnapshot || {};
        const pd = snap.productDetails || {};

        // 🔥 Comprehensive check for HSN
        const productHsn = pd.hsnCode || pd.hsn || snap.hsn || item.product?.hsnCode || "";
        // 🔥 Comprehensive check for Certificate (supports multiple)
        const certArray = pd.certificates || snap.certificates || item.product?.certificates || [];
        const productCert = certArray.length > 0
          ? certArray.map(c => `${c.lab} - ${c.certificateNo}`).join(", ")
          : (pd.certificateNo || snap.certificateNo || item.product?.certificateNo || "");

        const finalHsn = meta?.hsn || productHsn || "";
        const finalCert = meta?.certificateNo || productCert || "";
        const finalCerts = meta?.certificates || certArray || [];

        return {
          itemSnapshot: item.customSnapshot || item.itemSnapshot || {},
          quantity: item.quantity || 1,
          breakup: calc,
          hsn: finalHsn,
          certificateNo: finalCert,
          certificates: finalCerts,
        };
      })
    );

    /* ================= ✅ PAN VALIDATION ================= */
    if (Number(subtotal) >= 200000 && !customer.panNumber) {
      return res.status(400).json({
        success: false,
        error: "PAN number is required for bills above ₹2,00,000 (before GST)",
      });
    }
    if (customer.panNumber) {
      customer.panNumber = customer.panNumber.toUpperCase().trim();
    }

    /* ================= ORDER METAL ================= */
    if (totalMetalPayment > 0) {
      metalPayments.push({
        source: "ORDER",
        metalType: "ORDER_ADJUSTMENT",
        purity: null,
        weight: 0,
        ratePerGram: 0,
        totalValue: round2(totalMetalPayment),
        receivedAt: new Date()
      });
    }

    /* ================= 4️⃣ RATE SNAPSHOT ================= */
    const rateSnapshot = {
      gold24KT: activeRates.gold24KT,
      silver999: activeRates.silver999,
      platinum950: activeRates.platinum950,
      diamondRate: activeRates.diamondRate,
      stoneRate: activeRates.stoneRate,
      makingCharge: activeRates.makingCharge,
      gstRate: activeRates.gstRate,
      makingDiscountType: activeRates.makingDiscountType,
      makingDiscountValue: activeRates.makingDiscountValue,
      diamondDiscountType: activeRates.diamondDiscountType,
      diamondDiscountValue: activeRates.diamondDiscountValue,
      stoneDiscountType: activeRates.stoneDiscountType,
      stoneDiscountValue: activeRates.stoneDiscountValue,
    };

    /* ================= 5️⃣ SAVE INVOICE ================= */
    const invoice = await SalesOrder.create({
      invoiceNo: await generateInvoiceNo(invoiceDate),
      date: invoiceDate,
      customer,
      items,
      metalPayments,
      totals: {
        subtotal: round2(subtotal),
        gst: round2(gst),
        grandTotal: round2(grandTotal),
        discount: round2(discount),
        discountMaking: round2(discountMaking),
        discountDiamond: round2(discountDiamond),
        discountStone: round2(discountStone),
        advancePayment: round2(totalAdvancePayment),
        totalAdjustments: round2(totalAdvancePayment + totalMetalPayment + metalCredit),
        netPayable: round2(grandTotal - totalAdvancePayment - totalMetalPayment - metalCredit)
      },
      rateSnapshot,
      payment: {
        mode: payment.mode || "CASH",
        referenceNo: payment.referenceNo || "",
        status: "PAID"
      }
    });

    /* ================= 5️⃣B LEDGER ENTRY ================= */
    for (const metal of metalPayments) {
      if (metal.source !== "INVOICE") continue;
      const metalType = normalizeMetal(metal.metalType);
      if (!metalType) continue;
      await MetalLedger.create({
        type: "CREDIT",
        source: "INVOICE",
        referenceId: invoice._id,
        referenceModel: "SalesOrder",
        customerName: customer.name,
        partyName: customer.name,
        metalType: metalType,
        purity: metal.purity || null,
        weight: Number(metal.weight) || 0,
        ratePerGram: Number(metal.ratePerGram) || 0,
        value: Number(metal.totalValue) || 0,
        notes: `Metal received during invoice ${invoice.invoiceNo}`
      });
    }

    /* ================= 6️⃣ STOCK DEDUCTION (PRODUCT ONLY) ================= */
    for (const item of cart.items) {
      if (item.itemType === "PRODUCT" && item.product?._id) {
        const result = await Product.updateOne(
          { _id: item.product._id, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } }
        );
        if (result.modifiedCount === 0) {
          throw new Error(`Stock changed for product ${item.product.title || item.product._id}`);
        }
      }
    }
    // 🧹 Clear product cache so product list reflects updated stock immediately
    clearProductCache();

    /* ================= 7️⃣ UPDATE ORIGINAL ORDER STATUS ================= */
    for (const item of cart.items) {
      const orderNo = item.customSnapshot?.orderNo;
      if (!orderNo) continue;
      await Order.findOneAndUpdate(
        { orderNo },
        {
          $set: { status: "Delivered", finalInvoice: invoice._id },
          $push: {
            orderStatusHistory: {
              status: "Delivered",
              at: new Date(),
              note: `Invoice Generated: ${invoice.invoiceNo}`,
            },
          },
        }
      );
    }

    /* ================= 8️⃣ CLEAR CART ================= */
    await Cart.deleteOne({ _id: cart._id });

    /* ================= 9️⃣ TALLY SYNC ================= */
    try {
      const xml = generateTallySalesXML(invoice);
      const tallyResponse = await sendToTally(xml);
      invoice.tallySynced = true;
      invoice.tallyResponse = tallyResponse;
      await invoice.save();
    } catch (tallyErr) {
      console.error("⚠ TALLY SYNC FAILED:", tallyErr.message);
      invoice.tallySynced = false;
      invoice.tallyError = tallyErr.message;
      await invoice.save();
    }

    return res.json({
      success: true,
      invoiceId: invoice._id,
      invoiceNo: invoice.invoiceNo,
      grandTotal: invoice.totals.grandTotal,
      message: "Invoice generated successfully",
    });

  } catch (err) {
    console.error("❌ CONFIRM INVOICE ERROR:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
