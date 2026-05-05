// import Invoice from "../models/Invoice.js";
// import Order from "../models/Order.js";

// export const createInvoiceForOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const { pricing, paymentMode } = req.body;

//     const order = await Order.findById(orderId);
//     if (!order)
//       return res.status(404).json({ success: false, message: "Order not found" });

//     if (!["Ready", "Delivered"].includes(order.status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invoice can be generated only when order is Ready or Delivered",
//       });
//     }

//     const existing = await Invoice.findOne({ order: orderId });
//     if (existing) return res.json({ success: true, invoice: existing });

//     const today = new Date();
//     const datePart = today.toISOString().slice(0, 10).replace(/-/g, "");
//     const count = await Invoice.countDocuments({
//       createdAt: {
//         $gte: new Date(today.setHours(0, 0, 0, 0)),
//         $lte: new Date(today.setHours(23, 59, 59, 999)),
//       },
//     });

//     const invoiceNo = `NZR-CO-INV-${datePart}-${String(count + 1).padStart(4, "0")}`;

//     // const invoice = await Invoice.create({
//     //   invoiceNo,
//     //   order: order._id,
//     //   pricing,
//     //   paymentMode,
//     //   advancePaid: order.advanceAmount || 0,
//     // });
// const invoice = await Invoice.create({
//   invoiceNo,
//   order: order._id,

//   // ✅ CUSTOMER SNAPSHOT
//   customer: {
//     name: order.customer?.name,
//     mobile: order.customer?.mobile,
//     email: order.customer?.email,
//     address: order.customer?.address,
//   },

//   // ✅ PRODUCT SNAPSHOT (OPTIONAL BUT RECOMMENDED)
//   product: {
//     category: order.productDetails?.category,
//     size: order.productDetails?.size,

//     metalType: order.productDetails?.metalType,
//     metalPurity: order.productDetails?.metalPurity,
//     metalColor: order.productDetails?.metalColor,
//     metalWeight: order.productDetails?.metalWeight,

//     diamondWeight: order.productDetails?.diamondWeight,
//     diamondColor: order.productDetails?.diamondColor,
//     diamondQuality: order.productDetails?.diamondQuality,

//     stones: order.productDetails?.stones || [],
//   },

//   pricing, // 🔒 locked pricing snapshot
//   advancePaid: order.advanceAmount || 0,
//   paymentMode,
// });


//     /* ================= MARK ORDER AS DELIVERED ================= */
//     order.finalInvoice = invoice._id;
//     order.status = "Delivered";
//     order.orderStatusHistory.push({
//       status: "Delivered",
//       at: new Date(),
//     });


//     order.finalInvoice = invoice._id;
//     await order.save();

//     res.status(201).json({ success: true, invoice });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// };



// /* ================= GET INVOICE BY ID ================= */
// export const getInvoiceById = async (req, res) => {
//   try {
//     const invoice = await Invoice.findById(req.params.id)
//       .populate("order");

//     if (!invoice)
//       return res.status(404).json({
//         success: false,
//         message: "Invoice not found",
//       });

//     res.json({ success: true, invoice });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// };


//==========================================================
// import Invoice from "../models/Invoice.js";
// import Order from "../models/Order.js";

// const sanitizePricing = (pricing) => {
//   const safe = {};

//   Object.keys(pricing || {}).forEach((k) => {
//     const v = pricing[k];
//     safe[k] =
//       v === null || v === undefined || Number.isNaN(v)
//         ? 0
//         : v;
//   });

//   return safe;
// };

// /* ================= CREATE INVOICE FOR ORDER ================= */
// export const createInvoiceForOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const { pricing, paymentMode } = req.body;

//     /* ================= BASIC VALIDATION ================= */
//     if (!pricing || typeof pricing !== "object") {
//       return res.status(400).json({
//         success: false,
//         message: "Pricing snapshot is required",
//       });
//     }

//     /* ================= FETCH ORDER ================= */
//     const order = await Order.findById(orderId);
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     /* ================= STATUS CHECK ================= */
//     if (!["Ready", "Delivered"].includes(order.status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invoice can be generated only when order is Ready or Delivered",
//       });
//     }

//     /* ================= PREVENT DUPLICATE INVOICE ================= */
//     const existing = await Invoice.findOne({ order: orderId });
//     if (existing) {
//       return res.json({ success: true, invoice: existing });
//     }

//     /* ================= SAFE DAILY COUNT ================= */
//     const start = new Date();
//     start.setHours(0, 0, 0, 0);

//     const end = new Date();
//     end.setHours(23, 59, 59, 999);

//     const count = await Invoice.countDocuments({
//       createdAt: { $gte: start, $lte: end },
//     });

//     const datePart = start.toISOString().slice(0, 10).replace(/-/g, "");
//     const invoiceNo = `NZR-CO-INV-${datePart}-${String(count + 1).padStart(4, "0")}`;

//     /* ================= CREATE INVOICE ================= */
//     const invoice = await Invoice.create({
//       invoiceNo,
//       order: order._id,

//       /* ===== CUSTOMER SNAPSHOT ===== */
//       customer: {
//         name: order.customer?.name || "",
//         mobile: order.customer?.mobile || "",
//         email: order.customer?.email || "",
//         address: order.customer?.address || "",
//       },

//       /* ===== PRODUCT SNAPSHOT ===== */
//       product: {
//         category: order.productDetails?.category,
//         size: order.productDetails?.size,

//         metalType: order.productDetails?.metalType,
//         metalPurity: order.productDetails?.metalPurity,
//         metalColor: order.productDetails?.metalColor,
//         metalWeight: order.productDetails?.metalWeight,

//         diamondWeight: order.productDetails?.diamondWeight,
//         diamondColor: order.productDetails?.diamondColor,
//         diamondQuality: order.productDetails?.diamondQuality,

//         stones: order.productDetails?.stones || [],
//       },

//       pricing, // 🔒 locked pricing snapshot
//       paymentMode,
//       advancePaid: order.advanceAmount || 0,
//     });

//     /* ================= UPDATE ORDER ================= */
//     order.finalInvoice = invoice._id;

//     if (order.status !== "Delivered") {
//       order.status = "Delivered";
//       order.orderStatusHistory.push({
//         status: "Delivered",
//         at: new Date(),
//       });
//     }

//     await order.save();

//     res.status(201).json({
//       success: true,
//       invoice,
//     });
//   } catch (err) {
//     console.error("CREATE INVOICE ERROR:", err);
//     res.status(500).json({
//       success: false,
//       error: err.message,
//     });
//   }
// };

// /* ================= GET INVOICE BY ID ================= */
// export const getInvoiceById = async (req, res) => {
//   try {
//     const invoice = await Invoice.findById(req.params.id).populate("order");

//     if (!invoice) {
//       return res.status(404).json({
//         success: false,
//         message: "Invoice not found",
//       });
//     }

//     res.json({
//       success: true,
//       invoice,
//     });
//   } catch (err) {
//     console.error("GET INVOICE ERROR:", err);
//     res.status(500).json({
//       success: false,
//       error: err.message,
//     });
//   }
// };
//======================================================================
//====================================================================================================


// import Invoice from "../models/Invoice.js";
// import Order from "../models/Order.js";

// /* ================= HELPERS ================= */

// const sanitizePricing = (pricing = {}) => {
//   const n = (v) =>
//     v === null || v === undefined || Number.isNaN(v) ? 0 : Number(v);

//   return {
//     metalRate: n(pricing.metalRate),
//     diamondRate: n(pricing.diamondRate),
//     stoneRate: n(pricing.stoneRate),
//     makingCharge: n(pricing.makingCharge),

//     metalAmount: n(pricing.metalAmount),
//     diamondAmount: n(pricing.diamondAmount),
//     stoneAmount: n(pricing.stoneAmount),
//     makingAmount: n(pricing.makingAmount),

//     discountType: pricing.discountType || "",
//     discountValue: n(pricing.discountValue),
//     discountAmount: n(pricing.discountAmount),

//     subtotal: n(pricing.subtotal),

//     gstRate: pricing.gstRate ?? 3,
//     gstMakingRate: pricing.gstMakingRate ?? 5,

//     gst: n(pricing.gst),
//     gstOnMaking: n(pricing.gstOnMaking),

//     grandTotal: n(pricing.grandTotal),
//   };
// };

// const normalizePaymentMode = (mode) => {
//   if (!mode || typeof mode !== "string") return "Cash";
//   const m = mode.toUpperCase();
//   if (m === "UPI") return "UPI";
//   if (m === "CARD") return "Card";
//   if (m === "BANK") return "Bank";
//   return "Cash";
// };

// /* ================= CREATE INVOICE ================= */
// export const createInvoiceForOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const { pricing, paymentMode } = req.body;

//     const order = await Order.findById(orderId);
//     if (!order)
//       return res.status(404).json({ success: false, message: "Order not found" });

//     if (!["Ready", "Delivered"].includes(order.status)) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Invoice can be generated only when order is Ready or Delivered",
//       });
//     }

//     if (!order.pricingLocked) {
//       return res.status(400).json({
//         success: false,
//         message: "Pricing must be locked before invoice",
//       });
//     }

//     const existing = await Invoice.findOne({ order: orderId });
//     if (existing) {
//       return res.json({ success: true, invoice: existing });
//     }

//     /* ===== UNIQUE INVOICE NO (RETRY SAFE) ===== */
//     const today = new Date();
//     const datePart = today.toISOString().slice(0, 10).replace(/-/g, "");
//     const prefix = `NZR-CO-INV-${datePart}-`;

//     let invoice = null;
//     let retry = 0;

//     while (!invoice && retry < 5) {
//       const last = await Invoice.findOne({
//         invoiceNo: { $regex: `^${prefix}` },
//       }).sort({ createdAt: -1 });

//       const lastSeq = last
//         ? parseInt(last.invoiceNo.split("-").pop())
//         : 0;

//       const invoiceNo = `${prefix}${String(lastSeq + 1).padStart(4, "0")}`;

//       try {
//         invoice = await Invoice.create({
//           invoiceNo,
//           order: order._id,

//           customer: {
//             name: order.customer?.name || "",
//             mobile: order.customer?.mobile || "",
//             email: order.customer?.email || "",
//             address: order.customer?.address || "",
//           },

//           product: {
//             category: order.productDetails?.category,
//             size: order.productDetails?.size,
//             metalType: order.productDetails?.metalType,
//             metalPurity: order.productDetails?.metalPurity,
//             metalColor: order.productDetails?.metalColor,
//             metalWeight: order.productDetails?.metalWeight,
//             diamondWeight: order.productDetails?.diamondWeight,
//             diamondColor: order.productDetails?.diamondColor,
//             diamondQuality: order.productDetails?.diamondQuality,
//             stones: order.productDetails?.stones || [],
//           },

//           /* ===== NEW OPTIONAL SNAPSHOTS ===== */
//           jewellery: {
//             fineGoldWeight: order.productDetails?.fineGoldWeight,
//             certificateNo: order.productDetails?.certificateNo,
//           },

//           billing: {
//             gstin: order.gstin,
//             stateCode: order.stateCode,
//             transactionId: order.transactionId,
//           },

//           pricing: sanitizePricing(pricing),
//           paymentMode: normalizePaymentMode(paymentMode),
//           advancePaid: order.advanceAmount || 0,
//         });
//       } catch (err) {
//         if (err.code === 11000) retry++;
//         else throw err;
//       }
//     }

//     if (!invoice) {
//       return res.status(500).json({
//         success: false,
//         message: "Failed to generate unique invoice number",
//       });
//     }

//     order.finalInvoice = invoice._id;
//     order.status = "Delivered";
//     order.orderStatusHistory.push({
//       status: "Delivered",
//       at: new Date(),
//     });

//     await order.save();

//     res.status(201).json({ success: true, invoice });
//   } catch (err) {
//     console.error("INVOICE CREATE ERROR:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// };

// /* ================= GET INVOICE ================= */
// export const getInvoiceById = async (req, res) => {
//   try {
//     const invoice = await Invoice.findById(req.params.id).populate("order");
//     if (!invoice)
//       return res
//         .status(404)
//         .json({ success: false, message: "Invoice not found" });

//     res.json({ success: true, invoice });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// };
//===============================================================================================================
//===================================mm==========================================mm===============================



// import Invoice from "../models/Invoice.js";
// import Order from "../models/Order.js";

// /* ================= HELPERS ================= */

// const sanitizePricing = (pricing = {}) => {
//   const n = (v) =>
//     v === null || v === undefined || Number.isNaN(v) ? 0 : Number(v);

//   return {
//     metalRate: n(pricing.metalRate),
//     diamondRate: n(pricing.diamondRate),
//     stoneRate: n(pricing.stoneRate),
//     makingCharge: n(pricing.makingCharge),

//     metalAmount: n(pricing.metalAmount),
//     diamondAmount: n(pricing.diamondAmount),
//     stoneAmount: n(pricing.stoneAmount),
//     makingAmount: n(pricing.makingAmount),

//     discountType: pricing.discountType || "flat",
//     discountValue: n(pricing.discountValue),
//     discountAmount: n(pricing.discountAmount),

//     subtotal: n(pricing.subtotal),

//     gstRate: pricing.gstRate ?? 3,
//     gstMakingRate: pricing.gstMakingRate ?? 5,

//     gst: n(pricing.gst),
//     gstOnMaking: n(pricing.gstOnMaking),

//     grandTotal: n(pricing.grandTotal),
//     stoneWeight: n(pricing.stoneWeight),
//     taxable3: n(pricing.taxable3 || 0),
//     taxable5: n(pricing.taxable5 || 0),
//   };
// };

// /* ================= CREATE INVOICE ================= */
// export const createInvoiceForOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const { 
//       pricing, 
//       paymentMode, 
//       customer, 
//       transactionId,
//       fineGoldWeight,
//       certificateNo
//     } = req.body;

//     const order = await Order.findById(orderId);
//     if (!order) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "Order not found" 
//       });
//     }

//     if (!["Ready", "Delivered"].includes(order.status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invoice can be generated only when order is Ready or Delivered",
//       });
//     }

//     if (!order.pricingLocked) {
//       return res.status(400).json({
//         success: false,
//         message: "Pricing must be locked before invoice",
//       });
//     }

//     const existing = await Invoice.findOne({ order: orderId });
//     if (existing) {
//       return res.json({ success: true, invoice: existing });
//     }

//     /* ===== GENERATE UNIQUE INVOICE NO ===== */
//     const today = new Date();
//     const datePart = today.toISOString().slice(0, 10).replace(/-/g, "");
//     const prefix = `NZR-CO-INV-${datePart}-`;

//     let invoice = null;
//     let retry = 0;

//     while (!invoice && retry < 5) {
//       const last = await Invoice.findOne({
//         invoiceNo: { $regex: `^${prefix}` },
//       }).sort({ createdAt: -1 });

//       const lastSeq = last
//         ? parseInt(last.invoiceNo.split("-").pop())
//         : 0;

//       const invoiceNo = `${prefix}${String(lastSeq + 1).padStart(4, "0")}`;

//       try {
//         const pd = order.productDetails || {};
//         const orderCustomer = order.customer || {};
        
//         // ✅ MERGE CUSTOMER DATA (from order + request)
//         const mergedCustomer = {
//           name: customer?.name || orderCustomer.name || "",
//           mobile: customer?.mobile || orderCustomer.mobile || "",
//           email: customer?.email || orderCustomer.email || "",
//           address: customer?.address || orderCustomer.address || "",
//           city: customer?.city || orderCustomer.city || "",
//           // ✅ ONLY GSTIN (removed old gst field)
//           gstin: customer?.gstin || order.gstin || orderCustomer.gstin || "",
//           stateCode: customer?.stateCode || order.stateCode || orderCustomer.stateCode || "",
//         };

//         // ✅ GET JEWELLERY FIELDS (from request or order)
//         const jewelleryFineGoldWeight = fineGoldWeight || pd.fineGoldWeight || 0;
//         const jewelleryCertificateNo = certificateNo || pd.certificateNo || "";

//         invoice = await Invoice.create({
//           invoiceNo,
//           order: order._id,

//           // ✅ CUSTOMER WITH SINGLE GST FIELD
//           customer: mergedCustomer,

//           // ✅ PRODUCT SNAPSHOT WITH NEW FIELDS
//           product: {
//             category: pd.category || "",
//             size: pd.size || "",
//             title: pd.title || "",
//             metalType: pd.metalType || "",
//             metalPurity: pd.metalPurity || "",
//             metalColor: pd.metalColor || "",
//             metalWeight: pd.metalWeight || 0,
//             grossWeight: pd.grossWeight || 0,
//             diamondWeight: pd.diamondWeight || 0,
//             diamondColor: pd.diamondColor || "",
//             diamondQuality: pd.diamondQuality || "",
//             stones: pd.stones || [],
//             // ✅ NEW JEWELLERY FIELDS
//             fineGoldWeight: jewelleryFineGoldWeight,
//             certificateNo: jewelleryCertificateNo,
//           },

//           // ✅ PAYMENT DETAILS
//           paymentMode: paymentMode || order.paymentMode || "UPI",
//           transactionId: transactionId || order.transactionId || "",
//           advancePaid: order.advanceAmount || 0,

//           // ✅ PRICING SNAPSHOT
//           pricing: sanitizePricing(pricing),
//         });
//       } catch (err) {
//         if (err.code === 11000) retry++;
//         else throw err;
//       }
//     }

//     if (!invoice) {
//       return res.status(500).json({
//         success: false,
//         message: "Failed to generate unique invoice number",
//       });
//     }

//     // ✅ UPDATE ORDER STATUS
//     order.finalInvoice = invoice._id;
//     order.status = "Delivered";
//     order.orderStatusHistory.push({
//       status: "Delivered",
//       at: new Date(),
//       note: "Invoice generated",
//     });

//     await order.save();

//     res.status(201).json({ 
//       success: true, 
//       invoice,
//       message: "Invoice generated successfully"
//     });
//   } catch (err) {
//     console.error("INVOICE CREATE ERROR:", err);
//     res.status(500).json({ 
//       success: false, 
//       error: err.message 
//     });
//   }
// };

// /* ================= GET INVOICE ================= */
// export const getInvoiceById = async (req, res) => {
//   try {
//     const invoice = await Invoice.findById(req.params.id).populate("order");
    
//     if (!invoice) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "Invoice not found" 
//       });
//     }

//     res.json({ 
//       success: true, 
//       invoice 
//     });
//   } catch (err) {
//     console.error("GET INVOICE ERROR:", err);
//     res.status(500).json({ 
//       success: false, 
//       error: err.message 
//     });
//   }
// };


import Invoice from "../../models/Invoice.js";
import Order from "../../models/Order.js";

/* ================= HELPERS ================= */

const sanitizePricing = (pricing = {}) => {
  const n = (v) =>
    v === null || v === undefined || Number.isNaN(v) ? 0 : Number(v);

  return {
    // Rates
    metalRate: n(pricing.metalRate),
    diamondRate: n(pricing.diamondRate),
    stoneRate: n(pricing.stoneRate),
    makingCharge: n(pricing.makingCharge),

    // Amounts
    metalAmount: n(pricing.metalAmount),
    diamondAmount: n(pricing.diamondAmount),
    stoneAmount: n(pricing.stoneAmount),
    makingAmount: n(pricing.makingAmount),

    // Discount
    discountType: pricing.discountType || "flat",
    discountValue: n(pricing.discountValue),
    discountAmount: n(pricing.discountAmount),

    // Totals
    subtotal: n(pricing.subtotal),

    // GST Rates
    gstRate: pricing.gstRate ?? 3,
    gstMakingRate: pricing.gstMakingRate ?? 5,

    // GST Amounts
    gst: n(pricing.gst),
    gstOnMaking: n(pricing.gstOnMaking),

    // Final
    grandTotal: n(pricing.grandTotal),
    stoneWeight: n(pricing.stoneWeight),
    taxable3: n(pricing.taxable3 || 0),
    taxable5: n(pricing.taxable5 || 0),

    // ✅ NEW: Jewellery specific pricing fields
    fineGoldWeight: n(pricing.fineGoldWeight || 0),
    certificateNo: pricing.certificateNo || "",
    hsnCode: pricing.hsnCode || "",
  };
};

/* ================= CREATE INVOICE ================= */
export const createInvoiceForOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { 
      pricing, 
      paymentMode, 
      customer, 
      transactionId,
      fineGoldWeight,
      certificateNo,
      hsnCode, // ✅ HSN Code from request
      gstin,
      stateCode
    } = req.body;

    console.log("Invoice Request Data:", req.body);

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    if (!["Ready", "Delivered"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Invoice can be generated only when order is Ready or Delivered",
      });
    }

    if (!order.pricingLocked) {
      return res.status(400).json({
        success: false,
        message: "Pricing must be locked before invoice",
      });
    }

    const existing = await Invoice.findOne({ order: orderId });
    if (existing) {
      return res.json({ success: true, invoice: existing });
    }

    /* ===== GENERATE UNIQUE INVOICE NO ===== */
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, "");
    const prefix = `NZR-CO-INV-${datePart}-`;

    let invoice = null;
    let retry = 0;

    while (!invoice && retry < 5) {
      const last = await Invoice.findOne({
        invoiceNo: { $regex: `^${prefix}` },
      }).sort({ createdAt: -1 });

      const lastSeq = last
        ? parseInt(last.invoiceNo.split("-").pop())
        : 0;

      const invoiceNo = `${prefix}${String(lastSeq + 1).padStart(4, "0")}`;

      try {
        const pd = order.productDetails || {};
        const orderCustomer = order.customer || {};
        
        // ✅ MERGE CUSTOMER DATA (from order + request)
        const mergedCustomer = {
          name: customer?.name || orderCustomer.name || "",
          mobile: customer?.mobile || orderCustomer.mobile || "",
          email: customer?.email || orderCustomer.email || "",
          address: customer?.address || orderCustomer.address || "",
          city: customer?.city || orderCustomer.city || "",
          // ✅ GSTIN & State Code
          gstin: customer?.gstin || gstin || order.gstin || orderCustomer.gstin || "",
          stateCode: customer?.stateCode || stateCode || order.stateCode || orderCustomer.stateCode || "",
        };

        // ✅ GET JEWELLERY FIELDS (from request or order or pricing)
        const jewelleryFineGoldWeight = fineGoldWeight || pricing?.fineGoldWeight || pd.fineGoldWeight || 0;
        const jewelleryCertificateNo = certificateNo || pricing?.certificateNo || pd.certificateNo || "";
        const jewelleryHsnCode = hsnCode || pricing?.hsnCode || pd.hsnCode || "7113";

        invoice = await Invoice.create({
          invoiceNo,
          order: order._id,

          // ✅ CUSTOMER
          customer: mergedCustomer,

          // ✅ PRODUCT SNAPSHOT WITH ALL FIELDS
          product: {
            category: pd.category || "",
            size: pd.size || "",
            title: pd.title || "",
            metalType: pd.metalType || "",
            metalPurity: pd.metalPurity || "",
            metalColor: pd.metalColor || "",
            metalWeight: pd.metalWeight || 0,
            grossWeight: pd.grossWeight || 0,
            diamondWeight: pd.diamondWeight || 0,
            diamondColor: pd.diamondColor || "",
            diamondQuality: pd.diamondQuality || "",
            stones: pd.stones || [],
            // ✅ NEW JEWELLERY FIELDS - save in product snapshot
            fineGoldWeight: jewelleryFineGoldWeight,
            certificateNo: jewelleryCertificateNo,
            hsnCode: jewelleryHsnCode,
          },

          // ✅ PAYMENT DETAILS
          paymentMode: paymentMode || order.paymentMode || "UPI",
          transactionId: transactionId || order.transactionId || "",
          advancePaid: order.advanceAmount || 0,

          // ✅ PRICING SNAPSHOT WITH ALL FIELDS
          pricing: sanitizePricing(pricing),
          
          // ✅ ALSO SAVE JEWELLERY FIELDS AT INVOICE ROOT LEVEL
          fineGoldWeight: jewelleryFineGoldWeight,
          certificateNo: jewelleryCertificateNo,
          hsnCode: jewelleryHsnCode,
        });
        
        console.log("Invoice created successfully:", {
          invoiceNo,
          fineGoldWeight: jewelleryFineGoldWeight,
          certificateNo: jewelleryCertificateNo,
          hsnCode: jewelleryHsnCode
        });
      } catch (err) {
        if (err.code === 11000) retry++;
        else throw err;
      }
    }

    if (!invoice) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate unique invoice number",
      });
    }

    // ✅ UPDATE ORDER STATUS
    order.finalInvoice = invoice._id;
    order.status = "Delivered";
    order.orderStatusHistory.push({
      status: "Delivered",
      at: new Date(),
      note: "Invoice generated",
    });

    await order.save();

    res.status(201).json({ 
      success: true, 
      invoice,
      message: "Invoice generated successfully"
    });
  } catch (err) {
    console.error("INVOICE CREATE ERROR:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};

/* ================= GET INVOICE ================= */
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate("order");
    
    if (!invoice) {
      return res.status(404).json({ 
        success: false, 
        message: "Invoice not found" 
      });
    }

    // ✅ Convert to plain object for manipulation
    const invoiceObj = invoice.toObject();
    
    // ✅ Ensure all jewellery fields are available at root level
    if (!invoiceObj.fineGoldWeight && invoiceObj.product?.fineGoldWeight) {
      invoiceObj.fineGoldWeight = invoiceObj.product.fineGoldWeight;
    }
    
    if (!invoiceObj.certificateNo && invoiceObj.product?.certificateNo) {
      invoiceObj.certificateNo = invoiceObj.product.certificateNo;
    }
    
    if (!invoiceObj.hsnCode && invoiceObj.product?.hsnCode) {
      invoiceObj.hsnCode = invoiceObj.product.hsnCode;
    }
    
    // ✅ Also check pricing for these fields
    if (!invoiceObj.fineGoldWeight && invoiceObj.pricing?.fineGoldWeight) {
      invoiceObj.fineGoldWeight = invoiceObj.pricing.fineGoldWeight;
    }
    
    if (!invoiceObj.certificateNo && invoiceObj.pricing?.certificateNo) {
      invoiceObj.certificateNo = invoiceObj.pricing.certificateNo;
    }
    
    if (!invoiceObj.hsnCode && invoiceObj.pricing?.hsnCode) {
      invoiceObj.hsnCode = invoiceObj.pricing.hsnCode;
    }

    console.log("Returning Invoice with jewellery fields:", {
      fineGoldWeight: invoiceObj.fineGoldWeight,
      certificateNo: invoiceObj.certificateNo,
      hsnCode: invoiceObj.hsnCode
    });

    res.json({ 
      success: true, 
      invoice: invoiceObj 
    });
  } catch (err) {
    console.error("GET INVOICE ERROR:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};