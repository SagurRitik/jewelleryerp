import API from "./index";
// import API from "axios";
/* GET ACTIVE RATES */
export const getActiveRates = () =>
  API.get("/admin/rates/active");

/* CREATE / UPDATE RATES */
export const saveRates = (payload) =>
  API.post("/admin/rates", payload);

/* UPDATE SPECIFIC RATE CONFIG */
export const updateRate = (id, payload) =>
  API.put(`/admin/rates/${id}`, payload);

/* RATE HISTORY (OPTIONAL) */
export const getAllRates = () =>
  API.get("/admin/rates");
