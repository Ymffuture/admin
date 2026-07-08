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

// ── AI ────────────────────────────────────────────────────────────────────

/**
 * Ask KotaBot AI for a broadcast-ready "today's pick" menu recommendation
 * (backend `/ai/admin/menu-recommendation`) — an admin-only endpoint that
 * always calls the model against store-wide popularity, independent of any
 * one user's order history. (The customer-facing `/ai/recommendations`
 * endpoint personalizes per-user and skips the AI call entirely when the
 * calling account has no delivered orders — which is every admin account —
 * so it isn't usable here.)
 */
export const getAiMenuRecommendation = () =>
  api.get("/ai/admin/menu-recommendation");

// ── User (customer-facing) ────────────────────────────────────────────────

/** Get all active notifications relevant to the current user. */
export const getMyNotifications = () =>
  api.get("/notifications/my");

export const getUnreadCount = () =>
  api.get("/notifications/my/unread-count");

export const markNotificationRead = (id) =>
  api.patch(`/notifications/${id}/read`);
