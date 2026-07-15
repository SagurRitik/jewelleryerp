


import axios from "./axiosInstance";

/* GET ALL */
export const getDiamondRates = () =>
  axios.get("/admin/diamond-rates");

/* CREATE */
export const createDiamondRate = (data) =>
  axios.post("/admin/diamond-rates", data);

/* UPDATE */
export const updateDiamondRate = (id, data) =>
  axios.put(`/admin/diamond-rates/${id}`, data);

/* ACTIVATE / DEACTIVATE */
export const toggleDiamondRate = (id, active) =>
  axios.patch(`/admin/diamond-rates/${id}`, { active });

/* DELETE */
export const deleteDiamondRate = (id) =>
  axios.delete(`/admin/diamond-rates/${id}`);

/* EXPORT */
export const exportDiamondRates = () =>
  axios.get("/admin/diamond-rates/export", { responseType: "blob" });

/* IMPORT */
export const importDiamondRates = (formData) =>
  axios.post("/admin/diamond-rates/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });