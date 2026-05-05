// // //===========================================













// //===========================================

// import fs from "fs";
// import path from "path";

// export const invoiceTemplate = (invoice) => {
//   // --- 1. IMAGE LOADING LOGIC ---
//   let logoSrc = "";
//   try {
//     const logoPath = path.join(process.cwd(), "assets", "nazara_logo.png");
//     const bitmap = fs.readFileSync(logoPath);
//     const base64 = bitmap.toString("base64");
//     logoSrc = `data:image/png;base64,${base64}`;
//   } catch (err) {
//     console.error("Error loading logo image:", err.message);
//     logoSrc = ""; 
//   }

//   // --- Helpers ---
//   const fmt = (n) =>
//     Number(n || 0).toLocaleString("en-IN", {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     });

//   const safe = (v) => (v ?? "-");

//   const today = new Date(invoice.date || invoice.createdAt).toLocaleDateString("en-GB");

//   // --- Order Ref Logic ---
//   const getOrderRefLabel = () => {
//     const orders = new Set();
//     if (invoice.orderNo) orders.add(invoice.orderNo);
//     if (invoice.items && Array.isArray(invoice.items)) {
//       invoice.items.forEach((item) => {
//         const ref =
//           item.orderNo ||
//           item.itemSnapshot?.orderNo ||
//           item.customSnapshot?.orderNo;
//         if (ref) orders.add(ref);
//       });
//     }
//     const orderList = Array.from(orders).filter(Boolean);
//     return orderList.length > 0 ? orderList.join(", ") : "Store Product";
//   };

//   // --- Number to Words ---
//   const toWords = (num) => {
//     const a = ["", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "];
//     const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
//     if ((num = num.toString()).length > 9) return "Overflow";
//     const n = ("000000000" + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
//     if (!n) return "";
//     let str = "";
//     str += Number(n[1]) !== 0 ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + "Crore " : "";
//     str += Number(n[2]) !== 0 ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + "Lakh " : "";
//     str += Number(n[3]) !== 0 ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + "Thousand " : "";
//     str += Number(n[4]) !== 0 ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + "Hundred " : "";
//     str += Number(n[5]) !== 0 ? (str !== "" ? "and " : "") + (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]]) + "Rupees Only" : "Rupees Only";
//     return str;
//   };

//   // const amountInWords = toWords(Math.round(invoice.totals.grandTotal));
// const amountInWords = toWords(
//   Math.round(invoice.totals.netPayable || invoice.totals.grandTotal)
// );

// // --- Metal Payment Breakdown ---
// const orderMetal = (invoice.metalPayments || [])
//   .filter(p => p.source === "ORDER")
//   .reduce((s, p) => s + Number(p.totalValue || 0), 0);

// const invoiceMetal = (invoice.metalPayments || [])
//   .filter(p => p.source === "INVOICE")
//   .reduce((s, p) => s + Number(p.totalValue || 0), 0);

// const totalMetal = orderMetal + invoiceMetal;

//   // --- HTML Output ---
//   return `
// <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="UTF-8" />
//   <title>Invoice ${invoice.invoiceNo}</title>
//   <style>
//     @page { size: A4; margin: 15px; }
//     * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
//     body {
//       font-family: 'Helvetica', 'Arial', sans-serif;
//       font-size: 8px; 
//       color: #333;
//       margin: 0;
//       padding: 0;
//       line-height: 1.3;
//     }

//     /* Colors */
//     .theme-color { color: #531b4e; }
//     .bg-theme { background-color: #531b4e; color: #fff; }
//     .bg-light { background-color: #f9f3f9; }
//     .bg-card { background-color: #fcf4fc; } 

//     /* Layout Utilities */
//     .flex { display: flex; }
//     .justify-between { justify-content: space-between; }
//     .bold { font-weight: bold; }
//     .text-right { text-align: right; }
//     .mb-2 { margin-bottom: 8px; }

//     /* --- HEADER STYLES --- */
//     .header-card {
//       display: flex;
//       background-color: #fcf4fc;
//       border-radius: 12px;
//       overflow: hidden;
//       margin-bottom: 15px;
//       border: 1px solid #f0e0f0;
//     }
//     .header-left {
//       width: 35%;
//       background-color: #531b4e;
//       padding: 15px;
//       display: flex;
//       justify-content: center;
//       align-items: center;
//       border-radius: 12px;

//     }
//     .header-right {
//       width: 65%;
//       padding: 15px 20px;
//       display: flex;
//       flex-direction: column;
//       justify-content: center;
//     }
//     .logo-img {
//       width: 100%;
//       max-width: 180px;
//       filter: brightness(0) invert(1); 
//     }
//     .company-title {
//       font-size: 20px;
//       font-weight: bold;
//       color: #531b4e;
//       margin-bottom: 2px;
//     }
//     .company-tagline {
//       font-size: 9px;
//       color: #531b4e;
//       margin-bottom: 8px;
//     }
//     .header-divider {
//       border-bottom: 1px solid #dcb5d6;
//       margin-bottom: 8px;
//       width: 100%;
//     }
//     .company-info {
//       font-size: 9px;
//       color: #333;
//       line-height: 1.4;
//     }

//     /* --- Info Bar --- */
//     .info-bar { 
//       display: flex; 
//       justify-content: space-between; 
//       background-color: #f9f3f9; 
//       border: 1px solid #e0e0e0;
//       padding: 6px 10px; 
//       margin-bottom: 10px;
//       border-radius: 4px;
//     }
//     .info-item { text-align: center; }
//     .info-label { font-size: 7px; color: #666; margin-bottom: 2px; }
//     .info-value { font-size: 9px; font-weight: bold; color: #333; }

//     /* --- Details Box --- */
//     .details-box { display: flex; gap: 10px; margin-bottom: 10px; }
//     .box-panel { 
//         flex: 1; 
//         border: 1px solid #e0e0e0; 
//         padding: 10px; 
//         border-radius: 4px; 
//         min-height: 90px; 
//         display: flex;
//         flex-direction: column;
//     }
//     .box-title { 
//         color: #531b4e; 
//         font-weight: bold; 
//         border-bottom: 1px solid #eee; 
//         padding-bottom: 4px; 
//         margin-bottom: 6px; 
//         font-size: 9px;
//     }
//     .box-content {
//         font-size: 8px;
//         line-height: 1.4;
//         word-wrap: break-word; 
//     }

//     /* --- Table --- */
//     table { 
//         width: 100%; 
//         border-collapse: collapse; 
//         margin-bottom: 10px; 
//         table-layout: fixed; 
//     }
//     th {
//       background-color: #f2edf2;
//       color: #531b4e;
//       padding: 4px 2px;
//       border: 1px solid #e0e0e0;
//       font-weight: bold;
//       text-align: center;
//       vertical-align: middle;
//       font-size: 7px;
//       white-space: pre-wrap; 
//       overflow: hidden;
//     }
//     td {
//       border: 1px solid #e0e0e0;
//       padding: 4px 2px;
//       text-align: center;
//       color: #333;
//       vertical-align: middle;
//       font-size: 7.5px;
//       word-wrap: break-word; 
//     }
//     .td-left { text-align: left; padding-left: 4px; }
//     .td-right { text-align: right; padding-right: 4px; }

//     /* --- Charges Grid --- */
//     .charges-container {
//       display: flex;
//       border: 1px solid #531b4e;
//       border-radius: 4px;
//       overflow: hidden;
//       font-size: 8px;
//       margin-bottom: 10px;
//     }
//     .charges-half {
//       flex: 1;
//       display: flex;
//       flex-direction: column;
//     }
//     .left-half {
//       border-right: 1px solid #531b4e;
//     }
//     .c-row {
//       display: flex;
//       border-bottom: 1px solid #531b4e;
//       min-height: 22px; 
//     }
//     .c-row.last {
//       border-bottom: none;
//     }
//     .c-label {
//       flex: 1;
//       padding: 4px 8px;
//       color: #531b4e;
//       border-right: 1px solid #531b4e;
//       display: flex;
//       align-items: center;
//     }
//     .c-val {
//       width: 100px; 
//       padding: 4px 8px;
//       text-align: right;
//       display: flex;
//       align-items: center;
//       justify-content: flex-end;
//       color: #333;
//     }

//     .amount-words-section {
//       margin-bottom: 10px;
//       font-size: 9px;
//     }

//     /* --- Footer Split --- */
//     .footer-split {
//       display: flex;
//       gap: 20px;
//       margin-bottom: 15px;
//     }
//     .notes-card {
//       flex: 1;
//       background-color: #fcf4fc;
//       border-radius: 12px;
//       padding: 15px;
//       height: 100px;
//     }
//     .signature-card {
//       flex: 1;
//       background-color: #fcf4fc;
//       border-radius: 12px;
//       padding: 15px;
//       height: 100px;
//       display: flex;
//       flex-direction: column;
//       justify-content: space-between;
//     }
//     .card-title {
//       font-weight: bold;
//       color: #531b4e;
//       font-size: 10px;
//       margin-bottom: 5px;
//     }
//     .signature-line {
//       border-bottom: 1px solid #333;
//       width: 80%;
//       margin: 0 auto 2px auto;
//     }
//     .signature-text {
//       text-align: center;
//       font-size: 9px;
//       color: #333;
//     }

//     .registered-address {
//       font-size: 8px;
//       margin-bottom: 15px;
//       color: #333;
//     }

//     .terms-card {
//       background-color: #fcf4fc;
//       border-radius: 12px;
//       padding: 15px;
//       margin-bottom: 10px;
//     }
//     .terms-list { 
//       padding-left: 15px; 
//       margin: 5px 0 0 0; 
//     }
//     .terms-list li { 
//       margin-bottom: 2px; 
//       font-size: 8px; 
//       color: #333;
//       line-height: 1.3;
//       text-align: justify;
//     }
//   </style>
// </head>

// <body>

// <div class="header-card">
//   <div class="header-left">
//     <img src="${logoSrc}" class="logo-img" alt="Nazara Diamonds" />
//   </div>
//   <div class="header-right">
//     <div class="company-title">Nazara Diamonds</div>
//     <div class="company-tagline">Real Diamonds. Ethically Grown.</div>
//     <div class="header-divider"></div>
//     <div class="company-info">
//       Store Address: 106, ShivOm Complex, M.G. Road, Opposite TI Mall, Indore, 452001<br>
//       GSTIN: 23AAKCN6666JIZO | CIN: U47733MP2025PTC077889
//     </div>
//   </div>
// </div>

// <div class="info-bar">
//   <div class="info-item">
//     <div class="info-label">Document No</div>
//     <div class="info-value theme-color">${invoice.invoiceNo}</div>
//   </div>
//   <div class="info-item">
//     <div class="info-label">Date</div>
//     <div class="info-value">${today}</div>
//   </div>
//   <div class="info-item">
//     <div class="info-label">Copy</div>
//     <div class="info-value">Original</div>
//   </div>
//   <div class="info-item">
//     <div class="info-label">Order/Ref</div>
//     <div class="info-value">${getOrderRefLabel()}</div>
//   </div>
//   <div class="info-item">
//     <div class="info-label">Salesperson</div>
//     <div class="info-value">${safe(invoice.salesperson)||"-"}</div>
//   </div>
//   <div class="info-item">
//     <div class="info-label">Delivery Mode</div>
//     <div class="info-value">Store Pickup</div>
//   </div>
//   <div class="info-item">
//     <div class="info-label">POS</div>
//     <div class="info-value">Indore</div>
//   </div>
// </div>

// <div class="details-box">
//   <div class="box-panel">
//     <div class="box-title">Customer Details</div>
//     <div class="box-content">
//         <div><b>Name: ${invoice.customer.name}</b></div>
//         <div>Mobile: ${invoice.customer.mobile}</div>
//         ${invoice.customer?.email ? `<div>Email: ${invoice.customer.email}</div>` : ``}
//         ${invoice.customer?.address ? `<div>Address: ${invoice.customer.address}</div>` : ``}
//         ${invoice.customer?.gstin ? `<div>GSTIN: ${invoice.customer.gstin}</div>` : ``}
//          ${invoice.customer?.stateCode ? `<div>State Code: ${invoice.customer.stateCode}</div>` : ``}
//     </div>
//   </div>
//   <div class="box-panel">
//     <div class="box-title">Payment & Delivery</div>
//     <div class="box-content">
//         <div>Mode: ${invoice.payment?.mode || "CASH"}</div>
//         <div>Ref: ${invoice.payment?.referenceNo || "-"}</div>
//         <div>Status: <b>${invoice.payment?.status || "PAID"}</b></div>
//     </div>
//   </div>
// </div>

// <table>
//   <colgroup>
//     <col style="width: 3%;">  <col style="width: 8%;"> <col style="width: 5%;">  <col style="width: 5%;">  <col style="width: 3%;">  <col style="width: 4%;">  <col style="width: 4%;">  <col style="width: 5%;">  <col style="width: 5%;">  <col style="width: 4%;">  <col style="width: 5%;">  <col style="width: 4%;">  <col style="width: 4%;">  <col style="width: 5%;">  <col style="width: 6%;">  <col style="width: 5%;">  <col style="width: 5%;">  <col style="width: 5%;">  <col style="width: 8%;">  </colgroup>
//   <thead>
//     <tr>
//       <th>Qty</th>
//       <th style="text-align:left;">Product\nTitle</th>
//       <th>HSN</th>
//       <th>Metal\nType</th> <th>Purity\n(kt)</th>
//       <th>Gross\nWt (g)</th>
//       <th>Net\nWt (g)</th>
//       <th>Metal\nRate</th> 
//       <th>Cert\nNo.</th>
//       <th>Dia \nwt (ct)</th>
//       <th>Dia\nRate</th>
//       <th>Stone\nwt (ct)</th>
//       <th>Stone\nValue</th>
//       <th>Making\n(₹)</th>
//       <th>Product\nPrice (₹)</th>
//       <th>Scheme\nDisc</th>
//       <th>SGST\n1.5%</th>
//       <th>CGST\n1.5%</th>
//       <th>Product\nValue (₹)</th>
//     </tr>
//   </thead>
//   <tbody>
// ${invoice.items.map((item) => {
//   const pd = item.itemSnapshot?.productDetails || {};
//   const pricing = item.breakup || {};
//   const breakup = pricing.componentBreakup || [];

//  const desc =
//   pd.title ||
//   item.itemSnapshot?.title ||
//   "Custom Jewellery";

//   const metalType = pd.metalType || "Gold";
//   const purity = Number(pd.metalPurity?.replace("KT", "")) || 0;

//   const grossWt = Number(pd.grossWeight || 0);
//   const netWt = Number(pd.netWeight || 0);

//   /* ---------------- DIAMONDS (NO MERGE) ---------------- */
//   const diamondLines = breakup
//     .filter(c => c.pricingRef === "DIAMOND")
//     .map(c =>
//       `${c.count}×${c.weight} @ ${fmt(c.rate)}`
//     )
//     .join("<br>");

//   // const diamondWt = breakup
//   //   .filter(c => c.pricingRef === "DIAMOND")
//   //   .map(c => `${c.count}×${c.weight}`)
//   //   .join("<br>");

//   const diamondWt = breakup
//     .filter(c => c.pricingRef === "DIAMOND")
//     .map(c => {
//       const gross =
//         c.grossWeight && c.grossWeight > 0
//           ? c.grossWeight
//           : (c.weight || 0) * (c.count || 1);
//       return `${gross} ct`;
//     })
//     .join("<br>");


//   const diamondRate = breakup
//     .filter(c => c.pricingRef === "DIAMOND")
//     .map(c => fmt(c.rate))
//     .join("<br>");

//   /* ---------------- STONES (NO MERGE) ---------------- */
//   const stoneLines = breakup
//     .filter(c => c.pricingRef === "STONE")
//     .map(c =>
//       `${c.count}×${c.weight || 1}`
//     )
//     .join("<br>");

//   const stoneValueLines = breakup
//     .filter(c => c.pricingRef === "STONE")
//     .map(c => fmt(c.value))
//     .join("<br>");

//   /* ---------------- METAL ---------------- */
//   const metalRate =
//     pricing.metalRateLocked ||
//     pricing.metalRate ||
//     0;

//   const making = Number(pricing.makingCharge || 0);
//   const productPrice = Number(pricing.subtotal || 0);
//   const gst = Number(pricing.gst || 0);

//   const sgst = gst / 2;
//   const cgst = gst / 2;

//   const schemeDisc = Number(pricing.discount || 0);
//   const finalValue = productPrice + gst;

//   return `
//     <tr>
//       <td>${item.quantity || 1}</td>
//       <td class="td-left">${safe(desc)}</td>
//       <td>${safe(item.hsn || pd.hsnCode)}</td>
//       <td>${safe(metalType)}</td>
//       <td>${purity}</td>
//       <td>${fmt(grossWt)}</td>
//       <td>${fmt(netWt)}</td>
//       <td>${fmt(metalRate)}</td>
//       <td>${safe(item.certificateNo)}</td>

//       <td>${diamondWt || "-"}</td>
//       <td>${diamondRate || "-"}</td>

//       <td>${stoneLines || "-"}</td>
//       <td>${stoneValueLines || "-"}</td>

//       <td>${fmt(making)}</td>
//       <td>${fmt(productPrice)}</td>
//       <td>${fmt(schemeDisc)}</td>
//       <td>${fmt(sgst)}</td>
//       <td>${fmt(cgst)}</td>
//       <td class="bold">${fmt(finalValue)}</td>
//     </tr>
//   `;
// }).join("")}

//   </tbody>
//   <tfoot>
//   <tr style="background-color:#f9f3f9; font-weight:bold;">
// <tr style="background-color:#f9f3f9; font-weight:bold;">
// <td colspan="14" class="td-right">Totals</td>
// <td>${fmt(invoice.totals.subtotal)}</td>
// <td>${fmt(invoice.totals.discount || 0)}</td>
// <td>${fmt(invoice.totals.gst / 2)}</td>
// <td>${fmt(invoice.totals.gst / 2)}</td>
// <td>${fmt(invoice.totals.grandTotal)}</td>
// </tr>

// ${
// invoice.totals.advancePayment > 0
// ? `
// <tr>
// <td colspan="18" class="td-right bold">Less: Advance Payment</td>
// <td class="bold">- ${fmt(invoice.totals.advancePayment)}</td>
// </tr>`
// : ""
// }

// ${
// orderMetal > 0
// ? `
// <tr>
// <td colspan="18" class="td-right bold">Less: Order Metal</td>
// <td class="bold">- ${fmt(orderMetal)}</td>
// </tr>`
// : ""
// }

// ${
// invoiceMetal > 0
// ? `
// <tr>
// <td colspan="18" class="td-right bold">Less: Invoice Metal</td>
// <td class="bold">- ${fmt(invoiceMetal)}</td>
// </tr>`
// : ""
// }

// <tr style="background-color:#f9f3f9; font-weight:bold;">
// <td colspan="18" class="td-right">Net Payable</td>
// <td>${fmt(invoice.totals.netPayable)}</td>
// </tr>
//   </tr>
// </tfoot>


// </table>

// <div class="charges-title bold theme-color mb-1" style="font-size:9px;">Other Charges & Payment Details</div>
// <div class="charges-container">

//   <div class="charges-half left-half">
//     <div class="c-row">
//       <div class="c-label">Other Charges (₹)</div>
//       <div class="c-val">0.00</div>
//     </div>
//     <div class="c-row">
//       <div class="c-label">Additional Other Charges (₹)</div>
//       <div class="c-val">0.00</div>
//     </div>
//     <div class="c-row last">
//       <div class="c-label bold">Total Other Charges (₹)</div>
//       <div class="c-val bold">0.00</div>
//     </div>
//   </div>

//   <div class="charges-half">
//     <div class="c-row">
//       <div class="c-label">Payment Mode</div>
//       <div class="c-val" style="width:140px;">${invoice.payment?.mode || "Cash / UPI / Card"}</div>
//     </div>
//     <div class="c-row">
//       <div class="c-label">Payment Reference No.</div>
//       <div class="c-val" style="width:140px;">${invoice.payment?.referenceNo || "---------"}</div>
//     </div>
//     <div class="c-row last">
//       <div class="c-label bold">Total Amount to be Paid (₹)</div>
//       <div class="c-val bold" style="width:140px;">${fmt(invoice.totals.grandTotal)}</div>
//     </div>
//   </div>

// </div>

// <div class="amount-words-section">
//   <div class="bold theme-color">Amount in Words</div>
//   <div>${amountInWords}</div>
// </div>

// <div class="footer-split">
//   <div class="notes-card">
//     <div class="card-title">Notes</div>
//   </div>

//   <div class="signature-card">
//     <div class="card-title">Signature</div>
//     <div>
//       <div class="signature-line"></div>
//       <div class="signature-text">Authorised Signatory</div>
//     </div>
//   </div>
// </div>

// <div class="registered-address">
//   <strong>Registered office & correspondence:</strong><br>
//   Nazara Diamonds, 402, Vibrant Business Centre, Manormaganj, Indore · Email: contact@nazara.in · Phone: +91-9876543210
// </div>

// <div class="terms-card">
//   <div class="card-title">Terms & Conditions</div>
//   <ol class="terms-list">
//     <li>All diamonds sold are lab-grown and are supplied with appropriate grading and certification where applicable.</li>
//     <li>Gold purity and weights are recorded as per store weighing standards; minor variations due to scale tolerance are normal and acceptable.</li>
//     <li>Prices are based on prevailing gold, diamond and gemstone rates at the time of billing and are subject to change for future orders or re-makes.</li>
//     <li>Returns or exchanges, if allowed, are strictly at the discretion of Nazara Diamonds and subject to physical inspection and approval of the item's condition.</li>
//     <li>Any customised, engraved, altered or specially ordered pieces are not eligible for cancellation, return or cash refund.</li>
//     <li>Manufacturing defects reported within the specified warranty period will be serviced, repaired or replaced as per brand policy. Normal wear and tear or mishandling is not covered.</li>
//     <li>GST and any other applicable taxes are charged as per Government regulations in force on the date of invoice. Tax components are clearly shown on the invoice wherever applicable.</li>
//     <li>In case of exchange or buy-back, the valuation will be done as per the prevailing exchange policy of Nazara Diamonds at that time, which may differ from original purchase price.</li>
//     <li>The customer is requested to verify the invoice details, weights and rate calculations before leaving the counter. Any discrepancy should be reported immediately.</li>
//     <li>In case of any dispute, the decision of Nazara Diamonds shall be final and binding. All disputes are subject to Indore jurisdiction only.</li>
//   </ol>
// </div>

// </body>
// </html>
// `;
// };





















import fs from "fs";
import path from "path";

export const invoiceTemplate = (invoice) => {
  // --- 1. IMAGE LOADING LOGIC ---   
  let logoSrc = "";
  try {
    const logoPath = path.join(process.cwd(), "assets", "NazaraPurple.png");
    const bitmap = fs.readFileSync(logoPath);
    const base64 = bitmap.toString("base64");
    logoSrc = `data:image/png;base64,${base64}`;
  } catch (err) {
    console.error("Error loading logo image:", err.message);
    logoSrc = "";
  }

  // --- Helpers ---
  const fmt = (n) =>
    Number(n || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const safe = (v) => (v ?? "-");

  const today = new Date(invoice.date || invoice.createdAt).toLocaleDateString("en-GB");

  // --- Order Ref Logic ---
  const getOrderRefLabel = () => {
    const orders = new Set();
    if (invoice.orderNo) orders.add(invoice.orderNo);
    if (invoice.items && Array.isArray(invoice.items)) {
      invoice.items.forEach((item) => {
        const ref =
          item.orderNo ||
          item.itemSnapshot?.orderNo ||
          item.customSnapshot?.orderNo;
        if (ref) orders.add(ref);
      });
    }
    const orderList = Array.from(orders).filter(Boolean);
    return orderList.length > 0 ? orderList.join(", ") : "Store Product";
  };

  // --- Number to Words ---
  const toWords = (num) => {
    const a = ["", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    if ((num = num.toString()).length > 9) return "Overflow";
    const n = ("000000000" + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return "";
    let str = "";
    str += Number(n[1]) !== 0 ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + "Crore " : "";
    str += Number(n[2]) !== 0 ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + "Lakh " : "";
    str += Number(n[3]) !== 0 ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + "Thousand " : "";
    str += Number(n[4]) !== 0 ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + "Hundred " : "";
    str += Number(n[5]) !== 0 ? (str !== "" ? "and " : "") + (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]]) + "Rupees Only" : "Rupees Only";
    return str;
  };

  const amountInWords = toWords(
    Math.round(invoice.totals.netPayable || invoice.totals.grandTotal)
  );

  // --- Metal Payment Breakdown ---
  const orderMetal = (invoice.metalPayments || [])
    .filter(p => p.source === "ORDER")
    .reduce((s, p) => s + Number(p.totalValue || 0), 0);

  const invoiceMetal = (invoice.metalPayments || [])
    .filter(p => p.source === "INVOICE")
    .reduce((s, p) => s + Number(p.totalValue || 0), 0);

  // --- Collect unique metal rates for the pre-table row ---
  const metalRateLines = invoice.items.map((item, index) => {
    const pricing = item.breakup || {};
    const metalRate = pricing.metalRateLocked || pricing.metalRate || 0;
    const pd = item.itemSnapshot?.productDetails || {};
    const metalType = pd.metalType || "Gold";
    const purity = Number(pd.metalPurity?.replace("KT", "")) || 0;
    return `Item ${index + 1}: ${metalType} ${purity}KT @ ₹${fmt(metalRate)}/g`;
  }).join("  |  ");

  const hasAdjustment =
    (invoice.totals.advancePayment || 0) > 0 ||
    (invoice.metalPayments || []).some(p => Number(p.totalValue || 0) > 0);

  // --- HTML Output ---
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${invoice.invoiceNo}</title>
  <style>
    @page { size: A4; margin: 15px; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      font-size: 8px;
      color: #333;
      margin: 0;
      padding: 0;
      line-height: 1.3;
    }

    /* Colors */
    .theme-color { color: #531b4e; }
    .bg-theme { background-color: #531b4e; color: #fff; }
    .bg-light { background-color: #f9f3f9; }
    .bg-card { background-color: #fcf4fc; }

    /* Layout Utilities */
    .flex { display: flex; }
    .justify-between { justify-content: space-between; }
    .bold { font-weight: bold; }
    .text-right { text-align: right; }
    .mb-2 { margin-bottom: 8px; }

    /* --- HEADER STYLES --- */
    .header-card {
      display: flex;
      background-color: #fcf4fc;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 15px;
      border: 1px solid #f0e0f0;
    }
    .header-left {
      width: 35%;
      background-color: #531b4e;
      padding: 15px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 12px;
    }
    .header-right {
      width: 65%;
      padding: 15px 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .logo-img {
      width: 100%;
      max-width: 180px;
      filter: brightness(0) invert(1);
    }
    .company-title {
      font-size: 20px;
      font-weight: bold;
      color: #531b4e;
      margin-bottom: 2px;
    }
    .company-tagline {
      font-size: 9px;
      color: #531b4e;
      margin-bottom: 8px;
    }
    .header-divider {
      border-bottom: 1px solid #dcb5d6;
      margin-bottom: 8px;
      width: 100%;
    }
    .company-info {
      font-size: 9px;
      color: #333;
      line-height: 1.4;
    }

    /* --- Info Bar --- */
    .info-bar {
      display: flex;
      justify-content: space-between;
      background-color: #f9f3f9;
      border: 1px solid #e0e0e0;
      padding: 6px 10px;
      margin-bottom: 10px;
      border-radius: 4px;
    }
    .info-item { text-align: center; }
    .info-label { font-size: 7px; color: #666; margin-bottom: 2px; }
    .info-value { font-size: 9px; font-weight: bold; color: #333; }

    /* --- Details Box --- */
    .details-box { display: flex; gap: 10px; margin-bottom: 10px; }
    .box-panel {
      flex: 1;
      border: 1px solid #e0e0e0;
      padding: 10px;
      border-radius: 4px;
      min-height: 90px;
      display: flex;
      flex-direction: column;
    }
    .box-title {
      color: #531b4e;
      font-weight: bold;
      border-bottom: 1px solid #eee;
      padding-bottom: 4px;
      margin-bottom: 6px;
      font-size: 9px;
    }
    .box-content {
      font-size: 8px;
      line-height: 1.4;
      word-wrap: break-word;
    }

    /* --- Metal Rate Row (above table) --- */
    .metal-rate-bar {
      display: flex;
      align-items: center;
      background-color: #f2edf2;
      border: 1px solid #dcb5d6;
      border-radius: 4px 4px 0 0;
      padding: 5px 10px;
      font-size: 8.5px;
      margin-bottom: 0;
      border-bottom: none;
    }
    .metal-rate-bar .mr-label {
      font-weight: bold;
      color: #531b4e;
      margin-right: 8px;
      white-space: nowrap;
    }
    .metal-rate-bar .mr-values {
      color: #333;
    }

    /* --- Table --- */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
      table-layout: fixed;
    }
    th {
      background-color: #f2edf2;
      color: #531b4e;
      padding: 4px 2px;
      border: 1px solid #e0e0e0;
      font-weight: bold;
      text-align: center;
      vertical-align: middle;
      font-size: 8px;
      white-space: pre-wrap;
      overflow: hidden;
    }
    td {
      border: 1px solid #e0e0e0;
      padding: 4px 2px;
      text-align: center;
      color: #1d1c1c;
      vertical-align: middle;
      font-size: 8.5px;
      word-wrap: break-word;
    }
    .td-left { text-align: left; padding-left: 4px; }
    .td-right { text-align: right; padding-right: 4px; }

    /* --- Tax & Total Summary Box (below table) --- */
    .tax-summary-row {
      display: flex;
      margin-bottom: 10px;
      gap: 0;
      margin-right: 1px;
    }
    .tax-summary-blank {
      flex: 1;
      /* intentionally empty left side */
    }
    .tax-summary-box {
      width: 340px;
      border: 1px solid #531b4e;
      border-radius: 4px;
      overflow: hidden;
      font-size: 8px;
    }
    .ts-row {
      display: flex;
      border-bottom: 1px solid #dcb5d6;
      min-height: 20px;
    }
    .ts-row.last { border-bottom: none; }
    .ts-row.highlight { background-color: #f9f3f9; }
    .ts-label {
      flex: 1;
      padding: 4px 8px;
      color: #531b4e;
      font-weight: bold;
      border-right: 1px solid #dcb5d6;
      display: flex;
      align-items: center;
    }
    .ts-val {
      width: 110px;
      padding: 4px 8px;
      text-align: right;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      color: #333;
    }
    .ts-val.bold { font-weight: bold; }

    /* --- Charges Grid --- */
    .charges-container {
      display: flex;
      border: 1px solid #531b4e;
      border-radius: 4px;
      overflow: hidden;
      font-size: 8px;
      margin-bottom: 10px;
    }
    .charges-half {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .left-half { border-right: 1px solid #531b4e; }
    .c-row {
      display: flex;
      border-bottom: 1px solid #531b4e;
      min-height: 22px;
    }
    .c-row.last { border-bottom: none; }
    .c-label {
      flex: 1;
      padding: 4px 8px;
      color: #531b4e;
      border-right: 1px solid #531b4e;
      display: flex;
      align-items: center;
    }
    .c-val {
      width: 100px;
      padding: 4px 8px;
      text-align: right;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      color: #333;
    }

    .amount-words-section {
      margin-bottom: 10px;
      font-size: 9px;
    }

    /* --- Footer Split --- */
    .footer-split {
      display: flex;
      gap: 20px;
      margin-bottom: 15px;
    }
    .notes-card {
      flex: 1;
      background-color: #fcf4fc;
      border-radius: 12px;
      padding: 15px;
      height: 100px;
    }
    .signature-card {
      flex: 1;
      background-color: #fcf4fc;
      border-radius: 12px;
      padding: 15px;
      height: 100px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .card-title {
      font-weight: bold;
      color: #531b4e;
      font-size: 10px;
      margin-bottom: 5px;
    }
    .signature-line {
      border-bottom: 1px solid #494649;
      width: 80%;
      margin: 0 auto 2px auto;
    }
    .signature-text {
      text-align: center;
      font-size: 9px;
      color: #333;
    }

    .registered-address {
      font-size: 8px;
      margin-bottom: 15px;
      color: #333;
    }

    .terms-card {
      background-color: #fcf4fc;
      border-radius: 12px;
      padding: 15px;
      margin-bottom: 10px;
    }
    .terms-list {
      padding-left: 15px;
      margin: 5px 0 0 0;
    }
    .terms-list li {
      margin-bottom: 2px;
      font-size: 8px;
      color: #333;
      line-height: 1.3;
      text-align: justify;
    }
  </style>
</head>

<body>

<div class="header-card">
  <div class="header-left">
    <img src="${logoSrc}" class="logo-img" alt="Nazara Diamonds" />
  </div>
  <div class="header-right">
    <div class="company-title">Nazara Diamonds</div>
    <div class="company-tagline">Lab Grown Diamonds.</div>
    <div class="header-divider"></div>
    <div class="company-info">
      Store Address: 106, ShivOm Complex, M.G. Road, Opposite TI Mall, Indore, 452001<br>
      GSTIN: 23AAKCN6666JIZO | CIN: U47733MP2025PTC077889
    </div>
  </div>
</div>

<div class="info-bar">
  <div class="info-item">
    <div class="info-label">Document No</div>
    <div class="info-value theme-color">${invoice.invoiceNo}</div>
  </div>
  <div class="info-item">
    <div class="info-label">Date</div>
    <div class="info-value">${today}</div>
  </div>
  <div class="info-item">
    <div class="info-label">Copy</div>
    <div class="info-value">Original</div>
  </div>
  <div class="info-item">
    <div class="info-label">Order/Ref</div>
    <div class="info-value">${getOrderRefLabel()}</div>
  </div>
  <div class="info-item">
    <div class="info-label">Salesperson</div>
    <div class="info-value">${safe(invoice.salesperson)}</div>
  </div>
  <div class="info-item">
    <div class="info-label">Delivery Mode</div>
    <div class="info-value">Store Pickup</div>
  </div>
  <div class="info-item">
    <div class="info-label">POS</div>
    <div class="info-value">Indore</div>
  </div>
</div>

<div class="details-box">
  <div class="box-panel">
    <div class="box-title">Customer Details</div>
    <div class="box-content">
      <div><b>Name: ${invoice.customer.name}</b></div>
      <div>Mobile: ${invoice.customer.mobile}</div>
      ${invoice.customer?.email ? `<div>Email: ${invoice.customer.email}</div>` : ``}
      ${invoice.customer?.address ? `<div>Address: ${invoice.customer.address}</div>` : ``}
      ${invoice.customer?.gstin ? `<div>GSTIN: ${invoice.customer.gstin}</div>` : ``}
      ${invoice.customer?.stateCode ? `<div>State Code: ${invoice.customer.stateCode}</div>` : ``}
    </div>
  </div>
  <div class="box-panel">
    <div class="box-title">Payment & Delivery</div>
    <div class="box-content">
      <div>Mode: ${invoice.payment?.mode || "CASH"}</div>
      <div>Ref: ${invoice.payment?.referenceNo || "-"}</div>
      <div>Status: <b>${invoice.payment?.status || "PAID"}</b></div>
    </div>
  </div>
</div>

<!-- CHANGE 2: Metal Rate shown above the table in a single bar -->
<div class="metal-rate-bar">
  <span class="mr-label">Metal Rate (per gram):</span>
  <span class="mr-values">${metalRateLines}</span>
</div>

<table>
  <colgroup>
    <col style="width: 5%;">   <!-- S.No -->
    <col style="width: 10%;">   <!-- Product Title -->
    <col style="width: 4%;">   <!-- Qty -->
    <col style="width: 5%;">   <!-- HSN -->
    <col style="width: 7%;">   <!-- Gross Wt -->
    <col style="width: 7%;">   <!-- Net Wt -->
    <col style="width: 7%;">   <!-- Cert No -->
    <col style="width: 8%;">   <!-- Dia Size -->
    <col style="width: 8%;">   <!-- Dia Rate -->
    <col style="width: 8%;">   <!-- Stone Value -->
    <col style="width: 8%;">   <!-- Making -->
    <col style="width: 8%;">   <!-- Scheme Disc -->
    <col style="width: 13%;">  <!-- Product Price -->
  </colgroup>


  <thead>
    <tr>
      <th>S.No</th>
      <th>Product\nTitle</th>
      <th>Qty</th>
      <th>HSN</th>
      <th>Gross\nWt (g)</th>
      <th>Net\nWt (g)</th>
      <th>Cert\nNo.</th>
      <th>Dia wt\n (ct)</th>
      <th>Dia\nRate</th>
      
      <th>Stone\nValue</th>
      <th>Making\n(₹)</th>
      <th>Scheme\nDisc</th>
      <th>Product\nPrice (₹)</th>
    </tr>
  </thead>
  <tbody>
${invoice.items.map((item, index) => {
    const pd = item.itemSnapshot?.productDetails || {};
    const pricing = item.breakup || {};
    const breakup = pricing.componentBreakup || [];

    const desc =
      pd.title ||
      item.itemSnapshot?.title ||
      "Custom Jewellery";

    const metalType = pd.metalType || "Gold";
    const purity = Number(pd.metalPurity?.replace("KT", "")) || 0;

    const grossWt = Number(pd.grossWeight || 0);
    const netWt = Number(pd.netWeight || 0);

    const diamondWt = breakup
      .filter(c => c.pricingRef === "DIAMOND")
      .map(c => {
        const gross =
          c.grossWeight && c.grossWeight > 0
            ? c.grossWeight
            : (c.weight || 0) * (c.count || 1);
        return `${gross} ct`;
      })
      .join("<br>");

    const diamondRate = breakup
      .filter(c => c.pricingRef === "DIAMOND")
      .map(c => fmt(c.rate))
      .join("<br>");

    const stoneLines = breakup
      .filter(c => c.pricingRef === "STONE")
      .map(c => `${c.count}×${c.weight || 1}`)
      .join("<br>");

    const stoneValueLines = breakup
      .filter(c => c.pricingRef === "STONE")
      .map(c => fmt(c.value))
      .join("<br>");

    const making = Number(pricing.makingCharge || 0);
    const productPrice = Number(pricing.subtotal || 0);
    const schemeDisc = Number(pricing.discount || 0);

    return `
    <tr>
      <td>${index + 1}</td>
      <td>${safe(desc)}</td>
      <td>${item.quantity || 1}</td>
      <td>${safe(item.hsn || pd.hsnCode)}</td>
      <td>${fmt(grossWt)}</td>
      <td>${fmt(netWt)}</td>
      <td>
        ${(() => {
        const certArray = item.certificates || pd.certificates || (item.itemSnapshot?.certificates) || [];
        const certFallback = Array.isArray(certArray) && certArray.length > 0
          ? certArray.map(c => `${c.lab} - ${c.certificateNo}`).join(", ")
          : (pd.certificateNo || item.certificateNo || "-");
        return safe(certFallback);
      })()}
      </td>
      <td>${diamondWt || "-"}</td>
      <td>${diamondRate || "-"}</td>
     
      <td>${stoneValueLines || "-"}</td>
      <td>${fmt(making)}</td>
      <td>${fmt(schemeDisc)}</td>
      <td>${fmt(productPrice)}</td>
    </tr>
  `;
  }).join("")}
  </tbody>
  <tfoot>
    <tr style="background-color:#f9f3f9; font-weight:bold;">
      <td colspan="11" class="td-right">Totals</td>
      <td>${fmt(invoice.totals.discount || 0)}</td>
      <td>${fmt(invoice.totals.subtotal)}</td>
    </tr>
  </tfoot>
</table>

<!-- CHANGE 1: SGST, CGST, Grand Total shown in box on right side -->
<div class="tax-summary-row">
  <div class="tax-summary-blank"></div>
  <div class="tax-summary-box">
    <div class="ts-row">
      <div class="ts-label">SGST 1.5% (₹)</div>
      <div class="ts-val">${fmt(invoice.totals.gst / 2)}</div>
    </div>
    <div class="ts-row">
      <div class="ts-label">CGST 1.5% (₹)</div>
      <div class="ts-val">${fmt(invoice.totals.gst / 2)}</div>
    </div>
    <div class="ts-row highlight">
      <div class="ts-label">Grand Total (₹)</div>
      <div class="ts-val bold">${fmt(invoice.totals.grandTotal)}</div>
    </div>
    ${invoice.totals.advancePayment > 0 ? `
    <div class="ts-row">
      <div class="ts-label">Less: Advance Payment (₹)</div>
      <div class="ts-val">- ${fmt(invoice.totals.advancePayment)}</div>
    </div>` : ""}
    ${(invoice.metalPayments || []).filter(p => p.source === "ORDER").reduce((s, p) => s + Number(p.totalValue || 0), 0) > 0 ? `
    <div class="ts-row">
      <div class="ts-label">Less: Order Metal (₹)</div>
      <div class="ts-val">- ${fmt((invoice.metalPayments || []).filter(p => p.source === "ORDER").reduce((s, p) => s + Number(p.totalValue || 0), 0))}</div>
    </div>` : ""}
    ${(invoice.metalPayments || []).filter(p => p.source === "INVOICE").reduce((s, p) => s + Number(p.totalValue || 0), 0) > 0 ? `
    <div class="ts-row">
      <div class="ts-label">Less: Metal Payment (₹)</div>
      <div class="ts-val">- ${fmt((invoice.metalPayments || []).filter(p => p.source === "INVOICE").reduce((s, p) => s + Number(p.totalValue || 0), 0))}</div>
    </div>` : ""}
   ${hasAdjustment ? `
<div class="ts-row last highlight">
  <div class="ts-label">Payable Amount (₹)</div>
  <div class="ts-val bold">${fmt(invoice.totals.netPayable)}</div>
</div>
` : ``}
  </div>
</div>

<div class="charges-title bold theme-color mb-1" style="font-size:9px;">Other Charges & Payment Details</div>
<div class="charges-container">

  <div class="charges-half left-half">
    <div class="c-row">
      <div class="c-label">Other Charges (₹)</div>
      <div class="c-val">0.00</div>
    </div>
    <div class="c-row">
      <div class="c-label">Additional Other Charges (₹)</div>
      <div class="c-val">0.00</div>
    </div>
    <div class="c-row last">
      <div class="c-label bold">Total Other Charges (₹)</div>
      <div class="c-val bold">0.00</div>
    </div>
  </div>

  <div class="charges-half">
    <div class="c-row">
      <div class="c-label">Payment Mode</div>
      <div class="c-val" style="width:140px;">${invoice.payment?.mode || "Cash / UPI / Card"}</div>
    </div>
    <div class="c-row">
      <div class="c-label">Payment Reference No.</div>
      <div class="c-val" style="width:140px;">${invoice.payment?.referenceNo || "---------"}</div>
    </div>
    <div class="c-row last">
      <div class="c-label bold">Total Amount to be Paid (₹)</div>
      <div class="c-val bold" style="width:140px;">${fmt(invoice.totals.grandTotal)}</div>
    </div>
  </div>

</div>

<div class="amount-words-section">
  <div class="bold theme-color">Amount in Words</div>
  <div>${amountInWords}</div>
</div>

<div class="footer-split">
  <div class="notes-card">
    <div class="card-title">Notes</div>
  </div>

  <div class="signature-card">
    <div class="card-title">Signature</div>
    <div>
      <div class="signature-line"></div>
      <div class="signature-text">Authorised Signatory</div>
    </div>
  </div>
</div>

<div class="registered-address">
  <strong>Registered office & correspondence:</strong><br>
  Nazara Diamonds, 402, Vibrant Business Centre, Manormaganj, Indore · Email: support@nazaradiamonds.com · Phone: +91-9174803003
</div>

<div class="terms-card">
  <div class="card-title">Terms & Conditions</div>
  <ol class="terms-list">
    <li>All diamonds sold are lab-grown and are supplied with appropriate grading and certification where applicable.</li>
    <li>Gold purity and weights are recorded as per store weighing standards; minor variations due to scale tolerance are normal and acceptable.</li>
    <li>Prices are based on prevailing gold, diamond and gemstone rates at the time of billing and are subject to change for future orders or re-makes.</li>
    <li>Returns or exchanges, if allowed, are strictly at the discretion of Nazara Diamonds and subject to physical inspection and approval of the item's condition.</li>
    <li>Any customised, engraved, altered or specially ordered pieces are not eligible for cancellation, return or cash refund.</li>
    <li>Manufacturing defects reported within the specified warranty period will be serviced, repaired or replaced as per brand policy. Normal wear and tear or mishandling is not covered.</li>
    <li>GST and any other applicable taxes are charged as per Government regulations in force on the date of invoice. Tax components are clearly shown on the invoice wherever applicable.</li>
    <li>In case of exchange or buy-back, the valuation will be done as per the prevailing exchange policy of Nazara Diamonds at that time, which may differ from original purchase price.</li>
    <li>The customer is requested to verify the invoice details, weights and rate calculations before leaving the counter. Any discrepancy should be reported immediately.</li>
    <li>In case of any dispute, the decision of Nazara Diamonds shall be final and binding. All disputes are subject to Indore jurisdiction only.</li>
  </ol>
</div>

</body>
</html>
`;
};