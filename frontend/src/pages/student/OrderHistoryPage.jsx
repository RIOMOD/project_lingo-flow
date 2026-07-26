import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getOrders } from "../../services/commerceService";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

const STATUS_LABEL = {
  PENDING_PAYMENT: { label: "Chờ thanh toán", color: "#d97706" },
  PAID: { label: "Đã thanh toán", color: "#16a34a" },
  CANCELED: { label: "Đã hủy", color: "#9ca3af" },
  REFUNDED: { label: "Đã hoàn tiền", color: "#6366f1" },
  PARTIALLY_REFUNDED: { label: "Hoàn tiền một phần", color: "#6366f1" },
};

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getOrders({ size: 20 })
      .then((data) => setOrders(data?.items ?? []))
      .catch((err) => setError(err.message || "Không tải được đơn hàng"));
  }, []);

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Orders</span>
        <h2 className="page-title">Lịch sử mua hàng</h2>
        <p className="page-description">Theo dõi đơn hàng, hóa đơn và trạng thái thanh toán.</p>
      </section>
      {error && <p className="auth-error">{error}</p>}
      <section className="course-table page-panel-card">
        {orders.map((order) => {
          const statusInfo = STATUS_LABEL[order.status] || { label: order.status, color: "#64748b" };
          return (
            <div className="course-table-row" key={order.orderCode}>
              <div>
                <strong>{order.orderCode}</strong>
                <p>
                  <span style={{ color: statusInfo.color, fontWeight: 600 }}>{statusInfo.label}</span>
                  {" — "}{money.format(order.totalAmount || 0)}
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {order.status === "PENDING_PAYMENT" && (
                  <button
                    className="page-action page-action-primary"
                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                    onClick={() => navigate(`/student/checkout?orderCode=${order.orderCode}`)}
                  >
                    💳 Thanh toán
                  </button>
                )}
                {order.status === "PAID" && (
                  <Link
                    className="page-action page-action-secondary"
                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                    to={`/student/orders/${order.orderCode}/invoice`}
                  >
                    🧾 Hóa đơn
                  </Link>
                )}
                <Link
                  className="page-action page-action-secondary"
                  style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                  to={`/student/orders/${order.orderCode}`}
                >
                  Chi tiết
                </Link>
              </div>
            </div>
          );
        })}
        {orders.length === 0 && <p className="page-description">Chưa có đơn hàng nào.</p>}
      </section>
    </div>
  );
}
