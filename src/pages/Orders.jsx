import { useEffect, useState, useCallback } from "react";
import { getOrders, updateOrderStatus, parseApiError } from "../api/orders.api";
import {
  ShoppingBag, RefreshCw, TrendingUp, DollarSign,
  Clock, AlertCircle, CheckCircle, ChevronDown,
} from "lucide-react";

// ── Toast ─────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);
  const bg = {
    success: "bg-emerald-600", error: "bg-rose-600",
    warning: "bg-amber-600",  info:  "bg-blue-600",
  }[type] || "bg-slate-700";
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-semibold ${bg}`}>
      {type === "error"
        ? <AlertCircle className="w-4 h-4 flex-shrink-0" />
        : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="max-w-xs">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 text-lg">×</button>
    </div>
  );
};

// ── Status options & colours ──────────────────────────────────────────────
const STATUSES = ["pending","paid","preparing","ready","delivered","cancelled"];

const STATUS_COLOR = {
  pending:   "bg-amber-500/15 text-amber-400 border-amber-500/30",
  paid:      "bg-blue-500/15 text-blue-400 border-blue-500/30",
  preparing: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  ready:     "bg-purple-500/15 text-purple-400 border-purple-500/30",
  delivered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
};

// ── Inline status selector ────────────────────────────────────────────────
function StatusSelect({ orderId, current, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const select = async (s) => {
    if (s === current) { setOpen(false); return; }
    setBusy(true);
    await onChange(orderId, s);
    setBusy(false);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => !busy && !disabled && setOpen(v => !v)}
        disabled={busy || disabled}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold capitalize transition
          ${STATUS_COLOR[current] || "bg-slate-700/30 text-slate-400 border-slate-600/30"}
          ${busy ? "opacity-50 cursor-not-allowed" : "hover:opacity-80 cursor-pointer"}`}
      >
        {busy ? "..." : current}
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 z-20 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[140px]">
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => select(s)}
                className={`w-full text-left px-4 py-2.5 text-xs font-bold capitalize transition
                  ${s === current ? "bg-white/10" : "hover:bg-white/5"}
                  ${STATUS_COLOR[s]?.split(" ")[1] || "text-slate-300"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, accent }) => (
  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 hover:border-white/20 transition">
    <div className={`inline-flex p-2.5 rounded-xl mb-3 ${accent}`}>
      <Icon className="w-4 h-4 text-white" />
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-xs text-slate-500 mt-0.5">{label}</p>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────
export default function Orders() {
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [toast, setToast]               = useState(null);
  const [lastUpdated, setLastUpdated]   = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch]             = useState("");

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getOrders();
      const list = Array.isArray(res.data) ? res.data : [];
      // Sort newest first
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setOrders(list);
      setLastUpdated(new Date());
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(() => { if (!loading) load(); }, 30000);
    return () => clearInterval(id);
  }, [loading, load]);

  const changeStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      showToast(`Order status updated to "${status}"`, "success");
    } catch (err) {
      showToast(parseApiError(err), "error");
    }
  };

  // Derived stats
  const today = new Date().toDateString();
  const todayOrders  = orders.filter(o => o.created_at && new Date(o.created_at).toDateString() === today);
  const revenue      = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
  const todayRevenue = todayOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
  const pending      = orders.filter(o => o.status === "pending").length;
  const ready        = orders.filter(o => o.status === "ready").length;

  // Filtered view
  const visible = orders.filter(o => {
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    const sl = search.toLowerCase().trim();
    const matchSearch = !sl
      || o.id?.toLowerCase().includes(sl)
      || o.delivery_address?.toLowerCase().includes(sl)
      || o.phone?.toLowerCase().includes(sl)
      || o.items?.some(i => i.name?.toLowerCase().includes(sl));
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {toast && (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/30">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              Orders
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Live order management
              {lastUpdated && ` · updated ${lastUpdated.toLocaleTimeString()}`}
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition disabled:opacity-50 self-start"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
            <button onClick={load} className="ml-auto text-rose-300 hover:text-white underline text-xs">Retry</button>
          </div>
        )}

        {/* Stats */}
        {!loading && !error && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total orders"   value={orders.length}         icon={ShoppingBag}  accent="bg-gradient-to-br from-blue-500 to-indigo-600" />
            <StatCard label="Today"          value={todayOrders.length}    icon={Clock}        accent="bg-gradient-to-br from-amber-500 to-orange-600" />
            <StatCard label="Revenue (all)"  value={`R${revenue.toFixed(0)}`}    icon={DollarSign}   accent="bg-gradient-to-br from-emerald-500 to-teal-600" />
            <StatCard
              label="Pending / Ready"
              value={`${pending} / ${ready}`}
              icon={TrendingUp}
              accent={ready > 0 ? "bg-purple-600" : "bg-gradient-to-br from-violet-500 to-purple-600"}
            />
          </div>
        )}

        {/* Today's revenue note */}
        {!loading && !error && todayOrders.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-slate-400 bg-white/[0.02] border border-white/8 rounded-xl px-4 py-3">
            <span className="text-emerald-400 font-bold">Today:</span>
            <span>{todayOrders.length} orders · R{todayRevenue.toFixed(2)} revenue</span>
            {ready > 0 && (
              <span className="ml-auto text-purple-400 font-bold animate-pulse">
                ● {ready} order{ready !== 1 ? "s" : ""} ready for driver pickup
              </span>
            )}
          </div>
        )}

        {/* Filters */}
        {!loading && !error && orders.length > 0 && (
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder="Search by ID, address, phone, item…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-white/25"
            />
            <div className="flex gap-2 flex-wrap">
              {["all", ...STATUSES].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition
                    ${filterStatus === s
                      ? "bg-indigo-600 text-white"
                      : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
                >
                  {s === "all" ? `All (${orders.length})` : `${s} (${orders.filter(o => o.status === s).length})`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-white/[0.02] border border-white/8">
              <ShoppingBag className="w-10 h-10 text-slate-500 mb-3" />
              <p className="text-white font-bold">
                {orders.length === 0 ? "No orders yet" : "No orders match your filter"}
              </p>
              <p className="text-slate-500 text-sm mt-1">
                {orders.length === 0
                  ? "Orders will appear here when customers place them."
                  : "Try clearing your filters."}
              </p>
            </div>
          ) : (
            <div className="bg-white/[0.02] rounded-2xl border border-white/8 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  Live orders
                  <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-white/10 text-slate-400">
                    {visible.length}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Change status with the dropdown — setting to <strong className="text-purple-400">ready</strong> makes the order visible to drivers
                </p>
              </div>

              {/* Desktop table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-white/8">
                      <th className="text-left px-6 py-3 font-semibold">Order</th>
                      <th className="text-left px-4 py-3 font-semibold">Items</th>
                      <th className="text-left px-4 py-3 font-semibold">Address</th>
                      <th className="text-left px-4 py-3 font-semibold">Phone</th>
                      <th className="text-right px-4 py-3 font-semibold">Total</th>
                      <th className="text-left px-4 py-3 font-semibold">Payment</th>
                      <th className="text-right px-6 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((order, idx) => {
                      const shortId = String(order.id || "").slice(-8).toUpperCase();
                      const date = order.created_at
                        ? new Date(order.created_at).toLocaleString("en-ZA", {
                            month: "short", day: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })
                        : "—";
                      return (
                        <tr
                          key={order.id || idx}
                          className="border-b border-white/5 hover:bg-white/[0.02] transition"
                        >
                          <td className="px-6 py-4">
                            <p className="font-mono font-bold text-white text-xs">#{shortId}</p>
                            <p className="text-slate-500 text-xs mt-0.5">{date}</p>
                          </td>
                          <td className="px-4 py-4 max-w-[200px]">
                            <p className="text-slate-300 text-xs leading-relaxed">
                              {Array.isArray(order.items) && order.items.length > 0
                                ? order.items.map(i => `${i.name} ×${i.quantity}`).join(", ")
                                : "—"}
                            </p>
                          </td>
                          <td className="px-4 py-4 max-w-[180px]">
                            <p className="text-slate-300 text-xs truncate" title={order.delivery_address}>
                              {order.delivery_address || "—"}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-slate-300 text-xs">{order.phone || "—"}</p>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <p className="font-bold text-white">
                              R{(order.total_amount || 0).toFixed(2)}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold capitalize border
                              ${order.payment_method === "cash"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
                                : "bg-blue-500/10 text-blue-400 border-blue-500/25"}`}>
                              {order.payment_method === "cash" ? "Cash" : "Paystack"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <StatusSelect
                              orderId={order.id}
                              current={order.status}
                              onChange={changeStatus}
                              disabled={false}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-white/[0.03] rounded-xl" />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
