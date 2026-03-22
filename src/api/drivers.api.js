import { api } from "./auth.api";

/**
 * Parses a FastAPI error into a readable string.
 * FastAPI can return detail as:
 *   - a plain string:  { detail: "Not found" }
 *   - a validation array: { detail: [{loc:[...], msg:"...", type:"..."}] }
 */
export const parseApiError = (err) => {
  const status = err?.response?.status;
  const detail = err?.response?.data?.detail;

  let msg;
  if (Array.isArray(detail)) {
    msg = detail.map(d => d.msg || JSON.stringify(d)).join(" · ");
  } else if (typeof detail === "string") {
    msg = detail;
  } else {
    msg = err?.message || "Unknown error";
  }

  const hint =
    status === 401 ? " (not authenticated)"
    : status === 403 ? " (not authorized — check admin role)"
    : status === 404 ? " (endpoint not found)"
    : status === 422 ? " (validation error)"
    : status ? ` (HTTP ${status})`
    : "";

  return msg + hint;
}

// GET /delivery/admin/pending
export const getPendingDrivers = () => api.get("/delivery/admin/pending");

// GET /delivery/admin/all-drivers?status=pending|approved|rejected
export const getAllDrivers = (status = null) =>
  api.get("/delivery/admin/all-drivers", { params: status ? { status } : {} });

// POST /delivery/admin/approve
// BUG FIX: never send reason:null — FastAPI Optional[str] rejects explicit null
// Only include the key when it has an actual value
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
