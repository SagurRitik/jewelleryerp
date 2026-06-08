/**
 * estimate.template.js
 * Generates a self-contained HTML string for the estimate PDF.
 * All styling is inline to ensure correct Puppeteer rendering.
 */

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtDate = (d, days = 0) => {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + days);
  return dt.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// Convert image file path to base64 data URI for embedding in the PDF
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const toBase64 = (filePath) => {
  try {
    const buf = fs.readFileSync(filePath);
    const ext = path.extname(filePath).replace(".", "") || "png";
    const mime = ext === "jpg" ? "jpeg" : ext;
    return `data:image/${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
};

// Load the logo once at module load time
const logoPath = path.join(__dirname, "../assets/NazaraWhite.png");
const logoBase64 = toBase64(logoPath);

export const estimateTemplate = (q, baseUrl = "") => {
  const validUntil = fmtDate(q.createdAt, q.validDays || 7);
  const issueDate = fmtDate(q.createdAt);

  const itemsHtml = (q.items || [])
    .map((item, idx) => {
      const b = item.breakup || {};

      // Build image thumbnails
      const imagesHtml =
        item.images && item.images.length > 0
          ? `<div style="padding:6px 15px;background:#fff;display:flex;gap:6px;border-bottom:1px solid #f3f4f6;">
              ${item.images
                .slice(0, 4)
                .map((img) => {
                  // Try to load image from disk as base64
                  let src = "";
                  try {
                    const cleanPath = img.startsWith("/") ? img.slice(1) : img;
                    const diskPath = path.join(__dirname, "..", cleanPath);
                    const base64 = toBase64(diskPath);
                    src = base64 || `${baseUrl}${img}`;
                  } catch {
                    src = `${baseUrl}${img}`;
                  }
                  return `<div style="width:60px;height:60px;border-radius:6px;overflow:hidden;border:1px solid #e5e7eb;flex-shrink:0;">
                    <img src="${src}" alt="Product" style="width:100%;height:100%;object-fit:cover;" />
                  </div>`;
                })
                .join("")}
            </div>`
          : "";

      // Component rows
      const componentRows = (b.componentBreakup || [])
        .filter((cb) => cb.pricingRef !== "BELT")
        .map(
          (cb) => `
        <tr style="border-bottom:1px solid #cbd5e1;">
          <td style="padding:5px 15px;text-transform:uppercase;font-size:10px;">
            ${cb.type || ""} ${cb.shape ? `— ${cb.shape}` : ""} ${cb.color || ""} ${cb.clarity || ""}
          </td>
          <td style="padding:5px 15px;text-align:center;color:#64748b;font-size:11px;">
            ${cb.count} pc × ${cb.weight}ct
          </td>
          <td style="padding:5px 15px;text-align:right;font-weight:700;font-size:11px;">₹${fmt(cb.value)}</td>
        </tr>`
        )
        .join("");

      const beltItems = (b.componentBreakup || []).filter(
        (cb) => cb.pricingRef === "BELT"
      );
      const beltRows =
        beltItems.length > 0
          ? `<tr style="background:#f1f5f9;border-bottom:1px solid #cbd5e1;">
              <td colspan="3" style="padding:4px 15px;color:#5A374F;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;">Accessories</td>
            </tr>
            ${beltItems
              .map(
                (cb) => `
              <tr style="border-bottom:1px solid #cbd5e1;">
                <td style="padding:5px 15px;font-size:10px;">
                  Belt ${cb.category ? `(${cb.category})` : ""} ${cb.shape ? `— ${cb.shape}` : ""} ${cb.size ? `| Size: ${cb.size}` : ""}
                </td>
                <td style="padding:5px 15px;text-align:center;color:#64748b;font-size:11px;">
                  ${cb.count} pcs × ₹${fmt(cb.value / (cb.count || 1))}
                </td>
                <td style="padding:5px 15px;text-align:right;font-weight:700;font-size:11px;">₹${fmt(cb.value)}</td>
              </tr>`
              )
              .join("")}`
          : "";

      const extraValueRows = [
        b.diamondValue > 0
          ? `<tr style="border-bottom:1px solid #cbd5e1;background:#fdfdfd;">
              <td colspan="2" style="padding:4px 15px;color:#64748b;font-size:10px;">Diamond Value</td>
              <td style="padding:4px 15px;text-align:right;font-weight:700;font-size:11px;">₹${fmt(b.diamondValue)}</td>
            </tr>`
          : "",
        b.stoneValue > 0
          ? `<tr style="border-bottom:1px solid #cbd5e1;background:#fdfdfd;">
              <td colspan="2" style="padding:4px 15px;color:#64748b;font-size:10px;">Stone Value</td>
              <td style="padding:4px 15px;text-align:right;font-weight:700;font-size:11px;">₹${fmt(b.stoneValue)}</td>
            </tr>`
          : "",
        b.accessoryValue > 0
          ? `<tr style="border-bottom:1px solid #cbd5e1;background:#fdfdfd;">
              <td colspan="2" style="padding:4px 15px;color:#64748b;font-size:10px;">Accessories Value</td>
              <td style="padding:4px 15px;text-align:right;font-weight:700;font-size:11px;">₹${fmt(b.accessoryValue)}</td>
            </tr>`
          : "",
      ]
        .filter(Boolean)
        .join("");

      return `
      <div style="margin-bottom:8px;border:1px solid #94a3b8;border-radius:10px;overflow:hidden;page-break-inside:avoid;">
        <!-- Item Header -->
        <div style="background:#5A374F;color:white;padding:5px 15px;display:flex;justify-content:space-between;align-items:center;">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:20px;height:20px;border-radius:5px;background:rgba(116,85,131,0.81);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#e4e1f2;">${idx + 1}</div>
            <span style="font-weight:700;font-size:13px;">${item.title || "Jewellery Item"}</span>
          </div>
          <span style="font-weight:800;font-size:14px;color:#ebe9f3;font-family:monospace;">₹${fmt(b.grandTotal)}</span>
        </div>

        ${imagesHtml}

        <!-- Breakdown Table -->
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr style="background:#f8fafc;border-bottom:1px solid #94a3b8;">
              <th style="text-align:left;padding:6px 15px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-size:10px;">Specification</th>
              <th style="text-align:center;padding:6px 15px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-size:10px;">Detail</th>
              <th style="text-align:right;padding:6px 15px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-size:10px;">Value</th>
            </tr>
          </thead>
          <tbody style="color:#334155;">
            <!-- Metal Row -->
            <tr style="border-bottom:1px solid #cbd5e1;">
              <td style="padding:6px 15px;font-weight:600;">${item.metalType || ""} (${item.metalPurity || ""})</td>
              <td style="padding:6px 15px;text-align:center;color:#64748b;">${item.netWeight}gm × ₹${fmt(b.metalRate)}/gm</td>
              <td style="padding:6px 15px;text-align:right;font-weight:700;">₹${fmt(b.metalValue)}</td>
            </tr>
            ${componentRows}
            ${beltRows}
            ${extraValueRows}
            <!-- Making Charges -->
            <tr style="border-bottom:1px solid #cbd5e1;background:#fdfdfd;">
              <td colspan="2" style="padding:4px 15px;color:#64748b;font-size:10px;">Making Charges</td>
              <td style="padding:4px 15px;text-align:right;font-weight:700;font-size:11px;">₹${fmt(b.makingCharge)}</td>
            </tr>
            <!-- Subtotal -->
            <tr style="background:#f8fafc;">
              <td colspan="2" style="padding:6px 15px;font-weight:700;">Subtotal</td>
              <td style="padding:6px 15px;text-align:right;font-weight:800;">₹${fmt(b.subtotal)}</td>
            </tr>
            <!-- GST -->
            <tr>
              <td colspan="2" style="padding:4px 15px;font-size:10px;color:#64748b;">GST (${b.gstPercent}%)</td>
              <td style="padding:4px 15px;text-align:right;font-size:10px;color:#64748b;">+₹${fmt(b.gst)}</td>
            </tr>
            <!-- Grand Total per item -->
            <tr style="background:#f1f5f9;">
              <td colspan="2" style="padding:8px 15px;font-weight:800;color:#5A374F;font-size:11px;">Item Total (incl. GST)</td>
              <td style="padding:8px 15px;text-align:right;font-weight:900;font-size:14px;color:#5A374F;font-family:monospace;">₹${fmt(b.grandTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>`;
    })
    .join("");

  const logoSrc = logoBase64 || "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Estimate ${q.quotationNo}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1e293b; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @page { size: A4; margin: 5mm; }
  </style>
</head>
<body>
<div style="max-width:800px;margin:0 auto;background:white;">

  <!-- ── HEADER ── -->
  <div style="background:#5A374F;color:white;padding:10px 20px;">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
      <div>
        ${logoSrc ? `<img src="${logoSrc}" alt="Nazara Diamonds" style="height:48px;object-fit:contain;" />` : `<span style="font-size:18px;font-weight:900;color:white;">NAZARA DIAMONDS</span>`}
      </div>
      <div style="text-align:right;">
        <h1 style="font-size:11px;font-weight:900;letter-spacing:2px;margin:0 0 2px;color:rgba(255,255,255,0.8);text-transform:uppercase;">ESTIMATE</h1>
        <p style="font-size:16px;font-weight:900;font-family:monospace;margin:0 0 4px;color:#f5f0f5;">${q.quotationNo}</p>
        <p style="font-size:9px;font-weight:600;margin:0;color:white;opacity:0.9;"><span style="opacity:0.6;">Issued Date: </span>${issueDate}</p>
        <p style="font-size:9px;font-weight:600;margin:0;color:white;opacity:0.9;"><span style="opacity:0.6;">Valid Until: </span>${validUntil}</p>
      </div>
    </div>
  </div>

  <!-- ── CLIENT INFO ── -->
  <div style="padding:10px 15px 0;">
    <table style="width:100%;border-collapse:collapse;border:2px solid #5A374F;border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background:#5A374F;color:white;">
          <th colspan="2" style="padding:6px 15px;text-align:left;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:white;">Client Information</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:5px 12px;border-bottom:1px solid #e2e8f0;width:130px;font-size:9px;font-weight:700;color:#64748b;background:#f8fafc;">CUSTOMER NAME</td>
          <td style="padding:5px 12px;border-bottom:1px solid #e2e8f0;font-size:12px;font-weight:800;color:#0f172a;">${q.customerName || ""}</td>
        </tr>
        ${q.mobile ? `<tr>
          <td style="padding:5px 12px;border-bottom:1px solid #e2e8f0;font-size:9px;font-weight:700;color:#64748b;background:#f8fafc;">PHONE NUMBER</td>
          <td style="padding:5px 12px;border-bottom:1px solid #e2e8f0;font-size:11px;color:#334155;font-weight:700;">📞 ${q.mobile}</td>
        </tr>` : ""}
        ${q.email ? `<tr>
          <td style="padding:5px 12px;border-bottom:1px solid #e2e8f0;font-size:9px;font-weight:700;color:#64748b;background:#f8fafc;">EMAIL ADDRESS</td>
          <td style="padding:5px 12px;border-bottom:1px solid #e2e8f0;font-size:11px;color:#334155;font-weight:700;">✉ ${q.email}</td>
        </tr>` : ""}
        ${q.address ? `<tr>
          <td style="padding:5px 12px;font-size:9px;font-weight:700;color:#64748b;background:#f8fafc;">ADDRESS</td>
          <td style="padding:5px 12px;font-size:11px;color:#334155;font-weight:500;">📍 ${q.address}</td>
        </tr>` : ""}
      </tbody>
    </table>
  </div>

  <!-- ── ITEMS ── -->
  <div style="padding:8px 15px;">
    ${itemsHtml}

    <!-- ── FINAL SUMMARY ── -->
    <div style="margin-top:10px;border-top:2px solid #94a3b8;padding-top:10px;">
      <div style="display:flex;justify-content:flex-end;margin-bottom:4px;">
        <div style="width:230px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
            <span style="font-size:10px;color:#64748b;font-weight:600;">Total Value</span>
            <span style="font-size:11px;font-weight:700;">₹${fmt(q.subtotal)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
            <span style="font-size:10px;color:#64748b;font-weight:600;">Tax Amount (GST)</span>
            <span style="font-size:11px;font-weight:700;">+₹${fmt(q.gstTotal)}</span>
          </div>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 15px;background:#5A374F;border-radius:10px;color:white;">
        <span style="font-size:14px;font-weight:900;letter-spacing:1px;">GRAND TOTAL</span>
        <span style="font-size:20px;font-weight:900;color:#efebe0;font-family:monospace;">₹${fmt(q.grandTotal)}</span>
      </div>
    </div>
  </div>

  <!-- ── NOTES ── -->
  ${q.notes ? `<div style="padding:0 15px 6px;">
    <p style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">Notes</p>
    <p style="font-size:12px;color:#374151;background:#f9fafb;border-radius:6px;padding:8px 12px;border:1px solid #94a3b8;">${q.notes}</p>
  </div>` : ""}

  <!-- ── IMPORTANT NOTES ── -->
  <div style="padding:4px 15px 10px;">
    <p style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">Important Notes</p>
    <ol style="font-size:10px;color:#6b7280;line-height:1.5;padding-left:16px;margin:0;">
      <li>Gold / metal rates are subject to market fluctuation and may change without notice.</li>
      <li>Diamond and stone rates are indicative. Final rate on actual measurement at delivery.</li>
      <li>IGI / GIA certification charges, if required, are not included in this estimate.</li>
      <li>GST @ 3% has been included as applicable on jewellery.</li>
      <li>This estimate is valid until <strong>${validUntil}</strong>.</li>
      <li>50% advance payment required to confirm order.</li>
    </ol>
  </div>

  <!-- ── FOOTER ── -->
  <div style="padding:6px 20px;border-top:1px solid #e2e8f0;background:#f8fafc;display:flex;justify-content:space-between;align-items:center;font-size:9px;color:#64748b;">
    <p>Generated via <strong>Nazara ERP</strong></p>
    <p style="font-weight:700;">Thank you for choosing NAZARA DIAMONDS 💎</p>
  </div>

</div>
</body>
</html>`;
};
