

import axios from "axios";

const API = axios.create({
  baseURL: "/api/products",   // ✅ works with Vite proxy
  withCredentials: true
});

export const deleteProductBySku = (sku) =>
  API.delete(`/sku/${sku}`);

export default API;