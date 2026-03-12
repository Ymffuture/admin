// BUG FIX: was using raw axios (no auth headers) — now uses shared api instance
// BUG FIX: GET /orders doesn't exist — admin route is GET /orders/all
// BUG FIX: status update was PUT /orders/:id/status — backend uses PATCH
import { api } from "./auth.api";

// Admin: fetch ALL orders (requires auth token)
export const getOrders = () => api.get("/orders/all");

export const getOrder = (id) => api.get(`/orders/${id}`);

// BUG FIX: changed PUT → PATCH to match backend route
export const updateOrderStatus = (id, status) =>
  api.patch(`/orders/${id}/status`, { status });
