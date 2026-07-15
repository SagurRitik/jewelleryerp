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
import { generateInvoiceNo } from "../utils/generateInvoiceNo.js"

export const createManualInvoice = async (req, res) => {

  try {

    const { customer, items, payment, salesperson, creditNoteIds, appliedCredit, date } = req.body

    if (customer) {
      if (customer.panNumber === "") delete customer.panNumber;
      if (customer.gstin === "") delete customer.gstin;
      if (customer.email === "") delete customer.email;
    }

    let subtotal = 0
    let gst = 0
    let grandTotal = 0

    items.forEach(i => {
      subtotal += Number(i.breakup?.subtotal || 0)
      gst += Number(i.breakup?.gst || 0)
      grandTotal += Number(i.breakup?.grandTotal || 0)
    })

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

    const invoiceData = {
      invoiceNo: await generateInvoiceNo(),
      customer,
      items,
      salesperson,
      date: date ? new Date(date) : new Date(),
      createdAt: date ? new Date(date) : new Date(),
      totals: {
        subtotal,
        gst,
        grandTotal,
        appliedCredit: Number(appliedCredit) || 0,
        netPayable: Math.max(0, grandTotal - (Number(appliedCredit) || 0))
      },
      payment: {
        mode: payment?.mode || "CASH",
        referenceNo: payment?.referenceNo || "",
        status: "PAID"
      }
    }

    // Support for multiple credit notes
    if (creditNoteIds && Array.isArray(creditNoteIds) && creditNoteIds.length > 0) {
      invoiceData.creditNoteIds = creditNoteIds;
    }

    const invoice = await SalesOrder.create(invoiceData)

    // Process multiple Credit Notes deduction
    if (creditNoteIds && Array.isArray(creditNoteIds) && creditNoteIds.length > 0 && Number(appliedCredit) > 0) {
      let remainingToApply = Number(appliedCredit);

      for (const cnId of creditNoteIds) {
        if (remainingToApply <= 0) break;

        const credit = await CreditNote.findById(cnId);
        if (!credit || credit.status !== "ACTIVE" || credit.remainingAmount <= 0) continue;

        const deduct = Math.min(credit.remainingAmount, remainingToApply);
        credit.remainingAmount -= deduct;
        credit.usedAmount += deduct;
        remainingToApply -= deduct;

        if (credit.remainingAmount <= 0) {
          credit.status = "USED";
          credit.remainingAmount = 0;
        }
        await credit.save();
      }
    }

    // 💎 Process Diamond Stock Updates
    if (items && Array.isArray(items)) {
      for (const item of items) {
        const breakup = item.breakup;
        if (breakup && breakup.componentBreakup && Array.isArray(breakup.componentBreakup)) {
          for (const comp of breakup.componentBreakup) {
            if (comp.pricingRef === "DIAMOND" && comp.diamondId) {
              await DiamondStock.findByIdAndUpdate(comp.diamondId, { status: "SOLD" });
            }
          }
        }
      }
    }

    res.json({
      success: true,
      invoiceId: invoice._id
    })

  }
  catch (err) {

    console.error("MANUAL INVOICE ERROR:", err)

    res.status(500).json({
      message: err.message,
      errors: err.errors
    })

  }

}