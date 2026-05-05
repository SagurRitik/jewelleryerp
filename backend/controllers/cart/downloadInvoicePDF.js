import puppeteer from "puppeteer";
import { invoiceTemplate } from "../../templates/invoice.template.js";

export const downloadInvoicePDF = async (req, res) => {
  const invoice = await SalesOrder.findById(req.params.id).lean();
  if (!invoice) return res.status(404).send("Invoice not found");

  const html = invoiceTemplate(invoice);

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `inline; filename=${invoice.invoiceNo}.pdf`,
  });

  res.send(pdf);
};


// import puppeteer from "puppeteer";
// import SalesOrder from "../../models/SalesOrder.js";
// import { invoiceTemplate } from "../../templates/invoice.template.js";

// export const downloadInvoicePDF = async (req, res) => {
//   try {
//     const invoice = await SalesOrder.findById(req.params.id).lean();
//     if (!invoice) {
//       return res.status(404).send("Invoice not found");
//     }

//     const html = invoiceTemplate(invoice);

//     const browser = await puppeteer.launch({
//       headless: "new",
//       args: ["--no-sandbox", "--disable-setuid-sandbox"],
//     });

//     const page = await browser.newPage();
//     await page.setContent(html, { waitUntil: "networkidle0" });

//     const pdf = await page.pdf({
//       format: "A4",
//       printBackground: true,
//       margin: {
//         top: "20mm",
//         bottom: "20mm",
//         left: "20mm",
//         right: "20mm",
//       },
//     });

//     await browser.close();

//     res.set({
//       "Content-Type": "application/pdf",
//       "Content-Disposition": `inline; filename=${invoice.invoiceNo}.pdf`,
//     });

//     res.send(pdf);
//   } catch (err) {
//     console.error("PDF ERROR:", err);
//     res.status(500).send("Failed to generate PDF");
//   }
// };
