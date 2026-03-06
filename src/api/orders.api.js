import axios from "axios";

const API = "https://kotabites.onrender.com";

export const getOrders = () =>
  axios.get(`${API}/orders`);

export const getOrder = (id) =>
  axios.get(`${API}/orders/${id}`);

export const updateOrderStatus = (id, status) =>
  axios.put(`${API}/orders/${id}/status`, { status });
