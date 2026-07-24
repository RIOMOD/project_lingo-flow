import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getPaymentStatus } from "../../services/commerceService";

export default function PaymentStatusPage() {
  const { status } = useParams();
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get("orderCode");
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderCode) return;
    getPaymentStatus(orderCode)
      .then(setPayment)
      .catch((err) => setError(err.message || "Không tải được trạng thái thanh toán"));
  }, [orderCode]);

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Payment</span>
        <h2 className="page-title">Thanh toán {status}</h2>
        <p className="page-description">Mã đơn: {orderCode || "không có"}</p>
      </section>
      {error && <p className="auth-error">{error}</p>}
      <section className="page-panel-card">
        <p>Trạng thái cổng thanh toán: <strong>{payment?.status || status}</strong></p>
        <div className="page-actions">
          {orderCode && <Link className="page-action page-action-primary" to={`/student/orders/${orderCode}`}>Xem đơn hàng</Link>}
          <Link className="page-action page-action-secondary" to="/student/orders">Lịch sử mua hàng</Link>
        </div>
      </section>
    </div>
  );
}
