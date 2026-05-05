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


// utils/generateInvoiceNo.js
import SalesOrder from "../models/SalesOrder.js";

export const generateInvoiceNo = async (date = new Date()) => {
  const invoiceDate = new Date(date);

  const year = invoiceDate.getFullYear();
  const month = String(invoiceDate.getMonth() + 1).padStart(2, "0");
  const day = String(invoiceDate.getDate()).padStart(2, "0");

  const prefix = `NZD-${year}/${month}/${day}`;

  // 🔥 last invoice (global, not date-wise)
  const lastInvoice = await SalesOrder.findOne({})
    .sort({ createdAt: -1 })
    .lean();

  let nextNumber = 1;

  if (lastInvoice?.invoiceNo) {
    const lastSeq = lastInvoice.invoiceNo.split("-").pop();
    nextNumber = Number(lastSeq) + 1;
  }

  const sequence = String(nextNumber).padStart(5, "0");

  return `${prefix}-${sequence}`;
};