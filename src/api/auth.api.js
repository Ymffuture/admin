import axios from "axios";

const API = "https://kotabites.onrender.com";

// Shared instance — all requests go through here
export const api = axios.create({
  baseURL: API,
  timeout: 15000,
});

// Auto-attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// BUG FIX 1: Backend uses OAuth2PasswordRequestForm
// → must send application/x-www-form-urlencoded with field "username" (not "email")
export const loginAdmin = async ({ email, password }) => {
  const params = new URLSearchParams();
  params.append("username", email); // OAuth2 spec requires "username"
  params.append("password", password);

  const res = await api.post("/auth/login", params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  // BUG FIX 2: Save token under "token" key so interceptor picks it up
  if (res.data?.access_token) {
    localStorage.setItem("token", res.data.access_token);
  }

  return res;
};

export const registerUser = (data) => api.post("/auth/register", data);

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("adminUser");
};

export default api;
