import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../api/orders.api";
import { getMenu } from "../api/menu.api";
import { getPendingDrivers } from "../api/drivers.api";
import {
  ClipboardList, UtensilsCrossed, BarChart3, Bike,
  TrendingUp, ShoppingBag, DollarSign, Clock, AlertCircle,
  ChevronRight, RefreshCw, CheckCircle2, XCircle, ChefHat,
} from "lucide-react";

const STATUS_COLOR = {
  pending:   "text-amber-400",
  paid:      "text-blue-400",
  preparing: "text-orange-400",
  ready:     "text-purple-400",
  delivered: "text-emerald-400",
  cancelled: "text-rose-400",
};

const STATUS_BG = {
  pending:   "bg-amber-500/10 border-amber-500/20",
  paid:      "bg-blue-500/10 border-blue-500/20",
  preparing: "bg-orange-500/10 border-orange-500/20",
  ready:     "bg-purple-500/10 border-purple-500/20",
  delivered: "bg-emerald-500/10 border-emerald-500/20",
  cancelled: "bg-rose-500/10 border-rose-500/20",
};

function StatCard({ label, value, sub, icon: Icon, color, loading }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 p-6 hover:border-white/20 transition-all duration-300`}>
      <div className={`inline-flex p-3 rounded-xl mb-4 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-8 w-24 bg-white/10 rounded-lg animate-pulse" />
          <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
        </div>
      ) : (
        <>
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          <p className="text-sm text-slate-500">{sub || label}</p>
        </>
      )}
    </div>
  );
}

function RecentOrderRow({ order }) {
  const statusCfg = {
    pending:   { label: "Pending",   Icon: Clock,         cls: STATUS_BG.pending },
    paid:      { label: "Paid",      Icon: CheckCircle2,  cls: STATUS_BG.paid },
    preparing: { label: "Preparing", Icon: ChefHat,       cls: STATUS_BG.preparing },
    ready:     { label: "Ready",     Icon: ShoppingBag,   cls: STATUS_BG.ready },
    delivered: { label: "Delivered", Icon: CheckCircle2,  cls: STATUS_BG.delivered },
    cancelled: { label: "Cancelled", Icon: XCircle,       cls: STATUS_BG.cancelled },
  };
  const cfg = statusCfg[order.status] || statusCfg.pending;
  const Icon = cfg.Icon;
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
          <ShoppingBag className="w-4 h-4 text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">#{String(order.id).slice(-8).toUpperCase()}</p>
          <p className="text-xs text-slate-500">{order.items?.length || 0} items · R{order.total_amount?.toFixed(2)}</p>
        </div>
      </div>
      <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.cls} ${STATUS_COLOR[order.status]}`}>
        <Icon className="w-3 h-3" />
        {cfg.label}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const [orders, setOrders]       = useState([]);
  const [menu, setMenu]           = useState([]);
  const [pendingDrivers, setPending] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordRes, menuRes, drvRes] = await Promise.allSettled([
        getOrders(),
        getMenu(),
        getPendingDrivers(),
      ]);
      if (ordRes.status === "fulfilled") setOrders(Array.isArray(ordRes.value.data) ? ordRes.value.data : []);
      if (menuRes.status === "fulfilled") setMenu(Array.isArray(menuRes.value.data) ? menuRes.value.data : []);
      if (drvRes.status === "fulfilled") setPending(Array.isArray(drvRes.value.data) ? drvRes.value.data : []);
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => o.created_at && new Date(o.created_at).toDateString() === today);
  const revenue = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
  const todayRevenue = todayOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
  const pendingCount = orders.filter(o => o.status === "pending").length;
  const recentOrders = [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);

  const statusBreakdown = ["pending","paid","preparing","ready","delivered","cancelled"].map(s => ({
    status: s, count: orders.filter(o => o.status === s).length,
  }));

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Live overview — {new Date().toLocaleDateString("en-ZA", { weekday:"long", day:"numeric", month:"long" })}</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm text-slate-300 transition disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Orders"   value={orders.length}          sub={`${todayOrders.length} today`}            icon={ClipboardList}   color="bg-gradient-to-br from-blue-500 to-indigo-600"    loading={loading} />
        <StatCard label="Total Revenue"  value={`R${revenue.toFixed(0)}`} sub={`R${todayRevenue.toFixed(0)} today`}   icon={DollarSign}      color="bg-gradient-to-br from-emerald-500 to-teal-600"   loading={loading} />
        <StatCard label="Menu Items"     value={menu.length}             sub={`${[...new Set(menu.map(m=>m.category))].length} categories`} icon={UtensilsCrossed} color="bg-gradient-to-br from-amber-500 to-orange-600" loading={loading} />
        <StatCard label="Pending Drivers" value={pendingDrivers.length}  sub="Awaiting approval"                       icon={Bike}            color="bg-gradient-to-br from-violet-500 to-purple-600"  loading={loading} />
      </div>

      {/* Status breakdown + Recent orders */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Status Breakdown */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Order Statuses</h2>
          {statusBreakdown.map(({ status, count }) => (
            <div key={status} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className={`capitalize font-medium ${STATUS_COLOR[status]}`}>{status}</span>
                <span className="text-slate-400 font-mono">{count}</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    status === "delivered" ? "bg-emerald-500" :
                    status === "pending"   ? "bg-amber-500"  :
                    status === "cancelled" ? "bg-rose-500"   :
                    status === "preparing" ? "bg-orange-500" :
                    status === "ready"     ? "bg-purple-500" :
                    "bg-blue-500"
                  }`}
                  style={{ width: orders.length ? `${(count / orders.length) * 100}%` : "0%" }}
                />
              </div>
            </div>
          ))}
          {pendingCount > 0 && (
            <Link to="/orders" className="flex items-center justify-between pt-2 text-sm text-amber-400 hover:text-amber-300 transition">
              <span>{pendingCount} orders need attention</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Recent Orders</h2>
            <Link to="/orders" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-white/5">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/5 animate-pulse" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
                      <div className="h-2.5 w-16 bg-white/5 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-6 w-20 bg-white/5 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No orders yet</p>
          ) : (
            recentOrders.map(o => <RecentOrderRow key={o.id} order={o} />)
          )}
        </div>
      </div>

      {/* Quick nav cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { to:"/orders",    Icon:ClipboardList,   title:"Manage Orders",   sub:"Update statuses",      grad:"from-blue-500/20 to-indigo-500/20",   border:"border-blue-500/20"   },
          { to:"/menu",      Icon:UtensilsCrossed, title:"Edit Menu",        sub:"Add or remove items",  grad:"from-emerald-500/20 to-teal-500/20",  border:"border-emerald-500/20" },
          { to:"/drivers",   Icon:Bike,            title:"Approve Drivers",  sub:`${pendingDrivers.length} pending`, grad:"from-violet-500/20 to-purple-500/20", border:"border-violet-500/20" },
          { to:"/analytics", Icon:BarChart3,       title:"Analytics",        sub:"Chat & sales data",    grad:"from-amber-500/20 to-orange-500/20",  border:"border-amber-500/20"   },
        ].map(({ to, Icon, title, sub, grad, border }) => (
          <Link key={to} to={to} className={`group flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br ${grad} border ${border} hover:scale-[1.02] transition-all duration-300`}>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{title}</p>
              <p className="text-xs text-white/50 truncate">{sub}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 ml-auto flex-shrink-0 transition" />
          </Link>
        ))}
      </div>
    </div>
  );
}
