import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../../services/commerceService";
import "../../styles/SettingsPage.css";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

function renderStatusBadge(status) {
  const st = String(status || "").toUpperCase();
  if (st === "PAID" || st === "COMPLETED" || st === "SUCCESS") {
    return <span className="order-status-badge is-success">🟢 Thành công</span>;
  }
  if (st === "PENDING_PAYMENT" || st === "PENDING") {
    return <span className="order-status-badge is-pending">🟡 Chờ thanh toán</span>;
  }
  if (st === "CANCELED" || st === "CANCELLED" || st === "FAILED") {
    return <span className="order-status-badge is-canceled">🔴 Đã hủy</span>;
  }
  return <span className="order-status-badge is-default">{status}</span>;
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getOrders({ size: 20 })
      .then((data) => setOrders(data?.items ?? []))
      .catch((err) => setError(err.message || "Không tải được lịch sử đơn hàng."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="order-history-page">
      <section className="order-history-hero">
        <div className="order-hero-content">
          <span className="order-hero-icon">🛒</span>
          <div>
            <h2 className="order-hero-title">Lịch sử mua hàng & Hóa đơn</h2>
            <p className="order-hero-sub">Theo dõi các khóa học đã đăng ký, mã giao dịch và trạng thái thanh toán.</p>
          </div>
        </div>
      </section>

      {error && <div className="settings-alert error" role="alert">⚠️ {error}</div>}

      <section className="order-list-container">
        {loading && (
          <div className="order-empty-state">
            ⏳ Đang tải lịch sử giao dịch...
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="order-empty-state">
            <span className="order-empty-icon">🛍️</span>
            <h4>Bạn chưa có đơn hàng nào</h4>
            <p>Các khóa học bạn đăng ký mua sẽ xuất hiện tại đây.</p>
          </div>
        )}

        {!loading && orders.map((order) => (
          <div className="order-card-item" key={order.orderCode}>
            <div className="order-card-info">
              <div className="order-card-code-row">
                <strong className="order-code-text">#{order.orderCode}</strong>
                {renderStatusBadge(order.status)}
              </div>
              <div className="order-amount-text">
                Tổng thanh toán: <strong>{money.format(order.totalAmount || 0)}</strong>
              </div>
            </div>

            <Link className="order-detail-btn" to={`/student/orders/${order.orderCode}`}>
              Xem Chi Tiết ➔
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
}
