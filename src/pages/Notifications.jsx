import { useState, useEffect, useCallback, useRef } from "react";
import {
  createNotification,
  adminGetNotifications,
  deactivateNotification,
  deleteNotification,
  getAiMenuRecommendation,
} from "../api/notifications.api";
import parseApiError from "../utils/apiError";
import {
  Bell, Send, Trash2, RefreshCw, AlertCircle,
  CheckCircle2, Info, AlertTriangle, Wrench,
  Tag, Zap, Radio, Users, User as UserIcon,
  Eye, EyeOff, Clock, X, Loader2, Sparkles, Ban,
} from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────

const NOTIF_TYPES = [
  { value: "info",        label: "Info",        icon: Info,          color: "#60a5fa",  bg: "bg-blue-500/15 border-blue-500/25 text-blue-400"     },
  { value: "warning",     label: "Warning",     icon: AlertTriangle, color: "#fbbf24",  bg: "bg-amber-500/15 border-amber-500/25 text-amber-400"  },
  { value: "maintenance", label: "Maintenance", icon: Wrench,        color: "#f97316",  bg: "bg-orange-500/15 border-orange-500/25 text-orange-400"},
  { value: "promo",       label: "Promo",       icon: Tag,           color: "#34d399",  bg: "bg-emerald-500/15 border-emerald-500/25 text-emerald-400"},
  { value: "update",      label: "Update",      icon: Zap,           color: "#a78bfa",  bg: "bg-violet-500/15 border-violet-500/25 text-violet-400"},
  { value: "urgent",      label: "Urgent",      icon: Radio,         color: "#f87171",  bg: "bg-red-500/15 border-red-500/25 text-red-400"        },
];

const TYPE_MAP = Object.fromEntries(NOTIF_TYPES.map(t => [t.value, t]));

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

function TypeBadge({ type }) {
  const cfg = TYPE_MAP[type] || TYPE_MAP["info"];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.bg}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  );
}

function NotificationCard({ notif, onDeactivate, onDelete, busy }) {
  const cfg = TYPE_MAP[notif.type] || TYPE_MAP["info"];
  const Icon = cfg.icon;
  const isExpired = new Date(notif.expires_at) < new Date();

  return (
    <div className={`bg-white/[0.03] border rounded-2xl p-5 transition-all ${notif.is_active && !isExpired ? "border-white/10" : "border-white/5 opacity-60"}`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${cfg.color}18` }}>
          <Icon className="w-4 h-4" style={{ color: cfg.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="font-bold text-white text-sm truncate">{notif.title}</p>
            <TypeBadge type={notif.type} />
            {!notif.is_active && (
              <span className="px-2 py-0.5 bg-slate-500/15 border border-slate-500/25 text-slate-400 text-xs font-bold rounded-full">Deactivated</span>
            )}
            {isExpired && notif.is_active && (
              <span className="px-2 py-0.5 bg-slate-500/15 border border-slate-500/25 text-slate-400 text-xs font-bold rounded-full">Expired</span>
            )}
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-3">
            <span className="flex items-center gap-1">
              {notif.target === "all"
                ? <><Users className="w-3 h-3" /> All users</>
                : <><UserIcon className="w-3 h-3" /> Specific user</>}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {notif.read_by_count} read
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(notif.created_at).toLocaleDateString("en-ZA", { day:"numeric", month:"short", year:"numeric" })}
            </span>
          </p>
        </div>
      </div>

      {/* Body */}
      <p className="text-sm text-slate-400 leading-relaxed pl-12 mb-4 line-clamp-3">{notif.message}</p>

      {/* Footer */}
      <div className="flex items-center justify-between pl-12">
        <p className="text-xs text-slate-600">
          By <span className="text-slate-400">{notif.created_by_name}</span> ·
          Expires {new Date(notif.expires_at).toLocaleDateString("en-ZA", { day:"numeric", month:"short" })}
        </p>
        <div className="flex items-center gap-1.5">
          {notif.is_active && !isExpired && (
            <button onClick={() => onDeactivate(notif.id)} disabled={busy === notif.id}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 text-xs font-medium transition">
              {busy === notif.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <EyeOff className="w-3 h-3" />}
              Deactivate
            </button>
          )}
          <button onClick={() => onDelete(notif.id)} disabled={busy === notif.id}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-xs font-medium transition">
            {busy === notif.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────

const DEFAULT_FORM = {
  title: "", message: "", type: "info",
  target: "all", target_user_id: "", expires_days: "30",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [sending,       setSending]       = useState(false);
  const [busy,          setBusy]          = useState(null);
  const [error,         setError]         = useState("");
  const [toast,         setToast]         = useState(null);
  const [form,          setForm]          = useState(DEFAULT_FORM);
  const [activeOnly,    setActiveOnly]    = useState(false);

  // ── AI auto-recommendation — generates a KotaBot menu pick, then fires
  //    it as a broadcast notification automatically after a 2-minute delay ──
  const AI_RECOMMEND_DELAY_MS = 2 * 60 * 1000;
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPending, setAiPending] = useState(null); // { title, message, secondsLeft }
  const aiTimeoutRef  = useRef(null);
  const aiIntervalRef = useRef(null);

  const clearAiSchedule = () => {
    clearTimeout(aiTimeoutRef.current);
    clearInterval(aiIntervalRef.current);
    aiTimeoutRef.current = null;
    aiIntervalRef.current = null;
    setAiPending(null);
  };

  // Cancel any in-flight schedule if the admin navigates away mid-countdown
  useEffect(() => () => clearAiSchedule(), []);

  const scheduleAiRecommendation = async () => {
    setAiLoading(true);
    try {
      const res = await getAiMenuRecommendation();
      const title = res.data?.title || "Today's Pick For You 🍕";
      const text = res.data?.message || "Check out today's chef picks — fresh, hot, and ready to order! 🍕";
      const aiGenerated = res.data?.ai_generated !== false; // undefined → treat as AI-generated
      const secondsTotal = AI_RECOMMEND_DELAY_MS / 1000;

      setAiPending({ title, message: text, secondsLeft: secondsTotal, aiGenerated });

      if (!aiGenerated) {
        showToast("AI model unavailable right now — using a fallback pick instead", "warning");
      }

      aiIntervalRef.current = setInterval(() => {
        setAiPending((p) => (p ? { ...p, secondsLeft: Math.max(0, p.secondsLeft - 1) } : p));
      }, 1000);

      aiTimeoutRef.current = setTimeout(async () => {
        clearInterval(aiIntervalRef.current);
        aiIntervalRef.current = null;
        try {
          await createNotification({
            title, message: text, type: "promo", target: "all", expires_days: 7,
          });
          showToast("AI menu recommendation sent to all users 🤖🍕");
          load();
        } catch (e) {
          showToast(parseApiError(e), "error");
        } finally {
          setAiPending(null);
          aiTimeoutRef.current = null;
        }
      }, AI_RECOMMEND_DELAY_MS);
    } catch (e) {
      showToast(parseApiError(e), "error");
    } finally {
      setAiLoading(false);
    }
  };

  const cancelAiSchedule = () => {
    clearAiSchedule();
    showToast("AI recommendation cancelled", "warning");
  };

  const fmtCountdown = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type, id: Date.now() });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminGetNotifications(activeOnly);
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(parseApiError(e));
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => { load(); }, [activeOnly]);

  const handleSend = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      showToast("Title and message are required", "error");
      return;
    }
    if (form.target === "specific" && !form.target_user_id.trim()) {
      showToast("User ID is required for targeted notifications", "error");
      return;
    }
    setSending(true);
    try {
      await createNotification({
        title:          form.title.trim(),
        message:        form.message.trim(),
        type:           form.type,
        target:         form.target,
        target_user_id: form.target === "specific" ? form.target_user_id.trim() : undefined,
        expires_days:   parseInt(form.expires_days) || 30,
      });
      showToast("Notification sent successfully 🔔");
      setForm(DEFAULT_FORM);
      load();
    } catch (e) {
      showToast(parseApiError(e), "error");
    } finally {
      setSending(false);
    }
  };

  const handleDeactivate = async (id) => {
    setBusy(id);
    try {
      await deactivateNotification(id);
      showToast("Notification deactivated");
      load();
    } catch (e) { showToast(parseApiError(e), "error"); }
    finally { setBusy(null); }
  };

  const handleDelete = async (id) => {
    setBusy(id);
    try {
      await deleteNotification(id);
      showToast("Notification deleted");
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) { showToast(parseApiError(e), "error"); }
    finally { setBusy(null); }
  };

  const stats = {
    total:    notifications.length,
    active:   notifications.filter(n => n.is_active && new Date(n.expires_at) > new Date()).length,
    totalRead: notifications.reduce((s, n) => s + n.read_by_count, 0),
    broadcast: notifications.filter(n => n.target === "all").length,
  };

  const formType = TYPE_MAP[form.type];

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {toast && <Toast key={toast.id} message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-violet-600 rounded-lg shadow-lg shadow-violet-500/30">
                <Bell className="w-5 h-5 text-white" />
              </div>
              Notifications
            </h1>
            <p className="text-slate-500 text-sm mt-1">Broadcast messages or target individual users</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveOnly(v => !v)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition ${activeOnly ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}>
              {activeOnly ? "Active only" : "All"}
            </button>
            <button onClick={load} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Sent",  value: stats.total,    color: "text-violet-400"  },
            { label: "Active",      value: stats.active,   color: "text-emerald-400" },
            { label: "Broadcasts",  value: stats.broadcast, color: "text-blue-400"   },
            { label: "Total Reads", value: stats.totalRead, color: "text-amber-400"  },
          ].map(s => (
            <div key={s.label} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">

          {/* ── Compose panel ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* AI auto-recommendation card */}
            <div className="bg-white/[0.02] border border-violet-500/20 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">AI Menu Recommendation</h2>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                KotaBot picks a trending menu item and drafts a short blurb. It auto-sends to
                <strong className="text-slate-300"> all users</strong> after a 2-minute delay, giving you time to cancel.
              </p>

              {!aiPending ? (
                <button
                  onClick={scheduleAiRecommendation}
                  disabled={aiLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600/20 border border-violet-500/30 hover:bg-violet-600/30 text-violet-300 text-sm font-bold transition disabled:opacity-40"
                >
                  {aiLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Generating…</> : <><Sparkles className="w-4 h-4" />Generate &amp; Schedule</>}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/25">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-bold text-violet-300 flex-1">{aiPending.title}</p>
                      {aiPending.aiGenerated ? (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[9px] font-bold">
                          <Sparkles className="w-2.5 h-2.5" />AI
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[9px] font-bold">Fallback</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{aiPending.message}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-violet-300">
                      <Clock className="w-3.5 h-3.5 animate-pulse" />
                      Sending in {fmtCountdown(aiPending.secondsLeft)}
                    </div>
                    <button
                      onClick={cancelAiSchedule}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/25 text-slate-400 text-xs font-bold transition"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-violet-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Compose Notification</h2>
              </div>

              {/* Type selector */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Type</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {NOTIF_TYPES.map(t => {
                    const Icon = t.icon;
                    const active = form.type === t.value;
                    return (
                      <button key={t.value} onClick={() => setForm(f => ({ ...f, type: t.value }))}
                        className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-xs font-bold transition ${active ? `${t.bg} border-current` : "bg-white/[0.02] border-white/8 text-slate-500 hover:text-white hover:bg-white/5"}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Target</p>
                <div className="flex gap-2">
                  {[
                    { value: "all",      label: "All Users",      icon: Users },
                    { value: "specific", label: "Specific User",  icon: UserIcon },
                  ].map(t => {
                    const Icon = t.icon;
                    const active = form.target === t.value;
                    return (
                      <button key={t.value} onClick={() => setForm(f => ({ ...f, target: t.value }))}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-bold transition ${active ? "bg-violet-500/20 border-violet-500/40 text-violet-300" : "bg-white/[0.02] border-white/8 text-slate-500 hover:text-white"}`}>
                        <Icon className="w-3.5 h-3.5" />{t.label}
                      </button>
                    );
                  })}
                </div>
                {form.target === "specific" && (
                  <input
                    className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:border-violet-500/50 focus:outline-none"
                    placeholder="MongoDB User ID (24 chars)"
                    value={form.target_user_id}
                    onChange={e => setForm(f => ({ ...f, target_user_id: e.target.value }))}
                  />
                )}
              </div>

              {/* Title */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Title *</p>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-violet-500/50 focus:outline-none"
                  placeholder="e.g. Scheduled Maintenance"
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>

              {/* Message */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Message *</p>
                <textarea
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-violet-500/50 focus:outline-none resize-none"
                  placeholder="What do you want to tell users?"
                  value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                />
              </div>

              {/* Expiry */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Expires after (days)</p>
                <div className="flex gap-1.5">
                  {["7", "14", "30", "60"].map(d => (
                    <button key={d} onClick={() => setForm(f => ({ ...f, expires_days: d }))}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition ${form.expires_days === d ? "bg-violet-500/20 border-violet-500/40 text-violet-300" : "bg-white/[0.02] border-white/8 text-slate-500 hover:text-white"}`}>
                      {d}d
                    </button>
                  ))}
                  <input type="number" min="1" max="365"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white text-center focus:border-violet-500/50 focus:outline-none"
                    placeholder="Custom"
                    value={["7","14","30","60"].includes(form.expires_days) ? "" : form.expires_days}
                    onChange={e => setForm(f => ({ ...f, expires_days: e.target.value }))}
                  />
                </div>
              </div>

              {/* Preview */}
              {(form.title || form.message) && (
                <div className={`p-3 rounded-xl border ${formType.bg}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <formType.icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <p className="text-xs font-bold truncate">{form.title || "Untitled"}</p>
                  </div>
                  <p className="text-xs opacity-75 leading-relaxed line-clamp-2">{form.message}</p>
                </div>
              )}

              {/* Send button */}
              <button onClick={handleSend} disabled={sending || !form.title.trim() || !form.message.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition disabled:opacity-40 shadow-lg shadow-violet-500/20">
                {sending ? <><Loader2 className="w-4 h-4 animate-spin" />Sending…</> : <><Send className="w-4 h-4" />Send Notification</>}
              </button>
            </div>
          </div>

          {/* ── Notifications list ── */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                {notifications.length} Notification{notifications.length !== 1 ? "s" : ""}
              </h2>
            </div>

            {error && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
              </div>
            )}

            {loading ? (
              <div className="space-y-3 animate-pulse">
                {[...Array(3)].map((_, i) => <div key={i} className="h-36 bg-white/[0.03] rounded-2xl" />)}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-white/[0.02] border border-white/8 text-center">
                <Bell className="w-10 h-10 text-slate-500 mb-3" />
                <p className="text-white font-bold">No notifications yet</p>
                <p className="text-slate-500 text-sm mt-1">Compose your first notification on the left</p>
              </div>
            ) : (
              notifications.map(n => (
                <NotificationCard
                  key={n.id}
                  notif={n}
                  onDeactivate={handleDeactivate}
                  onDelete={handleDelete}
                  busy={busy}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
