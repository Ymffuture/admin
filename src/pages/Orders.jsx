import { useEffect, useState, useCallback } from "react";
import { getOrders, updateOrderStatus } from "../api/orders.api";
import  parseApiError  from "../utils/apiError";
import OrderTable from "../components/OrderTable";
import {
  LayoutDashboard, ShoppingBag, RefreshCw, TrendingUp,
  DollarSign, Users, Clock, AlertCircle, CheckCircle,
  Download, Printer,
} from "lucide-react";

// Toast
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);
  const bg = { success:"bg-emerald-600", error:"bg-rose-600", warning:"bg-amber-600", info:"bg-blue-600" }[type] || "bg-slate-700";
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-semibold ${bg}`}>
      {type === "error" ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="max-w-xs">{message}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100 ml-2 text-lg leading-none">×</button>
    </div>
  );
};

// Metric card
const MetricCard = ({ title, value, icon: Icon, accent }) => (
  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all">
    <div className={`inline-flex p-2.5 rounded-xl mb-3 ${accent}`}>
      <Icon className="w-4 h-4 text-white" />
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-xs text-slate-500 mt-0.5">{title}</p>
  </div>
);

// Status overview bar
const StatusBar = ({ orders }) => {
  const STATUSES = [
    { key:"pending",   color:"bg-amber-500"  },
    { key:"preparing", color:"bg-orange-500" },
    { key:"ready",     color:"bg-purple-500" },
    { key:"delivered", color:"bg-emerald-500"},
  ];
  const total = orders.length;
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Status overview</p>
      <div className="flex items-center gap-4 flex-wrap">
        {STATUSES.map(({ key, color }) => {
          const count = orders.filter(o => o.status === key).length;
          return (
            <div key={key} className="flex-1 min-w-[100px]">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="capitalize text-slate-400 font-medium">{key}</span>
                <span className="text-slate-300 font-mono">{count}</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color} rounded-full transition-all duration-700`}
                  style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function Orders() {
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [toast, setToast]         = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getOrders();
      setOrders(Array.isArray(res.data) ? res.data : []);
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
    const id = setInterval(() => { if (!loading && !error) load(); }, 30000);
    return () => clearInterval(id);
  }, [loading, error, load]);

  const changeStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      showToast(`Order updated to ${status}`, "success");
    } catch (err) {
      // BUG FIX: was using err.response?.data?.detail directly — if detail is
      // an array (FastAPI validation error) that renders as "[object Object]".
      // parseApiError handles both string and array detail correctly.
      showToast(parseApiError(err), "error");
    }
  };

  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => o.created_at && new Date(o.created_at).toDateString() === today);
  const revenue = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
  const pending = orders.filter(o => o.status === "pending").length;

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/30">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">Orders</h1>
            </div>
            <p className="text-slate-500 text-sm">
              Live order management
              {lastUpdated && ` · updated ${lastUpdated.toLocaleTimeString()}`}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start">
            <button
              onClick={() => showToast("Export coming soon", "info")}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm text-slate-300 transition"
            >
              <Download className="w-4 h-4" /> Export
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm text-slate-300 transition"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
            <button onClick={load} className="ml-auto text-rose-300 hover:text-white underline text-xs">Retry</button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && !error && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl h-28" />
            ))}
          </div>
        )}

        {/* Metrics */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard title="Total orders"   value={orders.length}                   icon={ShoppingBag}  accent="bg-gradient-to-br from-blue-500 to-indigo-600"    />
              <MetricCard title="Today"          value={todayOrders.length}              icon={Clock}        accent="bg-gradient-to-br from-amber-500 to-orange-600"   />
              <MetricCard title="Revenue"        value={`R${revenue.toFixed(0)}`}        icon={DollarSign}   accent="bg-gradient-to-br from-emerald-500 to-teal-600"   />
              <MetricCard title="Pending action" value={pending}                         icon={TrendingUp}   accent={pending > 5 ? "bg-rose-600" : "bg-gradient-to-br from-violet-500 to-purple-600"} />
            </div>

            <StatusBar orders={orders} />

            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-white/[0.02] border border-white/8">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">No orders yet</h3>
                <p className="text-slate-500 text-sm mb-5">Orders will appear here when customers place them.</p>
                <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition">
                  <RefreshCw className="w-4 h-4" /> Refresh
                </button>
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
                    <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-white/10 text-slate-400">{orders.length}</span>
                  </div>
                </div>
                <OrderTable orders={orders} onStatusChange={changeStatus} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
