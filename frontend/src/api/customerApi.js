import API from "./axiosInstance";

export const getCustomers = async (params = {}) => {
  const res = await API.get("/customers", { params });
  return res.data;
};

export const getCustomerById = async (id) => {
  const res = await API.get(`/customers/${id}`);
  return res.data;
};

export const createCustomer = async (data) => {
  const res = await API.post("/customers", data);
  return res.data;
};

export const updateCustomer = async (id, data) => {
  const res = await API.put(`/customers/${id}`, data);
  return res.data;
};

export const deleteCustomer = async (id) => {
  const res = await API.delete(`/customers/${id}`);
  return res.data;
};

export const getUpcomingCelebrations = async (days = 30) => {
  const res = await API.get("/customers/celebrations", { params: { days } });
  return res.data;
};

export const sendOfferMessage = async (id, data) => {
  const res = await API.post(`/customers/${id}/send-offer`, data);
  return res.data;
};
