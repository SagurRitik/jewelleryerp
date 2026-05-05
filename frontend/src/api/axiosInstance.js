import axios from "axios";

/* ================= AXIOS INSTANCE ================= */
const axiosInstance = axios.create({
  baseURL: "/api",   // ✅ Production Safe
  withCredentials: true,
});


/* ================= REQUEST INTERCEPTOR ================= */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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