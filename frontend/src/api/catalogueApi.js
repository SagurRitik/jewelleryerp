
import axios from "axios";

const API = axios.create({
  baseURL: "/api/catalogues",
  withCredentials: true,
});

export const getCatalogues = () => API.get("/");
export const uploadCatalogue = (formData) => API.post("/", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});
export const deleteCatalogue = (id) => API.delete(`/${id}`);

export default API;
