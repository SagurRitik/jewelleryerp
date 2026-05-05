

import API from "./index";

/* ================= MANUAL INVOICE ================= */
export const createManualInvoice = (payload) => {
  return API.post("/manual-invoices", payload);
};

/* ================= CREATE INVOICE ================= */
export const confirmInvoice = (payload) => {
  return API.post("/sales-orders/confirm-invoice", payload);
};

/* ================= GET INVOICE BY ID ================= */
export const getInvoiceById = (id) => {
  return API.get(`/sales-orders/${id}`);
};

