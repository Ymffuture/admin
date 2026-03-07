// src/api/menuApi.js

import axios from "axios";

const API = "https://kotabites.onrender.com";

// Optional: Add token if you implement auth later
// const token = localStorage.getItem("token");
// axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

export const getMenu = () => axios.get(`${API}/menu`);

// ✅ Fixed: Uses FormData for image upload
export const createMenu = async (menuData) => {
  const formData = new FormData();
  formData.append("name", menuData.name);
  formData.append("price", menuData.price);
  formData.append("category", menuData.category);
  if (menuData.description) formData.append("description", menuData.description);
  if (menuData.file) formData.append("file", menuData.file);

  return axios.post(`${API}/menu`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// ✅ Added: Delete function (you need to add this route in backend too)
export const deleteMenu = (id) =>
  axios.delete(`${API}/menu/${id}`);

// Bonus: Get single item (useful later)
export const getMenuItem = (id) => axios.get(`${API}/menu/${id}`);
