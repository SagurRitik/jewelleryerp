
// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { getInvoiceById } from "../api/invoiceApi";

// export default function InvoicePreview() {
//   const { invoiceId } = useParams();
//   const [invoice, setInvoice] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!invoiceId) {
//       setError("Invalid invoice ID");
//       setLoading(false);
//       return;
//     }

//     getInvoiceById(invoiceId)
//       .then((res) => {
//         if (res.data?.success) setInvoice(res.data.invoice);
//         else setError("Invoice not found");
//       })
//       .catch(() => setError("Failed to load invoice"))
//       .finally(() => setLoading(false));
//   }, [invoiceId]);

//   if (loading) return <div className="p-6">Loading invoice…</div>;
//   if (error) return <div className="p-6 text-red-600">{error}</div>;
//   if (!invoice) return null;

//   /* ================= SAFE DESTRUCTURING ================= */
//   const {
//     invoiceNo,
//     createdAt,
//     pricing = {},
//     order = {},
//     advancePaid = 0,
//   } = invoice;

//   const pd = order.productDetails || {};

//   const balancePayable =
//     (pricing.grandTotal || 0) - (advancePaid || 0);

//   return (
//     <div className="max-w-6xl mx-auto bg-white p-8 text-sm print:p-0">

//       {/* ================= HEADER ================= */}
//       <div className="flex justify-between items-start border-b pb-4 mb-6">
//         <div>
//           <h1 className="text-2xl font-serif font-semibold">
//             Nazara Jewellery
//           </h1>
//           <p className="text-xs text-gray-600">
//             Custom Gold & Diamond Jewellery
//           </p>
//           <p className="text-xs text-gray-600">
//             Indore, Madhya Pradesh
//           </p>
//         </div>

//         <div className="text-right">
//           <h2 className="text-lg font-semibold tracking-widest">
//             TAX INVOICE
//           </h2>
//           <p>Invoice No: <b>{invoiceNo}</b></p>
//           <p>Date: {new Date(createdAt).toLocaleDateString()}</p>
//         </div>
//       </div>

//       {/* ================= CUSTOMER ================= */}
//       <div className="grid grid-cols-2 gap-6 border p-4 mb-6">
//         <div>
//           <h3 className="font-semibold mb-1">Bill To</h3>
//           {/* <p>{order.customer?.name}</p>
//           <p>{order.customer?.mobile}</p>
//           <p>{order.customer?.email}</p> */}
//           <p>{invoice.customer?.name}</p>
// <p>{invoice.customer?.mobile}</p>
// <p>{invoice.customer?.email}</p>
// <p>{invoice.customer?.address}</p>

//         </div>

//         <div>
//           <h3 className="font-semibold mb-1">Order Info</h3>
//           <p>Order No: {order.orderNo}</p>
//           <p>Order Type: {order.orderType}</p>
//           <p>Status: {order.status}</p>
//         </div>
//       </div>

//       {/* ================= ITEM TABLE ================= */}
//       <table className="w-full border text-xs mb-6">
//         <thead className="bg-gray-100">
//           <tr>
//             <th className="border p-2">#</th>
//             <th className="border p-2">Description</th>
//             <th className="border p-2">Metal</th>
//             <th className="border p-2">Weight</th>
//             <th className="border p-2">Diamond</th>
//             <th className="border p-2">Stones</th>
//             <th className="border p-2 text-right">Amount (₹)</th>
//           </tr>
//         </thead>

//         <tbody>
//           <tr>
//             <td className="border p-2 text-center">1</td>

//             <td className="border p-2">
//               {pd.category}<br />
//               Size: {pd.size || "-"}<br />
//               Purity: {pd.metalPurity}
//             </td>

//             <td className="border p-2">
//               {pd.metalType} ({pd.metalColor})
//             </td>

//             <td className="border p-2">
//               {pd.metalWeight || 0} g
//             </td>

//             <td className="border p-2">
//               {pd.diamondSelected
//                 ? `${pd.diamondWeight} ct | ${pd.diamondColor} | ${pd.diamondQuality}`
//                 : "-"}
//             </td>

//             <td className="border p-2">
//               {pd.otherStoneSelected && pd.stones?.length > 0
//                 ? pd.stones.map((s, i) => (
//                     <div key={i}>
//                       {s.stoneType} ({s.stoneWeight} ct)
//                     </div>
//                   ))
//                 : "-"}
//             </td>

//             <td className="border p-2 text-right">
//               ₹ {pricing.subtotal || 0}
//             </td>
//           </tr>
//         </tbody>
//       </table>

//       {/* ================= TOTALS ================= */}
//       <div className="flex justify-end">
//         <table className="w-1/2 border text-sm">
//           <tbody>
//             <tr>
//               <td className="border p-2">Metal Amount</td>
//               <td className="border p-2 text-right">
//                 ₹ {pricing.metalAmount || 0}
//               </td>
//             </tr>

//             <tr>
//               <td className="border p-2">Diamond Amount</td>
//               <td className="border p-2 text-right">
//                 ₹ {pricing.diamondAmount || 0}
//               </td>
//             </tr>

//             <tr>
//               <td className="border p-2">Stone Amount</td>
//               <td className="border p-2 text-right">
//                 ₹ {pricing.stoneAmount || 0}
//               </td>
//             </tr>

//             <tr>
//               <td className="border p-2">Making Charges</td>
//               <td className="border p-2 text-right">
//                 ₹ {pricing.makingAmount || 0}
//               </td>
//             </tr>

//             {pricing.discountAmount > 0 && (
//               <tr>
//                 <td className="border p-2 text-green-700">
//                   Discount
//                 </td>
//                 <td className="border p-2 text-right text-green-700">
//                   − ₹ {pricing.discountAmount}
//                 </td>
//               </tr>
//             )}

//             <tr>
//               <td className="border p-2">
//                 GST ({pricing.gstRate || 3}%)
//               </td>
//               <td className="border p-2 text-right">
//                 ₹ {pricing.gst || 0}
//               </td>
//             </tr>

//             <tr>
//               <td className="border p-2">
//                 GST on Making ({pricing.gstMakingRate || 5}%)
//               </td>
//               <td className="border p-2 text-right">
//                 ₹ {pricing.gstOnMaking || 0}
//               </td>
//             </tr>

//             <tr className="font-semibold">
//               <td className="border p-2">Grand Total</td>
//               <td className="border p-2 text-right">
//                 ₹ {pricing.grandTotal || 0}
//               </td>
//             </tr>

//             <tr>
//               <td className="border p-2">Advance Paid</td>
//               <td className="border p-2 text-right">
//                 ₹ {advancePaid || 0}
//               </td>
//             </tr>

//             <tr className="font-semibold text-red-600">
//               <td className="border p-2">Balance Payable</td>
//               <td className="border p-2 text-right">
//                 ₹ {balancePayable}
//               </td>
//             </tr>
//           </tbody>
//         </table>
//       </div>

//       {/* ================= FOOTER ================= */}
//       <div className="mt-10 flex justify-between text-xs">
//         <p>Customer Signature</p>
//         <p>Authorised Signatory</p>
//       </div>

//       <div className="mt-6 text-right print:hidden">
//         <button
//           onClick={() => window.print()}
//           className="px-6 py-2 bg-black text-white rounded"
//         >
//           Print / Save Invoice
//         </button>
//       </div>
//     </div>
//   );
// }





//==============================================================deepseek bill====
// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { getInvoiceById } from "../api/invoiceApi";
// import "../styles/Invoice.css";
// import logo from "../assets/nazara_logo.png";

// export default function InvoicePreview() {
//   const { invoiceId } = useParams();
//   const [invoice, setInvoice] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!invoiceId) {
//       setError("Invalid invoice ID");
//       setLoading(false);
//       return;
//     }

//     getInvoiceById(invoiceId)
//       .then((res) => {
//         if (res.data?.success) setInvoice(res.data.invoice);
//         else setError("Invoice not found");
//       })
//       .catch(() => setError("Failed to load invoice"))
//       .finally(() => setLoading(false));
//   }, [invoiceId]);

//   if (loading) return <div className="p-6">Loading invoice…</div>;
//   if (error) return <div className="p-6 text-red-600">{error}</div>;
//   if (!invoice) return null;

//   /* ================= SAFE DESTRUCTURING ================= */
//   const {
//     invoiceNo,
//     createdAt,
//     pricing = {},
//     order = {},
//     advancePaid = 0,
//     paymentMode = "Cash",
//     transactionRef = "",
//     customer = {}
//   } = invoice;

//   const pd = order.productDetails || {};

//   const balancePayable = (pricing.grandTotal || 0) - (advancePaid || 0);

//   // GST calculations
//   const gst = pricing.gst || 0;
//   const sgst = gst / 2;
//   const cgst = gst / 2;

//   // Product quantities
//   const qty = order.quantity || 1;

//   // Gross weight calculation
//   const calculateGrossWeight = () => {
//     const metalWeight = pd.metalWeight || 0;
//     const diamondWeight = pd.diamondWeight || 0;
//     const stoneWeight = pd.stoneWeight || 0;

//     // Diamond and stone weight conversion (ct to grams: 1 ct = 0.2 g)
//     const diamondWeightGrams = diamondWeight * 0.2;
//     const stoneWeightGrams = stoneWeight * 0.2;

//     return (metalWeight + diamondWeightGrams + stoneWeightGrams).toFixed(3);
//   };

//   // Fine gold calculation
//   const calculateFineGold = () => {
//     const metalWeight = pd.metalWeight || 0;
//     const purity = parseFloat(pd.metalPurity?.replace("KT", "") || "0") / 24;
//     return (metalWeight * purity).toFixed(3);
//   };

//   // Amount in words function
//   const numberToWordsIndian = (num) => {
//     if (!num || isNaN(num)) return "Zero Rupees Only";

//     const a = [
//       "", "One", "Two", "Three", "Four", "Five", "Six",
//       "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
//       "Thirteen", "Fourteen", "Fifteen", "Sixteen",
//       "Seventeen", "Eighteen", "Nineteen"
//     ];

//     const b = [
//       "", "", "Twenty", "Thirty", "Forty",
//       "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
//     ];

//     const inWords = (n) => {
//       if (n < 20) return a[n];
//       if (n < 100)
//         return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
//       if (n < 1000)
//         return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + inWords(n % 100) : "");
//       if (n < 100000)
//         return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + inWords(n % 1000) : "");
//       if (n < 10000000)
//         return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + inWords(n % 100000) : "");
//       return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + inWords(n % 10000000) : "");
//     };

//     return `${inWords(Math.floor(num))} Rupees Only`;
//   };

//   // Format date
//   const invoiceDate = new Date(createdAt);
//   const formattedDate = invoiceDate.toLocaleDateString('en-IN');
//   const formattedTime = invoiceDate.toLocaleTimeString('en-IN', { 
//     hour: '2-digit', 
//     minute: '2-digit' 
//   });

//   return (
//     <div className="invoice-wrapper">




//       <div className="paper" id="paper">
//         {/* ===== HEADER ===== */}
//         <header>
//           <img src={logo} alt="Nazara Diamonds" />
//           <div>
//             <div className="brand-title inline-block w-2/3">Nazara Diamonds
//               <div className="sub-one-one">Real Diamonds. Ethically Grown.
//                 <div className="sub-one-two">
//                   Registered Office: 106, ShivOm Complex, M.G. Road, Opposite TI Mall,
//                   Indore, 452001 • GSTIN: 23AAKCN6666J1Z0 • CIN:
//                   U47733MP2025PTC077889
//                 </div>
//               </div>
//             </div>
//             <div className="inv-div">
//               <p className="inv-no">Tax Invoice</p>
//               <p className="inv-sub">Place of Supply: Madhya Pradesh (23)</p>
//             </div>
//           </div>
//         </header>

//         {/* ===== META STRIP 1 ===== */}
//         <div className="meta-strip">
//           <div>
//             <div className="meta-label"><strong>Document No:</strong> {invoiceNo}</div>
//           </div>
//           <div>
//             <div className="meta-label">Date</div>
//             {formattedDate}
//           </div>
//           <div>
//             <div className="meta-label">Time</div>
//             {formattedTime}
//           </div>
//           <div>
//             <div className="meta-label">Copy</div>
//             Original
//           </div>
//           <div>
//             <div className="meta-label">Order / Ref</div>
//             {order.orderNo || "ORD-0001"}
//           </div>
//           <div>
//             <div className="meta-label">Salesperson</div>
//             —
//           </div>
//           <div>
//             <div className="meta-label">Delivery Mode</div>
//             {order.deliveryMode || "Store Pickup"}
//           </div>
//           <div>
//             <div className="meta-label">POS</div>
//             Indore
//           </div>
//         </div>

//         {/* ===== CUSTOMER & PAYMENT DETAILS ===== */}
//         <div className="grid-2">
//           <div className="box">
//             <h3>Customer Details</h3>
//             <div><strong>Name:</strong> {customer.name || "—"}</div>
//             <div><strong>Address:</strong> {customer.address || "—"}</div>
//             <div><strong>Phone/Email:</strong> {customer.mobile || "—"} • {customer.email || "—"}</div>
//             <div><strong>GSTIN / State Code:</strong> {customer.gst || "—"} / —</div>
//           </div>
//           <div className="box">
//             <h3>Payment & Delivery</h3>
//             <div><strong>Payment Mode:</strong> {paymentMode}</div>
//             {paymentMode !== "Cash" && (
//               <div><strong>Transaction Ref:</strong> {transactionRef || "—"}</div>
//             )}
//             <div><strong>Delivery To:</strong> Same as Billing</div>
//             <div><strong>Remarks:</strong> {order.remarks || "—"}</div>
//           </div>
//         </div>

//         <h3>Item Details</h3>
//         <div className="row-actions">
//           <button className="secondary" onClick={() => window.print()}>
//             Print / Save Invoice
//           </button>
//         </div>

//         {/* ===== ITEM TABLE ===== */}
//         <div className="print-table-wrap">
//           <table id="itemTable" aria-label="Product table" className="w-full text-[12px]">
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>Product Description</th>
//                 <th>HSN</th>
//                 <th>Purity (kt)</th>
//                 <th className="right">Gross Wt (g)</th>
//                 <th className="right">Net Wt (g)</th>
//                 <th className="right">Fine (g)</th>
//                 <th className="right">Gold Rate (₹/g)</th>
//                 <th className="right">Gold Amount (₹)</th>
//                 <th>Cert No.</th>
//                 <th className="right">Diamond Wt (ct)</th>
//                 <th className="right">Diamond Amt (₹)</th>
//                 <th className="right">Stone Wt (ct)</th>
//                 <th className="right">Stone Amt (₹)</th>
//                 <th className="right">Making (₹)</th>
//                 <th className="right">Product Price (₹)</th>
//                 <th className="right">Scheme Discount (₹)</th>
//                 <th className="right">SGST 1.5% (₹)</th>
//                 <th className="right">CGST 1.5% (₹)</th>
//                 <th className="right">Product Value (₹)</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <td className="center idx">1</td>
//                 <td id="prod-desc">
//                   {pd.category || ""}
//                   {pd.size ? ` | Size: ${pd.size}` : ""}
//                   {pd.description ? ` | ${pd.description}` : ""}
//                 </td>
//                 <td>7113</td>
//                 <td id="prod-metal">{pd.metalPurity?.replace("KT", "") || "—"}</td>
//                 <td className="right gross" title={`Gold: ${pd.metalWeight || 0}g, Diamond: ${((pd.diamondWeight || 0) * 0.2).toFixed(3)}g, Stone: ${((pd.stoneWeight || 0) * 0.2).toFixed(3)}g`}>
//                   {/* {calculateGrossWeight()} */} {pd.grossWeight}
//                 </td>
//                 <td className="right net">{pd.metalWeight || "0.000"}</td>
//                 <td className="right fine" title={`Net Gold: ${pd.metalWeight || 0}g × Purity ${pd.metalPurity || 0}`}>
//                   {calculateFineGold()}
//                 </td>
//                 <td className="right rate">{pricing.metalRate || "0.00"}</td>
//                 <td className="right goldAmt">
//                   {((pricing.metalRate || 0) * (pd.metalWeight || 0) * qty).toFixed(2)}
//                 </td>
//                 <td>IGI-12345</td>
//                 <td className="right diaWt">{pd.diamondWeight || "0.000"}</td>
//                 <td className="right diaAmt">
//                   {pd.diamondSelected
//                     ? ((pricing.diamondRate || 0) * (pd.diamondWeight || 0) * qty).toFixed(2)
//                     : "0.00"}
//                 </td>
//                 {/* <td className="right stoneWt">{pd.stoneWeight || "0.000"}</td> */}
//                                <td className="right stoneWt">
//                {pd.otherStoneSelected && pd.stones?.length > 0
//                   ? pd.stones.map((s, i) => (
//                        <div key={i}>
//                         {s.stoneWeight} 
//                        </div>
//                      ))
//                  : "-"}
//              </td>


//                 {/* <td className="right stoneAmt">
//                   {pd.otherStoneSelected
//                     ? ((pricing.stoneRate || 0) * (pd.stoneWeight || 0) * qty).toFixed(2)
//                     : "0.00"}
//                 </td> */}
//                <td className="right stoneAmt">
//                  {pricing.stoneAmount || 0}
//                </td>

//                 <td className="right making">
//                   {((pricing.makingCharge || 0) * (pd.metalWeight || 0) * qty).toFixed(2)}
//                 </td>
//                 <td className="right prodPrice">
//                   {(pricing.subtotal || 0).toFixed(2)}
//                 </td>
//                 <td className="right schemeDisc">
//                   {(pricing.discountAmount || 0).toFixed(2)}
//                 </td>
//                 <td className="right sgst">{sgst.toFixed(2)}</td>
//                 <td className="right cgst">{cgst.toFixed(2)}</td>
//                 <td className="right prodValue">
//                   {(pricing.grandTotal || 0).toFixed(2)}
//                 </td>
//               </tr>
//             </tbody>
//             <tfoot>
//               <tr>
//                 <td colSpan={15} className="right"><strong>Totals (Products Only)</strong></td>
//                 <td className="right" id="totProdPrice">
//                   {(pricing.subtotal || 0).toFixed(2)}
//                 </td>
//                 <td className="right" id="totDisc">
//                   {(pricing.discountAmount || 0).toFixed(2)}
//                 </td>
//                 <td className="right" id="totSGST">{sgst.toFixed(2)}</td>
//                 <td className="right" id="totCGST">{cgst.toFixed(2)}</td>
//                 <td className="right" id="totValue">
//                   <strong>{(pricing.grandTotal || 0).toFixed(2)}</strong>
//                 </td>
//               </tr>
//             </tfoot>
//           </table>
//         </div>

//         <h3>Other Charges & Payment Details</h3>
//         <table id="chargesTable">
//           <thead>
//             <tr>
//               <th colSpan={2}>Other Charges</th>
//               <th colSpan={2}>Payment Details</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr>
//               <td>Other Charges (₹)</td>
//               <td className="right" id="other1">0.00</td>
//               <td>Payment Mode</td>
//               <td>{paymentMode}</td>
//             </tr>
//             <tr>
//               <td>Additional Other Charges (₹)</td>
//               <td className="right" id="other2">0.00</td>
//               <td>Advance Paid (₹)</td>
//               <td className="right">{advancePaid.toFixed(2)}</td>
//             </tr>
//             <tr>
//               <td><strong>Total Other Charges (₹)</strong></td>
//               <td className="right" id="totalOther">0.00</td>
//               <td><strong>Balance Payable (₹)</strong></td>
//               <td className="right" id="totalToPay">
//                 <strong className="text-red-600">{balancePayable.toFixed(2)}</strong>
//               </td>
//             </tr>
//           </tbody>
//         </table>

//         <h3>Amount in Words</h3>
//         <div className="box">
//           <span id="amtWords">{numberToWordsIndian(pricing.grandTotal || 0)}</span>
//         </div>

//         {/* ===== NOTES & SIGNATURE ===== */}
//         <div className="grid-2">
//           <div className="box" contentEditable={true} suppressContentEditableWarning={true}>
//             <h3>Notes</h3>
//             <div className="notes">Add certificate no., offer code, packaging notes, etc.</div>
//           </div>
//           <div className="box center">
//             <h3>Signature</h3>
//             <div className="box-inc">
//               <div className="box-inc-two">
//                 Authorised Signatory
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="notes">
//           Registered office & correspondence: Nazara Diamonds, 402, Vibrent Business Centre, Manormaganj, Indore • Email: contact@nazara.in • Phone: +91-9876543210
//         </div>

//         <div className="pagebreak"></div>

//         {/* ===== TERMS & CONDITIONS ===== */}
//         <div className="box border border-gray-300 rounded-lg p-4 min-h-[420px]" contentEditable={true} suppressContentEditableWarning={true}>
//           <h3>Terms & Conditions</h3>
//           <div className="notes text-[11px] text-gray-600 leading-relaxed">
//             <p>1. All diamonds sold are lab-grown and supplied with appropriate grading certificates where applicable.</p>
//             <p>2. Gold purity and weights are recorded as per store weighing standards; minor variations due to scale tolerance are normal and acceptable.</p>
//             <p>3. Prices are based on prevailing gold, diamond and gemstone rates at the time of billing and are subject to change for future orders or re-makes.</p>
//             <p>4. Returns or exchanges, if allowed, are strictly at the discretion of Nazara Diamonds and subject to physical inspection and approval of the item's condition.</p>
//             <p>5. Any customised, engraved, altered or specially ordered pieces are not eligible for cancellation, return or cash refund.</p>
//             <p>6. Manufacturing defects reported within the specified warranty period will be serviced, repaired or replaced as per brand policy. Normal wear and tear or mishandling is not covered.</p>
//             <p>7. GST and any other applicable taxes are charged as per Government regulations in force on the date of invoice. Tax components are clearly shown on the invoice wherever applicable.</p>
//             <p>8. In case of exchange or buy-back, the valuation will be done as per the prevailing exchange policy of Nazara Diamonds at that time, which may differ from original purchase price.</p>
//             <p>9. The customer is requested to verify the invoice details, weights and rate calculations before leaving the counter. Any discrepancy should be reported immediately.</p>
//             <p>10. In case of any dispute, the decision of Nazara Diamonds shall be final and binding. All disputes are subject to Indore jurisdiction only.</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



// //==============================================================deepseek bill 2====
// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate, Link } from "react-router-dom";
// import { getInvoiceById } from "../api/invoiceApi";
// import "../styles/Invoice.css";
// // import logo from "../assets/nazara_logo_white.png";
// import logo from "../assets/nazara_logo.png";

// export default function InvoicePreview() {
//   const { invoiceId } = useParams();
//   const navigate = useNavigate();
//   const [invoice, setInvoice] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!invoiceId) {
//       setError("Invalid invoice ID");
//       setLoading(false);
//       return;
//     }

//     getInvoiceById(invoiceId)
//       .then((res) => {
//         if (res.data?.success) setInvoice(res.data.invoice);
//         else setError("Invoice not found");
//       })
//       .catch(() => setError("Failed to load invoice"))
//       .finally(() => setLoading(false));
//   }, [invoiceId]);

//   if (loading) return <div className="p-6">Loading invoice…</div>;
//   if (error) return <div className="p-6 text-red-600">{error}</div>;
//   if (!invoice) return null;

//   /* ================= SAFE DESTRUCTURING ================= */
//   const {
//     invoiceNo,
//     createdAt,
//     pricing = {},
//     order = {},
//     advancePaid = 0,
//     paymentMode = "Cash",
//     transactionRef = "",
//     customer = {}
//   } = invoice;

//   const pd = order.productDetails || {};

//   const balancePayable = (pricing.grandTotal || 0) - (advancePaid || 0);

//   // GST calculations
//   const gst = pricing.gst || 0;
//   const sgst = gst / 2;
//   const cgst = gst / 2;

//   // Product quantities
//   const qty = order.quantity || 1;

//   // Gross weight calculation
//   const calculateGrossWeight = () => {
//     const metalWeight = pd.metalWeight || 0;
//     const diamondWeight = pd.diamondWeight || 0;
//     const stoneWeight = pd.stoneWeight || 0;

//     // Diamond and stone weight conversion (ct to grams: 1 ct = 0.2 g)
//     const diamondWeightGrams = diamondWeight * 0.2;
//     const stoneWeightGrams = stoneWeight * 0.2;

//     return (metalWeight + diamondWeightGrams + stoneWeightGrams).toFixed(3);
//   };

//   // Fine gold calculation
//   const calculateFineGold = () => {
//     const metalWeight = pd.metalWeight || 0;
//     const purity = parseFloat(pd.metalPurity?.replace("KT", "") || "0") / 24;
//     return (metalWeight * purity).toFixed(3);
//   };

//   // Amount in words function
//   const numberToWordsIndian = (num) => {
//     if (!num || isNaN(num)) return "Zero Rupees Only";

//     const a = [
//       "", "One", "Two", "Three", "Four", "Five", "Six",
//       "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
//       "Thirteen", "Fourteen", "Fifteen", "Sixteen",
//       "Seventeen", "Eighteen", "Nineteen"
//     ];

//     const b = [
//       "", "", "Twenty", "Thirty", "Forty",
//       "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
//     ];

//     const inWords = (n) => {
//       if (n < 20) return a[n];
//       if (n < 100)
//         return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
//       if (n < 1000)
//         return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + inWords(n % 100) : "");
//       if (n < 100000)
//         return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + inWords(n % 1000) : "");
//       if (n < 10000000)
//         return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + inWords(n % 100000) : "");
//       return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + inWords(n % 10000000) : "");
//     };

//     return `${inWords(Math.floor(num))} Rupees Only`;
//   };

//   // Format date
//   const invoiceDate = new Date(createdAt);
//   const formattedDate = invoiceDate.toLocaleDateString('en-IN');
//   const formattedTime = invoiceDate.toLocaleTimeString('en-IN', { 
//     hour: '2-digit', 
//     minute: '2-digit' 
//   });

//   return (
//     <div className="invoice-wrapper">
//       {/* ===== ACTION BUTTONS ===== */}
//       <div className="action-buttons print:hidden">
//         <button 
//           onClick={() => navigate(-1)}
//           className="back-button"
//         >
//           ← Back
//         </button>
//         <Link to="/">
//           <button className="home-button">
//             🏠 Home
//           </button>
//         </Link>
//       </div>

//       <div className="paper" id="paper">
//         {/* ===== HEADER ===== */}
//         <header>
//           <img src={logo} alt="Nazara Diamonds" className="print-logo" />
//           <div>
//             <div className="brand-title inline-block w-2/3">Nazara Diamonds
//               <div className="sub-one-one">Real Diamonds. Ethically Grown.
//                 <div className="sub-one-two">
//                   Registered Office: 106, ShivOm Complex, M.G. Road, Opposite TI Mall,
//                   Indore, 452001 • GSTIN: 23AAKCN6666J1Z0 • CIN:
//                   U47733MP2025PTC077889
//                 </div>
//               </div>
//             </div>
//             <div className="inv-div">
//               <p className="inv-no">Tax Invoice</p>
//               <p className="inv-sub">Place of Supply: Madhya Pradesh (23)</p>
//             </div>
//           </div>
//         </header>

//         {/* ===== META STRIP 1 ===== */}
//         <div className="meta-strip">
//           <div>
//             <div className="meta-label"><strong>Document No:</strong> {invoiceNo}</div>
//           </div>
//           <div>
//             <div className="meta-label">Date</div>
//             {formattedDate}
//           </div>
//           <div>
//             <div className="meta-label">Time</div>
//             {formattedTime}
//           </div>
//           <div>
//             <div className="meta-label">Copy</div>
//             Original
//           </div>
//           <div>
//             <div className="meta-label">Order / Ref</div>
//             {order.orderNo || "ORD-0001"}
//           </div>
//           <div>
//             <div className="meta-label">Salesperson</div>
//             —
//           </div>
//           <div>
//             <div className="meta-label">Delivery Mode</div>
//             {order.deliveryMode || "Store Pickup"}
//           </div>
//           <div>
//             <div className="meta-label">POS</div>
//             Indore
//           </div>
//         </div>

//         {/* ===== CUSTOMER & PAYMENT DETAILS ===== */}
//         <div className="grid-2">
//           <div className="box">
//             <h3>Customer Details</h3>
//             <div><strong>Name:</strong> {customer.name || "—"}</div>
//             <div><strong>Address:</strong> {customer.address || "—"}</div>
//             <div><strong>Phone/Email:</strong> {customer.mobile || "—"} • {customer.email || "—"}</div>
//             <div><strong>GSTIN / State Code:</strong> {customer.gst || "—"} / —</div>
//           </div>
//           <div className="box">
//             <h3>Payment & Delivery</h3>
//             <div><strong>Payment Mode:</strong> {paymentMode}</div>
//             {paymentMode !== "Cash" && (
//               <div><strong>Transaction Ref:</strong> {transactionRef || "—"}</div>
//             )}
//             <div><strong>Delivery To:</strong> Same as Billing</div>
//             <div><strong>Remarks:</strong> {order.remarks || "—"}</div>
//           </div>
//         </div>

//         <h3>Item Details</h3>
//         <div className="row-actions print:hidden">
//           <button className="secondary" onClick={() => window.print()}>
//             Print / Save Invoice
//           </button>
//         </div>

//         {/* ===== ITEM TABLE ===== */}
//         <div className="print-table-wrap">
//           <table id="itemTable" aria-label="Product table" className="w-full text-[12px]">
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>Product Description</th>
//                 <th>HSN</th>
//                 <th>Purity (kt)</th>
//                 <th className="right">Gross Wt (g)</th>
//                 <th className="right">Net Wt (g)</th>
//                 <th className="right">Fine (g)</th>
//                 <th className="right">Gold Rate (₹/g)</th>
//                 <th className="right">Gold Amount (₹)</th>
//                 <th>Cert No.</th>
//                 <th className="right">Diamond Wt (ct)</th>
//                 <th className="right">Diamond Amt (₹)</th>
//                 <th className="right">Stone Wt (ct)</th>
//                 <th className="right">Stone Amt (₹)</th>
//                 <th className="right">Making (₹)</th>
//                 <th className="right">Product Price (₹)</th>
//                 <th className="right">Scheme Discount (₹)</th>
//                 <th className="right">SGST 1.5% (₹)</th>
//                 <th className="right">CGST 1.5% (₹)</th>
//                 <th className="right">Product Value (₹)</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <td className="center idx">1</td>
//                 <td id="prod-desc">
//                   {pd.category || ""}
//                   {pd.size ? ` | Size: ${pd.size}` : ""}
//                   {pd.description ? ` | ${pd.description}` : ""}
//                 </td>
//                 <td>7113</td>
//                 <td id="prod-metal">{pd.metalPurity?.replace("KT", "") || "—"}</td>
//                 <td className="right gross" title={`Gold: ${pd.metalWeight || 0}g, Diamond: ${((pd.diamondWeight || 0) * 0.2).toFixed(3)}g, Stone: ${((pd.stoneWeight || 0) * 0.2).toFixed(3)}g`}>
//                   {pd.grossWeight || calculateGrossWeight()}
//                 </td>
//                 <td className="right net">{pd.metalWeight || "0.000"}</td>
//                 <td className="right fine" title={`Net Gold: ${pd.metalWeight || 0}g × Purity ${pd.metalPurity || 0}`}>
//                   {calculateFineGold()}
//                 </td>
//                 <td className="right rate">{pricing.metalRate || "0.00"}</td>
//                 <td className="right goldAmt">
//                   {((pricing.metalRate || 0) * (pd.metalWeight || 0) * qty).toFixed(2)}
//                 </td>
//                 <td>IGI-12345</td>
//                 <td className="right diaWt">{pd.diamondWeight || "0.000"}</td>
//                 <td className="right diaAmt">
//                   {pd.diamondSelected
//                     ? ((pricing.diamondRate || 0) * (pd.diamondWeight || 0) * qty).toFixed(2)
//                     : "0.00"}
//                 </td>
//                 <td className="right stoneWt">
//                   {pd.otherStoneSelected && pd.stones?.length > 0
//                     ? pd.stones.map((s, i) => (
//                       <div key={i}>
//                         {s.stoneWeight} 
//                       </div>
//                     ))
//                     : "-"}
//                 </td>
//                 <td className="right stoneAmt">
//                   {pricing.stoneAmount || 0}
//                 </td>
//                 <td className="right making">
//                   {((pricing.makingCharge || 0) * (pd.metalWeight || 0) * qty).toFixed(2)}
//                 </td>
//                 <td className="right prodPrice">
//                   {(pricing.subtotal || 0).toFixed(2)}
//                 </td>
//                 <td className="right schemeDisc">
//                   {(pricing.discountAmount || 0).toFixed(2)}
//                 </td>
//                 <td className="right sgst">{sgst.toFixed(2)}</td>
//                 <td className="right cgst">{cgst.toFixed(2)}</td>
//                 <td className="right prodValue">
//                   {(pricing.grandTotal || 0).toFixed(2)}
//                 </td>
//               </tr>
//             </tbody>
//             <tfoot>
//               <tr>
//                 <td colSpan={15} className="right"><strong>Totals (Products Only)</strong></td>
//                 <td className="right" id="totProdPrice">
//                   {(pricing.subtotal || 0).toFixed(2)}
//                 </td>
//                 <td className="right" id="totDisc">
//                   {(pricing.discountAmount || 0).toFixed(2)}
//                 </td>
//                 <td className="right" id="totSGST">{sgst.toFixed(2)}</td>
//                 <td className="right" id="totCGST">{cgst.toFixed(2)}</td>
//                 <td className="right" id="totValue">
//                   <strong>{(pricing.grandTotal || 0).toFixed(2)}</strong>
//                 </td>
//               </tr>
//             </tfoot>
//           </table>
//         </div>

//         <h3>Other Charges & Payment Details</h3>
//         <table id="chargesTable">
//           <thead>
//             <tr>
//               <th colSpan={2}>Other Charges</th>
//               <th colSpan={2}>Payment Details</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr>
//               <td>Other Charges (₹)</td>
//               <td className="right" id="other1">0.00</td>
//               <td>Payment Mode</td>
//               <td>{paymentMode}</td>
//             </tr>
//             <tr>
//               <td>Additional Other Charges (₹)</td>
//               <td className="right" id="other2">0.00</td>
//               <td>Advance Paid (₹)</td>
//               <td className="right">{advancePaid.toFixed(2)}</td>
//             </tr>
//             <tr>
//               <td><strong>Total Other Charges (₹)</strong></td>
//               <td className="right" id="totalOther">0.00</td>
//               <td><strong>Balance Payable (₹)</strong></td>
//               <td className="right" id="totalToPay">
//                 <strong className="text-red-600">{balancePayable.toFixed(2)}</strong>
//               </td>
//             </tr>
//           </tbody>
//         </table>

//         <h3>Amount in Words</h3>
//         <div className="box">
//           <span id="amtWords">{numberToWordsIndian(pricing.grandTotal || 0)}</span>
//         </div>

//         {/* ===== NOTES & SIGNATURE ===== */}
//         <div className="grid-2">
//           <div className="box" contentEditable={true} suppressContentEditableWarning={true}>
//             <h3>Notes</h3>
//             <div className="notes">Add certificate no., offer code, packaging notes, etc.</div>
//           </div>
//           <div className="box center">
//             <h3>Signature</h3>
//             <div className="box-inc">
//               <div className="box-inc-two">
//                 Authorised Signatory
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="notes">
//           Registered office & correspondence: Nazara Diamonds, 402, Vibrent Business Centre, Manormaganj, Indore • Email: contact@nazara.in • Phone: +91-9876543210
//         </div>

//         <div className="pagebreak"></div>

//         {/* ===== TERMS & CONDITIONS ===== */}
//         <div className="box border border-gray-300 rounded-lg p-4 min-h-[420px]" contentEditable={true} suppressContentEditableWarning={true}>
//           <h3>Terms & Conditions</h3>
//           <div className="notes text-[11px] text-gray-600 leading-relaxed">
//             <p>1. All diamonds sold are lab-grown and supplied with appropriate grading certificates where applicable.</p>
//             <p>2. Gold purity and weights are recorded as per store weighing standards; minor variations due to scale tolerance are normal and acceptable.</p>
//             <p>3. Prices are based on prevailing gold, diamond and gemstone rates at the time of billing and are subject to change for future orders or re-makes.</p>
//             <p>4. Returns or exchanges, if allowed, are strictly at the discretion of Nazara Diamonds and subject to physical inspection and approval of the item's condition.</p>
//             <p>5. Any customised, engraved, altered or specially ordered pieces are not eligible for cancellation, return or cash refund.</p>
//             <p>6. Manufacturing defects reported within the specified warranty period will be serviced, repaired or replaced as per brand policy. Normal wear and tear or mishandling is not covered.</p>
//             <p>7. GST and any other applicable taxes are charged as per Government regulations in force on the date of invoice. Tax components are clearly shown on the invoice wherever applicable.</p>
//             <p>8. In case of exchange or buy-back, the valuation will be done as per the prevailing exchange policy of Nazara Diamonds at that time, which may differ from original purchase price.</p>
//             <p>9. The customer is requested to verify the invoice details, weights and rate calculations before leaving the counter. Any discrepancy should be reported immediately.</p>
//             <p>10. In case of any dispute, the decision of Nazara Diamonds shall be final and binding. All disputes are subject to Indore jurisdiction only.</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

//====================================================================================

// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate, Link } from "react-router-dom";
// import { getInvoiceById } from "../api/invoiceApi";
// import "../styles/Invoice.css";
// import logo from "../assets/nazara_logo.png";

// export default function InvoicePreview() {
//   const { invoiceId } = useParams();
//   const navigate = useNavigate();
//   const [invoice, setInvoice] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!invoiceId) {
//       setError("Invalid invoice ID");
//       setLoading(false);
//       return;
//     }

//     getInvoiceById(invoiceId)
//       .then((res) => {
//         if (res.data?.success) setInvoice(res.data.invoice);
//         else setError("Invoice not found");
//       })
//       .catch(() => setError("Failed to load invoice"))
//       .finally(() => setLoading(false));
//   }, [invoiceId]);

//   if (loading) return <div className="p-6">Loading invoice…</div>;
//   if (error) return <div className="p-6 text-red-600">{error}</div>;
//   if (!invoice) return null;

//   /* ================= SAFE DESTRUCTURING ================= */
//   const {
//     invoiceNo,
//     createdAt,
//     pricing = {},
//     order = {},
//     advancePaid = 0,
//     paymentMode = "Cash",
//     transactionId = "", // ✅ Transaction ID
//     customer = {}
//   } = invoice;

//   const pd = order.productDetails || {};

//   const balancePayable = (pricing.grandTotal || 0) - (advancePaid || 0);

//   // GST calculations
//   const gst = pricing.gst || 0;
//   const sgst = gst / 2;
//   const cgst = gst / 2;

//   // Product quantities
//   const qty = order.quantity || 1;

//   // Gross weight calculation
//   const calculateGrossWeight = () => {
//     const metalWeight = pd.metalWeight || 0;
//     const diamondWeight = pd.diamondWeight || 0;
//     const stoneWeight = pd.stoneWeight || 0;

//     // Diamond and stone weight conversion (ct to grams: 1 ct = 0.2 g)
//     const diamondWeightGrams = diamondWeight * 0.2;
//     const stoneWeightGrams = stoneWeight * 0.2;

//     return (metalWeight + diamondWeightGrams + stoneWeightGrams).toFixed(3);
//   };

//   // Fine gold calculation - use from pricing if available
//   const fineGoldWeight = pricing.fineGoldWeight || 0;

//   // Certificate number - use from pricing if available
//   const certificateNo = pricing.certificateNo || "";

//   // HSN Code
//   const hsnCode = pd.hsnCode || "7113";

//   // Calculate stone weight
//   const calculateTotalStoneWeight = () => {
//     if (!pd.stones || !Array.isArray(pd.stones)) return 0;
//     return pd.stones.reduce((total, stone) => total + (parseFloat(stone.stoneWeight) || 0), 0);
//   };

//   // Amount in words function
//   const numberToWordsIndian = (num) => {
//     if (!num || isNaN(num)) return "Zero Rupees Only";

//     const a = [
//       "", "One", "Two", "Three", "Four", "Five", "Six",
//       "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
//       "Thirteen", "Fourteen", "Fifteen", "Sixteen",
//       "Seventeen", "Eighteen", "Nineteen"
//     ];

//     const b = [
//       "", "", "Twenty", "Thirty", "Forty",
//       "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
//     ];

//     const inWords = (n) => {
//       if (n < 20) return a[n];
//       if (n < 100)
//         return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
//       if (n < 1000)
//         return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + inWords(n % 100) : "");
//       if (n < 100000)
//         return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + inWords(n % 1000) : "");
//       if (n < 10000000)
//         return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + inWords(n % 100000) : "");
//       return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + inWords(n % 10000000) : "");
//     };

//     return `${inWords(Math.floor(num))} Rupees Only`;
//   };

//   // Format date
//   const invoiceDate = new Date(createdAt);
//   const formattedDate = invoiceDate.toLocaleDateString('en-IN');
//   const formattedTime = invoiceDate.toLocaleTimeString('en-IN', { 
//     hour: '2-digit', 
//     minute: '2-digit' 
//   });

//   return (
//     <div className="invoice-wrapper">
//       {/* ===== ACTION BUTTONS ===== */}
//       <div className="action-buttons print:hidden">
//         <button 
//           onClick={() => navigate(-1)}
//           className="back-button"
//         >
//           ← Back
//         </button>
//         <Link to="/">
//           <button className="home-button">
//             🏠 Home
//           </button>
//         </Link>
//       </div>

//       <div className="paper" id="paper">
//         {/* ===== HEADER ===== */}
//         <header>
//           <img src={logo} alt="Nazara Diamonds" className="print-logo" />
//           <div>
//             <div className="brand-title inline-block w-2/3">Nazara Diamonds
//               <div className="sub-one-one">Real Diamonds. Ethically Grown.
//                 <div className="sub-one-two">
//                   Registered Office: 106, ShivOm Complex, M.G. Road, Opposite TI Mall,
//                   Indore, 452001 • GSTIN: 23AAKCN6666J1Z0 • CIN:
//                   U47733MP2025PTC077889
//                 </div>
//               </div>
//             </div>
//             <div className="inv-div">
//               <p className="inv-no">Tax Invoice</p>
//               <p className="inv-sub">Place of Supply: Madhya Pradesh (23)</p>
//             </div>
//           </div>
//         </header>

//         {/* ===== META STRIP 1 ===== */}
//         <div className="meta-strip">
//           <div>
//             <div className="meta-label"><strong>Document No:</strong> {invoiceNo}</div>
//           </div>
//           <div>
//             <div className="meta-label">Date</div>
//             {formattedDate}
//           </div>
//           <div>
//             <div className="meta-label">Time</div>
//             {formattedTime}
//           </div>
//           <div>
//             <div className="meta-label">Copy</div>
//             Original
//           </div>
//           <div>
//             <div className="meta-label">Order / Ref</div>
//             {order.orderNo || "ORD-0001"}
//           </div>
//           <div>
//             <div className="meta-label">Salesperson</div>
//             —
//           </div>
//           <div>
//             <div className="meta-label">Delivery Mode</div>
//             {order.deliveryMode || "Store Pickup"}
//           </div>
//           <div>
//             <div className="meta-label">POS</div>
//             Indore
//           </div>
//         </div>

//         {/* ===== CUSTOMER & PAYMENT DETAILS - UPDATED ===== */}
//         <div className="grid-2">
//           <div className="box">
//             <h3>Customer Details</h3>
//             <div><strong>Name:</strong> {customer.name || "—"}</div>
//             <div><strong>Address:</strong> {customer.address || "—"}</div>
//             <div><strong>Phone/Email:</strong> {customer.mobile || "—"} • {customer.email || "—"}</div>
//             {/* ✅ GSTIN और State Code add किए */}
//              <div><strong>GSTIN / State Code:</strong> {customer.gstin  || "—"} / {customer.stateCode || "—"}</div>
//           </div>
//           <div className="box">
//             <h3>Payment & Delivery</h3>
//             {/* ✅ Payment Mode और Transaction ID add किए */}
//             <div><strong>Payment Mode:</strong> {paymentMode}</div>
//             <div><strong>Transaction ID:</strong> {transactionId || "—"}</div>
//             <div><strong>Delivery To:</strong> Same as Billing</div>
//             <div><strong>Remarks:</strong> {order.remarks || "—"}</div>
//           </div>
//         </div>

//         <h3>Item Details</h3>
//         <div className="row-actions print:hidden">
//           <button className="secondary" onClick={() => window.print()}>
//             Print / Save Invoice
//           </button>
//         </div>

//         {/* ===== ITEM TABLE - UPDATED ===== */}
//         <div className="print-table-wrap">
//           <table id="itemTable" aria-label="Product table" className="w-full text-[12px]">
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>Product Description</th>
//                 <th>HSN</th>
//                 <th>Purity (kt)</th>
//                 <th className="right">Gross Wt (g)</th>
//                 <th className="right">Net Wt (g)</th>
//                 <th className="right">Fine (g)</th>
//                 <th className="right">Gold Rate (₹/g)</th>
//                 <th className="right">Gold Amount (₹)</th>
//                 <th>Cert No.</th>
//                 <th className="right">Diamond Wt (ct)</th>
//                 <th className="right">Diamond Amt (₹)</th>
//                 <th className="right">Stone Wt (ct)</th>
//                 <th className="right">Stone Amt (₹)</th>
//                 <th className="right">Making (₹)</th>
//                 <th className="right">Product Price (₹)</th>
//                 <th className="right">Scheme Discount (₹)</th>
//                 <th className="right">SGST 1.5% (₹)</th>
//                 <th className="right">CGST 1.5% (₹)</th>
//                 <th className="right">Product Value (₹)</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <td className="center idx">1</td>
//                 <td id="prod-desc">
//                   {pd.category || ""}
//                   {pd.size ? ` | Size: ${pd.size}` : ""}
//                   {pd.description ? ` | ${pd.description}` : ""}
//                 </td>
//                 {/* ✅ HSN Code */}
//                 <td>{hsnCode}</td>
//                 <td id="prod-metal">{pd.metalPurity?.replace("KT", "") || "—"}</td>
//                 <td className="right gross" title={`Gold: ${pd.metalWeight || 0}g, Diamond: ${((pd.diamondWeight || 0) * 0.2).toFixed(3)}g, Stone: ${((pd.stoneWeight || 0) * 0.2).toFixed(3)}g`}>
//                   {pd.grossWeight || calculateGrossWeight()}
//                 </td>
//                 <td className="right net">{pd.metalWeight || "0.000"}</td>
//                 {/* ✅ Fine Gold Weight */}
//                 <td className="right fine">
//                   {fineGoldWeight || "0.000"}
//                 </td>
//                 <td className="right rate">{pricing.metalRate || "0.00"}</td>
//                 <td className="right goldAmt">
//                   {((pricing.metalRate || 0) * (pd.metalWeight || 0) * qty).toFixed(2)}
//                 </td>
//                 {/* ✅ Certificate Number */}
//                 <td>{certificateNo || "—"}</td>
//                 <td className="right diaWt">{pd.diamondWeight || "0.000"}</td>
//                 <td className="right diaAmt">
//                   {pd.diamondSelected
//                     ? ((pricing.diamondRate || 0) * (pd.diamondWeight || 0) * qty).toFixed(2)
//                     : "0.00"}
//                 </td>
//                 <td className="right stoneWt">
//                   {pd.otherStoneSelected && pd.stones?.length > 0
//                     ? pd.stones.map((s, i) => (
//                       <div key={i}>
//                         {s.stoneWeight} 
//                       </div>
//                     ))
//                     : "0.000"}
//                 </td>
//                 <td className="right stoneAmt">
//                   {pricing.stoneAmount || 0}
//                 </td>
//                 <td className="right making">
//                   {((pricing.makingCharge || 0) * (pd.metalWeight || 0) * qty).toFixed(2)}
//                 </td>
//                 <td className="right prodPrice">
//                   {(pricing.subtotal || 0).toFixed(2)}
//                 </td>
//                 <td className="right schemeDisc">
//                   {(pricing.discountAmount || 0).toFixed(2)}
//                 </td>
//                 <td className="right sgst">{sgst.toFixed(2)}</td>
//                 <td className="right cgst">{cgst.toFixed(2)}</td>
//                 <td className="right prodValue">
//                   {(pricing.grandTotal || 0).toFixed(2)}
//                 </td>
//               </tr>
//             </tbody>
//             <tfoot>
//               <tr>
//                 <td colSpan={15} className="right"><strong>Totals (Products Only)</strong></td>
//                 <td className="right" id="totProdPrice">
//                   {(pricing.subtotal || 0).toFixed(2)}
//                 </td>
//                 <td className="right" id="totDisc">
//                   {(pricing.discountAmount || 0).toFixed(2)}
//                 </td>
//                 <td className="right" id="totSGST">{sgst.toFixed(2)}</td>
//                 <td className="right" id="totCGST">{cgst.toFixed(2)}</td>
//                 <td className="right" id="totValue">
//                   <strong>{(pricing.grandTotal || 0).toFixed(2)}</strong>
//                 </td>
//               </tr>
//             </tfoot>
//           </table>
//         </div>

//         <h3>Other Charges & Payment Details</h3>
//         <table id="chargesTable">
//           <thead>
//             <tr>
//               <th colSpan={2}>Other Charges</th>
//               <th colSpan={2}>Payment Details</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr>
//               <td>Other Charges (₹)</td>
//               <td className="right" id="other1">0.00</td>
//               <td>Payment Mode</td>
//               <td>{paymentMode}</td>
//             </tr>
//             <tr>
//               <td>Additional Other Charges (₹)</td>
//               <td className="right" id="other2">0.00</td>
//               <td>Advance Paid (₹)</td>
//               <td className="right">{advancePaid.toFixed(2)}</td>
//             </tr>
//             <tr>
//               <td><strong>Total Other Charges (₹)</strong></td>
//               <td className="right" id="totalOther">0.00</td>
//               <td><strong>Balance Payable (₹)</strong></td>
//               <td className="right" id="totalToPay">
//                 <strong className="text-red-600">{balancePayable.toFixed(2)}</strong>
//               </td>
//             </tr>
//           </tbody>
//         </table>

//         <h3>Amount in Words</h3>
//         <div className="box">
//           <span id="amtWords">{numberToWordsIndian(pricing.grandTotal || 0)}</span>
//         </div>

//         {/* ===== NOTES & SIGNATURE ===== */}
//         <div className="grid-2">
//           <div className="box" contentEditable={true} suppressContentEditableWarning={true}>
//             <h3>Notes</h3>
//             <div className="notes">
//               {/* ✅ Certificate और Fine Gold details notes में भी add करें */}
//               {certificateNo && <div><strong>Certificate No:</strong> {certificateNo}</div>}
//               {fineGoldWeight > 0 && <div><strong>Fine Gold Weight:</strong> {fineGoldWeight} g</div>}
//               Add certificate no., offer code, packaging notes, etc.
//             </div>
//           </div>
//           <div className="box center">
//             <h3>Signature</h3>
//             <div className="box-inc">
//               <div className="box-inc-two">
//                 Authorised Signatory
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="notes">
//           Registered office & correspondence: Nazara Diamonds, 402, Vibrent Business Centre, Manormaganj, Indore • Email: contact@nazara.in • Phone: +91-9876543210
//         </div>

//         <div className="pagebreak"></div>

//         {/* ===== TERMS & CONDITIONS ===== */}
//         <div className="box border border-gray-300 rounded-lg p-4 min-h-[420px]" contentEditable={true} suppressContentEditableWarning={true}>
//           <h3>Terms & Conditions</h3>
//           <div className="notes text-[11px] text-gray-600 leading-relaxed">
//             <p>1. All diamonds sold are lab-grown and supplied with appropriate grading certificates where applicable.</p>
//             <p>2. Gold purity and weights are recorded as per store weighing standards; minor variations due to scale tolerance are normal and acceptable.</p>
//             <p>3. Prices are based on prevailing gold, diamond and gemstone rates at the time of billing and are subject to change for future orders or re-makes.</p>
//             <p>4. Returns or exchanges, if allowed, are strictly at the discretion of Nazara Diamonds and subject to physical inspection and approval of the item's condition.</p>
//             <p>5. Any customised, engraved, altered or specially ordered pieces are not eligible for cancellation, return or cash refund.</p>
//             <p>6. Manufacturing defects reported within the specified warranty period will be serviced, repaired or replaced as per brand policy. Normal wear and tear or mishandling is not covered.</p>
//             <p>7. GST and any other applicable taxes are charged as per Government regulations in force on the date of invoice. Tax components are clearly shown on the invoice wherever applicable.</p>
//             <p>8. In case of exchange or buy-back, the valuation will be done as per the prevailing exchange policy of Nazara Diamonds at that time, which may differ from original purchase price.</p>
//             <p>9. The customer is requested to verify the invoice details, weights and rate calculations before leaving the counter. Any discrepancy should be reported immediately.</p>
//             <p>10. In case of any dispute, the decision of Nazara Diamonds shall be final and binding. All disputes are subject to Indore jurisdiction only.</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate, Link } from "react-router-dom";
// import { getInvoiceById } from "../api/invoiceApi";
// import "../styles/Invoice.css";
// import logo from "../assets/nazara_logo.png";

// export default function InvoicePreview() {
//   const { invoiceId } = useParams();
//   const navigate = useNavigate();
//   const [invoice, setInvoice] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!invoiceId) {
//       setError("Invalid invoice ID");
//       setLoading(false);
//       return;
//     }

//     getInvoiceById(invoiceId)
//       .then((res) => {
//         console.log("Invoice API Response:", res.data?.invoice);
//         if (res.data?.success) {
//           setInvoice(res.data.invoice);
//         } else {
//           setError("Invoice not found");
//         }
//       })
//       .catch((err) => {
//         console.error("Invoice fetch error:", err);
//         setError("Failed to load invoice");
//       })
//       .finally(() => setLoading(false));
//   }, [invoiceId]);

//   if (loading) return <div className="p-6">Loading invoice…</div>;
//   if (error) return <div className="p-6 text-red-600">{error}</div>;
//   if (!invoice) return null;

//   // Debug log to see what data we have
//   console.log("Invoice Data:", {
//     invoiceRoot: {
//       fineGoldWeight: invoice.fineGoldWeight,
//       certificateNo: invoice.certificateNo,
//       hsnCode: invoice.hsnCode,
//     },
//     pricing: invoice.pricing,
//     product: invoice.product,
//     orderProductDetails: invoice.order?.productDetails,
//   });

//   /* ================= SAFE DESTRUCTURING ================= */
//   const {
//     invoiceNo,
//     createdAt,
//     pricing = {},
//     order = {},
//     advancePaid = 0,
//     paymentMode = "Cash",
//     transactionId = "",
//     customer = {},
//     fineGoldWeight = 0,
//     certificateNo = "",
//     hsnCode = "",
//   } = invoice;

//   const pd = order.productDetails || {};
//   const productSnapshot = invoice.product || {};

//   const balancePayable = (pricing.grandTotal || 0) - (advancePaid || 0);

//   // GST calculations
//   const gst = pricing.gst || 0;
//   const sgst = gst / 2;
//   const cgst = gst / 2;

//   // Product quantities
//   const qty = order.quantity || 1;

//   // Gross weight calculation
//   const calculateGrossWeight = () => {
//     const metalWeight = pd.metalWeight || 0;
//     const diamondWeight = pd.diamondWeight || 0;
//     const stoneWeight = pd.stoneWeight || 0;

//     // Diamond and stone weight conversion (ct to grams: 1 ct = 0.2 g)
//     const diamondWeightGrams = diamondWeight * 0.2;
//     const stoneWeightGrams = stoneWeight * 0.2;

//     return (metalWeight + diamondWeightGrams + stoneWeightGrams).toFixed(3);
//   };

//   // Fine gold calculation - check ALL possible sources
//   const getFineGoldWeight = () => {
//     if (fineGoldWeight && fineGoldWeight > 0) return fineGoldWeight;
//     if (pricing?.fineGoldWeight && pricing.fineGoldWeight > 0) return pricing.fineGoldWeight;
//     if (productSnapshot?.fineGoldWeight && productSnapshot.fineGoldWeight > 0) return productSnapshot.fineGoldWeight;
//     if (pd?.fineGoldWeight && pd.fineGoldWeight > 0) return pd.fineGoldWeight;
//     return 0;
//   };

//   // Certificate number - check ALL possible sources
//   const getCertificateNo = () => {
//     if (certificateNo) return certificateNo;
//     if (pricing?.certificateNo) return pricing.certificateNo;
//     if (productSnapshot?.certificateNo) return productSnapshot.certificateNo;
//     if (pd?.certificateNo) return pd.certificateNo;
//     return "";
//   };

//   // HSN Code - check ALL possible sources
//   const getHsnCode = () => {
//     if (hsnCode) return hsnCode;
//     if (pricing?.hsnCode) return pricing.hsnCode;
//     if (productSnapshot?.hsnCode) return productSnapshot.hsnCode;
//     if (pd?.hsnCode) return pd.hsnCode;
//     return "7113";
//   };

//   // Get actual values
//   const actualFineGoldWeight = getFineGoldWeight();
//   const actualCertificateNo = getCertificateNo();
//   const actualHsnCode = getHsnCode();

//   console.log("Final Values for Display:", {
//     actualFineGoldWeight,
//     actualCertificateNo,
//     actualHsnCode,
//   });

//   // Calculate stone weight
//   const calculateTotalStoneWeight = () => {
//     if (!pd.stones || !Array.isArray(pd.stones)) return 0;
//     return pd.stones.reduce((total, stone) => total + (parseFloat(stone.stoneWeight) || 0), 0);
//   };

//   // Amount in words function
//   const numberToWordsIndian = (num) => {
//     if (!num || isNaN(num)) return "Zero Rupees Only";

//     const a = [
//       "", "One", "Two", "Three", "Four", "Five", "Six",
//       "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
//       "Thirteen", "Fourteen", "Fifteen", "Sixteen",
//       "Seventeen", "Eighteen", "Nineteen"
//     ];

//     const b = [
//       "", "", "Twenty", "Thirty", "Forty",
//       "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
//     ];

//     const inWords = (n) => {
//       if (n < 20) return a[n];
//       if (n < 100)
//         return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
//       if (n < 1000)
//         return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + inWords(n % 100) : "");
//       if (n < 100000)
//         return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + inWords(n % 1000) : "");
//       if (n < 10000000)
//         return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + inWords(n % 100000) : "");
//       return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + inWords(n % 10000000) : "");
//     };

//     return `${inWords(Math.floor(num))} Rupees Only`;
//   };

//   // Format date
//   const invoiceDate = new Date(createdAt);
//   const formattedDate = invoiceDate.toLocaleDateString('en-IN');
//   const formattedTime = invoiceDate.toLocaleTimeString('en-IN', { 
//     hour: '2-digit', 
//     minute: '2-digit' 
//   });

//   return (



//     <div className="invoice-wrapper">



// {/* ===== ACTION BUTTONS - Minimalist Version ===== */}
// <div className="action-buttons print:hidden flex items-center gap-2">
//   <button
//     onClick={() => navigate(-1)}
//     className="back-button flex items-center gap-2 px-3 py-2 bg-transparent text-gray-600 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors duration-150 ease-out focus:outline-none focus:ring-1 focus:ring-gray-300"
//   >
//     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//     </svg>
//     <span>Back</span>
//   </button>

//   <div className="w-px h-5 bg-gray-300"></div>

//   <Link to="/" className="no-underline">
//     <button className="home-button flex items-center gap-2 px-3 py-2 bg-transparent text-blue-600 hover:text-blue-800 font-medium rounded-lg hover:bg-blue-50 active:bg-blue-100 transition-colors duration-150 ease-out focus:outline-none focus:ring-1 focus:ring-blue-300">
//       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
//       </svg>
//       <span>Home ritik</span>
//     </button>
//   </Link>
// </div>



//       <div className="paper" id="paper">
//         {/* ===== HEADER ===== */}
//         <header>
//           <img src={logo} alt="Nazara Diamonds" className="print-logo" />
//           <div>
//             <div className="brand-title inline-block w-2/3">Nazara Diamonds
//               <div className="sub-one-one">Real Diamonds. Ethically Grown.
//                 <div className="sub-one-two">
//                   Registered Office: 106, ShivOm Complex, M.G. Road, Opposite TI Mall,
//                   Indore, 452001 • GSTIN: 23AAKCN6666J1Z0 • CIN:
//                   U47733MP2025PTC077889
//                 </div>
//               </div>
//             </div>
//             <div className="inv-div">
//               <p className="inv-no">Tax Invoice</p>
//               <p className="inv-sub">Place of Supply: Madhya Pradesh (23)</p>
//             </div>
//           </div>
//         </header>

//         {/* ===== META STRIP 1 ===== */}
//         <div className="meta-strip">
//           <div>
//             <div className="meta-label"><strong>Document No:</strong> {invoiceNo}</div>
//           </div>
//           <div>
//             <div className="meta-label">Date</div>
//             {formattedDate}
//           </div>
//           <div>
//             <div className="meta-label">Time</div>
//             {formattedTime}
//           </div>
//           <div>
//             <div className="meta-label">Copy</div>
//             Original
//           </div>
//           <div>
//             <div className="meta-label">Order / Ref</div>
//             {order.orderNo || "ORD-0001"}
//           </div>
//           <div>
//             <div className="meta-label">Salesperson</div>
//             —
//           </div>
//           <div>
//             <div className="meta-label">Delivery Mode</div>
//             {order.deliveryMode || "Store Pickup"}
//           </div>
//           <div>
//             <div className="meta-label">POS</div>
//             Indore
//           </div>
//         </div>

//         {/* ===== CUSTOMER & PAYMENT DETAILS ===== */}
//         <div className="grid-2">
//           <div className="box">
//             <h3>Customer Details</h3>
//             <div><strong>Name:</strong> {customer.name || "—"}</div>
//             <div><strong>Address:</strong> {customer.address || "—"}</div>
//             <div><strong>Phone/Email:</strong> {customer.mobile || "—"} • {customer.email || "—"}</div>
//             <div><strong>GSTIN / State Code:</strong> {customer.gstin || "—"} / {customer.stateCode || "—"}</div>
//           </div>
//           <div className="box">
//             <h3>Payment & Delivery</h3>
//             <div><strong>Payment Mode:</strong> {paymentMode}</div>
//             <div><strong>Transaction ID:</strong> {transactionId || "—"}</div>
//             <div><strong>Delivery To:</strong> Same as Billing</div>
//             <div><strong>Remarks:</strong> {order.remarks || "—"}</div>
//           </div>
//         </div>

//         <h3>Item Details</h3>
//         <div className="row-actions print:hidden">
//           <button className="secondary" onClick={() => window.print()}>
//             Print / Save Invoice
//           </button>
//         </div>

//         {/* ===== ITEM TABLE - UPDATED ===== */}
//         <div className="print-table-wrap">
//           <table id="itemTable" aria-label="Product table" className="w-full text-[12px]">
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>Product Description</th>
//                 <th>HSN</th>
//                 <th>Purity (kt)</th>
//                 <th className="right">Gross Wt (g)</th>
//                 <th className="right">Net Wt (g)</th>
//                 <th className="right">Fine (g)</th>
//                 <th className="right">Gold Rate (₹/g)</th>
//                 <th className="right">Gold Amount (₹)</th>
//                 <th>Cert No.</th>
//                 <th className="right">Diamond Wt (ct)</th>
//                 <th className="right">Diamond Amt (₹)</th>
//                 <th className="right">Stone Wt (ct)</th>
//                 <th className="right">Stone Amt (₹)</th>
//                 <th className="right">Making (₹)</th>
//                 <th className="right">Product Price (₹)</th>
//                 <th className="right">Scheme Discount (₹)</th>
//                 <th className="right">SGST 1.5% (₹)</th>
//                 <th className="right">CGST 1.5% (₹)</th>
//                 <th className="right">Product Value (₹)</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <td className="center idx">1</td>
//                 <td id="prod-desc">
//                   {pd.category || ""}
//                   {pd.size ? ` | Size: ${pd.size}` : ""}
//                   {pd.description ? ` | ${pd.description}` : ""}
//                 </td>
//                 {/* ✅ HSN Code - with debug info */}
//                 <td style={{ fontWeight: 'bold', color: '#333', backgroundColor: actualHsnCode ? '#f0f9ff' : 'transparent' }}>
//                   {actualHsnCode}
//                   {!actualHsnCode && <span style={{ fontSize: '9px', color: '#666', display: 'block' }}>Default: 7113</span>}
//                 </td>
//                 <td id="prod-metal">{pd.metalPurity?.replace("KT", "") || "—"}</td>
//                 <td className="right gross" title={`Gold: ${pd.metalWeight || 0}g, Diamond: ${((pd.diamondWeight || 0) * 0.2).toFixed(3)}g, Stone: ${((pd.stoneWeight || 0) * 0.2).toFixed(3)}g`}>
//                   {pd.grossWeight || calculateGrossWeight()}
//                 </td>
//                 <td className="right net">{pd.metalWeight || "0.000"}</td>
//                 {/* ✅ Fine Gold Weight */}
//                 <td className="right fine" style={{ fontWeight: 'bold', color: actualFineGoldWeight > 0 ? '#333' : '#999' }}>
//                   {actualFineGoldWeight > 0 ? actualFineGoldWeight : "0.000"}
//                 </td>
//                 <td className="right rate">{pricing.metalRate || "0.00"}</td>
//                 <td className="right goldAmt">
//                   {((pricing.metalRate || 0) * (pd.metalWeight || 0) * qty).toFixed(2)}
//                 </td>
//                 {/* ✅ Certificate Number */}
//                 <td style={{ fontWeight: actualCertificateNo ? 'bold' : 'normal', color: actualCertificateNo ? '#333' : '#999' }}>
//                   {actualCertificateNo || "—"}
//                 </td>
//                 <td className="right diaWt">{pd.diamondWeight || "0.000"}</td>
//                 <td className="right diaAmt">
//                   {pd.diamondSelected
//                     ? ((pricing.diamondRate || 0) * (pd.diamondWeight || 0) * qty).toFixed(2)
//                     : "0.00"}
//                 </td>
//                 <td className="right stoneWt">
//                   {pd.otherStoneSelected && pd.stones?.length > 0
//                     ? pd.stones.map((s, i) => (
//                       <div key={i}>
//                         {s.stoneWeight} 
//                       </div>
//                     ))
//                     : "0.000"}
//                 </td>
//                 <td className="right stoneAmt">
//                   {pricing.stoneAmount || 0}
//                 </td>
//                 <td className="right making">
//                   {((pricing.makingCharge || 0) * (pd.metalWeight || 0) * qty).toFixed(2)}
//                 </td>
//                 <td className="right prodPrice">
//                   {(pricing.subtotal || 0).toFixed(2)}
//                 </td>
//                 <td className="right schemeDisc">
//                   {(pricing.discountAmount || 0).toFixed(2)}
//                 </td>
//                 <td className="right sgst">{sgst.toFixed(2)}</td>
//                 <td className="right cgst">{cgst.toFixed(2)}</td>
//                 <td className="right prodValue">
//                   {(pricing.grandTotal || 0).toFixed(2)}
//                 </td>
//               </tr>
//             </tbody>
//             <tfoot>
//               <tr>
//                 <td colSpan={15} className="right"><strong>Totals (Products Only)</strong></td>
//                 <td className="right" id="totProdPrice">
//                   {(pricing.subtotal || 0).toFixed(2)}
//                 </td>
//                 <td className="right" id="totDisc">
//                   {(pricing.discountAmount || 0).toFixed(2)}
//                 </td>
//                 <td className="right" id="totSGST">{sgst.toFixed(2)}</td>
//                 <td className="right" id="totCGST">{cgst.toFixed(2)}</td>
//                 <td className="right" id="totValue">
//                   <strong>{(pricing.grandTotal || 0).toFixed(2)}</strong>
//                 </td>
//               </tr>
//             </tfoot>
//           </table>
//         </div>

//         <h3>Other Charges & Payment Details</h3>
//         <table id="chargesTable">
//           <thead>
//             <tr>
//               <th colSpan={2}>Other Charges</th>
//               <th colSpan={2}>Payment Details</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr>
//               <td>Other Charges (₹)</td>
//               <td className="right" id="other1">0.00</td>
//               <td>Payment Mode</td>
//               <td>{paymentMode}</td>
//             </tr>
//             <tr>
//               <td>Additional Other Charges (₹)</td>
//               <td className="right" id="other2">0.00</td>
//               <td>Advance Paid (₹)</td>
//               <td className="right">{advancePaid.toFixed(2)}</td>
//             </tr>
//             <tr>
//               <td><strong>Total Other Charges (₹)</strong></td>
//               <td className="right" id="totalOther">0.00</td>
//               <td><strong>Balance Payable (₹)</strong></td>
//               <td className="right" id="totalToPay">
//                 <strong className="text-red-600">{balancePayable.toFixed(2)}</strong>
//               </td>
//             </tr>
//           </tbody>
//         </table>

//         <h3>Amount in Words</h3>
//         <div className="box">
//           <span id="amtWords">{numberToWordsIndian(pricing.grandTotal || 0)}</span>
//         </div>

//         {/* ===== NOTES & SIGNATURE ===== */}
//         <div className="grid-2">
//           <div className="box" contentEditable={true} suppressContentEditableWarning={true}>
//             <h3>Notes</h3>
//             <div className="notes">
//               {/* ✅ Certificate और Fine Gold details */}
//               {actualCertificateNo && <div><strong>Certificate No:</strong> {actualCertificateNo}</div>}
//               {actualFineGoldWeight > 0 && <div><strong>Fine Gold Weight:</strong> {actualFineGoldWeight} g</div>}
//               {actualHsnCode && <div><strong>HSN Code:</strong> {actualHsnCode}</div>}
//               Add offer code, packaging notes, etc.
//             </div>
//           </div>
//           <div className="box center">
//             <h3>Signature</h3>
//             <div className="box-inc">
//               <div className="box-inc-two">
//                 Authorised Signatory
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="notes">
//           Registered office & correspondence: Nazara Diamonds, 402, Vibrent Business Centre, Manormaganj, Indore • Email: contact@nazara.in • Phone: +91-9876543210
//         </div>

//         <div className="pagebreak"></div>

//         {/* ===== TERMS & CONDITIONS ===== */}
//         <div className="box border border-gray-300 rounded-lg p-4 min-h-[420px]" contentEditable={true} suppressContentEditableWarning={true}>
//           <h3>Terms & Conditions</h3>
//           <div className="notes text-[11px] text-gray-600 leading-relaxed">
//             <p>1. All diamonds sold are lab-grown and supplied with appropriate grading certificates where applicable.</p>
//             <p>2. Gold purity and weights are recorded as per store weighing standards; minor variations due to scale tolerance are normal and acceptable.</p>
//             <p>3. Prices are based on prevailing gold, diamond and gemstone rates at the time of billing and are subject to change for future orders or re-makes.</p>
//             <p>4. Returns or exchanges, if allowed, are strictly at the discretion of Nazara Diamonds and subject to physical inspection and approval of the item's condition.</p>
//             <p>5. Any customized, engraved, altered or specially ordered pieces are not eligible for cancellation, return or cash refund.</p>
//             <p>6. Manufacturing defects reported within the specified warranty period will be serviced, repaired or replaced as per brand policy. Normal wear and tear or mishandling is not covered.</p>
//             <p>7. GST and any other applicable taxes are charged as per Government regulations in force on the date of invoice. Tax components are clearly shown on the invoice wherever applicable.</p>
//             <p>8. In case of exchange or buy-back, the valuation will be done as per the prevailing exchange policy of Nazara Diamonds at that time, which may differ from original purchase price.</p>
//             <p>9. The customer is requested to verify the invoice details, weights and rate calculations before leaving the counter. Any discrepancy should be reported immediately.</p>
//             <p>10. In case of any dispute, the decision of Nazara Diamonds shall be final and binding. All disputes are subject to Indore jurisdiction only.</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

//bill history of sales bill


import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import { ArrowLeft, Printer, Download, MessageCircle } from "lucide-react";
import BackButton from "../components/BackButton";

export default function InvoicePreview() {
  // URL se ID nikalo (kabhi wo "invoiceId" hoti hai, kabhi "id")
  const { invoiceId, id } = useParams();
  const activeId = invoiceId || id;

  const navigate = useNavigate();
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch HTML Preview
        const htmlRes = await API.get(`/sales-invoices/${activeId}/html`, {
          responseType: "text"
        });
        setHtmlContent(htmlRes.data);

        // 2. Fetch JSON for WhatsApp
        const dataRes = await API.get(`/sales-invoices/${activeId}`);
        if (dataRes.data?.success) {
          setInvoiceData(dataRes.data.invoice);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (activeId) fetchData();
  }, [activeId]);

  const getItemName = (item) => {
    const snap = item.itemSnapshot || item.customSnapshot || {};
    return snap.productDetails?.title || snap.title || "Custom Jewellery";
  };

  const handleWhatsApp = () => {
    if (!invoiceData) {
      alert("Invoice data not loaded yet.");
      return;
    }

    try {
      const customer = invoiceData.customer || {};
      const customerName = customer.name?.trim() || "Customer";
      let mobile = customer.mobile || "";
      if (mobile && !mobile.startsWith("+") && mobile.length === 10) {
        mobile = `91${mobile}`;
      }
      const mobileForWa = mobile.replace(/\D/g, "");

      const invoiceNo = invoiceData.invoiceNo || "N/A";
      const totals = invoiceData.totals || {};
      const grandTotal = totals.grandTotal || 0;

      const itemsBreakdown = (invoiceData.items || []).map((item, idx) => {
        const name = getItemName(item);
        const qty = item.quantity || 1;
        const total = item.breakup?.grandTotal || 0;
        return `${idx + 1}. *${name}* (x${qty}) - ₹${total.toLocaleString('en-IN')}`;
      }).join('\n');

      //const message = `✨ *INVOICE: ${invoiceNo}* ✨\n\nनमस्ते *${customerName}*,\n\nआपका बिल सफलतापूर्वक जनरेट हो गया है।\n\n*आइटम विवरण:*\n--------------------------------\n${itemsBreakdown}\n--------------------------------\n\n*बिल सारांश:*\n• सबटोटल: ₹${(totals.subtotal || 0).toLocaleString('en-IN')}\n• GST: ₹${(totals.gst || 0).toLocaleString('en-IN')}\n• *कुल राशि:* ₹${grandTotal.toLocaleString('en-IN')}\n\n*भुगतान विधि:* ${invoiceData.payment?.mode || "N/A"}\n\nधन्यवाद,\n💎 *Nazara Diamonds* 💎`;
      const message = `✨ *INVOICE: ${invoiceNo}* ✨\n\nHello *${customerName}*,\n\nWe’re delighted to let you know that your invoice has been successfully generated. Thank you for choosing us—it truly means a lot.\n\n*Order Details:*\n--------------------------------\n${itemsBreakdown}\n--------------------------------\n\n*Summary:*\n• Subtotal: ₹${(totals.subtotal || 0).toLocaleString('en-IN')}\n• GST: ₹${(totals.gst || 0).toLocaleString('en-IN')}\n• *Total Amount:* ₹${grandTotal.toLocaleString('en-IN')}\n\n*Payment Method:* ${invoiceData.payment?.mode || "N/A"}\n\nWe sincerely appreciate your trust in us and hope you loved your purchase. If you need any assistance, feel free to reach out—we’re always here for you.\n\nWith gratitude,\n💎 *Nazara Diamonds* 💎`;
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${mobileForWa}?text=${encodedMessage}`, "_blank");
    } catch (err) {
      console.error("WhatsApp Error:", err);
    }
  };

  // Print function jo Iframe ko print karega
  const handlePrint = () => {
    const iframe = document.getElementById("invoice-frame");
    if (iframe) {
      iframe.contentWindow.print();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">

      {/* --- Toolbar --- */}
      <div className="w-full max-w-[210mm] bg-white shadow-md rounded-lg p-4 mb-6 flex justify-between items-center print:hidden">
        <div className="flex items-center gap-4">

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-[#531b4e] font-medium transition"
          >
            <ArrowLeft size={20} /> Back
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Invoice Preview</h1>
            <p className="text-xs text-gray-500">ID: {activeId}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-2 px-5 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#1ea952] shadow-md transition font-semibold"
          >
            <MessageCircle size={18} fill="white" /> WhatsApp
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 bg-[#531b4e] text-white rounded-lg hover:bg-[#3d1339] shadow-md transition font-semibold"
          >
            <Printer size={18} /> Print
          </button>
        </div>
      </div>

      {/* --- PREVIEW AREA --- */}
      <div className="flex-1 w-full flex justify-center overflow-auto pb-10">

        {loading && (
          <div className="flex flex-col items-center justify-center mt-20 text-gray-500">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-[#531b4e] border-solid mb-4"></div>
            <p>Generating Invoice Design...</p>
          </div>
        )}

        {error && (
          <div className="text-red-500 mt-20 text-center">
            <p className="text-xl font-bold">Failed to load Invoice.</p>
            <p className="text-sm">Check if Backend Route <code>/api/sales-invoices/:id/html</code> exists.</p>
          </div>
        )}

        {!loading && !error && (
          /* ✅ IFRAME: Ye backend wala Purple Design dikhayega */
          <div className="bg-white shadow-2xl rounded-sm overflow-hidden" style={{ width: "210mm", height: "297mm" }}>
            <iframe
              id="invoice-frame"
              title="Invoice"
              srcDoc={htmlContent} // Backend ka HTML yahan inject hoga
              className="w-full h-full border-none"
              style={{ display: "block", backgroundColor: "white" }}
            />
          </div>
        )}

      </div>
    </div>
  );
}