// src/api/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Attach JWT + Tenant ID automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const tenantId = localStorage.getItem("tenantId");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (tenantId) {
    config.headers["X-Tenant-ID"] = tenantId;
  }

  return config;
});

export default API;
