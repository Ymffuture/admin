import StatusDropdown from "./StatusDropdown";

export default function OrderTable({ orders, onStatusChange }) {

  return (
    <table border="1" width="100%">

      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Total</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
        {orders.map((o) => (

          <tr key={o.id}>
            <td>{o.id}</td>
            <td>{o.customer_name}</td>
            <td>R{o.total_amount}</td>

            <td>
              <StatusDropdown
                value={o.order_status}
                onChange={(s) =>
                  onStatusChange(o.id, s)
                }
              />
            </td>

          </tr>

        ))}
      </tbody>

    </table>
  );
}
