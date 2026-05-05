


import axios from "axios";

const API = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export const fetchLiveMetalRates = async () => {
  const res = await API.get("/metal-rates/live");
  return res.data;
};

export default API;