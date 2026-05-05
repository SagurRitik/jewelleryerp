


import axios from "./axiosInstance";

export const getStoneRates = () =>
  axios.get("/admin/stone-rates");

export const createStoneRate = (data) =>
  axios.post("/admin/stone-rates", data);

export const updateStoneRate = (id, data) =>
  axios.put(`/admin/stone-rates/${id}`, data);

export const toggleStoneRate = (id, active) =>
  axios.patch(`/admin/stone-rates/${id}`, { active });

export const deleteStoneRate = (id) =>
  axios.delete(`/admin/stone-rates/${id}`);