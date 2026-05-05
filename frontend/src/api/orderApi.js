
import axiosInstance from "../api/axios";

/* ================= CREATE ================= */
export const createOrder = (formData) =>
  axiosInstance.post("/orders", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

/* ================= READ ================= */
export const getOrders = (params) =>
  axiosInstance.get("/orders", { params });

export const getOrderById = (id) =>
  axiosInstance.get(`/orders/${id}`);

/* ================= UPDATE ================= */
export const updateOrderById = (id, data) =>
  axiosInstance.patch(`/orders/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const updateOrderStatusById = (id, status) =>
  axiosInstance.patch(`/orders/${id}/status`, { status });

/* ================= CANCEL ================= */
export const cancelOrderById = (id, reason) =>
  axiosInstance.patch(`/orders/${id}/cancel`, { reason });

export const getOrderClosingSummary = (params) =>
  axiosInstance
    .get("/orders/closing", { params })
    .then((res) => res.data);

/* ================= DELETE ================= */
export const deleteOrderById = (id) =>
  axiosInstance.delete(`/orders/${id}`);