import { api } from "./auth.api";

export const getMenu = () => api.get("/menu");

export const getMenuItem = (id) => api.get(`/menu/${id}`);

export const createMenu = ({ name, price, category, description, file }) => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("price", String(price));
  formData.append("category", category);
  if (description) formData.append("description", description);
  if (file) formData.append("file", file);

  // FIX: Do NOT manually set Content-Type to "multipart/form-data".
  // Axios must auto-generate the header INCLUDING the boundary token:
  //   Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryXYZ
  // If you set it manually, the boundary is missing and the server
  // cannot parse any of the form fields — causing a 422 Unprocessable Entity.
  return api.post("/menu", formData);
};

export const deleteMenu = (id) => api.delete(`/menu/${id}`);
