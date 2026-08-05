// import SalesOrder from "../models/SalesOrder.js";

// export const generateInvoiceNo = async (date = new Date()) => {
//   const invoiceDate = date instanceof Date ? date : new Date(date);

//   const year = invoiceDate.getFullYear();
//   const month = String(invoiceDate.getMonth() + 1).padStart(2, "0");
//   const day = String(invoiceDate.getDate()).padStart(2, "0");

//   const prefix = `NZD-${year}/${month}/${day}`;

//   // 🔍 find last invoice for that date
//   const lastInvoice = await SalesOrder.findOne({
//     invoiceNo: { $regex: `^${prefix}` },
//   })
//     .sort({ createdAt: -1 })
//     .lean();

//   let nextNumber = 1;

//   if (lastInvoice?.invoiceNo) {
//     const lastSeq = lastInvoice.invoiceNo.split("-").pop();
//     nextNumber = Number(lastSeq) + 1;
//   }

//   const sequence = String(nextNumber).padStart(4, "0");

//   return `${prefix}-${sequence}`;
// };


import SalesOrder from "../models/SalesOrder.js";

export const generateInvoiceNo = async (date = new Date()) => {
  const invoiceDate = new Date(date);

  const year = invoiceDate.getFullYear();
  const month = String(invoiceDate.getMonth() + 1).padStart(2, "0");
  const day = String(invoiceDate.getDate()).padStart(2, "0");

  const prefix = `NZD-${year}/${month}/${day}`;

  // Find all invoices to find the absolute maximum sequence suffix globally
  const allInvoices = await SalesOrder.find({}, { invoiceNo: 1 }).lean();
  
  let maxSeq = 0;
  for (const inv of allInvoices) {
    if (inv.invoiceNo) {
      const parts = inv.invoiceNo.split("-");
      const lastPart = parts[parts.length - 1];
      const seq = parseInt(lastPart, 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }

  const nextNumber = maxSeq + 1;
  const sequence = String(nextNumber).padStart(5, "0");

  return `${prefix}-${sequence}`;
};