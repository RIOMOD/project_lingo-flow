import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../../services/commerceService";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getOrders({ size: 20 })
      .then((data) => setOrders(data?.items ?? []))
      .catch((err) => setError(err.message || "Khong tai duoc don hang"));
  }, []);

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Orders</span>
        <h2 className="page-title">Lich su mua hang</h2>
        <p className="page-description">Theo doi don hang, hoa don va trang thai thanh toan.</p>
      </section>
      {error && <p className="auth-error">{error}</p>}
      <section className="course-table page-panel-card">
        {orders.map((order) => (
          <div className="course-table-row" key={order.orderCode}>
            <div>
              <strong>{order.orderCode}</strong>
              <p>{order.status} - {money.format(order.totalAmount || 0)}</p>
            </div>
            <Link className="page-action page-action-secondary" to={`/student/orders/${order.orderCode}`}>Chi tiet</Link>
          </div>
        ))}
        {orders.length === 0 && <p className="page-description">Chua co don hang nao.</p>}
      </section>
    </div>
  );
}
