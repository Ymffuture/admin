import { api } from "./auth.api";

// GET /delivery/admin/pending  — all PENDING applications
export const getPendingDrivers = () => api.get("/delivery/admin/pending");

// GET /delivery/admin/all-drivers?status=pending|approved|rejected
export const getAllDrivers = (status = null) =>
  api.get("/delivery/admin/all-drivers", { params: status ? { status } : {} });

// POST /delivery/admin/approve  — approve or reject a driver
// body: { driver_id, approved: bool, reason?: str }
export const approveDriver = (driverId, approved, reason = null) =>
  api.post("/delivery/admin/approve", { driver_id: driverId, approved, reason });

// POST /delivery/admin/wallet/adjust
// body: { driver_id, amount, type: "bonus"|"penalty"|"adjustment", description }
export const adjustDriverWallet = (driverId, amount, type, description) =>
  api.post("/delivery/admin/wallet/adjust", {
    driver_id: driverId,
    amount,
    type,
    description,
  });
