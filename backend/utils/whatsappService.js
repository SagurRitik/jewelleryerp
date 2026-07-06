/**
 * whatsappService.js
 *
 * Sends a WhatsApp message with an attached document via AiSensy API.
 * Requires: AISENSY_API_KEY, AISENSY_CAMPAIGN_NAME in .env
 *
 * AiSensy media messages require a PUBLIC URL for the document.
 * Strategy:
 *  1. Save the PDF to /uploads/temp/ so the backend can serve it publicly.
 *  2. POST to AiSensy with that public URL.
 *  3. Delete the temp file after a short delay.
 */

import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AISENSY_ENDPOINT = "https://backend.aisensy.com/campaign/t1/api/v2";

/**
 * Save a PDF buffer to the temp uploads folder and return its public URL.
 * @param {Buffer} pdfBuffer
 * @param {string} filename
 * @param {string} baseUrl  e.g. "https://devjewelerp.nazaradiamonds.com"
 */
export const saveTempPdf = (pdfBuffer, filename, baseUrl) => {
  const tempDir = path.join(__dirname, "..", "uploads", "temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const filePath = path.join(tempDir, filename);
  fs.writeFileSync(filePath, pdfBuffer);

  const publicUrl = `${baseUrl}/uploads/temp/${encodeURIComponent(filename)}`;
  return { filePath, publicUrl };
};

/**
 * Schedule deletion of a temp file after `delayMs` milliseconds.
 */
export const scheduleTempDelete = (filePath, delayMs = 60 * 1000) => {
  setTimeout(() => {
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (err) {
      console.error("⚠️ Failed to delete temp PDF:", err.message);
    }
  }, delayMs);
};

/**
 * Send a WhatsApp message with an attached PDF document via AiSensy.
 *
 * @param {object} opts
 * @param {string} opts.mobile       Customer mobile (10-digit or with country code)
 * @param {string} opts.customerName Customer display name
 * @param {string} opts.pdfUrl       Publicly accessible URL of the PDF
 * @param {string} opts.pdfFilename  Filename for the document attachment
 * @param {string[]} [opts.templateParams]  Template variable values (optional)
 * @returns {Promise<{success:boolean, data?:any, error?:string}>}
 */
export const sendEstimateViaWhatsApp = async ({
  mobile,
  customerName,
  pdfUrl,
  pdfFilename,
  templateParams = [],
}) => {
  const apiKey = process.env.AISENSY_API_KEY;
  const campaignName = process.env.AISENSY_CAMPAIGN_NAME || "invoice_pdf";

  if (!apiKey) {
    return { success: false, error: "AISENSY_API_KEY not configured" };
  }

  // Normalise mobile number: ensure 91 prefix
  const digits = (mobile || "").replace(/\D/g, "");
  if (!digits || digits.length < 10) {
    return { success: false, error: "Invalid mobile number" };
  }
  const destination = digits.length === 10 ? `91${digits}` : digits;

  const payload = {
    apiKey,
    campaignName,
    destination,
    userName: customerName || "Customer",
    media: {
      url: pdfUrl,
      filename: pdfFilename,
    },
    templateParams,
  };

  try {
    const response = await axios.post(AISENSY_ENDPOINT, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    });
    console.log("✅ AiSensy WhatsApp sent:", response.data);
    return { success: true, data: response.data };
  } catch (err) {
    const errMsg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err.message;
    console.error("❌ AiSensy WhatsApp error:", errMsg);
    return { success: false, error: errMsg };
  }
};
