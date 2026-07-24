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
      .catch((err) => setError(err.message || "Khong tai duoc trang thai thanh toan"));
  }, [orderCode]);

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Payment</span>
        <h2 className="page-title">Thanh toan {status}</h2>
        <p className="page-description">Ma don: {orderCode || "khong co"}</p>
      </section>
      {error && <p className="auth-error">{error}</p>}
      <section className="page-panel-card">
        <p>Trang thai gateway: <strong>{payment?.status || status}</strong></p>
        <div className="page-actions">
          {orderCode && <Link className="page-action page-action-primary" to={`/student/orders/${orderCode}`}>Xem don hang</Link>}
          <Link className="page-action page-action-secondary" to="/student/orders">Lich su mua hang</Link>
        </div>
      </section>
    </div>
  );
}
