import { useState, useEffect } from "react";
import { getPendingDrivers, getAllDrivers, approveDriver } from "../api/drivers.api";
import { parseApiError } from "../utils/apiError";
import {
  Bike, CheckCircle2, XCircle, Clock, User, Phone, Car,
  MapPin, FileText, RefreshCw, AlertCircle, Filter, Eye,
  DollarSign, Star, Loader2,
} from "lucide-react";

const STATUS_CFG = {
  pending:   { label: "Pending",   cls: "bg-amber-500/15 text-amber-400 border-amber-500/20",    Icon: Clock        },
  approved:  { label: "Approved",  cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", Icon: CheckCircle2 },
  rejected:  { label: "Rejected",  cls: "bg-rose-500/15  text-rose-400  border-rose-500/20",     Icon: XCircle      },
  suspended: { label: "Suspended", cls: "bg-slate-500/15 text-slate-400 border-slate-500/20",    Icon: AlertCircle  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
  const Icon = cfg.Icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border ${cfg.cls}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function DriverCard({ driver, onApprove, onReject, actionId }) {
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const busy = actionId === driver.id;

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          {driver.profile_photo_url ? (
            <img src={driver.profile_photo_url} alt={driver.full_name} className="w-12 h-12 rounded-full object-cover border border-white/10 flex-shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-slate-400" />
            </div>
          )}
          <div>
            <p className="font-bold text-white">{driver.full_name}</p>
            <p className="text-xs text-slate-500">{driver.email}</p>
          </div>
        </div>
        <StatusBadge status={driver.status} />
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
        <div className="flex items-center gap-2 text-slate-400">
          <Phone className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
          {driver.phone}
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Car className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
          <span className="capitalize">{driver.vehicle_type}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 col-span-2">
          <MapPin className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
          {driver.suburb}, {driver.street_address}
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <FileText className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
          ID: {driver.id_number}
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <Clock className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
          {new Date(driver.created_at).toLocaleDateString("en-ZA", { day:"numeric", month:"short", year:"numeric" })}
        </div>
      </div>

      {/* Documents */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { label: "ID Doc",    url: driver.id_document_url },
          { label: "License",  url: driver.license_document_url },
          { label: "Vehicle",  url: driver.vehicle_document_url },
        ].map(({ label, url }) => url && (
          <a key={label} href={url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-400 hover:text-white hover:border-white/20 transition">
            <Eye className="w-3 h-3" /> {label}
          </a>
        ))}
      </div>

      {/* Actions (only for pending) */}
      {driver.status === "pending" && (
        <>
          {!showReject ? (
            <div className="flex gap-2">
              <button
                onClick={() => onApprove(driver.id)}
                disabled={busy}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition disabled:opacity-50"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Approve
              </button>
              <button
                onClick={() => setShowReject(true)}
                disabled={busy}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-sm font-bold border border-rose-500/20 transition disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                autoFocus
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-rose-500/50 focus:outline-none"
                placeholder="Reason for rejection (required)"
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { onReject(driver.id, rejectReason); setShowReject(false); }}
                  disabled={!rejectReason.trim() || busy}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold transition disabled:opacity-40"
                >
                  {busy ? "Rejecting…" : "Confirm Reject"}
                </button>
                <button onClick={() => setShowReject(false)} className="px-4 py-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white text-sm transition">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [filter, setFilter]   = useState("pending");
  const [actionId, setActionId] = useState(null);
  const [toast, setToast]     = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = filter === "pending"
        ? await getPendingDrivers()
        : await getAllDrivers(filter === "all" ? null : filter);
      setDrivers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || "Failed to load drivers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]); // eslint-disable-line

  const handleApprove = async (id) => {
    setActionId(id);
    try {
      await approveDriver(id, true);
      showToast("Driver approved! They can now log in and go online.");
      load();
    } catch (err) {
      showToast(parseApiError(err), "error");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id, reason) => {
    if (!reason.trim()) return;
    setActionId(id);
    try {
      await approveDriver(id, false, reason);
      showToast("Driver application rejected.");
      load();
    } catch (err) {
      showToast(parseApiError(err), "error");
    } finally {
      setActionId(null);
    }
  };

  const FILTERS = [
    { value: "pending",  label: "Pending"  },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "all",      label: "All"      },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-semibold animate-in fade-in slide-in-from-right-4 ${toast.type === "error" ? "bg-rose-600" : "bg-emerald-600"}`}>
          {toast.type === "error" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Driver Management</h1>
          <p className="text-slate-500 text-sm mt-1">Review and approve delivery driver applications</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm text-slate-300 transition disabled:opacity-50 self-start">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-slate-500" />
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
              filter === f.value
                ? "bg-indigo-600 text-white"
                : "bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-72 bg-white/[0.03] border border-white/10 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : drivers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-white/[0.02] border border-white/8">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Bike className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No drivers found</h3>
          <p className="text-slate-500 text-sm">
            {filter === "pending" ? "No pending applications right now." : `No ${filter} drivers.`}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500">{drivers.length} driver{drivers.length !== 1 ? "s" : ""}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {drivers.map(d => (
              <DriverCard
                key={d.id}
                driver={d}
                onApprove={handleApprove}
                onReject={handleReject}
                actionId={actionId}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
