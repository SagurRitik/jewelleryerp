import API from "./index.js";

// Stateless price calculation
export const calculateEstimate = (items) =>
  API.post("/quotation/calculate", { items });

// CRUD
export const createEstimate = (data) =>
  API.post("/quotation/create", data);

export const listEstimates = (params = {}) =>
  API.get("/quotation/list", { params });

export const getEstimate = (id) =>
  API.get(`/quotation/${id}`);

export const updateEstimate = (id, data) =>
  API.put(`/quotation/${id}`, data);

export const deleteEstimate = (id) =>
  API.delete(`/quotation/${id}`);

// Actions
export const markEstimateSent = (id) =>
  API.patch(`/quotation/${id}/sent`);

export const convertEstimateToOrder = (id) =>
  API.post(`/quotation/${id}/convert`);
