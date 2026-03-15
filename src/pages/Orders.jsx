import { useEffect, useState, useCallback } from "react";
import { getOrders, updateOrderStatus } from "../api/orders.api";
import OrderTable from "../components/OrderTable";

// Custom Icons
const Icons = {
  Refresh: ({ className, spinning }) => (
    <svg className={`${className} ${spinning ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Orders: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  Warning: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  Check: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Trending: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Clock: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Package: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  )
};

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: "bg-emerald-500",
    error: "bg-red-500",
    info: "bg-blue-500"
  };

  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white transform transition-all duration-500 animate-slide-in ${styles[type]}`}>
      {type === 'success' ? <Icons.Check className="w-5 h-5" /> : <Icons.Warning className="w-5 h-5" />}
      <p className="font-semibold text-sm">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">×</button>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ label, value, trend, trendUp, icon: Icon, color }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      {trend !== undefined && (
        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          {trendUp ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </div>
);

// Status Badge Component
const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    preparing: "bg-blue-100 text-blue-700 border-blue-200",
    ready: "bg-emerald-100 text-emerald-700 border-emerald-200",
    delivered: "bg-gray-100 text-gray-700 border-gray-200",
    cancelled: "bg-red-100 text-red-700 border-red-200"
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
};

// Empty State Component
const EmptyState = ({ onAction }) => (
  <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <Icons.Package className="w-10 h-10 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
    <p className="text-gray-500 text-center max-w-sm mb-6">Orders will appear here when customers start placing them.</p>
    <button onClick={onAction} className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition flex items-center gap-2">
      <Icons.Refresh className="w-4 h-4" />
      Check for Orders
    </button>
  </div>
);

// Error State Component
const ErrorState = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 bg-red-50 rounded-2xl border border-red-100">
    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
      <Icons.Warning className="w-8 h-8 text-red-500" />
    </div>
    <h3 className="text-lg font-semibold text-red-900 mb-2">Something went wrong</h3>
    <p className="text-red-600 text-center max-w-md mb-6 text-sm">{error}</p>
    <button onClick={onRetry} className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition flex items-center gap-2">
      <Icons.Refresh className="w-4 h-4" />
      Try Again
    </button>
  </div>
);

// Skeleton Loader
const TableSkeleton = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
          </div>
          <div className="w-24 h-8 bg-gray-200 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const showToast = useCallback((message, type) => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getOrders();
      const data = Array.isArray(res.data) ? res.data : [];
      setOrders(data);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Unknown error";
      const status = err.response?.status;
      if (status === 401) {
        setError("Session expired — please log in again.");
      } else if (status === 404) {
        setError("Orders service unavailable. Please try again later.");
      } else {
        setError(`Failed to load orders: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => (o.id === id ? { ...o, status } : o)));
      showToast(`Order #${id.slice(-6)} updated to ${status}`, "success");
    } catch (err) {
      const msg = err.response?.data?.detail || err.message;
      showToast(`Update failed: ${msg}`, "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    revenue: orders.reduce((sum, o) => sum + (o.total || 0), 0).toFixed(2)
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto">
        {/* Smart Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Icons.Orders className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Orders</h1>
                <p className="text-gray-500 text-sm">Manage and track customer orders</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={load} 
              disabled={loading}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Icons.Refresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Stats Dashboard */}
        {!loading && !error && orders.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard 
              label="Total Orders" 
              value={stats.total} 
              icon={Icons.Orders} 
              color="bg-blue-500"
              trend={12} 
              trendUp={true}
            />
            <StatCard 
              label="Pending" 
              value={stats.pending} 
              icon={Icons.Clock} 
              color="bg-amber-500"
            />
            <StatCard 
              label="Preparing" 
              value={stats.preparing} 
              icon={Icons.Package} 
              color="bg-indigo-500"
            />
            <StatCard 
              label="Revenue" 
              value={`R${stats.revenue}`} 
              icon={Icons.Trending} 
              color="bg-emerald-500"
              trend={8}
              trendUp={true}
            />
          </div>
        )}

        {/* Error State */}
        {error && <ErrorState error={error} onRetry={load} />}

        {/* Loading State */}
        {loading && <TableSkeleton />}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && <EmptyState onAction={load} />}

        {/* Orders Table */}
        {!loading && !error && orders.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Live updates</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
            </div>
            
            <OrderTable 
              orders={orders} 
              onStatusChange={changeStatus}
              updatingId={updatingId}
            />
          </div>
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
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
