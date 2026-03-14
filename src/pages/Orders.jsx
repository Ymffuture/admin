import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus } from "../api/orders.api";
import OrderTable from "../components/OrderTable";

// ✅ These API calls now match the backend routes we added:
//   GET  /orders/all            → getOrders()
//   PATCH /orders/:id/status    → updateOrderStatus(id, status)

export default function Orders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getOrders();
      // Backend may return an array directly or wrapped in .data
      const data = Array.isArray(res.data) ? res.data : [];
      setOrders(data);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Unknown error";
      const status = err.response?.status;
      if (status === 401) {
        setError("Not authenticated — please log in again.");
      } else if (status === 404) {
        setError("Orders endpoint not found (404). Check backend routes.");
      } else {
        setError(`Failed to load orders: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const changeStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      // Optimistic update — reflect immediately without refetch
      setOrders(prev => prev.map(o => (o.id === id ? { ...o, status } : o)));
    } catch (err) {
      const msg = err.response?.data?.detail || err.message;
      alert(`Status update failed: ${msg}`);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">📋 Orders</h2>
        <button onClick={load} disabled={loading}
          className="text-sm px-4 py-2 border rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
          <span className={loading ? "animate-spin inline-block" : ""}>↻</span>
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-center py-12">Loading orders…</p>
      ) : (
        <OrderTable orders={orders} onStatusChange={changeStatus} />
      )}
    </div>
  );
}
