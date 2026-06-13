// src/pages/AdminAppeals.jsx
import { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout";
import {
  Scale, Clock, CheckCircle2, XCircle, ChevronDown,
  ChevronUp, Search, RefreshCw, AlertTriangle, User,
  ShieldOff, Lock, Filter,
} from "lucide-react";
import { api } from "../api/auth.api"; // ✅ FIX: admin panel uses api, not axiosClient

// ── Constants ─────────────────────────────────────────────────────────────────

const TABS = [
  { key: "all",      label: "All"      },
  { key: "pending",  label: "Pending"  },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const CATEGORY_LABELS = {
  wrong_decision:   "Wrong Decision",
  misunderstanding: "Misunderstanding",
  reformed:         "I've Changed",
  technical_error:  "Technical Error",
  other:            "Other",
};

const CATEGORY_EMOJIS = {
  wrong_decision:   "⚖️",
  misunderstanding: "💬",
  reformed:         "🔄",
  technical_error:  "⚙️",
  other:            "📝",
};

const STATUS_STYLES = {
  pending:  { bg: "bg-amber-500/10",  border: "border-amber-500/25",  text: "text-amber-400",  dot: "bg-amber-400"  },
  approved: { bg: "bg-emerald-500/10",border: "border-emerald-500/25",text: "text-emerald-400",dot: "bg-emerald-400"},
  rejected: { bg: "bg-red-500/10",    border: "border-red-500/25",    text: "text-red-400",    dot: "bg-red-400"    },
};

const ACCOUNT_STYLES = {
  banned:     { text: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    Icon: ShieldOff },
  suspended:  { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", Icon: Lock       },
  restricted: { text: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  Icon: AlertTriangle },
  warned:     { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", Icon: AlertTriangle },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-ZA", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "—";

const timeAgo = (iso) => {
  if (!iso) return "";
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, color, icon: Icon }) {
  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-700 border ${s.bg} ${s.border} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${status === "pending" ? "animate-pulse" : ""}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function AccountStatusBadge({ status }) {
  const s = ACCOUNT_STYLES[status] ?? ACCOUNT_STYLES.warned;
  const { Icon } = s;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.bg} ${s.border} ${s.text}`}>
      <Icon className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ── Review Modal ──────────────────────────────────────────────────────────────

function ReviewModal({ appeal, onClose, onDone }) {
  const [decision, setDecision]   = useState("");
  const [note,     setNote]       = useState("");
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState("");

  const submit = async () => {
    if (!decision) { setError("Please select Approve or Reject."); return; }
    setLoading(true);
    setError("");
    try {
      await api.post(`/appeals/${appeal.id}/review`, {
        decision,
        admin_note: note.trim() || null,
      });
      onDone(appeal.id, decision);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.detail ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0f0f1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-white/8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
              <Scale className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Review Appeal</p>
              <p className="text-xs text-slate-500">{appeal.user_email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/8 transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">

          {/* Reason preview */}
          <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">{CATEGORY_EMOJIS[appeal.category] ?? "📝"}</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {CATEGORY_LABELS[appeal.category] ?? appeal.category}
              </span>
              <AccountStatusBadge status={appeal.account_status_at_time} />
            </div>
            <p className="text-sm text-slate-300 leading-relaxed line-clamp-4">
              {appeal.reason}
            </p>
            <p className="text-xs text-slate-600 mt-3">{fmt(appeal.created_at)}</p>
          </div>

          {/* Decision buttons */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Decision</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDecision("approved")}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold transition-all
                  ${decision === "approved"
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                    : "bg-white/[0.03] border-white/10 text-slate-400 hover:border-emerald-500/30 hover:text-emerald-400"
                  }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={() => setDecision("rejected")}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold transition-all
                  ${decision === "rejected"
                    ? "bg-red-500/15 border-red-500/40 text-red-400"
                    : "bg-white/[0.03] border-white/10 text-slate-400 hover:border-red-500/30 hover:text-red-400"
                  }`}
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </div>
          </div>

          {/* Admin note */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Note to user <span className="normal-case font-normal text-slate-600">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Explain your decision…"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 placeholder-slate-600 outline-none focus:border-indigo-500/40 resize-none transition"
            />
          </div>

          {/* Note: what approval does */}
          {decision === "approved" && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20 text-xs text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>
                Approving will automatically lift the{" "}
                <strong>{appeal.account_status_at_time}</strong> status and restore the user's access.
              </span>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/8 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/8 transition"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!decision || loading}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2
              ${decision === "approved" ? "bg-emerald-600 hover:bg-emerald-500 text-white" :
                decision === "rejected" ? "bg-red-600 hover:bg-red-500 text-white" :
                "bg-white/8 text-slate-500 cursor-not-allowed"}
              disabled:opacity-50`}
          >
            {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {decision === "approved" ? "Approve Appeal" : decision === "rejected" ? "Reject Appeal" : "Select Decision"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Appeal Row ────────────────────────────────────────────────────────────────

function AppealRow({ appeal, onReview }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-2xl overflow-hidden hover:border-white/12 transition-all">

      {/* Main row */}
      <div className="flex items-center gap-4 px-5 py-4">

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {appeal.user_name?.[0]?.toUpperCase() ?? <User className="w-4 h-4" />}
        </div>

        {/* User + category */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-white truncate">{appeal.user_name}</span>
            <span className="text-xs text-slate-500 truncate hidden sm:block">{appeal.user_email}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-slate-500">
              {CATEGORY_EMOJIS[appeal.category]} {CATEGORY_LABELS[appeal.category] ?? appeal.category}
            </span>
            <span className="text-slate-700 hidden sm:block">·</span>
            <span className="text-xs text-slate-600">{timeAgo(appeal.created_at)}</span>
          </div>
        </div>

        {/* Badges + actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <AccountStatusBadge status={appeal.account_status_at_time} />
          <StatusBadge status={appeal.status} />

          {appeal.status === "pending" && (
            <button
              onClick={() => onReview(appeal)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold hover:bg-indigo-600/30 transition"
            >
              Review
            </button>
          )}

          <button
            onClick={() => setExpanded(e => !e)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/8 transition"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 pb-5 pt-0 border-t border-white/8 space-y-4">

          {/* Reason */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Appeal Statement</p>
            <p className="text-sm text-slate-300 leading-relaxed bg-white/[0.02] border border-white/8 rounded-xl p-4">
              {appeal.reason}
            </p>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Submitted",     value: fmt(appeal.created_at)  },
              { label: "Status at time",value: appeal.account_status_at_time },
              { label: "Appeal status", value: appeal.status           },
              ...(appeal.reviewed_at ? [
                { label: "Reviewed",    value: fmt(appeal.reviewed_at) },
                { label: "Reviewed by", value: appeal.reviewed_by ?? "—" },
              ] : []),
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/[0.02] border border-white/8 rounded-xl p-3">
                <p className="text-xs text-slate-600 font-semibold mb-1">{label}</p>
                <p className="text-xs text-slate-300 font-bold truncate">{value}</p>
              </div>
            ))}
          </div>

          {/* Admin note if reviewed */}
          {appeal.admin_note && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/8">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex-shrink-0 mt-0.5">
                Admin Note:
              </span>
              <p className="text-xs text-slate-400">{appeal.admin_note}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminAppeals() {
  const [appeals,  setAppeals]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState("all");
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState(null); // appeal being reviewed

  const load = useCallback(async (statusFilter) => {
    setLoading(true);
    try {
      const params = statusFilter && statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const { data } = await api.get(`/appeals/${params}`);
      setAppeals(data);
    } catch (err) {
      console.error("Failed to load appeals", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(tab); }, [tab, load]);

  // Update row in-place after review
  const handleDone = (id, decision) => {
    setAppeals(prev =>
      prev.map(a => a.id === id ? { ...a, status: decision } : a)
    );
  };

  const filtered = appeals.filter(a =>
    !search ||
    a.user_email?.toLowerCase().includes(search.toLowerCase()) ||
    a.user_name?.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    all:      appeals.length,
    pending:  appeals.filter(a => a.status === "pending").length,
    approved: appeals.filter(a => a.status === "approved").length,
    rejected: appeals.filter(a => a.status === "rejected").length,
  };

  return (
    <Layout>
      <div className="p-5 lg:p-8 space-y-6 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-400" />
              Appeals
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">Review user account restriction appeals</p>
          </div>
          <button
            onClick={() => load(tab)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white text-sm font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total"    value={counts.all}      color="bg-indigo-500/15 text-indigo-400"  icon={Scale}         />
          <StatCard label="Pending"  value={counts.pending}  color="bg-amber-500/15 text-amber-400"    icon={Clock}         />
          <StatCard label="Approved" value={counts.approved} color="bg-emerald-500/15 text-emerald-400"icon={CheckCircle2}  />
          <StatCard label="Rejected" value={counts.rejected} color="bg-red-500/15 text-red-400"        icon={XCircle}       />
        </div>

        {/* Filter tabs + search */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-white/[0.03] border border-white/8 rounded-xl p-1">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5
                  ${tab === t.key
                    ? "bg-indigo-600/25 text-indigo-300 border border-indigo-500/30"
                    : "text-slate-500 hover:text-slate-300"
                  }`}
              >
                {t.label}
                {counts[t.key] > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-900
                    ${tab === t.key ? "bg-indigo-500/30 text-indigo-300" : "bg-white/8 text-slate-500"}`}>
                    {counts[t.key]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/[0.03] border border-white/8 rounded-xl text-sm text-slate-300 placeholder-slate-600 outline-none focus:border-indigo-500/40 transition"
            />
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-white/[0.02] border border-white/8 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center">
              <Scale className="w-6 h-6 text-slate-600" />
            </div>
            <p className="text-slate-500 font-semibold">No appeals found</p>
            <p className="text-xs text-slate-600">
              {search ? "Try a different search term" : `No ${tab === "all" ? "" : tab} appeals yet`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(appeal => (
              <AppealRow
                key={appeal.id}
                appeal={appeal}
                onReview={setSelected}
              />
            ))}
          </div>
        )}
      </div>

      {/* Review modal */}
      {selected && (
        <ReviewModal
          appeal={selected}
          onClose={() => setSelected(null)}
          onDone={handleDone}
        />
      )}
    </Layout>
  );
}
