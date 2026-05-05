// import React from "react";
// import "../styles/Invoice.css";
// import {  useState } from "react";
// import logo from "../assets/nazara_logo.png";








// const Invoice = () => {





//   const [invoice] = useState(() => {
//     const data = localStorage.getItem("invoiceData");
//     return data ? JSON.parse(data) : null;
//   });


  
 

//   if (!invoice) return <p>Loading invoice...</p>;

//   // const { customer, product, pricing, qty, invoiceNo, date  } = invoice;
//   const { customer, pricing,qty,product,date, items = [],paymentMode, transactionRef } = invoice;
// const item = items?.[0] || {};
//  // POS = single item


//   const sgst = (pricing.gst || 0) / 2;
//   const cgst = (pricing.gst || 0) / 2;

// //inword
// const numberToWordsIndian = (num) => {
//   if (!num || isNaN(num)) return "Zero Rupees Only";

//   const a = [
//     "", "One", "Two", "Three", "Four", "Five", "Six",
//     "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
//     "Thirteen", "Fourteen", "Fifteen", "Sixteen",
//     "Seventeen", "Eighteen", "Nineteen"
//   ];

//   const b = [
//     "", "", "Twenty", "Thirty", "Forty",
//     "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
//   ];

//   const inWords = (n) => {
//     if (n < 20) return a[n];
//     if (n < 100)
//       return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
//     if (n < 1000)
//       return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + inWords(n % 100) : "");
//     if (n < 100000)
//       return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + inWords(n % 1000) : "");
//     if (n < 10000000)
//       return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + inWords(n % 100000) : "");
//     return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + inWords(n % 10000000) : "");
//   };

//   return `${inWords(Math.floor(num))} Rupees Only`;
// };


// // Invoice.jsx
// // const handleSaveAndPrint = async () => {
// //   const payload = {
// //     invoiceNo: invoice.invoiceNo,

// //     customer: invoice.customer,

// //     items: [
// //       {
// //         productId: invoice.product?._id,
// //         sku: invoice.product.sku,
// //         title: invoice.product.title,
// //         qty: invoice.qty,
      
      

// //         metalWeight: invoice.product.metalWeight,
// //         diamondWeight: invoice.product.diamondWeight,
// //         stoneWeight: invoice.product.stoneWeight,

      
// //         amount: invoice.pricing.grandTotal,
// //       },
// //     ],

// //     pricing: {
// //       subtotal: invoice.pricing.subtotal,
// //       discount: invoice.pricing.discount,
// //       gst: invoice.pricing.gst,
// //       grandTotal: invoice.pricing.grandTotal,
// //     },

// //   payment: {
// //   mode: { type: String, enum: ["Cash","UPI","Card","Bank"] }
// // },



// //     source: "POS",
    
// //   };

// //   await savePosInvoice(payload);
// //   window.print();
// // };
// // const handleSaveAndPrint = () => {
// //   // 1️⃣ PRINT (always works)
// //   window.print();

// //   // 2️⃣ SAVE (schema matched)
// //   const payload = {
// //     // invoiceNo: invoice.invoiceNo,

// //     customer: invoice.customer,

// //     items: [
// //       {
// //         sku: invoice.product.sku,
// //         title: invoice.product.title,
// //         qty: invoice.qty,
// //         price: invoice.pricing.grandTotal, // 👈 schema field
// //       },
// //     ],

// //     pricing: {
// //       subtotal: invoice.pricing.subtotal,
// //       gst: invoice.pricing.gst,
// //       grandTotal: invoice.pricing.grandTotal,
// //     },

// //     // 🔥 REQUIRED FIELD
// //     paymentMode: "UPI",

// //     source: "POS",
// //   };

// //   savePosInvoice(payload).catch((err) => {
// //     console.error(
// //       "❌ POS save failed:",
// //       err.response?.data || err.message
// //     );
// //   });
// // };









//   return (
//     <div className="invoice-wrapper">
     
  
//       <div className="paper" id="paper">
//         {/* ===== HEADER ===== */}
//         <header>
//        <img src={logo} alt="Nazara Diamonds" />

//           <div>
//             <div className="brand-title inline-block  w-2/3">Nazara Diamonds
//             <div className="sub-one-one">Real Diamonds. Ethically Grown.
//             <div className="sub-one-two ">
//               Registered Office: 106, ShivOm Complex, M.G. Road, Opposite TI Mall,
//               Indore, 452001 • GSTIN: 23AAKCN6666J1Z0 • CIN:
//               U47733MP2025PTC077889
//               </div>
//               </div>
//             </div>
//               <div className="inv-div">
//             <p className="inv-no" contentEditable
//   suppressContentEditableWarning>Tax Invoice</p>
//             <p className="inv-sub">Place of Supply: Madhya Pradesh (23)</p>

//   </div>
            

//           </div>
//         </header>
        

//         {/* ===== META STRIP 1 ===== */}
        
//         <div className="meta-strip">
//           <div>
//           <div className="meta-label">
//   <strong>Document No:</strong> {invoice.invoiceNo}</div>

            
//           </div>
//           <div>
//             <div className="meta-label">Date</div>
//              {date}
//           </div>
//           <div>
//             <div className="meta-label">Time</div>
//             {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
//           </div>
//           <div>
//             <div className="meta-label">Copy</div>
//             Original
//           </div>
//           <div>
//             <div className="meta-label" contentEditable
//   suppressContentEditableWarning>Order / Ref</div>
//             ORD-0001
//           </div>
//           <div>
//             <div className="meta-label" contentEditable
//   suppressContentEditableWarning>Salesperson</div>
//             —
//           </div>
//           <div>
//             <div className="meta-label">Delivery Mode</div>
//             Store Pickup
//           </div>
//           <div>
//             <div className="meta-label"contentEditable
//   suppressContentEditableWarning>POS</div>
//             Indore
//           </div>
//         </div>

//         {/* ===== META STRIP 2 ===== */}










//  <div className="grid-2">
//     <div className="box">
//       <h3>Customer Details</h3>
//       <div><strong>Name:</strong><span id="cust-name">{customer.name}</span></div>
//       <div><strong>Address:</strong><span id="cust-address">{customer.address}</span></div>
//       <div><strong>Phone/Email:</strong> <span id="cust-mobile">{customer.mobile} </span> • <span id="cust-email">{customer.email || "—"}</span></div>
//       <div><strong>GSTIN / State Code:</strong><span id="cust-gst">{customer.gst || "—"}</span> / —</div>
//     </div>
//     <div className="box">
//       <h3>Payment & Delivery</h3>
//       <div><strong>Payment Mode:</strong> {paymentMode}</div>
//       {paymentMode !== "Cash" && (
//   <div>
//     <strong>Transaction Ref:</strong> {transactionRef || "—"}
//   </div>
// )}
//       <div><strong>Delivery To:</strong> Same as Billing</div>
//       <div><strong>Remarks:</strong> —</div>
//     </div>
//   </div>



//   <h3>Item Details</h3>
//   <div className="row-actions">
//     {/* <button onclick="addRow()">Add Product</button>
//     <button className="secondary" onclick="recalc()">Recalculate</button> */}
  
// <button className="secondary" onClick={() => window.print()}>
//   Print / Save Invoice
// </button>



//   </div>

// <div className="print-table-wrap">
//  <table id="itemTable" aria-label="Product table" className="w-full text-[12px]">
//     <thead>
//       <tr>
//         <th>#</th>
//         <th>Product Description </th>
//         <th>HSN</th>
//         <th>Purity (kt)</th>
//         <th className="right">Gross Wt (g)</th>
//         <th className="right">Net Wt (g)</th>
//         <th className="right">Fine (g)</th>
//         <th className="right">Gold Rate (₹/g)</th>
//         <th className="right">Gold Amount (₹)</th>
//         <th>Cert No.</th>
//         <th className="right">Diamond Wt  (ct)</th>
//         <th className="right">Diamond Amt (₹)</th>
//         <th className="right">Stone Wt (ct)</th>
//         <th className="right">Stone Amt (₹)</th>
//         <th className="right">Making (₹)</th>
//         <th className="right">Product Price (₹)</th>
//         <th className="right">Scheme Discount (₹)</th>
//         <th className="right">SGST 1.5% (₹)</th>
//         <th className="right">CGST 1.5% (₹)</th>
//         <th className="right">Product Value (₹)</th>
//       </tr>
//     </thead>
//     <tbody>
//       <tr>
//         <td className="center idx">1</td>
//         <td id="prod-desc"> {product.description ? `  ${product.description}` : ""}</td>

//         <td  contentEditable
//   suppressContentEditableWarning>7113</td>
//         <td id="prod-metal">{product.metalPurity?.replace("KT", "")}</td>
//        <td
//   className="right gross"
//   title={`Gold: ${item?.metalWeight}g, Diamond: ${(item?.diamondWeight * 0.2).toFixed(3)}g, Stone: ${(product.stoneWeight * 0.2).toFixed(3)}g`}>
//   {product.grossWeight.toFixed(3)}
// </td>

//         <td className="right net">{product.metalWeight}</td>
//         <td
//   className="right fine"
//   title={`Net Gold: ${product.metalWeight}g × Purity ${product.metalPurity}`}
// >
//   {product.fineGold.toFixed(3)}
// </td>

//         <td className="right rate">{pricing.metalRate}</td>
//         <td className="right goldAmt">{(pricing.metalRate * product.metalWeight * qty).toFixed(2)}</td>
//         <td contentEditable
//   suppressContentEditableWarning>IGI-12345</td>
//         <td className="right diaWt">{product.diamondSelected ? product.diamondWeight : "0.000"}</td>
//         <td className="right diaAmt"> {product.diamondSelected
//         ? (pricing.diamondRate * product.diamondWeight * qty).toFixed(2)
//         : "0.00"}</td>
//         <td className="right stoneWt">{product.otherStoneSelected ? product.stoneWeight : "0.000"}</td>
//         <td className="right stoneAmt">  {product.otherStoneSelected
//         ? (pricing.stoneRate * product.stoneWeight * qty).toFixed(2)
//         : "0.00"}</td>
//         <td className="right making">{(pricing.makingCharge * product.metalWeight * qty).toFixed(2)}</td>
//         <td className="right prodPrice">{pricing.subtotal.toFixed(2)}</td>
//         <td className="right schemeDisc">{pricing.discount.toFixed(2)}</td>
//         <td className="right sgst">{sgst.toFixed(2)}</td>
//         <td className="right cgst">{cgst.toFixed(2)}</td>
//         <td className="right prodValue">{pricing.grandTotal.toFixed(2)}</td>
//       </tr>
//     </tbody>
//     <tfoot>
//       <tr>
//         <td colspan={15} className="right"><strong>Totals (Products Only)</strong></td>
//         <td className="right" id="totProdPrice">{pricing.subtotal.toFixed(2)}</td>
//         <td className="right" id="totDisc">{pricing.discount.toFixed(2)}</td>
//         <td className="right" id="totSGST">{sgst.toFixed(2)}</td>
//         <td className="right" id="totCGST">{cgst.toFixed(2)}</td>
//         <td className="right" id="totValue"><strong>{pricing.grandTotal.toFixed(2)}</strong></td>
//       </tr>
//     </tfoot>
//   </table>

// </div>
//   <h3>Other Charges & Payment Details</h3>
//   <table  id="chargesTable"
//   contentEditable
//   suppressContentEditableWarning>
//     <thead>
//       <tr>
//         <th colspan={2}>Other Charges</th>
//         <th colspan={2}>Payment Details</th>
//       </tr>
//     </thead>
//     <tbody>
//       <tr>
//         <td>Other Charges (₹)</td>
//         <td className="right" id="other1">0.00</td>
//         <td>Payment Mode</td>
//         <td>Cash / UPI / Card</td>
//       </tr>
//       <tr>
//         <td>Additional Other Charges (₹)</td>
//         <td className="right" id="other2">0.00</td>
//         <td>Payment Reference No.</td>
//         <td>—</td>
//       </tr>
//       <tr>
//         <td><strong>Total Other Charges (₹)</strong></td>
//         <td className="right" id="totalOther">0.00</td>
//         <td><strong>Total Amount to be Paid (₹)</strong></td>
//         <td className="right" id="totalToPay">{pricing.grandTotal.toFixed(2)}</td>
//       </tr>
//     </tbody>
//   </table>



//   <h3>Amount in Words</h3>
//   <div className="box"><span id="amtWords"> {numberToWordsIndian(pricing.grandTotal)}</span></div>



//   {/* <!-- FIRST PAGE: Notes, Signature, Address --> */}
//   <div className="grid-2">              {/* style="margin-top:12px"*/}
//     <div className="box" contenteditable={true}>
//       <h3>Notes</h3>
//       <div className="notes">Add certificate no., offer code, packaging notes, etc.</div>
//     </div>
//     <div className="box center">
//       <h3>Signature</h3>
//      <div className="box-inc">  {/* style="height:120px;display:flex;align-items:flex-end;justify-content:center" */}
//         <div className="box-inc-two" >  {/* style="border-top:1px solid #000;width:70%;padding-top:6px;font-size:12px" */}
//           Authorised Signatory
//         </div>
//       </div>
//     </div>
//   </div>
                     
//   <div className="notes" >  {/* style="margin-top:10px" contenteditable="true" */}
//     Registered office & correspondence: Nazara Diamonds, 402, Vibrent Business Centre, Manormaganj, Indore • Email: contact@nazara.in • Phone: +91-9876543210
//   </div>

//   <div className="pagebreak"></div>



//   {/* <!-- SECOND PAGE: Terms & Conditions expanded --> */}
//   <div className="box border border-gray-300 rounded-lg p-4 min-h-[420px]" contenteditable={true}>   {/*  contenteditable="true" style="margin-top:12px; min-height:420px;" */}
//     <h3>Terms & Conditions</h3>

//         {/* ===== NOTES ===== */}
//         <div className="notes text-[11px] text-gray-600  leading-relaxed">
//           <p>
//             1. All diamonds sold are lab-grown and supplied with appropriate
//             grading certificates where applicable.
//           </p>
//           <p>
//             2. Gold purity and weights are recorded as per store weighing standards; minor variations due to scale tolerance are normal and acceptable.
//           </p>
//           <p>
//             3.  Prices are based on prevailing gold, diamond and gemstone rates at the time of billing and are subject to change for future orders or re-makes.
//           </p>
//           <p>
//             4. Returns or exchanges, if allowed, are strictly at the discretion of Nazara Diamonds and subject to physical inspection and approval of the item’s condition.
//           </p>
//           <p>
//             5.  Any customised, engraved, altered or specially ordered pieces are not eligible for cancellation, return or cash refund.

//           </p>
//           <p>
//             6. Manufacturing defects reported within the specified warranty period will be serviced, repaired or replaced as per brand policy. Normal wear and tear or mishandling is not covered.
//           </p>
//           <p>
//             7. GST and any other applicable taxes are charged as per Government regulations in force on the date of invoice. Tax components are clearly shown on the invoice wherever applicable.
//           </p>
//           <p>
//             8. In case of exchange or buy-back, the valuation will be done as per the prevailing exchange policy of Nazara Diamonds at that time, which may differ from original purchase price.
//           </p>
//           <p>
//             9. The customer is requested to verify the invoice details, weights and rate calculations before leaving the counter. Any discrepancy should be reported immediately.

//           </p>
//           <p>
//             10. In case of any dispute, the decision of Nazara Diamonds shall be final and binding. All disputes are subject to Indore jurisdiction only.
//           </p>
//            </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Invoice;
