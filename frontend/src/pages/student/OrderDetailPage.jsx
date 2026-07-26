import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { cancelOrder, getOrder } from "../../services/commerceService";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

const STATUS_LABEL = {
  PENDING_PAYMENT: { label: "Chờ thanh toán", color: "#d97706" },
  PAID: { label: "Đã thanh toán", color: "#16a34a" },
  CANCELED: { label: "Đã hủy", color: "#9ca3af" },
  REFUNDED: { label: "Đã hoàn tiền", color: "#6366f1" },
  PARTIALLY_REFUNDED: { label: "Hoàn tiền một phần", color: "#6366f1" },
};

export default function OrderDetailPage() {
  const { orderCode } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  async function loadOrder() {
    try {
      setOrder(await getOrder(orderCode));
    } catch (err) {
      setError(err.message || "Không tải được đơn hàng");
    }
  }

  useEffect(() => {
    loadOrder();
  }, [orderCode]);

  async function handleCancel() {
    try {
      setOrder(await cancelOrder(orderCode));
    } catch (err) {
      setError(err.message || "Không hủy được đơn hàng");
    }
  }

  const statusInfo = STATUS_LABEL[order?.status] || { label: order?.status, color: "#64748b" };

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Chi tiết đơn hàng</span>
        <h2 className="page-title">{orderCode}</h2>
        <p className="page-description">Thông tin chi tiết khóa học và hóa đơn được lưu trữ bảo mật theo đơn hàng.</p>
      </section>
      {error && <p className="auth-error">{error}</p>}
      {order && (
        <section className="page-panel-card">
          <p>Trạng thái: <strong style={{ color: statusInfo.color }}>{statusInfo.label}</strong></p>
          <p>Tổng tiền: <strong style={{ color: "#2563eb" }}>{money.format(order.totalAmount || 0)}</strong></p>
          {order.paidAt && <p>Thanh toán lúc: <strong>{new Date(order.paidAt).toLocaleString("vi-VN")}</strong></p>}
          {order.canceledAt && <p>Hủy lúc: <strong>{new Date(order.canceledAt).toLocaleString("vi-VN")}</strong></p>}

          <div className="course-table" style={{ marginTop: "1rem" }}>
            {(order.items ?? []).map((item) => (
              <div className="course-table-row" key={item.courseId}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{money.format(item.finalPrice || 0)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="page-actions" style={{ marginTop: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
            {order.status === "PENDING_PAYMENT" && (
              <button
                id="btn-pay"
                className="page-action page-action-primary"
                onClick={() => navigate(`/student/checkout?orderCode=${order.orderCode}`)}
              >
                💳 Thanh toán
              </button>
            )}
            {order.status === "PENDING_PAYMENT" && (
              <button
                id="btn-cancel"
                className="page-action page-action-secondary"
                style={{ borderColor: "#dc2626", color: "#dc2626" }}
                onClick={handleCancel}
              >
                🚫 Hủy đơn
              </button>
            )}
            {order.status === "PAID" && order.items?.length > 0 && (
              <Link
                id="btn-learn"
                className="page-action page-action-primary"
                to={`/student/learn/${order.items[0].courseId}`}
              >
                🎓 Vào học
              </Link>
            )}
            {order.invoice && (
              <Link
                id="btn-invoice"
                className="page-action page-action-secondary"
                to={`/student/orders/${order.orderCode}/invoice`}
              >
                🧾 Xem hóa đơn
              </Link>
            )}
            <Link className="page-action page-action-secondary" to="/student/orders">← Lịch sử đơn hàng</Link>
          </div>
        </section>
      )}
    </div>
  );
}
