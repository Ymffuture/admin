import axios from "axios";

const API = "https://kotabites.onrender.com/api";

export const getMenu = () =>
  axios.get(`${API}/menu`);

export const createMenu = (data) =>
  axios.post(`${API}/menu`, data);

export const deleteMenu = (id) =>
  axios.delete(`${API}/menu/${id}`);
