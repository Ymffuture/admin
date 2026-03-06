import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus } from "../api/orders.api";
import OrderTable from "../components/OrderTable";

export default function Orders() {

  const [orders, setOrders] = useState([]);

  const load = async () => {

    const res = await getOrders();

    setOrders(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const changeStatus = async (id, status) => {

    await updateOrderStatus(id, status);

    load();
  };

  return (

    <div>

      <h2>Orders</h2>

      <OrderTable
        orders={orders}
        onStatusChange={changeStatus}
      />

    </div>
  );
}
