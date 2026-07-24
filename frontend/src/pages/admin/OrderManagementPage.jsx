import { useEffect, useState } from "react";
import { getAdminOrders } from "../../services/commerceService";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function OrderManagementPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminOrders({ size: 20 })
      .then((data) => setOrders(data?.items ?? []))
      .catch((err) => setError(err.message || "Khong tai duoc don hang"));
  }, []);

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Admin</span>
        <h2 className="page-title">Quan ly don hang</h2>
        <p className="page-description">Theo doi don hang, trang thai thanh toan va tong tien.</p>
      </section>
      {error && <p className="auth-error">{error}</p>}
      <section className="course-table page-panel-card">
        {orders.map((order) => (
          <div className="course-table-row" key={order.orderCode}>
            <div>
              <strong>{order.orderCode}</strong>
              <p>{order.status} - {money.format(order.totalAmount || 0)}</p>
            </div>
            <span>{order.couponCode || "Khong dung ma"}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
