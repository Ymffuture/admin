import StatusDropdown from "./StatusDropdown";

// BUG FIX: old code used o.customer_name and o.order_status
// Backend returns: o.user_id, o.status, o.delivery_address, o.total_amount, o.created_at
export default function OrderTable({ orders, onStatusChange }) {
  if (!orders?.length) {
    return (
      <p className="text-gray-500 mt-6 text-center py-12 bg-gray-50 rounded-xl">
        No orders found.
      </p>
    );
  }

  const statusColors = {
    pending:   "bg-yellow-100 text-yellow-800",
    paid:      "bg-blue-100 text-blue-800",
    preparing: "bg-orange-100 text-orange-800",
    ready:     "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {["Order ID", "User", "Address", "Items", "Total", "Status", "Date"].map((h) => (
              <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-gray-500">
                #{o.id?.slice(-8).toUpperCase()}
              </td>
              <td className="px-4 py-3 text-gray-700">
                {/* BUG FIX: backend returns user_id not customer_name */}
                {o.user_id?.slice(-8)}
              </td>
              <td className="px-4 py-3 text-gray-700 max-w-[180px] truncate">
                {o.delivery_address ?? "—"}
              </td>
              <td className="px-4 py-3 text-gray-500">
                {o.items?.length ?? 0} item{o.items?.length !== 1 ? "s" : ""}
              </td>
              <td className="px-4 py-3 font-semibold text-gray-900">
                R{o.total_amount?.toFixed(2)}
              </td>
              <td className="px-4 py-3">
                {/* BUG FIX: backend field is o.status not o.order_status */}
                <StatusDropdown
                  value={o.status}
                  onChange={(s) => onStatusChange(o.id, s)}
                />
              </td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                {o.created_at
                  ? new Date(o.created_at).toLocaleDateString("en-ZA")
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
