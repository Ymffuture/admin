import { useState, useEffect } from "react";
import {
  getPendingDrivers, getAllDrivers, approveDriver,
  getWithdrawalRequests, approveWithdrawal, rejectWithdrawal,
} from "../api/drivers.api";
import parseApiError from "../utils/apiError";
import {
  Bike, CheckCircle2, XCircle, Clock, User, Phone, Car,
  MapPin, FileText, RefreshCw, AlertCircle, Filter, Eye,
  DollarSign, Star, Loader2, Download, Ban, Wallet,
  ArrowDownRight, CheckCheck, CreditCard, Building2,
} from "lucide-react";

const STATUS_CFG = {
  pending:   { label: "Pending",   cls: "bg-amber-500/15 text-amber-400 border-amber-500/20",    Icon: Clock        },
  approved:  { label: "Approved",  cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", Icon: CheckCircle2 },
  rejected:  { label: "Rejected",  cls: "bg-rose-500/15  text-rose-400  border-rose-500/20",     Icon: XCircle      },
  suspended: { label: "Suspended", cls: "bg-slate-500/15 text-slate-400 border-slate-500/20",    Icon: AlertCircle  },
};

const WD_STATUS_CFG = {
  pending:   { label: "Awaiting Payment", cls: "bg-amber-500/15 text-amber-400 border-amber-500/20",    dot: "#f59e0b" },
  completed: { label: "Paid",             cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", dot: "#4ade80" },
  cancelled: { label: "Rejected",         cls: "bg-rose-500/15 text-rose-400 border-rose-500/20",       dot: "#f87171" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
  const Icon = cfg.Icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border ${cfg.cls}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  );
}

function DriverCard({ driver, onApprove, onReject, actionId }) {
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const busy = actionId === driver.id;

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
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

      <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
        <div className="flex items-center gap-2 text-slate-400"><Phone className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />{driver.phone}</div>
        <div className="flex items-center gap-2 text-slate-400"><Car className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" /><span className="capitalize">{driver.vehicle_type}</span></div>
        <div className="flex items-center gap-2 text-slate-400 col-span-2"><MapPin className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />{driver.suburb}, {driver.street_address}</div>
        <div className="flex items-center gap-2 text-slate-400"><FileText className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />ID: {driver.id_number}</div>
        <div className="flex items-center gap-2 text-slate-400 text-xs"><Clock className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />{new Date(driver.created_at).toLocaleDateString("en-ZA", { day:"numeric", month:"short", year:"numeric" })}</div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { label: "ID Doc",   url: driver.id_document_url },
          { label: "License", url: driver.license_document_url },
          { label: "Vehicle", url: driver.vehicle_document_url },
        ].map(({ label, url }) => url && (
          <a key={label} href={url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-400 hover:text-white hover:border-white/20 transition">
            <Eye className="w-3 h-3" /> {label}
          </a>
        ))}
      </div>

      {driver.status === "pending" && (
        !showReject ? (
          <div className="flex gap-2">
            <button onClick={() => onApprove(driver.id)} disabled={busy}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition disabled:opacity-50">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}Approve
            </button>
            <button onClick={() => setShowReject(true)} disabled={busy}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-sm font-bold border border-rose-500/20 transition disabled:opacity-50">
              <XCircle className="w-4 h-4" />Reject
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <input autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-rose-500/50 focus:outline-none"
              placeholder="Reason for rejection (required)"
              value={rejectReason} onChange={e => setRejectReason(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={() => { onReject(driver.id, rejectReason); setShowReject(false); }}
                disabled={!rejectReason.trim() || busy}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold transition disabled:opacity-40">
                {busy ? "Rejecting…" : "Confirm Reject"}
              </button>
              <button onClick={() => setShowReject(false)} className="px-4 py-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white text-sm transition">Cancel</button>
            </div>
          </div>
        )
      )}
    </div>
  );
}

/* ── Withdrawal Request Card ── */
function WithdrawalCard({ wd, onApprove, onReject, busy }) {
  const cfg = WD_STATUS_CFG[wd.status] || WD_STATUS_CFG.pending;
  const isPending = wd.status === "pending";

  return (
    <div className={`bg-white/[0.03] border rounded-2xl p-5 transition-all ${isPending ? "border-amber-500/25 hover:border-amber-500/40" : "border-white/10"}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-slate-400">{wd.reference}</span>
            {isPending && (
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full opacity-75" style={{ background: cfg.dot }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: cfg.dot }} />
              </span>
            )}
          </div>
          <p className="font-bold text-white text-sm">{wd.driver_name}</p>
          <p className="text-xs text-slate-500">{wd.driver_email}</p>
          {wd.driver_phone && (
            <a href={`tel:${wd.driver_phone}`} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3" />{wd.driver_phone}
            </a>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-black text-white text-xl">R{Number(wd.amount).toFixed(2)}</p>
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full border ${cfg.cls}`}>
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Banking details */}
      <div className="bg-white/[0.03] border border-white/8 rounded-xl p-3 mb-4 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Building2 className="w-3 h-3" /> Banking Details — Transfer to this account
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-500">Bank</span>
            <p className="font-bold text-white mt-0.5">{wd.bank_name || "—"}</p>
          </div>
          <div>
            <span className="text-slate-500">Account No.</span>
            <p className="font-bold text-white mt-0.5 font-mono">{wd.account_number || "—"}</p>
          </div>
          {wd.account_holder && (
            <div className="col-span-2">
              <span className="text-slate-500">Account Holder</span>
              <p className="font-bold text-white mt-0.5">{wd.account_holder}</p>
            </div>
          )}
        </div>
      </div>

      {/* Timestamps */}
      <p className="text-xs text-slate-600 mb-3">
        Requested: {new Date(wd.created_at).toLocaleString("en-ZA", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })}
        {wd.completed_at && ` · Processed: ${new Date(wd.completed_at).toLocaleString("en-ZA", { day:"numeric", month:"short" })}`}
      </p>

      {/* Actions — only for pending */}
      {isPending && (
        <div className="flex gap-2">
          <button
            onClick={() => onApprove(wd.id)}
            disabled={busy === wd.id}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition disabled:opacity-50"
          >
            {busy === wd.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
            Mark as Paid
          </button>
          <button
            onClick={() => onReject(wd.id)}
            disabled={busy === wd.id}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-sm font-bold border border-rose-500/20 transition disabled:opacity-50"
          >
            <Ban className="w-4 h-4" />
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Main ── */
export default function Drivers() {
  const [activeTab,    setActiveTab]    = useState("drivers");
  const [drivers,      setDrivers]      = useState([]);
  const [onlineDrivers,setOnline]       = useState([]);
  const [withdrawals,  setWithdrawals]  = useState([]);
  const [wdFilter,     setWdFilter]     = useState("pending");
  const [loading,      setLoading]      = useState(true);
  const [wdLoading,    setWdLoading]    = useState(false);
  const [error,        setError]        = useState(null);
  const [driverFilter, setDriverFilter] = useState("pending");
  const [actionId,     setActionId]     = useState(null);
  const [wdBusy,       setWdBusy]       = useState(null);
  const [toast,        setToast]        = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  const loadDrivers = async () => {
    setLoading(true);
    setError(null);
    try {
      const [mainRes, allRes] = await Promise.allSettled([
        driverFilter === "pending" ? getPendingDrivers() : getAllDrivers(driverFilter === "all" ? null : driverFilter),
        getAllDrivers("approved"),
      ]);
      if (mainRes.status === "fulfilled") setDrivers(Array.isArray(mainRes.value.data) ? mainRes.value.data : []);
      else setError(parseApiError(mainRes.reason));
      if (allRes.status === "fulfilled") setOnline((Array.isArray(allRes.value.data) ? allRes.value.data : []).filter(d => d.is_available));
    } finally {
      setLoading(false);
    }
  };

  const loadWithdrawals = async () => {
    setWdLoading(true);
    try {
      const res = await getWithdrawalRequests(wdFilter);
      setWithdrawals(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      showToast(parseApiError(err), "error");
    } finally {
      setWdLoading(false);
    }
  };

  useEffect(() => { loadDrivers(); }, [driverFilter]);
  useEffect(() => { if (activeTab === "withdrawals") loadWithdrawals(); }, [activeTab, wdFilter]);

  const handleApprove = async (id) => {
    setActionId(id);
    try {
      await approveDriver(id, true);
      showToast("Driver approved!");
      loadDrivers();
    } catch (err) { showToast(parseApiError(err), "error"); }
    finally { setActionId(null); }
  };

  const handleReject = async (id, reason) => {
    if (!reason?.trim()) return;
    setActionId(id);
    try {
      await approveDriver(id, false, reason);
      showToast("Driver application rejected.");
      loadDrivers();
    } catch (err) { showToast(parseApiError(err), "error"); }
    finally { setActionId(null); }
  };

  const handleWdApprove = async (txId) => {
    setWdBusy(txId);
    try {
      await approveWithdrawal(txId);
      showToast("Withdrawal marked as paid ✅");
      loadWithdrawals();
    } catch (err) { showToast(parseApiError(err), "error"); }
    finally { setWdBusy(null); }
  };

  const handleWdReject = async (txId) => {
    if (!window.confirm("Reject this withdrawal? The driver's balance will be refunded.")) return;
    setWdBusy(txId);
    try {
      await rejectWithdrawal(txId);
      showToast("Withdrawal rejected — balance refunded.");
      loadWithdrawals();
    } catch (err) { showToast(parseApiError(err), "error"); }
    finally { setWdBusy(null); }
  };

  const pendingWdCount = withdrawals.filter(w => w.status === "pending").length;

  const DRIVER_FILTERS = ["pending","approved","rejected","all"];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-semibold ${toast.type === "error" ? "bg-rose-600" : "bg-emerald-600"}`}>
          {toast.type === "error" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Driver Management</h1>
          <p className="text-slate-500 text-sm mt-1">Approve drivers & process withdrawal requests</p>
        </div>
        <button onClick={() => activeTab === "drivers" ? loadDrivers() : loadWithdrawals()}
          disabled={loading || wdLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm text-slate-300 transition disabled:opacity-50 self-start">
          <RefreshCw className={`w-4 h-4 ${(loading || wdLoading) ? "animate-spin" : ""}`} />Refresh
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-white/[0.03] border border-white/8 rounded-xl p-1 w-fit">
        {[
          { key: "drivers",     label: "Drivers",     Icon: Bike },
          { key: "withdrawals", label: "Withdrawals", Icon: Wallet,
            badge: pendingWdCount > 0 && activeTab !== "withdrawals" ? pendingWdCount : null },
        ].map(({ key, label, Icon, badge }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === key ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>
            <Icon className="w-4 h-4" />{label}
            {badge && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-amber-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══════ DRIVERS TAB ═══════ */}
      {activeTab === "drivers" && (
        <>
          {/* Online Drivers */}
          {onlineDrivers.length > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                  {onlineDrivers.length} Driver{onlineDrivers.length !== 1 ? "s" : ""} Online Now
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {onlineDrivers.map(d => (
                  <div key={d.id} className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                    {d.profile_photo_url ? (
                      <img src={d.profile_photo_url} alt={d.full_name} className="w-8 h-8 rounded-full object-cover border border-emerald-500/30" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
                        {d.full_name?.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-white text-xs font-bold leading-none">{d.full_name}</p>
                      <p className="text-emerald-400 text-[10px] mt-0.5 capitalize">{d.vehicle_type} · ⭐ {d.rating?.toFixed(1)}</p>
                    </div>
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${d.current_order_id ? "bg-amber-500/15 border-amber-500/25 text-amber-400" : "bg-emerald-500/15 border-emerald-500/25 text-emerald-400"}`}>
                      {d.current_order_id ? "On delivery" : "Waiting"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-500" />
            {DRIVER_FILTERS.map(f => (
              <button key={f} onClick={() => setDriverFilter(f)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all capitalize ${driverFilter === f ? "bg-indigo-600 text-white" : "bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10"}`}>
                {f}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => <div key={i} className="h-72 bg-white/[0.03] border border-white/10 rounded-2xl animate-pulse" />)}
            </div>
          ) : drivers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-white/[0.02] border border-white/8">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4"><Bike className="w-8 h-8 text-slate-500" /></div>
              <h3 className="text-lg font-bold text-white mb-1">No drivers found</h3>
              <p className="text-slate-500 text-sm">{driverFilter === "pending" ? "No pending applications right now." : `No ${driverFilter} drivers.`}</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500">{drivers.length} driver{drivers.length !== 1 ? "s" : ""}</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {drivers.map(d => (
                  <DriverCard key={d.id} driver={d} onApprove={handleApprove} onReject={handleReject} actionId={actionId} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ═══════ WITHDRAWALS TAB ═══════ */}
      {activeTab === "withdrawals" && (
        <>
          {/* Summary banner */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Pending Payment", value: withdrawals.filter(w=>w.status==="pending").length, color: "#f59e0b", Icon: Clock },
              { label: "Paid Out",        value: withdrawals.filter(w=>w.status==="completed").length, color: "#4ade80", Icon: CheckCheck },
              { label: "Rejected",        value: withdrawals.filter(w=>w.status==="cancelled").length, color: "#f87171", Icon: Ban },
            ].map(({ label, value, color, Icon }) => (
              <div key={label} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
                </div>
                <p className="text-2xl font-black text-white">{value}</p>
              </div>
            ))}
          </div>

          {/* Pending total */}
          {withdrawals.filter(w=>w.status==="pending").length > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-sm font-semibold">
              <DollarSign className="w-4 h-4 flex-shrink-0" />
              Total pending payout: <span className="text-white font-black">
                R{withdrawals.filter(w=>w.status==="pending").reduce((s,w)=>s+Number(w.amount),0).toFixed(2)}
              </span>
              — transfer each driver's amount to their bank account then click "Mark as Paid"
            </div>
          )}

          {/* Filter tabs */}
          <div className="flex items-center gap-2">
            {["pending","completed","all"].map(f => (
              <button key={f} onClick={() => setWdFilter(f)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all capitalize ${wdFilter === f ? "bg-indigo-600 text-white" : "bg-white/5 border border-white/10 text-slate-400 hover:text-white"}`}>
                {f === "all" ? "All History" : f === "completed" ? "Paid" : "Pending"}
              </button>
            ))}
          </div>

          {wdLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => <div key={i} className="h-56 bg-white/[0.03] border border-white/10 rounded-2xl animate-pulse" />)}
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-white/[0.02] border border-white/8">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Wallet className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">No withdrawal requests</h3>
              <p className="text-slate-500 text-sm">
                {wdFilter === "pending" ? "No pending withdrawals — all caught up!" : "No records found."}
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500">{withdrawals.length} request{withdrawals.length !== 1 ? "s" : ""}</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {withdrawals.map(w => (
                  <WithdrawalCard key={w.id} wd={w} onApprove={handleWdApprove} onReject={handleWdReject} busy={wdBusy} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
