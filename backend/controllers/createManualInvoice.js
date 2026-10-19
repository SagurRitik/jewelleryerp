// import SalesOrder from "../models/SalesOrder.js"
// import { generateInvoiceNo } from "../utils/generateInvoiceNo.js";

// export const createManualInvoice=async(req,res)=>{

// try{

// const {customer,items,payment}=req.body

// console.log("MANUAL INVOICE BODY:",req.body)

// let subtotal=0
// let gst=0
// let grandTotal=0

// items.forEach(i=>{
// subtotal+=Number(i.breakup.subtotal||0)
// gst+=Number(i.breakup.gst||0)
// grandTotal+=Number(i.breakup.grandTotal||0)
// })

// const invoice=await SalesOrder.create({

// invoiceNo:await generateInvoiceNo(),

// customer,

// items,

// totals:{
// subtotal,
// gst,
// grandTotal,
// netPayable:grandTotal
// },

// payment:{
// mode:payment.mode,
// referenceNo:payment.referenceNo,
// status:"PAID"
// }

// })

// res.json({
// success:true,
// invoiceId:invoice._id
// })

// }
// catch(err){

// res.status(500).json({
// error:err.message
// })

// }

// }





// import SalesOrder from "../models/SalesOrder.js"
// import { generateInvoiceNo } from "../utils/generateInvoiceNo.js"
// import puppeteer from "puppeteer"
// import { invoiceTemplate } from "../templates/invoice.template.js"

// export const createManualInvoice = async (req,res)=>{

// try{

// const {customer,items,payment}=req.body

// console.log("MANUAL INVOICE BODY:",req.body)

// let subtotal=0
// let gst=0
// let grandTotal=0

// items.forEach(i=>{
// subtotal+=Number(i.breakup.subtotal||0)
// gst+=Number(i.breakup.gst||0)
// grandTotal+=Number(i.breakup.grandTotal||0)
// })

// /* ---------- SAVE INVOICE ---------- */

// const invoice = await SalesOrder.create({

// invoiceNo: await generateInvoiceNo(),

// customer,

// items,

// totals:{
// subtotal,
// gst,
// grandTotal,
// netPayable:grandTotal
// },

// payment:{
// mode:payment.mode,
// referenceNo:payment.referenceNo,
// status:"PAID"
// }

// })

// /* ---------- GENERATE PDF ---------- */

// const html = invoiceTemplate(invoice)

// const browser = await puppeteer.launch({
// headless:"new",
// args:["--no-sandbox","--disable-setuid-sandbox"]
// })

// const page = await browser.newPage()

// await page.setContent(html,{waitUntil:"networkidle0"})

// const pdf = await page.pdf({
// format:"A4",
// printBackground:true
// })

// await browser.close()

// /* ---------- RETURN PDF ---------- */

// res.set({
// "Content-Type":"application/pdf",
// "Content-Disposition":`inline; filename=${invoice.invoiceNo}.pdf`
// })

// res.send(pdf)

// }
// catch(err){

// console.error("MANUAL INVOICE ERROR:",err)

// res.status(500).json({
// error:err.message
// })

// }

// }



import SalesOrder from "../models/SalesOrder.js"
import CreditNote from "../models/creditnotes.js"
import DiamondStock from "../models/DiamondStock.js"
import Product from "../models/Product.js"
import MetalLedger from "../models/MetalLedger.js"
import { generateInvoiceNo } from "../utils/generateInvoiceNo.js"
import { determineTaxType, validateGSTIN } from "../utils/gstStateHelper.js"
import { syncCustomerFromOrder } from "../utils/syncCustomer.js"
import { clearProductCache } from "../utils/productCache.js"

const normalizeMetalType = (metal) => {
  if (!metal) return "Gold";
  const m = String(metal).toLowerCase();
  if (m.includes("gold")) return "Gold";
  if (m.includes("silver")) return "Silver";
  if (m.includes("platinum")) return "Platinum";
  return metal.charAt(0).toUpperCase() + metal.slice(1);
};

export const createManualInvoice = async (req, res) => {

  try {

    const { customer, items, payment, salesperson, creditNoteIds, appliedCredit, date, invoiceNo, metalPayment, taxTypeOverride, taxType: bodyTaxType } = req.body

    if (customer) {
      if (customer.panNumber === "") delete customer.panNumber;
      if (customer.gstin === "") delete customer.gstin;
      if (customer.email === "") delete customer.email;

      if (customer.gstin) {
        const gCheck = validateGSTIN(customer.gstin, customer.stateCode);
        if (!gCheck.isValid) {
          return res.status(400).json({
            success: false,
            message: gCheck.error || "Invalid GSTIN or State Code mismatch",
            error: gCheck.error || "Invalid GSTIN or State Code mismatch",
          });
        }
        customer.gstin = customer.gstin.trim().toUpperCase();
        customer.stateCode = gCheck.stateCode;
        if (!customer.panNumber && gCheck.pan) {
          customer.panNumber = gCheck.pan;
        }
      }
    }

    const trimmedInvoiceNo = invoiceNo?.trim();
    if (trimmedInvoiceNo) {
      const existing = await SalesOrder.findOne({ invoiceNo: trimmedInvoiceNo });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Invoice number ${trimmedInvoiceNo} already exists.`
        });
      }
    }

    let subtotal = 0
    let gst = 0
    let grandTotal = 0
    let totalDiscount = 0

    items.forEach(i => {
      subtotal += Number(i.breakup?.subtotal || 0)
      gst += Number(i.breakup?.gst || 0)
      grandTotal += Number(i.breakup?.grandTotal || 0)
      totalDiscount += Number(i.breakup?.discount || 0)
    })

    /* ================= ✅ TAX DETERMINATION (INTER-STATE vs INTRA-STATE) ================= */
    const taxInfo = determineTaxType(customer, taxTypeOverride || bodyTaxType || "AUTO");
    const isInterState = taxInfo.isInterState;
    const cgst = isInterState ? 0 : Math.round((gst / 2) * 100) / 100;
    const sgst = isInterState ? 0 : Math.round((gst / 2) * 100) / 100;
    const igst = isInterState ? gst : 0;

    if (customer && !customer.stateCode && taxInfo.stateCode) {
      customer.stateCode = taxInfo.stateCode;
    }

    /* ================= ✅ PAN VALIDATION ================= */
    if (Number(subtotal) >= 200000 && (!customer || !customer.panNumber)) {
      return res.status(400).json({
        success: false,
        error: "PAN number is required for bills above ₹2,00,000 (before GST)",
      });
    }

    if (customer && customer.panNumber) {
      customer.panNumber = customer.panNumber.toUpperCase().trim();
    }

    let metalCredit = 0;
    let metalPayments = [];

    if (Number(metalPayment?.weight) > 0 && Number(metalPayment?.ratePerGram) > 0) {
      const weight = Number(metalPayment.weight) || 0;
      const rate = Number(metalPayment.ratePerGram) || 0;
      metalCredit = Math.round((weight * rate) * 100) / 100;

      metalPayments.push({
        source: "INVOICE",
        metalType: metalPayment.metalType || null,
        purity: metalPayment.purity || null,
        weight,
        ratePerGram: rate,
        totalValue: metalCredit,
        receivedAt: new Date()
      });
    }

    const unroundedGrandTotal = subtotal + gst;
    const roundedGrandTotal = Math.round(unroundedGrandTotal);
    const roundOff = Math.round((roundedGrandTotal - unroundedGrandTotal) * 100) / 100;
    const netPayableCalculated = roundedGrandTotal - (Number(appliedCredit) || 0) - metalCredit;

    if (subtotal < 0 || netPayableCalculated < -0.01) {
      return res.status(400).json({
        success: false,
        message: `Invoice amount cannot be less than 0. Exchange credit (₹${metalCredit.toLocaleString('en-IN')}) or discount exceeds total bill amount (₹${roundedGrandTotal.toLocaleString('en-IN')}).`
      });
    }

    /* ================= 🔍 STOCK PRE-VALIDATION (AGGREGATED ACROSS ITEMS) ================= */
    const productQtyMap = new Map();
    const diamondQtyMap = new Map();

    if (items && Array.isArray(items)) {
      for (const item of items) {
        const prodId = item.productId || (item.itemType === "PRODUCT" && (item.product?._id || item.productDetails?._id || item.itemSnapshot?.productId || item.itemSnapshot?.productDetails?._id));
        if (prodId) {
          const key = String(prodId);
          const qtyNeeded = Number(item.quantity || 1);
          if (!productQtyMap.has(key)) {
            productQtyMap.set(key, {
              prodId,
              qtyNeeded: 0,
              title: item.productDetails?.title || item.title || item.sku || prodId,
              sku: item.sku || item.productDetails?.sku || "",
            });
          }
          productQtyMap.get(key).qtyNeeded += qtyNeeded;
        }

        // Diamond stock pre-validation
        const breakup = item.breakup;
        if (breakup && breakup.componentBreakup && Array.isArray(breakup.componentBreakup)) {
          for (const comp of breakup.componentBreakup) {
            if (comp.pricingRef === "DIAMOND" && comp.diamondId) {
              const dKey = String(comp.diamondId);
              const qtySold = Number(item.quantity || comp.count || 1);
              if (!diamondQtyMap.has(dKey)) {
                diamondQtyMap.set(dKey, {
                  diamondId: comp.diamondId,
                  qtyNeeded: 0,
                });
              }
              diamondQtyMap.get(dKey).qtyNeeded += qtySold;
            }
          }
        }
      }

      // Check all aggregated products BEFORE touching DB
      for (const [key, req] of productQtyMap.entries()) {
        const product = await Product.findById(req.prodId);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product "${req.title}" (${req.sku || "No SKU"}) not found in inventory.`,
          });
        }
        const availStock = Number(product.stock ?? 0);
        if (availStock < req.qtyNeeded) {
          return res.status(400).json({
            success: false,
            message: `Stock deduction failed for product ${req.sku || req.title}. Insufficient stock (Available: ${availStock}, Requested in bill: ${req.qtyNeeded}).`,
          });
        }
      }

      // Check all aggregated diamonds BEFORE touching DB
      for (const [dKey, req] of diamondQtyMap.entries()) {
        const dStock = await DiamondStock.findById(req.diamondId);
        if (dStock) {
          const currentStock = Number(dStock.stock ?? 1);
          if (req.qtyNeeded > currentStock) {
            return res.status(400).json({
              success: false,
              message: `Insufficient stock for diamond ${dStock.sku || ""}. Available: ${currentStock}, Requested in bill: ${req.qtyNeeded}.`,
            });
          }
        }
      }
    }

    const now = new Date();
    let invoiceDate = now;
    if (date) {
      invoiceDate = new Date(date);
      if (typeof date === "string" && date.length === 10) {
        invoiceDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      }
    }

    const invoiceData = {
      invoiceNo: trimmedInvoiceNo || await generateInvoiceNo(),
      customer,
      items,
      salesperson,
      date: invoiceDate,
      createdAt: now,
      ...(metalPayments.length > 0 ? { metalPayments } : {}),
      totals: {
        subtotal,
        discount: totalDiscount,
        gst,
        taxType: taxInfo.taxType,
        cgst,
        sgst,
        igst,
        roundOff,
        grandTotal: roundedGrandTotal,
        appliedCredit: Number(appliedCredit) || 0,
        metalPayment: metalCredit,
        netPayable: Math.max(0, netPayableCalculated)
      },
      payment: {
        mode: payment?.mode ? String(payment.mode).toUpperCase() : "CASH",
        referenceNo: payment?.referenceNo || "",
        status: "PAID",
        ...(payment?.mode === "SPLIT" && Array.isArray(payment?.splitPayments)
          ? { splitPayments: payment.splitPayments }
          : {}),
      }
    };

    // Support for multiple credit notes
    if (creditNoteIds && Array.isArray(creditNoteIds) && creditNoteIds.length > 0) {
      invoiceData.creditNoteIds = creditNoteIds;
    }

    /* ================= 🛡️ ATOMIC TRANSACTION / ROLLBACK TRACKING ================= */
    let createdInvoice = null;
    let createdMetalLedgerIds = [];
    let updatedCreditNotes = [];
    let deductedProducts = [];
    let deductedDiamonds = [];

    // 1. Deduct Product Stock First
    for (const [key, req] of productQtyMap.entries()) {
      const result = await Product.updateOne(
        { _id: req.prodId, stock: { $gte: req.qtyNeeded } },
        { $inc: { stock: -req.qtyNeeded } }
      );
      if (result.modifiedCount === 0) {
        throw new Error(`Stock deduction failed for product ${req.sku || req.title}. Insufficient stock.`);
      }
      deductedProducts.push({ prodId: req.prodId, qty: req.qtyNeeded });
    }
    if (deductedProducts.length > 0) {
      clearProductCache();
    }

    // 2. Deduct Diamond Stock
    for (const [dKey, req] of diamondQtyMap.entries()) {
      const dStock = await DiamondStock.findById(req.diamondId);
      if (dStock) {
        const currentStock = Number(dStock.stock ?? 1);
        if (currentStock < req.qtyNeeded) {
          throw new Error(`Diamond stock deduction failed for ${dStock.sku || ""}. Insufficient stock.`);
        }
        const newStock = Math.max(0, currentStock - req.qtyNeeded);
        let newStatus = newStock === 0 ? "SOLD" : (dStock.status === "RESERVED" ? "RESERVED" : "AVAILABLE");
        await DiamondStock.findByIdAndUpdate(req.diamondId, {
          stock: newStock,
          status: newStatus,
        });
        deductedDiamonds.push({
          diamondId: req.diamondId,
          prevStock: currentStock,
          prevStatus: dStock.status,
        });
      }
    }

    // 3. Process multiple Credit Notes deduction
    if (creditNoteIds && Array.isArray(creditNoteIds) && creditNoteIds.length > 0 && Number(appliedCredit) > 0) {
      let remainingToApply = Number(appliedCredit);

      for (const cnId of creditNoteIds) {
        if (remainingToApply <= 0) break;

        const credit = await CreditNote.findById(cnId);
        if (!credit || credit.status !== "ACTIVE" || credit.remainingAmount <= 0) continue;

        const deduct = Math.min(credit.remainingAmount, remainingToApply);
        const prevRemaining = credit.remainingAmount;
        const prevUsed = credit.usedAmount;
        const prevStatus = credit.status;

        credit.remainingAmount -= deduct;
        credit.usedAmount += deduct;
        remainingToApply -= deduct;

        if (credit.remainingAmount <= 0) {
          credit.status = "USED";
          credit.remainingAmount = 0;
        }
        await credit.save();
        updatedCreditNotes.push({ id: credit._id, prevRemaining, prevUsed, prevStatus });
      }
    }

    // 4. Create SalesOrder
    createdInvoice = await SalesOrder.create(invoiceData);

    // 5. 📜 METAL LEDGER ENTRY
    if (metalPayments && metalPayments.length > 0) {
      for (const metal of metalPayments) {
        if (metal.source !== "INVOICE") continue;
        const metalType = normalizeMetalType(metal.metalType);
        const mlEntry = await MetalLedger.create({
          type: "CREDIT",
          source: "INVOICE",
          referenceId: createdInvoice._id,
          referenceModel: "SalesOrder",
          partyName: customer?.name || "Customer",
          metalType: metalType,
          purity: metal.purity || null,
          weight: Number(metal.weight) || 0,
          ratePerGram: Number(metal.ratePerGram) || 0,
          value: Number(metal.totalValue) || 0,
          notes: `Metal received during invoice ${createdInvoice.invoiceNo}`,
          createdAt: date ? new Date(date) : new Date()
        });
        createdMetalLedgerIds.push(mlEntry._id);
      }
    }

    // 6. 👤 Auto-sync customer into Customer Directory
    await syncCustomerFromOrder(customer, roundedGrandTotal);

    res.json({
      success: true,
      invoiceId: createdInvoice._id
    });

  }
  catch (err) {

    console.error("MANUAL INVOICE ERROR:", err);

    // 🛡️ Comprehensive Rollback: Ensure NO partial invoice or deducted stock is left behind
    try {
      // Revert created invoice
      if (createdInvoice?._id) {
        await SalesOrder.findByIdAndDelete(createdInvoice._id);
        console.log(`[ROLLBACK] Deleted partial invoice: ${createdInvoice._id}`);
      }

      // Revert created metal ledger entries
      if (createdMetalLedgerIds.length > 0) {
        await MetalLedger.deleteMany({ _id: { $in: createdMetalLedgerIds } });
        console.log(`[ROLLBACK] Deleted ${createdMetalLedgerIds.length} metal ledger entries`);
      }

      // Revert credit notes
      for (const cn of updatedCreditNotes) {
        await CreditNote.findByIdAndUpdate(cn.id, {
          remainingAmount: cn.prevRemaining,
          usedAmount: cn.prevUsed,
          status: cn.prevStatus,
        });
      }

      // Revert product stock deductions
      for (const p of deductedProducts) {
        await Product.updateOne({ _id: p.prodId }, { $inc: { stock: p.qty } });
        console.log(`[ROLLBACK] Reverted stock (+${p.qty}) for product: ${p.prodId}`);
      }
      if (deductedProducts.length > 0) {
        clearProductCache();
      }

      // Revert diamond stock deductions
      for (const d of deductedDiamonds) {
        await DiamondStock.findByIdAndUpdate(d.diamondId, {
          stock: d.prevStock,
          status: d.prevStatus,
        });
        console.log(`[ROLLBACK] Reverted diamond stock for: ${d.diamondId}`);
      }
    } catch (rollbackErr) {
      console.error("MANUAL INVOICE ROLLBACK FAILED:", rollbackErr);
    }

    res.status(500).json({
      message: err.message,
      errors: err.errors
    });

  }

}