// BUG FIX: old code used order.customer_name, order.email, order.phone, order.order_status
// Backend returns: order.user_id, order.status, order.delivery_address, order.total_amount
export default function OrderDetails({ order }) {
  if (!order) return null;

  return (
    <div className="bg-white rounded-xl border p-4 space-y-2 text-sm">
      <h3 className="font-bold text-lg">
        Order #{order.id?.slice(-8).toUpperCase()}
      </h3>
      <p><span className="text-gray-500">User ID:</span> {order.user_id}</p>
      <p><span className="text-gray-500">Address:</span> {order.delivery_address}</p>
      <p><span className="text-gray-500">Total:</span> R{order.total_amount?.toFixed(2)}</p>
      <p><span className="text-gray-500">Status:</span> {order.status}</p>
      {order.items?.map((item, i) => (
        <p key={i} className="text-gray-600">
          • {item.name} x{item.quantity} — R{item.price?.toFixed(2)}
        </p>
      ))}
    </div>
  );
}
