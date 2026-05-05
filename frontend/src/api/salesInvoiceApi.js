

import axiosInstance from "../api/axios";

/* LIST */
export const getSalesInvoices = (params) =>
  axiosInstance.get("/sales-invoices", { params });

/* SINGLE */
export const getSalesInvoiceById = (id) =>
  axiosInstance.get(`/sales-invoices/${id}`);

export const deleteSalesInvoiceById = (id) =>
  axiosInstance.delete(`/sales-invoices/${id}`);

export const deleteAllSalesInvoices = (params) =>
  axiosInstance.delete("/sales-invoices", { params });

/* DAILY SALES */
export const getDailySalesClosing = (date) =>
  axiosInstance.get("/reports/daily-sales-closing", {
    params: { date },
  });
