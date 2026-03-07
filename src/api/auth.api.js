// src/api/authApi.js

import axios from "axios";

const API = "https://kotabites.onrender.com";

// Create axios instance (recommended)
const api = axios.create({
  baseURL: API,
  timeout: 10000,
});

// Optional: Auto-attach token for protected routes later
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginAdmin = (data) => 
  api.post("/auth/login", data);

// Bonus functions (recommended to add now)
export const registerUser = (data) => 
  api.post("/auth/register", data);

export const logout = () => {
  localStorage.removeItem("token");
};

// Example usage with token saving
export const loginAndSaveToken = async (data) => {
  const response = await loginAdmin(data);
  const token = response.data.access_token;
  
  localStorage.setItem("token", token);
  return response.data;
};
