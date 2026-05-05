


import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api",   // 🔥 VERY IMPORTANT
  withCredentials: true,
});


/* ================= RESPONSE INTERCEPTOR ================= */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized – please login again");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;