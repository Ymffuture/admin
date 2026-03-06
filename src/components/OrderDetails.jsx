export default function OrderDetails({ order }) {

  if (!order) return null;

  return (
    <div>

      <h3>Order #{order.id}</h3>

      <p>Name: {order.customer_name}</p>

      <p>Email: {order.email}</p>

      <p>Phone: {order.phone}</p>

      <p>Total: R{order.total_amount}</p>

      <p>Status: {order.order_status}</p>

    </div>
  );
}
