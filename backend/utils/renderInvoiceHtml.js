// utils/renderInvoiceHtml.js
export default function renderInvoiceHtml(invoice) {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial; font-size: 12px; }
    .header { text-align: center; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #000; padding: 6px; }
  </style>
</head>
<body>

<h2 class="header">TAX INVOICE</h2>

<p><b>Invoice No:</b> ${invoice.invoiceNo}</p>
<p><b>Date:</b> ${new Date(invoice.date || invoice.createdAt).toLocaleDateString()}</p>

<h3>Customer</h3>
<p>${invoice.customer.name}</p>
<p>${invoice.customer.mobile}</p>
<p>${invoice.customer.address}</p>

<h3>Product</h3>
<table>
<tr>
  <th>Metal</th>
  <th>Weight</th>
  <th>HSN</th>
</tr>
<tr>
  <td>${invoice.product.metalType}</td>
  <td>${invoice.product.grossWeight || "-"}</td>
  <td>${invoice.product.hsnCode}</td>
</tr>
</table>

<h3>Pricing</h3>
<table>
<tr><td>Subtotal</td><td>${invoice.pricing.subtotal}</td></tr>
<tr><td>GST</td><td>${invoice.pricing.gst}</td></tr>
<tr><td><b>Grand Total</b></td><td><b>${invoice.pricing.grandTotal}</b></td></tr>
</table>

<p><b>Payment Mode:</b> ${invoice.paymentMode}</p>

<p style="margin-top:40px;">Authorised Signatory</p>

</body>
</html>
`;
}
