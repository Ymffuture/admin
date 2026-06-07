import { useState, useEffect, useCallback } from "react";
import {
  getUsers, getUserDetail,
  suspendUser, unsuspendUser,
  banUser, unbanUser,
  warnUser, deleteWarning, deleteUser,
} from "../api/users.api";
import parseApiError from "../utils/apiError";
import {
  Users, Search, RefreshCw, AlertCircle, CheckCircle2,
  Shield, ShieldOff, ShieldAlert, AlertTriangle, Trash2,
  ChevronDown, ChevronUp, Phone, Mail, Clock, Star,
  X, Loader2, Eye, UserX, BadgeAlert, Lock,
} from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────

const STATUS_FILTERS = [
  { value: "all",       label: "All Users" },
  { value: "active",    label: "Active"    },
  { value: "suspended", label: "Suspended" },
  { value: "banned",    label: "Banned"    },
  { value: "admins",    label: "Admins"    },
];

const NOTIF_TYPE_COLORS = {
  info:        "bg-blue-500/15 text-blue-400 border-blue-500/25",
  warning:     "bg-amber-500/15 text-amber-400 border-amber-500/25",
  maintenance: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  promo:       "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  update:      "bg-violet-500/15 text-violet-400 border-violet-500/25",
  urgent:      "bg-red-500/15 text-red-400 border-red-500/25",
};

// ── Sub-components ─────────────────────────────────────────────────────────

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 5000); return () => clearTimeout(t); }, [onClose]);
  const bg = { success: "bg-emerald-600", error: "bg-rose-600", warning: "bg-amber-600" }[type] || "bg-slate-700";
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-semibold ${bg} max-w-sm`}>
      {type === "error" ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100 text-lg">×</button>
    </div>
  );
}

function StatusBadge({ user }) {
  if (user.is_banned)    return <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-500/15 text-red-400 border border-red-500/25">Banned</span>;
  if (user.is_suspended) return <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">Suspended</span>;
  if (user.is_admin)     return <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/25">Admin</span>;
  return <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">Active</span>;
}

// ── Modal base ─────────────────────────────────────────────────────────────

function Modal({ title, icon: Icon, iconColor = "text-amber-400", onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#111118] border border-white/10 rounded-2xl shadow-2xl p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor.replace("text-", "bg-").replace("400", "500/20")}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Warn modal ─────────────────────────────────────────────────────────────

function WarnModal({ user, onClose, onSuccess, showToast }) {
  const [reason, setReason]   = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy]       = useState(false);

  const submit = async () => {
    if (!reason.trim()) return;
    setBusy(true);
    try {
      const res = await warnUser(user.id, reason.trim(), message.trim() || null);
      showToast(`Warning #${res.data.warning_count} issued to ${user.full_name}`, "success");
      onSuccess();
      onClose();
    } catch (e) { showToast(parseApiError(e), "error"); }
    finally { setBusy(false); }
  };

  return (
    <Modal title={`Warn ${user.full_name}`} icon={AlertTriangle} iconColor="text-amber-400" onClose={onClose}>
      <p className="text-sm text-slate-400 mb-4">This warning will be visible to admins and stored on the account. The user currently has <strong className="text-white">{user.warning_count}</strong> warning(s).</p>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reason *</label>
          <input
            className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
            placeholder="e.g. Abuse of cancellation policy"
            value={reason} onChange={e => setReason(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Message to user (optional)</label>
          <textarea
            rows={3}
            className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none resize-none"
            placeholder="Additional context shown in the user's account..."
            value={message} onChange={e => setMessage(e.target.value)}
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={submit} disabled={!reason.trim() || busy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold transition disabled:opacity-40">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
            Issue Warning
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white text-sm transition">Cancel</button>
        </div>
      </div>
    </Modal>
  );
}

// ── Suspend modal ──────────────────────────────────────────────────────────

function SuspendModal({ user, onClose, onSuccess, showToast }) {
  const [reason, setReason] = useState("");
  const [days, setDays]     = useState("");
  const [busy, setBusy]     = useState(false);

  const submit = async () => {
    if (!reason.trim()) return;
    setBusy(true);
    try {
      await suspendUser(user.id, reason.trim(), days ? parseInt(days) : null);
      showToast(`${user.full_name} suspended ${days ? `for ${days} days` : "indefinitely"}`, "success");
      onSuccess();
      onClose();
    } catch (e) { showToast(parseApiError(e), "error"); }
    finally { setBusy(false); }
  };

  return (
    <Modal title={`Suspend ${user.full_name}`} icon={ShieldOff} iconColor="text-orange-400" onClose={onClose}>
      <p className="text-sm text-slate-400 mb-4">The user will be unable to log in or place orders while suspended. Leave duration blank for an indefinite suspension.</p>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reason *</label>
          <input
            className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-orange-500/50 focus:outline-none"
            placeholder="e.g. Multiple policy violations"
            value={reason} onChange={e => setReason(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Duration (days) — blank = indefinite</label>
          <input
            type="number" min="1" max="365"
            className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-orange-500/50 focus:outline-none"
            placeholder="e.g. 7"
            value={days} onChange={e => setDays(e.target.value)}
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={submit} disabled={!reason.trim() || busy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold transition disabled:opacity-40">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldOff className="w-4 h-4" />}
            Suspend Account
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white text-sm transition">Cancel</button>
        </div>
      </div>
    </Modal>
  );
}

// ── Ban modal ──────────────────────────────────────────────────────────────

function BanModal({ user, onClose, onSuccess, showToast }) {
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy]     = useState(false);

  const submit = async () => {
    if (!reason.trim() || confirm !== user.email) return;
    setBusy(true);
    try {
      await banUser(user.id, reason.trim());
      showToast(`${user.full_name} has been permanently banned`, "success");
      onSuccess();
      onClose();
    } catch (e) { showToast(parseApiError(e), "error"); }
    finally { setBusy(false); }
  };

  return (
    <Modal title={`Ban ${user.full_name}`} icon={UserX} iconColor="text-red-400" onClose={onClose}>
      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        This is a <strong>permanent ban</strong>. The user will be blocked from all access immediately.
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reason *</label>
          <input
            className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-red-500/50 focus:outline-none"
            placeholder="e.g. Fraudulent activity"
            value={reason} onChange={e => setReason(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Type <span className="text-red-400 font-mono">{user.email}</span> to confirm</label>
          <input
            className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-red-500/50 focus:outline-none font-mono"
            placeholder={user.email}
            value={confirm} onChange={e => setConfirm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={submit} disabled={!reason.trim() || confirm !== user.email || busy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition disabled:opacity-40">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
            Permanently Ban
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white text-sm transition">Cancel</button>
        </div>
      </div>
    </Modal>
  );
}

// ── Delete modal ───────────────────────────────────────────────────────────

function DeleteModal({ user, onClose, onSuccess, showToast }) {
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy]       = useState(false);

  const submit = async () => {
    if (confirm !== user.email) return;
    setBusy(true);
    try {
      await deleteUser(user.id);
      showToast(`Account '${user.email}' permanently deleted`, "success");
      onSuccess();
      onClose();
    } catch (e) { showToast(parseApiError(e), "error"); }
    finally { setBusy(false); }
  };

  return (
    <Modal title="Delete Account" icon={Trash2} iconColor="text-red-500" onClose={onClose}>
      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        This is <strong>irreversible</strong>. The account and all its data will be permanently erased.
      </div>
      <p className="text-sm text-slate-400 mb-3">Type <strong className="text-white font-mono">{user.email}</strong> to confirm deletion:</p>
      <input
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-red-500/50 focus:outline-none font-mono mb-4"
        placeholder={user.email}
        value={confirm} onChange={e => setConfirm(e.target.value)}
      />
      <div className="flex gap-2">
        <button onClick={submit} disabled={confirm !== user.email || busy}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white text-sm font-bold transition disabled:opacity-40">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete Permanently
        </button>
        <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white text-sm transition">Cancel</button>
      </div>
    </Modal>
  );
}

// ── User row ───────────────────────────────────────────────────────────────

function UserRow({ user, onAction, isEven }) {
  const [expanded, setExpanded] = useState(false);
  const initials = user.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  const authBadges = [
    user.google_id  && "Google",
    user.github_id  && "GitHub",
    user.spotify_id && "Spotify",
    user.has_password && "Password",
  ].filter(Boolean);

  return (
    <>
      <tr
        className={`border-b border-white/5 cursor-pointer transition ${expanded ? "bg-white/[0.04]" : isEven ? "hover:bg-white/[0.02]" : "bg-white/[0.01] hover:bg-white/[0.03]"}`}
        onClick={() => setExpanded(v => !v)}
      >
        {/* Avatar + name */}
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-3">
            {user.picture ? (
              <img src={user.picture} alt={user.full_name} className="w-9 h-9 rounded-full object-cover border border-white/10 flex-shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {initials}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-white">{user.full_name}</p>
              <p className="text-xs text-slate-500 font-mono">{user.email}</p>
            </div>
          </div>
        </td>

        {/* Status */}
        <td className="px-4 py-3.5"><StatusBadge user={user} /></td>

        {/* Warnings */}
        <td className="px-4 py-3.5">
          {user.warning_count > 0 ? (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${user.warning_count >= 3 ? "bg-red-500/15 text-red-400 border-red-500/25" : "bg-amber-500/15 text-amber-400 border-amber-500/25"}`}>
              <AlertTriangle className="w-3 h-3" />{user.warning_count}
            </span>
          ) : <span className="text-slate-600 text-xs">None</span>}
        </td>

        {/* Phone */}
        <td className="px-4 py-3.5 text-xs text-slate-400">
          {user.phone ? (
            <a href={`tel:${user.phone}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1 hover:text-white transition">
              <Phone className="w-3 h-3" />{user.phone}
            </a>
          ) : <span className="text-slate-600">—</span>}
        </td>

        {/* Joined */}
        <td className="px-4 py-3.5 text-xs text-slate-500">
          {user.created_at ? new Date(user.created_at).toLocaleDateString("en-ZA", { day:"numeric", month:"short", year:"numeric" }) : "—"}
        </td>

        {/* Actions */}
        <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-1 justify-end flex-wrap">
            {/* Warn */}
            {!user.is_admin && (
              <button onClick={() => onAction("warn", user)}
                className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition" title="Warn">
                <BadgeAlert className="w-4 h-4" />
              </button>
            )}
            {/* Suspend / Unsuspend */}
            {!user.is_admin && !user.is_banned && (
              user.is_suspended ? (
                <button onClick={() => onAction("unsuspend", user)}
                  className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition" title="Lift Suspension">
                  <Shield className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={() => onAction("suspend", user)}
                  className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition" title="Suspend">
                  <ShieldOff className="w-4 h-4" />
                </button>
              )
            )}
            {/* Ban / Unban */}
            {!user.is_admin && (
              user.is_banned ? (
                <button onClick={() => onAction("unban", user)}
                  className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition" title="Lift Ban">
                  <ShieldAlert className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={() => onAction("ban", user)}
                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition" title="Ban">
                  <UserX className="w-4 h-4" />
                </button>
              )
            )}
            {/* Delete */}
            {!user.is_admin && (
              <button onClick={() => onAction("delete", user)}
                className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition" title="Delete Account">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            {/* Expand */}
            <button className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded details */}
      {expanded && (
        <tr className="bg-white/[0.02] border-b border-white/5">
          <td colSpan={6} className="px-5 py-4">
            <div className="grid sm:grid-cols-3 gap-4">
              {/* Auth methods */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Auth Methods</p>
                <div className="flex flex-wrap gap-1.5">
                  {authBadges.map(b => (
                    <span key={b} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-slate-300">{b}</span>
                  ))}
                </div>
              </div>

              {/* Status detail */}
              {(user.is_suspended || user.is_banned) && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">{user.is_banned ? "Ban" : "Suspension"} Details</p>
                  <p className="text-xs text-slate-300">{user.banned_reason || user.suspension_reason}</p>
                  {user.suspended_until && (
                    <p className="text-xs text-slate-500 mt-1">Until: {new Date(user.suspended_until).toLocaleDateString("en-ZA")}</p>
                  )}
                  {user.is_banned && <p className="text-xs text-slate-500 mt-1">Banned: {user.banned_at ? new Date(user.banned_at).toLocaleDateString("en-ZA") : "—"}</p>}
                </div>
              )}

              {/* Warning history */}
              {user.warnings?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Warning History ({user.warnings.length})</p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {user.warnings.map((w, i) => (
                      <div key={i} className="p-2 bg-amber-500/5 border border-amber-500/15 rounded-lg text-xs">
                        <p className="text-amber-300 font-semibold">{w.reason}</p>
                        {w.message && <p className="text-slate-400 mt-0.5">{w.message}</p>}
                        <p className="text-slate-600 mt-1">{w.issued_by_name} · {w.issued_at ? new Date(w.issued_at).toLocaleDateString("en-ZA") : "—"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function UsersPage() {
  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [toast,       setToast]       = useState(null);
  const [filter,      setFilter]      = useState("all");
  const [search,      setSearch]      = useState("");
  const [modal,       setModal]       = useState(null);  // { type, user }
  const [quickBusy,   setQuickBusy]   = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type, id: Date.now() });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getUsers(filter === "all" ? null : filter, search || null);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(parseApiError(e));
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => { load(); }, [filter]);

  const handleSearch = (e) => {
    if (e.key === "Enter") load();
  };

  const handleAction = (type, user) => {
    // Quick actions (no modal needed)
    if (type === "unsuspend") { quickUnsuspend(user); return; }
    if (type === "unban")     { quickUnban(user);     return; }
    setModal({ type, user });
  };

  const quickUnsuspend = async (user) => {
    setQuickBusy(user.id + "unsuspend");
    try {
      await unsuspendUser(user.id);
      showToast(`${user.full_name}'s suspension lifted`);
      load();
    } catch (e) { showToast(parseApiError(e), "error"); }
    finally { setQuickBusy(null); }
  };

  const quickUnban = async (user) => {
    setQuickBusy(user.id + "unban");
    try {
      await unbanUser(user.id);
      showToast(`${user.full_name}'s ban lifted`);
      load();
    } catch (e) { showToast(parseApiError(e), "error"); }
    finally { setQuickBusy(null); }
  };

  const counts = {
    all:       users.length,
    active:    users.filter(u => !u.is_suspended && !u.is_banned && !u.is_admin).length,
    suspended: users.filter(u => u.is_suspended).length,
    banned:    users.filter(u => u.is_banned).length,
    admins:    users.filter(u => u.is_admin).length,
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {toast && <Toast key={toast.id} message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Modals */}
      {modal?.type === "warn"    && <WarnModal    user={modal.user} onClose={() => setModal(null)} onSuccess={load} showToast={showToast} />}
      {modal?.type === "suspend" && <SuspendModal user={modal.user} onClose={() => setModal(null)} onSuccess={load} showToast={showToast} />}
      {modal?.type === "ban"     && <BanModal     user={modal.user} onClose={() => setModal(null)} onSuccess={load} showToast={showToast} />}
      {modal?.type === "delete"  && <DeleteModal  user={modal.user} onClose={() => setModal(null)} onSuccess={load} showToast={showToast} />}

      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/30">
                <Users className="w-5 h-5 text-white" />
              </div>
              User Management
            </h1>
            <p className="text-slate-500 text-sm mt-1">Suspend, ban, warn, or delete user accounts</p>
          </div>
          <button onClick={load} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition disabled:opacity-50 self-start">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { k:"all",       label:"Total",     color:"bg-indigo-500/20 text-indigo-400" },
            { k:"active",    label:"Active",    color:"bg-emerald-500/20 text-emerald-400" },
            { k:"suspended", label:"Suspended", color:"bg-amber-500/20 text-amber-400" },
            { k:"banned",    label:"Banned",    color:"bg-red-500/20 text-red-400" },
            { k:"admins",    label:"Admins",    color:"bg-violet-500/20 text-violet-400" },
          ].map(s => (
            <button key={s.k} onClick={() => setFilter(s.k)}
              className={`p-3 rounded-xl border text-left transition-all ${filter === s.k ? "border-white/30 bg-white/[0.06]" : "border-white/8 bg-white/[0.02] hover:bg-white/[0.04]"}`}>
              <p className={`text-2xl font-black ${s.color.split(" ")[1]}`}>{counts[s.k]}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Search & filter */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-white/25"
              placeholder="Search by name or email… (Enter to search)"
              value={search} onChange={e => setSearch(e.target.value)} onKeyDown={handleSearch}
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_FILTERS.map(f => (
              <button key={f.value} onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filter === f.value ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-white/[0.02] border border-white/8">
              <Users className="w-10 h-10 text-slate-500 mb-3" />
              <p className="text-white font-bold">No users found</p>
            </div>
          ) : (
            <div className="bg-white/[0.02] rounded-2xl border border-white/8 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-white/8 flex items-center justify-between">
                <span className="text-sm font-bold text-white">{users.length} user{users.length !== 1 ? "s" : ""}</span>
                <p className="text-xs text-slate-500 hidden md:block">Click a row to expand · Actions on the right</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-white/8 bg-white/[0.01]">
                      <th className="text-left px-5 py-3">User</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3">Warnings</th>
                      <th className="text-left px-4 py-3">Phone</th>
                      <th className="text-left px-4 py-3">Joined</th>
                      <th className="text-right px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, idx) => (
                      <UserRow key={user.id} user={user} onAction={handleAction} isEven={idx % 2 === 0} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {loading && (
          <div className="space-y-2 animate-pulse">
            {[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-white/[0.03] rounded-xl" />)}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
        .animate-fade-in { animation: fade-in 0.18s ease-out; }
      `}</style>
    </div>
  );
}
