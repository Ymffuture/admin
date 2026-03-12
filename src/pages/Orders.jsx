import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus } from "../api/orders.api";
import OrderTable from "../components/OrderTable";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  // BUG FIX: no loading or error state — silent failures
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getOrders();
      setOrders(res.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to load orders. Are you logged in?"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      // Optimistic update — reflect change immediately
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
    } catch (err) {
      alert("Status update failed: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">📋 Orders</h2>
        <button
          onClick={load}
          className="text-sm px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-center py-12">Loading orders...</p>
      ) : (
        <OrderTable orders={orders} onStatusChange={changeStatus} />
      )}
    </div>
  );
}
