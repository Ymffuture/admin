// src/api/notifications.api.js
import { api } from "./auth.api";

// ── Admin ─────────────────────────────────────────────────────────────────

/**
 * Create a broadcast or targeted notification.
 * @param {{title, message, type, target, target_user_id?, expires_days?}} body
 */
export const createNotification = (body) =>
  api.post("/notifications", body);

/** List all notifications (admin view — includes read counts). */
export const adminGetNotifications = (activeOnly = false) =>
  api.get("/notifications/admin/all", { params: { active_only: activeOnly } });

export const deactivateNotification = (id) =>
  api.patch(`/notifications/${id}/deactivate`);

export const deleteNotification = (id) =>
  api.delete(`/notifications/${id}`);

// ── User (customer-facing) ────────────────────────────────────────────────

/** Get all active notifications relevant to the current user. */
export const getMyNotifications = () =>
  api.get("/notifications/my");

export const getUnreadCount = () =>
  api.get("/notifications/my/unread-count");

export const markNotificationRead = (id) =>
  api.patch(`/notifications/${id}/read`);
