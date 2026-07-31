import puppeteer from "puppeteer";
import SalesOrder from "../../models/SalesOrder.js";
import { invoiceTemplate } from "../../templates/invoice.template.js";

export const downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await SalesOrder.findById(req.params.id).lean();
    if (!invoice) return res.status(404).send("Invoice not found");

    const html = await invoiceTemplate(invoice);

    const launchArgs = [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-extensions",
    ];

    const browser = await puppeteer.launch({ headless: true, args: launchArgs });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 30000 });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "5mm", bottom: "5mm", left: "5mm", right: "5mm" },
    });

    await browser.close();

    const safeNo = (invoice.invoiceNo || String(invoice._id)).replace(/[/\\:*?"<>|]/g, "-");
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Invoice-${safeNo}.pdf"`,
      "Content-Length": pdf.length,
    });

    res.send(pdf);
  } catch (err) {
    console.error("PDF ERROR:", err);
    res.status(500).send("Failed to generate PDF");
  }
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
