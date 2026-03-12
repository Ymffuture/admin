// BUG FIX: was using raw axios (no auth headers) — now uses shared api instance
import { api } from "./auth.api";

export const getMenu = () => api.get("/menu");

export const getMenuItem = (id) => api.get(`/menu/${id}`);

// BUG FIX: old code passed pre-built FormData into this function which then
// tried to re-wrap it. Now accepts a plain object and builds FormData internally.
// BUG FIX: field was "image" — backend expects "file"
// BUG FIX: missing "category" field which backend requires
export const createMenu = ({ name, price, category, description, file }) => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("price", String(price));
  formData.append("category", category);
  if (description) formData.append("description", description);
  if (file) formData.append("file", file); // backend param name is "file"

  return api.post("/menu", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteMenu = (id) => api.delete(`/menu/${id}`);
