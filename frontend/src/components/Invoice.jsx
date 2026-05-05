

// import React from "react";

// export default function Invoice({ invoice }) {
//   // 🏢 COMPANY DETAILS (Hardcoded for Template - Replace with your data)
//   const COMPANY_INFO = {
//     name: "MY STORE NAME",
//     address: "123, Market Road, Indore, MP - 452001",
//     phone: "+91 98765 43210",
//     email: "support@mystore.com",
//     gstin: "23ABCDE1234F1Z5",
//   };

//   if (!invoice) return null;

//   const {
//     invoiceNo,
//     date,
//     customer,
//     items,
//     pricing,
//     paymentMode,
//     transactionRef,
//   } = invoice;

//   return (
//     <div className="mx-auto max-w-[210mm] bg-white p-8 shadow-lg print:max-w-full print:p-0 print:shadow-none">
//       {/* --- HEADER --- */}
//       <div className="flex justify-between border-b-2 border-gray-100 pb-6">
//         {/* Left: Company Info */}
//         <div>
//           <h1 className="text-2xl font-bold uppercase tracking-wide text-[#5A374F]">
//             {COMPANY_INFO.name}
//           </h1>
//           <div className="mt-2 text-sm text-gray-500">
//             <p>{COMPANY_INFO.address}</p>
//             <p>Phone: {COMPANY_INFO.phone}</p>
//             <p>Email: {COMPANY_INFO.email}</p>
//             <p className="font-semibold text-gray-700">GSTIN: {COMPANY_INFO.gstin}</p>
//           </div>
//         </div>

//         {/* Right: Invoice Meta */}
//         <div className="text-right">
//           <h2 className="text-3xl font-light text-gray-300">INVOICE</h2>
//           <div className="mt-4 space-y-1 text-sm">
//             <div className="flex justify-end gap-4">
//               <span className="font-medium text-gray-600">Invoice No:</span>
//               <span className="font-bold text-black">{invoiceNo}</span>
//             </div>
//             <div className="flex justify-end gap-4">
//               <span className="font-medium text-gray-600">Date:</span>
//               <span className="font-bold text-black">{date}</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* --- BILL TO SECTION --- */}
//       <div className="py-6">
//         <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
//           Billed To
//         </h3>
//         <div className="mt-2">
//           <p className="text-lg font-bold text-gray-800">
//             {customer.name || "Walk-in Customer"}
//           </p>
//           {customer.mobile && (
//             <p className="text-sm text-gray-600">+91 {customer.mobile}</p>
//           )}
//           {customer.address && (
//             <p className="text-sm text-gray-600 md:w-1/2">{customer.address}</p>
//           )}
//         </div>
//       </div>

//       {/* --- TABLE --- */}
//       <div className="mt-4">
//         <table className="w-full border-collapse text-left">
//           <thead>
//             <tr className="bg-gray-100 text-xs uppercase text-gray-600">
//               <th className="py-3 pl-4 font-semibold rounded-l-md">#</th>
//               <th className="py-3 font-semibold w-1/2">Item Description</th>
//               <th className="py-3 text-right font-semibold">Price</th>
//               <th className="py-3 text-right font-semibold">Qty</th>
//               <th className="py-3 pr-4 text-right font-semibold rounded-r-md">
//                 Total
//               </th>
//             </tr>
//           </thead>
//           <tbody className="text-sm text-gray-700">
//             {items.map((item, index) => (
//               <tr key={index} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
//                 <td className="py-3 pl-4 text-gray-400">{index + 1}</td>
//                 <td className="py-3 font-medium">
//                   {item.itemSnapshot?.title || item.title || "Item"}
//                   {item.itemSnapshot?.code && (
//                     <span className="block text-xs text-gray-400">
//                       SKU: {item.itemSnapshot.code}
//                     </span>
//                   )}
//                 </td>
//                 <td className="py-3 text-right">
//                   ₹{(item.breakup?.itemTotal / item.quantity).toFixed(2)}
//                 </td>
//                 <td className="py-3 text-right">{item.quantity}</td>
//                 <td className="py-3 pr-4 text-right font-medium">
//                   ₹{item.breakup?.itemTotal || 0}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* --- FOOTER & TOTALS --- */}
//       <div className="mt-8 flex flex-col md:flex-row justify-between">
//         {/* Left: Payment Info & Terms */}
//         <div className="mb-6 md:mb-0 md:w-1/2 text-sm text-gray-600">
//           <div className="mb-4 rounded-lg bg-gray-50 p-4">
//             <p className="font-bold text-gray-800 mb-2">Payment Details</p>
//             <div className="flex gap-2">
//               <span className="text-gray-500">Mode:</span>
//               <span className="font-medium text-gray-900 uppercase">
//                 {paymentMode || "Cash"}
//               </span>
//             </div>
//             {transactionRef && (
//               <div className="flex gap-2">
//                 <span className="text-gray-500">Ref ID:</span>
//                 <span className="font-medium text-gray-900">{transactionRef}</span>
//               </div>
//             )}
//           </div>
//           <p className="text-xs text-gray-400 italic">
//             * Goods once sold will not be taken back.
//             <br />* Subject to Indore Jurisdiction.
//           </p>
//         </div>

//         {/* Right: Calculations */}
//         <div className="md:w-1/3">
//           <div className="space-y-2 text-sm">
//             <div className="flex justify-between text-gray-600">
//               <span>Subtotal</span>
//               <span>₹{pricing.subtotal}</span>
//             </div>
//             {pricing.gst > 0 && (
//               <div className="flex justify-between text-gray-600">
//                 <span>Tax (GST)</span>
//                 <span>+ ₹{pricing.gst}</span>
//               </div>
//             )}
//             {pricing.discount > 0 && (
//               <div className="flex justify-between text-green-600">
//                 <span>Discount</span>
//                 <span>- ₹{pricing.discount}</span>
//               </div>
//             )}
//             <div className="my-2 border-t border-gray-200"></div>
//             <div className="flex justify-between items-center bg-[#5A374F] text-white p-3 rounded-lg shadow-sm">
//               <span className="font-semibold">Grand Total</span>
//               <span className="text-xl font-bold">₹{pricing.grandTotal}</span>
//             </div>
//           </div>

//           {/* Signature Area */}
//           <div className="mt-12 text-center">
//             <div className="border-t border-gray-300 w-2/3 mx-auto"></div>
//             <p className="mt-2 text-xs text-gray-500">Authorized Signatory</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// import React from "react";

// export default function Invoice({ invoice }) {
//   // 🔒 SECURITY CHECK: Data nahi hai to render mat karo
//   if (!invoice) return null;

//   // 🛠 HELPER FUNCTIONS (To prevent crashes)
//   const safeNum = (val) => Number(val) || 0;
  
//   const formatCurrency = (val) => 
//     safeNum(val).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

//   const formatDecimal = (val) => safeNum(val).toFixed(2);

//   // Theme Colors
//   const THEME_DARK = "#501b46";
//   const THEME_LIGHT = "#fbf5f9";

//   return (
//     <div className="max-w-[297mm] mx-auto bg-white shadow-xl print:shadow-none font-sans text-gray-800 leading-tight">
      
//       {/* --- HEADER --- */}
//       <div className="flex w-full">
//         <div className="w-[35%] p-6 flex items-center justify-center text-white" style={{ backgroundColor: THEME_DARK }}>
//           <div className="text-center">
//              <div className="border-2 border-white rounded-full p-2 w-16 h-16 mx-auto mb-2 flex items-center justify-center">
//                 <span className="text-2xl">💎</span>
//              </div>
//              <h1 className="text-4xl font-serif tracking-widest">nazara</h1>
//              <p className="text-[10px] tracking-widest uppercase">Real Diamonds. Ethically Grown.</p>
//           </div>
//         </div>

//         <div className="w-[65%] p-6 bg-white flex flex-col justify-center">
//           <h2 className="text-3xl font-bold text-[#501b46] mb-1">Nazara Diamonds</h2>
//           <p className="text-sm text-gray-500 mb-4">Real Diamonds. Ethically Grown.</p>
//           <div className="text-xs text-gray-700 space-y-1">
//             <p>Store Address: 106, ShivOm Complex, M.G. Road, Indore, 452001</p>
//             <p>GSTIN: 23AAKCN6666J1ZO | CIN: U47733MP2025PTC077889</p>
//           </div>
//         </div>
//       </div>

//       {/* --- META STRIP --- */}
//       <div className="bg-[#f8f8f8] py-2 px-6 border-b border-gray-200 grid grid-cols-7 gap-4 text-[10px] uppercase font-semibold text-gray-600">
//         <div><span className="block text-[9px] text-gray-400">Document No</span><span className="text-black text-xs">{invoice.invoiceNo}</span></div>
//         <div><span className="block text-[9px] text-gray-400">Date</span><span className="text-black text-xs">{invoice.date}</span></div>
//         <div><span className="block text-[9px] text-gray-400">Copy</span><span className="text-black text-xs">Original</span></div>
//         <div className="col-span-1"><span className="block text-[9px] text-gray-400">Order/Ref</span><span className="text-black text-xs">{invoice.orderRef}</span></div>
//         <div><span className="block text-[9px] text-gray-400">Salesperson</span><span className="text-black text-xs">{invoice.salesperson}</span></div>
//         <div><span className="block text-[9px] text-gray-400">Mode</span><span className="text-black text-xs">{invoice.deliveryMode}</span></div>
//         <div className="text-right"><span className="block text-[9px] text-gray-400">POS</span><span className="text-black text-xs">{invoice.pos}</span></div>
//       </div>

//       {/* --- CUSTOMER --- */}
//       <div className="flex border-b border-gray-200">
//         <div className="w-1/2 p-4 border-r border-gray-200">
//           <h3 className="text-[#501b46] font-bold text-sm mb-3">Customer Details</h3>
//           <div className="text-xs space-y-1 text-gray-700">
//             <p><span className="font-bold">Name:</span> {invoice.customer?.name}</p>
//             <p>Mobile: {invoice.customer?.mobile}</p>
//             <p>Address: {invoice.customer?.address}</p>
//             <p>GSTIN: {invoice.customer?.gstin}</p>
//           </div>
//         </div>
//         <div className="w-1/2 p-4">
//           <h3 className="text-[#501b46] font-bold text-sm mb-3">Payment Info</h3>
//           <div className="text-xs space-y-1 text-gray-700">
//             <p>Mode: {invoice.payment?.mode}</p>
//             <p>Ref: {invoice.payment?.ref}</p>
//             <p>Status: <span className="font-bold">{invoice.payment?.status}</span></p>
//           </div>
//         </div>
//       </div>

//       {/* --- TABLE --- */}
//       <div className="w-full">
//         <table className="w-full text-[10px] border-collapse">
//           <thead>
//             <tr style={{ backgroundColor: THEME_LIGHT }} className="border-b border-gray-300 text-gray-800 font-bold">
//               <th className="py-2 px-1 text-center border-r">Qty</th>
//               <th className="py-2 px-1 text-left border-r w-32">Description</th>
//               <th className="py-2 px-1 text-center border-r">Metal</th>
//               <th className="py-2 px-1 text-center border-r">Purity</th>
//               <th className="py-2 px-1 text-right border-r">G. Wt</th>
//               <th className="py-2 px-1 text-right border-r">N. Wt</th>
//               <th className="py-2 px-1 text-right border-r">Rate</th>
//               <th className="py-2 px-1 text-right border-r">Dia Ct</th>
//               <th className="py-2 px-1 text-right border-r">Making</th>
//               <th className="py-2 px-1 text-right border-r">SGST</th>
//               <th className="py-2 px-1 text-right border-r">CGST</th>
//               <th className="py-2 px-1 text-right">Total</th>
//             </tr>
//           </thead>
//           <tbody>
//             {invoice.items && invoice.items.length > 0 ? (
//                 invoice.items.map((item, idx) => (
//                 <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 text-gray-700 align-top">
//                     <td className="py-2 px-1 text-center border-r">{item.qty}</td>
//                     <td className="py-2 px-1 text-left border-r">{item.description}</td>
//                     <td className="py-2 px-1 text-center border-r">{item.metalType}</td>
//                     <td className="py-2 px-1 text-center border-r">{item.purity}</td>
//                     <td className="py-2 px-1 text-right border-r">{formatDecimal(item.grossWt)}</td>
//                     <td className="py-2 px-1 text-right border-r">{formatDecimal(item.netWt)}</td>
//                     <td className="py-2 px-1 text-right border-r">{formatCurrency(item.metalRate)}</td>
//                     <td className="py-2 px-1 text-right border-r">{formatDecimal(item.diaWt)}</td>
//                     <td className="py-2 px-1 text-right border-r">{formatCurrency(item.makingCharges)}</td>
//                     <td className="py-2 px-1 text-right border-r">{formatDecimal(item.sgst)}</td>
//                     <td className="py-2 px-1 text-right border-r">{formatDecimal(item.cgst)}</td>
//                     <td className="py-2 px-1 text-right font-bold">{formatCurrency(item.totalValue)}</td>
//                 </tr>
//                 ))
//             ) : (
//                 <tr><td colSpan="12" className="text-center py-4">No Items Found</td></tr>
//             )}
//           </tbody>
//           <tfoot>
//             <tr className="bg-gray-50 font-bold text-gray-800 border-t border-b-2 border-gray-200">
//                 <td colSpan="11" className="text-right py-2 px-2">Total Amount</td>
//                 <td className="text-right py-2 px-1">{formatCurrency(invoice.totals?.grandTotal)}</td>
//             </tr>
//           </tfoot>
//         </table>
//       </div>

//       {/* --- FOOTER TOTALS --- */}
//       <div className="border-b border-gray-300 grid grid-cols-2">
//             <div className="border-r border-gray-300 p-2">
//                  <h4 className="text-[#501b46] font-bold text-xs mb-2">Other Charges</h4>
//                  <div className="flex justify-between text-xs py-1">
//                     <span>Other Charges</span>
//                     <span>{formatDecimal(invoice.totals?.otherCharges)}</span>
//                  </div>
//             </div>
//             <div>
//                  <div className="flex justify-between font-bold text-sm px-2 py-3 bg-gray-50 text-[#501b46]">
//                     <span>Grand Total</span>
//                     <span>₹ {formatCurrency(invoice.totals?.grandTotal)}</span>
//                  </div>
//             </div>
//       </div>

//       <div className="p-4 border-b border-gray-200">
//          <h4 className="text-[#501b46] font-bold text-xs mb-1">Amount in Words</h4>
//          <p className="text-xs text-gray-700 capitalize">{invoice.amountInWords || "-"}</p>
//       </div>

//       {/* --- TERMS --- */}
//       <div className="m-4 rounded-lg p-4 bg-gray-50 text-[9px] text-gray-600">
//         <h4 className="text-[#501b46] font-bold text-xs mb-2">Terms & Conditions</h4>
//         <ul className="list-disc pl-4 space-y-1">
//             <li>Subject to Indore Jurisdiction.</li>
//             <li>Gold purity recorded as per store standards.</li>
//             <li>E. & O.E.</li>
//         </ul>
//       </div>

//       <div className="p-4 text-center">
//         <p className="text-xs font-bold">Authorized Signatory</p>
//       </div>
//     </div>
//   );
// }

// import React from "react";

// export default function Invoice({ invoice }) {
//   if (!invoice) return null;

//   // Helpers
//   const formatCurrency = (val) => 
//     Number(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
//   const formatDecimal = (val) => Number(val || 0).toFixed(2);

//   // Colors
//   const THEME_DARK = "#501b46"; 
//   const THEME_LIGHT = "#fbf5f9"; 

//   return (
//     <div className="max-w-[297mm] mx-auto bg-white shadow-lg print:shadow-none font-sans text-gray-800 text-[11px]">
      
//       {/* HEADER */}
//       <div className="flex w-full h-40">
//         <div className="w-[35%] flex items-center justify-center text-white" style={{ backgroundColor: THEME_DARK }}>
//            <div className="text-center">
//              {/* Logo Placeholder - Isse replace karein apne <img> tag se */}
//              <div className="border-2 border-white rounded-full p-2 w-16 h-16 mx-auto mb-2 flex items-center justify-center text-3xl">💎</div>
//              <h1 className="text-4xl font-serif tracking-widest">nazara</h1>
//              <p className="text-[10px] tracking-widest uppercase mt-1">Real Diamonds. Ethically Grown.</p>
//            </div>
//         </div>

//         <div className="w-[65%] pl-8 flex flex-col justify-center bg-white border-b-4 border-pink-100">
//           <h2 className="text-3xl font-bold text-[#501b46]">Nazara Diamonds</h2>
//           <p className="text-xs text-gray-500 mb-4">Real Diamonds. Ethically Grown.</p>
//           <div className="text-xs text-gray-700 space-y-1">
//             <p>Store Address: 106, ShivOm Complex, M.G. Road, Opposite TI Mall, Indore, 452001</p>
//             <p>GSTIN: 23AAKCN6666J1ZO | CIN: U47733MP2025PTC077889</p>
//           </div>
//         </div>
//       </div>

//       {/* META INFO */}
//       <div className="bg-[#f8f8f8] py-3 px-6 border-b border-gray-200 grid grid-cols-7 gap-2 text-[10px]">
//         <div><span className="block text-gray-500 font-bold mb-1">Document No</span><span className="font-semibold text-black text-xs">{invoice.invoiceNo}</span></div>
//         <div><span className="block text-gray-500 font-bold mb-1">Date</span><span className="font-semibold text-black text-xs">{invoice.date}</span></div>
//         <div><span className="block text-gray-500 font-bold mb-1">Copy</span><span className="font-semibold text-black text-xs">Original</span></div>
//         <div className="col-span-1"><span className="block text-gray-500 font-bold mb-1">Order/Ref</span><span className="font-semibold text-black text-xs">{invoice.orderRef}</span></div>
//         <div><span className="block text-gray-500 font-bold mb-1">Salesperson</span><span className="font-semibold text-black text-xs">{invoice.salesperson}</span></div>
//         <div><span className="block text-gray-500 font-bold mb-1">Delivery Mode</span><span className="font-semibold text-black text-xs">{invoice.deliveryMode}</span></div>
//         <div className="text-right"><span className="block text-gray-500 font-bold mb-1">POS</span><span className="font-semibold text-black text-xs">{invoice.pos}</span></div>
//       </div>

//       {/* CUSTOMER & PAYMENT */}
//       <div className="flex border-b border-gray-300 h-44">
//         <div className="w-1/2 p-5 border-r border-gray-300">
//           <h3 className="text-[#501b46] font-bold text-sm mb-4 border-b pb-1 inline-block">Customer Details</h3>
//           <div className="text-xs space-y-1.5 text-gray-800">
//             <p><span className="font-bold">Name:</span> {invoice.customer.name}</p>
//             <p>Mobile: {invoice.customer.mobile}</p>
//             <p>Email: {invoice.customer.email}</p>
//             <p>Address: {invoice.customer.address}</p>
//             <p>GSTIN: {invoice.customer.gstin}</p>
//             <p>State Code: {invoice.customer.stateCode}</p>
//           </div>
//         </div>
//         <div className="w-1/2 p-5">
//           <h3 className="text-[#501b46] font-bold text-sm mb-4 border-b pb-1 inline-block">Payment & Delivery</h3>
//           <div className="text-xs space-y-1.5 text-gray-800">
//             <p>Mode: {invoice.payment.mode}</p>
//             <p>Ref: {invoice.payment.ref}</p>
//             <p>Status: <span className="font-bold">{invoice.payment.status}</span></p>
//           </div>
//         </div>
//       </div>

//       {/* ITEMS TABLE */}
//       <div className="w-full">
//         <table className="w-full text-[10px] border-collapse">
//           <thead>
//             <tr style={{ backgroundColor: THEME_LIGHT }} className="border-b border-gray-300 text-[#501b46] font-bold h-10">
//               <th className="border-r border-gray-200 px-1 w-8">Qty</th>
//               <th className="border-r border-gray-200 px-2 text-left w-24">Product Description</th>
//               <th className="border-r border-gray-200 px-1">HSN</th>
//               <th className="border-r border-gray-200 px-1">Metal Type</th>
//               <th className="border-r border-gray-200 px-1">Purity (kt)</th>
//               <th className="border-r border-gray-200 px-1 text-right">Gross Wt (g)</th>
//               <th className="border-r border-gray-200 px-1 text-right">Net Wt (g)</th>
//               <th className="border-r border-gray-200 px-1 text-right">Metal Rate</th>
//               <th className="border-r border-gray-200 px-1">Cert No.</th>
//               <th className="border-r border-gray-200 px-1 text-right">Dia Wt (ct)</th>
//               <th className="border-r border-gray-200 px-1 text-right">Dia Rate</th>
//               <th className="border-r border-gray-200 px-1 text-right">Stone Wt</th>
//               <th className="border-r border-gray-200 px-1 text-right">Stone Rate</th>
//               <th className="border-r border-gray-200 px-1 text-right">Making (₹)</th>
//               <th className="border-r border-gray-200 px-1 text-right">Product Price</th>
//               <th className="border-r border-gray-200 px-1 text-right">Scheme Disc</th>
//               <th className="border-r border-gray-200 px-1 text-right">SGST 1.5%</th>
//               <th className="border-r border-gray-200 px-1 text-right">CGST 1.5%</th>
//               <th className="px-2 text-right">Product Value (₹)</th>
//             </tr>
//           </thead>
//           <tbody>
//             {invoice.items.map((item, idx) => (
//               <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 h-12 text-gray-700">
//                 <td className="text-center border-r px-1">{item.qty}</td>
//                 <td className="text-left border-r px-2 font-semibold capitalize">{item.description}</td>
//                 <td className="text-center border-r px-1">{item.hsn}</td>
//                 <td className="text-center border-r px-1 capitalize">{item.metalType}</td>
//                 <td className="text-center border-r px-1">{item.purity}</td>
//                 <td className="text-right border-r px-1">{formatDecimal(item.grossWt)}</td>
//                 <td className="text-right border-r px-1">{formatDecimal(item.netWt)}</td>
//                 <td className="text-right border-r px-1">{formatCurrency(item.metalRate)}</td>
//                 <td className="text-center border-r px-1 text-[9px] uppercase">{item.certNo}</td>
//                 <td className="text-right border-r px-1">{formatDecimal(item.diaWt)}</td>
//                 <td className="text-right border-r px-1">{formatCurrency(item.diaRate)}</td>
//                 <td className="text-right border-r px-1">{formatDecimal(item.stoneWt)}</td>
//                 <td className="text-right border-r px-1">{formatCurrency(item.stoneRate)}</td>
//                 <td className="text-right border-r px-1">{formatCurrency(item.makingCharges)}</td>
//                 <td className="text-right border-r px-1">{formatCurrency(item.productPrice)}</td>
//                 <td className="text-right border-r px-1">{formatCurrency(item.schemeDisc)}</td>
//                 <td className="text-right border-r px-1">{formatDecimal(item.sgst)}</td>
//                 <td className="text-right border-r px-1">{formatDecimal(item.cgst)}</td>
//                 <td className="text-right px-2 font-bold">{formatCurrency(item.totalValue)}</td>
//               </tr>
//             ))}
//              {/* Empty filler rows to maintain height */}
//              {invoice.items.length < 3 && <tr className="h-16"><td colSpan="19"></td></tr>}
//           </tbody>
//           <tfoot>
//              <tr className="bg-gray-50 font-bold border-t border-b-2 border-gray-300 h-10">
//                 <td colSpan="14" className="text-right px-2">Totals</td>
//                 <td className="text-right px-1">{formatCurrency(invoice.totals.totalProductValue)}</td>
//                 <td className="text-right px-1">-</td>
//                 <td className="text-right px-1">{formatDecimal(invoice.totals.totalTax/2)}</td>
//                 <td className="text-right px-1">{formatDecimal(invoice.totals.totalTax/2)}</td>
//                 <td className="text-right px-2 text-black text-sm">{formatCurrency(invoice.totals.grandTotal)}</td>
//              </tr>
//           </tfoot>
//         </table>
//       </div>

//       {/* BOTTOM SECTION */}
//       <div className="border-b border-gray-300">
//           <div className="grid grid-cols-2">
//              <div className="border-r border-gray-300">
//                 <h4 className="text-[#501b46] font-bold text-xs p-2 border-b border-gray-200">Other Charges & Payment Details</h4>
//                 <div className="p-2 space-y-2">
//                     <div className="flex justify-between text-xs border-b border-gray-100 pb-1">
//                         <span>Other Charges (₹)</span>
//                         <span>{formatDecimal(invoice.totals.otherCharges)}</span>
//                     </div>
//                     <div className="flex justify-between font-bold text-xs pt-1">
//                         <span className="text-gray-600">Total Other Charges (₹)</span>
//                         <span>{formatDecimal(invoice.totals.otherCharges)}</span>
//                     </div>
//                 </div>
//              </div>
//              <div>
//                  <div className="p-2 pt-6">
//                     <div className="flex justify-between text-xs border-b border-gray-200 pb-2 mb-2">
//                         <span>Payment Mode</span>
//                         <span className="uppercase">{invoice.payment.mode}</span>
//                     </div>
//                      <div className="flex justify-between font-bold text-sm p-3 bg-pink-50 text-[#501b46] rounded">
//                         <span>Total Amount to be Paid (₹)</span>
//                         <span>{formatCurrency(invoice.totals.grandTotal)}</span>
//                      </div>
//                  </div>
//              </div>
//           </div>
//       </div>

//       <div className="p-4 border-b border-gray-300">
//          <h4 className="text-[#501b46] font-bold text-xs mb-1">Amount in Words</h4>
//          <p className="text-xs text-gray-700 capitalize italic">{invoice.amountInWords}</p>
//       </div>

//       <div className="p-4">
//         <div className="flex gap-6 mb-4">
//            <div className="w-1/2 bg-pink-50 rounded-lg p-4 h-32">
//               <h4 className="text-[#501b46] font-bold text-sm mb-2">Notes</h4>
//            </div>
//            <div className="w-1/2 bg-pink-50 rounded-lg p-4 h-32 flex flex-col justify-end items-center">
//                <h4 className="text-[#501b46] font-bold text-sm mb-8 self-start">Signature</h4>
//                <div className="w-3/4 border-t border-black"></div>
//                <p className="text-xs mt-1">Authorised Signatory</p>
//            </div>
//         </div>
        
//         <div className="bg-pink-50 rounded-lg p-4 text-[10px] text-gray-600 leading-relaxed">
//             <h4 className="text-[#501b46] font-bold text-xs mb-2">Terms & Conditions</h4>
//             <ol className="list-decimal pl-4 space-y-0.5">
//                 <li>All diamonds sold are lab-grown and are supplied with appropriate grading and certification where applicable.</li>
//                 <li>Gold purity and weights are recorded as per store weighing standards.</li>
//                 <li>In case of any dispute, the decision of Nazara Diamonds shall be final and binding.</li>
//                 <li>Subject to Indore Jurisdiction.</li>
//             </ol>
//         </div>
        
//         <div className="text-[9px] text-gray-400 text-center mt-4">
//            Registered office: Nazara Diamonds, 402, Vibrant Business Centre, Manormaganj, Indore
//         </div>
//       </div>
//     </div>
//   );
// }

// import React from "react";

// export default function Invoice({ invoice }) {
//   if (!invoice) return null;

//   const formatCurrency = (val) => 
//     Number(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
//   const formatDecimal = (val) => Number(val || 0).toFixed(2);

//   const THEME_DARK = "#501b46"; 
//   const THEME_LIGHT = "#fbf5f9"; 

//   return (
//     <div className="max-w-[297mm] mx-auto bg-white shadow-lg print:shadow-none font-sans text-gray-800 text-[10px]">
      
//       {/* HEADER */}
//       <div className="flex w-full h-36">
//         <div className="w-[35%] flex items-center justify-center text-white" style={{ backgroundColor: THEME_DARK }}>
//            <div className="text-center">
//              <div className="border-2 border-white rounded-full p-2 w-14 h-14 mx-auto mb-2 flex items-center justify-center text-2xl">💎</div>
//              <h1 className="text-3xl font-serif tracking-widest">nazara</h1>
//              <p className="text-[9px] tracking-widest uppercase mt-1">Real Diamonds. Ethically Grown.</p>
//            </div>
//         </div>

//         <div className="w-[65%] pl-8 flex flex-col justify-center bg-white border-b-4 border-pink-100">
//           <h2 className="text-2xl font-bold text-[#501b46]">Nazara Diamonds</h2>
//           <p className="text-xs text-gray-500 mb-2">Real Diamonds. Ethically Grown.</p>
//           <div className="text-[10px] text-gray-700 space-y-0.5">
//             <p>Store Address: 106, ShivOm Complex, M.G. Road, Indore, 452001</p>
//             <p>GSTIN: 23AAKCN6666J1ZO | CIN: U47733MP2025PTC077889</p>
//           </div>
//         </div>
//       </div>

//       {/* META INFO */}
//       <div className="bg-[#f8f8f8] py-2 px-6 border-b border-gray-200 grid grid-cols-7 gap-2">
//         <div><span className="block text-gray-500 font-bold">Document No</span><span className="font-semibold text-black">{invoice.invoiceNo}</span></div>
//         <div><span className="block text-gray-500 font-bold">Date</span><span className="font-semibold text-black">{invoice.date}</span></div>
//         <div><span className="block text-gray-500 font-bold">Copy</span><span className="font-semibold text-black">Original</span></div>
//         <div className="col-span-1"><span className="block text-gray-500 font-bold">Order/Ref</span><span className="font-semibold text-black">{invoice.orderRef}</span></div>
//         <div><span className="block text-gray-500 font-bold">Salesperson</span><span className="font-semibold text-black">{invoice.salesperson}</span></div>
//         <div><span className="block text-gray-500 font-bold">Mode</span><span className="font-semibold text-black">{invoice.deliveryMode}</span></div>
//         <div className="text-right"><span className="block text-gray-500 font-bold">POS</span><span className="font-semibold text-black">{invoice.pos}</span></div>
//       </div>

//       {/* CUSTOMER & PAYMENT */}
//       <div className="flex border-b border-gray-300 h-32">
//         <div className="w-1/2 p-4 border-r border-gray-300">
//           <h3 className="text-[#501b46] font-bold text-xs mb-2 border-b pb-1 inline-block">Customer Details</h3>
//           <div className="text-[10px] space-y-1 text-gray-800">
//             <p><span className="font-bold">Name:</span> {invoice.customer.name}</p>
//             <p>Mobile: {invoice.customer.mobile}</p>
//             <p>Address: {invoice.customer.address}</p>
//             <p>GSTIN: {invoice.customer.gstin}</p>
//           </div>
//         </div>
//         <div className="w-1/2 p-4">
//           <h3 className="text-[#501b46] font-bold text-xs mb-2 border-b pb-1 inline-block">Payment & Delivery</h3>
//           <div className="text-[10px] space-y-1 text-gray-800">
//             <p>Mode: {invoice.payment.mode}</p>
//             <p>Ref: {invoice.payment.ref}</p>
//             <p>Status: <span className="font-bold">{invoice.payment.status}</span></p>
//           </div>
//         </div>
//       </div>

//       {/* ITEMS TABLE */}
//       <div className="w-full">
//         <table className="w-full text-[9px] border-collapse">
//           <thead>
//             <tr style={{ backgroundColor: THEME_LIGHT }} className="border-b border-gray-300 text-[#501b46] font-bold h-8">
//               <th className="border-r border-gray-200 px-1 w-6">Qty</th>
//               <th className="border-r border-gray-200 px-2 text-left w-28">Description</th>
//               <th className="border-r border-gray-200 px-1">HSN</th>
//               <th className="border-r border-gray-200 px-1">Metal</th>
//               <th className="border-r border-gray-200 px-1">Purity</th>
//               <th className="border-r border-gray-200 px-1 text-right">G. Wt</th>
//               <th className="border-r border-gray-200 px-1 text-right">N. Wt</th>
//               <th className="border-r border-gray-200 px-1 text-right">Rate</th>
//               <th className="border-r border-gray-200 px-1">Cert No</th>
//               <th className="border-r border-gray-200 px-1 text-right">Dia Ct</th>
//               <th className="border-r border-gray-200 px-1 text-right">Dia Rate</th>
//               <th className="border-r border-gray-200 px-1 text-right">Stone</th>
//               <th className="border-r border-gray-200 px-1 text-right">St. Rate</th>
//               <th className="border-r border-gray-200 px-1 text-right">Making</th>
//               <th className="border-r border-gray-200 px-1 text-right">Price</th>
//               <th className="border-r border-gray-200 px-1 text-right">Disc.</th>
//               <th className="border-r border-gray-200 px-1 text-right">SGST</th>
//               <th className="border-r border-gray-200 px-1 text-right">CGST</th>
//               <th className="px-2 text-right">Value</th>
//             </tr>
//           </thead>
//           <tbody>
//             {invoice.items.map((item, idx) => (
//               <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 h-10 text-gray-700 align-middle">
//                 <td className="text-center border-r px-1">{item.qty}</td>
//                 <td className="text-left border-r px-2 font-semibold capitalize leading-tight">{item.description}</td>
//                 <td className="text-center border-r px-1">{item.hsn}</td>
//                 <td className="text-center border-r px-1 capitalize">{item.metalType}</td>
//                 <td className="text-center border-r px-1">{item.purity}</td>
//                 <td className="text-right border-r px-1">{formatDecimal(item.grossWt)}</td>
//                 <td className="text-right border-r px-1">{formatDecimal(item.netWt)}</td>
//                 <td className="text-right border-r px-1">{formatCurrency(item.metalRate)}</td>
//                 <td className="text-center border-r px-1 text-[8px] uppercase">{item.certNo}</td>
//                 <td className="text-right border-r px-1">{formatDecimal(item.diaWt)}</td>
//                 <td className="text-right border-r px-1">{formatCurrency(item.diaRate)}</td>
//                 <td className="text-right border-r px-1">{formatDecimal(item.stoneWt)}</td>
//                 <td className="text-right border-r px-1">{formatCurrency(item.stoneRate)}</td>
                
//                 {/* --- THESE SHOULD NOW WORK --- */}
//                 <td className="text-right border-r px-1">{formatCurrency(item.makingCharges)}</td>
//                 <td className="text-right border-r px-1">{formatCurrency(item.productPrice)}</td>
//                 <td className="text-right border-r px-1">{formatCurrency(item.schemeDisc)}</td>
                
//                 <td className="text-right border-r px-1">{formatDecimal(item.sgst)}</td>
//                 <td className="text-right border-r px-1">{formatDecimal(item.cgst)}</td>
//                 <td className="text-right px-2 font-bold">{formatCurrency(item.totalValue)}</td>
//               </tr>
//             ))}
//              {/* Filler Rows */}
//              {invoice.items.length < 3 && <tr className="h-10"><td colSpan="19"></td></tr>}
//           </tbody>
//           <tfoot>
//              <tr className="bg-gray-50 font-bold border-t border-b-2 border-gray-300 h-8">
//                 <td colSpan="14" className="text-right px-2">Totals</td>
//                 <td className="text-right px-1">{formatCurrency(invoice.totals.totalProductValue)}</td>
//                 <td className="text-right px-1">-</td>
//                 <td className="text-right px-1">{formatDecimal(invoice.totals.totalTax/2)}</td>
//                 <td className="text-right px-1">{formatDecimal(invoice.totals.totalTax/2)}</td>
//                 <td className="text-right px-2 text-black">{formatCurrency(invoice.totals.grandTotal)}</td>
//              </tr>
//           </tfoot>
//         </table>
//       </div>

//       {/* FOOTER */}
//       <div className="border-b border-gray-300">
//           <div className="grid grid-cols-2">
//              <div className="border-r border-gray-300 p-2">
//                 <h4 className="text-[#501b46] font-bold text-[10px] mb-1">Other Charges</h4>
//                 <div className="flex justify-between text-[10px]">
//                     <span>Other Charges</span>
//                     <span>{formatDecimal(invoice.totals.otherCharges)}</span>
//                 </div>
//              </div>
//              <div>
//                  <div className="p-2 pt-4">
//                      <div className="flex justify-between font-bold text-xs p-2 bg-pink-50 text-[#501b46] rounded">
//                         <span>Total Amount (₹)</span>
//                         <span>{formatCurrency(invoice.totals.grandTotal)}</span>
//                      </div>
//                  </div>
//              </div>
//           </div>
//       </div>

//       <div className="p-4 border-b border-gray-300">
//          <h4 className="text-[#501b46] font-bold text-[10px] mb-1">Amount in Words</h4>
//          <p className="text-[10px] text-gray-700 capitalize italic">{invoice.amountInWords}</p>
//       </div>

//       <div className="p-4">
//         <div className="bg-pink-50 rounded-lg p-3 text-[9px] text-gray-600 leading-relaxed">
//             <h4 className="text-[#501b46] font-bold mb-1">Terms & Conditions</h4>
//             <ol className="list-decimal pl-4">
//                 <li>Lab-grown diamonds, certified where applicable.</li>
//                 <li>Weights as per store standards.</li>
//                 <li>Subject to Indore Jurisdiction.</li>
//             </ol>
//         </div>
//         <div className="text-[8px] text-gray-400 text-center mt-2">
//            Nazara Diamonds, Indore
//         </div>
//       </div>
//     </div>
//   );
// }
//======================================================================

// import React from "react";
// import logo from "../assets/nazara_logo.png";
// export default function Invoice({ invoice }) {
//   if (!invoice) return null;

//   const formatCurrency = (val) => 
//     Number(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//   const formatDecimal = (val) => Number(val || 0).toFixed(2);

//   const THEME_DARK = "#501b46"; 
//   const THEME_LIGHT = "#fbf5f9"; 

//   return (
//     <div className="max-w-[297mm] mx-auto bg-white shadow-lg print:shadow-none font-sans text-gray-800 text-[10px]">
      
//       {/* HEADER */}
//       {/* <div className="flex w-full h-36">
//         <div className="w-[35%] flex items-center justify-center text-white" style={{ backgroundColor: THEME_DARK }}>
//            <div className="text-center">
            
             
//              <h1 className="text-xl ">  <img
//                              src={logo}
//                              alt="Nazara Jewellery"
//                             className="h-20"
//                            /></h1>
//              <p className="text-[9px] tracking-widest uppercase mt-1">Real Diamonds. Ethically Grown.</p>
//            </div>
//         </div> */}
//         <div className="flex w-full h-36">
//         {/* LEFT SIDE: LOGO AREA */}
//         <div 
//           className="w-[35%] flex flex-col items-center justify-center p-4 text-white overflow-hidden relative" 
//           style={{ backgroundColor: THEME_DARK }}
//         >
//            {/* Logo Image */}
//            <img
//              src={logo}
//              alt="Nazara Jewellery"
//              // 🔥 TRICK: 'brightness-0 invert' converts black logo to white automatically
//              className="w-48 h-auto object-contain mb-2 brightness-0 invert" 
//            />
           
//            {/* Tagline */}
//            {/* <p className="text-[9px] tracking-[0.25em] uppercase text-center opacity-90 leading-relaxed">
//              Real Diamonds. Ethically Grown.
//            </p> */}
//         </div>
//         <div className="w-[65%] pl-8 flex flex-col justify-center bg-white border-b-4 border-pink-100">
//           <h2 className="text-2xl font-bold text-[#501b46]">Nazara Diamonds</h2>
//           <p className="text-xs text-gray-500 mb-2">Real Diamonds. Ethically Grown.</p>
//           <div className="text-[10px] text-gray-700 space-y-0.5">
//             <p>Store Address: 106, ShivOm Complex, M.G. Road, Indore, 452001</p>
//             <p>GSTIN: 23AAKCN6666J1ZO | CIN: U47733MP2025PTC077889</p>
//           </div>
//         </div>
//       </div>

//       {/* META INFO - Order Ref dynamically dikhega */}
//       <div className="bg-[#f8f8f8] py-2 px-6 border-b border-gray-200 grid grid-cols-7 gap-2">
//         <div><span className="block text-gray-500 font-bold">Document No</span><span className="font-semibold text-black">{invoice.invoiceNo}</span></div>
//         <div><span className="block text-gray-500 font-bold">Date</span><span className="font-semibold text-black">{invoice.date}</span></div>
//         <div><span className="block text-gray-500 font-bold">Copy</span><span className="font-semibold text-black">Original</span></div>
//         <div className="col-span-1"><span className="block text-gray-500 font-bold">Order/Ref</span><span className="font-semibold text-black break-words">{invoice.orderRef}</span></div>
//         <div><span className="block text-gray-500 font-bold">Salesperson</span><span className="font-semibold text-black">{invoice.salesperson}</span></div>
//         <div><span className="block text-gray-500 font-bold">Mode</span><span className="font-semibold text-black">{invoice.deliveryMode}</span></div>
//         <div className="text-right"><span className="block text-gray-500 font-bold">POS</span><span className="font-semibold text-black">{invoice.pos}</span></div>
//       </div>

//       {/* CUSTOMER & PAYMENT */}
//       <div className="flex border-b border-gray-300 h-32">
//         <div className="w-1/2 p-4 border-r border-gray-300">
//           <h3 className="text-[#501b46] font-bold text-xs mb-2 border-b pb-1 inline-block">Customer Details</h3>
//           <div className="text-[10px] space-y-1 text-gray-800">
//             <p><span className="font-bold">Name:</span> {invoice.customer.name}</p>
//             <p>Mobile: {invoice.customer.mobile}</p>
//             <p>Address: {invoice.customer.address}</p>
//             <p>GSTIN: {invoice.customer.gstin}</p>
//           </div>
//         </div>
//         <div className="w-1/2 p-4">
//           <h3 className="text-[#501b46] font-bold text-xs mb-2 border-b pb-1 inline-block">Payment & Delivery</h3>
//           <div className="text-[10px] space-y-1 text-gray-800">
//             <p>Mode: {invoice.payment.mode}</p>
//             <p>Ref: {invoice.payment.ref}</p>
//             <p>Status: <span className="font-bold">{invoice.payment.status}</span></p>
//           </div>
//         </div>
//       </div>

//       {/* ITEMS TABLE - DYNAMIC RENDERING */}
//       <div className="w-full">
//         <table className="w-full text-[9px] border-collapse table-fixed">
//           <thead>
//             <tr style={{ backgroundColor: THEME_LIGHT }} className="border-b border-gray-300 text-[#501b46] font-bold h-8">
//               <th className="border-r border-gray-200 px-1 w-[3%]">Qty</th>
//               <th className="border-r border-gray-200 px-2 text-left w-[15%]">Description</th>
//               <th className="border-r border-gray-200 px-1 w-[4%]">HSN</th>
//               <th className="border-r border-gray-200 px-1 w-[5%]">Metal</th>
//               <th className="border-r border-gray-200 px-1 w-[4%]">Purity</th>
//               <th className="border-r border-gray-200 px-1 text-right w-[5%]">G.Wt</th>
//               <th className="border-r border-gray-200 px-1 text-right w-[5%]">N.Wt</th>
//               <th className="border-r border-gray-200 px-1 text-right w-[6%]">Rate</th>
//               <th className="border-r border-gray-200 px-1 w-[5%]">Cert</th>
//               <th className="border-r border-gray-200 px-1 text-right w-[5%]">DiaCt</th>
//               <th className="border-r border-gray-200 px-1 text-right w-[6%]">DiaRate</th>
//               <th className="border-r border-gray-200 px-1 text-right w-[5%]">Stone</th>
//               <th className="border-r border-gray-200 px-1 text-right w-[6%]">StRate</th>
//               <th className="border-r border-gray-200 px-1 text-right w-[6%]">Making</th>
//               <th className="border-r border-gray-200 px-1 text-right w-[7%]">Price</th>
//               <th className="border-r border-gray-200 px-1 text-right w-[4%]">Disc</th>
//               <th className="border-r border-gray-200 px-1 text-right w-[5%]">SGST</th>
//               <th className="border-r border-gray-200 px-1 text-right w-[5%]">CGST</th>
//               <th className="px-2 text-right w-[9%]">Value</th>
//             </tr>
//           </thead>
//           <tbody>
//             {/* 🔥 LOOPS ALL ITEMS */}
//             {invoice.items.map((item, idx) => (
//               <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 min-h-[40px] text-gray-700 align-top">
//                 <td className="text-center border-r px-1 py-2">{item.qty}</td>
//                 <td className="text-left border-r px-2 py-2 font-semibold capitalize leading-tight">
//                   {item.description}
//                 </td>
//                 <td className="text-center border-r px-1 py-2">{item.hsn}</td>
//                 <td className="text-center border-r px-1 py-2 capitalize">{item.metalType}</td>
//                 <td className="text-center border-r px-1 py-2">{item.purity}</td>
//                 <td className="text-right border-r px-1 py-2">{formatDecimal(item.grossWt)}</td>
//                 <td className="text-right border-r px-1 py-2">{formatDecimal(item.netWt)}</td>
//                 <td className="text-right border-r px-1 py-2">{formatCurrency(item.metalRate)}</td>
//                 <td className="text-center border-r px-1 py-2 text-[8px] uppercase">{item.certNo}</td>
//                 <td className="text-right border-r px-1 py-2">{formatDecimal(item.diaWt)}</td>
//                 <td className="text-right border-r px-1 py-2">{formatCurrency(item.diaRate)}</td>
//                 <td className="text-right border-r px-1 py-2">{formatDecimal(item.stoneWt)}</td>
//                 <td className="text-right border-r px-1 py-2">{formatCurrency(item.stoneRate)}</td>
//                 <td className="text-right border-r px-1 py-2">{formatCurrency(item.makingCharges)}</td>
//                 <td className="text-right border-r px-1 py-2">{formatCurrency(item.productPrice)}</td>
//                 <td className="text-right border-r px-1 py-2">{formatCurrency(item.schemeDisc)}</td>
//                 <td className="text-right border-r px-1 py-2">{formatDecimal(item.sgst)}</td>
//                 <td className="text-right border-r px-1 py-2">{formatDecimal(item.cgst)}</td>
//                 <td className="text-right px-2 py-2 font-bold">{formatCurrency(item.totalValue)}</td>
//               </tr>
//             ))}
//           </tbody>
//           <tfoot>
//              <tr className="bg-gray-50 font-bold border-t border-b-2 border-gray-300 h-8">
//                 <td colSpan="14" className="text-right px-2">Totals</td>
//                 <td className="text-right px-1">{formatCurrency(invoice.totals.totalProductValue)}</td>
//                 <td className="text-right px-1">-</td>
//                 <td className="text-right px-1">{formatDecimal(invoice.totals.totalTax/2)}</td>
//                 <td className="text-right px-1">{formatDecimal(invoice.totals.totalTax/2)}</td>
//                 <td className="text-right px-2 text-black">{formatCurrency(invoice.totals.grandTotal)}</td>
//              </tr>
//           </tfoot>
//         </table>
//       </div>

//       {/* FOOTER SAME AS BEFORE */}
//       <div className="border-b border-gray-300">
//           <div className="grid grid-cols-2">
//              <div className="border-r border-gray-300 p-2">
//                 <h4 className="text-[#501b46] font-bold text-[10px] mb-1">Other Charges</h4>
//                 <div className="flex justify-between text-[10px]">
//                     <span>Other Charges</span>
//                     <span>{formatDecimal(invoice.totals.otherCharges)}</span>
//                 </div>
//              </div>
//              <div>
//                  <div className="p-2 pt-4">
//                      <div className="flex justify-between font-bold text-xs p-2 bg-pink-50 text-[#501b46] rounded">
//                         <span>Total Amount (₹)</span>
//                         <span>{formatCurrency(invoice.totals.grandTotal)}</span>
//                      </div>
//                  </div>
//              </div>
//           </div>
//       </div>
      
//       {/* AMOUNT IN WORDS & TERMS (Same as previous) */}
//       <div className="p-4 border-b border-gray-300">
//          <h4 className="text-[#501b46] font-bold text-[10px] mb-1">Amount in Words</h4>
//          <p className="text-[10px] text-gray-700 capitalize italic">{invoice.amountInWords}</p>
//       </div>
//       <div className="p-4">
//         <div className="bg-pink-50 rounded-lg p-3 text-[9px] text-gray-600 leading-relaxed">
//             <h4 className="text-[#501b46] font-bold mb-1">Terms & Conditions</h4>
//             <ol className="list-decimal pl-4">
//                 <li>Lab-grown diamonds.</li>
//                 <li>Subject to Indore Jurisdiction.</li>
//             </ol>
//         </div>
//         <div className="text-[8px] text-gray-400 text-center mt-2">Nazara Diamonds, Indore</div>
//       </div>
//     </div>
//   );
// }

import React from "react";
import logo from "../assets/nazara_logo.png";

export default function Invoice({ invoice }) {
  if (!invoice) return null;

  const formatCurrency = (val) =>
    Number(val || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const formatDecimal = (val) => Number(val || 0).toFixed(2);

  const THEME_DARK = "#501b46";
  const THEME_LIGHT = "#fbf5f9";

  return (
    <div className="max-w-[297mm] mx-auto bg-white shadow-lg print:shadow-none font-sans text-gray-800">
      
      {/* --- HEADER --- */}
      <div className="flex w-full h-32">
        {/* Left: Logo Section */}
        <div
          className="w-[35%] flex flex-col items-center justify-center p-2"
          style={{ backgroundColor: THEME_DARK }}
        >
          <img
            src={logo}
            alt="Nazara Jewellery"
            className="w-40 h-auto object-contain brightness-0 invert"
          />
          {/* Tagline */}
          <p className="text-[8px] text-white tracking-[0.2em] uppercase mt-1 opacity-90">
            Real Diamonds. Ethically Grown.
          </p>
        </div>

        {/* Right: Company Details */}
        <div className="w-[65%] pl-6 flex flex-col justify-center bg-white border-b-4 border-pink-100">
          <h2 className="text-3xl font-bold text-[#501b46]">Nazara Diamonds</h2>
          <p className="text-[10px] text-gray-500 mb-2 uppercase tracking-wide">
            Real Diamonds. Ethically Grown.
          </p>
          <div className="text-[9px] text-gray-700 space-y-0.5">
            <p>Store Address: 106, ShivOm Complex, M.G. Road, Indore, 452001</p>
            <p>GSTIN: 23AAKCN6666J1ZO | CIN: U47733MP2025PTC077889</p>
          </div>
        </div>
      </div>

      {/* --- META STRIP --- */}
      <div className="bg-[#f8f8f8] py-2 px-4 border-b border-gray-200 grid grid-cols-7 gap-2 text-[9px]">
        <div>
          <span className="block text-gray-400 font-bold">Document No</span>
          <span className="font-semibold text-black">{invoice.invoiceNo}</span>
        </div>
        <div>
          <span className="block text-gray-400 font-bold">Date</span>
          <span className="font-semibold text-black">{invoice.date}</span>
        </div>
        <div>
          <span className="block text-gray-400 font-bold">Copy</span>
          <span className="font-semibold text-black">Original</span>
        </div>
        <div className="col-span-1">
          <span className="block text-gray-400 font-bold">Order/Ref</span>
          <span className="font-semibold text-black break-words leading-tight">
            {invoice.orderRef}
          </span>
        </div>
        <div>
          <span className="block text-gray-400 font-bold">Salesperson</span>
          <span className="font-semibold text-black">{invoice.salesperson}</span>
        </div>
        <div>
          <span className="block text-gray-400 font-bold">Mode</span>
          <span className="font-semibold text-black">{invoice.deliveryMode}</span>
        </div>
        <div className="text-right">
          <span className="block text-gray-400 font-bold">POS</span>
          <span className="font-semibold text-black">{invoice.pos}</span>
        </div>
      </div>

      {/* --- CUSTOMER & PAYMENT --- */}
      <div className="flex border-b border-gray-300 h-28">
        <div className="w-1/2 p-3 border-r border-gray-300">
          <h3 className="text-[#501b46] font-bold text-[10px] mb-1 border-b pb-0.5 inline-block">
            Customer Details
          </h3>
          <div className="text-[9px] space-y-0.5 text-gray-800">
            <p><span className="font-bold">Name:</span> {invoice.customer.name}</p>
            <p>Mobile: {invoice.customer.mobile}</p>
            <p>Address: {invoice.customer.address}</p>
            <p>GSTIN: {invoice.customer.gstin}</p>
          </div>
        </div>
        <div className="w-1/2 p-3">
          <h3 className="text-[#501b46] font-bold text-[10px] mb-1 border-b pb-0.5 inline-block">
            Payment & Delivery
          </h3>
          <div className="text-[9px] space-y-0.5 text-gray-800">
            <p>Mode: {invoice.payment.mode}</p>
            <p>Ref: {invoice.payment.ref}</p>
            <p>Status: <span className="font-bold">{invoice.payment.status}</span></p>
          </div>
        </div>
      </div>

      {/* --- ITEMS TABLE (Fixed Overlapping) --- */}
      <div className="w-full">
        <table className="w-full border-collapse table-fixed">
          <thead>
            <tr
              style={{ backgroundColor: THEME_LIGHT }}
              className="border-b border-gray-300 text-[#501b46] font-bold h-7 text-[7px]"
            >
              {/* Adjusted Widths for 19 Columns */}
              <th className="border-r border-gray-200 px-0.5 w-[3%]">Qty</th>
              <th className="border-r border-gray-200 px-1 text-left w-[14%]">Description</th>
              <th className="border-r border-gray-200 px-0.5 w-[4%]">HSN</th>
              <th className="border-r border-gray-200 px-0.5 w-[4%]">Metal</th>
              <th className="border-r border-gray-200 px-0.5 w-[3%]">Kt</th>
              <th className="border-r border-gray-200 px-0.5 text-right w-[4%]">G.Wt</th>
              <th className="border-r border-gray-200 px-0.5 text-right w-[4%]">N.Wt</th>
              <th className="border-r border-gray-200 px-0.5 text-right w-[5%]">Rate</th>
              <th className="border-r border-gray-200 px-0.5 w-[4%]">Cert</th>
              <th className="border-r border-gray-200 px-0.5 text-right w-[4%]">D.Wt</th>
              <th className="border-r border-gray-200 px-0.5 text-right w-[5%]">D.Rate</th>
              <th className="border-r border-gray-200 px-0.5 text-right w-[4%]">St.Wt</th>
              <th className="border-r border-gray-200 px-0.5 text-right w-[5%]">St.Rate</th>
              <th className="border-r border-gray-200 px-0.5 text-right w-[6%]">Making</th>
              <th className="border-r border-gray-200 px-0.5 text-right w-[7%]">Price</th>
              <th className="border-r border-gray-200 px-0.5 text-right w-[4%]">Disc</th>
              <th className="border-r border-gray-200 px-0.5 text-right w-[5%]">SGST</th>
              <th className="border-r border-gray-200 px-0.5 text-right w-[5%]">CGST</th>
              <th className="px-1 text-right w-[9%]">Value</th>
            </tr>
          </thead>
          <tbody className="text-[7px]">
            {invoice.items.map((item, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-200 hover:bg-gray-50 min-h-[30px] text-gray-700 align-top"
              >
                <td className="text-center border-r px-0.5 py-1">{item.qty}</td>
                <td className="text-left border-r px-1 py-1 font-semibold leading-tight break-words">
                  {item.description}
                </td>
                <td className="text-center border-r px-0.5 py-1">{item.hsn}</td>
                <td className="text-center border-r px-0.5 py-1 capitalize">{item.metalType}</td>
                <td className="text-center border-r px-0.5 py-1">{item.purity}</td>
                <td className="text-right border-r px-0.5 py-1 whitespace-nowrap">{formatDecimal(item.grossWt)}</td>
                <td className="text-right border-r px-0.5 py-1 whitespace-nowrap">{formatDecimal(item.netWt)}</td>
                <td className="text-right border-r px-0.5 py-1 whitespace-nowrap">{formatCurrency(item.metalRate)}</td>
                <td className="text-center border-r px-0.5 py-1 text-[6px] uppercase break-all">{item.certNo}</td>
                <td className="text-right border-r px-0.5 py-1 whitespace-nowrap">{formatDecimal(item.diaWt)}</td>
                <td className="text-right border-r px-0.5 py-1 whitespace-nowrap">{formatCurrency(item.diaRate)}</td>
                <td className="text-right border-r px-0.5 py-1 whitespace-nowrap">{formatDecimal(item.stoneWt)}</td>
                <td className="text-right border-r px-0.5 py-1 whitespace-nowrap">{formatCurrency(item.stoneRate)}</td>
                <td className="text-right border-r px-0.5 py-1 whitespace-nowrap">{formatCurrency(item.makingCharges)}</td>
                <td className="text-right border-r px-0.5 py-1 whitespace-nowrap">{formatCurrency(item.productPrice)}</td>
                <td className="text-right border-r px-0.5 py-1 whitespace-nowrap">{formatCurrency(item.schemeDisc)}</td>
                <td className="text-right border-r px-0.5 py-1 whitespace-nowrap">{formatDecimal(item.sgst)}</td>
                <td className="text-right border-r px-0.5 py-1 whitespace-nowrap">{formatDecimal(item.cgst)}</td>
                <td className="text-right px-1 py-1 font-bold whitespace-nowrap">{formatCurrency(item.totalValue)}</td>
              </tr>
            ))}
            {/* Filler to maintain height */}
            {invoice.items.length < 5 && <tr className="h-20"><td colSpan="19"></td></tr>}
          </tbody>
          <tfoot className="text-[7px]">
            <tr className="bg-gray-50 font-bold border-t border-b-2 border-gray-300 h-6">
              <td colSpan="14" className="text-right px-2">Totals</td>
              <td className="text-right px-0.5 whitespace-nowrap">{formatCurrency(invoice.totals.totalProductValue)}</td>
              <td className="text-right px-0.5">-</td>
              <td className="text-right px-0.5 whitespace-nowrap">{formatDecimal(invoice.totals.totalTax / 2)}</td>
              <td className="text-right px-0.5 whitespace-nowrap">{formatDecimal(invoice.totals.totalTax / 2)}</td>
              <td className="text-right px-1 text-black whitespace-nowrap">{formatCurrency(invoice.totals.grandTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* --- FOOTER TOTALS --- */}
      <div className="border-b border-gray-300">
        <div className="grid grid-cols-2">
          {/* Left: Charges */}
          <div className="border-r border-gray-300 p-2">
            <h4 className="text-[#501b46] font-bold text-[9px] mb-1">Other Charges</h4>
            <div className="flex justify-between text-[9px]">
              <span>Other Charges</span>
              <span>{formatDecimal(invoice.totals.otherCharges)}</span>
            </div>
          </div>
          {/* Right: Grand Total */}
          <div className="p-2 pt-4">
            <div className="flex justify-between font-bold text-[10px] p-2 bg-pink-50 text-[#501b46] rounded">
              <span>Grand Total (₹)</span>
              <span>{formatCurrency(invoice.totals.grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Words */}
      <div className="p-3 border-b border-gray-300">
        <h4 className="text-[#501b46] font-bold text-[9px] mb-0.5">Amount in Words</h4>
        <p className="text-[9px] text-gray-700 capitalize italic leading-tight">
          {invoice.amountInWords}
        </p>
      </div>

      {/* Footer Notes */}
      <div className="p-3">
        <div className="bg-pink-50 rounded p-2 text-[8px] text-gray-600 leading-tight">
          <h4 className="text-[#501b46] font-bold mb-0.5">Terms & Conditions</h4>
          <ol className="list-decimal pl-3 space-y-0">
            <li>Diamonds are lab-grown. Weights as per store standards.</li>
            <li>Returns/Exchange at Nazara Diamonds discretion.</li>
            <li>Subject to Indore Jurisdiction.</li>
          </ol>
        </div>
        <div className="text-[7px] text-gray-400 text-center mt-1">
          Nazara Diamonds, Indore
        </div>
      </div>
    </div>
  );
}