import { api } from "./auth.api";

// GET /delivery/admin/pending
export const getPendingDrivers = () => api.get("/delivery/admin/pending");

// GET /delivery/admin/all-drivers?status=pending|approved|rejected
export const getAllDrivers = (status = null) =>
  api.get("/delivery/admin/all-drivers", { params: status ? { status } : {} });

// POST /delivery/admin/approve
export const approveDriver = (driverId, approved, reason = null) => {
  const body = { driver_id: driverId, approved };
  if (reason && reason.trim()) body.reason = reason.trim();
  return api.post("/delivery/admin/approve", body);
};

// POST /delivery/admin/wallet/adjust
export const adjustDriverWallet = (driverId, amount, type, description) =>
  api.post("/delivery/admin/wallet/adjust", {
    driver_id: driverId,
    amount,
    type,
    description,
  });

// ── Withdrawal requests ────────────────────────────────────────────────────

// GET /delivery/admin/withdrawals?status=pending|completed|all
export const getWithdrawalRequests = (status = "pending") =>
  api.get("/delivery/admin/withdrawals", { params: { status } });

// POST /delivery/admin/withdrawals/:id/approve  — mark as paid
export const approveWithdrawal = (transactionId) =>
  api.post(`/delivery/admin/withdrawals/${transactionId}/approve`);

// POST /delivery/admin/withdrawals/:id/reject   — reject + refund
export const rejectWithdrawal = (transactionId) =>
  api.post(`/delivery/admin/withdrawals/${transactionId}/reject`);
