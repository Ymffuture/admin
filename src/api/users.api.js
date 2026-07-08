// src/api/users.api.js
import { api } from "./auth.api";

// ── List & detail ─────────────────────────────────────────────────────────
export const getUsers = (status = null, search = null) =>
  api.get("/admin/users", { params: { status: status || undefined, search: search || undefined } });

export const getUserDetail = (userId) =>
  api.get(`/admin/users/${userId}`);

// ── Suspend ───────────────────────────────────────────────────────────────
// days: number (1-365) or null for indefinite
export const suspendUser = (userId, reason, days = null) =>
  api.post(`/admin/users/${userId}/suspend`, { reason, days });

export const unsuspendUser = (userId) =>
  api.post(`/admin/users/${userId}/unsuspend`);

// ── Ban ───────────────────────────────────────────────────────────────────
export const banUser = (userId, reason) =>
  api.post(`/admin/users/${userId}/ban`, { reason });

export const unbanUser = (userId) =>
  api.post(`/admin/users/${userId}/unban`);

// ── Warn ──────────────────────────────────────────────────────────────────
export const warnUser = (userId, reason, message = null) =>
  api.post(`/admin/users/${userId}/warn`, { reason, message });

export const deleteWarning = (userId, warningIndex) =>
  api.delete(`/admin/users/${userId}/warnings/${warningIndex}`);

// ── Delete ────────────────────────────────────────────────────────────────
export const deleteUser = (userId) =>
  api.delete(`/admin/users/${userId}`);

// ── Subscription ──────────────────────────────────────────────────────────
// Admin-forced cancellation of a user's active ProBite subscription — bypasses
// the normal end-of-billing-cycle flow and revokes access immediately.
export const forceCancelSubscription = (userId, reason) =>
  api.post(`/admin/users/${userId}/subscription/force-cancel`, { reason });
