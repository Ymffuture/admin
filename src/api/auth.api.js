import axios from "axios";

const API = "https://kotabites.onrender.com/api";

export const loginAdmin = (data) =>
  axios.post(`${API}/auth/login`, data);
