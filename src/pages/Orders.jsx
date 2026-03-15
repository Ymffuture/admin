import { useEffect, useState, useCallback } from "react";
import { getOrders, updateOrderStatus } from "../api/orders.api";
import OrderTable from "../components/OrderTable";

// Professional Admin Icons (Lucide-style) - FIXED SVG ATTRIBUTES
const Icons = {
  LayoutDashboard: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  ShoppingBag: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  ),
  RefreshCw: ({ className, spin }) => (
    <svg className={`${className} ${spin ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  ),
  TrendingUp: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  DollarSign: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
  Users: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  Clock: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  AlertCircle: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  CheckCircle: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  MoreHorizontal: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  ),
  Download: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Printer: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  )
};

// Toast Notification System
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: "bg-emerald-500",
    error: "bg-rose-500",
    warning: "bg-amber-500",
    info: "bg-blue-500"
  };

  const icons = {
    success: <Icons.CheckCircle className="w-5 h-5" />,
    error: <Icons.AlertCircle className="w-5 h-5" />,
    warning: <Icons.AlertCircle className="w-5 h-5" />,
    info: <Icons.AlertCircle className="w-5 h-5" />
  };

  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white transform transition-all duration-500 animate-slide-in ${styles[type]}`}>
      {icons[type]}
      <p className="font-semibold text-sm">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 transition">×</button>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, change, changeType, icon: Icon, trend }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-300 group">
    <div className="flex items-start justify-between">
      <div className={`p-3 rounded-lg bg-opacity-10 ${trend === 'up' ? 'bg-emerald-500 text-emerald-600' : trend === 'down' ? 'bg-rose-500 text-rose-600' : 'bg-blue-500 text-blue-600'}`}>
        <Icon className="w-6 h-6" />
      </div>
      {change && (
        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${changeType === 'positive' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {changeType === 'positive' ? '↑' : '↓'} {change}
        </span>
      )}
    </div>
    <div className="mt-4">
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{title}</p>
    </div>
  </div>
);

// Quick Action Button
const QuickAction = ({ icon: Icon, label, onClick, variant = 'default' }) => {
  const variants = {
    default: "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700",
    primary: "bg-blue-600 border-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30",
    danger: "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
  };

  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 ${variants[variant]}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
};

// Status Overview Bar
const StatusOverview = ({ orders }) => {
  const statuses = [
    { key: 'pending', label: 'Pending', color: 'bg-amber-500', text: 'text-amber-700' },
    { key: 'preparing', label: 'Preparing', color: 'bg-blue-500', text: 'text-blue-700' },
    { key: 'ready', label: 'Ready', color: 'bg-purple-500', text: 'text-purple-700' },
    { key: 'delivered', label: 'Delivered', color: 'bg-emerald-500', text: 'text-emerald-700' }
  ];

  const counts = statuses.map(s => ({
    ...s,
    count: orders.filter(o => o.status === s.key).length
  }));

  const total = orders.length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Order Status Overview</h3>
      <div className="flex items-center gap-4">
        {counts.map(({ key, label, color, text, count }) => (
          <div key={key} className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
              <span className={`text-sm font-bold ${text}`}>{count}</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${color} rounded-full transition-all duration-500`}
                style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Loading Skeleton
const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 h-32 border border-slate-200 dark:border-slate-700" />
      ))}
    </div>
    <div className="bg-white dark:bg-slate-800 rounded-xl h-64 border border-slate-200 dark:border-slate-700" />
  </div>
);

// Empty State
const EmptyState = ({ onRefresh }) => (
  <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 border-dashed">
    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
      <Icons.ShoppingBag className="w-8 h-8 text-slate-400" />
    </div>
    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No orders yet</h3>
    <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm mb-6">
      Orders will appear here once customers start placing them through your menu.
    </p>
    <QuickAction icon={Icons.RefreshCw} label="Refresh" onClick={onRefresh} />
  </div>
);

// Error State
const ErrorState = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-800">
    <div className="w-16 h-16 bg-rose-100 dark:bg-rose-800 rounded-full flex items-center justify-center mb-4">
      <Icons.AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
    </div>
    <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-200 mb-2">Failed to load orders</h3>
    <p className="text-rose-600 dark:text-rose-400 text-center max-w-md mb-6 text-sm">{error}</p>
    <QuickAction icon={Icons.RefreshCw} label="Try Again" onClick={onRetry} variant="danger" />
  </div>
);

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getOrders();
      const data = Array.isArray(res.data) ? res.data : [];
      setOrders(data);
      setLastUpdated(new Date());
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Unknown error";
      const status = err.response?.status;
      
      if (status === 401) {
        setError("Session expired. Please log in again.");
      } else if (status === 404) {
        setError("Orders service unavailable. Please check your connection.");
      } else {
        setError(`Failed to load orders: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !error) load();
    }, 30000);
    return () => clearInterval(interval);
  }, [loading, error, load]);

  const changeStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => (o.id === id ? { ...o, status } : o)));
      showToast(`Order #${id.slice(-6)} updated to ${status}`, "success");
    } catch (err) {
      const msg = err.response?.data?.detail || err.message;
      showToast(`Update failed: ${msg}`, "error");
    }
  };

  // Calculate metrics
  const metrics = {
    total: orders.length,
    revenue: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
    today: orders.filter(o => {
      const orderDate = new Date(o.created_at);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString();
    }).length,
    pending: orders.filter(o => o.status === 'pending').length
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 lg:p-8">
      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/30">
                <Icons.LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Orders</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm ml-1">
              Manage and track customer orders in real-time
              {lastUpdated && ` · Updated ${lastUpdated.toLocaleTimeString()}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <QuickAction 
              icon={Icons.Download} 
              label="Export" 
              onClick={() => showToast("Export feature coming soon", "info")}
            />
            <QuickAction 
              icon={Icons.Printer} 
              label="Print" 
              onClick={() => showToast("Print feature coming soon", "info")}
            />
            <QuickAction 
              icon={Icons.RefreshCw} 
              label={loading ? "Refreshing..." : "Refresh"} 
              onClick={load}
              variant="primary"
            />
          </div>
        </div>

        {/* Error State */}
        {error && <ErrorState error={error} onRetry={load} />}

        {/* Loading State */}
        {loading && !error && <DashboardSkeleton />}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard 
                title="Total Orders" 
                value={metrics.total} 
                change="12%" 
                changeType="positive"
                icon={Icons.ShoppingBag}
                trend="up"
              />
              <MetricCard 
                title="Today's Orders" 
                value={metrics.today} 
                change="5%" 
                changeType="positive"
                icon={Icons.Clock}
                trend="up"
              />
              <MetricCard 
                title="Revenue" 
                value={`R${metrics.revenue.toFixed(2)}`} 
                change="8%" 
                changeType="positive"
                icon={Icons.DollarSign}
                trend="up"
              />
              <MetricCard 
                title="Pending" 
                value={metrics.pending} 
                change={metrics.pending > 5 ? "High" : "Normal"}
                changeType={metrics.pending > 5 ? 'negative' : 'positive'}
                icon={Icons.Users}
                trend={metrics.pending > 5 ? 'down' : 'up'}
              />
            </div>

            {/* Status Overview */}
            <StatusOverview orders={orders} />

            {/* Orders Table or Empty State */}
            {orders.length === 0 ? (
              <EmptyState onRefresh={load} />
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Orders</h2>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">Live updates</span>
                  </div>
                </div>
                <OrderTable orders={orders} onStatusChange={changeStatus} />
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
