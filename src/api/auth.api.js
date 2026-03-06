import axios from "axios";

const API = "https://kotabites.onrender.com";

export const loginAdmin = (data) =>
  axios.post(`${API}/auth/login`, data);
